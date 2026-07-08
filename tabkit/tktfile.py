"""TabKit native file format (.tkt) and JSON song I/O.

Format-compatible with the web app (legacy-web/TabKit.jsx saveTKT/parseTKT):
4-byte magic ``TKT\\x01`` followed by zlib-compressed UTF-8 JSON.
Songs are kept as plain dicts so every key the web app ever wrote survives
a load/save round trip untouched.
"""

from __future__ import annotations

import copy
import json
import zlib
from pathlib import Path
from typing import Any

TKT_MAGIC = b"TKT"
TKT_VERSION = 1

# Keys the web app strips on save (web-only share metadata)
_STRIP_KEYS = ("_mobileInput", "shareId", "shareVersion", "shareUpdated")

Song = dict[str, Any]


def is_tkt(data: bytes) -> bool:
    return len(data) > 4 and data[:3] == TKT_MAGIC


def loads_tkt(data: bytes) -> Song:
    if not is_tkt(data):
        raise ValueError("Not a TKT file")
    version = data[3]
    if version > TKT_VERSION:
        raise ValueError(f"TKT version {version} not supported")
    return json.loads(zlib.decompress(data[4:]).decode("utf-8"))


def dumps_tkt(song: Song) -> bytes:
    to_save = copy.deepcopy(song)
    for key in _STRIP_KEYS:
        to_save.pop(key, None)
    to_save["_tktVersion"] = TKT_VERSION
    payload = json.dumps(to_save, separators=(",", ":")).encode("utf-8")
    return TKT_MAGIC + bytes([TKT_VERSION]) + zlib.compress(payload)


def load(path: str | Path) -> Song:
    """Load a song from a .tkt or plain-JSON file."""
    data = Path(path).read_bytes()
    if is_tkt(data):
        return loads_tkt(data)
    return json.loads(data.decode("utf-8"))


def save(song: Song, path: str | Path) -> None:
    path = Path(path)
    if path.suffix.lower() == ".json":
        path.write_text(json.dumps(song, indent=1))
    else:
        path.write_bytes(dumps_tkt(song))
