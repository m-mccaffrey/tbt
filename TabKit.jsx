var { useState, useEffect, useRef, useCallback, useMemo } = React;

const GM = ["Acoustic Grand Piano","Bright Acoustic Piano","Electric Grand Piano","Honky-tonk Piano","Electric Piano 1","Electric Piano 2","Harpsichord","Clavinet","Celesta","Glockenspiel","Music Box","Vibraphone","Marimba","Xylophone","Tubular Bells","Dulcimer","Drawbar Organ","Percussive Organ","Rock Organ","Church Organ","Reed Organ","Accordion","Harmonica","Tango Accordion","Acoustic Guitar (nylon)","Acoustic Guitar (steel)","Electric Guitar (jazz)","Electric Guitar (clean)","Electric Guitar (muted)","Overdriven Guitar","Distortion Guitar","Guitar Harmonics","Acoustic Bass","Electric Bass (finger)","Electric Bass (pick)","Fretless Bass","Slap Bass 1","Slap Bass 2","Synth Bass 1","Synth Bass 2","Violin","Viola","Cello","Contrabass","Tremolo Strings","Pizzicato Strings","Orchestral Harp","Timpani","String Ensemble 1","String Ensemble 2","Synth Strings 1","Synth Strings 2","Choir Aahs","Voice Oohs","Synth Voice","Orchestra Hit","Trumpet","Trombone","Tuba","Muted Trumpet","French Horn","Brass Section","Synth Brass 1","Synth Brass 2","Soprano Sax","Alto Sax","Tenor Sax","Baritone Sax","Oboe","English Horn","Bassoon","Clarinet","Piccolo","Flute","Recorder","Pan Flute","Blown Bottle","Shakuhachi","Whistle","Ocarina","Lead 1","Lead 2","Lead 3","Lead 4","Lead 5","Lead 6","Lead 7","Lead 8","Pad 1","Pad 2","Pad 3","Pad 4","Pad 5","Pad 6","Pad 7","Pad 8","FX 1","FX 2","FX 3","FX 4","FX 5","FX 6","FX 7","FX 8","Sitar","Banjo","Shamisen","Koto","Kalimba","Bagpipe","Fiddle","Shanai","Tinkle Bell","Agogo","Steel Drums","Woodblock","Taiko Drum","Melodic Tom","Synth Drum","Reverse Cymbal","Guitar Fret Noise","Breath Noise","Seashore","Bird Tweet","Telephone Ring","Helicopter","Applause","Gunshot"];
const DLBL = ["Bass","Snare","C.HH","O.HH","Stick","Crash","Tom1","Tom2"];
const DMIDI = [35,38,42,46,37,49,48,45];
var GM_DRUM_NAMES = {27:"Hi-Q",28:"Slap",29:"Scratch Push",30:"Scratch Pull",31:"Sticks",32:"Sq Click",33:"Met Click",34:"Met Bell",35:"Bass Drum",36:"Kick",37:"Side Stick",38:"Snare",39:"Clap",40:"Elec Snare",41:"Lo Floor Tom",42:"Closed HH",43:"Hi Floor Tom",44:"Pedal HH",45:"Lo Tom",46:"Open HH",47:"Lo-Mid Tom",48:"Hi-Mid Tom",49:"Crash 1",50:"Hi Tom",51:"Ride",52:"Chinese Cym",53:"Ride Bell",54:"Tambourine",55:"Splash",56:"Cowbell",57:"Crash 2",58:"Vibraslap",59:"Ride 2",60:"Hi Bongo",61:"Lo Bongo",62:"Mute Conga",63:"Open Conga",64:"Lo Conga",65:"Hi Timbale",66:"Lo Timbale",67:"Hi Agogo",68:"Lo Agogo",69:"Cabasa",70:"Maracas",71:"Short Whistle",72:"Long Whistle",73:"Short Guiro",74:"Long Guiro",75:"Claves",76:"Hi Woodblock",77:"Lo Woodblock",78:"Mute Cuica",79:"Open Cuica",80:"Mute Triangle",81:"Open Triangle"};
// GM Percussion name lookup (MIDI note -> name)
var PERC_FULL = {27:"High Q",28:"Slap",29:"Scratch Push",30:"Scratch Pull",31:"Sticks",32:"Square Click",33:"Metronome Click",34:"Metronome Bell",35:"Acoustic Bass Drum",36:"Bass Drum",37:"Side Stick",38:"Snare",39:"Hand Clap",40:"Electric Snare",41:"Low Floor Tom",42:"Closed Hi-Hat",43:"High Floor Tom",44:"Pedal Hi-Hat",45:"Low Tom",46:"Open Hi-Hat",47:"Low-Mid Tom",48:"High-Mid Tom",49:"Crash Cymbal",50:"High Tom",51:"Ride Cymbal",52:"Chinese Cymbal",53:"Ride Bell",54:"Tambourine",55:"Splash Cymbal",56:"Cowbell",57:"Crash Cymbal 2",58:"Vibraslap",59:"Ride Cymbal 2",60:"High Bongo",61:"Low Bongo",62:"Mute High Conga",63:"Open High Conga",64:"Low Conga",65:"High Timbale",66:"Low Timbale",67:"High Agogo",68:"Low Agogo",69:"Cabasa",70:"Maracas",71:"Short Whistle",72:"Long Whistle",73:"Short Guiro",74:"Long Guiro",75:"Claves",76:"High Wood Block",77:"Low Wood Block",78:"Mute Cuica",79:"Open Cuica",80:"Mute Triangle",81:"Open Triangle"};
const STD6 = [40,45,50,55,59,64,0,0,0,0,0,0];

// Instrument presets with common tunings
var INST_PRESETS = {
  guitar: {
    label: "Guitar", defStrings: 6, defInstrument: 25,
    tunings: {
      "Standard 6": [40,45,50,55,59,64],
      "Drop D": [38,45,50,55,59,64],
      "Open G": [38,43,50,55,59,62],
      "Open D": [38,45,50,54,57,62],
      "DADGAD": [38,45,50,55,57,62],
      "Standard 7": [35,40,45,50,55,59,64],
      "Standard 8": [30,35,40,45,50,55,59,64],
      "Standard 9": [25,30,35,40,45,50,55,59,64],
      "12-String Standard": [40,52,45,57,50,62,55,67,59,59,64,64]
    }
  },
  bass: {
    label: "Bass", defStrings: 4, defInstrument: 33,
    tunings: {
      "Standard 4": [28,33,38,43],
      "Standard 5": [23,28,33,38,43],
      "Standard 6": [23,28,33,38,43,48],
      "Drop D 4": [26,33,38,43]
    }
  },
  banjo: {
    label: "Banjo", defStrings: 5, defInstrument: 105,
    tunings: {
      "Open G 5": [62,50,55,59,62],
      "Open D 5": [62,50,54,57,62],
      "Double C 5": [62,48,55,60,62],
      "Tenor 4 (CGDA)": [48,55,62,69],
      "Plectrum 4 (CGBD)": [48,55,59,62]
    }
  },
  drums: {
    label: "Drums", defStrings: 6, defInstrument: 0,
    tunings: {
      "GM Standard": [35,38,42,46,37,49],
      "GM Extended 7": [35,38,42,46,37,49,48],
      "GM Extended 8": [35,38,42,46,37,49,48,45]
    }
  }
};

// CRC32 lookup table and function (for TBT file header checksums)
var CRC32_TABLE = (function() {
  var t = new Uint32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
    t[i] = c;
  }
  return t;
})();
function crc32(data) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < data.length; i++) { crc = CRC32_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8); }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
// Per-string effect characters (matching Create->Effect menu)
var EFX_CHARS = "hp/\\^br~ts(<{wm";
var EFX_NAMES = ["Hammer On","Pull Off","Slide Up","Slide Down","Bend Up","Bend","Release Bend","Vibrato","Tap","Slap","Soft","Harmonic","Tremolo","Whammy","Palm Mute"];
var EFX_KEYS  = ["h","p","/","\\","^","b","r","~","t","s","(","<","{","w","m"];
// Normalize effect byte from file: v'r' uses ASCII chars, v'o' uses 0x80+index or raw index
function normalizeEfx(b) {
  if (b === 0) return 0;
  // Already an ASCII effect char?
  if (EFX_CHARS.indexOf(String.fromCharCode(b)) >= 0) return b;
  // v'o' encoding: 0x80 + index
  if (b >= 0x80 && (b - 0x80) < EFX_CHARS.length) return EFX_CHARS.charCodeAt(b - 0x80);
  // v'o' raw index (small values)
  if (b < EFX_CHARS.length) return EFX_CHARS.charCodeAt(b);
  return b; // unknown, pass through
}
function efxChar(b) { return b ? String.fromCharCode(b) : ""; }
const NN = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const BPM = 16;

function midiName(m) {
  if (m < 0 || m > 127) return "?";
  return NN[m % 12] + Math.floor(m / 12 - 1);
}


// === SoundFont GM Engine (SF2 file-based) ===
// Loads complete GM SoundFont (SF2) including percussion
var _actx = null, _mg = null, _notes = {}, _reverbBus = null, _chorusBus = null, _reverbOut = null, _chorusOut = null;

function initEffectBuses() {
  var ctx = getCtx();
  if (!_reverbBus) {
    var revIn = ctx.createGain(); revIn.gain.value = 0.7;
    var revOut = ctx.createGain(); revOut.gain.value = 1.0;
    var d1 = ctx.createDelay(1.0); d1.delayTime.value = 0.03;
    var d2 = ctx.createDelay(1.0); d2.delayTime.value = 0.07;
    var d3 = ctx.createDelay(1.0); d3.delayTime.value = 0.13;
    var d4 = ctx.createDelay(1.0); d4.delayTime.value = 0.21;
    var g1 = ctx.createGain(); g1.gain.value = 0.6;
    var g2 = ctx.createGain(); g2.gain.value = 0.4;
    var g3 = ctx.createGain(); g3.gain.value = 0.25;
    var g4 = ctx.createGain(); g4.gain.value = 0.15;
    var fb = ctx.createGain(); fb.gain.value = 0.3;
    revIn.connect(d1); d1.connect(g1); g1.connect(revOut);
    revIn.connect(d2); d2.connect(g2); g2.connect(revOut);
    revIn.connect(d3); d3.connect(g3); g3.connect(revOut);
    revIn.connect(d4); d4.connect(g4); g4.connect(revOut);
    d4.connect(fb); fb.connect(d3);
    revOut.connect(_mg);
    _reverbBus = revIn;
    _reverbOut = revOut;
  }
  if (!_chorusBus) {
    var chorIn = ctx.createGain(); chorIn.gain.value = 0.6;
    var chorOut = ctx.createGain(); chorOut.gain.value = 1.0;
    var cd1 = ctx.createDelay(0.1); cd1.delayTime.value = 0.012;
    var cd2 = ctx.createDelay(0.1); cd2.delayTime.value = 0.018;
    var cg1 = ctx.createGain(); cg1.gain.value = 0.5;
    var cg2 = ctx.createGain(); cg2.gain.value = 0.5;
    var lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.8;
    var lfoG1 = ctx.createGain(); lfoG1.gain.value = 0.003;
    var lfoG2 = ctx.createGain(); lfoG2.gain.value = 0.004;
    lfo.connect(lfoG1); lfoG1.connect(cd1.delayTime);
    lfo.connect(lfoG2); lfoG2.connect(cd2.delayTime);
    lfo.start();
    chorIn.connect(cd1); cd1.connect(cg1); cg1.connect(chorOut);
    chorIn.connect(cd2); cd2.connect(cg2); cg2.connect(chorOut);
    chorOut.connect(_mg);
    _chorusBus = chorIn;
    _chorusOut = chorOut;
  }
}
var _sf2 = null; // parsed SF2 data: {presets, samples}
var _sf2State = "none"; // none, loading, done, fail
var _sf2Bufs = {}; // cache: "prog-note" -> {buf:AudioBuffer, rate:number, loopStart, loopEnd, loopMode}
var _sf2LocalName = (function(){try{return localStorage.getItem("tabkit_sf2_local_name")||"";}catch(e){return "";}})();
function _setSf2LocalName(n){_sf2LocalName=n||"";try{if(n)localStorage.setItem("tabkit_sf2_local_name",n);else localStorage.removeItem("tabkit_sf2_local_name");}catch(e){}}
var SF_URL_DEFAULT = "gm.sf2";
var SF_URL = (function(){try{return localStorage.getItem("tabkit_sfUrl")||SF_URL_DEFAULT;}catch(e){return SF_URL_DEFAULT;}})();
var SF_URL_FALLBACK = "https://musical-artifacts.com/artifacts/1983/gm.sf2";

// PWA install prompt — captured in index.html, referenced here
var _pwaListeners = [];
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    window._pwaPromptEvent = e;
    _pwaListeners.forEach(function(fn) { fn(true); });
  });
  window.addEventListener("appinstalled", function() {
    window._pwaPromptEvent = null;
    _pwaListeners.forEach(function(fn) { fn(false); });
  });
}

var NKS = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

function getCtx() {
  if (!_actx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { console.error("TabKit: No AudioContext support"); return null; }
    try {
      _actx = new AC({sampleRate: 44100});
    } catch(e) {
      _actx = new AC();
    }
    _mg = _actx.createGain();
    _mg.gain.value = 0.85;
    _mg.connect(_actx.destination);
  }
  if (_actx.state === "suspended" || _actx.state === "interrupted") {
    _actx.resume().catch(function(){});
  }
  return _actx;
}
function noteKey(midi) { return NKS[midi % 12] + (Math.floor(midi / 12) - 1); }

// Retune a track's notes from oldTuning to newTuning, preserving pitch
function retuneTrack(track, oldTuning, newTuning, maxFret) {
  var ns = track.numStrings;
  var stats = {adjusted: 0, moved: 0, outOfRange: 0, outOfRangeLocs: []};
  maxFret = maxFret || track.maxFret || 24;

  for (var mi = 0; mi < track.measures.length; mi++) {
    var m = track.measures[mi];
    for (var bi = 0; bi < m.beats.length; bi++) {
      var beat = m.beats[bi];
      // Collect notes with their MIDI pitches
      var noteInfos = [];
      for (var si = 0; si < ns; si++) {
        var n = beat.notes[si];
        if (!n || n.stop) continue;
        if (n.muted) { noteInfos.push({si: si, muted: true, note: n}); continue; }
        var midi = oldTuning[si] + n.fret;
        noteInfos.push({si: si, midi: midi, note: n, muted: false});
      }
      if (noteInfos.length === 0) continue;

      var realNotes = noteInfos.filter(function(ni) { return !ni.muted; });
      var mutedNotes = noteInfos.filter(function(ni) { return ni.muted; });

      // If no real notes (all muted), skip — don't shift X-only beats
      if (realNotes.length === 0) continue;

      // Try to keep each note on its original string
      var placements = []; // [{si, fret, noteInfo}]
      var needRevoice = false;
      var usedStrings = {};

      realNotes.forEach(function(ni) {
        var newFret = ni.midi - newTuning[ni.si];
        if (newFret >= 0 && newFret <= maxFret && !usedStrings[ni.si]) {
          placements.push({si: ni.si, fret: newFret, ni: ni});
          usedStrings[ni.si] = true;
          if (newFret !== ni.note.fret) stats.adjusted++;
        } else {
          needRevoice = true;
        }
      });

      if (needRevoice) {
        // Re-voice all real notes in this chord
        placements = [];
        usedStrings = {};
        // Sort by MIDI pitch (low to high)
        var sorted = realNotes.slice().sort(function(a, b) { return a.midi - b.midi; });
        sorted.forEach(function(ni) {
          var bestSi = -1, bestFret = -1, bestScore = Infinity;
          for (var s2 = 0; s2 < ns; s2++) {
            if (usedStrings[s2]) continue;
            var f2 = ni.midi - newTuning[s2];
            if (f2 < 0 || f2 > maxFret) continue;
            // Score: prefer original string, then low fret, then low string index
            var score = (s2 === ni.si ? 0 : 10) + f2 * 0.5 + (f2 > 12 ? (f2 - 12) * 2 : 0);
            if (score < bestScore) { bestScore = score; bestSi = s2; bestFret = f2; }
          }
          if (bestSi >= 0) {
            placements.push({si: bestSi, fret: bestFret, ni: ni});
            usedStrings[bestSi] = true;
            if (bestSi !== ni.si) stats.moved++;
            else stats.adjusted++;
          } else {
            // Out of range — no valid string
            stats.outOfRange++;
            if (stats.outOfRangeLocs.length < 10) stats.outOfRangeLocs.push({measure: mi + 1, beat: bi});
          }
        });
      }

      // Clear old notes
      for (var ci = 0; ci < ns; ci++) {
        var cn = beat.notes[ci];
        if (cn && !cn.stop) beat.notes[ci] = null;
      }

      // Place new notes
      placements.forEach(function(p) {
        var newNote = Object.assign({}, p.ni.note, {fret: p.fret});
        beat.notes[p.si] = newNote;
      });

      // Re-place muted notes — find gaps between real notes
      mutedNotes.forEach(function(mn) {
        var placed = false;
        // Find occupied range
        var minOcc = ns, maxOcc = -1;
        for (var s3 = 0; s3 < ns; s3++) { if (beat.notes[s3]) { if (s3 < minOcc) minOcc = s3; if (s3 > maxOcc) maxOcc = s3; } }
        // Try gaps inside, then adjacent
        for (var s4 = minOcc; s4 <= maxOcc && !placed; s4++) { if (!beat.notes[s4]) { beat.notes[s4] = mn.note; placed = true; } }
        if (!placed && minOcc > 0 && !beat.notes[minOcc - 1]) { beat.notes[minOcc - 1] = mn.note; placed = true; }
        if (!placed && maxOcc < ns - 1 && !beat.notes[maxOcc + 1]) { beat.notes[maxOcc + 1] = mn.note; placed = true; }
        if (!placed) { for (var s5 = 0; s5 < ns && !placed; s5++) { if (!beat.notes[s5]) { beat.notes[s5] = mn.note; placed = true; } } }
      });
    }
  }
  // Context-aware smoothing pass: adjust voicings to match neighboring positions
  // Similar to MIDI import chord smoothing
  var chordInfo = [];
  for (var smi = 0; smi < track.measures.length; smi++) {
    var sm = track.measures[smi];
    for (var sbi = 0; sbi < sm.beats.length; sbi++) {
      var sbeat = sm.beats[sbi];
      var sfrets = [], sminStr = ns, smaxStr = -1;
      for (var ssi = 0; ssi < ns; ssi++) {
        var sn = sbeat.notes[ssi];
        if (sn && !sn.stop && !sn.muted) {
          sfrets.push(sn.fret);
          if (ssi < sminStr) sminStr = ssi;
          if (ssi > smaxStr) smaxStr = ssi;
        }
      }
      if (sfrets.length >= 2) {
        chordInfo.push({mi: smi, bi: sbi, frets: sfrets,
          avgFret: sfrets.reduce(function(a,b){return a+b;},0)/sfrets.length,
          minStr: sminStr, maxStr: smaxStr});
      }
    }
  }

  // Forward then backward pass
  for (var sp = 0; sp < 2; sp++) {
    for (var sci = (sp===0?0:chordInfo.length-1); sp===0?(sci<chordInfo.length):(sci>=0); sp===0?sci++:sci--) {
      var cur = chordInfo[sci];
      var prev = (sp===0 && sci>0) ? chordInfo[sci-1] : null;
      var next = (sp===1 && sci<chordInfo.length-1) ? chordInfo[sci+1] : null;
      var neighbor = prev || next;
      if (!neighbor) continue;

      var spread = cur.frets.length > 1 ? (Math.max.apply(null, cur.frets) - Math.min.apply(null, cur.frets)) : 0;
      if (spread <= 1) continue; // perfect voicing, don't touch

      var cbeat2 = track.measures[cur.mi].beats[cur.bi];
      // Collect real notes with MIDI values
      var cNotes = [];
      for (var csi = 0; csi < ns; csi++) {
        var cn2 = cbeat2.notes[csi];
        if (cn2 && !cn2.stop && !cn2.muted) {
          cNotes.push({si: csi, midi: newTuning[csi] + cn2.fret, note: cn2});
        }
      }
      if (cNotes.length < 2) continue;

      // Try all valid string placements for these notes
      var bestCombo = null, bestScore = Infinity;
      var cSorted = cNotes.slice().sort(function(a,b){return a.midi - b.midi;});

      function tryCombo(idx, used, chosen) {
        if (idx === cSorted.length) {
          var frets2 = chosen.map(function(c){return c.fret;});
          var strs = chosen.map(function(c){return c.si;});
          var mn2 = Math.min.apply(null, strs), mx2 = Math.max.apply(null, strs);
          var avg2 = frets2.reduce(function(a,b){return a+b;},0) / frets2.length;
          var sp2 = Math.max.apply(null, frets2) - Math.min.apply(null, frets2);
          var score = sp2 * 5 + Math.abs(avg2 - neighbor.avgFret) * 4;
          if (mn2 === neighbor.minStr && mx2 === neighbor.maxStr) score -= 10;
          frets2.forEach(function(f){if(f>12)score+=(f-12)*2;});
          if (score < bestScore) { bestScore = score; bestCombo = chosen.slice(); }
          return;
        }
        var cn3 = cSorted[idx];
        for (var ts = 0; ts < ns; ts++) {
          if (used[ts]) continue;
          var tf = cn3.midi - newTuning[ts];
          if (tf < 0 || tf > maxFret) continue;
          used[ts] = true;
          chosen.push({si: ts, fret: tf, note: cn3.note});
          tryCombo(idx + 1, used, chosen);
          chosen.pop();
          used[ts] = false;
        }
      }
      if (cSorted.length <= 6) tryCombo(0, {}, []);

      if (bestCombo) {
        // Compare against current
        var curScore = spread * 5 + Math.abs(cur.avgFret - neighbor.avgFret) * 4;
        if (cur.minStr === neighbor.minStr && cur.maxStr === neighbor.maxStr) curScore -= 10;
        cur.frets.forEach(function(f){if(f>12)curScore+=(f-12)*2;});

        if (bestScore < curScore) {
          // Clear and re-place
          for (var clr = 0; clr < ns; clr++) {
            var cln = cbeat2.notes[clr];
            if (cln && !cln.stop && !cln.muted) cbeat2.notes[clr] = null;
          }
          var newFrets = [], newMinS = ns, newMaxS = -1;
          bestCombo.forEach(function(bc) {
            cbeat2.notes[bc.si] = Object.assign({}, bc.note, {fret: bc.fret});
            newFrets.push(bc.fret);
            if (bc.si < newMinS) newMinS = bc.si;
            if (bc.si > newMaxS) newMaxS = bc.si;
          });
          cur.frets = newFrets;
          cur.avgFret = newFrets.reduce(function(a,b){return a+b;},0)/newFrets.length;
          cur.minStr = newMinS;
          cur.maxStr = newMaxS;
        }
      }
    }
  }

  return stats;
}

// --- Per-channel mixer nodes ---
var _chNodes = {};
function getChNode(ch) {
  if (!_chNodes[ch]) {
    var ctx = getCtx();
    initEffectBuses();
    var g = ctx.createGain(); g.gain.value = 1.0;
    var expr = ctx.createGain(); expr.gain.value = 1.0;
    var revSend = ctx.createGain(); revSend.gain.value = 0;
    var chrSend = ctx.createGain(); chrSend.gain.value = 0;
    if (ctx.createStereoPanner) {
      var p = ctx.createStereoPanner(); p.pan.value = 0;
      g.connect(expr); expr.connect(p); p.connect(_mg);
      g.connect(revSend); revSend.connect(_reverbBus);
      g.connect(chrSend); chrSend.connect(_chorusBus);
      _chNodes[ch] = { gain: g, expr: expr, pan: p, revSend: revSend, chrSend: chrSend, bendCents: 0, modDepth: 0, _cc7: 96, _cc11: 127, bank: 0 };
    } else {
      g.connect(expr); expr.connect(_mg);
      g.connect(revSend); revSend.connect(_reverbBus);
      g.connect(chrSend); chrSend.connect(_chorusBus);
      _chNodes[ch] = { gain: g, expr: expr, pan: null, revSend: revSend, chrSend: chrSend, bendCents: 0, modDepth: 0, _cc7: 96, _cc11: 127, bank: 0 };
    }
  }
  return _chNodes[ch];
}
function setChVolume(ch, vol) {
  var node = getChNode(ch);
  node._cc7 = vol;
  node.gain.gain.value = Math.pow(vol/127, 0.6);
}
function setChExpression(ch, val127, audioTime) {
  var node = getChNode(ch);
  var ctx = _actx; if (!ctx) return;
  node._cc11 = val127;
  var targetGain = val127 / 127;
  var t = audioTime || ctx.currentTime;
  try {
    if (audioTime && audioTime > ctx.currentTime + 0.01) {
      // Ramp TO the target time — expression is fully realized at this beat
      node.expr.gain.linearRampToValueAtTime(targetGain, t);
    } else {
      // Immediate set (playback start, reset, etc.)
      node.expr.gain.cancelScheduledValues(ctx.currentTime);
      node.expr.gain.setValueAtTime(targetGain, ctx.currentTime);
    }
  } catch(e) {
    node.expr.gain.value = targetGain;
  }
}
function setChReverb(ch, val127) {
  var node = getChNode(ch);
  if (node.revSend) node.revSend.gain.value = Math.pow(val127/127, 0.8) * 0.6;
}
function setChChorus(ch, val127) {
  var node = getChNode(ch);
  if (node.chrSend) node.chrSend.gain.value = Math.pow(val127/127, 0.8) * 0.5;
}
function setChPan(ch, pan127) {
  var node = getChNode(ch);
  if (node.pan) node.pan.pan.value = Math.max(-1, Math.min(1, (pan127 - 64) / 64));
}

function setChBank(ch, bank) { getChNode(ch).bank = bank; }

function getSF2Banks() {
  if (!_sf2 || !_sf2.presets) return [0];
  var banks = {};
  for (var b in _sf2.presets) banks[b] = true;
  var list = Object.keys(banks).map(Number).sort(function(a,b){return a-b;});
  return list.length > 0 ? list : [0];
}

function getSF2PresetsForBank(bank) {
  if (!_sf2 || !_sf2.presets || !_sf2.presets[bank]) return [];
  var list = [];
  for (var p in _sf2.presets[bank]) list.push(Number(p));
  return list.sort(function(a,b){return a-b;});
}

function getSF2PresetName(bank, prog) {
  if (_sf2 && _sf2.presetNames && _sf2.presetNames[bank] && _sf2.presetNames[bank][prog]) return _sf2.presetNames[bank][prog];
  if (bank === 0 && GM[prog]) return GM[prog];
  return "Program " + prog;
}

function setChPitchBend(ch, bend16) {
  var sv = bend16 > 32767 ? bend16 - 65536 : bend16;
  var cents = sv;
  var node = getChNode(ch);
  node.bendCents = cents;
  var chStr = String(ch) + "-";
  for (var key in _notes) {
    if (key.substring(0, chStr.length) !== chStr) continue;
    var n = _notes[key]; if (!n) continue;
    try {
      if (n.sf) {
        var newRate = (n.baseRate || 1) * Math.pow(2, cents / 1200);
        try { if (n.src) n.src.playbackRate.value = newRate; } catch(e10){}
      } else {
        if (n.src && n.src.detune) n.src.detune.value = cents;
        if (n.s2 && n.s2.detune) n.s2.detune.value = cents;
      }
    } catch(e){}
  }
  // Re-apply modulation if active, so it oscillates around the new bend center
  if (node.modDepth > 0) {
    setChModulation(ch, node.modDepth);
  }
}
function setChModulation(ch, depth127) {
  var modCents = (depth127 / 127) * 40;
  var ctx = getCtx(); var t = ctx.currentTime;
  var chNode = getChNode(ch);
  chNode.modDepth = depth127;
  var bendCents = chNode.bendCents || 0;
  for (var key in _notes) {
    if (!key.startsWith(ch + "-")) continue;
    var n = _notes[key]; if (!n) continue;
    try {
      if (n.sf) {
        var bentRate = (n.baseRate||1) * Math.pow(2, bendCents / 1200);
        try {
          if (n.src && n.src.playbackRate) {
            var pr = n.src.playbackRate;
            pr.cancelScheduledValues(t);
            if (modCents > 0) {
              var rate = 5.5;
              for (var vi = 0; vi < 40; vi++) {
                pr.setValueAtTime(bentRate * Math.pow(2, modCents / 1200), t + vi / rate);
                pr.setValueAtTime(bentRate * Math.pow(2, -modCents / 1200), t + vi / rate + 0.5 / rate);
              }
            } else { pr.setValueAtTime(bentRate, t); }
          }
        } catch(e10){}
        // Apply to phase-offset source if present
      } else {
        var targets = [];
        if (n.src && n.src.detune) targets.push(n.src.detune);
        if (n.s2 && n.s2.detune) targets.push(n.s2.detune);
        for (var ti2 = 0; ti2 < targets.length; ti2++) {
          var dt = targets[ti2]; dt.cancelScheduledValues(t);
          if (modCents > 0) { for (var vi2=0;vi2<40;vi2++){dt.setValueAtTime(bendCents+modCents,t+vi2/5.5);dt.setValueAtTime(bendCents-modCents,t+vi2/5.5+0.5/5.5);} }
          else { dt.setValueAtTime(bendCents, t); }
        }
      }
    } catch(e){}
  }
}

// --- Minimal SF2 Parser ---
function parseSF2(ab) {
  var dv = new DataView(ab); var u8 = new Uint8Array(ab);
  function str4(off) { return String.fromCharCode(u8[off],u8[off+1],u8[off+2],u8[off+3]); }
  function findChunk(start, end, id) {
    var p = start;
    while (p + 8 <= end) {
      var cid = str4(p); var sz = dv.getUint32(p+4, true);
      if (cid === id) return {off: p+8, size: sz};
      p += 8 + sz + (sz & 1);
    }
    return null;
  }
  function findListChunk(start, end, listType) {
    var p = start;
    while (p + 12 <= end) {
      var cid = str4(p); var sz = dv.getUint32(p+4, true);
      if (cid === "LIST" && str4(p+8) === listType) return {off: p+12, size: sz-4};
      p += 8 + sz + (sz & 1);
    }
    return null;
  }
  if (str4(0) !== "RIFF" || str4(8) !== "sfbk") throw new Error("Not SF2");
  var fileSize = dv.getUint32(4, true);
  var sdta = findListChunk(12, 12+fileSize, "sdta");
  var pdta = findListChunk(12, 12+fileSize, "pdta");
  if (!sdta || !pdta) throw new Error("Missing sdta/pdta");

  // Sample data (16-bit signed PCM)
  var smpl = findChunk(sdta.off, sdta.off+sdta.size, "smpl");
  if (!smpl) throw new Error("Missing smpl");
  var sampleData = new Int16Array(ab, smpl.off, smpl.size / 2);

  // Parse pdta sub-chunks
  function getSubChunk(id, recSize) {
    var c = findChunk(pdta.off, pdta.off+pdta.size, id);
    if (!c) return [];
    var arr = []; var count = Math.floor(c.size / recSize);
    for (var i = 0; i < count; i++) arr.push(c.off + i * recSize);
    return arr;
  }
  var phdrs = getSubChunk("phdr", 38);
  var pbags = getSubChunk("pbag", 4);
  var pgens = getSubChunk("pgen", 4);
  var insts = getSubChunk("inst", 22);
  var ibags = getSubChunk("ibag", 4);
  var igens = getSubChunk("igen", 4);
  var shdrs = getSubChunk("shdr", 46);

  // Parse sample headers
  var samples = [];
  for (var si = 0; si < shdrs.length - 1; si++) {
    var so = shdrs[si];
    var sStart = dv.getUint32(so+20, true), sEnd = dv.getUint32(so+24, true);
    var lStart = dv.getUint32(so+28, true), lEnd = dv.getUint32(so+32, true);
    var sr = dv.getUint32(so+36, true);
    var origPitch = u8[so+40]; var correction = dv.getInt8(so+41);
    var sType = dv.getUint16(so+44, true);
    samples.push({start:sStart, end:sEnd, loopStart:lStart, loopEnd:lEnd, sampleRate:sr, origPitch:origPitch===255?60:origPitch, correction:correction, type:sType});
  }

  // Parse instrument zones
  function getInstZones(instIdx) {
    if (instIdx >= insts.length - 1) return [];
    var bagStart = dv.getUint16(insts[instIdx]+20, true);
    var bagEnd = dv.getUint16(insts[instIdx+1]+20, true);
    var zones = [];
    for (var bi = bagStart; bi < bagEnd; bi++) {
      var genStart = dv.getUint16(ibags[bi], true);
      var genEnd = dv.getUint16(ibags[bi+1], true);
      var z = {keyLo:0,keyHi:127,velLo:0,velHi:127,sampleIdx:-1,coarseTune:0,fineTune:0,rootKey:-1,loopMode:0,
        attackVolEnv:-12000,releaseVolEnv:-12000,sustainVolEnv:0};
      for (var gi = genStart; gi < genEnd; gi++) {
        var op = dv.getUint16(igens[gi], true);
        var amt = dv.getInt16(igens[gi]+2, true);
        if (op===43){z.keyLo=amt&0xFF;z.keyHi=(amt>>8)&0xFF;}
        else if(op===44){z.velLo=amt&0xFF;z.velHi=(amt>>8)&0xFF;}
        else if(op===53) z.sampleIdx=amt;
        else if(op===51) z.coarseTune=amt;
        else if(op===52) z.fineTune=amt;
        else if(op===58) z.rootKey=amt;
        else if(op===54) z.loopMode=amt;
        else if(op===33) z.attackVolEnv=amt;
        else if(op===36) z.releaseVolEnv=amt;
        else if(op===38) z.sustainVolEnv=amt;
      }
      if (z.sampleIdx >= 0) zones.push(z);
    }
    return zones;
  }

  // Build preset map: presets[bank][program] = [{keyLo,keyHi,velLo,velHi,instZones}]
  var presets = {};
  var presetNames = {};
  for (var pi = 0; pi < phdrs.length - 1; pi++) {
    var po = phdrs[pi];
    // Extract 20-byte null-terminated preset name
    var pName = "";
    for (var ni = 0; ni < 20; ni++) { var nc = u8[po + ni]; if (!nc) break; pName += String.fromCharCode(nc); }
    var preset = dv.getUint16(po+20, true);
    var bank = dv.getUint16(po+22, true);
    var bagStart2 = dv.getUint16(po+24, true);
    var bagEnd2 = dv.getUint16(phdrs[pi+1]+24, true);
    if (!presets[bank]) presets[bank] = {};
    if (!presetNames[bank]) presetNames[bank] = {};
    presetNames[bank][preset] = pName;
    var pZones = [];
    for (var bi2 = bagStart2; bi2 < bagEnd2; bi2++) {
      var genStart2 = dv.getUint16(pbags[bi2], true);
      var genEnd2 = dv.getUint16(pbags[bi2+1], true);
      var pz = {keyLo:0,keyHi:127,velLo:0,velHi:127,instIdx:-1};
      for (var gi2 = genStart2; gi2 < genEnd2; gi2++) {
        var op2 = dv.getUint16(pgens[gi2], true);
        var amt2 = dv.getInt16(pgens[gi2]+2, true);
        if(op2===43){pz.keyLo=amt2&0xFF;pz.keyHi=(amt2>>8)&0xFF;}
        else if(op2===44){pz.velLo=amt2&0xFF;pz.velHi=(amt2>>8)&0xFF;}
        else if(op2===41) pz.instIdx=amt2;
      }
      if (pz.instIdx >= 0) pZones.push(pz);
    }
    presets[bank][preset] = pZones;
  }
  return {presets:presets, presetNames:presetNames, samples:samples, sampleData:sampleData, getInstZones:getInstZones};
}

// --- IndexedDB SF2 cache ---
function _sfIDBOpen() {
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open("tabkit_sf2", 1);
    req.onupgradeneeded = function() { req.result.createObjectStore("sf2"); };
    req.onsuccess = function() { resolve(req.result); };
    req.onerror = function() { reject(req.error); };
  });
}
function sfIDBSave(name, ab) {
  return _sfIDBOpen().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction("sf2", "readwrite");
      tx.objectStore("sf2").put(ab, "data");
      tx.objectStore("sf2").put(name, "name");
      tx.oncomplete = function() { db.close(); resolve(); };
      tx.onerror = function() { db.close(); reject(tx.error); };
    });
  });
}
function sfIDBLoad() {
  return _sfIDBOpen().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction("sf2", "readonly");
      var store = tx.objectStore("sf2");
      var rData = store.get("data");
      var rName = store.get("name");
      tx.oncomplete = function() { db.close(); resolve({data: rData.result, name: rName.result}); };
      tx.onerror = function() { db.close(); reject(tx.error); };
    });
  });
}
function sfIDBClear() {
  return _sfIDBOpen().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction("sf2", "readwrite");
      tx.objectStore("sf2").clear();
      tx.oncomplete = function() { db.close(); resolve(); };
      tx.onerror = function() { db.close(); reject(tx.error); };
    });
  });
}

// Load SF2 file
function loadSF2(onStatus) {
  if (_sf2State !== "none") return;
  _sf2State = "loading";
  var cb = onStatus || _sf2StatusCb || function(){};
  var log = function(msg) { console.log("[SF2] " + msg); cb(msg); };
  // Check IndexedDB for cached local SF2 first
  sfIDBLoad().then(function(cached) {
    if (cached && cached.data && cached.data.byteLength > 0) {
      log("Loading cached SoundFont: " + (cached.name || "local") + " (" + Math.round(cached.data.byteLength/1024) + "KB)...");
      _sf2 = parseSF2(cached.data);
      _sf2State = "done";
      _sf2Bufs = {};
      _setSf2LocalName(cached.name || "local");
      var pc = 0; for(var b in _sf2.presets) for(var p in _sf2.presets[b]) pc++;
      log("Ready: " + pc + " presets, " + _sf2.samples.length + " samples (" + (cached.name||"cached") + ")");
      _sf2WarmState = "none";
      warmSF2Cache(function(done, total) {
        if (done < total) log("Pre-loading samples: " + done + "/" + total);
        else log("Ready (" + (cached.name||"cached") + "): " + pc + " presets (cached)");
      });
      return;
    }
    throw new Error("no cache");
  }).catch(function() {
    // No cached local SF2, load from URL
    log("Loading SoundFont from " + SF_URL);
    function tryFetch(url) {
      return fetch(url).then(function(r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.arrayBuffer();
      });
    }
    function tryWithProxies(url) {
      return tryFetch(url).catch(function() {
        log("Direct fetch failed, trying proxies...");
        var proxyUrls = [
          "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
          "https://corsproxy.io/?" + encodeURIComponent(url)
        ];
        var chain = Promise.reject();
        for (var pi3 = 0; pi3 < proxyUrls.length; pi3++) {
          (function(pu, idx) { chain = chain.catch(function() { log("Trying proxy " + (idx+1) + "..."); return tryFetch(pu); }); })(proxyUrls[pi3], pi3);
        }
        return chain;
      });
    }
    tryWithProxies(SF_URL).catch(function() {
      log("Primary URL failed, trying CDN fallback...");
      return tryWithProxies(SF_URL_FALLBACK);
    }).then(function(ab){
      log("Parsing " + Math.round(ab.byteLength/1024) + "KB...");
      _sf2 = parseSF2(ab);
      _sf2State = "done";
      _setSf2LocalName("");
      var presetCount = 0;
      for(var b in _sf2.presets) for(var p in _sf2.presets[b]) presetCount++;
      log("Ready: " + presetCount + " presets, " + _sf2.samples.length + " samples");
      _sf2WarmState = "none";
      warmSF2Cache(function(done, total) {
        if (done < total) log("Pre-loading samples: " + done + "/" + total);
        else log("Ready: " + presetCount + " presets, " + _sf2.samples.length + " samples (cached)");
      });
    }).catch(function(e){
      console.error("[SF2] Load failed:", e);
      _sf2State = "fail";
      log("SoundFont load failed: " + e.message);
    });
  });
}

// Load SF2 from ArrayBuffer (for local files)
function loadSF2FromBuffer(ab, name, onStatus) {
  var cb = onStatus || _sf2StatusCb || function(){};
  var log = function(msg) { console.log("[SF2] " + msg); cb(msg); };
  try {
    log("Parsing " + (name || "local file") + " (" + Math.round(ab.byteLength/1024) + "KB)...");
    _sf2 = parseSF2(ab);
    _sf2State = "done";
    _sf2Bufs = {};
    _setSf2LocalName(name || "local");
    var presetCount = 0;
    for(var b in _sf2.presets) for(var p in _sf2.presets[b]) presetCount++;
    log("Ready: " + presetCount + " presets, " + _sf2.samples.length + " samples");
    // Save to IndexedDB for reload persistence
    sfIDBSave(name, ab).then(function() {
      log("SoundFont cached for next session");
    }).catch(function() {});
    _sf2WarmState = "none";
    warmSF2Cache(function(done, total) {
      if (done < total) log("Pre-loading samples: " + done + "/" + total);
      else log("Ready (" + (name||"local") + "): " + presetCount + " presets (cached)");
    });
  } catch(e) {
    console.error("[SF2] Parse failed:", e);
    log("SoundFont parse failed: " + e.message);
  }
}

// Find matching zone for a note
function findSF2Zone(bank, prog, note, vel) {
  if (!_sf2 || !_sf2.presets[bank] || !_sf2.presets[bank][prog]) return null;
  var pZones = _sf2.presets[bank][prog];
  for (var i = 0; i < pZones.length; i++) {
    var pz = pZones[i];
    if (note >= pz.keyLo && note <= pz.keyHi && vel >= pz.velLo && vel <= pz.velHi) {
      var instZones = _sf2.getInstZones(pz.instIdx);
      for (var j = 0; j < instZones.length; j++) {
        var iz = instZones[j];
        if (note >= iz.keyLo && note <= iz.keyHi && vel >= iz.velLo && vel <= iz.velHi) {
          return iz;
        }
      }
    }
  }
  return null;
}

// Create AudioBuffer from SF2 sample zone
function getSF2Buffer(zone) {
  var s = _sf2.samples[zone.sampleIdx];
  if (!s || s.type & 0x8000) return null;
  var key = zone.sampleIdx + "-" + s.start;
  if (_sf2Bufs[key]) return _sf2Bufs[key];
  var ctx = getCtx();
  var len = s.end - s.start;
  if (len <= 0 || len > 4000000) return null;
  var buf = ctx.createBuffer(1, len, s.sampleRate);
  var data = buf.getChannelData(0);
  var src16 = _sf2.sampleData;
  var offset = s.start;
  var maxIdx = src16.length;
  for (var i = 0; i < len; i++) {
    data[i] = (i + offset < maxIdx) ? src16[i + offset] / 32768.0 : 0;
  }
  var loopS = s.loopStart - s.start;
  var loopE = s.loopEnd - s.start;
  if (loopS < 0) loopS = 0;
  if (loopE > len) loopE = len;
  if (loopE <= loopS) { loopS = 0; loopE = 0; }
  var rootKey = zone.rootKey >= 0 ? zone.rootKey : s.origPitch;
  var result = {buf:buf, rootKey:rootKey, correction:s.correction+(zone.fineTune||0), coarseTune:zone.coarseTune||0,
    loopStart:loopS / s.sampleRate, loopEnd:loopE / s.sampleRate, loopMode:zone.loopMode,
    attackVolEnv:zone.attackVolEnv, releaseVolEnv:zone.releaseVolEnv, sustainVolEnv:zone.sustainVolEnv};
  _sf2Bufs[key] = result;
  return result;
}

// Preload (just trigger SF2 load)
function loadSF(prog) { loadSF2(_sf2StatusCb); }
function preloadSong(tracks) { loadSF2(_sf2StatusCb); }
var _sf2StatusCb = null; // global ref for status updates

// Pre-warm SF2 buffer cache in batches (non-blocking)
var _sf2WarmState = "none"; // none, warming, done
function warmSF2Cache(onProgress) {
  if (!_sf2 || _sf2WarmState !== "none") return;
  _sf2WarmState = "warming";
  var allZones = [];
  var seen = {};
  for (var bank in _sf2.presets) {
    for (var prog in _sf2.presets[bank]) {
      var pZones = _sf2.presets[bank][prog];
      for (var pi2 = 0; pi2 < pZones.length; pi2++) {
        var instZones = _sf2.getInstZones(pZones[pi2].instIdx);
        for (var j2 = 0; j2 < instZones.length; j2++) {
          var iz2 = instZones[j2];
          if (iz2.sampleIdx >= 0) {
            var s2 = _sf2.samples[iz2.sampleIdx];
            var sk = iz2.sampleIdx + "-" + (s2 ? s2.start : 0);
            if (!seen[sk]) { seen[sk] = true; allZones.push(iz2); }
          }
        }
      }
    }
  }
  var total = allZones.length, idx = 0;
  function batch() {
    var end = Math.min(idx + 20, total);
    for (; idx < end; idx++) {
      try { getSF2Buffer(allZones[idx]); } catch(e) {}
    }
    if (onProgress) onProgress(idx, total);
    if (idx < total) setTimeout(batch, 0);
    else { _sf2WarmState = "done"; if (onProgress) onProgress(total, total); }
  }
  if (total > 0) batch(); else { _sf2WarmState = "done"; }
}

// --- Synth functions ---
function synthOn(ch, note, vel, prog, dur, noDecay, bank, detuneCents) {
  var ctx = getCtx(); var t = ctx.currentTime; var key = ch + "-" + note + (detuneCents ? "d" + detuneCents : "");
  if (_notes[key]) synthOff(ch, note, detuneCents);
  var v = ((vel || 80) / 127) * 0.7;
  var endT = dur > 0 ? t + dur : 0;
  var outNode = getChNode(ch).gain;
  if (bank === undefined) bank = (ch === 10) ? 128 : (getChNode(ch).bank || 0);
  var zone = findSF2Zone(bank, prog || 0, note, vel || 80);
  if (zone) {
    var sf = getSF2Buffer(zone);
    if (sf) {
      var src = ctx.createBufferSource(); src.buffer = sf.buf;
      var pitchDiff = (note - sf.rootKey) * 100 + sf.coarseTune * 100 + sf.correction + (detuneCents || 0);
      var baseRate = Math.pow(2, pitchDiff / 1200);
      src.playbackRate.value = baseRate;
      // Cymbal MIDI notes that should ring and fade
      var isCymbal = bank === 128 && (note===46||note===49||note===51||note===52||note===53||note===55||note===57||note===59);
      // Enable looping
      var shouldLoop = (sf.loopMode === 1 || sf.loopMode === 3) && (bank !== 128 || isCymbal);
      if (shouldLoop) {
        src.loop = true;
        src.loopStart = sf.loopStart;
        src.loopEnd = sf.loopEnd;
      }
      var gn = ctx.createGain(); gn.gain.value = v;
      // Attack envelope
      var atkTime = Math.pow(2, (sf.attackVolEnv||(-12000)) / 1200);
      if (atkTime > 0.002) { gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + Math.min(atkTime, 2)); }
      src.connect(gn); gn.connect(outNode);
      src.start(t);
      // Schedule stop AFTER start
      if (endT > 0 && bank !== 128) {
        var relTime = Math.min(Math.pow(2, (sf.releaseVolEnv||(-12000)) / 1200), 1);
        var gnSustainV = v;
        gn.gain.setValueAtTime(gnSustainV, Math.max(t, endT - relTime));
        gn.gain.linearRampToValueAtTime(0, endT + 0.01);
        try { src.stop(endT + relTime + 0.05); } catch(e3){}
      }
      // Percussion timing
      if (bank === 128) {
        var sampleDur = sf.buf.duration / baseRate;
        if (isCymbal) {
          // Cymbals: loop + fade (2 seconds)
          var cymDur = 2.0;
          gn.gain.setValueAtTime(v, t);
          gn.gain.setValueAtTime(v * 0.6, t + 0.3);
          gn.gain.exponentialRampToValueAtTime(0.001, t + cymDur);
          try { src.stop(t + cymDur + 0.05); } catch(e4){}
        } else {
          // Other percussion: play full sample, no loop
          try { src.stop(t + sampleDur + 0.1); } catch(e4){}
        }
      }
      var chBend = getChNode(ch).bendCents;
      if (chBend) {
        var bentRate = baseRate * Math.pow(2, chBend / 1200);
        src.playbackRate.value = bentRate;
      }
      // Instruments with natural decay: schedule auto-fade even if looping
      // These instruments decay in real life even if held - piano hammers, plucked strings, etc.
      var autoDecay = 0;
      if (bank === 0 && prog <= 7) autoDecay = 6.0;    // Piano family: 6s (long sustain)
      if (bank === 0 && (prog >= 8 && prog <= 15)) autoDecay = 3.0; // Chromatic perc (celesta, vibes, marimba)
      if (bank === 0 && prog === 24) autoDecay = 4.0;  // Acoustic nylon guitar
      if (bank === 0 && prog === 25) autoDecay = 4.0;  // Acoustic steel guitar
      if (bank === 0 && prog === 26) autoDecay = 3.5;  // Jazz guitar (clean, mellow)
      if (bank === 0 && prog === 27) autoDecay = 4.0;  // Clean electric guitar
      if (bank === 0 && prog === 28) autoDecay = 2.0;  // Muted guitar
      if (bank === 0 && prog === 29) autoDecay = 5.0;  // Overdriven guitar
      if (bank === 0 && prog === 30) autoDecay = 5.0;  // Distortion guitar
      if (bank === 0 && prog === 31) autoDecay = 3.0;  // Guitar harmonics
      if (bank === 0 && prog === 46) autoDecay = 3.0;  // Orchestral harp
      if (bank === 0 && (prog >= 32 && prog <= 39)) autoDecay = 5.0; // Bass instruments
      if (bank === 0 && prog === 47) autoDecay = 2.0;  // Timpani
      if (bank === 0 && (prog >= 104 && prog <= 111)) autoDecay = 2.5; // Ethnic plucked (sitar, banjo, etc)
      if (bank === 0 && (prog >= 112 && prog <= 119)) autoDecay = 1.5; // Percussion (tinkle bell, agogo, etc)
      if (autoDecay > 0 && endT <= 0 && !noDecay) {
        gn.gain.setValueAtTime(v, t);
        gn.gain.setValueAtTime(v * 0.85, t + autoDecay * 0.25);
        gn.gain.setValueAtTime(v * 0.5, t + autoDecay * 0.55);
        gn.gain.exponentialRampToValueAtTime(0.001, t + autoDecay);
        try { src.stop(t + autoDecay + 0.05); } catch(e6){}
      }
      // Release time: use SF2 value, with overrides for specific instruments
      var relSec = Math.min(Math.max(Math.pow(2, (sf.releaseVolEnv||(-3000)) / 1200), 0.05), 3);
      if (bank === 0 && (prog === 31)) relSec = Math.max(relSec, 0.15);  // Guitar harmonics
      if (bank === 0 && prog <= 7) relSec = Math.max(relSec, 0.6);       // Piano
      if (bank === 0 && (prog >= 24 && prog <= 27)) relSec = Math.max(relSec, 0.4); // Acoustic/clean guitar
      if (bank === 0 && (prog >= 32 && prog <= 39)) relSec = Math.max(relSec, 0.3); // Bass
      if (bank === 0 && ((prog >= 48 && prog <= 63) || (prog >= 88 && prog <= 95))) relSec = Math.max(relSec, 1.0); // Strings/pads
      _notes[key] = { src: src, gn: gn, sf: true, baseRate: baseRate, rel: relSec };
      return;
    }
  }
  // No SF2 zone found - stay silent (missing bank/instrument)
  return;
}

function getDelayMs(delayTime, tempo) {
  var beatMs = 60000 / (tempo || 120);
  if (delayTime === "4") return beatMs;
  if (delayTime === "8") return beatMs / 2;
  if (delayTime === "8d") return beatMs * 0.75;
  if (delayTime === "16") return beatMs / 4;
  if (delayTime === "slap") return 80;
  return beatMs * 0.75;
}

function scheduleDelay(ch, note, vel, prog, dur, bank, delayMs, taps, mixPct) {
  var decay = mixPct / 100;
  for (var tap = 1; tap <= taps; tap++) {
    (function(t, v) {
      setTimeout(function() { if (v >= 3) synthOn(ch, note, Math.round(v), prog, dur, false, bank); }, Math.round(delayMs * t));
    })(tap, vel * Math.pow(decay, tap));
  }
}

function scheduleTremolo(ch, speed, depth) {
  var node = getChNode(ch);
  if (!node || !node.gain) return;
  var ctx = getCtx(); var t = ctx.currentTime;
  var baseVol = node.gain.gain.value || 0.5;
  var lo = baseVol * (1 - depth/100);
  var halfPeriod = 1 / speed / 2;
  var rampTime = halfPeriod * 0.4; // 40% of half-period for smooth ramp
  node.gain.gain.cancelScheduledValues(t);
  node.gain.gain.setValueAtTime(baseVol, t);
  for (var i = 0; i < 60; i++) {
    var tt = t + i * halfPeriod;
    if (tt > t + 3) break;
    var target = i % 2 === 0 ? lo : baseVol;
    node.gain.gain.linearRampToValueAtTime(target, tt + rampTime);
    node.gain.gain.setValueAtTime(target, tt + halfPeriod - 0.001);
  }
}

// Check if a bank/instrument combination exists in the loaded SF2
function sf2HasPreset(bank, prog) {
  if (!_sf2 || !_sf2.presets) return false;
  return _sf2.presets[bank] && _sf2.presets[bank][prog] && _sf2.presets[bank][prog].length > 0;
}

function synthOff(ch, note, detuneCents) {
  var key = ch + "-" + note + (detuneCents ? "d" + detuneCents : ""); var n = _notes[key]; if (!n) return;
  try {
    var ctx = getCtx(); var t = ctx.currentTime;
    var rel = n.rel || 0.1;
    if (n.gn) { var cv = n.gn.gain.value || 0.001; n.gn.gain.cancelScheduledValues(t); n.gn.gain.setValueAtTime(Math.max(cv, 0.001), t); n.gn.gain.exponentialRampToValueAtTime(0.001, t + rel); }
    if (n.src) try { n.src.stop(t + rel + 0.05); } catch(e){}
    if (n.s2) try { n.s2.stop(t + rel + 0.05); } catch(e){}
  } catch(e) {}
  delete _notes[key];
}

// Hard kill: immediate silence (for stop notes / palm mutes)
function synthKill(ch, note) {
  var key = ch + "-" + note; var n = _notes[key]; if (!n) return;
  try {
    if (n.gn) { try { n.gn.gain.cancelScheduledValues(0); n.gn.gain.setValueAtTime(0, 0); } catch(e4){} try { n.gn.disconnect(); } catch(e6){} }
    if (n.src) try { n.src.stop(0); } catch(e2){}
    if (n.s2) try { n.s2.stop(0); } catch(e3){}
  } catch(e) {}
  delete _notes[key];
}

// Fast choke: ~25ms exponential decay (cymbal grab / hi-hat close)
function synthChoke(ch, note) {
  var key = ch + "-" + note; var n = _notes[key]; if (!n) return;
  try {
    var ctx = getCtx(); var t = ctx.currentTime;
    if (n.gn) {
      var cv = n.gn.gain.value || 0.001;
      n.gn.gain.cancelScheduledValues(t);
      n.gn.gain.setValueAtTime(Math.max(cv, 0.001), t);
      n.gn.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    }
    if (n.src) try { n.src.stop(t + 0.035); } catch(e2){}
    if (n.s2) try { n.s2.stop(t + 0.035); } catch(e3){}
  } catch(e) {}
  delete _notes[key];
}

function synthKillChannel(ch) {
  var prefix = ch + "-";
  for (var k in _notes) {
    if (k.substring(0, prefix.length) === prefix) {
      try {
        var n = _notes[k];
        if (n.gn) { try { n.gn.gain.cancelScheduledValues(0); } catch(e4) {} try { n.gn.disconnect(); } catch(e6) {} }
        if (n.src) try { n.src.stop(0); } catch(e2) {}
        if (n.s2) try { n.s2.stop(0); } catch(e3) {}
      } catch(e) {}
      delete _notes[k];
    }
  }
}

function synthAllOff() {
  for (var k in _notes) {
    try {
      var n = _notes[k];
      if (n.gn) { try { n.gn.gain.cancelScheduledValues(0); } catch(e4) {} try { n.gn.disconnect(); } catch(e6) {} }
      if (n.src) try { n.src.stop(0); } catch(e2) {}
      if (n.s2) try { n.s2.stop(0); } catch(e3) {}
    } catch(e) {}
  }
  _notes = {};
  for (var ch in _chNodes) {
    _chNodes[ch].bendCents = 0; _chNodes[ch].modDepth = 0; _chNodes[ch]._cc11 = 127;
    if (_chNodes[ch].expr) {
      try { _chNodes[ch].expr.gain.cancelScheduledValues(0); } catch(e) {}
      _chNodes[ch].expr.gain.value = 1.0;
    }
    if (_chNodes[ch].revSend) { try { _chNodes[ch].revSend.disconnect(); } catch(e){} }
    if (_chNodes[ch].chrSend) { try { _chNodes[ch].chrSend.disconnect(); } catch(e){} }
  }
  // Kill effect tails by disconnecting output nodes from master
  if (_reverbOut) { try { _reverbOut.disconnect(); } catch(e){} _reverbOut = null; }
  if (_chorusOut) { try { _chorusOut.disconnect(); } catch(e){} _chorusOut = null; }
  _reverbBus = null; _chorusBus = null;
  // Rebuild fresh buses and reconnect
  initEffectBuses();
  for (var ch2 in _chNodes) {
    if (_chNodes[ch2].revSend && _reverbBus) { _chNodes[ch2].revSend.connect(_reverbBus); }
    if (_chNodes[ch2].chrSend && _chorusBus) { _chNodes[ch2].chrSend.connect(_chorusBus); }
  }
}


// === GM Drum Kits ===
// Kit ID matches GM program number on channel 10
// 0=Standard, 8=Room, 16=Power, 24=Electronic, 25=TR-808, 32=Jazz, 40=Brush, 48=Orchestra
var DRUM_KITS = {
  0:  {name:"Standard Kit",   kick:{f:160,d:.4,click:.25}, snare:{hp:2500,d:.18,body:.5}, hh:{f:9000,d:.06}, oh:{f:7500,d:.3}, crash:{f:5500,d:1.0}, ride:{f:6500,d:.4}, tom:{base:70,mul:18}},
  8:  {name:"Room Kit",       kick:{f:120,d:.5,click:.15}, snare:{hp:2000,d:.25,body:.6}, hh:{f:8000,d:.07}, oh:{f:7000,d:.35}, crash:{f:5000,d:1.2}, ride:{f:6000,d:.45}, tom:{base:65,mul:16}},
  16: {name:"Power Kit",      kick:{f:180,d:.45,click:.35}, snare:{hp:3000,d:.2,body:.7}, hh:{f:10000,d:.05}, oh:{f:8000,d:.28}, crash:{f:6000,d:.9}, ride:{f:7000,d:.35}, tom:{base:75,mul:20}},
  24: {name:"Electronic Kit", kick:{f:200,d:.35,click:.4}, snare:{hp:3500,d:.15,body:.3}, hh:{f:11000,d:.04}, oh:{f:9000,d:.2}, crash:{f:7000,d:.7}, ride:{f:8000,d:.3}, tom:{base:80,mul:22}},
  25: {name:"TR-808 Kit",     kick:{f:80,d:.6,click:.1}, snare:{hp:2000,d:.3,body:.4}, hh:{f:8500,d:.03}, oh:{f:7500,d:.15}, crash:{f:5000,d:1.5}, ride:{f:6000,d:.5}, tom:{base:60,mul:15}},
  32: {name:"Jazz Kit",       kick:{f:140,d:.35,click:.15}, snare:{hp:2200,d:.22,body:.45}, hh:{f:8500,d:.08}, oh:{f:7000,d:.35}, crash:{f:5000,d:1.1}, ride:{f:6200,d:.5}, tom:{base:68,mul:17}},
  40: {name:"Brush Kit",      kick:{f:130,d:.3,click:.1}, snare:{hp:1800,d:.3,body:.35}, hh:{f:7500,d:.09}, oh:{f:6500,d:.4}, crash:{f:4500,d:1.0}, ride:{f:5500,d:.55}, tom:{base:65,mul:16}},
  48: {name:"Orchestra Kit",  kick:{f:100,d:.55,click:.1}, snare:{hp:1500,d:.35,body:.6}, hh:{f:7000,d:.1}, oh:{f:6000,d:.45}, crash:{f:4000,d:1.5}, ride:{f:5000,d:.6}, tom:{base:55,mul:14}}
};
var DRUM_KIT_LIST = [0,8,16,24,25,32,40,48];

function getDrumKit(prog) {
  return DRUM_KITS[prog] || DRUM_KITS[0];
}

function playDrumSynth(mn, vel, kitProg) {
  var ctx = getCtx(); var t = ctx.currentTime; var v = (vel/127) * 0.55;
  var drumOut = getChNode(10).gain;
  var kit = getDrumKit(kitProg || 0);
  function mkN(dur) {
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf; return s;
  }
  if (mn === 35 || mn === 36) {
    var o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(kit.kick.f, t); o.frequency.exponentialRampToValueAtTime(38, t+0.12);
    var g = ctx.createGain(); g.gain.setValueAtTime(v*1.3, t); g.gain.exponentialRampToValueAtTime(0.001, t+kit.kick.d);
    o.connect(g); g.connect(drumOut); o.start(t); o.stop(t+kit.kick.d+0.05);
    var cl = ctx.createOscillator(); cl.type = "square"; cl.frequency.value = 800;
    var cg = ctx.createGain(); cg.gain.setValueAtTime(v*kit.kick.click, t); cg.gain.exponentialRampToValueAtTime(0.001, t+0.012);
    cl.connect(cg); cg.connect(drumOut); cl.start(t); cl.stop(t+0.02);
  } else if (mn === 38 || mn === 40) {
    var ns = mkN(kit.snare.d+0.05); var nf = ctx.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = kit.snare.hp;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(v*0.7, t); ng.gain.exponentialRampToValueAtTime(0.001, t+kit.snare.d);
    ns.connect(nf); nf.connect(ng); ng.connect(drumOut); ns.start(t);
    var bd = ctx.createOscillator(); bd.type = "triangle";
    bd.frequency.setValueAtTime(220, t); bd.frequency.exponentialRampToValueAtTime(110, t+0.04);
    var bg = ctx.createGain(); bg.gain.setValueAtTime(v*kit.snare.body, t); bg.gain.exponentialRampToValueAtTime(0.001, t+0.08);
    bd.connect(bg); bg.connect(drumOut); bd.start(t); bd.stop(t+0.12);
  } else if (mn === 42 || mn === 44) {
    var n2 = mkN(kit.hh.d+0.02); var hf = ctx.createBiquadFilter(); hf.type = "bandpass"; hf.frequency.value = kit.hh.f; hf.Q.value = 1.5;
    var hg = ctx.createGain(); hg.gain.setValueAtTime(v*0.35, t); hg.gain.exponentialRampToValueAtTime(0.001, t+kit.hh.d);
    n2.connect(hf); hf.connect(hg); hg.connect(drumOut); n2.start(t);
  } else if (mn === 46) {
    var n3 = mkN(kit.oh.d+0.05); var of2 = ctx.createBiquadFilter(); of2.type = "bandpass"; of2.frequency.value = kit.oh.f; of2.Q.value = 1;
    var og = ctx.createGain(); og.gain.setValueAtTime(v*0.4, t); og.gain.exponentialRampToValueAtTime(0.001, t+kit.oh.d);
    n3.connect(of2); of2.connect(og); og.connect(drumOut); n3.start(t);
  } else if (mn === 49 || mn === 57) {
    var n4 = mkN(kit.crash.d+0.1); var cf = ctx.createBiquadFilter(); cf.type = "bandpass"; cf.frequency.value = kit.crash.f; cf.Q.value = 0.6;
    var cg2 = ctx.createGain(); cg2.gain.setValueAtTime(v*0.5, t); cg2.gain.exponentialRampToValueAtTime(0.001, t+kit.crash.d);
    n4.connect(cf); cf.connect(cg2); cg2.connect(drumOut); n4.start(t);
  } else if (mn === 51 || mn === 53 || mn === 59) {
    var n5 = mkN(kit.ride.d+0.05); var rf = ctx.createBiquadFilter(); rf.type = "bandpass"; rf.frequency.value = kit.ride.f; rf.Q.value = 1.8;
    var rg = ctx.createGain(); rg.gain.setValueAtTime(v*0.3, t); rg.gain.exponentialRampToValueAtTime(0.001, t+kit.ride.d);
    n5.connect(rf); rf.connect(rg); rg.connect(drumOut); n5.start(t);
  } else if (mn === 37 || mn === 39) {
    var rs = ctx.createOscillator(); rs.type = "triangle"; rs.frequency.value = mn===37?850:1200;
    var rsg = ctx.createGain(); rsg.gain.setValueAtTime(v*0.4, t); rsg.gain.exponentialRampToValueAtTime(0.001, t+0.04);
    rs.connect(rsg); rsg.connect(drumOut); rs.start(t); rs.stop(t+0.06);
  } else if (mn >= 41 && mn <= 50 && mn !== 42 && mn !== 44 && mn !== 46 && mn !== 49) {
    var tf = kit.tom.base + (mn-41) * kit.tom.mul;
    var to = ctx.createOscillator(); to.type = "sine";
    to.frequency.setValueAtTime(tf*1.6, t); to.frequency.exponentialRampToValueAtTime(tf, t+0.04);
    var tg = ctx.createGain(); tg.gain.setValueAtTime(v*0.6, t); tg.gain.exponentialRampToValueAtTime(0.001, t+0.28);
    to.connect(tg); tg.connect(drumOut); to.start(t); to.stop(t+0.32);
  } else {
    var nd = mkN(0.1); var fd = ctx.createBiquadFilter(); fd.type = "bandpass"; fd.frequency.value = 800+mn*60; fd.Q.value = 2;
    var gd = ctx.createGain(); gd.gain.setValueAtTime(v*0.3, t); gd.gain.exponentialRampToValueAtTime(0.001, t+0.1);
    nd.connect(fd); fd.connect(gd); gd.connect(drumOut); nd.start(t);
  }
}

function synthClick(hi, when) {
  var ctx = getCtx(); var t = when || ctx.currentTime;
  var o = ctx.createOscillator(); var g = ctx.createGain();
  o.type = "sine"; o.frequency.value = hi ? 1500 : 1000;
  g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.05);
  o.connect(g); g.connect(_mg); o.start(t); o.stop(t+0.08);
}
function synthInit() { getCtx(); }

// Audio unlock for Safari/iOS: must happen from direct user gesture
// Bypasses iOS silent mode switch by playing audio through both WebAudio and HTML5 Audio
(function() {
  var unlocked = false;
  var silentUrl = null;
  // Create a proper 0.5s silent WAV file as a blob URL
  function getSilentUrl() {
    if (silentUrl) return silentUrl;
    var sr = 22050, dur = 0.5, ch = 1, bps = 16;
    var samples = Math.floor(sr * dur);
    var dataSize = samples * ch * (bps / 8);
    var buf = new ArrayBuffer(44 + dataSize);
    var v = new DataView(buf);
    // RIFF header
    v.setUint32(0, 0x52494646, false); // "RIFF"
    v.setUint32(4, 36 + dataSize, true);
    v.setUint32(8, 0x57415645, false); // "WAVE"
    // fmt chunk
    v.setUint32(12, 0x666d7420, false); // "fmt "
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); // PCM
    v.setUint16(22, ch, true);
    v.setUint32(24, sr, true);
    v.setUint32(28, sr * ch * (bps / 8), true);
    v.setUint16(32, ch * (bps / 8), true);
    v.setUint16(34, bps, true);
    // data chunk (all zeros = silence)
    v.setUint32(36, 0x64617461, false); // "data"
    v.setUint32(40, dataSize, true);
    silentUrl = URL.createObjectURL(new Blob([buf], {type: "audio/wav"}));
    return silentUrl;
  }
  function unlock() {
    if (unlocked) return;
    // HTML5 Audio play forces iOS audio session to "playback" category
    // This makes audio play through speaker even when silent mode switch is on
    try {
      var a = document.createElement("audio");
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");
      a.src = getSilentUrl();
      a.volume = 0.01;
      a.play().then(function(){
        setTimeout(function(){ try { a.pause(); a.remove(); } catch(e){} }, 600);
      }).catch(function(){});
    } catch(e) {}
    var ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "running") {
      unlocked = true;
      return;
    }
    ctx.resume().then(function() {
      try {
        // Play silent buffer through AudioContext to fully activate audio pipeline
        var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      } catch(e) {}
      unlocked = true;
    }).catch(function(){});
  }
  if (typeof document !== "undefined") {
    ["click","touchstart","touchend","keydown","mousedown"].forEach(function(evt) {
      document.addEventListener(evt, unlock, {capture:true, passive:true});
    });
  }
})();

// === RLE Decoder ===
function decRLE(s, p, need) {
  var o = new Uint8Array(need);
  var op = 0;
  while (op < need && p + 1 < s.length) {
    var h = s[p] | (s[p + 1] << 8);
    p += 2;
    var bs = h * 2;
    if (bs > 0x2000) { break; }
    if (bs === 0) { continue; }
    if (p + bs > s.length) { break; }
    var i = 0;
    while (i < bs && op < need) {
      var cnt = s[p + i];
      if (cnt === 0) {
        if (i + 3 > bs) { break; }
        cnt = s[p + i + 1] | (s[p + i + 2] << 8);
        i += 2;
      }
      if (i + 1 >= bs) { break; }
      var val = s[p + i + 1];
      i += 2;
      var end = Math.min(op + cnt, need);
      if (val) { for (var j = op; j < end; j++) { o[j] = val; } }
      op = end;
    }
    p += bs;
  }
  return { d: o, p: p };
}

// === RLE Encoder ===
function encRLE(data) {
  var chunks = [];
  var i = 0;
  while (i < data.length) {
    var pairs = [];
    var pb = 0;
    while (i < data.length && pb < 3900) {
      var val = data[i];
      var cnt = 0;
      while (i + cnt < data.length && data[i + cnt] === val && cnt < 255) { cnt++; }
      if (cnt === 0) { cnt = 1; }
      i += cnt;
      pairs.push(cnt, val);
      pb += 2;
    }
    var hdr = pb / 2;
    chunks.push(hdr & 0xFF, (hdr >> 8) & 0xFF);
    for (var k = 0; k < pairs.length; k++) { chunks.push(pairs[k]); }
  }
  return new Uint8Array(chunks);
}

// === Zlib ===
async function zDec(d) {
  var s = new DecompressionStream("deflate");
  var w = s.writable.getWriter();
  var r = s.readable.getReader();
  w.write(d);
  w.close();
  var ch = [];
  while (true) {
    var result = await r.read();
    if (result.done) { break; }
    ch.push(result.value);
  }
  var tot = ch.reduce(function(a, b) { return a + b.length; }, 0);
  var out = new Uint8Array(tot);
  var p = 0;
  for (var i = 0; i < ch.length; i++) { out.set(ch[i], p); p += ch[i].length; }
  return out;
}

async function zEnc(d) {
  // Use pako for zlib compression (guaranteed TBT-compatible)
  if (typeof pako !== 'undefined') {
    return pako.deflate(d);
  }
  // Fallback to CompressionStream if pako not loaded
  var s = new CompressionStream("deflate");
  var w = s.writable.getWriter();
  var r = s.readable.getReader();
  await w.write(d);
  await w.close();
  var ch = [];
  while (true) {
    var result = await r.read();
    if (result.done) { break; }
    ch.push(result.value);
  }
  var tot = ch.reduce(function(a, b) { return a + b.length; }, 0);
  var out = new Uint8Array(tot);
  var p = 0;
  for (var i = 0; i < ch.length; i++) { out.set(ch[i], p); p += ch[i].length; }
  return out;
}

// === TBT LOADER ===
async function loadTBT(ab) {
  var buf = new Uint8Array(ab);
  if (buf.length < 64 || String.fromCharCode(buf[0], buf[1], buf[2]) !== "TBT") {
    throw new Error("Not a TBT file");
  }
  var vb = buf[3];
  var ver = String.fromCharCode(vb);
  var tc = buf[5];
  var flags = buf[11];
  if (vb < 0x65 || vb > 0x72) { throw new Error("Unsupported version " + ver); }
  if (tc < 1 || tc > 15) { throw new Error("Bad track count " + tc); }
  var hasMeta = !!(flags & 1);
  var tempo = buf[4];
  if (vb >= 0x6F) {
    var tw = buf[34] | (buf[35] << 8);
    if (tw > 0 && tw <= 500) { tempo = tw; }
    // Also check bytes 46-47 (used when tempo > 255)
    var tw2 = buf[46] | (buf[47] << 8);
    if (tw2 > 0 && tw2 <= 500) { tempo = tw2; }
  }
  if (!tempo || tempo > 500) { tempo = 120; }

  var comp = buf.slice(64);
  var b1, b2;
  // Use header byte 48-51 for stream split
  var c1sz = buf[48] | (buf[49] << 8) | (buf[50] << 16) | ((buf[51] << 24) >>> 0);
  if (c1sz > 0 && c1sz < comp.length) {
    try {
      b1 = typeof pako !== 'undefined' ? pako.inflate(comp.slice(0, c1sz)) : await zDec(comp.slice(0, c1sz));
      b2 = typeof pako !== 'undefined' ? pako.inflate(comp.slice(c1sz)) : await zDec(comp.slice(c1sz));
    } catch (e) {
      console.warn("Header-based split failed, trying heuristic", e);
      c1sz = 0; // fall through to heuristic
    }
  }
  if (!c1sz || c1sz <= 0 || c1sz >= comp.length) {
    // Fallback: search for second zlib header
    var si = -1;
    for (var idx = 10; idx < comp.length - 1; idx++) {
      if (comp[idx] === 0x78 && [1, 0x5E, 0x9C, 0xDA].indexOf(comp[idx + 1]) >= 0) {
        si = idx; break;
      }
    }
    if (si > 0) {
      try {
        b1 = typeof pako !== 'undefined' ? pako.inflate(comp.slice(0, si)) : await zDec(comp.slice(0, si));
        b2 = typeof pako !== 'undefined' ? pako.inflate(comp.slice(si)) : await zDec(comp.slice(si));
      } catch (e2) {
        b1 = typeof pako !== 'undefined' ? pako.inflate(comp) : await zDec(comp);
        b2 = null;
      }
    } else {
      b1 = typeof pako !== 'undefined' ? pako.inflate(comp) : await zDec(comp);
      b2 = null;
    }
  }

  var d = b1;
  var p = 0;
  function rb() { return p < d.length ? d[p++] : 0; }
  function rbs() { var v = rb(); return v > 127 ? v - 256 : v; }
  function rw() { return rb() | (rb() << 8); }
  function rws() { var v = rw(); return v > 32767 ? v - 65536 : v; }
  function ru32() { return (rb() | (rb() << 8) | (rb() << 16) | ((rb() << 24) >>> 0)) >>> 0; }

  var mcs = [];
  if (vb >= 0x70) { for (var i = 0; i < tc; i++) { mcs.push(ru32()); } }

  var nsA = [];
  for (var i = 0; i < tc; i++) { nsA.push(rb() || 6); }
  var instB = [];
  for (var i = 0; i < tc; i++) { instB.push(rb()); }
  var vols = [];
  for (var i = 0; i < tc; i++) { vols.push(rb()); }
  var pansB = [];
  for (var i = 0; i < tc; i++) { pansB.push(rb()); }

  var mods = [], pbends = [];
  if (vb >= 0x71) {
    for (var i = 0; i < tc; i++) { mods.push(rb()); }    // modulation (0-127)
    for (var i = 0; i < tc; i++) { pbends.push(rws()); }  // pitch bend in cents
  }
  var trns = [];
  if (vb >= 0x6D) {
    for (var i = 0; i < tc; i++) { trns.push(rbs()); } // transpose: signed byte (-24 to +24)
    for (var i = 0; i < tc; i++) { rb(); } // transpose direction UI hint (unused - sign is in the value)
  }
  var revs = [], chors = [];
  if (vb >= 0x6C) {
    for (var i = 0; i < tc; i++) { revs.push(rb()); }   // reverb (0-127)
    for (var i = 0; i < tc; i++) { chors.push(rb()); }  // chorus (0-127)
  }
  var fK1 = [], fK2 = [];
  if (vb >= 0x6B) {
    for (var i = 0; i < tc; i++) { fK1.push(rb()); }
    for (var i = 0; i < tc; i++) { fK2.push(rb()); }
  }
  var hasCh = [], midiCh0 = [];
  if (vb >= 0x6A) {
    for (var i = 0; i < tc; i++) { hasCh.push(rb()); }
    for (var i = 0; i < tc; i++) { midiCh0.push(rbs()); }
  }
  var hasTopText = [], hasBottomText = [];
  for (var i = 0; i < tc; i++) { hasTopText.push(rb()); }
  for (var i = 0; i < tc; i++) { hasBottomText.push(rb()); }

  var tunSz = vb >= 0x6B ? 8 : 6;
  var tuns = [];
  for (var i = 0; i < tc; i++) {
    var raw = [];
    for (var j = 0; j < tunSz; j++) { raw.push(rb()); }
    var ns = nsA[i];
    var t = [];
    for (var j = 0; j < ns; j++) {
      var off = raw[j] > 127 ? raw[j] - 256 : raw[j];
      t.push(Math.max(0, Math.min(127, (j < 6 ? STD6[j] : 0) + off)));
    }
    tuns.push(t);
  }
  for (var i = 0; i < tc; i++) { rb(); }

  var title = "", artist = "", album = "", by = "", cr = "";
  if (hasMeta && vb >= 0x6D) {
    function rs() {
      var len = rw();
      if (!len || p + len > d.length) { return ""; }
      var s = new TextDecoder("latin1").decode(d.slice(p, p + len));
      p += len;
      return s;
    }
    title = rs(); artist = rs(); album = rs(); by = rs(); cr = rs();
  }

  if (mcs.length === 0) {
    var mc = vb >= 0x6F ? (buf[42] | (buf[43] << 8)) : 4000;
    for (var i = 0; i < tc; i++) { mcs.push(mc); }
  }
  var hdrMc = vb >= 0x70 ? (buf[40] | (buf[41] << 8)) : Math.ceil(mcs[0] / BPM);

  var tracks = [];
  for (var i = 0; i < tc; i++) {
    var inst = instB[i] & 0x7F;
    var mch = (hasCh.length && hasCh[i] && midiCh0.length) ? (midiCh0[i] + 1) : 0;
    if (mch === 0) {
      // Auto-assign: drums get 10, others skip 10
      var usedChs = {};
      for (var ci = 0; ci < tracks.length; ci++) usedChs[tracks[ci].midiChannel] = true;
      var isDrumGuess = (tuns[i] && tuns[i][0] === 0 && nsA[i] >= 4);
      if (isDrumGuess) { mch = 10; }
      else { for (var ch2 = 1; ch2 <= 16; ch2++) { if (ch2 !== 10 && !usedChs[ch2]) { mch = ch2; break; } } if (!mch) mch = i + 1; }
    }
    var isDrum = mch === 10;
    tracks.push({
      name: isDrum ? "Drums" : "Track " + (i + 1),
      numStrings: nsA[i], instrument: inst, isDrum: isDrum, midiChannel: mch,
      volume: pansB[i] !== undefined ? pansB[i] : 96,
      pan: fK1.length ? fK1[i] : 64,
      reverb: revs[i] || 0, chorus: chors[i] || 0,
      transpose: trns[i] || 0, capo: 0,
      pitchBend: pbends[i] || 0, modulation: mods[i] || 0,
      tuning: tuns[i],
      drumMidi: isDrum ? DMIDI.slice(0, nsA[i]) : null,
      drumLabels: isDrum ? DLBL.slice(0, nsA[i]) : null,
      muted: false, solo: false, letRing: !isDrum && !(instB[i] & 0x80), measures: [],
      hasTopText: !!hasTopText[i], hasBottomText: !!hasBottomText[i]
    });
  }

  var altBars = {};  // measureIdx -> bar type
  var altStaff = null; // measureIdx -> true if staff break
  var measBeats = []; // beats-per-measure array from alt-time
  var altFlags = []; // raw flags per measure
  var altExtra = []; // extra byte (repeat count) per measure
  if (b2 && b2.length > 4) {
    var bp = 0;
    if (vb >= 0x70) {
      var ats = hdrMc * 6;
      if (bp + ats <= b2.length) {
        for (var mi = 0; mi < hdrMc; mi++) {
          var atBeats = b2[bp+mi*6]|(b2[bp+mi*6+1]<<8)|(b2[bp+mi*6+2]<<16)|(b2[bp+mi*6+3]<<24);
          var fl = b2[bp + mi * 6 + 4];
          var atEx = b2[bp + mi * 6 + 5];
          measBeats.push(atBeats || BPM);
          altFlags.push(fl);
          altExtra.push(atEx);
          // Flags describe the LEFT bar of measure mi:
          // bit1=repeatStart → this measure starts with repeat open
          // bit2=repeatEnd → this measure ends with repeat close  
          // bit0=staffBreak/double → LEFT bar of this measure = RIGHT bar of previous measure
          if ((fl & 4) && (fl & 2)) { altBars[mi] = "repeatBoth"; altExtra[mi] = atEx || 2; }
          else if (fl & 4) { altBars[mi] = "repeatEnd"; altExtra[mi] = atEx || 2; }
          else if (fl & 2) { altBars[mi] = "repeatStart"; }
          if ((fl & 1) && !(fl & 4) && !(fl & 2)) {
            var dbMi = mi > 0 ? mi - 1 : mi;
            if (!altBars[dbMi] || altBars[dbMi] === "single") { altBars[dbMi] = "double"; }
          }
          if (fl & 1) { if (!altStaff) altStaff = {}; altStaff[mi > 0 ? mi - 1 : mi] = true; }
        }
        bp += ats;
      }
    } else {
      var atResult = decRLE(b2, bp, mcs[0]);
      bp = atResult.p;
      // For version < 'p': one byte per beat position, lower nibble = bar type
      // Check ALL positions, not just beat 15
      var numMeasOld = Math.ceil(mcs[0] / BPM);
      for (var mi3 = 0; mi3 < numMeasOld; mi3++) {
        measBeats.push(BPM);
        altFlags.push(0);
        altExtra.push(0);
      }
      for (var pi = 0; pi < atResult.d.length; pi++) {
        var btype = atResult.d[pi] & 0xF;
        var upperNib = atResult.d[pi] >> 4;
        if (!btype) continue;
        var measIdx = Math.floor(pi / BPM);
        var beatIdx = pi % BPM;
        if (btype === 3 && beatIdx === 0) {
          // Type 3 at beat 0 = repeat OPEN on this measure (no close on previous)
          altBars[measIdx] = "repeatStart";
        } else if (btype === 3 && beatIdx === BPM - 1) {
          // Type 3 at beat 15 = bar line marker (no repeat significance)
        } else if (btype === 2) {
          // Type 2 = repeat CLOSE with count in upper nibble
          if (altBars[measIdx] === "repeatStart") {
            altBars[measIdx] = "repeatBoth"; // open at beat 0 + close at beat 15
          } else {
            altBars[measIdx] = "repeatEnd";
          }
          altExtra[measIdx] = upperNib ? upperNib + 1 : 2;
          console.log("[PARSE] repeatEnd at M" + measIdx + "." + beatIdx + " count=" + altExtra[measIdx]);
        } else if (btype === 4) {
          altBars[measIdx] = "double";
        }
        // btype === 1 = normal bar line marker, not a repeat; ignore
      }
    }

    // PHASE 1: Decode all note data into flat arrays
    var allNoteData = [];
    for (var ti = 0; ti < tc; ti++) {
      var tot = mcs[ti] * 20;
      var nr = decRLE(b2, bp, tot);
      bp = nr.p;
      allNoteData.push(nr.d);
    }

    // PHASE 2: Decode per-track ATR data if hasAltNotes (bit 4)
    // Format: 2 bytes per position (N, D) = N notes in space of D global beats
    // RLE decodes mcs[ti]*2 bytes per track
    var trackATR = []; // trackATR[ti] = array of {n, d} per position, or null
    if (flags & 0x10) {
      for (var ati = 0; ati < tc; ati++) {
        if (bp >= b2.length) { trackATR.push(null); continue; }
        var atrDec = decRLE(b2, bp, mcs[ati] * 2);
        bp = atrDec.p;
        var atrPairs = [];
        var hasReal = false;
        for (var api = 0; api < mcs[ati]; api++) {
          var an = atrDec.d[api*2] || 0, ad = atrDec.d[api*2+1] || 0;
          atrPairs.push({n: an, d: ad});
          if (an >= 1 && ad >= 1 && ad > an) hasReal = true;
        }
        trackATR.push(hasReal ? atrPairs : null);
        if (hasReal) {
          var cnt = atrPairs.filter(function(p){return p.d > p.n;}).length;
          console.log("[ATR] Track " + ati + ": " + cnt + " tuplet positions");
        }
      }
    }

    // PHASE 2.5: Parse separate track effect stream (after notes+ATR)
    // Format per track: [u32 byteCount] then records of [u16 deltaPos, u16 typeIdx, u16 numValues, u8*numValues]
    // Type indices: 0=?,1=D,2=U,3=T(Tempo),4=I(Instrument),5=V(Volume),6=P(Pan),7=C,8=R,9=M(Mod),10=B(Bend)
    var ETYPE_MAP = {0:63,1:68,2:85,3:84,4:73,5:86,6:80,7:67,8:82,9:77,10:66};
    var trackEffectEvents = []; // trackEffectEvents[ti] = {pos: {type, value, ...}}
    for (var tei = 0; tei < tc; tei++) {
      var efxMap = {};
      if (bp + 4 <= b2.length) {
        var efxBytes = b2[bp]|(b2[bp+1]<<8)|(b2[bp+2]<<16)|(b2[bp+3]<<24); bp += 4;
        if (efxBytes > 0 && bp + efxBytes <= b2.length) {
          var efxEnd = bp + efxBytes;
          var absPos = 0;
          while (bp + 6 <= efxEnd) {
            var deltaPos = b2[bp]|(b2[bp+1]<<8); bp += 2;
            var typeIdx = b2[bp]|(b2[bp+1]<<8); bp += 2;
            var numVals = b2[bp]|(b2[bp+1]<<8); bp += 2;
            if (bp + numVals > efxEnd) break;
            absPos += deltaPos;
            var eChar = ETYPE_MAP[typeIdx] || 0;
            var vals = [];
            for (var vi2 = 0; vi2 < numVals; vi2++) { vals.push(b2[bp++]); }
            if (eChar) {
              var efxObj = { type: eChar, value: vals[0] || 0 };
              if (eChar === 73) { // Instrument: value byte has inst|letRing in bit 7
                efxObj.value = vals[0] & 0x7F;
                efxObj.letRing = !(vals[0] & 0x80);
              }
              if (eChar === 84 && vals.length >= 2) { // Tempo: 16-bit value (supports > 255 BPM)
                efxObj.value = vals[0] | (vals[1] << 8);
              }
              if (eChar === 66 && vals.length >= 2) { // Pitch bend: 16-bit value
                efxObj.raw16 = vals[0] | (vals[1] << 8);
                efxObj.value = efxObj.raw16;
              }
              if (!efxMap[absPos]) efxMap[absPos] = efxObj;
              else {
                if (!efxMap[absPos].multi) efxMap[absPos].multi = [];
                efxMap[absPos].multi.push(efxObj);
              }
            }
          }
          bp = efxEnd; // ensure we're past this track's data
          var efxCount = Object.keys(efxMap).length;
          if (efxCount > 0) console.log("[FX] Track " + tei + ": " + efxCount + " effect positions from stream");
        }
      }
      trackEffectEvents.push(efxMap);
    }

    // PHASE 3: Build measures per track
    for (var ti = 0; ti < tc; ti++) {
      var nd = allNoteData[ti];
      var trk = tracks[ti];
      var ns2 = trk.numStrings;
      var atr = trackATR[ti] || null;
      var notePos = 0;

      var efxEvents = trackEffectEvents[ti] || {};

      function parseNote(np) {
        var notes = new Array(ns2).fill(null);
        var trkEffect = null;
        var topChar = 0, botChar = 0;
        if (np < mcs[ti]) {
          var off2 = np * 20;
          for (var si = 0; si < ns2; si++) {
            var fb = nd[off2 + si];
            if (fb === 0) continue;
            if (fb >= 128) notes[si] = { fret: fb-128, attack:true, effect: normalizeEfx(nd[off2+8+si]) };
            else if (fb === 17) notes[si] = { fret:-1, attack:true, effect: normalizeEfx(nd[off2+8+si]), muted:true };
            else if (fb === 18) notes[si] = { fret:-2, attack:true, effect: normalizeEfx(nd[off2+8+si]), stop:true };
            else if (fb >= 15) notes[si] = { fret:fb, attack:false, effect: normalizeEfx(nd[off2+8+si]) };
          }
          // Inline track effect (from note data bytes 16/19)
          var etype = nd[off2 + 16], evalue = nd[off2 + 19];
          if (etype) { trkEffect = { type: etype, value: evalue }; }
          topChar = nd[off2 + 17];
          botChar = nd[off2 + 18];
        }
        // Overlay effects from separate effect stream (takes priority)
        if (efxEvents[np]) {
          if (!trkEffect) trkEffect = efxEvents[np];
          else {
            if (!trkEffect.multi) trkEffect.multi = [];
            trkEffect.multi.push(efxEvents[np]);
            if (efxEvents[np].multi) {
              for (var me = 0; me < efxEvents[np].multi.length; me++) trkEffect.multi.push(efxEvents[np].multi[me]);
            }
          }
        }
        return { notes: notes, trkEffect: trkEffect, topChar: topChar, botChar: botChar };
      }

      for (var mi2 = 0; mi2 < hdrMc; mi2++) {
        var globalBpm = (mi2 < measBeats.length) ? measBeats[mi2] : BPM;
        var beats = [];
        var globalBeatsUsed = 0;

        while (globalBeatsUsed < globalBpm && notePos < mcs[ti]) {
          var atrN = 1, atrD = 1;
          if (atr && notePos < atr.length) {
            atrN = atr[notePos].n || 1;
            atrD = atr[notePos].d || 1;
          }
          if (atrD > atrN && atrD <= 16) {
            for (var sub = 0; sub < atrD && notePos < mcs[ti]; sub++) {
              var parsed = parseNote(notePos);
              var b = { notes: parsed.notes, atrGroup: atrD, atrNum: atrN };
              if (parsed.trkEffect) b.trkEffect = parsed.trkEffect;
              if (parsed.topChar) b.topChar = parsed.topChar;
              if (parsed.botChar) b.botChar = parsed.botChar;
              beats.push(b);
              notePos++;
            }
            globalBeatsUsed += atrN;
          } else {
            var parsed2 = parseNote(notePos);
            var bt2 = { notes: parsed2.notes };
            if (parsed2.trkEffect) bt2.trkEffect = parsed2.trkEffect;
            if (parsed2.topChar) bt2.topChar = parsed2.topChar;
            if (parsed2.botChar) bt2.botChar = parsed2.botChar;
            beats.push(bt2);
            notePos++;
            globalBeatsUsed++;
          }
        }

        var barType = altBars[mi2] || "single";
        var repeatCount = 0;
        if (barType === "repeatEnd" || barType === "repeatBoth") {
          repeatCount = altExtra[mi2] || 2;
        }
        var isATR = beats.length !== globalBpm;
        var hasStaffBreak = !!(altStaff && altStaff[mi2]);
        trk.measures.push({ beats: beats, barLine: barType, beatsPerMeasure: beats.length,
          globalBeatsPerMeasure: globalBpm, isATR: isATR, repeatCount: repeatCount, staffBreak: hasStaffBreak });
      }
    }

    // Version >= 'q' (0x71): per-track effect blocks stored AFTER note+ATR data
    // Format: 4-byte block size, then entries of [2B pos_offset, 2B type, 2B payload_size, payload...]
    // Effect types: 1=T(tempo), 2=I(instrument), 3=V(volume), 4=P(pan), 5=C(chorus), 6=R(reverb), 7=M, 8=B, 10=pitch bend
    if (vb >= 0x71 && bp < b2.length) {
      var ETYPES = {0:63,1:68,2:85,3:84,4:73,5:86,6:80,7:67,8:82,9:77,10:66}; // index -> ASCII: ?DUTIVCRMB
      for (var eti = 0; eti < tc; eti++) {
        if (bp + 4 > b2.length) break;
        var blkSz = b2[bp]|(b2[bp+1]<<8)|(b2[bp+2]<<16)|(b2[bp+3]<<24); bp += 4;
        if (blkSz === 0 || bp + blkSz > b2.length) { bp += Math.min(blkSz, b2.length - bp); continue; }
        var blk = b2.slice(bp, bp + blkSz); bp += blkSz;
        var etrk = tracks[eti];
        var ep = 0, ePos = 0;
        while (ep + 6 <= blk.length) {
          var posOff = blk[ep]|(blk[ep+1]<<8);
          var eTypeIdx = blk[ep+2]|(blk[ep+3]<<8);
          var dSz = blk[ep+4]|(blk[ep+5]<<8);
          ep += 6; ePos += posOff;
          if (ep + dSz > blk.length) break;
          var payload = blk.slice(ep, ep + dSz); ep += dSz;
          // Find the beat at this position
          var eVal = (payload.length >= 1) ? payload[0] : 0;
          var eVal16 = (payload.length >= 2) ? (payload[0]|(payload[1]<<8)) : eVal;
          var eMi = 0, eBi = ePos, cumB = 0;
          for (var emi = 0; emi < etrk.measures.length; emi++) {
            if (cumB + etrk.measures[emi].beats.length > ePos) { eMi = emi; eBi = ePos - cumB; break; }
            cumB += etrk.measures[emi].beats.length;
          }
          if (eMi < etrk.measures.length && eBi < etrk.measures[eMi].beats.length) {
            var eChar = ETYPES[eTypeIdx] || 63; // 63='?'
            var existFx = etrk.measures[eMi].beats[eBi].trkEffect;
            if (!existFx) {
              etrk.measures[eMi].beats[eBi].trkEffect = { type: eChar, value: eVal, raw16: eVal16 };
            } else {
              // Multiple effects: append to array
              if (!existFx.multi) existFx.multi = [];
              existFx.multi.push({ type: eChar, value: eVal, raw16: eVal16 });
            }
          }
        }
      }
    }
  } else {
    for (var ti = 0; ti < tc; ti++) {
      for (var mi = 0; mi < 32; mi++) {
        var beats = [];
        for (var bi = 0; bi < BPM; bi++) {
          beats.push({ notes: new Array(tracks[ti].numStrings).fill(null) });
        }
        tracks[ti].measures.push({ beats: beats, barLine: "single" });
      }
    }
  }

  return {
    title: title || "Untitled", artist: artist, album: album,
    transcribedBy: by, copyright: cr, tempo: tempo,
    tracks: tracks, ver: ver, vb: vb, hdrMc: hdrMc, mcs: mcs
  };
}

// === MIDI EXPORT ===
function buildMidi(song, selTracks) {
  var PPQ = 96; // ticks per quarter note
  var TPBEAT = PPQ / 4; // ticks per 16th note = 24

  function vlq(val) {
    if (val < 0) val = 0;
    var bytes = [val & 0x7F];
    val >>>= 7;
    while (val > 0) { bytes.unshift((val & 0x7F) | 0x80); val >>>= 7; }
    return bytes;
  }
  function strBytes(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xFF);
    return out;
  }
  function u16be(v) { return [(v >> 8) & 0xFF, v & 0xFF]; }
  function u32be(v) { return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF]; }

  // Convert absolute-tick event list to delta-tick MIDI track chunk
  function buildTrackChunk(absEvents) {
    // Sort by tick, then note-offs before note-ons at same tick
    absEvents.sort(function(a, b) {
      if (a.tick !== b.tick) return a.tick - b.tick;
      var aOff = (a.data[0] & 0xF0) === 0x80 ? 0 : 1;
      var bOff = (b.data[0] & 0xF0) === 0x80 ? 0 : 1;
      return aOff - bOff;
    });
    var data = [];
    var lastTick = 0;
    for (var i = 0; i < absEvents.length; i++) {
      var ev = absEvents[i];
      var dt = Math.max(0, ev.tick - lastTick);
      data = data.concat(vlq(dt));
      data = data.concat(ev.data);
      lastTick = ev.tick;
    }
    // End of track
    data = data.concat(vlq(0));
    data = data.concat([0xFF, 0x2F, 0x00]);
    var chunk = [0x4D, 0x54, 0x72, 0x6B]; // "MTrk"
    chunk = chunk.concat(u32be(data.length));
    chunk = chunk.concat(data);
    return chunk;
  }

  // Track 0: tempo map + time signature + song title
  var t0 = [];
  if (song.title) {
    var tb = strBytes(song.title);
    t0.push({ tick: 0, data: [0xFF, 0x03].concat(vlq(tb.length)).concat(tb) });
  }
  t0.push({ tick: 0, data: [0xFF, 0x58, 0x04, song.tracks[0].measures[0] && song.tracks[0].measures[0].timeSig ? song.tracks[0].measures[0].timeSig.num : 0x04, song.tracks[0].measures[0] && song.tracks[0].measures[0].timeSig ? Math.round(Math.log2(song.tracks[0].measures[0].timeSig.den)) : 0x02, 0x18, 0x08] }); // time sig
  var usPerQ = Math.round(60000000 / (song.tempo || 120));
  t0.push({ tick: 0, data: [0xFF, 0x51, 0x03, (usPerQ >> 16) & 0xFF, (usPerQ >> 8) & 0xFF, usPerQ & 0xFF] });

  // Scan first track for tempo and time signature changes, add to track 0
  for (var sti = 0; sti < selTracks.length; sti++) {
    var trkScan = song.tracks[selTracks[sti]];
    var scanMeasStart = 0;
    var prevTsN = 0, prevTsD = 0;
    for (var smi = 0; smi < trkScan.measures.length; smi++) {
      var sm = trkScan.measures[smi];
      var sgbpm = sm.globalBeatsPerMeasure || 16;
      // Time signature change at measure boundary
      var smTs = sm.timeSig || {num:4,den:4};
      if (smi > 0 && (smTs.num !== prevTsN || smTs.den !== prevTsD)) {
        t0.push({ tick: scanMeasStart, data: [0xFF, 0x58, 0x04, smTs.num, Math.round(Math.log2(smTs.den)), 0x18, 0x08] });
      }
      prevTsN = smTs.num; prevTsD = smTs.den;
      var sfrac = 0;
      for (var sbi = 0; sbi < sm.beats.length; sbi++) {
        var sbt = sm.beats[sbi];
        var sgc = 1;
        if (sbt && sbt.atrGroup && sbt.atrGroup > 1) sgc = (sbt.atrNum || 1) / sbt.atrGroup;
        var scanTick = scanMeasStart + Math.round(sfrac * TPBEAT);
        if (sbt && sbt.trkEffect) {
          var addTempo = function(fx) {
            if (fx.type === 84 && fx.value >= 30 && fx.value <= 500) {
              var us2 = Math.round(60000000 / fx.value);
              t0.push({ tick: scanTick, data: [0xFF, 0x51, 0x03, (us2 >> 16) & 0xFF, (us2 >> 8) & 0xFF, us2 & 0xFF] });
            }
          };
          addTempo(sbt.trkEffect);
          if (sbt.trkEffect.multi) sbt.trkEffect.multi.forEach(addTempo);
        }
        sfrac += sgc;
      }
      scanMeasStart += sgbpm * TPBEAT;
    }
    break; // Only scan first selected track for tempo
  }

  // Section markers (0xFF 06) on track 0
  if (song.sections && song.sections.length > 0 && selTracks.length > 0) {
    var refTrk = song.tracks[selTracks[0]];
    var secMeasTick = 0;
    var secMeasIdx = 0;
    for (var sci = 0; sci < song.sections.length; sci++) {
      var sec = song.sections[sci];
      // Advance tick to section's bar
      while (secMeasIdx < sec.bar && secMeasIdx < refTrk.measures.length) {
        var smg = (refTrk.measures[secMeasIdx].globalBeatsPerMeasure || 16) * TPBEAT;
        secMeasTick += smg;
        secMeasIdx++;
      }
      if (sec.name) {
        var sb2 = strBytes(sec.name);
        t0.push({ tick: secMeasTick, data: [0xFF, 0x06].concat(vlq(sb2.length)).concat(sb2) });
      }
    }
  }

  // MIDI header
  var numTracks = 1 + selTracks.length;
  var allChunks = [0x4D, 0x54, 0x68, 0x64]; // "MThd"
  allChunks = allChunks.concat(u32be(6));
  allChunks = allChunks.concat(u16be(1)); // format 1
  allChunks = allChunks.concat(u16be(numTracks));
  allChunks = allChunks.concat(u16be(PPQ));
  allChunks = allChunks.concat(buildTrackChunk(t0));

  // Build note tracks
  for (var sti2 = 0; sti2 < selTracks.length; sti2++) {
    var ti = selTracks[sti2];
    var trk = song.tracks[ti];
    var ch = (trk.midiChannel || 1) - 1; // 0-indexed
    var ev = [];

    // Track name
    var tn = strBytes(trk.name || ("Track " + (ti + 1)));
    ev.push({ tick: 0, data: [0xFF, 0x03].concat(vlq(tn.length)).concat(tn) });

    // TabKit track header (Sequencer-Specific meta: 0xFF 0x7F)
    // Format: "TK" + type(0x01) + ver(0x01) + numStrings + isDrum + capo + transpose + instrument + bank + [tuning...]
    var tkHdr = [0x54, 0x4B, 0x01, 0x01, trk.numStrings, trk.isDrum?1:0, trk.capo||0, (trk.transpose||0)&0xFF, trk.instrument&0x7F, (trk.bank||0)&0x7F];
    for (var thi = 0; thi < trk.numStrings; thi++) tkHdr.push((trk.tuning[thi]||0) & 0x7F);
    if (trk.hasTopText) tkHdr.push(0x01); else tkHdr.push(0x00);
    if (trk.hasBottomText) tkHdr.push(0x01); else tkHdr.push(0x00);
    if (trk.letRing) tkHdr.push(0x01); else tkHdr.push(0x00);
    ev.push({ tick: 0, data: [0xFF, 0x7F].concat(vlq(tkHdr.length)).concat(tkHdr) });

    // Program change
    ev.push({ tick: 0, data: [0xC0 | ch, trk.instrument & 0x7F] });

    // Pitch bend range RPN = 24 semitones
    ev.push({ tick: 0, data: [0xB0 | ch, 101, 0] });
    ev.push({ tick: 0, data: [0xB0 | ch, 100, 0] });
    ev.push({ tick: 0, data: [0xB0 | ch, 6, 24] });
    ev.push({ tick: 0, data: [0xB0 | ch, 38, 0] });
    ev.push({ tick: 0, data: [0xB0 | ch, 101, 127] });
    ev.push({ tick: 0, data: [0xB0 | ch, 100, 127] });

    // Initial controllers
    ev.push({ tick: 0, data: [0xB0 | ch, 7, trk.volume !== undefined ? trk.volume : 96] });
    ev.push({ tick: 0, data: [0xB0 | ch, 10, trk.pan !== undefined ? trk.pan : 64] });
    if (trk.modulation) ev.push({ tick: 0, data: [0xB0 | ch, 1, trk.modulation & 0x7F] });
    if (trk.reverb) ev.push({ tick: 0, data: [0xB0 | ch, 91, trk.reverb & 0x7F] });
    if (trk.chorus) ev.push({ tick: 0, data: [0xB0 | ch, 93, trk.chorus & 0x7F] });
    var initExprVal = trk.trackExpression !== undefined ? trk.trackExpression : 127;
    if (initExprVal !== 127) ev.push({ tick: 0, data: [0xB0 | ch, 11, initExprVal & 0x7F] });
    if (trk.pitchBend) {
      var bv0 = Math.round(8192 + (trk.pitchBend / 2400) * 8192);
      bv0 = Math.max(0, Math.min(16383, bv0));
      ev.push({ tick: 0, data: [0xE0 | ch, bv0 & 0x7F, (bv0 >> 7) & 0x7F] });
    }

    // Process all beats - use measure-anchored timing to prevent ATR drift
    var measStartTick = 0;
    var activeNotes = {}; // stringIdx -> {midi}
    var midiRingFlags = {}; // stringIdx -> true if note has indefinite ring
    var midiHammer = {}; // stringIdx -> true if next note should have reduced velocity
    var midiChBend = 8192; // current channel pitch bend (center = 8192, set by track effects)
    var midiSuppress = {}; // stringIdx -> true if next note is suppressed (bend/slide destination)

    for (var mi = 0; mi < trk.measures.length; mi++) {
      var meas = trk.measures[mi];
      var globalBpm = meas.globalBeatsPerMeasure || 16;
      var measTicks = globalBpm * TPBEAT; // exact ticks for this measure
      var fracPos = 0; // fractional position within measure (0 to globalBpm)

      // TabKit measure header: "TK" + type(0x03) + measureIdx(u16) + beatsPerMeasure + globalBPM + isATR + timeSigNum + timeSigDen + barLine + repeatCount
      var tkMeas = [0x54, 0x4B, 0x03, (mi>>8)&0xFF, mi&0xFF,
        (meas.beatsPerMeasure||16)&0xFF, globalBpm&0xFF,
        meas.isATR?1:0,
        meas.timeSig?(meas.timeSig.num||4):4, meas.timeSig?(meas.timeSig.den||4):4,
        meas.barLine==="double"?1:meas.barLine==="final"?2:0,
        meas.repeatStart?1:0, meas.repeatEnd?1:0, (meas.repeatCount||0)&0xFF];
      ev.push({ tick: measStartTick, data: [0xFF, 0x7F].concat(vlq(tkMeas.length)).concat(tkMeas) });

      for (var bi = 0; bi < meas.beats.length; bi++) {
        var beat = meas.beats[bi];
        var gCost = 1;
        if (beat && beat.atrGroup && beat.atrGroup > 1) gCost = (beat.atrNum || 1) / beat.atrGroup;
        var curTick = measStartTick + Math.round(fracPos * TPBEAT);
        var beatTicks = Math.round(gCost * TPBEAT);

        if (!beat) { fracPos += gCost; continue; }

        // Top text → Lyrics meta (0xFF 05), Bottom text → Text meta (0xFF 01)
        if (trk.hasTopText && beat.topChar && beat.topChar >= 32 && beat.topChar < 127) {
          var lyB = [beat.topChar & 0x7F];
          ev.push({ tick: curTick, data: [0xFF, 0x05].concat(vlq(lyB.length)).concat(lyB) });
        }
        if (trk.hasBottomText && beat.botChar && beat.botChar >= 32 && beat.botChar < 127) {
          var txB = [beat.botChar & 0x7F];
          ev.push({ tick: curTick, data: [0xFF, 0x01].concat(vlq(txB.length)).concat(txB) });
        }

        // Track effects
        if (beat.trkEffect) {
          var addFx = function(fx) {
            if (fx.type === 86) {
              ev.push({ tick: curTick, data: [0xB0 | ch, 7, fx.value & 0x7F] });
            } else if (fx.type === 73) {
              ev.push({ tick: curTick, data: [0xC0 | ch, fx.value & 0x7F] });
            } else if (fx.type === 80) {
              ev.push({ tick: curTick, data: [0xB0 | ch, 10, fx.value & 0x7F] });
            } else if (fx.type === 77) {
              ev.push({ tick: curTick, data: [0xB0 | ch, 1, fx.value & 0x7F] });
            } else if (fx.type === 69) {
              ev.push({ tick: curTick, data: [0xB0 | ch, 11, fx.value & 0x7F] });
            } else if (fx.type === 82) {
              ev.push({ tick: curTick, data: [0xB0 | ch, 91, fx.value & 0x7F] });
            } else if (fx.type === 67) {
              ev.push({ tick: curTick, data: [0xB0 | ch, 93, fx.value & 0x7F] });
            } else if (fx.type === 66) {
              var raw = fx.raw16 || 0;
              var signed = raw > 32767 ? raw - 65536 : raw;
              var bv = Math.round(8192 + (signed / 2400) * 8192);
              bv = Math.max(0, Math.min(16383, bv));
              midiChBend = bv;
              ev.push({ tick: curTick, data: [0xE0 | ch, bv & 0x7F, (bv >> 7) & 0x7F] });
            } else if (fx.type === 200) {
              trk.trackVelocity = fx.value;
            } else if (fx.type === 201) {
              trk.delayOn = fx.delayOn; trk.delayTime = fx.delayTime; trk.delayTaps = fx.delayTaps; trk.delayMix = fx.delayMix;
            } else if (fx.type === 202) {
              trk.octOn = fx.octOn; trk.octShift = fx.octShift; trk.octDry = fx.octDry; trk.octMix = fx.octMix;
            } else if (fx.type === 204) {
              trk.tremOn = fx.tremOn; trk.tremSpeed = fx.tremSpeed; trk.tremDepth = fx.tremDepth;
            }
          };
          addFx(beat.trkEffect);
          if (beat.trkEffect.multi) beat.trkEffect.multi.forEach(addFx);
        }

        // Kill previous notes for non-letRing, non-drum tracks
        if (!trk.letRing && !trk.isDrum) {
          var hasAtt = false;
          for (var si = 0; si < (beat.notes ? beat.notes.length : 0); si++) {
            if (beat.notes[si] && beat.notes[si].attack && !beat.notes[si].stop) hasAtt = true;
          }
          if (hasAtt) {
            for (var ki in activeNotes) {
              if (activeNotes.hasOwnProperty(ki)) {
                // Skip strings with indefinite ring flag (including shimmer/12s for that string)
                var baseKi = ki;
                if (typeof ki === "string" && ki.indexOf("_") >= 0) baseKi = ki.substring(ki.indexOf("_") + 1);
                if (midiRingFlags[baseKi]) continue;
                ev.push({ tick: curTick, data: [0x80 | ch, activeNotes[ki].midi, 64] });
                delete activeNotes[ki];
              }
            }
          }
        }

        // TabKit beat string map (Sequencer-Specific: enables lossless MIDI round-trip)
        // Format: "TK" + type(0x02) + measureIdx(u16) + beatIdx(u8) + count + [stringIdx, fret, effect, flags]...
        var tkBeatMap = [0x54, 0x4B, 0x02, (mi>>8)&0xFF, mi&0xFF, bi&0xFF];
        var tkBeatCount = 0;
        for (var tksi = 0; tksi < (beat.notes ? beat.notes.length : 0); tksi++) {
          var tkn = beat.notes[tksi]; if (!tkn) continue;
          var tkFlags = 0;
          if (tkn.attack) tkFlags |= 0x01;
          if (tkn.stop) tkFlags |= 0x02;
          if (tkn.muted) tkFlags |= 0x04;
          if (tkn.techniqueOnly) tkFlags |= 0x08;
          if (tkn.vibratoOnly) tkFlags |= 0x10;
          if (tkn.ring) tkFlags |= 0x20;
          if (tkn.bendHold) tkFlags |= 0x40;
          tkBeatMap.push(tksi, (tkn.fret||0)&0x7F, (tkn.effect||0)&0x7F, tkFlags);
          tkBeatCount++;
        }
        if (tkBeatCount > 0) {
          tkBeatMap.splice(6, 0, tkBeatCount);
          // Add topChar/botChar if present
          if (beat.topChar) { tkBeatMap.push(0xF0, beat.topChar & 0x7F); }
          if (beat.botChar) { tkBeatMap.push(0xF1, beat.botChar & 0x7F); }
          ev.push({ tick: curTick, data: [0xFF, 0x7F].concat(vlq(tkBeatMap.length)).concat(tkBeatMap) });
        }

        // Process notes
        for (var si2 = 0; si2 < (beat.notes ? beat.notes.length : 0); si2++) {
          var note = beat.notes[si2];
          // Technique-only marker: apply to active note
          if (note && (note.techniqueOnly || note.vibratoOnly)) {
            if (note.effect === 126) {
              ev.push({tick:curTick, data:[0xB0|ch, 1, 60]});
              ev.push({tick:curTick + beatTicks, data:[0xB0|ch, 1, trk.modulation!==undefined?trk.modulation:0]});
            }
            // Delayed bend/slide in MIDI: simplified pitch bend ramp
            if (note.effect === 98 || note.effect === 47 || note.effect === 92) {
              var dLk=null,dDst=0;
              for(var dlmi=mi;dlmi<trk.measures.length&&!dLk;dlmi++){
                var dlS=(dlmi===mi)?bi+1:0;
                for(var dlbi=dlS;dlbi<trk.measures[dlmi].beats.length;dlbi++){
                  dDst++;var dln=trk.measures[dlmi].beats[dlbi].notes[si2];
                  if(dln&&dln.attack&&!dln.stop&&!dln.muted){dLk={midi:(trk.tuning[si2]||40)+dln.fret+(trk.transpose||0),dist:dDst};break;}
                }
              }
              if(dLk && activeNotes[si2]){
                var dSO=dLk.midi-activeNotes[si2].midi,dBO=midiChBend-8192;
                var dET=curTick+beatTicks*dLk.dist;
                var dV=Math.max(0,Math.min(16383,8192+Math.round(dSO*100*8192/200)+dBO));
                ev.push({tick:dET,data:[0xE0|ch,dV&0x7F,(dV>>7)&0x7F]});
                ev.push({tick:dET,data:[0xE0|ch,midiChBend&0x7F,(midiChBend>>7)&0x7F]});
                midiSuppress[si2]=(midiSuppress[si2]||0)+1;
              }
            }
            continue;
          }
          if (!note || !note.attack) continue;
          // Forward suppress: note is destination in a bend/slide/release chain
          if (!midiSuppress) midiSuppress = {};
          if (midiSuppress[si2] > 0 && !note.bendHold) {
            midiSuppress[si2]--;
            continue;
          }
          midiSuppress[si2] = 0;

          if (note.stop) {
            if (activeNotes[si2]) {
              ev.push({ tick: curTick, data: [0x80 | ch, activeNotes[si2].midi, 64] });
              delete activeNotes[si2];
            }
            if (activeNotes["12s_"+si2]) {
              ev.push({ tick: curTick, data: [0x80 | ch, activeNotes["12s_"+si2].midi, 64] });
              delete activeNotes["12s_"+si2];
            }
            if (activeNotes["h_"+si2]) {
              ev.push({ tick: curTick, data: [0x80 | ch, activeNotes["h_"+si2].midi, 64] });
              delete activeNotes["h_"+si2];
            }
          } else if (note.muted) {
            var mVelE=Math.round((note.vel!==undefined?note.vel:(trk.trackVelocity||80))*0.4);
            var mMidi = trk.isDrum ? (trk.tuning[si2] || 0) + note.fret : (trk.tuning[si2] || 40) + note.fret + (trk.transpose || 0);
            mMidi = Math.max(0, Math.min(127, mMidi));
            // Skip if another string has an active note at same MIDI (avoid killing it)
            var midiCollision = false;
            if (!trk.isDrum) { for (var mcs2 = 0; mcs2 < trk.numStrings; mcs2++) { if (mcs2 !== si2 && activeNotes[mcs2] && activeNotes[mcs2].midi === mMidi) { midiCollision = true; break; } } }
            if (!midiCollision) {
              ev.push({ tick: curTick, data: [0x90 | ch, mMidi, mVelE] });
              ev.push({ tick: curTick + Math.max(1, Math.round(beatTicks * 0.2)), data: [0x80 | ch, mMidi, 64] });
              if(trk.twelveStringMode&&!trk.isDrum){var oct12e=si2<(trk.numStrings-2)?12:0;var mMidi12=Math.max(0,Math.min(127,mMidi+oct12e));ev.push({tick:curTick,data:[0x90|ch,mMidi12,Math.round(mVelE*0.75)]});ev.push({tick:curTick+Math.max(1,Math.round(beatTicks*0.2)),data:[0x80|ch,mMidi12,64]});}
            }
          } else {
            // Kill previous note on same string
            if (activeNotes[si2]) {
              ev.push({ tick: curTick, data: [0x80 | ch, activeNotes[si2].midi, 64] });
              delete activeNotes[si2];
            }
            if (activeNotes["12s_"+si2]) {
              ev.push({ tick: curTick, data: [0x80 | ch, activeNotes["12s_"+si2].midi, 64] });
              delete activeNotes["12s_"+si2];
            }
            if (activeNotes["h_"+si2]) {
              ev.push({ tick: curTick, data: [0x80 | ch, activeNotes["h_"+si2].midi, 64] });
              delete activeNotes["h_"+si2];
            }
            var nVelE=note.vel!==undefined?note.vel:(trk.trackVelocity||80);
            // Hammer-on/pull-off velocity reduction
            if (midiHammer[si2]) { nVelE = Math.round(nVelE * 0.9); delete midiHammer[si2]; }
            var nMidi = trk.isDrum ? (trk.tuning[si2] || 0) + note.fret : (trk.tuning[si2] || 40) + note.fret + (trk.transpose || 0);
            // Harmonic: adjust to overtone pitch
            if(note.effect===60&&!trk.isDrum){
              var hFE=note.fret;var oME=(trk.tuning[si2]||40)+(trk.transpose||0);
              if(hFE===12)nMidi=oME+12;else if(hFE===7||hFE===19)nMidi=oME+19;else if(hFE===5||hFE===24)nMidi=oME+24;
              else if(hFE===4||hFE===9||hFE===16)nMidi=oME+28;else if(hFE===3)nMidi=oME+31;else nMidi=oME+12+hFE;
            }
            nMidi = Math.max(0, Math.min(127, nMidi));
            var isHarmE=note.effect===60&&!trk.isDrum;
            var isPalmE=note.effect===109;
            var harmVelE=isHarmE?Math.round(nVelE*0.5):nVelE;
            var dryScaleE=(trk.octOn&&!trk.isDrum&&trk.octDry!=null)?trk.octDry/100:1;
            var playVelE=Math.max(1,Math.round(harmVelE*dryScaleE));
            ev.push({ tick: curTick, data: [0x90 | ch, nMidi, playVelE] });
            if (trk.isDrum) {
              ev.push({ tick: curTick + Math.max(1, Math.round(beatTicks * 0.5)), data: [0x80 | ch, nMidi, 64] });
            } else if (isPalmE) {
              // Palm mute: short duration
              ev.push({ tick: curTick + Math.max(1, Math.round(beatTicks * 0.3)), data: [0x80 | ch, nMidi, 64] });
            } else {
              activeNotes[si2] = { midi: nMidi };
              if (note.ring) midiRingFlags[si2] = true; else delete midiRingFlags[si2];
            }
            // Harmonic shimmer
            if(isHarmE){var shimMdE=Math.min(127,nMidi+12);ev.push({tick:curTick,data:[0x90|ch,shimMdE,Math.round(nVelE*0.5)]});activeNotes["h_"+si2]={midi:shimMdE};}
            if(trk.twelveStringMode&&!trk.isDrum){var oct12n=si2<(trk.numStrings-2)?12:0;var nMidi12=Math.max(0,Math.min(127,nMidi+oct12n));ev.push({tick:curTick,data:[0x90|ch,nMidi12,Math.round(harmVelE*0.9)]});activeNotes["12s_"+si2]={midi:nMidi12};}
            // Pitch Shifter in MIDI export
            if(trk.octOn&&!trk.isDrum){
              var psMidi=Math.max(0,Math.min(127,nMidi+(trk.octShift||-12)));
              var psVelE=Math.round(harmVelE*(trk.octMix||50)/100);
              ev.push({tick:curTick,data:[0x90|ch,psMidi,psVelE]});
              ev.push({tick:curTick+beatTicks,data:[0x80|ch,psMidi,64]});
            }
            // Delay in MIDI export
            if(trk.delayOn&&!trk.isDrum){
              var dlyBPM=song.tempo||120;var dlyTime=trk.delayTime||"8d";var dlyTaps=trk.delayTaps||3;var dlyMix=trk.delayMix||50;
              var dlyTicks=dlyTime==="4"?PPQ:dlyTime==="8"?PPQ/2:dlyTime==="8d"?Math.round(PPQ*0.75):dlyTime==="16"?PPQ/4:Math.round(PPQ*80*dlyBPM/60000);
              var dlyDecay=dlyMix/100;
              for(var dt=1;dt<=dlyTaps;dt++){
                var dtVel=Math.round(harmVelE*Math.pow(dlyDecay,dt));
                if(dtVel>=3){ev.push({tick:curTick+dlyTicks*dt,data:[0x90|ch,nMidi,dtVel]});ev.push({tick:curTick+dlyTicks*dt+Math.round(beatTicks*0.8),data:[0x80|ch,nMidi,64]});}
              }
            }
            // Tremolo in MIDI export (CC#7 volume oscillation)
            if(trk.tremOn&&!trk.isDrum){
              var tremSpd=trk.tremSpeed||"8";var tremDep=trk.tremDepth||70;
              var tremTicks=tremSpd==="4"?PPQ:tremSpd==="8"?PPQ/2:tremSpd==="8t"?Math.round(PPQ/3):PPQ/4;
              var baseVol=trk.volume!==undefined?trk.volume:96;var loVol=Math.round(baseVol*(1-tremDep/100));
              var tremHalf=Math.round(tremTicks/2);
              for(var ti2=0;ti2<8;ti2++){
                var tTick=curTick+ti2*tremTicks;if(tTick>curTick+beatTicks*4)break;
                ev.push({tick:tTick,data:[0xB0|ch,7,baseVol&0x7F]});
                ev.push({tick:tTick+tremHalf,data:[0xB0|ch,7,loVol&0x7F]});
              }
              ev.push({tick:curTick+beatTicks,data:[0xB0|ch,7,baseVol&0x7F]});
            }
            // Technique MIDI events
            if (!trk.isDrum && note.effect) {
              if (note.effect === 126) {
                ev.push({tick:curTick, data:[0xB0|ch, 1, 60]});
                ev.push({tick:curTick + beatTicks, data:[0xB0|ch, 1, trk.modulation!==undefined?trk.modulation:0]});
              }
              // Bend/Slide: scan full chain, schedule pitch bend ramps, suppress targets
              if (note.effect === 98 || note.effect === 47 || note.effect === 92) {
                var cMi2=mi,cBi2=bi,cTick=curTick,cMidi2=nMidi,bChOff=midiChBend-8192;
                for (var mci=0;mci<20;mci++) {
                  var mNext=null,mDist=0;
                  for(var mlmi=cMi2;mlmi<trk.measures.length&&!mNext;mlmi++){
                    var mlS=(mlmi===cMi2)?cBi2+1:0;
                    for(var mlbi=mlS;mlbi<trk.measures[mlmi].beats.length;mlbi++){
                      mDist++;var mln=trk.measures[mlmi].beats[mlbi].notes[si2];
                      if(mln&&mln.attack&&!mln.stop&&!mln.muted){mNext={midi:(trk.tuning[si2]||40)+mln.fret+(trk.transpose||0),dist:mDist,mi:mlmi,bi:mlbi,note:mln};break;}
                    }
                  }
                  if(!mNext) break;
                  var mSemiOff=mNext.midi-nMidi,mEndTick=cTick+beatTicks*mNext.dist;
                  var mBSt=Math.min(8,Math.max(1,mNext.dist));
                  for(var mbsi=1;mbsi<=mBSt;mbsi++){
                    var mbF=mbsi/mBSt,mbCS=((cMidi2-nMidi)*(1-mbF)+mSemiOff*mbF);
                    var mbV=Math.max(0,Math.min(16383,8192+Math.round(mbCS*100*8192/200)+bChOff));
                    ev.push({tick:cTick+Math.round((mEndTick-cTick)*mbF),data:[0xE0|ch,mbV&0x7F,(mbV>>7)&0x7F]});
                  }
                  midiSuppress[si2]=(midiSuppress[si2]||0)+1;cMidi2=mNext.midi;cTick=mEndTick;cMi2=mNext.mi;cBi2=mNext.bi;
                  if(mNext.note.effect===114||mNext.note.effect===98||mNext.note.effect===47||mNext.note.effect===92) continue;
                  if(mNext.note.bendHold){midiSuppress[si2]=0;break;}
                  break;
                }
                ev.push({tick:cTick,data:[0xE0|ch,midiChBend&0x7F,(midiChBend>>7)&0x7F]});
              }
              // Release (standalone after pb or =)
              if (note.effect === 114 && note.preBend !== undefined) {
                var rLk=null,rD2=0;
                for(var rlmi=mi;rlmi<trk.measures.length&&!rLk;rlmi++){
                  var rlS=(rlmi===mi)?bi+1:0;
                  for(var rlbi=rlS;rlbi<trk.measures[rlmi].beats.length;rlbi++){
                    rD2++;var rln=trk.measures[rlmi].beats[rlbi].notes[si2];
                    if(rln&&rln.attack&&!rln.stop&&!rln.muted){rLk={midi:(trk.tuning[si2]||40)+rln.fret+(trk.transpose||0),dist:rD2};break;}
                  }
                }
                if(rLk){var rSO=rLk.midi-nMidi,rBO=midiChBend-8192,rET=curTick+beatTicks*rLk.dist;
                  var rV=Math.max(0,Math.min(16383,8192+Math.round(rSO*100*8192/200)+rBO));
                  ev.push({tick:rET,data:[0xE0|ch,rV&0x7F,(rV>>7)&0x7F]});
                  ev.push({tick:rET,data:[0xE0|ch,midiChBend&0x7F,(midiChBend>>7)&0x7F]});
                  midiSuppress[si2]=(midiSuppress[si2]||0)+1;
                }
              }
              if (note.effect === 104 || note.effect === 112) { midiHammer[si2] = true; }
            }
            if (!trk.isDrum && note.preBend !== undefined) {
              var pbMidi=(trk.tuning[si2]||40)+note.preBend+(trk.transpose||0);
              var pbSM=nMidi-pbMidi,pbCO=midiChBend-8192;
              var pbV=Math.max(0,Math.min(16383,8192+Math.round(pbSM*100*8192/200)+pbCO));
              ev.push({tick:Math.max(0,curTick-1),data:[0xE0|ch,pbV&0x7F,(pbV>>7)&0x7F]});
            }
          }
        }

        fracPos += gCost;
      }
      measStartTick += measTicks;
    }

    // Kill remaining active notes at end
    for (var rk in activeNotes) {
      if (activeNotes.hasOwnProperty(rk)) {
        ev.push({ tick: measStartTick, data: [0x80 | ch, activeNotes[rk].midi, 64] });
      }
    }

    allChunks = allChunks.concat(buildTrackChunk(ev));
  }

  return new Uint8Array(allChunks);
}

// SVG Icons for uniform cross-platform appearance
var _ICON_SVGS = {
  "new": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 1h7l3 3v11H3z" fill="#e8eef4" stroke="#5082c0" stroke-width="1"/><path d="M10 1v3h3" fill="#b0c8e8" stroke="#5082c0" stroke-width=".5"/><line x1="5" y1="7" x2="11" y2="7" stroke="#90b0d0" stroke-width=".8"/><line x1="5" y1="9" x2="11" y2="9" stroke="#90b0d0" stroke-width=".8"/><line x1="5" y1="11" x2="9" y2="11" stroke="#90b0d0" stroke-width=".8"/></svg>',
  "open": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M1 3h5l2 2h7v9H1z" fill="#f5d060"/><path d="M1 5h14v8H1z" fill="#f0c030" rx=".5"/><path d="M1 3h5l2 2H1z" fill="#e0a820"/></svg>',
  "save": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="1.5" fill="#4080d0"/><rect x="3" y="1" width="8" height="5" rx=".5" fill="#c0d8f0"/><rect x="8" y="2" width="2" height="3" rx=".3" fill="#4080d0"/><rect x="3" y="9" width="10" height="5" rx=".5" fill="#e0ecf8"/></svg>',
  "metro": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#20b0a0"><g><path d="M247.5 332.8v-25.6h34.1v25.6c0 4.7 3.8 8.5 8.5 8.5s8.5-3.8 8.5-8.5V51.2h25.6c4.7 0 8.5-3.8 8.5-8.5s-3.8-8.5-8.5-8.5H204.8c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5h25.6v281.6c0 4.7 3.8 8.5 8.5 8.5s8.6-3.8 8.6-8.5zM247.5 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1z"/><path d="M366.8 41.5C363.4 17 345.8 0 324.3 0H204.8c-20.7 0-37 15.7-42.6 41.4L131.3 243.2l-24.6-32.9c2.6-4 4.2-8.8 4.2-14 0-14.1-11.5-25.6-25.6-25.6-2.6 0-5.1.5-7.5 1.3l-19.8-26.1c-2.8-3.8-8.2-4.5-12-1.7-3.8 2.9-4.5 8.2-1.6 12l19.7 26c-2.7 4-4.3 9-4.3 14.2 0 14.1 11.5 25.6 25.6 25.6 2.7 0 5.3-.5 7.7-1.3L196.1 358.4H129.8l7.9-47.7c.8-4.7-2.4-9-7-9.8-4.7-.8-9 2.4-9.8 7L94.4 467.9c-1.9 11.2 1 22 8.1 30.4 7.4 8.7 18.5 13.7 30.5 13.7h263.9c11.6 0 22.5-5 29.8-13.9 7.1-8.5 9.9-19.6 7.9-30.1zm-281.5 163.3c-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5 8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5zm328.2 282.5c-4.1 4.9-10.1 7.7-16.7 7.7H132.9c-7 0-13.3-2.8-17.4-7.7-3.8-4.5-5.3-10.4-4.3-16.5l15.8-95.3h81.9l39.9 53.3c-.8 2-1.3 4.1-1.3 6.4 0 9.4 7.7 17.1 17.1 17.1s17.1-7.7 17.1-17.1-7.7-17.1-17.1-17.1c-.8 0-1.5.1-2.3.2L145.6 262.4l33.4-217.9c1.8-8.2 7.9-27.4 25.8-27.4h119.5c15.1 0 23.8 13.5 25.7 26.9L399.9 358.4H252.1c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5h150.5l15.1 95.5c1.1 5.8-.5 11.7-4.2 16.4z"/></g></svg>',
  "sun": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3.5" fill="#f0a020"/><g stroke="#f0a020" stroke-width="1.3" stroke-linecap="round"><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/><line x1="3" y1="3" x2="4.5" y2="4.5"/><line x1="11.5" y1="11.5" x2="13" y2="13"/><line x1="3" y1="13" x2="4.5" y2="11.5"/><line x1="11.5" y1="4.5" x2="13" y2="3"/></g></svg>',
  "moon": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 47.539 47.539"><path d="M12.248,3.372C5.862,7.608,2,14.709,2,22.515c0,12.68,10.316,22.996,22.997,22.996c7.854,0,14.981-3.898,19.207-10.343c-2.668,0.95-5.464,1.43-8.346,1.43c-13.783,0-24.997-11.214-24.997-24.997C10.861,8.761,11.327,6.005,12.248,3.372z" fill="#e0a830"/></svg>',
  "guitar": '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path d="M11 1l-1 3-2 1c-1 .5-2 2-2 3.5 0 2-1.5 3.5-3 3.5s-2-.5-2-2c0-2 1-3 2.5-4l1-1L6 3l2-1z" fill="#c08040" stroke="#906020" stroke-width=".5"/><circle cx="4" cy="9" r="1" fill="#906020"/></svg>',
  "drums": '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><ellipse cx="7" cy="4" rx="5" ry="2" fill="#d04040" stroke="#a02020" stroke-width=".5"/><path d="M2 4v6c0 1.1 2.2 2 5 2s5-.9 5-2V4" fill="#c03030" stroke="#a02020" stroke-width=".5"/><line x1="4" y1="2" x2="4" y2=".5" stroke="#a07040" stroke-width=".8"/><line x1="10" y1="2" x2="10" y2=".5" stroke="#a07040" stroke-width=".8"/><circle cx="4" cy=".5" r=".8" fill="#a07040"/><circle cx="10" cy=".5" r=".8" fill="#a07040"/></svg>',
  "share": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5082c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'
};
function _ico(name, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent(_ICON_SVGS[name]),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _stopIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="1" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _rewindIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 3L2 8l6 5z" fill="'+(color||"#333")+'"/><path d="M14 3L8 8l6 5z" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _ffIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M2 3l6 5-6 5z" fill="'+(color||"#333")+'"/><path d="M8 3l6 5-6 5z" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _skipBackIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="2" height="10" rx=".5" fill="'+(color||"#333")+'"/><path d="M9 3L3 8l6 5z" fill="'+(color||"#333")+'"/><path d="M15 3L9 8l6 5z" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _insertIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="'+(color||"#333")+'" stroke-width="2" stroke-linecap="round"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _deleteIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10" stroke="'+(color||"#333")+'" stroke-width="2" stroke-linecap="round"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _selectIco(color, sz, active) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="'+(color||"#333")+'" stroke-width="1.5" stroke-dasharray="'+(active?"":"3 2")+'"/>'+(active?'<path d="M5 8l2 2 4-4" stroke="'+(color||"#333")+'" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>':'')+'</svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _undoIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M4 6l-2-2 2-2" stroke="'+(color||"#333")+'" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 4h8a4 4 0 0 1 0 8H6" stroke="'+(color||"#333")+'" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _chordIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><line x1="3" y1="3" x2="13" y2="3" stroke="'+(color||"#333")+'" stroke-width="2"/><line x1="3" y1="3" x2="3" y2="14" stroke="'+(color||"#333")+'" stroke-width="0.8"/><line x1="5.5" y1="3" x2="5.5" y2="14" stroke="'+(color||"#333")+'" stroke-width="0.8"/><line x1="8" y1="3" x2="8" y2="14" stroke="'+(color||"#333")+'" stroke-width="0.8"/><line x1="10.5" y1="3" x2="10.5" y2="14" stroke="'+(color||"#333")+'" stroke-width="0.8"/><line x1="13" y1="3" x2="13" y2="14" stroke="'+(color||"#333")+'" stroke-width="0.8"/><line x1="2" y1="6" x2="14" y2="6" stroke="'+(color||"#333")+'" stroke-width="0.5"/><line x1="2" y1="9" x2="14" y2="9" stroke="'+(color||"#333")+'" stroke-width="0.5"/><line x1="2" y1="12" x2="14" y2="12" stroke="'+(color||"#333")+'" stroke-width="0.5"/><circle cx="5.5" cy="4.5" r="1.3" fill="'+(color||"#333")+'"/><circle cx="10.5" cy="7.5" r="1.3" fill="'+(color||"#333")+'"/><circle cx="8" cy="10.5" r="1.3" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _atrIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="'+(color||"#333")+'" stroke-width="1.5"/><path d="M8 5v3.5l2.5 1.5" stroke="'+(color||"#333")+'" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _addTrackIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="10" height="8" rx="1.5" fill="none" stroke="'+(color||"#333")+'" stroke-width="1.3"/><path d="M6 5.5v5M3.5 8h5" stroke="'+(color||"#333")+'" stroke-width="1.3" stroke-linecap="round"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _delTrackIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="10" height="8" rx="1.5" fill="none" stroke="'+(color||"#333")+'" stroke-width="1.3"/><path d="M3.5 8h5" stroke="'+(color||"#333")+'" stroke-width="1.3" stroke-linecap="round"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _dupTrackIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="5" width="9" height="7" rx="1.5" fill="none" stroke="'+(color||"#333")+'" stroke-width="1.3"/><rect x="4" y="2" width="9" height="7" rx="1.5" fill="none" stroke="'+(color||"#333")+'" stroke-width="1.3"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _trackPropsIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><path d="M424.5,216.5h-15.2c-12.4,0-22.8-10.7-22.8-23.4c0-6.4,2.7-12.2,7.5-16.5l9.8-9.6c9.7-9.6,9.7-25.3,0-34.9l-22.3-22.1c-4.4-4.4-10.9-7-17.5-7c-6.6,0-13,2.6-17.5,7l-9.4,9.4c-4.5,5-10.5,7.7-17,7.7c-12.8,0-23.5-10.4-23.5-22.7V89.1c0-13.5-10.9-25.1-24.5-25.1h-30.4c-13.6,0-24.4,11.5-24.4,25.1v15.2c0,12.3-10.7,22.7-23.5,22.7c-6.4,0-12.3-2.7-16.6-7.4l-9.7-9.6c-4.4-4.5-10.9-7-17.5-7s-13,2.6-17.5,7L110,132c-9.6,9.6-9.6,25.3,0,34.8l9.4,9.4c5,4.5,7.8,10.5,7.8,16.9c0,12.8-10.4,23.4-22.8,23.4H89.2c-13.7,0-25.2,10.7-25.2,24.3V256v15.2c0,13.5,11.5,24.3,25.2,24.3h15.2c12.4,0,22.8,10.7,22.8,23.4c0,6.4-2.8,12.4-7.8,16.9l-9.4,9.3c-9.6,9.6-9.6,25.3,0,34.8l22.3,22.2c4.4,4.5,10.9,7,17.5,7c6.6,0,13-2.6,17.5-7l9.7-9.6c4.2-4.7,10.2-7.4,16.6-7.4c12.8,0,23.5,10.4,23.5,22.7v15.2c0,13.5,10.8,25.1,24.5,25.1h30.4c13.6,0,24.4-11.5,24.4-25.1v-15.2c0-12.3,10.7-22.7,23.5-22.7c6.4,0,12.4,2.8,17,7.7l9.4,9.4c4.5,4.4,10.9,7,17.5,7c6.6,0,13-2.6,17.5-7l22.3-22.2c9.6-9.6,9.6-25.3,0-34.9l-9.8-9.6c-4.8-4.3-7.5-10.2-7.5-16.5c0-12.8,10.4-23.4,22.8-23.4h15.2c13.6,0,23.3-10.7,23.3-24.3V256v-15.2C447.8,227.2,438.1,216.5,424.5,216.5z M336.8,256c0,44.1-35.7,80-80,80c-44.3,0-80-35.9-80-80s35.7-80,80-80C301.1,176,336.8,211.9,336.8,256z" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _chevron(dir, color, sz, mode) { var c=color||"#333"; var s='stroke="'+c+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"'; var p={left:'M10 3L5 8l5 5',right:'M6 3l5 5-5 5',up:'M3 10l5-5 5 5',down:'M3 6l5 5 5-5'}; var dp={left:'M12 3L7 8l5 5" '+s+'/><path d="M7 3L2 8l5 5',right:'M4 3l5 5-5 5" '+s+'/><path d="M9 3l5 5-5 5',up:'M3 12l5-5 5 5" '+s+'/><path d="M3 7l5-5 5 5',down:'M3 4l5 5 5-5" '+s+'/><path d="M3 9l5 5 5-5'}; var path=mode==="double"?(dp[dir]||dp.right):(p[dir]||p.right); return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="'+path+'" '+s+'/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }
function _playAllIco(color, sz) { return React.createElement("img", {src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M1 2l7 6-7 6z" fill="'+(color||"#333")+'" opacity=".5"/><path d="M4 2l7 6-7 6z" fill="'+(color||"#333")+'" opacity=".75"/><path d="M7 2l7 6-7 6z" fill="'+(color||"#333")+'"/></svg>'),width:sz||16,height:sz||16,style:{verticalAlign:"middle",pointerEvents:"none"},draggable:false}); }

// Per-note pitch manipulation for techniques
function synthBendNote(ch, note, targetSemitones, duration) {
  var key = ch + "-" + note; var n = _notes[key]; if (!n || !n.sf || !n.src) return;
  var ctx = _actx; if (!ctx) return; var t = ctx.currentTime;
  var baseRate = n.baseRate || 1;
  var bendCents = (getChNode(ch).bendCents || 0);
  var currentRate = n.src.playbackRate.value || baseRate; // read actual current rate
  var targetRate = baseRate * Math.pow(2, (bendCents + targetSemitones * 100) / 1200);
  try {
    n.src.playbackRate.cancelScheduledValues(t);
    n.src.playbackRate.setValueAtTime(currentRate, t);
    n.src.playbackRate.linearRampToValueAtTime(targetRate, t + Math.max(0.05, duration));
  } catch(e) {}
}
function synthPreBendNote(ch, note, semitones) {
  var key = ch + "-" + note; var n = _notes[key]; if (!n || !n.sf || !n.src) return;
  var ctx = _actx; if (!ctx) return;
  var baseRate = n.baseRate || 1;
  var bendCents = (getChNode(ch).bendCents || 0);
  var newRate = baseRate * Math.pow(2, (bendCents + semitones * 100) / 1200);
  try { n.src.playbackRate.setValueAtTime(newRate, ctx.currentTime); } catch(e) {}
}
function synthVibratoNote(ch, note, durationSec, semiOffset) {
  var key = ch + "-" + note; var n = _notes[key]; if (!n || !n.sf || !n.src) return;
  var ctx = _actx; if (!ctx) return; var t = ctx.currentTime;
  var baseRate = n.baseRate || 1;
  var bendCents = (getChNode(ch).bendCents || 0);
  // Use explicit semitone offset if provided, otherwise read actual current rate
  var centerRate;
  if (semiOffset !== undefined) {
    centerRate = baseRate * Math.pow(2, (bendCents + semiOffset * 100) / 1200);
  } else {
    centerRate = n.src.playbackRate.value || baseRate;
  }
  var vibCents = 35; var rate = 6; var cycles = Math.ceil(Math.max(durationSec || 3, 1) * rate);
  try {
    n.src.playbackRate.cancelScheduledValues(t);
    n.src.playbackRate.setValueAtTime(centerRate, t);
    for (var vi = 0; vi < cycles; vi++) {
      n.src.playbackRate.setValueAtTime(centerRate * Math.pow(2, vibCents / 1200), t + vi / rate);
      n.src.playbackRate.setValueAtTime(centerRate * Math.pow(2, -vibCents / 1200), t + vi / rate + 0.5 / rate);
    }
    n.src.playbackRate.setValueAtTime(centerRate, t + cycles / rate);
  } catch(e) {}
}
// Schedule a pitch ramp on an active note to arrive at targetSemitones offset at audioTime
// Does NOT cancel existing ramps — chains smoothly with previous ramps
function synthChainRamp(ch, note, targetSemitones, audioTime) {
  var key = ch + "-" + note; var n = _notes[key]; if (!n || !n.sf || !n.src) return;
  var baseRate = n.baseRate || 1;
  var bendCents = (getChNode(ch).bendCents || 0);
  var targetRate = baseRate * Math.pow(2, (bendCents + targetSemitones * 100) / 1200);
  try { n.src.playbackRate.linearRampToValueAtTime(targetRate, audioTime); } catch(e) {}
}

var TRACK_COLORS = ["#4285f4","#ea4335","#34a853","#fbbc04","#9c27b0","#ff6d00","#00bcd4","#e91e63","#3f51b5","#8bc34a","#795548","#607d8b","#f44336","#2196f3","#4caf50","#ff9800"];

function timeSigBeats(num, den) {
  // Convert time signature to number of 16th-note positions
  return Math.round(num * (16 / den));
}

function beatsToTimeSig(beats, preferDen) {
  // Derive a clean time signature from a count of 16th-note positions.
  // Prefer the existing denominator if it yields a whole numerator, else try common ones.
  var dens = [];
  if (preferDen) dens.push(preferDen);
  [4,8,16,2].forEach(function(d){ if(dens.indexOf(d)<0) dens.push(d); });
  for (var i=0;i<dens.length;i++){
    var d=dens[i];
    var num=beats*d/16;
    if (Math.abs(num-Math.round(num))<1e-9 && Math.round(num)>=1) return {num:Math.round(num),den:d};
  }
  // Fallback: express directly in 16ths
  return {num:beats,den:16};
}

function getTimeSig(measure) {
  if (measure && measure.timeSig) return measure.timeSig;
  return {num: 4, den: 4};
}

function timeSigLabel(ts) {
  return ts.num + "/" + ts.den;
}

// === TBT SAVER ===
async function saveTBT(song) {
  var tc = song.tracks.length;
  var maxM = Math.max.apply(null, song.tracks.map(function(t) { return t.measures.length; }));
  var hasATR = false;
  // Compute per-track mcs (total note positions = sum of beats per measure)
  var mcs = [];
  for (var ti = 0; ti < tc; ti++) {
    var t = song.tracks[ti], cnt = 0;
    for (var mi = 0; mi < t.measures.length; mi++) { cnt += t.measures[mi].beats.length; }
    mcs.push(cnt);
    for (var mi2 = 0; mi2 < t.measures.length; mi2++) {
      if (t.measures[mi2].isATR) hasATR = true;
    }
  }

  // Always save as variant 'r' (0x72) for consistent format
  var vb = 0x72;

  var b1 = [];
  function wb(v) { b1.push(v & 0xFF); }
  function wbs(v) { wb(v < 0 ? v + 256 : v); }
  function ww(v) { wb(v); wb(v >> 8); }
  function wws(v) { ww(v < 0 ? v + 65536 : v); }
  function wu32(v) { wb(v); wb(v >> 8); wb(v >> 16); wb(v >> 24); }

  // === STREAM 1 ===
  if (vb >= 0x70) {
    for (var i = 0; i < tc; i++) { wu32(mcs[i]); }
  }
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].numStrings); }
  for (var i = 0; i < tc; i++) { var tr=song.tracks[i]; wb((tr.instrument & 0x7F) | (tr.letRing ? 0 : 0x80)); }
  for (var i = 0; i < tc; i++) { wb(0x1C); } // field2: display constant (always 28)
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].volume !== undefined ? song.tracks[i].volume : 96); } // field3: volume
  if (vb >= 0x71) {
    for (var i = 0; i < tc; i++) { wb(song.tracks[i].modulation || 0); } // modulation
    for (var i = 0; i < tc; i++) { wws(song.tracks[i].pitchBend || 0); } // pitch bend in cents
  }
  for (var i = 0; i < tc; i++) { wbs(song.tracks[i].transpose || 0); }  // transpose (signed byte)
  for (var i = 0; i < tc; i++) { wb((song.tracks[i].transpose || 0) < 0 ? 1 : 0); } // direction hint: 0=up, 1=down
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].reverb || 0); }      // reverb
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].chorus || 0); }     // chorus
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].pan !== undefined ? song.tracks[i].pan : 64); } // fK1 position: pan
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].isDrum ? 0x63 : 0x18); } // fK2 position: display param
  for (var i = 0; i < tc; i++) {
    var tr2 = song.tracks[i];
    // Only set hasCh=1 if channel was explicitly assigned (ch10 for drums)
    wb((tr2.isDrum || (tr2.midiChannel && tr2.midiChannel === 10)) ? 1 : 0);
  }
  for (var i = 0; i < tc; i++) {
    var tr3 = song.tracks[i];
    if (tr3.isDrum || (tr3.midiChannel && tr3.midiChannel === 10)) { wbs(9); }
    else { wbs(-1); }
  }
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].hasTopText ? 1 : 0); }
  for (var i = 0; i < tc; i++) { wb(song.tracks[i].hasBottomText ? 1 : 0); }
  for (var i = 0; i < tc; i++) {
    var t2 = song.tracks[i];
    for (var j = 0; j < 8; j++) {
      if (j < t2.tuning.length) { wbs(t2.tuning[j] - (j < 6 ? STD6[j] : 0)); }
      else { wb(0); }
    }
  }
  for (var i = 0; i < tc; i++) { wb(0); } // trailing byte
  function ws(s) {
    var e = new TextEncoder().encode(s || "");
    ww(e.length);
    for (var k = 0; k < e.length; k++) { wb(e[k]); }
  }
  ws(song.title); ws(song.artist); ws(song.album);
  ws(song.transcribedBy); ws(song.copyright);

  var blk1 = new Uint8Array(b1);

  // === STREAM 2 ===
  var b2parts = [];

  if (vb >= 0x70) {
    // Variant 'r': 6-byte measure headers
    var measHdr = new Uint8Array(maxM * 6);
    for (var mi3 = 0; mi3 < maxM; mi3++) {
      var off2 = mi3 * 6;
      var m0 = song.tracks[0].measures[mi3];
      var gb = m0 ? (m0.globalBeatsPerMeasure || BPM) : BPM;
      measHdr[off2] = gb & 0xFF; measHdr[off2+1] = (gb>>8) & 0xFF;
      measHdr[off2+2] = (gb>>16) & 0xFF; measHdr[off2+3] = (gb>>24) & 0xFF;
    }
    // Flags describe LEFT bar of the header's measure, so:
    // repeatStart/repeatEnd on measure mi → header mi bits
    // staffBreak/double on measure mi (RIGHT bar) → header mi+1 bit 0
    for (var mi3b = 0; mi3b < maxM; mi3b++) {
      var m0b = song.tracks[0].measures[mi3b];
      if (!m0b) continue;
      var bl = m0b.barLine || "single";
      if (bl === "repeatStart") {
        measHdr[mi3b * 6 + 4] |= 2;
      }
      if (bl === "repeatEnd") {
        measHdr[mi3b * 6 + 4] |= 4;
        measHdr[mi3b * 6 + 5] = m0b.repeatCount || 2;
      }
      if (bl === "repeatBoth") {
        measHdr[mi3b * 6 + 4] |= 6;
        measHdr[mi3b * 6 + 5] = m0b.repeatCount || 2;
      }
      if (bl === "double" || m0b.staffBreak) {
        if (mi3b + 1 < maxM) {
          measHdr[(mi3b + 1) * 6 + 4] |= 1;
        }
      }
    }
    b2parts.push(measHdr);
  } else {
    // Variant 'o': RLE alt-bar data
    var pos0 = mcs[0] || (maxM * BPM);
    var altBar = new Uint8Array(pos0);
    for (var mi4 = 0; mi4 < maxM; mi4++) {
      var m1 = song.tracks[0].measures[mi4];
      if (!m1) continue;
      var bl2 = m1.barLine || "single";
      altBar[mi4 * BPM + BPM - 1] = 1; // normal bar line at beat 15
      if (bl2 === "repeatStart") { altBar[mi4 * BPM] = 3; } // btype=3 at beat 0 = repeat open
      if (bl2 === "repeatEnd") {
        var rc2 = (m1.repeatCount || 2) - 1;
        altBar[mi4 * BPM + BPM - 1] = 2 | ((rc2 & 0xF) << 4); // btype=2 at beat 15 = repeat close
      }
      if (bl2 === "repeatBoth") {
        altBar[mi4 * BPM] = 3; // btype=3 at beat 0 = repeat open
        var rc3 = (m1.repeatCount || 2) - 1;
        altBar[mi4 * BPM + BPM - 1] = 2 | ((rc3 & 0xF) << 4); // btype=2 at beat 15 = repeat close
      }
      if (bl2 === "double") { altBar[mi4 * BPM + BPM - 1] = 4; }
    }
    b2parts.push(encRLE(altBar));
  }

  // Note data per track
  for (var ti2 = 0; ti2 < tc; ti2++) {
    var t3 = song.tracks[ti2];
    var nr = new Uint8Array(mcs[ti2] * 20);
    var np = 0;
    for (var mi5 = 0; mi5 < t3.measures.length; mi5++) {
      var m3 = t3.measures[mi5];
      for (var bi = 0; bi < m3.beats.length; bi++) {
        if (np >= mcs[ti2]) break;
        var off3 = np * 20;
        var beat = m3.beats[bi];
        for (var si = 0; si < beat.notes.length && si < 8; si++) {
          var n = beat.notes[si];
          if (!n) continue;
          if (n.muted) { nr[off3 + si] = 17; }
          else if (n.stop) { nr[off3 + si] = 18; }
          else { nr[off3 + si] = (n.fret || 0) + (n.attack !== false ? 128 : 0); }
          if (n.effect) { nr[off3 + 8 + si] = n.effect; }
        }
        // Top/bottom text characters
        if (beat.topChar) nr[off3 + 17] = beat.topChar;
        if (beat.botChar) nr[off3 + 18] = beat.botChar;
        np++;
      }
    }
    b2parts.push(encRLE(nr));
  }

  // ATR data per track (if any track has ATR)
  if (hasATR && vb >= 0x70) {
    for (var ti3 = 0; ti3 < tc; ti3++) {
      var t4 = song.tracks[ti3];
      var atrBuf = new Uint8Array(mcs[ti3] * 2);
      var ap = 0;
      for (var mi6 = 0; mi6 < t4.measures.length; mi6++) {
        var m4 = t4.measures[mi6];
        for (var bi2 = 0; bi2 < m4.beats.length; bi2++) {
          if (ap >= mcs[ti3]) break;
          var beat2 = m4.beats[bi2];
          atrBuf[ap * 2] = (beat2.atrNum || 1);
          atrBuf[ap * 2 + 1] = (beat2.atrGroup || 1);
          ap++;
        }
      }
      b2parts.push(encRLE(atrBuf));
    }
  }

  // Effect stream per track
  if (vb >= 0x70) {
    var REV_ETYPE = {68:1, 85:2, 84:3, 73:4, 86:5, 80:6, 67:7, 82:8, 77:9, 66:10}; // type char → typeIdx
    for (var ti4 = 0; ti4 < tc; ti4++) {
      var t5 = song.tracks[ti4];
      var efxBytes = [];
      var lastPos = 0;
      var absPos2 = 0;
      for (var mi7 = 0; mi7 < t5.measures.length; mi7++) {
        var m5 = t5.measures[mi7];
        for (var bi3 = 0; bi3 < m5.beats.length; bi3++) {
          var beat3 = m5.beats[bi3];
          if (beat3.trkEffect) {
            // Collect all effects at this position (primary + multi)
            var fxList = [beat3.trkEffect];
            if (beat3.trkEffect.multi) {
              for (var mf2 = 0; mf2 < beat3.trkEffect.multi.length; mf2++) fxList.push(beat3.trkEffect.multi[mf2]);
            }
            for (var fi = 0; fi < fxList.length; fi++) {
              var fx = fxList[fi];
              var tidx = REV_ETYPE[fx.type];
              if (tidx === undefined) continue;
              var delta = absPos2 - lastPos;
              // deltaPos (u16)
              efxBytes.push(delta & 0xFF, (delta >> 8) & 0xFF);
              // typeIdx (u16)
              efxBytes.push(tidx & 0xFF, (tidx >> 8) & 0xFF);
              // Encode value bytes
              if (fx.type === 66) { // Bend: 2 bytes (raw16 LE)
                var r16 = fx.raw16 || 0;
                efxBytes.push(2, 0); // numVals = 2
                efxBytes.push(r16 & 0xFF, (r16 >> 8) & 0xFF);
              } else if (fx.type === 84) { // Tempo: u16 LE (supports > 255 BPM)
                efxBytes.push(2, 0);
                efxBytes.push(fx.value & 0xFF, (fx.value >> 8) & 0xFF);
              } else if (fx.type === 73) { // Instrument: u16 LE, low byte = inst|(letRing?0:0x80)
                efxBytes.push(2, 0); // numVals = 2
                efxBytes.push((fx.value & 0x7F) | (fx.letRing ? 0 : 0x80), 0);
              } else { // V, P, M: u16 LE, low byte = value
                efxBytes.push(2, 0); // numVals = 2
                efxBytes.push(fx.value & 0xFF, 0);
              }
              lastPos = absPos2;
            }
          }
          absPos2++;
        }
      }
      // Write u32 byte count + data
      var efxLen = efxBytes.length;
      var efxBuf = new Uint8Array(4 + efxLen);
      efxBuf[0] = efxLen & 0xFF; efxBuf[1] = (efxLen >> 8) & 0xFF;
      efxBuf[2] = (efxLen >> 16) & 0xFF; efxBuf[3] = (efxLen >> 24) & 0xFF;
      for (var ei2 = 0; ei2 < efxLen; ei2++) efxBuf[4 + ei2] = efxBytes[ei2];
      b2parts.push(efxBuf);
    }
  }

  var b2t = b2parts.reduce(function(s, x) { return s + x.length; }, 0);
  var blk2 = new Uint8Array(b2t);
  var bo = 0;
  for (var i = 0; i < b2parts.length; i++) { blk2.set(b2parts[i], bo); bo += b2parts[i].length; }

  var c1 = await zEnc(blk1);
  var c2 = await zEnc(blk2);
  var hdr = new Uint8Array(64);
  hdr[0] = 0x54; hdr[1] = 0x42; hdr[2] = 0x54; // "TBT"
  hdr[3] = vb;
  hdr[4] = Math.min(song.tempo, 250) & 0xFF;
  hdr[5] = tc;
  if (vb >= 0x70) {
    hdr[6] = 3; hdr[7] = 0x32; hdr[8] = 0x2E; hdr[9] = 0x30; // "2.0"
  } else {
    hdr[6] = 3; hdr[7] = 0x31; hdr[8] = 0x2E; hdr[9] = 0x36; // "1.6"
  }
  // Flags: 0x01=hasMeta, 0x02=hasBarInfo, 0x08=hasEffects, 0x10=hasATR
  var flags = 0x03; // meta + barinfo
  if (vb >= 0x70) flags |= 0x08; // effects stream present (even if empty)
  if (hasATR) flags |= 0x10;
  hdr[11] = flags;
  if (vb >= 0x70) {
    hdr[40] = maxM & 0xFF; hdr[41] = (maxM >> 8) & 0xFF;
  } else {
    hdr[42] = mcs[0] & 0xFF; hdr[43] = (mcs[0] >> 8) & 0xFF;
  }
  var ts = 64 + c1.length + c2.length;
  // Header bytes for stream boundary location
  hdr[46] = song.tempo & 0xFF; hdr[47] = (song.tempo >> 8) & 0xFF; // tempo u16
  hdr[48] = c1.length & 0xFF; hdr[49] = (c1.length >> 8) & 0xFF; // compressed stream1 size (u32)
  hdr[50] = (c1.length >> 16) & 0xFF; hdr[51] = (c1.length >> 24) & 0xFF;
  // CRC32 of all compressed data (bytes 52-55)
  var compAll = new Uint8Array(c1.length + c2.length);
  compAll.set(c1, 0); compAll.set(c2, c1.length);
  var crc1 = crc32(compAll);
  hdr[52] = crc1 & 0xFF; hdr[53] = (crc1 >> 8) & 0xFF;
  hdr[54] = (crc1 >> 16) & 0xFF; hdr[55] = (crc1 >> 24) & 0xFF;
  // Total file size (bytes 56-59)
  hdr[56] = ts & 0xFF; hdr[57] = (ts >> 8) & 0xFF;
  hdr[58] = (ts >> 16) & 0xFF; hdr[59] = (ts >> 24) & 0xFF;
  // CRC32 of header bytes 0-59 (bytes 60-63)
  var crc2h = crc32(hdr.subarray(0, 60));
  hdr[60] = crc2h & 0xFF; hdr[61] = (crc2h >> 8) & 0xFF;
  hdr[62] = (crc2h >> 16) & 0xFF; hdr[63] = (crc2h >> 24) & 0xFF;
  var file = new Uint8Array(ts);
  file.set(hdr, 0); file.set(c1, 64); file.set(c2, 64 + c1.length);
  return file;
}

// === TKT FORMAT (TabKit native: magic header + zlib JSON) ===
var TKT_MAGIC = [0x54, 0x4B, 0x54, 0x01]; // "TKT" + version 1

function saveTKT(song) {
  var toSave = JSON.parse(JSON.stringify(song));
  delete toSave._mobileInput;
  delete toSave.shareId;
  delete toSave.shareVersion;
  delete toSave.shareUpdated;
  toSave._tktVersion = 1;
  var json = JSON.stringify(toSave);
  var encoded = new TextEncoder().encode(json);
  var compressed = pako.deflate(encoded);
  var out = new Uint8Array(4 + compressed.length);
  out[0] = TKT_MAGIC[0]; out[1] = TKT_MAGIC[1]; out[2] = TKT_MAGIC[2]; out[3] = TKT_MAGIC[3];
  out.set(compressed, 4);
  return out;
}

function parseTKT(buf) {
  var u8 = new Uint8Array(buf);
  if (u8[0] !== TKT_MAGIC[0] || u8[1] !== TKT_MAGIC[1] || u8[2] !== TKT_MAGIC[2])
    throw new Error("Not a TKT file");
  var ver = u8[3];
  if (ver > 1) throw new Error("TKT version " + ver + " not supported");
  var compressed = u8.slice(4);
  var decompressed = pako.inflate(compressed);
  var json = new TextDecoder().decode(decompressed);
  var song = JSON.parse(json);
  return song;
}

function isTKTFile(buf) {
  var u8 = new Uint8Array(buf);
  return u8.length > 4 && u8[0] === 0x54 && u8[1] === 0x4B && u8[2] === 0x54;
}
// === BEAT RULER ===
// Section strip: colored labels above the ruler with inline controls
// Section strip: colored labels above the ruler with drag-to-reorder
// Section strip: colored labels above ruler with drag-to-reorder + faux add section
// Section strip: colored labels above ruler with drag-to-reorder
// Section strip: colored section labels above ruler
function SectionStrip(props) {
  var song = props.song, scrollX = props.scrollX, viewW = props.viewW;
  var mwArr = props.measWidths || [], th = props.th, darkMode = props.darkMode;
  var isMobile = props.isMobile, cur = props.cur, sel = props.sel;
  var sections = song.sections || [];
  var BW = 18, MP = 3, LW = 24;
  var measX = [], totalVW = LW;
  for (var i = 0; i < mwArr.length; i++) { measX.push(totalVW); totalVW += mwArr[i] * BW + MP * 2 + 1; }
  var totalBars = song.tracks[0] ? song.tracks[0].measures.length : 0;
  var H = 22;
  var stripRef = useRef(null);

  function barToX(bar) { return (bar < measX.length ? (measX[bar] || LW) : totalVW) - scrollX; }

  // SVG icon helpers
  var iSz = isMobile ? 16 : 12, iPd = isMobile ? "3px" : "1px";
  var icoClr = darkMode ? "#bbb" : "#555", icoDelClr = darkMode ? "#ff6666" : "#cc3333";
  function icoEdit(clr, sz) { return React.createElement("svg",{width:sz,height:sz,viewBox:"0 0 16 16",style:{display:"block"}},
    React.createElement("path",{d:"M11.5 1.5l3 3-9 9H2.5v-3z",fill:"none",stroke:clr,strokeWidth:1.3,strokeLinejoin:"round"}),
    React.createElement("line",{x1:9,y1:4,x2:12,y2:7,stroke:clr,strokeWidth:1})); }
  function icoRemove(clr, sz) { return React.createElement("svg",{width:sz,height:sz,viewBox:"0 0 16 16",style:{display:"block"}},
    React.createElement("line",{x1:4,y1:8,x2:12,y2:8,stroke:clr,strokeWidth:1.8,strokeLinecap:"round"})); }
  function icoDelete(clr, sz) { return React.createElement("svg",{width:sz,height:sz,viewBox:"0 0 16 16",style:{display:"block"}},
    React.createElement("line",{x1:4,y1:4,x2:12,y2:12,stroke:clr,strokeWidth:1.5,strokeLinecap:"round"}),
    React.createElement("line",{x1:12,y1:4,x2:4,y2:12,stroke:clr,strokeWidth:1.5,strokeLinecap:"round"})); }

  // Build regions
  var sorted = sections.slice().sort(function(a, b) { return a.bar - b.bar; });
  var regions = [];
  var pos = 0;
  for (var si = 0; si < sorted.length; si++) {
    var sec = sorted[si];
    if (sec.bar > pos) regions.push({type:"gap", bar:pos, bars:sec.bar - pos});
    regions.push({type:"section", bar:sec.bar, bars:sec.bars||1, name:sec.name, color:sec.color||"#3b82f6", idx:si});
    pos = sec.bar + (sec.bars||1);
  }
  if (pos < totalBars) regions.push({type:"gap", bar:pos, bars:totalBars - pos});

  // Faux section overlay
  var fauxBar = cur ? cur.measure : 0, fauxBars = 1;
  if (sel) { fauxBar = Math.min(sel.startMeasure, sel.endMeasure); fauxBars = Math.abs(sel.endMeasure - sel.startMeasure) + 1; }
  var fauxVisible = !props.playing;
  for (var fi = 0; fi < sections.length; fi++) {
    var fs = sections[fi], fe = fs.bar + (fs.bars||1);
    if (fauxBar < fe && fauxBar + fauxBars > fs.bar) { fauxVisible = false; break; }
  }

  var arrangementIco = React.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12"},
    React.createElement("rect",{x:1,y:2,width:4,height:3,rx:0.5,fill:darkMode?"#7cb8ff":"#4080c0",opacity:0.8}),
    React.createElement("rect",{x:6,y:2,width:5,height:3,rx:0.5,fill:darkMode?"#ff9060":"#c06030",opacity:0.8}),
    React.createElement("rect",{x:1,y:7,width:6,height:3,rx:0.5,fill:darkMode?"#60c080":"#40a060",opacity:0.8}),
    React.createElement("rect",{x:8,y:7,width:3,height:3,rx:0.5,fill:darkMode?"#c080e0":"#8040a0",opacity:0.8}));

  var iconsW = isMobile ? 72 : 50;

  return React.createElement("div", {ref:stripRef, style:{height:H, position:"relative", overflow:"hidden",
    background:th.ruler||"#eee8da", borderBottom:"1px solid var(--border-subtle,"+(th.hdrB||"#ddd")+")", flexShrink:0, fontSize:10, fontWeight:"600"}},
    // Arrangement gutter
    React.createElement("div",{style:{position:"absolute",left:0,top:0,width:LW,height:H,
      background:th.ruler||"#eee8da",zIndex:10,borderRight:"1px solid "+("var(--border-subtle,#e4e8f0)"),
      display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},
      title:"Arrangement", onClick:function(){if(props.onArrangement)props.onArrangement();}
    }, arrangementIco),
    // Faux add-section overlay
    fauxVisible ? (function() {
      var fx1 = barToX(fauxBar), fx2 = barToX(fauxBar + fauxBars), fw = fx2 - fx1;
      if (fw < 20) return null;
      return React.createElement("div",{key:"faux", style:{position:"absolute",left:fx1,width:fw,top:1,height:H-2,boxSizing:"border-box",
        border:"1.5px dashed "+(darkMode?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.12)"),borderRadius:3,
        display:"flex",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",zIndex:1,
        background:darkMode?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)"},
        onClick:function(){if(props.onAdd)props.onAdd(fauxBar,fauxBars);}
      },
        fw > 80 ? React.createElement("span",{style:{fontSize:isMobile?11:9,color:darkMode?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.15)",fontWeight:"500"}},"Add section") : React.createElement("span",{style:{fontSize:11,fontWeight:"700",color:darkMode?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.15)"}},"+")
      );
    })() : null,
    // Sections
    regions.map(function(r, ri) {
      var x1 = barToX(r.bar), x2 = barToX(r.bar + r.bars), w = x2 - x1;
      if (w < 2 || r.type === "gap") return null;
      var secRight = x1 + w, vpRight = viewW - 4;
      var iconsRight = Math.min(secRight, vpRight);
      var iconsLeft = Math.max(x1 + 4, LW + 2);
      var showIcons = (iconsRight - iconsLeft) > iconsW + 20;
      return React.createElement(React.Fragment, {key:"s"+ri},
        React.createElement("div",{
          style:{position:"absolute",left:x1,width:w,top:0,height:H,boxSizing:"border-box",
            background:r.color+(darkMode?"30":"18"), borderBottom:"2px solid "+r.color,
            display:"flex",alignItems:"center",paddingLeft:6,paddingRight:iconsW+8,
            overflow:"hidden",whiteSpace:"nowrap",zIndex:3,cursor:"pointer"},
          onClick:function(){if(props.onClickSection)props.onClickSection(r.idx);}},
          React.createElement("span",{style:{overflow:"hidden",textOverflow:"ellipsis",
            color:r.color,fontSize:isMobile?11:10}}, r.name)
        ),
        showIcons ? React.createElement("div",{style:{position:"absolute",
          left:iconsRight-iconsW-2, top:0, height:H,
          display:"flex",alignItems:"center",gap:isMobile?2:1,zIndex:4}},
          React.createElement("span",{title:"Edit section",
            style:{cursor:"pointer",padding:iPd,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.4},
            onClick:function(e){e.stopPropagation();if(props.onEditSection)props.onEditSection(r.idx);}
          },icoEdit(icoClr,iSz)),
          React.createElement("span",{title:"Remove marker (keep bars)",
            style:{cursor:"pointer",padding:iPd,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.4},
            onClick:function(e){e.stopPropagation();if(props.onRemove)props.onRemove(r.idx);}
          },icoRemove(icoClr,iSz)),
          React.createElement("span",{title:"Delete section and bars",
            style:{cursor:"pointer",padding:iPd,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.4},
            onClick:function(e){e.stopPropagation();if(props.onDelete)props.onDelete(r.idx);}
          },icoDelete(icoDelClr,iSz))
        ) : null
      );
    })
  );
}
function BeatRuler(props) {
  var song = props.song, ati = props.ati, cur = props.cur, scrollX = props.scrollX;
  var viewW = props.viewW, mwArr = props.measWidths, th = props.th;
  var ref = useRef(null);
  var BW = 18, MP = 3, LW = 24, rH = 14;

  var measX = [], totalVW = LW;
  for (var i = 0; i < mwArr.length; i++) {
    measX.push(totalVW);
    totalVW += mwArr[i] * BW + MP * 2 + 1;
  }
  totalVW += 20;

  useEffect(function() {
    var rc = ref.current; if (!rc) return;
    var dpr = window.devicePixelRatio || 1;
    var cw = viewW || (typeof window !== "undefined" ? window.innerWidth : 800);
    rc.width = cw * dpr; rc.height = rH * dpr;
    rc.style.width = cw + "px"; rc.style.height = rH + "px";
    var rx = rc.getContext("2d"); rx.scale(dpr, dpr); rx.imageSmoothingEnabled = false;
    rx.fillStyle = th.ruler || "#eee8da"; rx.fillRect(0, 0, cw, rH);

    var activeTrack = song.tracks[ati];
    for (var rmi = 0; rmi < mwArr.length; rmi++) {
      var rmStart = measX[rmi];
      var measPxW = mwArr[rmi] * BW + MP * 2;
      if (rmStart + measPxW < scrollX - 20) continue;
      if (rmStart > scrollX + cw + 20) break;
      var rmx = rmStart - scrollX;
      var rMeas = activeTrack && rmi < activeTrack.measures.length ? activeTrack.measures[rmi] : null;
      var rNumBeats = rMeas ? rMeas.beats.length : mwArr[rmi];
      // ATR highlight
      if (rMeas && rMeas.isATR) {
        rx.fillStyle = "rgba(200,180,255,0.15)";
        rx.fillRect(rmx, 0, measPxW, rH - 1);
      }
      // Beat width: same as canvas - evenly spaced within measure
      var beatW = rNumBeats > 0 ? ((measPxW - MP * 2) / rNumBeats) : BW;

      // Walk beats: pixel position matches canvas (evenly spaced),
      // but track global position for tick size classification
      var gAccum = 0;
      for (var rbi = 0; rbi < rNumBeats; rbi++) {
        var rbt = rMeas ? rMeas.beats[rbi] : null;
        var rgc = 1;
        if (rbt && rbt.atrGroup && rbt.atrGroup > 1) rgc = (rbt.atrNum || 1) / rbt.atrGroup;
        var gPos = gAccum;
        gAccum += rgc;

        // Pixel position: evenly spaced, matching canvas beat centers
        var rpx = rmx + MP + rbi * beatW + beatW / 2;

        // Tick size from global position and time signature
        var rTs = rMeas ? getTimeSig(rMeas) : {num:4,den:4};
        var rBeatSpacing = Math.round(16 / (rTs.den || 4)); // 16th notes per beat
        var rHalfSpacing = Math.max(1, Math.round(rBeatSpacing / 2));
        var isBeat = rBeatSpacing > 0 && (Math.abs(gPos % rBeatSpacing) < 0.01);
        var isHalf = rHalfSpacing > 0 && (Math.abs(gPos % rHalfSpacing) < 0.01) && !isBeat;
        var isCurBeat = (rmi === cur.measure && rbi === cur.beat);

        var tickH = isBeat ? rH - 2 : isHalf ? rH * 0.55 : rH * 0.3;
        var tickY = rH - tickH - 1;

        if (isCurBeat) {
          rx.fillStyle = th.cBg || "#3264dc";
          rx.fillRect(Math.round(rpx) - 1, 0, 3, rH - 1);
        } else {
          rx.strokeStyle = isBeat ? (th.dim || "#666") : isHalf ? (th.dim || "#999") : (th.dim || "#bbb");
          rx.lineWidth = isBeat ? 1.5 : 1;
          rx.beginPath(); rx.moveTo(Math.round(rpx) + 0.5, tickY); rx.lineTo(Math.round(rpx) + 0.5, rH - 1); rx.stroke();
        }
      }
      // Bar line at right edge of measure
      rx.strokeStyle = th.hdrB || "#aca899"; rx.lineWidth = 0.5;
      var barX = rmx + measPxW;
      rx.beginPath(); rx.moveTo(Math.round(barX) + 0.5, 0); rx.lineTo(Math.round(barX) + 0.5, rH); rx.stroke();
    }

    // Tuning label area overlay (drawn last to cover ticks that extend into it)
    rx.fillStyle = th.ruler || "#eee8da"; rx.fillRect(0, 0, LW, rH);
    rx.strokeStyle = th.hdrB || "#aca899"; rx.lineWidth = 0.5;
    rx.beginPath(); rx.moveTo(LW - 0.5, 0); rx.lineTo(LW - 0.5, rH); rx.stroke();

    // Loop region shading (drawn before markers so it doesn't cover them)
    var loopA2 = props.loopA, loopB2 = props.loopB;
    function loopX(lp) {
      if (!lp || lp.measure >= mwArr.length) return -1;
      var lmx = measX[lp.measure]; if (lmx === undefined) return -1;
      return lmx + MP + lp.beat * BW + BW/2 - scrollX;
    }
    if (loopA2 && loopB2) {
      var ax0 = loopX(loopA2), bx0 = loopX(loopB2);
      if (ax0 >= 0 && bx0 >= 0 && bx0 > ax0) {
        rx.fillStyle = "rgba(48,160,80,0.08)";
        rx.fillRect(ax0, 0, bx0 - ax0, rH);
      }
    }
    // Loop A/B markers
    if (loopA2) {
      var ax = loopX(loopA2);
      if (ax > 0 && ax < cw) {
        rx.fillStyle = "#30a050"; rx.beginPath(); rx.moveTo(ax, 0); rx.lineTo(ax+5, 0); rx.lineTo(ax, 6); rx.closePath(); rx.fill();
        rx.strokeStyle = "#30a050"; rx.lineWidth = 1.5; rx.beginPath(); rx.moveTo(ax, 0); rx.lineTo(ax, rH); rx.stroke();
      }
    }
    if (loopB2) {
      var bx2 = loopX(loopB2);
      if (bx2 > 0 && bx2 < cw) {
        rx.fillStyle = "#d04040"; rx.beginPath(); rx.moveTo(bx2, 0); rx.lineTo(bx2-5, 0); rx.lineTo(bx2, 6); rx.closePath(); rx.fill();
        rx.strokeStyle = "#d04040"; rx.lineWidth = 1.5; rx.beginPath(); rx.moveTo(bx2, 0); rx.lineTo(bx2, rH); rx.stroke();
      }
    }
  }, [song, ati, cur, scrollX, viewW, mwArr, props.loopA, props.loopB]);

  return (
    <div style={{height:rH,overflow:"hidden",background:th.ruler||"#eee8da",boxShadow:"0 3px 6px rgba(0,0,0,0.25)",borderBottom:"1px solid var(--border-subtle,"+(th.hdrB||"#999")+")",cursor:"pointer"}}
      onClick={function(e){
        if(!props.setCur)return;
        var rect=e.currentTarget.getBoundingClientRect();
        var zf=(props.zoom||100)/100;
        var cx=(e.clientX-rect.left)/zf+scrollX;
        var activeTrack=song.tracks[ati];
        var mx=LW;
        for(var mi=0;mi<mwArr.length;mi++){
          var mw=mwArr[mi]*BW+MP*2;
          if(cx>=mx&&cx<mx+mw+1){
            var rMeas=activeTrack&&mi<activeTrack.measures.length?activeTrack.measures[mi]:null;
            var nBeats=rMeas?rMeas.beats.length:mwArr[mi];
            var beatW2=nBeats>0?((mw-MP*2)/nBeats):BW;
            var b=Math.floor((cx-mx-MP)/beatW2);
            b=Math.max(0,Math.min(b,nBeats-1));
            props.setCur({measure:mi,beat:b,string:props.cur.string});
            return;
          }
          mx+=mw+1;
        }
      }}>
      <canvas ref={ref} style={{display:"block",pointerEvents:"none"}} />
    </div>
  );
}

function TrackRow(props) {
  var track = props.track, ti = props.ti, activeTi = props.activeTi;
  var cursor = props.cursor, setCursor = props.setCursor;
  var playing = props.playing, playPos = props.playPos;
  var scrollX = props.scrollX || 0, viewW = props.viewW || 800;
  var mwArr = props.measWidths || []; // shared max-beat-count per measure
  var th = props.th || {};
  var sel = props.sel;
  var setSel = props.setSel;
  var dragStart = useRef(null);
  var didDrag = useRef(false);

  // Convert pixel x to {measure, beat}
  function xToMB(cx) {
    for (var mi3 = 0; mi3 < track.measures.length; mi3++) {
      var mStart = measX[mi3];
      var sharedBeats3 = (mi3 < mwArr.length) ? mwArr[mi3] : track.measures[mi3].beats.length;
      var mw = sharedBeats3 * BW + MP * 2;
      if (cx >= mStart && cx < mStart + mw) {
        var clickBeatW = (track.measures[mi3].beats.length > 0) ? ((mw - MP*2) / track.measures[mi3].beats.length) : BW;
        var b = Math.floor((cx - mStart - MP) / clickBeatW);
        b = Math.max(0, Math.min(b, track.measures[mi3].beats.length - 1));
        return {measure: mi3, beat: b};
      }
    }
    return null;
  }

  var handleMouseDown = useCallback(function(e) {
    if (e.button !== 0) return;
    if (e.shiftKey) return; // Shift+click handled in handleClick, don't start drag
    var c = ref.current; if (!c) return;
    var r = c.getBoundingClientRect();
    var zf = (props.zoom || 100) / 100;
    var cx = (e.clientX - r.left) / zf + scrollX;
    var mb = xToMB(cx);
    if (mb) {
      dragStart.current = mb; didDrag.current = false;
      if (props.onDragStart) props.onDragStart(ti, mb.measure, mb.beat);
    }
  }, [track, scrollX, measX]);

  var handleMouseMove = useCallback(function(e) {
    if (!dragStart.current || e.buttons !== 1) return;
    var c = ref.current; if (!c) return;
    var r = c.getBoundingClientRect();
    var zf = (props.zoom || 100) / 100;
    var cx = (e.clientX - r.left) / zf + scrollX;
    var mb = xToMB(cx);
    if (mb) {
      var ds = dragStart.current;
      if (ds.measure !== mb.measure || ds.beat !== mb.beat) {
        didDrag.current = true;
        // Container handles sel update for cross-track drag support
      }
    }
  }, [track, scrollX, measX]);

  var handleMouseUp = useCallback(function(e) {
    if (didDrag.current && dragStart.current) {
      // Move cursor to end of selection
      var c = ref.current; if (c) {
        var r = c.getBoundingClientRect();
        var zf = (props.zoom || 100) / 100;
        var cx = (e.clientX - r.left) / zf + scrollX;
        var mb = xToMB(cx);
        if (mb) setCursor({measure: mb.measure, beat: mb.beat, string: props.cursor ? props.cursor.string : 0});
      }
    }
    dragStart.current = null;
  }, [track, scrollX, measX, setCursor]);
  var ref = useRef(null);
  var ns = track.numStrings;
  var napp = props.appearance || {};
  var numFontFamily = napp.numFontFamily || "Consolas,monospace";
  var numScale = napp.numScale || 1;
  var staffScale = napp.staffScale || 1;
  var SG = Math.round(13 * staffScale), BW = 18, LW = 24, MP = 3;
  function numFont(px, bold){ return (bold?"bold ":"") + Math.max(5,Math.round(px*numScale)) + "px " + numFontFamily; }
  var topTextH = track.hasTopText ? 12 : 0;
  var botTextH = track.hasBottomText ? 12 : 0;
  var rowH = ns * SG + 12 + topTextH + botTextH;

  // Calculate total virtual width using SHARED measure widths for alignment
  var measX = [];
  var totalVW = LW;
  for (var mi2 = 0; mi2 < track.measures.length; mi2++) {
    measX.push(totalVW);
    var sharedBeats = (mi2 < mwArr.length) ? mwArr[mi2] : track.measures[mi2].beats.length;
    totalVW += sharedBeats * BW + MP * 2 + 1;
  }
  totalVW += 20;

  useEffect(function() {
    var c = ref.current; if (!c) return;
    try {
      var x = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
      var cw = viewW || (typeof window !== "undefined" ? window.innerWidth : 800);
      c.width = cw * dpr; c.height = rowH * dpr;
      c.style.width = cw + "px"; c.style.height = rowH + "px";
      x.scale(dpr, dpr); x.imageSmoothingEnabled = false; x.fillStyle = th.canvas||"#fffef8"; x.fillRect(0, 0, cw, rowH);
      var yOff = topTextH; // offset all tab content below top text line
      var _cursorDrawn = false;

      // Draw only visible measures
      // Precompute flat beat positions for playback highlight
      var measFlat = []; var mfp = 0;
      for (var mfi = 0; mfi < track.measures.length; mfi++) {
        measFlat.push(mfp);
        mfp += track.measures[mfi].beats.length;
      }
      for (var mi = 0; mi < track.measures.length; mi++) {
        var mStart = measX[mi];
        var m = track.measures[mi];
        var sharedBeats2 = (mi < mwArr.length) ? mwArr[mi] : m.beats.length;
        var mw = sharedBeats2 * BW + MP * 2;
        var mEnd = mStart + mw;

        // Skip if entirely outside viewport
        if (mEnd < scrollX - 50) continue;
        if (mStart > scrollX + viewW + 50) break;

        var mx = mStart - scrollX;
        var rx = mx + mw;

        // Calculate beat spacing: spread track beats evenly within shared width
        var trkBeatW = (m.beats.length > 0) ? ((mw - MP * 2) / m.beats.length) : BW;

        // Measure number and ATR indicator
        x.fillStyle = "#bbb"; x.font = "7px system-ui,sans-serif"; x.textAlign = "center";
        var measLabel = String(mi+1);
        // Time signature detection
        var ts = getTimeSig(m);
        var prevTs = (mi > 0 && track.measures[mi-1]) ? getTimeSig(track.measures[mi-1]) : null;
        var tsChanged = (mi === 0 || !prevTs || prevTs.num !== ts.num || prevTs.den !== ts.den);
        if (tsChanged) {
          measLabel = "Time Sig: " + timeSigLabel(ts) + "  M" + String(mi+1);
        }
        if (m.isATR) {
          x.fillStyle = "rgba(200,180,255,0.15)";
          x.fillRect(mx, 0, mw, rowH);
        }
        x.fillStyle = m.isATR ? "#6040a0" : (th.dim||"#aaa"); x.font = "7px system-ui,sans-serif"; x.textAlign = "center"; x.textBaseline = "top";
        x.fillText(measLabel, mx + mw/2, 1);
        x.textBaseline = "alphabetic";

        // Left bar
        x.strokeStyle = th.bar||"#333"; x.lineWidth = 1;
        x.beginPath(); x.moveTo(mx,10+yOff); x.lineTo(mx, 10+yOff+(ns-1)*SG); x.stroke();

        // Right bar
        if (m.barLine === "double" || m.staffBreak) {
          x.lineWidth = 1; x.beginPath(); x.moveTo(rx-2,10+yOff); x.lineTo(rx-2, 10+yOff+(ns-1)*SG); x.stroke();
          x.lineWidth = 2.5; x.beginPath(); x.moveTo(rx,10+yOff); x.lineTo(rx, 10+yOff+(ns-1)*SG); x.stroke();
        } else if (m.barLine === "repeatEnd") {
          x.lineWidth = 1; x.beginPath(); x.moveTo(rx-4,10+yOff); x.lineTo(rx-4, 10+yOff+(ns-1)*SG); x.stroke();
          x.lineWidth = 2.5; x.beginPath(); x.moveTo(rx,10+yOff); x.lineTo(rx, 10+yOff+(ns-1)*SG); x.stroke();
          x.fillStyle = th.dot||"#000"; var cy = 10+yOff+Math.floor((ns-1)/2)*SG;
          x.beginPath(); x.arc(rx-8,cy-3,1.5,0,Math.PI*2); x.fill();
          x.beginPath(); x.arc(rx-8,cy+3,1.5,0,Math.PI*2); x.fill();
          if (m.repeatCount > 0) {
            x.fillStyle = "#c00"; x.font = "bold 7px Tahoma"; x.textAlign = "right";
            x.fillText("x" + String(m.repeatCount), rx - 2, rowH - 1);
          }
        } else if (m.barLine === "repeatBoth") {
          // Open side on LEFT bar: thick + thin + dots
          x.lineWidth = 2.5; x.beginPath(); x.moveTo(mx,10+yOff); x.lineTo(mx, 10+yOff+(ns-1)*SG); x.stroke();
          x.lineWidth = 1; x.beginPath(); x.moveTo(mx+4,10+yOff); x.lineTo(mx+4, 10+yOff+(ns-1)*SG); x.stroke();
          x.fillStyle = th.dot||"#000"; var cyb = 10+yOff+Math.floor((ns-1)/2)*SG;
          x.beginPath(); x.arc(mx+8,cyb-3,1.5,0,Math.PI*2); x.fill();
          x.beginPath(); x.arc(mx+8,cyb+3,1.5,0,Math.PI*2); x.fill();
          // Close side on RIGHT bar: dots + thin + thick
          x.lineWidth = 1; x.beginPath(); x.moveTo(rx-4,10+yOff); x.lineTo(rx-4, 10+yOff+(ns-1)*SG); x.stroke();
          x.lineWidth = 2.5; x.beginPath(); x.moveTo(rx,10+yOff); x.lineTo(rx, 10+yOff+(ns-1)*SG); x.stroke();
          x.fillStyle = th.dot||"#000";
          x.beginPath(); x.arc(rx-8,cyb-3,1.5,0,Math.PI*2); x.fill();
          x.beginPath(); x.arc(rx-8,cyb+3,1.5,0,Math.PI*2); x.fill();
          if (m.repeatCount > 0) {
            x.fillStyle = "#c00"; x.font = "bold 7px Tahoma"; x.textAlign = "right";
            x.fillText("x" + String(m.repeatCount), rx - 2, rowH - 1);
          }
          // Normal right bar
          x.strokeStyle = th.bar||"#333"; x.lineWidth = 0.5;
          x.beginPath(); x.moveTo(rx,10+yOff); x.lineTo(rx, 10+yOff+(ns-1)*SG); x.stroke();
        } else if (m.barLine === "repeatStart") {
          x.lineWidth = 2.5; x.beginPath(); x.moveTo(mx,10+yOff); x.lineTo(mx, 10+yOff+(ns-1)*SG); x.stroke();
          x.lineWidth = 1; x.beginPath(); x.moveTo(mx+4,10+yOff); x.lineTo(mx+4, 10+yOff+(ns-1)*SG); x.stroke();
          x.fillStyle = th.dot||"#000"; var cy3 = 10+yOff+Math.floor((ns-1)/2)*SG;
          x.beginPath(); x.arc(mx+8,cy3-3,1.5,0,Math.PI*2); x.fill();
          x.beginPath(); x.arc(mx+8,cy3+3,1.5,0,Math.PI*2); x.fill();
        } else {
          x.lineWidth = 0.7; x.beginPath(); x.moveTo(rx,10+yOff); x.lineTo(rx, 10+yOff+(ns-1)*SG); x.stroke();
        }

        // Strings
        for (var s2 = 0; s2 < ns; s2++) {
          x.strokeStyle = th.line||"#c0c0b8"; x.lineWidth = 0.6;
          x.beginPath(); x.moveTo(mx, 11+yOff+(ns-1-s2)*SG); x.lineTo(rx, 11+yOff+(ns-1-s2)*SG); x.stroke();
        }

        // Notes
        for (var bi = 0; bi < m.beats.length; bi++) {
          var bx = mx + MP + bi * trkBeatW + trkBeatW/2;
          if (bx < -BW || bx > cw + BW) continue;
          var pi = (measFlat[mi]||0) + bi;
          // Selection highlight (all strings)
          if (sel) {
            var selST = sel.startTrack != null ? Math.min(sel.startTrack, sel.endTrack) : activeTi;
            var selET = sel.endTrack != null ? Math.max(sel.startTrack, sel.endTrack) : activeTi;
            if (ti >= selST && ti <= selET) {
            var sm=sel.startMeasure,sb=sel.startBeat,em=sel.endMeasure,eb=sel.endBeat;
            if(sm>em||(sm===em&&sb>eb)){var _t=sm;sm=em;em=_t;var _t2=sb;sb=eb;eb=_t2;}
            var inSel=false;
            if(mi>sm&&mi<em) inSel=true;
            else if(mi===sm&&mi===em) inSel=(bi>=sb&&bi<=eb);
            else if(mi===sm) inSel=(bi>=sb);
            else if(mi===em) inSel=(bi<=eb);
            if(inSel){x.fillStyle=th.sel||"rgba(50,106,197,0.25)";x.fillRect(bx-BW/2,2,BW,rowH-4);}
            }
          }
          if (ti === activeTi && mi === cursor.measure && bi === cursor.beat) {
            x.fillStyle = playing ? (th.playCursor||"rgba(0,180,0,.15)") : "rgba(0,80,200,.06)";
            x.fillRect(bx-BW/2, 2, BW, rowH-4);
          }
          if (playing && playPos >= 0) {
            // Convert global playPos to this track's visual beat
            var gpFlat = 0, playMi2 = -1, playGbi = -1;
            for (var pmi = 0; pmi < track.measures.length; pmi++) {
              var pgb = track.measures[pmi].globalBeatsPerMeasure || BPM;
              if (gpFlat + pgb > playPos) { playMi2 = pmi; playGbi = playPos - gpFlat; break; }
              gpFlat += pgb;
            }
            if (playMi2 === mi) {
              // Map global beat to visual beat
              var pvbi = playGbi;
              var pga = 0;
              for (var pvw = 0; pvw < m.beats.length; pvw++) {
                if (pga >= playGbi) { pvbi = pvw; break; }
                var pvb = m.beats[pvw];
                var pgc = 1;
                if (pvb && pvb.atrGroup && pvb.atrGroup > 1) pgc = (pvb.atrNum || 1) / pvb.atrGroup;
                pga += pgc;
                pvbi = pvw + 1;
              }
              if (pvbi === bi) {
                x.fillStyle = th.playFill||"rgba(0,180,0,.18)";
                x.fillRect(bx-BW/2, 0, BW, rowH);
                x.strokeStyle = th.playStroke||"rgba(0,180,0,.6)"; x.lineWidth = 2;
                x.beginPath(); x.moveTo(bx-BW/2+1, 0); x.lineTo(bx-BW/2+1, rowH); x.stroke();
              }
            }
          }
          var beat = m.beats[bi];
          if (beat.atrGroup && beat.atrGroup > 1) {
            x.fillStyle = "rgba(160,96,208,0.15)"; x.fillRect(bx-BW/2, 2, BW, rowH-4);
            x.fillStyle = "#a060d0"; x.font = "bold 6px Tahoma"; x.textAlign = "center";
            x.fillText(String(beat.atrGroup)+":"+(beat.atrNum||1), bx, rowH-1);
          }
          for (var si = 0; si < ns; si++) {
            var note = beat.notes[si]; if (!note) continue;
            var sy = 11 + yOff + (ns-1-si) * SG;
            // Technique-only marker: show effect char on string line with no fret
            if (note.techniqueOnly || note.vibratoOnly) {
              var tchar = efxChar(note.effect) || "~";
              x.fillStyle = th.efx||"#c06000"; x.font = "bold 9px Consolas,monospace"; x.textAlign = "center";
              var twt = x.measureText(tchar).width + 4;
              x.fillStyle = th.canvas||"#fffef8"; x.fillRect(bx-twt/2, sy-5, twt, 10);
              x.fillStyle = th.efx||"#c06000";
              x.fillText(tchar, bx, sy+3);
              continue;
            }
            var fs = note.muted ? "x" : (note.stop ? "*" : String(note.fret));
            x.font = numFont(9, true); x.textAlign = "center";
            var tw = x.measureText(fs).width + 4;
            var clrH = Math.max(10, Math.round(10*numScale));
            x.fillStyle = th.canvas||"#fffef8"; x.fillRect(bx-tw/2, sy-Math.round(clrH/2), tw, clrH);
            x.fillStyle = (note.muted || note.stop) ? (th.nStp||"#000") : (note.attack ? (track.isDrum ? (th.drum||"#804") : (th.fret||"#000")) : (th.dim||"#999"));
            x.fillText(fs, bx, sy+3);
            // Per-string effect indicator
            if (note.effect) {
              var echar = efxChar(note.effect);
              if (echar === "<" || echar === "(" || echar === "{") {
                // Wrap fret in effect brackets: <5> (6) {4}
                var closeChar = echar === "<" ? ">" : echar === "(" ? ")" : "}";
                x.fillStyle = th.efx||"#c06000"; x.font = numFont(8, true); x.textAlign = "center";
                x.fillText(echar + fs + closeChar, bx, sy+3);
              } else if (echar) {
                x.fillStyle = th.efx||"#c06000"; x.font = "bold 7px Tahoma";
                x.fillText(echar, bx + tw/2 + 1, sy + 3);
              }
            }
            // Per-note velocity indicator
            if (note.vel !== undefined) {
              x.fillStyle = th.tfx||"#70b0ff"; x.font = "6px Consolas,monospace"; x.textAlign = "center";
              x.fillText("Ve"+note.vel, bx, sy-5);
            }
            // Indefinite ring indicator
            if (note.ring) {
              x.fillStyle = th.efx||"#c06000"; x.font = "bold 8px Consolas,monospace"; x.textAlign = "left";
              x.fillText("!", bx + tw/2 + (note.effect ? 6 : 1), sy + 3);
            }
            // Pre-bend indicator
            if (note.preBend !== undefined) {
              x.fillStyle = th.tfx||"#70b0ff"; x.font = "6px Consolas,monospace"; x.textAlign = "center";
              x.fillText("pb"+note.preBend, bx, sy-5);
            }
            // Bend hold indicator
            if (note.bendHold) {
              x.fillStyle = th.efx||"#c06000"; x.font = "bold 8px Consolas,monospace"; x.textAlign = "left";
              var holdX = bx + tw/2 + (note.effect ? 6 : 1) + (note.ring ? 8 : 0);
              x.fillText("=", holdX, sy + 3);
            }
          }
          // Track effect indicator at bottom of beat column
          if (beat.trkEffect) {
            function fmtFx(fx) {
              var t2 = fx.type, v2 = fx.value;
              if (t2===86) return "V"+v2;
              if (t2===73) return "I"+(v2&0x7F);
              if (t2===84) return "\u266A"+v2;
              if (t2===80) return "P"+v2;
              if (t2===67) return "Ch"+v2;
              if (t2===69) return "Ex"+v2;
              if (t2===82) return "Rv"+v2;
              if (t2===68) return "\u2193"; // Stroke Down arrow
              if (t2===85) return "\u2191"; // Stroke Up arrow
              if (t2===77) return "M"+v2;
              if (t2===66) { var sv=fx.raw16||0; if(sv>32767)sv-=65536; return "B"+(sv>0?"+":"")+sv; }
              if (t2===200) return "Ve"+v2;
              if (t2===201) return fx.delayOn?"DLY":"DLY\u00D7";
              if (t2===202) return fx.octOn?"PS":"PS\u00D7";
              if (t2===204) return fx.tremOn?"TRM":"TRM\u00D7";
              if (t2===205) return v2>0?"ADT":"ADT\u00D7";
              return String.fromCharCode(t2||63)+v2;
            }
            var parts = [fmtFx(beat.trkEffect)];
            if (beat.trkEffect.multi) {
              for (var mi3=0;mi3<beat.trkEffect.multi.length;mi3++) parts.push(fmtFx(beat.trkEffect.multi[mi3]));
            }
            var eName = parts.length > 1 ? parts[0]+"+" : parts[0];
            x.fillStyle = "#e04000"; x.font = "bold 6px Tahoma"; x.textAlign = "center";
            x.fillText(eName, bx, rowH - 1);
          }
          // Cursor box stroke (drawn after notes so it's on top)
          if (ti === activeTi && mi === cursor.measure && bi === cursor.beat && !playing) {
            var curY;
            if (cursor.string === ns && track.hasTopText) {
              curY = topTextH / 2;
            } else if (cursor.string === -1 && track.hasBottomText) {
              curY = rowH - botTextH / 2;
            } else {
              curY = 11 + yOff + (ns-1-Math.max(0,Math.min(cursor.string,ns-1))) * SG;
            }
            x.strokeStyle = th.curB||"#2060d0"; x.lineWidth = 1.5;
            x.strokeRect(bx-BW/2+1, curY-5, BW-2, 11);
            x.strokeStyle = "rgba(32,96,208,0.2)"; x.lineWidth = 1;
            x.beginPath(); x.moveTo(bx, 2+yOff); x.lineTo(bx, yOff+(ns-1)*SG+10); x.stroke();
            if (props.onCursorRect) {
              // bx is already scroll-relative (mx = mStart - scrollX), so it's canvas-local screen x
              props.onCursorRect({ x: bx, y: curY, string: cursor.string });
              _cursorDrawn = true;
            }
          }
        }
      }
    } catch(err) { console.error("Canvas:", err); }
    if (props.onCursorRect && ti === activeTi && !_cursorDrawn) { props.onCursorRect(null); }

    // Draw text line characters (second pass - on top of everything)
    try {
      var c2 = ref.current; if (c2) {
        var x2 = c2.getContext("2d");
        for (var tmi = 0; tmi < track.measures.length; tmi++) {
          var tmStart = measX[tmi];
          var tm = track.measures[tmi];
          var tmShared = (tmi < mwArr.length) ? mwArr[tmi] : tm.beats.length;
          var tmw2 = tmShared * BW + MP * 2;
          var tmEnd = tmStart + tmw2;
          if (tmEnd < scrollX - 50) continue;
          if (tmStart > scrollX + viewW + 50) break;
          var tmx = tmStart - scrollX;
          var tbw = (tm.beats.length > 0) ? ((tmw2 - MP * 2) / tm.beats.length) : BW;
          for (var tbi = 0; tbi < tm.beats.length; tbi++) {
            var tbx = tmx + MP + tbi * tbw + tbw / 2;
            var tb = tm.beats[tbi];
            if (track.hasTopText && tb.topChar && tb.topChar >= 32 && tb.topChar < 127) {
              x2.fillStyle = th.tfx||"#336"; x2.font = "bold 9px Consolas,monospace"; x2.textAlign = "center";
              x2.fillText(String.fromCharCode(tb.topChar), tbx, topTextH - 2);
            }
            if (track.hasBottomText && tb.botChar && tb.botChar >= 32 && tb.botChar < 127) {
              x2.fillStyle = th.tfx||"#336"; x2.font = "bold 9px Consolas,monospace"; x2.textAlign = "center";
              x2.fillText(String.fromCharCode(tb.botChar), tbx, rowH - botTextH + 10);
            }
          }
        }
        // Separator lines
        if (track.hasTopText && topTextH > 0) {
          x2.strokeStyle = "#bbd"; x2.lineWidth = 0.5;
          x2.beginPath(); x2.moveTo(0, topTextH); x2.lineTo(Math.min(viewW,totalVW), topTextH); x2.stroke();
        }
        if (track.hasBottomText && botTextH > 0) {
          x2.strokeStyle = "#bbd"; x2.lineWidth = 0.5;
          x2.beginPath(); x2.moveTo(0, rowH-botTextH); x2.lineTo(Math.min(viewW,totalVW), rowH-botTextH); x2.stroke();
        }
      }
      // Sticky tuning labels drawn LAST so they overlay measures that would scroll beneath
      x.fillStyle = th.lblBg || th.canvas || "#fffef8";
      x.fillRect(0, 0, LW, rowH);
      x.strokeStyle = th.hdrB || "#aca899"; x.lineWidth = 0.5;
      x.beginPath(); x.moveTo(LW - 0.5, 0); x.lineTo(LW - 0.5, rowH); x.stroke();
      x.font = "bold 9px 'SF Mono','Cascadia Code','Consolas','Menlo','Monaco','Courier New',monospace"; x.textAlign = "center"; x.textBaseline = "middle";
      for (var s2 = 0; s2 < ns; s2++) {
        var isActiveStr = (ti === activeTi && cursor && cursor.string === s2);
        x.fillStyle = isActiveStr ? (th.curBar||"#3264dc") : (th.sLbl||"#555");
        var tunLabel = track.isDrum ? String(track.tuning[s2]) : midiName(track.tuning[s2]||40);
        x.fillText(tunLabel, LW / 2, 11+yOff+(ns-1-s2)*SG);
      }
      x.textBaseline = "alphabetic";
    } catch(e2) {}
  }, [track, cursor, activeTi, ti, playing, playPos, ns, rowH, scrollX, viewW, totalVW, measX, sel]);

  var handleClick = useCallback(function(e) {
    // Skip click if we just completed a drag selection (but allow shift+click through)
    if (!e.shiftKey && (didDrag.current || (props.globalDidDrag && props.globalDidDrag.current))) { didDrag.current = false; if(props.globalDidDrag)props.globalDidDrag.current=false; return; }
    didDrag.current = false; if(props.globalDidDrag)props.globalDidDrag.current=false;
    var c = ref.current; if (!c) return;
    var r = c.getBoundingClientRect();
    var zf = (props.zoom || 100) / 100;
    var cx = (e.clientX - r.left) / zf + scrollX;
    var cy2 = (e.clientY - r.top) / zf;
    for (var mi = 0; mi < track.measures.length; mi++) {
      var mStart = measX[mi];
      var sharedBeats3 = (mi < mwArr.length) ? mwArr[mi] : track.measures[mi].beats.length;
      var mw = sharedBeats3 * BW + MP * 2;
      if (cx >= mStart && cx < mStart + mw) {
        var clickBeatW = (track.measures[mi].beats.length > 0) ? ((mw - MP*2) / track.measures[mi].beats.length) : BW;
        var bi = Math.floor((cx - mStart - MP) / clickBeatW);
        if (bi >= 0 && bi < track.measures[mi].beats.length) {
          var best = 0, bestD = 99999;
          // Check text lines first
          if (track.hasTopText && cy2 < topTextH + 3) {
            best = ns; // top text = numStrings
          } else if (track.hasBottomText && cy2 > rowH - botTextH - 3) {
            best = -1; // bottom text = -1
          } else {
            for (var s = 0; s < ns; s++) { var dd = Math.abs(cy2-(11+topTextH+(ns-1-s)*SG)); if (dd < bestD) { bestD = dd; best = s; } }
          }
          setCursor({ measure: mi, beat: bi, string: best, _tapX: e.clientX, _tapY: e.clientY });
          // Shift+Click: extend selection from cursor to click point
          if (e.shiftKey) {
            // Use existing selection anchor if available, otherwise cursor position
            var anchorM = sel ? sel.startMeasure : (cursor ? cursor.measure : mi);
            var anchorB = sel ? sel.startBeat : (cursor ? cursor.beat : bi);
            var newSel = {startMeasure: anchorM, startBeat: anchorB, endMeasure: mi, endBeat: bi};
            // Accumulate track range
            var anchorTi = sel && sel.startTrack != null ? sel.startTrack : activeTi;
            var curET2 = sel && sel.endTrack != null ? sel.endTrack : activeTi;
            if (ti !== anchorTi || anchorTi !== curET2) {
              newSel.startTrack = Math.min(anchorTi, ti);
              newSel.endTrack = Math.max(curET2, ti);
            }
            if (setSel) setSel(newSel);
          } else if (props.selectModeRef && props.selectModeRef.current) {
            // Select mode: fresh single-beat selection, reset origin track
            if (setSel) setSel({startMeasure: mi, startBeat: bi, endMeasure: mi, endBeat: bi});
            if (props.selOriginTrack) props.selOriginTrack.current = ti;
          } else {
            if (setSel) setSel(null);
          }
        }
        return;
      }
    }
  }, [track, ns, setCursor, scrollX, measX]);

  return (
    <div style={{position:"relative",height:rowH,width:Math.max(totalVW, viewW)}}>
      <canvas ref={ref} onClick={handleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{display:"block",cursor:"crosshair",position:"sticky",left:0}} />
    </div>
  );
}

// === MOBILE KEYBOARD ===
function MobileKeyboard(props) {
  var song = props.song, ati = props.ati, cur = props.cur, track = props.track;
  var setCur = props.setCur, setAti = props.setAti, atiRef = props.atiRef;
  var placeNote = props.placeNote, placeMuted = props.placeMuted, placeStop = props.placeStop;
  var clearBeat = props.clearBeat, toggleEffect = props.toggleEffect, doPlay = props.doPlay;
  var stopPlay = props.stopPlay, playing = props.playing, openDlg = props.openDlg;
  var buildEfxData = props.buildEfxData, doUndo = props.doUndo;
  var sel = props.sel, setSel = props.setSel, clipboard = props.clipboard;
  var normSel = props.normSel, setStatus = props.setStatus, cutBeat = props.cutBeat;
  var th = props.th, BPM = 16;
  var efxMode = useState(false), showEfx = efxMode[0], setShowEfx = efxMode[1];
  var selMode = useState(false), selectMode = selMode[0], setSelectMode = selMode[1];
  var editMenuState = useState(false), showEditMenu = editMenuState[0], setShowEditMenu = editMenuState[1];
  var isTextLine = cur.string === track.numStrings || cur.string === -1;

  var stopPopState = useState(false); var showStopPop = stopPopState[0]; var setShowStopPop = stopPopState[1];
  var pracPopState = useState(false); var showPracticePop = pracPopState[0]; var setShowPracticePop = pracPopState[1];
  var stopLpTimer = useRef(null);
  var mobileHelpState = useState(false); var showMobileHelp = mobileHelpState[0]; var setShowMobileHelp = mobileHelpState[1];

  // Sync selectMode from ref (palette can toggle it externally)
  useEffect(function(){
    if (props.selectModeRef && props.selectModeRef.current !== selectMode) {
      setSelectMode(props.selectModeRef.current);
    }
  }, [sel]);

  function nav(dm, db, ds) {
    var m = cur.measure + dm, b = cur.beat + db, s = cur.string + ds;
    var t2 = song.tracks[ati];
    if (dm !== 0 && db === 0) { b = 0; }
    if (dm === 0 && db !== 0) {
      var bts = t2.measures[cur.measure] ? t2.measures[cur.measure].beats.length : BPM;
      if (b >= bts) { m++; b = 0; } else if (b < 0) { m--; b = m >= 0 && t2.measures[m] ? t2.measures[m].beats.length - 1 : 0; }
    }
    m = Math.max(0, Math.min(m, t2.measures.length - 1));
    var maxS = track.hasTopText ? track.numStrings : track.numStrings - 1;
    var minS = track.hasBottomText ? -1 : 0;
    s = Math.max(minS, Math.min(s, maxS));
    if (selectMode && (db !== 0 || dm !== 0) && ds === 0) {
      // Extend selection, preserving track range
      if (!sel) setSel({startMeasure: cur.measure, startBeat: cur.beat, endMeasure: m, endBeat: b});
      else {
        var newSel2 = {startMeasure: sel.startMeasure, startBeat: sel.startBeat, endMeasure: m, endBeat: b};
        if (sel.startTrack != null) { newSel2.startTrack = sel.startTrack; newSel2.endTrack = sel.endTrack; }
        setSel(newSel2);
      }
    } else if (!selectMode && ds === 0) {
      setSel(null);
    }
    setCur({measure: m, beat: b, string: s});
    if (props.scrollToMeasure) props.scrollToMeasure(m);
  }

  function doCut() {
    if (!sel) { cutBeat(); return; }
    var selN = normSel(sel, track);
    var s5 = JSON.parse(JSON.stringify(song));
    var tSt=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
    var tEn=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
    if(tSt===tEn){
      var copied = [];
      var barBreaks = [];
      var barMeta = [];
      for (var si5 = selN.sm; si5 <= selN.em; si5++) {
        var m5 = track.measures[si5]; if (!m5) continue;
        var sb5 = (si5 === selN.sm) ? selN.sb : 0;
        var eb5 = (si5 === selN.em) ? selN.eb : m5.beats.length - 1;
        var barCount = 0;
        for (var bi5 = sb5; bi5 <= eb5; bi5++) {
          copied.push(JSON.parse(JSON.stringify(m5.beats[bi5])));
          s5.tracks[ati].measures[si5].beats[bi5] = {notes: Array(track.numStrings).fill(null)};
          barCount++;
        }
        barBreaks.push(barCount);
        // Capture ATR metadata only for fully-selected bars
        var fullBar = (sb5===0 && eb5===m5.beats.length-1);
        barMeta.push(fullBar ? {isATR:!!m5.isATR, beatsPerMeasure:m5.beatsPerMeasure, globalBeatsPerMeasure:m5.globalBeatsPerMeasure, timeSig:m5.timeSig} : null);
      }
      clipboard.current = {type: "range", data: copied, numStrings: track.numStrings, barBreaks: barBreaks, barMeta: barMeta};
      setStatus("Cut " + copied.length + " beats");
    } else {
      var mtTracks=[];
      for(var mti=tSt;mti<=tEn&&mti<song.tracks.length;mti++){var mtk=song.tracks[mti];var mtd=[];for(var msi=selN.sm;msi<=selN.em;msi++){var mm=mtk.measures[msi];if(!mm)continue;var msb=(msi===selN.sm)?selN.sb:0;var meb=(msi===selN.em)?selN.eb:mm.beats.length-1;for(var mbi=msb;mbi<=meb;mbi++){mtd.push(JSON.parse(JSON.stringify(mm.beats[mbi])));s5.tracks[mti].measures[msi].beats[mbi]={notes:Array(mtk.numStrings).fill(null)};}}mtTracks.push({data:mtd,numStrings:mtk.numStrings});}
      clipboard.current={type:"multitrack",tracks:mtTracks};setStatus("Cut "+mtTracks.length+" tracks");
    }
    props.setSong(s5);
  }

  function doCopy() {
    if (sel) {
      var selN2 = normSel(sel, track);
      var tSt2=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
      var tEn2=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
      if(tSt2===tEn2){
        var copied2 = [];
        var barBreaks = [];
        var barMeta = [];
        for (var si6 = selN2.sm; si6 <= selN2.em; si6++) {
          var m6 = track.measures[si6]; if (!m6) continue;
          var sb6 = (si6 === selN2.sm) ? selN2.sb : 0;
          var eb6 = (si6 === selN2.em) ? selN2.eb : m6.beats.length - 1;
          var barCount = 0;
          for (var bi6 = sb6; bi6 <= eb6; bi6++) { copied2.push(JSON.parse(JSON.stringify(m6.beats[bi6]))); barCount++; }
          barBreaks.push(barCount);
          var fullBar2 = (sb6===0 && eb6===m6.beats.length-1);
          barMeta.push(fullBar2 ? {isATR:!!m6.isATR, beatsPerMeasure:m6.beatsPerMeasure, globalBeatsPerMeasure:m6.globalBeatsPerMeasure, timeSig:m6.timeSig} : null);
        }
        clipboard.current = {type: "range", data: copied2, numStrings: track.numStrings, barBreaks: barBreaks, barMeta: barMeta};
        setStatus("Copied " + copied2.length + " beats");
      } else {
        var mtTracks2=[];
        for(var mti2=tSt2;mti2<=tEn2&&mti2<song.tracks.length;mti2++){var mtk2=song.tracks[mti2];var mtd2=[];for(var msi2=selN2.sm;msi2<=selN2.em;msi2++){var mm2=mtk2.measures[msi2];if(!mm2)continue;var msb2=(msi2===selN2.sm)?selN2.sb:0;var meb2=(msi2===selN2.em)?selN2.eb:mm2.beats.length-1;for(var mbi2=msb2;mbi2<=meb2;mbi2++){mtd2.push(JSON.parse(JSON.stringify(mm2.beats[mbi2])));}}mtTracks2.push({data:mtd2,numStrings:mtk2.numStrings});}
        clipboard.current={type:"multitrack",tracks:mtTracks2};setStatus("Copied "+mtTracks2.length+" tracks");
      }
    } else {
      try {
        var cb = track.measures[cur.measure].beats[cur.beat];
        clipboard.current = {type: "beat", data: JSON.parse(JSON.stringify(cb)), numStrings: track.numStrings};
        setStatus("Copied beat");
      } catch(e) {}
    }
  }

  function doPaste() {
    if (!clipboard.current) return;
    var s6 = JSON.parse(JSON.stringify(song));
    if(clipboard.current.type==="multitrack"){
      var mtSrc=clipboard.current.tracks;
      for(var pti=0;pti<mtSrc.length&&ati+pti<s6.tracks.length;pti++){
        var pdst=s6.tracks[ati+pti];var psrcNS=mtSrc[pti].numStrings||6;var pdstNS=pdst.numStrings;var pbeats=mtSrc[pti].data;
        var ppm=cur.measure,ppb=cur.beat;
        for(var ppi=0;ppi<pbeats.length;ppi++){if(ppm>=pdst.measures.length)break;var pSrcBt=JSON.parse(JSON.stringify(pbeats[ppi]));var pMap=Array(pdstNS).fill(null);for(var psn=0;psn<psrcNS&&psn<pSrcBt.notes.length;psn++){if(!pSrcBt.notes[psn])continue;if(pdstNS<psrcNS){if(psn<pdstNS)pMap[psn]=pSrcBt.notes[psn];}else if(pdstNS>psrcNS){var poff=pdstNS-psrcNS;if(psn+poff<pdstNS)pMap[psn+poff]=pSrcBt.notes[psn];}else{pMap[psn]=pSrcBt.notes[psn];}}pSrcBt.notes=pMap;pdst.measures[ppm].beats[ppb]=pSrcBt;ppb++;if(ppb>=pdst.measures[ppm].beats.length){ppm++;ppb=0;}}
      }
      props.setSong(s6);setStatus("Pasted "+mtSrc.length+" tracks");
    } else {
    var dst = s6.tracks[ati];
    var srcNS = clipboard.current.numStrings || 6;
    var dstNS = dst.numStrings;
    var beats6 = clipboard.current.type === "range" ? clipboard.current.data : [clipboard.current.data];
    var barBreaks = clipboard.current.barBreaks;
    var barMeta = clipboard.current.barMeta;
    function mapNotes(srcBeat){
      var mapped = Array(dstNS).fill(null);
      for (var sn = 0; sn < srcNS && sn < srcBeat.notes.length; sn++) {
        if (!srcBeat.notes[sn]) continue;
        if (dstNS < srcNS) { if (sn < dstNS) mapped[sn] = srcBeat.notes[sn]; }
        else if (dstNS > srcNS) { var off = dstNS - srcNS; if (sn + off < dstNS) mapped[sn + off] = srcBeat.notes[sn]; }
        else mapped[sn] = srcBeat.notes[sn];
      }
      return mapped;
    }
    // If we have bar structure (barBreaks + barMeta), paste bar-by-bar starting at cur.measure,
    // rebuilding whole measures so ATR beat counts / metadata survive.
    var canBarPaste = barBreaks && barMeta && cur.beat === 0;
    if (canBarPaste) {
      var srcIdx = 0;
      var destM = cur.measure;
      for (var bk = 0; bk < barBreaks.length; bk++) {
        if (destM >= dst.measures.length) break;
        var cnt = barBreaks[bk];
        var meta = barMeta[bk];
        var newBeats = [];
        for (var ci = 0; ci < cnt; ci++) {
          var sB = beats6[srcIdx++]; if (!sB) break;
          var nb = JSON.parse(JSON.stringify(sB));
          nb.notes = mapNotes(nb);
          newBeats.push(nb);
        }
        if (meta) {
          // Full bar: rebuild the measure with source structure
          var dm = dst.measures[destM];
          dm.beats = newBeats;
          dm.beatsPerMeasure = meta.beatsPerMeasure != null ? meta.beatsPerMeasure : newBeats.length;
          dm.globalBeatsPerMeasure = meta.globalBeatsPerMeasure != null ? meta.globalBeatsPerMeasure : dm.globalBeatsPerMeasure;
          dm.isATR = !!meta.isATR;
          if (meta.timeSig) dm.timeSig = meta.timeSig;
        } else {
          // Partial bar: overwrite beats in place up to measure length
          var dm2 = dst.measures[destM];
          for (var pj = 0; pj < newBeats.length && pj < dm2.beats.length; pj++) dm2.beats[pj] = newBeats[pj];
        }
        destM++;
      }
      props.setSong(s6);
      setStatus("Pasted " + beats6.length + " beats");
    } else {
    var pm = cur.measure, pb3 = cur.beat;
    var barIdx = 0, inBar = 0;
    for (var pi2 = 0; pi2 < beats6.length; pi2++) {
      if (pm >= dst.measures.length) break;
      var srcBeat = JSON.parse(JSON.stringify(beats6[pi2]));
      srcBeat.notes = mapNotes(srcBeat);
      if (pb3 < dst.measures[pm].beats.length) {
        dst.measures[pm].beats[pb3] = srcBeat;
      }
      pb3++; inBar++;
      if (barBreaks && barBreaks[barIdx] !== undefined && inBar >= barBreaks[barIdx]) {
        pm++; pb3 = 0; barIdx++; inBar = 0;
      } else if (!barBreaks && pb3 >= dst.measures[pm].beats.length) {
        pm++; pb3 = 0;
      }
    }
    props.setSong(s6);
    setStatus("Pasted " + beats6.length + " beats");
    }
    }
  }

  function mobileBackspace() {
    var s4 = JSON.parse(JSON.stringify(song));
    if (cur.string >= 0 && cur.string < track.numStrings) s4.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string] = null;
    props.setSong(s4);
    nav(0, -1, 0);
  }

  function switchTrack(dir) {
    var nt = ati + dir;
    if (nt < 0 || nt >= song.tracks.length) return; // don't wrap
    atiRef.current = nt; setAti(nt);
    setCur({measure: cur.measure, beat: cur.beat, string: Math.min(cur.string, song.tracks[nt].numStrings - 1)});
    if (props.scrollToTrack) setTimeout(function(){props.scrollToTrack(nt);}, 50);
  }

  var btnH = 40, gap = 3, pad = 4;
  var isDark = !!(th.bg && th.bg.charAt(1) < '5');
  var navBg = isDark ? "#3264dc" : "#3264dc";
  var navBg2 = isDark ? "#2252cc" : "#2252cc";
  var efxBtnBg = isDark ? "#3a3530" : "#e8dcc8";
  var efxBtnFg = isDark ? "#e8d8c0" : "#5a4020";
  var switchBg = isDark ? "#605030" : "#b89860";
  var switchFg = "#fff";
  var trkFxBg = isDark ? "#2a4060" : "#5080b0";
  var actBg = isDark ? "#4a3020" : "#e8a040";
  var actFg = isDark ? "#f0d8b0" : "#fff";
  var numBg = isDark ? "#323238" : "#e4e6ec";
  var numFg = isDark ? "#e0e0e0" : "#1a1a2e";
  var defBg = isDark ? "#353540" : "#dfe1e8";
  var defFg = isDark ? "#d4d4d4" : "#1a1a2e";
  var borderCol = isDark ? "#444" : "#d0d4dc";
  var kbBg = isDark ? "#1e1e1e" : "#f0f2f5";
  var toggleBg = isDark ? "#1e1e1e" : "#f0f2f5";
  var selBg = isDark ? "#d4a040" : "#e8a040";
  var btnStyle = function(w, bg, fg, fs) {
    return {
      flex: w || 1, height: btnH, display: "flex", alignItems: "center", justifyContent: "center",
      background: bg || defBg, color: fg || defFg,
      border: "none", borderRadius: 8,
      fontSize: fs || 15, fontWeight: "600", cursor: "pointer", userSelect: "none",
      WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
      letterSpacing: 0.3, transition: "background 0.1s"
    };
  };

  // Text line: hide keyboard entirely, let native keyboard appear
  if (isTextLine) return null;

  // Collapsed: show only toggle bar
  if (!props.kbVisible) {
    return (
      <div style={{flexShrink: 0, background: toggleBg, borderTop: "1px solid var(--border-subtle," + borderCol + ")", padding: "5px 0", textAlign: "center", cursor: "pointer", touchAction: "manipulation"}}
        onClick={props.onToggleKb}>
        <span style={{fontSize: 11, color: defFg, opacity: 0.5}}>{"▲ Keyboard"}</span>
      </div>
    );
  }

  var EFX_LABELS = ["H","P","/","\\","B","R","~","T","S","(","<","{","W","M"];
  var EFX_CODES = [104,112,47,92,98,114,126,116,115,40,60,123,119,109];

  var selBg = isDark ? "#8a6020" : "#d4a020";
  var clipBg = isDark ? "#305050" : "#60a0a0";

  // Shared nav + clipboard zone
  function renderNavZone() {
    return React.createElement("div", {style:{position:"relative"}},
      selectMode ? React.createElement("div", {style:{display:"flex",gap:gap,marginBottom:gap,flexWrap:"wrap"}},
        React.createElement("div", {style:btnStyle(null,clipBg,"#fff",11),onClick:doCut}, "Cut"),
        React.createElement("div", {style:btnStyle(null,clipBg,"#fff",11),onClick:doCopy}, "Copy"),
        React.createElement("div", {style:btnStyle(null,clipBg,"#fff",11),onClick:doPaste}, "Paste"),
        React.createElement("div", {style:btnStyle(null,"#6040c0","#fff",11),onClick:function(){
          var lastM2=song.tracks[0].measures.length-1;
          var lastB2=song.tracks[0].measures[lastM2]?song.tracks[0].measures[lastM2].beats.length-1:0;
          setSel({startMeasure:0,startBeat:0,endMeasure:lastM2,endBeat:lastB2,startTrack:0,endTrack:song.tracks.length-1});
          if(props.selOriginTrack)props.selOriginTrack.current=ati;
        }}, "Select All"),
        React.createElement("div", {style:btnStyle(null,null,null,11),onClick:function(){setSel(null);if(props.selOriginTrack)props.selOriginTrack.current=ati;}}, "Deselect")
      ) : null,
      React.createElement("div", {style:{display:"flex",gap:gap}},
        React.createElement("div", {style:btnStyle(null,navBg,"#fff"),onClick:function(){
          if(selectMode&&sel){
            var ns2=Object.assign({},sel);
            var newM=Math.max(0,(ns2.startMeasure<ns2.endMeasure?ns2.endMeasure:ns2.startMeasure)-1);
            if(ns2.startMeasure<=ns2.endMeasure)ns2.endMeasure=newM; else ns2.startMeasure=newM;
            setSel(ns2);
            if(props.scrollToMeasure)props.scrollToMeasure(newM);
          } else nav(-1,0,0);
        }}, _chevron("left","#fff",14,"double")),
        React.createElement("div", {style:btnStyle(null,navBg,"#fff"),onClick:function(){nav(0,-1,0);}}, _chevron("left","#fff",14)),
        React.createElement("div", {style:btnStyle(null,navBg,"#fff"),onClick:function(){nav(0,0,1);}}, _chevron("up","#fff",14)),
        React.createElement("div", {style:btnStyle(null,navBg,"#fff"),onClick:function(){nav(0,0,-1);}}, _chevron("down","#fff",14)),
        React.createElement("div", {style:btnStyle(null,navBg,"#fff"),onClick:function(){nav(0,1,0);}}, _chevron("right","#fff",14)),
        React.createElement("div", {style:btnStyle(null,navBg,"#fff"),onClick:function(){
          if(selectMode&&sel){
            var ns5=Object.assign({},sel);
            var maxM=song.tracks[0].measures.length-1;
            var newM2=Math.min(maxM,(ns5.startMeasure<=ns5.endMeasure?ns5.endMeasure:ns5.startMeasure)+1);
            if(ns5.startMeasure<=ns5.endMeasure)ns5.endMeasure=newM2; else ns5.startMeasure=newM2;
            setSel(ns5);
            if(props.scrollToMeasure)props.scrollToMeasure(newM2);
          } else nav(1,0,0);
        }}, _chevron("right","#fff",14,"double")),
        React.createElement("div", {style:Object.assign({},btnStyle(1.5,selectMode?selBg:navBg2,"#fff",11),{boxShadow:selectMode?"inset 0 0 0 2px #ffe080, 0 0 6px rgba(255,200,50,0.6)":"none",position:"relative"}),onTouchStart:function(e){if(showEditMenu){e.stopPropagation();setShowEditMenu(false);}},onClick:function(){setShowEditMenu(!showEditMenu);}},
          "Edit",
          showEditMenu ? React.createElement("div", {style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:299},onClick:function(e){e.stopPropagation();setShowEditMenu(false);},onTouchEnd:function(e){e.stopPropagation();setShowEditMenu(false);}}) : null,
          showEditMenu ? React.createElement("div", {style:{position:"absolute",bottom:"110%",left:"50%",transform:"translateX(-50%)",background:"var(--surface-0,#fff)",color:defFg,border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:12,boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,.15))",padding:"4px 0",minWidth:200,zIndex:300,whiteSpace:"nowrap",maxHeight:"70vh",overflowY:"auto"},onClick:function(e){e.stopPropagation();e.preventDefault();},onTouchStart:function(e){e.stopPropagation();},onTouchMove:function(e){e.stopPropagation();},onContextMenu:function(e){e.preventDefault();}},
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();openDlg("altTime");setShowEditMenu(false);}},
              _atrIco(defFg,16), "Alt Time Region"),
            React.createElement("div", {style:{borderTop:"1px solid "+("var(--border-subtle,#e4e8f0)"),margin:"2px 0"}}),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();openDlg("addTrack",props.addTrackData());setShowEditMenu(false);}},
              _addTrackIco(defFg,16), "Add Track"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();if(song.tracks.length>1){if(props.undoLabel)props.undoLabel.current="Delete track";var s3=JSON.parse(JSON.stringify(song));s3.tracks.splice(ati,1);var nA=Math.min(ati,s3.tracks.length-1);atiRef.current=nA;setAti(nA);props.setSong(s3);setStatus("Deleted track");}else{setStatus("Cannot delete last track");}setShowEditMenu(false);}},
              _delTrackIco(defFg,16), "Delete Track"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();var s9=JSON.parse(JSON.stringify(song));if(props.undoLabel)props.undoLabel.current="Duplicate track";var dup=JSON.parse(JSON.stringify(s9.tracks[ati]));dup.name=(dup.name||"Track")+" (copy)";s9.tracks.splice(ati+1,0,dup);props.setSong(s9);atiRef.current=ati+1;setAti(ati+1);setStatus("Duplicated track");setShowEditMenu(false);}},
              _dupTrackIco(defFg,16), "Duplicate Track"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();var tp4=song.tracks[ati];openDlg("trackProps",props.trackPropsData(tp4));setShowEditMenu(false);}},
              _trackPropsIco(defFg,16), "Track Properties"),
            React.createElement("div", {style:{borderTop:"1px solid "+("var(--border-subtle,#e4e8f0)"),margin:"2px 0"}}),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();var si2=JSON.parse(JSON.stringify(song));var it=si2.tracks[ati];var ab=[];for(var m=cur.measure;m<it.measures.length;m++){var s=(m===cur.measure)?cur.beat:0;for(var b=s;b<it.measures[m].beats.length;b++)ab.push(it.measures[m].beats[b]);}ab.unshift({notes:new Array(it.numStrings).fill(null)});ab.pop();var i=0;for(var m2=cur.measure;m2<it.measures.length;m2++){var s2=(m2===cur.measure)?cur.beat:0;for(var b2=s2;b2<it.measures[m2].beats.length;b2++)it.measures[m2].beats[b2]=ab[i++];}if(props.undoLabel)props.undoLabel.current="Insert note";props.setSong(si2);setStatus("Inserted note");setShowEditMenu(false);}},
              _insertIco(defFg,16), "Insert Note"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();var sd=JSON.parse(JSON.stringify(song));var dt=sd.tracks[ati];var ab=[];for(var m=cur.measure;m<dt.measures.length;m++){var s=(m===cur.measure)?cur.beat:0;for(var b=s;b<dt.measures[m].beats.length;b++)ab.push(dt.measures[m].beats[b]);}ab.shift();ab.push({notes:new Array(dt.numStrings).fill(null)});var i=0;for(var m2=cur.measure;m2<dt.measures.length;m2++){var s2=(m2===cur.measure)?cur.beat:0;for(var b2=s2;b2<dt.measures[m2].beats.length;b2++)dt.measures[m2].beats[b2]=ab[i++];}if(props.undoLabel)props.undoLabel.current="Delete note";props.setSong(sd);setStatus("Deleted note");setShowEditMenu(false);}},
              _deleteIco(defFg,16), "Delete Note"),
            React.createElement("div", {style:{borderTop:"1px solid "+("var(--border-subtle,#e4e8f0)"),margin:"2px 0"}}),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();var t2c=song.tracks[ati];openDlg("chord",{root:0,qualIdx:0,posIdx:0,bass:"root",tuning:t2c.tuning.slice(),numStrings:t2c.numStrings,voicings:[],selectedFrets:null});setShowEditMenu(false);}},
              _chordIco(defFg,16), "Chord Builder"),
            React.createElement("div", {style:{borderTop:"1px solid "+("var(--border-subtle,#e4e8f0)"),margin:"2px 0"}}),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();var newSM=!selectMode;setSelectMode(newSM);if(newSM){setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat});props.selOriginTrack.current=ati;}else{setSel(null);props.selOriginTrack.current=null;}if(props.selectModeRef)props.selectModeRef.current=newSM;setShowEditMenu(false);}},
              _selectIco(defFg,16,selectMode), "Select Mode"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:defFg},
              onClick:function(e){e.stopPropagation();doUndo();setShowEditMenu(false);}},
              _undoIco(defFg,16), "Undo")
          ) : null
        ),
        React.createElement("div", {style:btnStyle(null,navBg2,"#fff",11),onClick:function(){
          if(selectMode&&sel){
            var newTi=Math.max(0,ati-1);
            if(newTi!==ati){
              atiRef.current=newTi;setAti(newTi);
              setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[newTi].numStrings-1)});
              var orig=props.selOriginTrack.current!=null?props.selOriginTrack.current:ati;
              setSel(Object.assign({},sel,{startTrack:Math.min(orig,newTi),endTrack:Math.max(orig,newTi)}));
              if(props.scrollToTrack)setTimeout(function(){props.scrollToTrack(newTi);},50);
            }
          } else switchTrack(-1);
        }}, "\u25B2T"),
        React.createElement("div", {style:btnStyle(null,navBg2,"#fff",11),onClick:function(){
          if(selectMode&&sel){
            var newTi2=Math.min(song.tracks.length-1,ati+1);
            if(newTi2!==ati){
              atiRef.current=newTi2;setAti(newTi2);
              setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[newTi2].numStrings-1)});
              var orig2=props.selOriginTrack.current!=null?props.selOriginTrack.current:ati;
              setSel(Object.assign({},sel,{startTrack:Math.min(orig2,newTi2),endTrack:Math.max(orig2,newTi2)}));
              if(props.scrollToTrack)setTimeout(function(){props.scrollToTrack(newTi2);},50);
            }
          } else switchTrack(1);
        }}, "T\u25BC"),
        React.createElement("div", {style:Object.assign({},btnStyle(null,playing?"#b03030":"#308030","#fff"),{position:"relative"}),
          onClick:function(){if(showStopPop){setShowStopPop(false);return;} if(showPracticePop){setShowPracticePop(false);return;} if(playing)stopPlay();else doPlay(true);},
          onContextMenu:function(e){e.preventDefault();},
          onTouchStart:function(){if(showStopPop||showPracticePop)return;if(playing){stopLpTimer.current=setTimeout(function(){setShowStopPop(true);},500);}else{stopLpTimer.current=setTimeout(function(){setShowPracticePop(true);},500);}},
          onTouchEnd:function(){if(stopLpTimer.current){clearTimeout(stopLpTimer.current);stopLpTimer.current=null;}},
          onTouchMove:function(){if(stopLpTimer.current){clearTimeout(stopLpTimer.current);stopLpTimer.current=null;}}
        },
          playing?_stopIco("#fff",14):"\u25B6",
          // Backdrop to close popovers
          (showStopPop || showPracticePop) ? React.createElement("div", {style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:299},onClick:function(e){e.stopPropagation();setShowStopPop(false);setShowPracticePop(false);},onTouchStart:function(e){e.stopPropagation();},onTouchEnd:function(e){e.stopPropagation();setShowStopPop(false);setShowPracticePop(false);}}) : null,
          // Stop popover (long press while playing)
          showStopPop ? React.createElement("div", {style:{position:"absolute",bottom:"110%",right:0,background:"var(--surface-0,#fff)",color:defFg,border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:12,boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,.15))",padding:"4px 0",minWidth:240,zIndex:300,whiteSpace:"nowrap"},onClick:function(e){e.stopPropagation();e.preventDefault();},onTouchStart:function(e){e.stopPropagation();},onTouchMove:function(e){e.stopPropagation();},onContextMenu:function(e){e.preventDefault();}},
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderRadius:8,margin:"0 4px",transition:"background 0.1s"},
              onTouchEnd:function(e){e.stopPropagation();e.preventDefault();stopPlay();setShowStopPop(false);},
              onClick:function(e){e.stopPropagation();stopPlay();setShowStopPop(false);}},
              _stopIco(defFg,14), " Stop playback"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",borderTop:"1px solid var(--border-subtle,#e4e8f0)",display:"flex",alignItems:"center",gap:8,borderRadius:8,margin:"0 4px",transition:"background 0.1s"},
              onTouchEnd:function(e){e.stopPropagation();e.preventDefault();stopPlay();props.setCur({measure:0,beat:0,string:0});if(props.sRef&&props.sRef.current)props.sRef.current.scrollLeft=0;setShowStopPop(false);},
              onClick:function(e){e.stopPropagation();stopPlay();props.setCur({measure:0,beat:0,string:0});if(props.sRef&&props.sRef.current)props.sRef.current.scrollLeft=0;setShowStopPop(false);}},
              _skipBackIco(defFg,14), " Stop and go to beginning")
          ) : null,
          // Practice mode popover (long press while stopped)
          showPracticePop ? React.createElement("div", {style:{position:"absolute",bottom:"110%",right:0,background:"var(--surface-0,#fff)",color:defFg,border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:12,boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,.15))",padding:"4px 0",minWidth:260,zIndex:300,whiteSpace:"nowrap"},onClick:function(e){e.stopPropagation();e.preventDefault();},onTouchStart:function(e){e.stopPropagation();},onTouchMove:function(e){e.stopPropagation();},onContextMenu:function(e){e.preventDefault();}},
            React.createElement("div", {style:{padding:"8px 16px",fontSize:11,fontWeight:"600",color:"var(--dim,#888)",textTransform:"uppercase",letterSpacing:"0.5px"}}, "Practice Mode"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:8,margin:"0 4px",transition:"background 0.1s"},
              onTouchEnd:function(e){e.stopPropagation();e.preventDefault();setShowPracticePop(false);props.openDlg("practice",{speed:props.practiceSpeed||100,autoInc:props.practiceAutoInc,incStep:props.practiceIncStep||5,targetSpeed:props.practiceTargetSpeed||100});},
              onClick:function(e){e.stopPropagation();setShowPracticePop(false);props.openDlg("practice",{speed:props.practiceSpeed||100,autoInc:props.practiceAutoInc,incStep:props.practiceIncStep||5,targetSpeed:props.practiceTargetSpeed||100});}},
              React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("circle",{cx:12,cy:12,r:3}),React.createElement("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})),
              " Settings"),
            React.createElement("div", {style:{height:1,background:"var(--border-subtle,#e4e8f0)",margin:"4px 8px"}}),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:8,margin:"0 4px",transition:"background 0.1s"},
              onTouchEnd:function(e){e.stopPropagation();e.preventDefault();setShowPracticePop(false);props.setLoopAValidated({measure:cur.measure,beat:cur.beat});},
              onClick:function(e){e.stopPropagation();setShowPracticePop(false);props.setLoopAValidated({measure:cur.measure,beat:cur.beat});}},
              React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"#30a050",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M4 7l4-4 4 4"}),React.createElement("line",{x1:8,y1:3,x2:8,y2:21})),
              " Set Loop Start"),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:8,margin:"0 4px",transition:"background 0.1s"},
              onTouchEnd:function(e){e.stopPropagation();e.preventDefault();setShowPracticePop(false);props.setLoopBValidated({measure:cur.measure,beat:cur.beat});},
              onClick:function(e){e.stopPropagation();setShowPracticePop(false);props.setLoopBValidated({measure:cur.measure,beat:cur.beat});}},
              React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"#d04040",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M4 17l4 4 4-4"}),React.createElement("line",{x1:8,y1:3,x2:8,y2:21})),
              " Set Loop End"),
            React.createElement("div", {style:{height:1,background:"var(--border-subtle,#e4e8f0)",margin:"4px 8px"}}),
            React.createElement("div", {style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:8,margin:"0 4px",transition:"background 0.1s",opacity:(props.loopA||props.loopB)?1:0.4},
              onTouchEnd:function(e){e.stopPropagation();e.preventDefault();setShowPracticePop(false);props.clearLoop();},
              onClick:function(e){e.stopPropagation();setShowPracticePop(false);props.clearLoop();}},
              React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("line",{x1:18,y1:6,x2:6,y2:18}),React.createElement("line",{x1:6,y1:6,x2:18,y2:18})),
              " Clear Loop")
          ) : null
        )
      )
    );
  }

  if (showEfx) {
    return (
      <div style={{flexShrink: 0, background: kbBg, borderTop: "1px solid var(--border-subtle," + borderCol + ")", padding: pad}}>
        <div style={{textAlign: "center", cursor: "pointer", marginBottom: gap, padding: "1px 0", touchAction: "manipulation"}}
          onClick={props.onToggleKb}>
          <span style={{fontSize: 10, color: defFg, opacity: 0.5}}>{"\u25BC Hide Keyboard"}</span>
        </div>
        <div style={{display: "flex", gap: gap, marginBottom: gap}}>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(104);}}>H</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(112);}}>P</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(47);}}>/</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(92);}}>\</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){var vt4=song.tracks[ati],vb5=vt4.measures[cur.measure]&&vt4.measures[cur.measure].beats[cur.beat],vn4=vb5&&vb5.notes[cur.string];if(vn4&&vn4.attack&&!vn4.stop&&!vn4.muted){var pbVal=window.prompt("Pre-bend from fret (empty to clear):",vn4.preBend!==undefined?String(vn4.preBend):"");if(pbVal!==null){var s9=JSON.parse(JSON.stringify(song));var nn9=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(pbVal.trim()===""){delete nn9.preBend;}else{var pf=parseInt(pbVal);if(!isNaN(pf)&&pf>=0&&pf<=24){if(pf>=nn9.fret){setStatus("Pre-bend fret "+pf+" must be lower than note fret "+nn9.fret);}else{nn9.preBend=pf;}}}if(props.undoLabel)props.undoLabel.current="Pre-Bend";props.setSong(s9);}}else{setStatus("Place a note first");}}}>Pb</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(98);}}>B</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){var vt3=song.tracks[ati],vb4=vt3.measures[cur.measure]&&vt3.measures[cur.measure].beats[cur.beat],vn3=vb4&&vb4.notes[cur.string];if(vn3&&vn3.attack&&!vn3.stop&&!vn3.muted){var s9=JSON.parse(JSON.stringify(song));s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].bendHold=!vn3.bendHold;props.setSong(s9);}else{setStatus("Place a note first");}}}>=</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(114);}}>R</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(126);}}>~</div>
        </div>
        <div style={{display: "flex", gap: gap, marginBottom: gap}}>
          {EFX_LABELS.slice(7).map(function(l, i) {
            return <div key={i} style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){toggleEffect(EFX_CODES[i+7]);}}>{l}</div>;
          })}
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){var vt=song.tracks[ati],vb2=vt.measures[cur.measure]&&vt.measures[cur.measure].beats[cur.beat],vn=vb2&&vb2.notes[cur.string];if(vn){var newV=window.prompt("Note velocity (1-127, track default: "+(vt.trackVelocity||80)+")\nLeave empty to use track default:",vn.vel!==undefined?String(vn.vel):"");if(newV!==null){var s9=JSON.parse(JSON.stringify(song));var nn=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(newV.trim()===""){delete nn.vel;}else{var vv=parseInt(newV);if(!isNaN(vv)&&vv>=1&&vv<=127)nn.vel=vv;}if(props.undoLabel)props.undoLabel.current="Note Velocity";props.setSong(s9);}}else{setStatus("No note at cursor");}}}>{"Ve"}</div>
          <div style={btnStyle(null,efxBtnBg,efxBtnFg)} onClick={function(){var vt2=song.tracks[ati],vb3=vt2.measures[cur.measure]&&vt2.measures[cur.measure].beats[cur.beat],vn2=vb3&&vb3.notes[cur.string];if(vn2&&vn2.attack&&!vn2.stop&&!vn2.muted){var s9=JSON.parse(JSON.stringify(song));s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].ring=!vn2.ring;if(props.undoLabel)props.undoLabel.current="Ring";props.setSong(s9);}else{setStatus("Place a note first");}}}>{"\u0021"}</div>
        </div>
        <div style={{display: "flex", gap: gap, marginBottom: 0}}>
          <div style={btnStyle(null,actBg,actFg)} onClick={function(){placeMuted();}}>{"x"}</div>
          <div style={btnStyle(null,actBg,actFg)} onClick={function(){placeStop();}}>{"\u2731"}</div>
          <div style={btnStyle()} onClick={function(){clearBeat();}}>{"\u2423"}</div>
          <div style={btnStyle()} onClick={function(){mobileBackspace();}}>{"\u232B"}</div>
          <div style={btnStyle(1.4,trkFxBg,"#fff",11)} onClick={function(){openDlg("trackEffects",buildEfxData());}}>{"Track FX"}</div>
          <div style={btnStyle(1.4,switchBg,switchFg,11)} onClick={function(){setShowEfx(false);}}>{"◀ Back"}</div>
          <div style={btnStyle(null,"#5070a0","#fff")} onClick={function(){if(props.setCmdPalOpen)props.setCmdPalOpen(true);}}>{React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"#fff",strokeWidth:2,strokeLinecap:"round"},React.createElement("circle",{cx:6.5,cy:6.5,r:4.5}),React.createElement("line",{x1:10,y1:10,x2:14,y2:14}))}</div>
          <div style={btnStyle(null,"#5070a0","#fff")} onClick={function(){setShowMobileHelp(true);}}>{"?"}</div>
        </div>
        <div style={{height: 1, background: "var(--border-subtle," + borderCol + ")", margin: (gap + 6) + "px 0", opacity: 0.5}} />
        {renderNavZone()}
        {showMobileHelp && <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:700,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowMobileHelp(false);}}>
          <div style={{background:"var(--surface-0,#fff)",color:defFg,borderRadius:16,padding:"20px 24px",maxWidth:380,maxHeight:"80vh",overflow:"auto",boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.15))",fontSize:12,lineHeight:1.7,border:"1px solid var(--border-subtle,#e4e8f0)"}} onClick={function(e){e.stopPropagation();}}>
            <div style={{fontSize:15,fontWeight:"700",marginBottom:10,textAlign:"center"}}>{"Mobile Keyboard Guide"}</div>
            <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Input"}</div>
            <div style={{paddingLeft:8,marginBottom:8}}>
              <div>{"0-9 — fret number"}</div>
              <div>{"x — muted string"}</div>
              <div>{"✱ — stop string"}</div>
              <div>{"␣ — clear note or selection"}</div>
              <div>{"⌫ — delete note"}</div>
              <div>{"↺ — undo"}</div>
              <div>{"Ins — insert blank note, shift right"}</div>
              <div>{"Del — delete note, shift left"}</div>
            </div>
            <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Navigation"}</div>
            <div style={{paddingLeft:8,marginBottom:8}}>
              <div>{"˂ ˃ ˄ ˅ — move cursor"}</div>
              <div>{"˂˂ ˃˃ — prev/next bar"}</div>
            </div>
            <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Note FX Row 1"}</div>
            <div style={{paddingLeft:8,marginBottom:8}}>
              <div>{"H — hammer-on"}</div>
              <div>{"P — pull-off"}</div>
              <div>{"/ — slide up"}</div>
              <div>{"\\ — slide down"}</div>
              <div>{"Pb — pre-bend"}</div>
              <div>{"B — bend"}</div>
              <div>{"= — bend hold"}</div>
              <div>{"R — release bend"}</div>
              <div>{"~ — vibrato"}</div>
            </div>
            <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Note FX Row 2"}</div>
            <div style={{paddingLeft:8,marginBottom:8}}>
              <div>{"T — tap"}</div>
              <div>{"S — slap"}</div>
              <div>{"( — soft"}</div>
              <div>{"< — harmonic"}</div>
              <div>{"{ — tremolo"}</div>
              <div>{"W — whammy"}</div>
              <div>{"M — palm mute"}</div>
              <div>{"Ve — note velocity"}</div>
              <div>{"! — indefinite ring"}</div>
            </div>
            <div style={{paddingLeft:8,marginBottom:4,opacity:0.7}}>
              <div>{"Place effects on empty positions for delayed techniques on ringing strings."}</div>
            </div>
            <div style={{textAlign:"center",marginTop:12,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{display:"inline-block",padding:"10px 28px",background:"var(--accent,#3264dc)",color:"#fff",borderRadius:8,cursor:"pointer",fontWeight:"600",fontSize:13,transition:"background 0.15s"}} onClick={function(){setShowMobileHelp(false);}}>{"OK"}</div>
              <div style={{display:"flex",gap:16,fontSize:11}}>
                <span style={{color:"var(--accent,#3264dc)",cursor:"pointer"}} onClick={function(){setShowMobileHelp(false);openDlg("about");}}>{"About TabKit"}</span>
                <a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" style={{color:"var(--accent,#3264dc)",textDecoration:"none"}}>{"Support ❤"}</a>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  }

  return (
    <div style={{flexShrink: 0, background: kbBg, borderTop: "1px solid var(--border-subtle," + borderCol + ")", padding: pad}}>
      <div style={{textAlign: "center", cursor: "pointer", marginBottom: gap, padding: "1px 0", touchAction: "manipulation"}}
        onClick={props.onToggleKb}>
        <span style={{fontSize: 10, color: defFg, opacity: 0.5}}>{"\u25BC Hide Keyboard"}</span>
      </div>
      <div style={{display: "flex", gap: gap, marginBottom: gap}}>
        {[1,2,3,4,5,6,7,8,9,0].map(function(n) {
          return <div key={n} style={btnStyle(null,numBg,numFg,17)} onClick={function(){placeNote(n);}}>{String(n)}</div>;
        })}
      </div>
      <div style={{display: "flex", gap: gap, marginBottom: 0}}>
        <div style={btnStyle(null,actBg,actFg)} onClick={function(){placeMuted();}}>{"x"}</div>
        <div style={btnStyle(null,actBg,actFg)} onClick={function(){placeStop();}}>{"\u2731"}</div>
        <div style={btnStyle()} onClick={function(){clearBeat();}}>{"\u2423"}</div>
        <div style={btnStyle()} onClick={function(){mobileBackspace();}}>{"\u232B"}</div>
        <div style={btnStyle(1.4,trkFxBg,"#fff",11)} onClick={function(){openDlg("trackEffects",buildEfxData());}}>{"Track FX"}</div>
        <div style={btnStyle(1.4,switchBg,switchFg,11)} onClick={function(){setShowEfx(true);}}>{"Note FX"}</div>
        <div style={btnStyle(null,"#5070a0","#fff")} onClick={function(){if(props.setCmdPalOpen)props.setCmdPalOpen(true);}}>{React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"#fff",strokeWidth:2,strokeLinecap:"round"},React.createElement("circle",{cx:6.5,cy:6.5,r:4.5}),React.createElement("line",{x1:10,y1:10,x2:14,y2:14}))}</div>
        <div style={btnStyle(null,"#5070a0","#fff")} onClick={function(){setShowMobileHelp(true);}}>{"?"}</div>
      </div>
      <div style={{height: 1, background: "var(--border-subtle," + borderCol + ")", margin: (gap + 6) + "px 0", opacity: 0.5}} />
      {renderNavZone()}
      {showMobileHelp && <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:700,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowMobileHelp(false);}}>
        <div style={{background:"var(--surface-0,#fff)",color:defFg,borderRadius:16,padding:"20px 24px",maxWidth:380,maxHeight:"80vh",overflow:"auto",boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.15))",fontSize:12,lineHeight:1.7,border:"1px solid var(--border-subtle,#e4e8f0)"}} onClick={function(e){e.stopPropagation();}}>
          <div style={{fontSize:15,fontWeight:"700",marginBottom:10,textAlign:"center"}}>{"Mobile Keyboard Guide"}</div>
          <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Input"}</div>
          <div style={{paddingLeft:8,marginBottom:8}}>
            <div>{"0-9 — fret number"}</div>
            <div>{"x — muted string"}</div>
            <div>{"✱ — stop string"}</div>
            <div>{"␣ — clear note or selection"}</div>
            <div>{"⌫ — delete note"}</div>
            <div>{"↺ — undo"}</div>
            <div>{"Ins — insert blank note, shift right"}</div>
            <div>{"Del — delete note, shift left"}</div>
          </div>
          <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Navigation"}</div>
          <div style={{paddingLeft:8,marginBottom:8}}>
            <div>{"˂ ˃ ˄ ˅ — move cursor"}</div>
            <div>{"˂˂ ˃˃ — prev/next bar"}</div>
          </div>
          <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Note FX Row 1"}</div>
          <div style={{paddingLeft:8,marginBottom:8}}>
            <div>{"H — hammer-on"}</div>
            <div>{"P — pull-off"}</div>
            <div>{"/ — slide up"}</div>
            <div>{"\\ — slide down"}</div>
            <div>{"Pb — pre-bend"}</div>
            <div>{"B — bend"}</div>
            <div>{"= — bend hold"}</div>
            <div>{"R — release bend"}</div>
            <div>{"~ — vibrato"}</div>
          </div>
          <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Note FX Row 2"}</div>
          <div style={{paddingLeft:8,marginBottom:8}}>
            <div>{"T — tap"}</div>
            <div>{"S — slap"}</div>
            <div>{"( — soft"}</div>
            <div>{"< — harmonic"}</div>
            <div>{"{ — tremolo"}</div>
            <div>{"W — whammy"}</div>
            <div>{"M — palm mute"}</div>
            <div>{"Ve — note velocity"}</div>
            <div>{"! — indefinite ring"}</div>
          </div>
          <div style={{paddingLeft:8,marginBottom:4,opacity:0.7}}>
            <div>{"Place effects on empty positions for delayed techniques on ringing strings."}</div>
          </div>
          <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Other"}</div>
          <div style={{paddingLeft:8,marginBottom:8}}>
            <div>{"Track FX — track effects dialog"}</div>
            <div>{"Note FX / Back — switch pages"}</div>
          </div>
          <div style={{textAlign:"center",marginTop:12,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{display:"inline-block",padding:"10px 28px",background:"var(--accent,#3264dc)",color:"#fff",borderRadius:8,cursor:"pointer",fontWeight:"600",fontSize:13,transition:"background 0.15s"}} onClick={function(){setShowMobileHelp(false);}}>{"OK"}</div>
              <div style={{display:"flex",gap:16,fontSize:11}}>
                <span style={{color:"var(--accent,#3264dc)",cursor:"pointer"}} onClick={function(){setShowMobileHelp(false);openDlg("about");}}>{"About TabKit"}</span>
                <a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" style={{color:"var(--accent,#3264dc)",textDecoration:"none"}}>{"Support ❤"}</a>
              </div>
            </div>
        </div>
      </div>}
    </div>
  );
}

// === BETA MOBILE KEYBOARD ===
function MobileKeyboardBeta(props) {
  var song = props.song, ati = props.ati, cur = props.cur, track = props.track;
  var setCur = props.setCur, setAti = props.setAti, atiRef = props.atiRef;
  var placeNote = props.placeNote, placeMuted = props.placeMuted, placeStop = props.placeStop;
  var clearBeat = props.clearBeat, toggleEffect = props.toggleEffect, doPlay = props.doPlay;
  var stopPlay = props.stopPlay, playing = props.playing, openDlg = props.openDlg;
  var buildEfxData = props.buildEfxData, doUndo = props.doUndo;
  var sel = props.sel, setSel = props.setSel, clipboard = props.clipboard;
  var normSel = props.normSel, setStatus = props.setStatus, cutBeat = props.cutBeat;
  var th = props.th;
  var ns = track ? track.numStrings : 6;
  var isDark = !!(th.bg && th.bg.charAt(1) < '5');

  var _navMode = useState("note"); var navMode = _navMode[0]; var setNavMode = _navMode[1];
  var _selMode = useState(false); var selectMode = _selMode[0]; var setSelectMode = _selMode[1];
  var _showNoteFx = useState(false); var showNoteFx = _showNoteFx[0]; var setShowNoteFx = _showNoteFx[1];
  var _showInsPop = useState(false); var showInsPop = _showInsPop[0]; var setShowInsPop = _showInsPop[1];
  var _showDelPop = useState(false); var showDelPop = _showDelPop[0]; var setShowDelPop = _showDelPop[1];
  var _showEditMenu = useState(false); var showEditMenu = _showEditMenu[0]; var setShowEditMenu = _showEditMenu[1];
  var _showStopPop = useState(false); var showStopPop = _showStopPop[0]; var setShowStopPop = _showStopPop[1];
  var _showPracPop = useState(false); var showPracPop = _showPracPop[0]; var setShowPracPop = _showPracPop[1];
  var _lpTimer = useRef(null); var _insTimer = useRef(null); var _delTimer = useRef(null);
  var _closedAt = useRef(0);
  var _undoLpTimer = useRef(null);
  var _showTrkPop = useState(false); var showTrkPop = _showTrkPop[0]; var setShowTrkPop = _showTrkPop[1];

  useEffect(function(){ if(props.selectModeRef&&props.selectModeRef.current!==selectMode)setSelectMode(props.selectModeRef.current); },[sel]);

  // Colors - light mode uses neutral gray, not cream
  var numBg = isDark ? "rgba(70,70,85,0.55)" : "rgba(220,222,228,0.55)";
  var numFg = isDark ? "#eee" : "#1a1a2e";
  var specBg = isDark ? "rgba(55,55,70,0.5)" : "rgba(205,208,218,0.55)";
  var specFg = isDark ? "#ccc" : "#333";
  var cmdBg = isDark ? "rgba(80,70,55,0.5)" : "rgba(200,195,185,0.55)";
  var cmdFg = isDark ? "#f0dcc0" : "#5a4020";
  var purpleBg = isDark ? "rgba(90,50,130,0.5)" : "rgba(130,80,180,0.15)";
  var purpleFg = isDark ? "#d0a0f0" : "#7030b0";
  var navBg = isDark ? "rgba(50,50,65,0.35)" : "rgba(195,198,210,0.35)";
  var navFg = isDark ? "#bbb" : "#444";
  var accentBg = isDark ? "rgba(50,100,220,0.3)" : "rgba(50,100,220,0.12)";
  var accentFg = isDark ? "#80b0ff" : "#2a5ac0";
  var selBtnBg = isDark ? "rgba(60,100,180,0.35)" : "rgba(50,100,220,0.1)";
  var selBtnFg = isDark ? "#8ac" : "#2a5ac0";
  var greenBg = isDark ? "rgba(48,128,48,0.55)" : "#2d8030";
  var redBg = isDark ? "rgba(176,48,48,0.55)" : "#b03030";
  var goldBg = isDark ? "rgba(200,160,40,0.3)" : "rgba(232,160,64,0.2)";
  var goldBorder = isDark ? "#c0a030" : "#d0a030";
  var popBg = isDark ? "rgba(38,38,48,0.97)" : "rgba(255,255,255,0.97)";
  var popBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  var defFg = isDark ? "#ddd" : "#333";
  var dimFg = isDark ? "#555" : "#bbb";
  var gap = 3, rad = 8, bH = 36;
  var isTrack = navMode === "track";

  function G(col,row,content,action,opts){
    opts=opts||{};
    var st={gridColumn:col,gridRow:row,display:"flex",flexDirection:opts.iconAbove?"column":"row",alignItems:"center",justifyContent:"center",gap:opts.iconAbove?1:4,height:bH,borderRadius:rad,background:opts.bg||numBg,color:opts.fg||numFg,fontSize:opts.fs||15,fontWeight:"600",cursor:"pointer",userSelect:"none",WebkitUserSelect:"none",border:opts.border||"none",position:"relative",transition:"filter 0.1s",padding:"0 3px",overflow:"visible",minWidth:opts.minW0?0:undefined};
    var attrs={style:st};
    if(opts.popTrigger)attrs["data-pop-trigger"]="1";
    if(action)attrs.onClick=function(e){e.preventDefault();e.stopPropagation();action();};
    if(opts.onTS)attrs.onTouchStart=opts.onTS;if(opts.onTE)attrs.onTouchEnd=opts.onTE;if(opts.onTM)attrs.onTouchMove=opts.onTM;
    return React.createElement("div",attrs,content,opts.children||null);
  }

  function numTap(n){if(cur.string===ns||cur.string===-1)return;if(n==="X"){placeMuted();return;}if(n==="*"){placeStop();return;}placeNote(parseInt(n));}
  function navUp(){if(isTrack){var nt=Math.max(0,ati-1);if(nt!==ati){atiRef.current=nt;setAti(nt);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[nt].numStrings-1)});if(selectMode&&props.selectModeRef&&props.selectModeRef.current){var orig=props.selOriginTrack.current!=null?props.selOriginTrack.current:ati;if(!sel)setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat,startTrack:Math.min(orig,nt),endTrack:Math.max(orig,nt)});else setSel(Object.assign({},sel,{startTrack:Math.min(orig,nt),endTrack:Math.max(orig,nt)}));}if(props.scrollToTrack)setTimeout(function(){props.scrollToTrack(nt);},50);}}else{setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string+1,track.hasTopText?ns:ns-1)});}}
  function navDown(){if(isTrack){var nt=Math.min(song.tracks.length-1,ati+1);if(nt!==ati){atiRef.current=nt;setAti(nt);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[nt].numStrings-1)});if(selectMode&&props.selectModeRef&&props.selectModeRef.current){var orig=props.selOriginTrack.current!=null?props.selOriginTrack.current:ati;if(!sel)setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat,startTrack:Math.min(orig,nt),endTrack:Math.max(orig,nt)});else setSel(Object.assign({},sel,{startTrack:Math.min(orig,nt),endTrack:Math.max(orig,nt)}));}if(props.scrollToTrack)setTimeout(function(){props.scrollToTrack(nt);},50);}}else{setCur({measure:cur.measure,beat:cur.beat,string:Math.max(cur.string-1,track.hasBottomText?-1:0)});}}
  function navLeft(){if(isTrack){var nm=Math.max(0,cur.measure-1);setCur({measure:nm,beat:0,string:cur.string});if(selectMode&&props.selectModeRef&&props.selectModeRef.current){if(!sel)setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:nm,endBeat:0});else{var ns2={startMeasure:sel.startMeasure,startBeat:sel.startBeat,endMeasure:nm,endBeat:0};if(sel.startTrack!=null){ns2.startTrack=sel.startTrack;ns2.endTrack=sel.endTrack;}setSel(ns2);}}if(props.scrollToMeasure)props.scrollToMeasure(nm);}else{var nb=cur.beat-1,nm2=cur.measure;if(nb<0&&nm2>0){nm2--;nb=track.measures[nm2].beats.length-1;}else if(nb<0)nb=0;if(selectMode&&props.selectModeRef&&props.selectModeRef.current){if(!sel)setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:nm2,endBeat:nb});else{var ns3={startMeasure:sel.startMeasure,startBeat:sel.startBeat,endMeasure:nm2,endBeat:nb};if(sel.startTrack!=null){ns3.startTrack=sel.startTrack;ns3.endTrack=sel.endTrack;}setSel(ns3);}}setCur({measure:nm2,beat:nb,string:cur.string});}}
  function navRight(){if(isTrack){var nm=Math.min(track.measures.length-1,cur.measure+1);setCur({measure:nm,beat:0,string:cur.string});if(selectMode&&props.selectModeRef&&props.selectModeRef.current){if(!sel)setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:nm,endBeat:0});else{var ns2={startMeasure:sel.startMeasure,startBeat:sel.startBeat,endMeasure:nm,endBeat:0};if(sel.startTrack!=null){ns2.startTrack=sel.startTrack;ns2.endTrack=sel.endTrack;}setSel(ns2);}}if(props.scrollToMeasure)props.scrollToMeasure(nm);}else{var nb=cur.beat+1,nm2=cur.measure;if(nb>=track.measures[nm2].beats.length&&nm2<track.measures.length-1){nm2++;nb=0;}else if(nb>=track.measures[nm2].beats.length)nb=track.measures[nm2].beats.length-1;if(selectMode&&props.selectModeRef&&props.selectModeRef.current){if(!sel)setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:nm2,endBeat:nb});else{var ns3={startMeasure:sel.startMeasure,startBeat:sel.startBeat,endMeasure:nm2,endBeat:nb};if(sel.startTrack!=null){ns3.startTrack=sel.startTrack;ns3.endTrack=sel.endTrack;}setSel(ns3);}}setCur({measure:nm2,beat:nb,string:cur.string});}}

  function mobileBackspace(){
    var s4=JSON.parse(JSON.stringify(song));
    if(cur.string>=0&&cur.string<ns)s4.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string]=null;
    if(props.undoLabel)props.undoLabel.current="Backspace";
    props.setSong(s4);
    // Move left
    var nb=cur.beat-1,nm=cur.measure;
    if(nb<0&&nm>0){nm--;nb=track.measures[nm].beats.length-1;}else if(nb<0)nb=0;
    setCur({measure:nm,beat:nb,string:cur.string});
  }

  function insertNote(){var s9=JSON.parse(JSON.stringify(song));var it=s9.tracks[ati];var ab=[];for(var m=cur.measure;m<it.measures.length;m++){var s=(m===cur.measure)?cur.beat:0;for(var b=s;b<it.measures[m].beats.length;b++)ab.push(it.measures[m].beats[b]);}ab.unshift({notes:new Array(it.numStrings).fill(null)});ab.pop();var i=0;for(var m2=cur.measure;m2<it.measures.length;m2++){var s2=(m2===cur.measure)?cur.beat:0;for(var b2=s2;b2<it.measures[m2].beats.length;b2++)it.measures[m2].beats[b2]=ab[i++];}if(props.undoLabel)props.undoLabel.current="Insert note";props.setSong(s9);setStatus("Inserted note");}
  function deleteNote(){var s9=JSON.parse(JSON.stringify(song));var dt=s9.tracks[ati];var ab=[];for(var m=cur.measure;m<dt.measures.length;m++){var s=(m===cur.measure)?cur.beat:0;for(var b=s;b<dt.measures[m].beats.length;b++)ab.push(dt.measures[m].beats[b]);}ab.shift();ab.push({notes:new Array(dt.numStrings).fill(null)});var i=0;for(var m2=cur.measure;m2<dt.measures.length;m2++){var s2=(m2===cur.measure)?cur.beat:0;for(var b2=s2;b2<dt.measures[m2].beats.length;b2++)dt.measures[m2].beats[b2]=ab[i++];}if(props.undoLabel)props.undoLabel.current="Delete note";props.setSong(s9);setStatus("Deleted note");}
  function insertBar(){var s9=JSON.parse(JSON.stringify(song));var iTs=getTimeSig(s9.tracks[0].measures[cur.measure]);var iBts=timeSigBeats(iTs.num,iTs.den);for(var ti9=0;ti9<s9.tracks.length;ti9++){var nb=[];for(var bi9=0;bi9<iBts;bi9++)nb.push({notes:new Array(s9.tracks[ti9].numStrings).fill(null)});s9.tracks[ti9].measures.splice(cur.measure,0,{beats:nb,barLine:"single",beatsPerMeasure:iBts,globalBeatsPerMeasure:iBts,isATR:false,timeSig:{num:iTs.num,den:iTs.den}});}shiftSections(s9,cur.measure,1);if(props.undoLabel)props.undoLabel.current="Insert bar";props.setSong(s9);setStatus("Inserted bar");}
  function deleteBar(){if(song.tracks[0].measures.length<=1){setStatus("Cannot delete last bar");return;}var s9=JSON.parse(JSON.stringify(song));for(var ti9=0;ti9<s9.tracks.length;ti9++)s9.tracks[ti9].measures.splice(cur.measure,1);var nm=Math.min(cur.measure,s9.tracks[0].measures.length-1);setCur({measure:nm,beat:0,string:cur.string});shiftSections(s9,cur.measure,-1);if(props.undoLabel)props.undoLabel.current="Delete bar";props.setSong(s9);setStatus("Deleted bar");}

  // Selection-aware cut/copy/paste
  function doCut(){
    if(!sel){cutBeat();return;}
    if(props.undoLabel)props.undoLabel.current="Cut";
    var selN=normSel(sel,track);var s5=JSON.parse(JSON.stringify(song));
    var tSt=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
    var tEn=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
    if(tSt===tEn){
      var copied=[],barBreaks=[];
      for(var si5=selN.sm;si5<=selN.em;si5++){var m5=track.measures[si5];if(!m5)continue;var sb5=(si5===selN.sm)?selN.sb:0;var eb5=(si5===selN.em)?selN.eb:m5.beats.length-1;var bc=0;
        for(var bi5=sb5;bi5<=eb5;bi5++){copied.push(JSON.parse(JSON.stringify(m5.beats[bi5])));s5.tracks[ati].measures[si5].beats[bi5]={notes:Array(track.numStrings).fill(null)};bc++;}barBreaks.push(bc);}
      clipboard.current={type:"range",data:copied,numStrings:track.numStrings,barBreaks:barBreaks};setStatus("Cut "+copied.length+" beats");
    }else{
      var mtT=[];for(var mti=tSt;mti<=tEn&&mti<song.tracks.length;mti++){var mtk=song.tracks[mti];var mtd=[];for(var msi=selN.sm;msi<=selN.em;msi++){var mm=mtk.measures[msi];if(!mm)continue;var msb=(msi===selN.sm)?selN.sb:0;var meb=(msi===selN.em)?selN.eb:mm.beats.length-1;for(var mbi=msb;mbi<=meb;mbi++){mtd.push(JSON.parse(JSON.stringify(mm.beats[mbi])));s5.tracks[mti].measures[msi].beats[mbi]={notes:Array(mtk.numStrings).fill(null)};}}mtT.push({data:mtd,numStrings:mtk.numStrings});}
      clipboard.current={type:"multitrack",tracks:mtT};setStatus("Cut "+mtT.length+" tracks");
    }
    props.setSong(s5);
  }
  function doCopy(){
    if(!sel){try{var cb=track.measures[cur.measure].beats[cur.beat];clipboard.current={type:"beat",data:JSON.parse(JSON.stringify(cb)),numStrings:track.numStrings};setStatus("Copied beat");}catch(e){}return;}
    var selN2=normSel(sel,track);
    var tSt2=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
    var tEn2=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
    if(tSt2===tEn2){
      var copied2=[],barBreaks2=[];
      for(var si6=selN2.sm;si6<=selN2.em;si6++){var m6=track.measures[si6];if(!m6)continue;var sb6=(si6===selN2.sm)?selN2.sb:0;var eb6=(si6===selN2.em)?selN2.eb:m6.beats.length-1;var bc2=0;for(var bi6=sb6;bi6<=eb6;bi6++){copied2.push(JSON.parse(JSON.stringify(m6.beats[bi6])));bc2++;}barBreaks2.push(bc2);}
      clipboard.current={type:"range",data:copied2,numStrings:track.numStrings,barBreaks:barBreaks2};setStatus("Copied "+copied2.length+" beats");
    }else{
      var mtT2=[];for(var mti2=tSt2;mti2<=tEn2&&mti2<song.tracks.length;mti2++){var mtk2=song.tracks[mti2];var mtd2=[];for(var msi2=selN2.sm;msi2<=selN2.em;msi2++){var mm2=mtk2.measures[msi2];if(!mm2)continue;var msb2=(msi2===selN2.sm)?selN2.sb:0;var meb2=(msi2===selN2.em)?selN2.eb:mm2.beats.length-1;for(var mbi2=msb2;mbi2<=meb2;mbi2++){mtd2.push(JSON.parse(JSON.stringify(mm2.beats[mbi2])));}}mtT2.push({data:mtd2,numStrings:mtk2.numStrings});}
      clipboard.current={type:"multitrack",tracks:mtT2};setStatus("Copied "+mtT2.length+" tracks");
    }
  }
  function doPaste(){
    if(!clipboard.current)return;if(props.undoLabel)props.undoLabel.current="Paste";var s6=JSON.parse(JSON.stringify(song));
    if(clipboard.current.type==="multitrack"){
      var mtSrc=clipboard.current.tracks;for(var pti=0;pti<mtSrc.length&&ati+pti<s6.tracks.length;pti++){var pdst=s6.tracks[ati+pti];var psrcNS=mtSrc[pti].numStrings||6;var pdstNS=pdst.numStrings;var pbeats=mtSrc[pti].data;var ppm=cur.measure,ppb=cur.beat;for(var ppi=0;ppi<pbeats.length;ppi++){if(ppm>=pdst.measures.length)break;var pSrcBt=JSON.parse(JSON.stringify(pbeats[ppi]));var pMap=Array(pdstNS).fill(null);for(var psn=0;psn<psrcNS&&psn<pSrcBt.notes.length;psn++){if(!pSrcBt.notes[psn])continue;if(pdstNS<psrcNS){if(psn<pdstNS)pMap[psn]=pSrcBt.notes[psn];}else if(pdstNS>psrcNS){var poff=pdstNS-psrcNS;if(psn+poff<pdstNS)pMap[psn+poff]=pSrcBt.notes[psn];}else{pMap[psn]=pSrcBt.notes[psn];}}pSrcBt.notes=pMap;pdst.measures[ppm].beats[ppb]=pSrcBt;ppb++;if(ppb>=pdst.measures[ppm].beats.length){ppm++;ppb=0;}}}
      props.setSong(s6);setStatus("Pasted "+mtSrc.length+" tracks");
    }else{
      var dst=s6.tracks[ati];var srcNS=clipboard.current.numStrings||6;var dstNS=dst.numStrings;var beats6=clipboard.current.type==="range"?clipboard.current.data:[clipboard.current.data];var pm=cur.measure,pb3=cur.beat;
      for(var pi2=0;pi2<beats6.length;pi2++){if(pm>=dst.measures.length)break;var srcBeat=JSON.parse(JSON.stringify(beats6[pi2]));var mappedNotes=Array(dstNS).fill(null);for(var sn=0;sn<srcNS&&sn<srcBeat.notes.length;sn++){if(!srcBeat.notes[sn])continue;if(dstNS<srcNS){if(sn<dstNS)mappedNotes[sn]=srcBeat.notes[sn];}else if(dstNS>srcNS){var off=dstNS-srcNS;if(sn+off<dstNS)mappedNotes[sn+off]=srcBeat.notes[sn];}else mappedNotes[sn]=srcBeat.notes[sn];}srcBeat.notes=mappedNotes;if(pb3<dst.measures[pm].beats.length){dst.measures[pm].beats[pb3]=srcBeat;}pb3++;if(pb3>=dst.measures[pm].beats.length){pm++;pb3=0;}}
      props.setSong(s6);setStatus("Pasted "+beats6.length+" beats");
    }
  }

  function chev(dir,dbl){var pts={up:dbl?[{points:"18,18 12,12 6,18"},{points:"18,12 12,6 6,12"}]:[{points:"18,15 12,9 6,15"}],down:dbl?[{points:"6,6 12,12 18,6"},{points:"6,12 12,18 18,12"}]:[{points:"6,9 12,15 18,9"}],left:dbl?[{points:"18,18 12,12 18,6"},{points:"12,18 6,12 12,6"}]:[{points:"15,18 9,12 15,6"}],right:dbl?[{points:"6,6 12,12 6,18"},{points:"12,6 18,12 12,18"}]:[{points:"9,6 15,12 9,18"}]};return React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},pts[dir].map(function(p,i){return React.createElement("polyline",Object.assign({key:i},p));}));}
  function musicIcon(color,sz){return React.createElement("svg",{width:sz||14,height:sz||14,viewBox:"0 0 24 24",fill:"none",stroke:color||"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M9 19C9 20.1046 7.65685 21 6 21C4.34315 21 3 20.1046 3 19C3 17.8954 4.34315 17 6 17C7.65685 17 9 17.8954 9 19ZM9 19V5L21 3V17M21 17C21 18.1046 19.6569 19 18 19C16.3431 19 15 18.1046 15 17C15 15.8954 16.3431 15 18 15C19.6569 15 21 15.8954 21 17ZM9 9L21 7"}));}
  function waveIcon(color,sz){return React.createElement("svg",{width:sz||14,height:sz||14,viewBox:"0 0 512 512",fill:color||"currentColor"},React.createElement("g",{transform:"translate(42.666667, 42.666667)"},React.createElement("path",{d:"M384,170.666667 L426.666667,170.666667 L426.666667,256 L384,256 L384,170.666667 Z M320,106.666667 L362.666667,106.666667 L362.666667,320 L320,320 L320,106.666667 Z M256,128 L298.666667,128 L298.666667,298.666667 L256,298.666667 L256,128 Z M192,64 L234.666667,64 L234.666667,362.666667 L192,362.666667 L192,64 Z M7.10542736e-15,170.666667 L42.6666667,170.666667 L42.6666667,256 L7.10542736e-15,256 L7.10542736e-15,170.666667 Z M64,106.666667 L106.666667,106.666667 L106.666667,320 L64,320 L64,106.666667 Z M128,7.10542736e-15 L170.666667,7.10542736e-15 L170.666667,426.666667 L128,426.666667 L128,7.10542736e-15 Z"})));}
  function noteToggleIcon(color,sz){return React.createElement("svg",{width:sz||13,height:sz||13,viewBox:"-7 0 30 30",fill:color||"currentColor"},React.createElement("path",{d:"M14.992,0 C14.031,0 13.984,1.002 13.984,1.002 L13.984,17.363 C11.748,15.715 8.058,15.713 4.788,17.589 C0.725,19.922 -1.018,24.27 0.616,27.3 C2.279,30.384 7.097,30.896 11.16,28.563 C14.316,26.751 16.007,23.807 16,21 L16,1 C15.982,0.462 15.537,0 14.992,0"}));}

  var bkspIcon = React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"}),React.createElement("line",{x1:18,y1:9,x2:12,y2:15}),React.createElement("line",{x1:12,y1:9,x2:18,y2:15}));
  var searchIcon = React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("circle",{cx:11,cy:11,r:8}),React.createElement("line",{x1:21,y1:21,x2:16.65,y2:16.65}));
  var pencilIcon = React.createElement("svg",{width:12,height:12,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M17 3l4 4L7 21H3v-4L17 3z"}));
  var cutIcon = React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("circle",{cx:6,cy:6,r:3}),React.createElement("circle",{cx:6,cy:18,r:3}),React.createElement("line",{x1:20,y1:4,x2:8.12,y2:15.88}),React.createElement("line",{x1:14.47,y1:14.48,x2:20,y2:20}),React.createElement("line",{x1:8.12,y1:8.12,x2:12,y2:12}));
  var copyIcon = React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("rect",{x:9,y:9,width:13,height:13,rx:2}),React.createElement("path",{d:"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"}));
  var pasteIcon = React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"}),React.createElement("rect",{x:8,y:2,width:8,height:4,rx:1}));
  function pauseIco(color,sz){return React.createElement("svg",{width:sz||14,height:sz||14,viewBox:"0 0 24 24",fill:color||"currentColor"},React.createElement("rect",{x:5,y:3,width:5,height:18,rx:1}),React.createElement("rect",{x:14,y:3,width:5,height:18,rx:1}));}

  var ntContent = isTrack
    ? React.createElement("svg",{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.5},React.createElement("line",{x1:3,y1:6,x2:21,y2:6}),React.createElement("line",{x1:3,y1:12,x2:21,y2:12}),React.createElement("line",{x1:3,y1:18,x2:21,y2:18}))
    : noteToggleIcon("currentColor",18);

  // Popovers close via: menu item tap, trigger button re-tap, opening different popover, or tap-away
  function closeAllPops(){_closedAt.current=Date.now();setShowNoteFx(false);setShowEditMenu(false);setShowInsPop(false);setShowDelPop(false);setShowStopPop(false);setShowPracPop(false);setShowTrkPop(false);}

  // Tap-away: document click listener (click doesn't fire after scrolls on iOS)
  var _anyPopOpen = showNoteFx||showEditMenu||showInsPop||showDelPop||showStopPop||showPracPop||showTrkPop;
  useEffect(function(){
    if(!_anyPopOpen)return;
    function onDocClick(e){
      var el=e.target;while(el){if(el.getAttribute&&(el.getAttribute("data-pop")||el.getAttribute("data-pop-trigger")))return;el=el.parentNode;}
      closeAllPops();
    }
    // Delay to avoid catching the opening tap
    var t=setTimeout(function(){document.addEventListener("click",onDocClick,true);},100);
    return function(){clearTimeout(t);document.removeEventListener("click",onDocClick,true);};
  },[_anyPopOpen]);

  // Toggle: close others when opening, guard against close+reopen race
  function popToggle(getter,setter){
    return function(){
      if(getter){setter(false);return;}
      if(Date.now()-_closedAt.current<400)return;
      closeAllPops();
      setTimeout(function(){setter(true);},0);
    };
  }

  // Collapsed state (after all hooks)
  if (!props.kbVisible) {
    return React.createElement("div",{style:{position:"fixed",bottom:32,left:0,right:0,zIndex:50,display:"flex",justifyContent:"center",padding:"8px"}},
      React.createElement("div",{style:{padding:"6px 16px",borderRadius:20,background:isDark?"rgba(40,40,50,0.8)":"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:"1px solid "+(isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"),cursor:"pointer",fontSize:12,color:isDark?"#ccc":"#555"},onClick:props.onToggleKb},"Show Keyboard"));
  }

  // Popover renderer
  function MenuPop(show,onClose,children,style2){
    if(!show)return null;
    return React.createElement("div",{"data-pop":"1",style:Object.assign({position:"absolute",bottom:"calc(100% + 6px)",background:popBg,backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid "+popBorder,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",padding:"4px 0",minWidth:240,zIndex:300,maxHeight:320,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",touchAction:"pan-y"},style2||{}),
      onClick:function(e){e.stopPropagation();}},
      children);
  }
  function MI(icon,label,action,opts){opts=opts||{};return React.createElement("div",{style:{padding:"12px 16px",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:8,margin:"0 4px",transition:"background 0.1s",color:opts.dim?dimFg:defFg,opacity:opts.dim?0.5:1},
    onClick:function(e){e.stopPropagation();if(action)action();}},icon,label);}
  function MSep(){return React.createElement("div",{style:{height:1,background:popBorder,margin:"3px 8px"}});}
  function lp(ref2,fn){return{onTS:function(){ref2.current=setTimeout(function(){fn(true);},500);},onTE:function(){if(ref2.current){clearTimeout(ref2.current);ref2.current=null;}},onTM:function(){if(ref2.current){clearTimeout(ref2.current);ref2.current=null;}}};}

  // Toggle: close others when opening, just close when re-tapping
  function popToggle(getter,setter){
    return function(){
      if(getter){setter(false);return;}
      closeAllPops();
      setter(true);
    };
  }

  // Note FX
  function noteFxPop(){
    if(!showNoteFx)return null;
    function efxItem(sym,name,action){
      return React.createElement("div",{key:sym,style:{padding:"10px 14px",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:0,borderRadius:6,margin:"2px 4px",color:defFg},
        onClick:function(e){e.stopPropagation();setShowNoteFx(false);action();}},
        React.createElement("span",{style:{width:28,textAlign:"center",fontSize:16,fontWeight:"700",fontFamily:"SF Mono,Consolas,monospace",color:isDark?"#aaa":"#666",flexShrink:0}},sym),
        React.createElement("span",{style:{fontSize:14}},name));
    }
    function efxToggle(ch){return function(){toggleEffect(ch);};}
    function preBendAction(){var vt4=song.tracks[ati],vb5=vt4.measures[cur.measure]&&vt4.measures[cur.measure].beats[cur.beat],vn4=vb5&&vb5.notes[cur.string];if(vn4&&vn4.attack&&!vn4.stop&&!vn4.muted){var pbVal=window.prompt("Pre-bend from fret (empty to clear):",vn4.preBend!==undefined?String(vn4.preBend):"");if(pbVal!==null){var s9=JSON.parse(JSON.stringify(song));var nn9=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(pbVal.trim()===""){delete nn9.preBend;}else{var pf=parseInt(pbVal);if(!isNaN(pf)&&pf>=0&&pf<=24){if(pf>=nn9.fret){setStatus("Pre-bend fret "+pf+" must be lower than note fret "+nn9.fret);}else{nn9.preBend=pf;}}}if(props.undoLabel)props.undoLabel.current="Pre-Bend";props.setSong(s9);}}else{setStatus("Place a note first");}}
    function bendHoldAction(){var vt3=song.tracks[ati],vb4=vt3.measures[cur.measure]&&vt3.measures[cur.measure].beats[cur.beat],vn3=vb4&&vb4.notes[cur.string];if(vn3&&vn3.attack&&!vn3.stop&&!vn3.muted){var s9=JSON.parse(JSON.stringify(song));s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].bendHold=!vn3.bendHold;if(props.undoLabel)props.undoLabel.current="Bend Hold";props.setSong(s9);}else{setStatus("Place a note first");}}
    function velocityAction(){var vt=song.tracks[ati],vb2=vt.measures[cur.measure]&&vt.measures[cur.measure].beats[cur.beat],vn=vb2&&vb2.notes[cur.string];if(vn){var newV=window.prompt("Note velocity (1-127, track default: "+(vt.trackVelocity||80)+")\nLeave empty to use track default:",vn.vel!==undefined?String(vn.vel):"");if(newV!==null){var s9=JSON.parse(JSON.stringify(song));var nn=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(newV.trim()===""){delete nn.vel;}else{var vv=parseInt(newV);if(!isNaN(vv)&&vv>=1&&vv<=127)nn.vel=vv;}if(props.undoLabel)props.undoLabel.current="Note Velocity";props.setSong(s9);}}else{setStatus("No note at cursor");}}
    function ringAction(){var vt2=song.tracks[ati],vb3=vt2.measures[cur.measure]&&vt2.measures[cur.measure].beats[cur.beat],vn2=vb3&&vb3.notes[cur.string];if(vn2&&vn2.attack&&!vn2.stop&&!vn2.muted){var s9=JSON.parse(JSON.stringify(song));s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].ring=!vn2.ring;if(props.undoLabel)props.undoLabel.current="Indefinite Ring";props.setSong(s9);}else{setStatus("Place a note first");}}
    var items=[
      efxItem("h","Hammer On",efxToggle(104)),
      efxItem("p","Pull Off",efxToggle(112)),
      efxItem("/","Slide Up",efxToggle(47)),
      efxItem("\\","Slide Down",efxToggle(92)),
      efxItem("Pb","Pre-Bend",preBendAction),
      efxItem("b","Bend",efxToggle(98)),
      efxItem("=","Bend Hold",bendHoldAction),
      efxItem("r","Release Bend",efxToggle(114)),
      efxItem("~","Vibrato",efxToggle(126)),
      efxItem("t","Tap",efxToggle(116)),
      efxItem("s","Slap",efxToggle(115)),
      efxItem("(","Soft",efxToggle(40)),
      efxItem("<","Harmonic",efxToggle(60)),
      efxItem("{","Tremolo",efxToggle(123)),
      efxItem("w","Whammy",efxToggle(119)),
      efxItem("m","Palm Mute",efxToggle(109)),
      efxItem("Ve","Note Velocity",velocityAction),
      efxItem("!","Indefinite Ring",ringAction),
    ];
    return MenuPop(true,function(){setShowNoteFx(false);},items,{left:0,minWidth:200});
  }

  // Edit menu (same as old keyboard)
  function editPop(){
    if(!showEditMenu)return null;
    return MenuPop(true,function(){setShowEditMenu(false);},[
      MI(_atrIco(defFg,16),"Alt Time Region",function(){setShowEditMenu(false);openDlg("altTime");}),
      MSep(),
      MI(_trackPropsIco(defFg,16),"Track Properties",function(){setShowEditMenu(false);var tp4=song.tracks[ati];openDlg("trackProps",props.trackPropsData(tp4));}),
      MSep(),
      MI(_chordIco(defFg,16),"Chord Builder",function(){setShowEditMenu(false);var t2c=song.tracks[ati];openDlg("chord",{root:0,qualIdx:0,posIdx:0,bass:"root",tuning:t2c.tuning.slice(),numStrings:t2c.numStrings,voicings:[],selectedFrets:null});}),
      MSep(),
      MI(_selectIco(defFg,16,selectMode),"Select Mode",function(){setShowEditMenu(false);var newSM=!selectMode;setSelectMode(newSM);if(props.selectModeRef)props.selectModeRef.current=newSM;if(newSM){setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat});props.selOriginTrack.current=ati;}else{setSel(null);props.selOriginTrack.current=null;}}),
      MI(_undoIco(defFg,16),"Undo",function(){setShowEditMenu(false);doUndo();})
    ],{right:0,minWidth:220});
  }

  function stopPop(){
    if(!showStopPop)return null;
    return MenuPop(true,function(){setShowStopPop(false);},[
      MI(pauseIco(defFg,14)," Stop playback",function(){setShowStopPop(false);stopPlay();}),
      MI(_skipBackIco(defFg,14)," Stop and go to beginning",function(){setShowStopPop(false);stopPlay();setCur({measure:0,beat:0,string:0});if(props.sRef&&props.sRef.current)props.sRef.current.scrollLeft=0;})
    ],{right:0});
  }

  function pracPop(){
    if(!showPracPop)return null;
    return MenuPop(true,function(){setShowPracPop(false);},[
      React.createElement("div",{key:"hdr",style:{padding:"8px 16px",fontSize:11,fontWeight:"600",color:"#888",textTransform:"uppercase",letterSpacing:"0.5px"}},"Practice Mode"),
      MI(React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("circle",{cx:12,cy:12,r:3}),React.createElement("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"}))," Settings",function(){setShowPracPop(false);openDlg("practice",{speed:props.practiceSpeed||100,autoInc:props.practiceAutoInc,incStep:props.practiceIncStep||5,targetSpeed:props.practiceTargetSpeed||100});}),
      MSep(),
      MI(React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"#30a050",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M4 7l4-4 4 4"}),React.createElement("line",{x1:8,y1:3,x2:8,y2:21}))," Loop Start",function(){setShowPracPop(false);props.setLoopAValidated({measure:cur.measure,beat:cur.beat});}),
      MI(React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"#d04040",strokeWidth:2.5,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M4 17l4 4 4-4"}),React.createElement("line",{x1:8,y1:3,x2:8,y2:21}))," Loop End",function(){setShowPracPop(false);props.setLoopBValidated({measure:cur.measure,beat:cur.beat});})
    ],{left:0,minWidth:160});
  }

  var gridCols = "repeat(3,1fr) "+gap+"px repeat(2,1fr) "+gap+"px repeat(3,1fr)";
  var cells = [];

  [["7","8","9"],["4","5","6"],["1","2","3"],["X","0","*"]].forEach(function(row,ri){
    row.forEach(function(n,ci){cells.push(G(String(ci+1),String(ri+1),n,function(){numTap(n);}));});
  });
  cells.push(G("1","5",bkspIcon,mobileBackspace,{bg:specBg,fg:specFg}));
  cells.push(G("2","5","\u2423",clearBeat,{fs:18,bg:specBg,fg:specFg}));
  var undoIcon = React.createElement("svg",{width:14,height:14,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round"},
    React.createElement("path",{d:"M4 6l-2-2 2-2"}),React.createElement("path",{d:"M2 4h8a4 4 0 0 1 0 8H6"}));
  cells.push(G("3","5",undoIcon,function(){doUndo();},{bg:specBg,fg:specFg,
    onTS:function(){_undoLpTimer.current=setTimeout(function(){openDlg("undoHistory",{});},500);},
    onTE:function(){if(_undoLpTimer.current){clearTimeout(_undoLpTimer.current);_undoLpTimer.current=null;}},
    onTM:function(){if(_undoLpTimer.current){clearTimeout(_undoLpTimer.current);_undoLpTimer.current=null;}}}));

  if(selectMode){
    cells.push(G("5 / 7","1","Select All",function(){setSel({startMeasure:0,startBeat:0,endMeasure:track.measures.length-1,endBeat:track.measures[track.measures.length-1].beats.length-1});},{fs:10,bg:selBtnBg,fg:selBtnFg}));
    cells.push(G("5 / 7","2","Deselect",function(){setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat});},{fs:10,bg:selBtnBg,fg:selBtnFg}));
  } else {
    // Track dropdown with color indicators + note preview
    var trkName = track ? (track.name || "Track "+(ati+1)) : "";
    var trkColor = TRACK_COLORS[ati % TRACK_COLORS.length];
    // Cursor info: string tuning note + sounding note
    var curInfo = "";
    if (track) {
      var strNote = "";
      if (cur.string >= 0 && cur.string < ns) {
        var midi = track.tuning ? track.tuning[cur.string] : 40;
        if (track.isDrum) {
          strNote = String(midi);
        } else {
          strNote = NKS[midi % 12] + (Math.floor(midi / 12) - 1);
        }
        var sounding = "";
        try {
          var cBeat = track.measures[cur.measure].beats[cur.beat];
          var cn = cBeat.notes[cur.string];
          if (cn) {
            if (cn.muted) sounding = "X";
            else if (cn.stop) sounding = "*";
            else if (cn.fret >= 0 && !track.isDrum) {
              var sndMidi = midi + cn.fret + (track.capo || 0);
              sounding = NKS[sndMidi % 12];
            } else if (cn.fret >= 0 && track.isDrum) {
              var drumMidi2 = (track.tuning[cur.string] || 0) + cn.fret;
              sounding = GM_DRUM_NAMES[drumMidi2] || ("Drum " + drumMidi2);
            }
          }
        } catch(e) {}
        curInfo = sounding ? strNote + " \u2192 " + sounding : strNote + " \u2192 Empty";
      }
    }
    // Combined info panel spanning both rows
    var combinedContent = React.createElement("div",{style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",justifyContent:"center",gap:2,minWidth:0,overflow:"hidden"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,overflow:"hidden",minWidth:0}},
        React.createElement("span",{style:{width:8,height:8,borderRadius:4,background:trkColor,flexShrink:0}}),
        React.createElement("span",{style:{fontSize:12,fontWeight:"600",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},trkName),
        React.createElement("span",{style:{fontSize:8,opacity:0.4,flexShrink:0,marginLeft:"auto",marginRight:"6%"}},"\u25BC")),
      React.createElement("div",{style:{fontSize:11,fontFamily:"SF Mono,Consolas,monospace",letterSpacing:"0.3px",color:dimFg,paddingLeft:14,textAlign:"left"}},curInfo));
    function trkPopover(){
      if(!showTrkPop||!song)return null;
      var items=song.tracks.map(function(tr,ti){
        var c2=TRACK_COLORS[ti%TRACK_COLORS.length];
        var nm=tr.name||"Track "+(ti+1);
        return React.createElement("div",{key:ti,style:{padding:"10px 14px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderRadius:6,margin:"2px 4px",color:ti===ati?accentFg:defFg,fontWeight:ti===ati?"700":"400",background:ti===ati?accentBg:"transparent"},
          onClick:function(e){e.stopPropagation();setShowTrkPop(false);atiRef.current=ti;setAti(ti);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[ti].numStrings-1)});if(props.scrollToTrack)setTimeout(function(){props.scrollToTrack(ti);},50);}},
          React.createElement("span",{style:{width:10,height:10,borderRadius:5,background:c2,flexShrink:0}}),nm);
      });
      return MenuPop(true,function(){setShowTrkPop(false);},items,{left:0,minWidth:180});
    }
    cells.push(G("5 / 11","1",combinedContent,popToggle(showTrkPop,setShowTrkPop),{bg:"transparent",fg:defFg,popTrigger:true,minW0:true,children:trkPopover()}));
    // Metronome + Loop buttons (row 2, above Ins/Del)
    var metroOn = props.metro;
    var metroSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="FILLC"><g><path d="M247.5 332.8v-25.6h34.1v25.6c0 4.7 3.8 8.5 8.5 8.5s8.5-3.8 8.5-8.5V51.2h25.6c4.7 0 8.5-3.8 8.5-8.5s-3.8-8.5-8.5-8.5H204.8c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5h25.6v281.6c0 4.7 3.8 8.5 8.5 8.5s8.6-3.8 8.6-8.5zM247.5 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1zm0 51.2h34.1v34.1h-34.1z"/><path d="M366.8 41.5C363.4 17 345.8 0 324.3 0H204.8c-20.7 0-37 15.7-42.6 41.4L131.3 243.2l-24.6-32.9c2.6-4 4.2-8.8 4.2-14 0-14.1-11.5-25.6-25.6-25.6-2.6 0-5.1.5-7.5 1.3l-19.8-26.1c-2.8-3.8-8.2-4.5-12-1.7-3.8 2.9-4.5 8.2-1.6 12l19.7 26c-2.7 4-4.3 9-4.3 14.2 0 14.1 11.5 25.6 25.6 25.6 2.7 0 5.3-.5 7.7-1.3L196.1 358.4H129.8l7.9-47.7c.8-4.7-2.4-9-7-9.8-4.7-.8-9 2.4-9.8 7L94.4 467.9c-1.9 11.2 1 22 8.1 30.4 7.4 8.7 18.5 13.7 30.5 13.7h263.9c11.6 0 22.5-5 29.8-13.9 7.1-8.5 9.9-19.6 7.9-30.1zm-281.5 163.3c-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5 8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5zm328.2 282.5c-4.1 4.9-10.1 7.7-16.7 7.7H132.9c-7 0-13.3-2.8-17.4-7.7-3.8-4.5-5.3-10.4-4.3-16.5l15.8-95.3h81.9l39.9 53.3c-.8 2-1.3 4.1-1.3 6.4 0 9.4 7.7 17.1 17.1 17.1s17.1-7.7 17.1-17.1-7.7-17.1-17.1-17.1c-.8 0-1.5.1-2.3.2L145.6 262.4l33.4-217.9c1.8-8.2 7.9-27.4 25.8-27.4h119.5c15.1 0 23.8 13.5 25.7 26.9L399.9 358.4H252.1c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5h150.5l15.1 95.5c1.1 5.8-.5 11.7-4.2 16.4z"/></g></svg>';
    var metroIco = React.createElement("img",{src:"data:image/svg+xml,"+encodeURIComponent(metroSvg.replace("FILLC",metroOn?(isDark?"#40d0c8":"#18a098"):(isDark?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.45)"))),width:16,height:16,style:{pointerEvents:"none"},draggable:false});
    cells.push(G("5","2",metroIco,function(){props.setMetro(!props.metro);},{bg:metroOn?(isDark?"rgba(32,176,160,0.15)":"rgba(24,160,152,0.12)"):(isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"),fg:defFg,border:"1px solid "+(metroOn?(isDark?"rgba(32,176,160,0.3)":"rgba(24,160,152,0.25)"):(isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.1)"))}));
    var hasLoop = !!(props.loopA && props.loopB);
    var hasPartial = !hasLoop && !!(props.loopA || props.loopB);
    var loopFill = hasLoop?(isDark?"#50d070":"#30a050"):hasPartial?(isDark?"#e0b040":"#c89020"):(isDark?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.45)");
    var loopBg = hasLoop?(isDark?"rgba(48,160,80,0.15)":"rgba(48,160,80,0.12)"):hasPartial?(isDark?"rgba(200,144,32,0.15)":"rgba(200,144,32,0.12)"):(isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)");
    var loopBd = hasLoop?(isDark?"rgba(48,160,80,0.3)":"rgba(48,160,80,0.25)"):hasPartial?(isDark?"rgba(200,144,32,0.3)":"rgba(200,144,32,0.25)"):(isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.1)");
    var loopIco = React.createElement("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:loopFill},
      React.createElement("path",{d:"M6 4h15a1 1 0 0 1 1 1v7h-2V6H6v3L1 5l5-4v3zm12 16H3a1 1 0 0 1-1-1v-7h2v6h14v-3l5 4-5 4v-3z"}));
    cells.push(G("6","2",loopIco,function(){if(hasLoop){props.clearLoop();}else{popToggle(showPracPop,setShowPracPop)();}},{bg:loopBg,fg:defFg,border:"1px solid "+loopBd,popTrigger:true,children:[pracPop()]}));
  }
  var insLP=lp(_insTimer,setShowInsPop),delLP=lp(_delTimer,setShowDelPop);
  var insIco = React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:2.5,strokeLinecap:"round"},
    React.createElement("line",{x1:8,y1:3,x2:8,y2:13}),React.createElement("line",{x1:3,y1:8,x2:13,y2:8}));
  var delIco = React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:2.5,strokeLinecap:"round"},
    React.createElement("line",{x1:3,y1:8,x2:13,y2:8}));
  // Menu icons
  var _icoNoteIns = React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:defFg,strokeWidth:2,strokeLinecap:"round"},
    React.createElement("line",{x1:8,y1:3,x2:8,y2:13}),React.createElement("line",{x1:3,y1:8,x2:13,y2:8}));
  var _icoBarIns = React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:defFg,strokeWidth:2,strokeLinecap:"round"},
    React.createElement("line",{x1:3,y1:4,x2:13,y2:4}),React.createElement("line",{x1:3,y1:8,x2:13,y2:8}),React.createElement("line",{x1:3,y1:12,x2:13,y2:12}));
  var _icoNoteDel = React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:defFg,strokeWidth:2,strokeLinecap:"round"},
    React.createElement("line",{x1:3,y1:8,x2:13,y2:8}));
  var _icoBarDel = React.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:defFg,strokeLinecap:"round"},
    React.createElement("line",{x1:3,y1:4,x2:13,y2:4,strokeWidth:1.5}),React.createElement("line",{x1:3,y1:8,x2:13,y2:8,strokeWidth:1.5}),React.createElement("line",{x1:3,y1:12,x2:13,y2:12,strokeWidth:1.5}),
    React.createElement("line",{x1:3,y1:3,x2:13,y2:13,stroke:"#fff",strokeWidth:2}),React.createElement("line",{x1:13,y1:3,x2:3,y2:13,stroke:"#fff",strokeWidth:2}));
  cells.push(G("5","3",insIco,insertNote,{bg:specBg,fg:specFg,onTS:insLP.onTS,onTE:insLP.onTE,onTM:insLP.onTM,
    children:MenuPop(showInsPop,function(){setShowInsPop(false);},[
      MI(_icoNoteIns,"Insert Note",function(){setShowInsPop(false);insertNote();}),
      MI(_icoBarIns,"Insert Bar",function(){setShowInsPop(false);insertBar();}),
      MSep(),
      MI(_addTrackIco(defFg,16),"Add Track",function(){setShowInsPop(false);openDlg("addTrack",props.addTrackData());}),
      MI(_dupTrackIco(defFg,16),"Duplicate Track",function(){setShowInsPop(false);if(props.undoLabel)props.undoLabel.current="Duplicate track";var s9=JSON.parse(JSON.stringify(song));var dup=JSON.parse(JSON.stringify(s9.tracks[ati]));dup.name=(dup.name||"Track")+" (copy)";s9.tracks.splice(ati+1,0,dup);props.setSong(s9);atiRef.current=ati+1;setAti(ati+1);setStatus("Duplicated track");})
    ],{left:0})}));
  cells.push(G("6","3",delIco,deleteNote,{bg:specBg,fg:specFg,onTS:delLP.onTS,onTE:delLP.onTE,onTM:delLP.onTM,
    children:MenuPop(showDelPop,function(){setShowDelPop(false);},[
      MI(_icoNoteDel,"Delete Note",function(){setShowDelPop(false);deleteNote();}),
      MI(_icoBarDel,"Delete Bar",function(){setShowDelPop(false);deleteBar();}),
      MSep(),
      MI(_delTrackIco(defFg,16),"Delete Track",function(){setShowDelPop(false);if(song.tracks.length>1){if(props.undoLabel)props.undoLabel.current="Delete track";var s3=JSON.parse(JSON.stringify(song));s3.tracks.splice(ati,1);var nA=Math.min(ati,s3.tracks.length-1);atiRef.current=nA;setAti(nA);props.setSong(s3);setStatus("Deleted track");}else{setStatus("Cannot delete last track");}})
    ],{left:0})}));
  cells.push(G("5 / 7","4",React.createElement(React.Fragment,null,waveIcon(purpleFg,13),React.createElement("span",{style:{fontSize:10}},"Track FX")),function(){openDlg("trackEffects",buildEfxData());},{bg:purpleBg,fg:purpleFg,iconAbove:true}));
  cells.push(G("5 / 7","5",React.createElement(React.Fragment,null,musicIcon(cmdFg,13),React.createElement("span",{style:{fontSize:10}},"Note FX")),popToggle(showNoteFx,setShowNoteFx),{bg:cmdBg,fg:cmdFg,iconAbove:true,popTrigger:true,children:noteFxPop()}));

  if(selectMode){
    cells.push(G("8","1",cutIcon,function(){doCut();},{bg:sel?selBtnBg:"transparent",fg:sel?selBtnFg:dimFg}));
    cells.push(G("9","1",copyIcon,function(){doCopy();},{bg:sel?selBtnBg:"transparent",fg:sel?selBtnFg:dimFg}));
    cells.push(G("10","1",pasteIcon,function(){doPaste();},{bg:clipboard&&clipboard.current?selBtnBg:"transparent",fg:clipboard&&clipboard.current?selBtnFg:dimFg}));
  }
  cells.push(G("9","2",chev("up",isTrack),navUp,{bg:navBg,fg:navFg}));
  cells.push(G("8","3",chev("left",isTrack),navLeft,{bg:navBg,fg:navFg}));
  cells.push(G("9","3",ntContent,function(){setNavMode(isTrack?"note":"track");},{bg:accentBg,fg:accentFg}));
  cells.push(G("10","3",chev("right",isTrack),navRight,{bg:navBg,fg:navFg}));
  cells.push(G("9","4",chev("down",isTrack),navDown,{bg:navBg,fg:navFg}));

  cells.push(G("8","5",searchIcon,function(){props.setCmdPalOpen(true);},{bg:specBg,fg:specFg}));
  cells.push(G("9","5",React.createElement(React.Fragment,null,pencilIcon,React.createElement("span",{style:{fontSize:9}},"Edit")),
    popToggle(showEditMenu,setShowEditMenu),{bg:selectMode?goldBg:specBg,fg:selectMode?(isDark?"#f0d060":"#7a5010"):specFg,border:selectMode?"2px solid "+goldBorder:"none",iconAbove:true,popTrigger:true,children:editPop()}));
  var playLP=lp(_lpTimer,setShowStopPop);
  cells.push(G("10","5",
    playing?React.createElement("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("rect",{x:4,y:4,width:6,height:16}),React.createElement("rect",{x:14,y:4,width:6,height:16})):"\u25B6",
    function(){if(showStopPop){setShowStopPop(false);return;}if(playing)stopPlay();else doPlay(true);},
    {bg:playing?redBg:greenBg,fg:"#fff",onTS:function(){if(showStopPop)return;if(playing)playLP.onTS();},onTE:playLP.onTE,onTM:playLP.onTM,
      children:[stopPop()]}));

  return React.createElement("div",{style:{position:"fixed",bottom:0,left:0,right:0,zIndex:50,
    background:isDark?"rgba(10,10,15,0.2)":"rgba(250,250,255,0.15)",
    backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
    borderTop:"1px solid "+(isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"),
    padding:gap+"px "+(gap+2)+"px 0",
    paddingBottom:"max(12px, calc(env(safe-area-inset-bottom) + 8px))"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"center",marginBottom:2}},
      React.createElement("div",{style:{width:36,height:4,borderRadius:2,background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)",cursor:"pointer"},onClick:props.onToggleKb})),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:gridCols,gridTemplateRows:"repeat(5,"+bH+"px)",gap:gap}},cells));
}

// === TOOLBAR BUTTON ===
function TBB(props) {
  var hs = useState(false), hover = hs[0], setH = hs[1];
  var pressed = useState(false), isDown = pressed[0], setDown = pressed[1];
  var active = props.a;
  var _mob = window.innerWidth < 700;
  var bg = active ? "var(--accent-soft,rgba(50,100,220,0.12))" : isDown ? "var(--surface-3,#e4e8f0)" : hover ? "var(--surface-2,#f0f2f5)" : "transparent";
  return (
    <div title={props.t} onClick={props.c}
      onMouseEnter={function(){setH(true);}} onMouseLeave={function(){setH(false);setDown(false);}}
      onMouseDown={function(){setDown(true);}} onMouseUp={function(){setDown(false);}}
      style={{minWidth:_mob?34:26,height:_mob?34:26,display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",background:bg,border:"none",fontSize:_mob?16:14,padding:"0 5px",
        borderRadius:_mob?8:6,margin:"0 1px",transition:"background 0.15s",
        color:active?"var(--accent,#3264dc)":"inherit"}}>
      {props.children}
    </div>
  );
}

// === MODAL DIALOG ===
function Modal(props) {
  if (!props.show) return null;
  var isMob = window.innerWidth < 700;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.35)",zIndex:500,display:"flex",alignItems:isMob?"flex-end":"center",justifyContent:"center",backdropFilter:"blur(3px)",transition:"background 0.2s"}}
      onClick={function(e){if(e.target===e.currentTarget && props.onClose) props.onClose();}}>
      <div style={{background:"var(--surface-0,#fff)",border:"none",borderRadius:isMob?"16px 16px 0 0":"14px",width:isMob?"100%":"auto",minWidth:isMob?"auto":340,maxWidth:isMob?"100%":560,maxHeight:isMob?"88vh":"85vh",boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.18))",color:"var(--text-primary,#1a1a2e)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMob?"14px 18px 10px":"12px 18px 8px",borderBottom:"1px solid var(--border-subtle,#e4e8f0)",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:"600",fontFamily:"system-ui,-apple-system,sans-serif",letterSpacing:"-0.01em"}}>{props.title || "Dialog"}</span>
          {props.onClose ? <div onClick={props.onClose} style={{cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",fontSize:16,color:"var(--text-secondary,#666)",transition:"background 0.15s"}}
            onMouseEnter={function(e){e.currentTarget.style.background="var(--surface-3,#e4e8f0)";}}
            onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
            {"\u00D7"}
          </div> : null}
        </div>
        <div style={{padding:isMob?"14px 18px 20px":"14px 20px 16px",fontSize:12,fontFamily:"system-ui,-apple-system,sans-serif",overflowY:"auto",flex:1,WebkitOverflowScrolling:"touch"}}>{props.children}</div>
      </div>
    </div>
  );
}
function DlgRow(props) {
  return (<div style={{display:"flex",alignItems:"center",marginBottom:7,gap:8}}>
    <span style={{minWidth:props.lw||80,textAlign:"right",fontSize:11,fontWeight:"500",color:"var(--text-secondary,#5a6070)"}}>{props.label}</span>
    {props.children}
  </div>);
}
function DlgBtn(props) {
  return (<button onClick={props.disabled?undefined:props.o} disabled={props.disabled} data-dlg-primary={props.primary?"1":undefined} style={{padding:"7px 20px",fontSize:12,fontFamily:"system-ui,-apple-system,sans-serif",border:props.primary?"none":"1px solid var(--border-default,#c0c8d8)",background:props.primary?"var(--accent,#3264dc)":"var(--surface-2,#f0f2f5)",color:props.primary?"#fff":"var(--text-primary,#1a1a2e)",cursor:props.disabled?"default":"pointer",opacity:props.disabled?0.4:1,minWidth:72,borderRadius:8,fontWeight:props.primary?"600":"500",transition:"background 0.15s, transform 0.1s",letterSpacing:"-0.01em"}}
    onMouseEnter={function(e){if(!props.disabled)e.currentTarget.style.filter="brightness(1.08)";}}
    onMouseLeave={function(e){e.currentTarget.style.filter="none";}}
  >{props.children}</button>);
}
// Numeric input helpers: text input uses raw string during editing, syncs on blur
// _ed_KEY stores the editing string while focused, real KEY stores the committed number
function dlgNumVal(dlgData, key, def) { var ek = "_ed_" + key; if (dlgData[ek] !== undefined) return dlgData[ek]; var v = dlgData[key]; return v !== undefined ? v : def; }
function dlgNumSlider(v, def) { return (v === "" || v === "-" || v === undefined || isNaN(+v)) ? def : +v; }
function dlgNumFocus(dlgData, setDlgData, key, def) { return function(e) { var v = dlgData[key]; setDlgData(Object.assign({}, dlgData, (function(){var o={};o["_ed_"+key]=v !== undefined ? String(v) : String(def);return o;})())); e.target.select(); }; }
function dlgNumChange(dlgData, setDlgData, key) { return function(e) { var raw = e.target.value; setDlgData(Object.assign({}, dlgData, (function(){var o={};o["_ed_"+key]=raw;return o;})())); }; }
function dlgNumBlur(dlgData, setDlgData, key, def, mn, mx) { return function() { var ek = "_ed_" + key; var v = dlgData[ek]; var num = (v !== "" && v !== "-" && v !== undefined && !isNaN(+v)) ? +v : def; if (mn !== undefined && num < mn) num = mn; if (mx !== undefined && num > mx) num = mx; setDlgData(Object.assign({}, dlgData, (function(){var o={};o[key]=num;o["_ed_"+key]=undefined;return o;})())); }; }

// ── Chord System ──
var NOTE_NAMES = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
var CHORD_QUALS = [
  {id:"maj",name:"Major",tones:[0,4,7]},
  {id:"min",name:"Minor",tones:[0,3,7]},
  {id:"7",name:"7",tones:[0,4,7,10]},
  {id:"m7",name:"m7",tones:[0,3,7,10]},
  {id:"maj7",name:"maj7",tones:[0,4,7,11]},
  {id:"5",name:"Power",tones:[0,7]},
  {id:"sus2",name:"sus2",tones:[0,2,7]},
  {id:"sus4",name:"sus4",tones:[0,5,7]},
  {id:"dim",name:"dim",tones:[0,3,6]},
  {id:"aug",name:"aug",tones:[0,4,8]},
  {id:"add9",name:"add9",tones:[0,4,7,14]},
  {id:"6",name:"6",tones:[0,4,7,9]},
  {id:"m6",name:"m6",tones:[0,3,7,9]},
  {id:"m7b5",name:"m7\u266d5",tones:[0,3,6,10]},
  {id:"dim7",name:"dim7",tones:[0,3,6,9]},
  {id:"9",name:"9",tones:[0,4,7,10,14]},
  {id:"m9",name:"m9",tones:[0,3,7,10,14]},
  {id:"maj9",name:"maj9",tones:[0,4,7,11,14]}
];

function generateVoicings(rootNote, quality, tuning, opts) {
  opts = opts || {};
  var maxFret = opts.maxFret || 12;
  var bassMode = opts.bass || "root";
  var ns = tuning.length;
  var tones = quality.tones;
  var pitchClasses = tones.map(function(t) { return (rootNote + t) % 12; });
  var isPower = tones.length <= 2;

  // For each string, find candidate frets producing a chord tone
  var candidates = [];
  for (var si = 0; si < ns; si++) {
    var sc = [{fret:-1, pc:-1}];
    for (var f = 0; f <= maxFret; f++) {
      var p2 = (tuning[si] + f) % 12;
      if (pitchClasses.indexOf(p2) >= 0) sc.push({fret:f, pc:p2});
    }
    candidates.push(sc);
  }

  // Finger validation
  function tryFingers(frets) {
    var fretted = [];
    for (var i = 0; i < frets.length; i++) {
      if (frets[i] > 0) fretted.push({str: i, fret: frets[i]});
    }
    if (fretted.length === 0) return {fingers: {}, barre: null};
    var minF = fretted[0].fret, maxF2 = fretted[0].fret;
    for (var i2 = 1; i2 < fretted.length; i2++) {
      if (fretted[i2].fret < minF) minF = fretted[i2].fret;
      if (fretted[i2].fret > maxF2) maxF2 = fretted[i2].fret;
    }
    var span = maxF2 - minF;
    if (minF <= 2 && span > 3) return null;
    if (minF <= 5 && span > 4) return null;
    if (span > 5) return null;
    // No interior muted strings
    var ff2 = -1, lf2 = -1;
    for (var i3 = 0; i3 < frets.length; i3++) { if (frets[i3] >= 0) { if (ff2 === -1) ff2 = i3; lf2 = i3; } }
    for (var i4 = ff2 + 1; i4 < lf2; i4++) { if (frets[i4] === -1) return null; }

    // Finger assignment: sort by fret (ascending), then string (ascending)
    // finger = 1 + (fret - minFret), bump on collision
    function assignFingers(notes, baseMin) {
      var fingers = {};
      var used = {};
      // Sort by fret first, then by string within same fret
      var sorted = notes.slice().sort(function(a,b) {
        if (a.fret !== b.fret) return a.fret - b.fret;
        return a.str - b.str;
      });
      for (var si = 0; si < sorted.length; si++) {
        var targetFinger = 1 + (sorted[si].fret - baseMin);
        if (targetFinger < 1) targetFinger = 1;
        if (targetFinger > 4) targetFinger = 4;
        while (used[targetFinger] && targetFinger <= 4) targetFinger++;
        if (targetFinger > 4) return null;
        fingers[sorted[si].str] = targetFinger;
        used[targetFinger] = true;
      }
      return fingers;
    }

    // Check for partial barre: consecutive strings at same fret
    function findConsecGroup(strs) {
      if (strs.length < 2) return null;
      var sorted = strs.slice().sort(function(a,b){return a-b;});
      for (var si = 1; si < sorted.length; si++) {
        if (sorted[si] - sorted[si-1] !== 1) return null;
      }
      return {from: sorted[0], to: sorted[sorted.length-1]};
    }

    // Group by fret
    var groups = {};
    for (var i5 = 0; i5 < fretted.length; i5++) {
      var f2 = fretted[i5].fret;
      if (!groups[f2]) groups[f2] = [];
      groups[f2].push(fretted[i5].str);
    }
    var fretKeys = Object.keys(groups).map(Number).sort(function(a,b){return a-b;});

    // Without barre: <=4 fretted strings
    if (fretted.length <= 4) {
      var hasOpen2 = frets.some(function(f){return f===0;});
      // Consecutive same-fret with NO open strings → partial barre (Drop D power chords)
      if (!hasOpen2 && fretKeys.length === 1 && fretted.length >= 2) {
        var bg2 = findConsecGroup(fretted.map(function(p){return p.str;}));
        if (bg2) {
          var bf = {};
          fretted.forEach(function(p){bf[p.str] = 1;});
          return {fingers: bf, barre: {fret: minF, from: bg2.from, to: bg2.to}};
        }
      }
      // Open position with exactly 2 fretted at same fret: shift to fingers 2,3 (leave index free)
      if (hasOpen2 && fretKeys.length === 1 && fretted.length === 2) {
        var fingers0 = {};
        fretted.sort(function(a,b){return a.str-b.str;});
        for (var fi = 0; fi < fretted.length; fi++) {
          fingers0[fretted[fi].str] = fi + 2;
        }
        return {fingers: fingers0, barre: null};
      }
      var fingers = assignFingers(fretted, minF);
      if (!fingers) return null;
      return {fingers: fingers, barre: null};
    }

    // 5+ fretted strings: need barre
    // Try full barre at lowest fret first (E-shape, A-shape barres)
    var barreStrs = groups[minF] ? groups[minF].slice().sort(function(a,b){return a-b;}) : [];
    if (barreStrs.length >= 2) {
      var barreFrom = barreStrs[0], barreTo = barreStrs[barreStrs.length-1];
      var barreOk = true;
      for (var s2 = barreFrom; s2 <= barreTo; s2++) {
        if (frets[s2] === -1 || frets[s2] === 0) { barreOk = false; break; }
      }
      if (barreOk) {
        var remaining2 = fretted.filter(function(p){return p.fret !== minF;});
        if (remaining2.length <= 3) {
          var fingers3 = {};
          barreStrs.forEach(function(s3){fingers3[s3] = 1;});
          // Check if remaining notes form a second barre (all same fret, consecutive)
          if (remaining2.length >= 2) {
            var allSameFret = true;
            var remFret = remaining2[0].fret;
            for (var ri3 = 1; ri3 < remaining2.length; ri3++) {
              if (remaining2[ri3].fret !== remFret) { allSameFret = false; break; }
            }
            if (allSameFret) {
              var rg = findConsecGroup(remaining2.map(function(p){return p.str;}));
              if (rg) {
                var barreFinger2 = 1 + (remFret - minF);
                if (barreFinger2 > 4) barreFinger2 = 3;
                remaining2.forEach(function(p){fingers3[p.str] = barreFinger2;});
                return {fingers: fingers3, barre: {fret: minF, from: barreFrom, to: barreTo}};
              }
            }
          }
          var remFingers = assignFingers(remaining2, minF);
          if (remFingers) {
            for (var rk2 in remFingers) { fingers3[rk2] = remFingers[rk2]; }
            var maxFn2 = 0;
            for (var fk2 in fingers3) { if (fingers3[fk2] > maxFn2) maxFn2 = fingers3[fk2]; }
            if (maxFn2 <= 4) return {fingers: fingers3, barre: {fret: minF, from: barreFrom, to: barreTo}};
          }
        }
      }
    }
    // Fallback: try partial barre at any fret with 3+ consecutive strings
    for (var gi = 0; gi < fretKeys.length; gi++) {
      var grp = groups[fretKeys[gi]];
      if (grp.length >= 3) {
        var bg = findConsecGroup(grp);
        if (bg) {
          var remaining = fretted.filter(function(p){return p.fret !== fretKeys[gi];});
          if (remaining.length <= 3) {
            var fingers2 = {};
            grp.forEach(function(s){fingers2[s] = 1 + (fretKeys[gi] - minF);});
            var remF = assignFingers(remaining, minF);
            if (remF) {
              for (var rk in remF) fingers2[rk] = remF[rk];
              var maxFn = 0;
              for (var fk in fingers2) { if (fingers2[fk] > maxFn) maxFn = fingers2[fk]; }
              if (maxFn <= 4) return {fingers: fingers2, barre: {fret: fretKeys[gi], from: bg.from, to: bg.to}};
            }
          }
        }
      }
    }

    return null; // no valid fingering found
  }

  var voicings = [];
  // Window 0: open position (open strings + frets 1-3)
  // Windows 1+: closed positions (NO open strings, frets n to n+3)
  var windows = [{lo:0, hi:3, allowOpen:true}];
  for (var w = 1; w <= maxFret - 2; w++) windows.push({lo:w, hi:w+3, allowOpen:false});

  for (var wi = 0; wi < windows.length; wi++) {
    var win = windows[wi];
    var stacks = [[]];
    for (var si3 = 0; si3 < ns; si3++) {
      var ns2 = [];
      for (var ci = 0; ci < candidates[si3].length; ci++) {
        var c = candidates[si3][ci];
        if (c.fret === -1) { // muted always allowed
          for (var si4 = 0; si4 < stacks.length; si4++) { if (ns2.length > 800) break; ns2.push(stacks[si4].concat([c])); }
        } else if (c.fret === 0) { // open only in open-position window
          if (win.allowOpen) {
            for (var si4b = 0; si4b < stacks.length; si4b++) { if (ns2.length > 800) break; ns2.push(stacks[si4b].concat([c])); }
          }
        } else if (c.fret >= win.lo && c.fret <= win.hi) { // fretted within window
          for (var si4c = 0; si4c < stacks.length; si4c++) { if (ns2.length > 800) break; ns2.push(stacks[si4c].concat([c])); }
        }
      }
      stacks = ns2;
    }
    for (var vi = 0; vi < stacks.length; vi++) {
      var v = stacks[vi];
      var pcsP = {}, fc = 0, mc = 0, oc = 0, mnF = 99, mxF = 0, loP = -1;
      for (var si5 = 0; si5 < v.length; si5++) {
        if (v[si5].fret === -1) { mc++; continue; }
        pcsP[v[si5].pc] = true; fc++;
        if (v[si5].fret === 0) oc++;
        if (v[si5].fret > 0) { mnF = Math.min(mnF, v[si5].fret); mxF = Math.max(mxF, v[si5].fret); }
        var ap = tuning[si5] + v[si5].fret;
        if (loP === -1 || ap < loP) loP = ap;
      }
      // Validate chord tones
      if (!pcsP[rootNote % 12]) continue;
      if (tones.length >= 3 && !pcsP[(rootNote + tones[1]) % 12]) continue;
      var missingReq = false;
      for (var ti2 = 3; ti2 < tones.length; ti2++) {
        if (!pcsP[(rootNote + tones[ti2]) % 12]) { missingReq = true; break; }
      }
      if (missingReq) continue;
      if (tones.length === 3 && !pcsP[(rootNote + tones[2]) % 12]) continue;
      if (isPower && Object.keys(pcsP).length < tones.length) continue;
      if (fc < 2) continue;
      // No interior muted strings
      var ff = -1, lf = -1;
      for (var si6 = 0; si6 < v.length; si6++) { if (v[si6].fret >= 0) { if (ff === -1) ff = si6; lf = si6; } }
      var im = false;
      for (var si7 = ff + 1; si7 < lf; si7++) { if (v[si7].fret === -1) { im = true; break; } }
      if (im) continue;
      // Bass constraint
      var lpc = loP % 12;
      if (bassMode === "root" && lpc !== rootNote % 12) continue;
      if (bassMode === "1st") { if (tones.length < 3) continue; if (lpc !== (rootNote + tones[1]) % 12) continue; }
      if (bassMode === "2nd") { if (tones.length < 3) continue; if (lpc !== (rootNote + tones[2]) % 12) continue; }
      var frets = v.map(function(x) { return x.fret; });
      // Reject unison duplicates
      var pitchSet = {};
      var hasDup = false;
      for (var si8b = 0; si8b < frets.length; si8b++) {
        if (frets[si8b] >= 0) {
          var absP = tuning[si8b] + frets[si8b];
          if (pitchSet[absP]) { hasDup = true; break; }
          pitchSet[absP] = true;
        }
      }
      if (hasDup) continue;
      // Power chord constraints
      if (isPower) {
        if (fc > 3) continue;
        // Must start on low strings (lowest sounding string <= string 2 for 6+ strings)
        if (ns > 4 && ff > 2) continue;
      }
      // Playability
      var fingering = tryFingers(frets); if (!fingering) continue;
      // Score
      var span = (mxF > 0 && mnF < 99) ? (mxF - mnF) : 0;
      var score = span * 8 - fc * 4 + mc * 6 + (mnF === 99 ? 0 : mnF);
      if (isPower) {
        score = span * 2 - fc * 4 + mc * 6 + (mnF === 99 ? 0 : mnF);
        score += (fc - 2) * 8;
      }
      // Boost standard open voicings to ensure they rank first
      var STD_OPEN = {
        "-1,3,2,0,1,0":1, // C
        "-1,-1,0,2,3,2":1, // D
        "0,2,2,1,0,0":1,  // E
        "3,2,0,0,0,3":1,  // G
        "-1,0,2,2,2,0":1, // A
        "-1,3,1,0,1,3":1, // Cm
        "-1,-1,0,2,3,1":1, // Dm
        "0,2,2,0,0,0":1,  // Em
        "-1,0,2,2,1,0":1, // Am
        "-1,3,2,3,1,0":1, // C7
        "-1,-1,0,2,1,2":1, // D7
        "0,2,0,1,0,0":1,  // E7
        "3,2,0,0,0,1":1,  // G7
        "-1,0,2,0,2,0":1, // A7
        "-1,-1,0,2,1,1":1, // Dm7
        "0,2,2,0,3,0":1,  // Em7
        "-1,0,2,0,1,0":1, // Am7
        "-1,3,2,0,0,0":1, // Cmaj7
        "-1,0,2,2,0,0":1, // Asus2
        "-1,-1,0,2,3,0":1, // Dsus2
        "-1,3,0,0,3,3":1, // Csus2
        "-1,0,2,2,3,0":1, // Asus4
        "-1,-1,0,2,3,3":1, // Dsus4
        "0,2,2,2,0,0":1,  // Esus4
        "-1,3,2,0,3,0":1, // Cadd9
        "3,2,0,0,0,0":1,  // G6
        "-1,3,2,2,1,0":1, // C6
        "-1,-1,0,1,3,1":1, // Ddim
        "0,3,2,1,1,0":1,  // Eaug
      };
      if (STD_OPEN[frets.join(",")]) score -= 50;
      voicings.push({frets:frets, score:score, minFret:mnF === 99 ? 0 : mnF, key:frets.join(","), fingering:fingering});
    }
  }
  // Deduplicate
  var seen = {}, unique = [];
  for (var ui = 0; ui < voicings.length; ui++) { if (!seen[voicings[ui].key]) { seen[voicings[ui].key] = true; unique.push(voicings[ui]); } }
  unique.sort(function(a, b) { return a.score - b.score; });
  // Remove subset voicings (skip for power chords - 2/3 note versions are both valid)
  var filtered = [];
  for (var fi = 0; fi < unique.length; fi++) {
    if (isPower) { filtered.push(unique[fi]); continue; }
    var isSubset = false;
    var fA = unique[fi].frets;
    for (var fj = 0; fj < filtered.length; fj++) {
      var fB = filtered[fj].frets;
      if (fA.length !== fB.length) continue;
      var aSubB = true, bSubA = true;
      for (var fk = 0; fk < fA.length; fk++) {
        if (fA[fk] >= 0 && fB[fk] !== fA[fk]) { aSubB = false; }
        if (fB[fk] >= 0 && fA[fk] !== fB[fk]) { bSubA = false; }
      }
      if (aSubB && !bSubA) { isSubset = true; break; } // A is a subset of B (fewer notes)
    }
    if (!isSubset) filtered.push(unique[fi]);
  }
  // Group by position, keep best 4 per position
  var byPos = {};
  for (var gi = 0; gi < filtered.length; gi++) {
    var hasOpenG = filtered[gi].frets.indexOf(0) >= 0;
    var pk = hasOpenG ? 0 : filtered[gi].minFret;
    if (!byPos[pk]) byPos[pk] = [];
    if (byPos[pk].length < 4) byPos[pk].push(filtered[gi]);
  }
  var result = [];
  var posKeys = Object.keys(byPos).sort(function(a, b) { return +a - +b; });
  for (var pi = 0; pi < posKeys.length; pi++) { for (var ri = 0; ri < byPos[posKeys[pi]].length; ri++) result.push(byPos[posKeys[pi]][ri]); }
  return result.slice(0, 16);
}

var SECTION_COLORS = [
  {name:"Blue",color:"#3b82f6"},{name:"Green",color:"#22c55e"},{name:"Orange",color:"#f97316"},
  {name:"Purple",color:"#a855f7"},{name:"Red",color:"#ef4444"},{name:"Teal",color:"#14b8a6"},
  {name:"Pink",color:"#ec4899"},{name:"Yellow",color:"#eab308"}
];
var SECTION_PRESETS = ["Intro","Verse","Pre-Chorus","Chorus","Bridge","Solo","Interlude","Breakdown","Outro"];

// Shift section positions when bars are inserted/deleted
function shiftSections(song2, atBar, delta) {
  if (!song2.sections) return;
  var maxBar = song2.tracks[0] ? song2.tracks[0].measures.length - 1 : 0;
  for (var si = song2.sections.length - 1; si >= 0; si--) {
    var sec = song2.sections[si];
    var secEnd = sec.bar + (sec.bars || 1);
    if (delta > 0) {
      // Insert: if inside section, grow it; if before section, shift it
      if (atBar >= sec.bar && atBar < secEnd) {
        sec.bars = (sec.bars || 1) + delta;
      } else if (atBar <= sec.bar) {
        sec.bar += delta;
      }
    } else {
      // Delete: if inside section, shrink it; if before section, shift it
      if (atBar >= sec.bar && atBar < secEnd) {
        sec.bars = Math.max(1, (sec.bars || 1) + delta);
      } else if (atBar < sec.bar) {
        sec.bar = Math.max(0, sec.bar + delta);
      }
    }
  }
  // Remove sections pointing beyond the song
  song2.sections = song2.sections.filter(function(s) { return s.bar <= maxBar; });
}

// Check if a section range overlaps with existing sections (exclude editIdx)
function checkSectionOverlap(sections, bar, bars, editIdx) {
  var newStart = bar, newEnd = bar + bars;
  for (var i = 0; i < sections.length; i++) {
    if (i === editIdx) continue;
    var s = sections[i];
    var sStart = s.bar, sEnd = s.bar + (s.bars || 1);
    if (newStart < sEnd && newEnd > sStart) {
      return s.name + " (bars " + (sStart + 1) + "\u2013" + sEnd + ")";
    }
  }
  return null;
}

function blurActive(){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}
var DEFAULT_KEYMAP = {newSong:"Ctrl+N",openFile:"Ctrl+O",save:"Ctrl+S",closeTab:"Ctrl+W",print:"Ctrl+P",undo:"Ctrl+Z",cut:"Ctrl+X",copy:"Ctrl+C",paste:"Ctrl+V",goToBar:"Ctrl+G",insertNote:"Insert",deleteNote:"Delete",insertBar:"Ctrl+Insert",deleteBar:"Ctrl+Delete",preBend:"Ctrl+B",noteVelocity:"Ctrl+Shift+V",trackEffects:"F",midiControllers:"Ctrl+Q",tempoChange:"Ctrl+T",instChange:"Ctrl+I",volChange:"Ctrl+H",clearTrackEffect:"Ctrl+Backspace",altTimeRegion:"Ctrl+Alt+W",staffBreak:"Ctrl+Shift+K",repeatOpen:"Ctrl+E",repeatClose:"Ctrl+R",songTitle:"Ctrl+L",trackProps:"Ctrl+A",songTempo:"Ctrl+M",timeSig:"Ctrl+Shift+M",playTrack:"F5",playAll:"F6",stop:"F8",playAllSpace:"Ctrl+Space",metronome:"F11",rewind:"F9",holdToPlay:"F7",chordBuilder:"Ctrl+Shift+C"};
var KEYMAP_LABELS = {newSong:"New Song",openFile:"Open File",save:"Save",closeTab:"Close Tab",print:"Print",undo:"Undo",cut:"Cut",copy:"Copy",paste:"Paste",goToBar:"Go to Bar",insertNote:"Insert Note",deleteNote:"Delete Note",insertBar:"Insert Bar",deleteBar:"Delete Bar",preBend:"Pre-Bend",noteVelocity:"Note Velocity",trackEffects:"Track Effects",midiControllers:"MIDI Controllers",tempoChange:"Tempo Change",instChange:"Instrument Change",volChange:"Volume Change",clearTrackEffect:"Clear Track Effect",altTimeRegion:"Alt Time Region",staffBreak:"Staff Break",repeatOpen:"Repeat Open",repeatClose:"Repeat Close",songTitle:"Song Title/Info",trackProps:"Track Properties",songTempo:"Song Tempo",timeSig:"Time Signature",playTrack:"Play Track",playAll:"Play All",stop:"Stop",playAllSpace:"Play All (Alt)",metronome:"Metronome",rewind:"Rewind After Stop",holdToPlay:"Hold to Play"};
var KEYMAP_GROUPS = [{label:"File",actions:["newSong","openFile","save","closeTab","print"]},{label:"Edit",actions:["undo","cut","copy","paste","goToBar","insertNote","deleteNote","insertBar","deleteBar"]},{label:"Create",actions:["preBend","noteVelocity","trackEffects","midiControllers","tempoChange","instChange","volChange","clearTrackEffect","altTimeRegion"]},{label:"Structure",actions:["staffBreak","repeatOpen","repeatClose"]},{label:"Song",actions:["songTitle","trackProps","songTempo","timeSig"]},{label:"Playback",actions:["playTrack","playAll","playAllSpace","stop","metronome","rewind","holdToPlay"]}];
function loadKeymap(){try{var s=localStorage.getItem("tabkit_keymap");if(s){var o=JSON.parse(s);var m={};for(var k in DEFAULT_KEYMAP)m[k]=o[k]||DEFAULT_KEYMAP[k];return m;}}catch(e){}return Object.assign({},DEFAULT_KEYMAP);}
function saveKeymap(km){try{var overrides={};for(var k in km){if(km[k]!==DEFAULT_KEYMAP[k])overrides[k]=km[k];}if(Object.keys(overrides).length>0)localStorage.setItem("tabkit_keymap",JSON.stringify(overrides));else localStorage.removeItem("tabkit_keymap");}catch(e){}}
function eventToCombo(e){var parts=[];if(e.ctrlKey||e.metaKey)parts.push("Ctrl");if(e.altKey)parts.push("Alt");if(e.shiftKey)parts.push("Shift");var key;if(parts.length>0&&e.code){if(/^Key[A-Z]$/.test(e.code))key=e.code.charAt(3);else if(e.code==="Space")key="Space";else if(e.code==="Backspace")key="Backspace";else if(e.code==="Delete")key="Delete";else if(e.code==="Insert")key="Insert";else if(e.code==="Tab")key="Tab";else if(/^F\d+$/.test(e.code))key=e.code;else key=e.key.length===1?e.key.toUpperCase():e.key;}else{key=e.key;if(key.length===1)key=key.toUpperCase();}if(parts.length===0&&(/^F\d+$/.test(key)||key==="Insert"||key==="Delete"))return key;if(parts.length===0&&key.length===1)return key.toUpperCase();if(parts.length===0)return null;parts.push(key);return parts.join("+");}
function buildReverseKeymap(km){var r={};for(var a in km)r[km[a]]=a;return r;}
// === MAIN APP ===
// ============ MIDI Import ============
function parseMIDI(buf) {
  var d = new DataView(buf); var p = 0;
  function u8(){return d.getUint8(p++);}
  function u16(){var v=d.getUint16(p);p+=2;return v;}
  function u32(){var v=d.getUint32(p);p+=4;return v;}
  function vlq(){var v=0,b;do{b=u8();v=(v<<7)|(b&0x7F);}while(b&0x80);return v;}
  function str(n){var s="";for(var i=0;i<n;i++)s+=String.fromCharCode(u8());return s;}
  // Header
  if(str(4)!=="MThd"||u32()!==6)throw new Error("Not a MIDI file");
  var fmt=u16(),nTrk=u16(),div=u16();
  var ppq=div&0x7FFF; // ticks per quarter note
  var tracks=[];
  for(var t=0;t<nTrk;t++){
    if(str(4)!=="MTrk")throw new Error("Bad track chunk");
    var tLen=u32(),tEnd=p+tLen;
    var events=[],tick=0,running=0;
    while(p<tEnd){
      var dt=vlq(); tick+=dt;
      var b0=u8();
      if(b0===0xFF){ // Meta event
        var mtype=u8(),mlen=vlq(),mdata=[];
        for(var mi=0;mi<mlen;mi++)mdata.push(u8());
        var ev={tick:tick,type:"meta",subtype:mtype,data:mdata};
        if(mtype===0x03){ev.text="";for(var ti=0;ti<mdata.length;ti++)ev.text+=String.fromCharCode(mdata[ti]);} // Track name
        if(mtype===0x51){ev.tempo=((mdata[0]<<16)|(mdata[1]<<8)|mdata[2]);} // Tempo (microseconds per beat)
        if(mtype===0x58){ev.timeSig={num:mdata[0],den:Math.pow(2,mdata[1])};} // Time signature
        events.push(ev);
      } else if(b0===0xF0||b0===0xF7){ // SysEx
        var slen=vlq();p+=slen;
      } else { // Channel event
        var status,d1;
        if(b0&0x80){status=b0;d1=u8();running=status;} else {status=running;d1=b0;}
        var ch=status&0x0F,cmd=status&0xF0;
        if(cmd===0x80){events.push({tick:tick,type:"noteOff",ch:ch,note:d1,vel:u8()});}
        else if(cmd===0x90){var vel=u8();events.push({tick:tick,type:vel>0?"noteOn":"noteOff",ch:ch,note:d1,vel:vel});}
        else if(cmd===0xA0){events.push({tick:tick,type:"aftertouch",ch:ch,note:d1,val:u8()});}
        else if(cmd===0xB0){events.push({tick:tick,type:"cc",ch:ch,cc:d1,val:u8()});}
        else if(cmd===0xC0){events.push({tick:tick,type:"program",ch:ch,program:d1});}
        else if(cmd===0xD0){events.push({tick:tick,type:"chanPressure",ch:ch,val:d1});}
        else if(cmd===0xE0){var lsb=d1,msb=u8();events.push({tick:tick,type:"pitchBend",ch:ch,value:((msb<<7)|lsb)-8192});}
      }
    }
    p=tEnd;
    tracks.push({events:events});
  }
  return {format:fmt,ppq:ppq,tracks:tracks};
}

function midiToSong(midi, opts) {
  opts=opts||{};
  var positionPref=opts.position||5; // preferred fret position (center of comfort zone)
  var maxFret=opts.maxFret||29;

  // Collect global tempo & time sig from all tracks
  var tempo=120, timeSigNum=4, timeSigDen=4;
  var timeSigChanges=[];
  var tempoMap=[]; // {tick, bpm}
  var allEvents=[]; // flattened with track index
  midi.tracks.forEach(function(tr,ti){
    tr.events.forEach(function(ev){
      if(ev.type==="meta"&&ev.subtype===0x51){
        var bpm=Math.round(60000000/ev.tempo);
        tempoMap.push({tick:ev.tick,bpm:bpm});
        if(ev.tick===0)tempo=bpm;
      }
      if(ev.type==="meta"&&ev.subtype===0x58&&ev.tick===0){timeSigNum=ev.timeSig.num;timeSigDen=ev.timeSig.den;}
      // Collect all time signature changes
      if(ev.type==="meta"&&ev.subtype===0x58){
        if(!timeSigChanges)timeSigChanges=[];
        timeSigChanges.push({tick:ev.tick,num:ev.timeSig.num,den:ev.timeSig.den});
      }
      allEvents.push(Object.assign({},ev,{_ti:ti}));
    });
  });
  if(tempoMap.length>0)tempo=tempoMap[0].bpm;

  // Group note events by channel (or by track if format 1)
  var channelTracks={}; // ch -> [{noteOn, noteOff, note, vel, ch, program}]
  var channelPrograms={}; // ch -> program number
  var channelNames={}; // ch -> name
  midi.tracks.forEach(function(tr){
    var trkName="";
    var curProg=0;
    tr.events.forEach(function(ev){
      if(ev.type==="meta"&&ev.subtype===0x03)trkName=ev.text||"";
      if(ev.type==="program"){curProg=ev.program;channelPrograms[ev.ch]=ev.program;}
    });
    // Collect notes with on/off pairs
    var pending={}; // note -> [{tick,vel}]
    tr.events.forEach(function(ev){
      if(ev.type==="noteOn"){
        if(!pending[ev.ch])pending[ev.ch]={};
        if(!pending[ev.ch][ev.note])pending[ev.ch][ev.note]=[];
        pending[ev.ch][ev.note].push({tick:ev.tick,vel:ev.vel});
      }
      if(ev.type==="noteOff"){
        if(pending[ev.ch]&&pending[ev.ch][ev.note]&&pending[ev.ch][ev.note].length>0){
          var on=pending[ev.ch][ev.note].shift();
          if(!channelTracks[ev.ch])channelTracks[ev.ch]=[];
          channelTracks[ev.ch].push({onTick:on.tick,offTick:ev.tick,note:ev.note,vel:on.vel,ch:ev.ch});
          if(trkName&&!channelNames[ev.ch])channelNames[ev.ch]=trkName;
        }
      }
    });
  });

  // Collect pitch bend events per channel for slide detection
  var channelBends={};
  var channelPBRange={}; // pitch bend range in semitones per channel (default 2)
  midi.tracks.forEach(function(tr){
    var rpn={};
    tr.events.forEach(function(ev){
      if(ev.type==="pitchBend"){
        if(!channelBends[ev.ch])channelBends[ev.ch]=[];
        channelBends[ev.ch].push({tick:ev.tick,value:ev.value});
      }
      // Detect pitch bend range via RPN 0,0 + Data Entry
      if(ev.type==="cc"){
        if(ev.cc===101) rpn[ev.ch+"_msb"]=ev.val;
        if(ev.cc===100) rpn[ev.ch+"_lsb"]=ev.val;
        if(ev.cc===6 && rpn[ev.ch+"_msb"]===0 && rpn[ev.ch+"_lsb"]===0){
          channelPBRange[ev.ch]=ev.val; // semitones
        }
      }
    });
  });

  // Collect tempo changes for track effect placement
  var tempoChanges=[];
  midi.tracks.forEach(function(tr){
    tr.events.forEach(function(ev){
      if(ev.type==="meta"&&ev.subtype===0x51){
        tempoChanges.push({tick:ev.tick,bpm:Math.round(60000000/ev.tempo)});
      }
    });
  });

  // Collect CC7 (volume), CC10 (pan), CC91 (reverb), CC93 (chorus), CC1 (modulation) per channel
  var channelVolumes={}, channelPans={}, channelReverb={}, channelChorus={}, channelMod={};
  var channelInstChanges={}; // ch -> [{tick, program}]
  midi.tracks.forEach(function(tr){
    tr.events.forEach(function(ev){
      if(ev.type==="cc"){
        var ch2=ev.ch;
        if(ev.cc===7){if(!channelVolumes[ch2])channelVolumes[ch2]=[];channelVolumes[ch2].push({tick:ev.tick,value:ev.val});}
        if(ev.cc===10){if(!channelPans[ch2])channelPans[ch2]=[];channelPans[ch2].push({tick:ev.tick,value:ev.val});}
        if(ev.cc===91){if(!channelReverb[ch2])channelReverb[ch2]=[];channelReverb[ch2].push({tick:ev.tick,value:ev.val});}
        if(ev.cc===93){if(!channelChorus[ch2])channelChorus[ch2]=[];channelChorus[ch2].push({tick:ev.tick,value:ev.val});}
        if(ev.cc===1){if(!channelMod[ch2])channelMod[ch2]=[];channelMod[ch2].push({tick:ev.tick,value:ev.val});}
      }
      if(ev.type==="program"){
        if(!channelInstChanges[ev.ch])channelInstChanges[ev.ch]=[];
        channelInstChanges[ev.ch].push({tick:ev.tick,program:ev.program});
      }
    });
  });

  // 16th note grid: ticks per 16th = ppq / 4
  var tpb=midi.ppq/4; // ticks per beat (16th note)
  var defaultBPM=Math.round(timeSigNum*(16/timeSigDen));

  // Detect actual note resolution across all channels
  var allNoteTicks=[];
  Object.keys(channelTracks).forEach(function(ch){
    channelTracks[ch].forEach(function(n){allNoteTicks.push(n.onTick);});
  });
  // Find if notes only land on 8th-note grid (every 2nd 16th), quarter-note grid (every 4th), etc.
  var resolution=1; // in 16th notes: 1=16th, 2=8th, 4=quarter
  if(allNoteTicks.length>10){
    var on8th=true,onQuarter=true;
    allNoteTicks.forEach(function(t2){
      var pos=Math.round(t2/tpb);
      if(pos%2!==0)on8th=false;
      if(pos%4!==0)onQuarter=false;
    });
    if(onQuarter)resolution=4;
    else if(on8th)resolution=2;
  }
  tpb=tpb*resolution; // adjust tick resolution
  var beatsPerMeasure=Math.round(defaultBPM/resolution);

  // Standard tunings
  var GUITAR_TUNINGS=[
    {n:6,t:[40,45,50,55,59,64],name:"Standard",w:0},       // E2-A2-D3-G3-B3-E4
    {n:6,t:[38,45,50,55,59,64],name:"Drop D",w:1},          // D2-A2-D3-G3-B3-E4
    {n:6,t:[39,44,49,54,58,63],name:"Eb Standard",w:2},     // Eb2-Ab2-Db3-Gb3-Bb3-Eb4
    {n:6,t:[37,44,49,54,58,63],name:"Drop Db",w:3},         // Db2-Ab2-Db3-Gb3-Bb3-Eb4
    {n:6,t:[38,43,48,53,57,62],name:"D Standard",w:3},      // D2-G2-C3-F3-A3-D4
    {n:6,t:[36,43,48,53,57,62],name:"Drop C",w:4},          // C2-G2-C3-F3-A3-D4
    {n:6,t:[38,45,50,55,57,62],name:"DADGAD",w:15},          // D2-A2-D3-G3-A3-D4
    {n:6,t:[38,45,50,54,57,62],name:"Open D",w:15},          // D2-A2-D3-Gb3-A3-D4
    {n:6,t:[38,43,50,55,59,62],name:"Open G",w:15},          // D2-G2-D3-G3-B3-D4
    {n:7,t:[35,40,45,50,55,59,64],name:"7-Std",w:2},        // B1-E2-A2-D3-G3-B3-E4
    {n:7,t:[33,40,45,50,55,59,64],name:"7-Drop A",w:4},     // A1-E2-A2-D3-G3-B3-E4
    {n:8,t:[30,35,40,45,50,55,59,64],name:"8-Std",w:5},     // Gb1-B1-E2-A2-D3-G3-B3-E4
  ];
  var BASS_TUNINGS=[
    {n:4,t:[28,33,38,43],name:"Bass Std",w:0},              // E1-A1-D2-G2
    {n:4,t:[26,33,38,43],name:"Bass Drop D",w:1},           // D1-A1-D2-G2
    {n:4,t:[27,32,37,42],name:"Bass Eb",w:3},               // Eb1-Ab1-Db2-Gb2
    {n:5,t:[23,28,33,38,43],name:"Bass 5-Std",w:1},         // B0-E1-A1-D2-G2
    {n:5,t:[21,28,33,38,43],name:"Bass 5-Drop A",w:3},      // A0-E1-A1-D2-G2
    {n:5,t:[23,26,33,38,43],name:"Bass 5-BDADG",w:15},       // B0-D1-A1-D2-G2
    {n:6,t:[23,28,33,38,43,48],name:"Bass 6-Std",w:3},      // B0-E1-A1-D2-G2-C3
  ];

  function bestTuning(notes, isDrum, program){
    if(isDrum)return null;
    var lo=127,hi=0;
    notes.forEach(function(n){if(n.note<lo)lo=n.note;if(n.note>hi)hi=n.note;});
    var isBassProgram=(program>=32&&program<=39);
    var isBassRange=(hi<=55&&lo<=38);
    var isBass=isBassProgram||isBassRange;
    var candidates=isBass?BASS_TUNINGS:GUITAR_TUNINGS;
    var allCandidates=candidates.concat(isBass?GUITAR_TUNINGS:BASS_TUNINGS);
    var totalNotes=notes.length;

    var best=null,bestScore=Infinity;

    // Generate dynamic shifted tunings: shift standard templates to align with the actual note range
    var dynamicCandidates=[];
    var templates=[
      {n:6,t:[40,45,50,55,59,64],name:"6-Shifted"},
      {n:7,t:[35,40,45,50,55,59,64],name:"7-Shifted"},
      {n:8,t:[30,35,40,45,50,55,59,64],name:"8-Shifted"},
    ];
    // Also generate variants with 5th (7st) first interval — common in drop/extended tunings
    // Standard 7-string intervals: 5,5,5,5,4,5. Drop-5th: 7,5,5,5,4,5
    var dropTemplates=[
      {n:7,ints:[7,5,5,5,4,5],name:"7-Drop5th"},
      {n:8,ints:[7,5,5,5,5,4,5],name:"8-Drop5th"},
    ];
    if(!isBass){
      templates.forEach(function(tmpl){
        var shift=lo-tmpl.t[0];
        if(shift===0)return;
        var shifted=tmpl.t.map(function(v){return v+shift;});
        if(shifted[0]>=20&&shifted[shifted.length-1]<=72){
          dynamicCandidates.push({n:tmpl.n,t:shifted,name:tmpl.name,w:10});
        }
        for(var sf=1;sf<=3;sf++){
          var shifted2=tmpl.t.map(function(v){return v+shift+sf;});
          if(shifted2[0]>=20&&shifted2[shifted2.length-1]<=72){
            dynamicCandidates.push({n:shifted2.length,t:shifted2,name:tmpl.name+"+"+sf,w:12});
          }
        }
      });
      // Build drop-5th tunings starting from the lowest note
      dropTemplates.forEach(function(dt){
        var t2=[lo];
        for(var di=0;di<dt.ints.length;di++)t2.push(t2[t2.length-1]+dt.ints[di]);
        if(t2[t2.length-1]<=72){
          dynamicCandidates.push({n:dt.n,t:t2,name:dt.name,w:8});
        }
      });
    }

    allCandidates.concat(dynamicCandidates).forEach(function(cand){
      var t=cand.t,ns2=cand.n;
      var outOfRange=0,totalFret=0,validCount=0;
      notes.forEach(function(n){
        var bestF=Infinity;
        for(var si=0;si<ns2;si++){
          var f=n.note-t[si];
          if(f>=0&&f<=maxFret){if(f<bestF)bestF=f;validCount++;}
        }
        if(bestF===Infinity)outOfRange++;
        else totalFret+=bestF;
      });
      var avgFret=validCount>0?totalFret/validCount:12;
      var isPrimary=candidates.indexOf(cand)>=0;
      var isDynamic=dynamicCandidates.indexOf(cand)>=0;
      // Tolerate up to 3% outliers (notes just barely out of range - may be transpose/bend artifacts)
      var effectiveOOR=outOfRange;
      if(outOfRange<=Math.max(2,Math.ceil(totalNotes*0.03)))effectiveOOR=0;
      var nsPen=isDynamic?ns2*3:(ns2<=6?ns2*3:ns2*8);
      var score=effectiveOOR*1000+avgFret*2+nsPen+(isPrimary?0:(isDynamic?20:50))+(cand.w||0)*1.5;
      // Tiebreaker: fewer raw OOR is better even when under tolerance
      if(isDynamic&&effectiveOOR===0)score+=outOfRange*0.5;
      // Heavy penalty for crossing bass/guitar boundary (bass tuning on guitar program or vice versa)
      if(!isPrimary&&!isDynamic){
        var candIsBass=BASS_TUNINGS.indexOf(cand)>=0;
        if(candIsBass!==isBass) score+=200;
      }
      if(score<bestScore){bestScore=score;best={numStrings:ns2,tuning:t.slice(),isBass:isBass};}
    });
    return best||{numStrings:6,tuning:[40,45,50,55,59,64],isBass:isBass};
  }

  // Assign notes to strings using position-based algorithm
  function assignToStrings(notes, tuning, numStrings, isDrum){
    if(isDrum)return notes.map(function(n){return{note:n,string:0,fret:n.note};});

    // Sort by tick then by pitch (low to high)
    var sorted=notes.slice().sort(function(a,b){return a.onTick-b.onTick||(a.note-b.note);});

    // Group into simultaneous events (same tick = chord)
    var groups=[];
    var i=0;
    while(i<sorted.length){
      var g=[sorted[i]];
      while(i+1<sorted.length&&sorted[i+1].onTick===sorted[i].onTick){i++;g.push(sorted[i]);}
      groups.push(g);i++;
    }

    var curPos=positionPref; // current fret position preference
    var lastStringFret=new Array(numStrings).fill(-1); // last fret per string for effect detection
    var results=[];

    groups.forEach(function(group){
      // Pre-detect muted notes (ultra-short duration) and separate them
      // Songsterr: duration only; TabIt: duration + low velocity
      // Skip for drums — drum hits are naturally short
      var realGroup=[], mutedGroup=[];
      group.forEach(function(n){
        var dur=n.offTick-n.onTick;
        var isMuted2=!isDrum && dur<=baseTpb/3 && (isSongsterrMidi || n.vel<=50);
        if(isMuted2) mutedGroup.push(n);
        else realGroup.push(n);
      });

      // For each note, find valid (string, fret) options
      var options=realGroup.map(function(n){
        var opts=[];
        for(var si=0;si<numStrings;si++){
          var f=n.note-tuning[si];
          if(f>=0&&f<=maxFret)opts.push({string:si,fret:f});
        }
        return{note:n,opts:opts};
      });

      if(realGroup.length===1){
        // Single note: pick closest to current position, slight preference for lower frets
        var best=null,bestScore=Infinity;
        options[0].opts.forEach(function(o){
          var score=Math.abs(o.fret-curPos)*2+o.fret*0.5+(o.fret>12?(o.fret-12)*3:0);
          if(score<bestScore){bestScore=score;best=o;}
        });
        if(best){
          results.push({note:realGroup[0],string:best.string,fret:best.fret});
          curPos=curPos*0.7+best.fret*0.3;
        } else {
          var closestS=0,closestD=Infinity;
          for(var si=0;si<numStrings;si++){
            var f=realGroup[0].note-tuning[si];
            if(Math.abs(f)<closestD){closestD=Math.abs(f);closestS=si;}
          }
          var cf=Math.max(0,Math.min(maxFret,realGroup[0].note-tuning[closestS]));
          results.push({note:realGroup[0],string:closestS,fret:cf});
        }
      } else if(realGroup.length>=2){
        // Chord: find best voicing by trying combinations
        var chordNotes=options.slice().sort(function(a,b){return a.note.note-b.note.note;});
        // Build all valid combos (unique strings, max ~1000 combinations)
        var bestCombo=null,bestComboScore=Infinity;
        function tryCombo(idx, chosen, usedStr){
          if(idx===chordNotes.length){
            // Score this voicing: prefer compact fret range on adjacent strings, penalize high frets
            var frets3=chosen.map(function(c){return c.fret;});
            var maxFret2=Math.max.apply(null,frets3), minFret2=Math.min.apply(null,frets3);
            var spread=maxFret2-minFret2;
            var avgFret=frets3.reduce(function(a,b){return a+b;},0)/frets3.length;
            var strings=chosen.map(function(c){return c.string;}).sort(function(a,b){return a-b;});
            var strGaps=0;for(var gi=1;gi<strings.length;gi++)strGaps+=strings[gi]-strings[gi-1]-1;
            var highFretPen=0;frets3.forEach(function(f){if(f>12)highFretPen+=(f-12)*2;});
            var score=spread*10+strGaps*15+avgFret*3+Math.abs(avgFret-curPos)*0.3+highFretPen;
            if(score<bestComboScore){bestComboScore=score;bestCombo=chosen.slice();}
            return;
          }
          var cn=chordNotes[idx];
          if(cn.opts.length===0){tryCombo(idx+1,chosen,usedStr);return;}
          for(var oi=0;oi<cn.opts.length;oi++){
            var o=cn.opts[oi];
            if(usedStr[o.string])continue;
            chosen.push(o);usedStr[o.string]=true;
            tryCombo(idx+1,chosen,usedStr);
            chosen.pop();usedStr[o.string]=false;
          }
        }
        if(chordNotes.length<=6){
          tryCombo(0,[],{});
        }
        if(bestCombo){
          for(var ci=0;ci<chordNotes.length;ci++){
            if(bestCombo[ci])results.push({note:chordNotes[ci].note,string:bestCombo[ci].string,fret:bestCombo[ci].fret});
          }
        } else {
          // Fallback: greedy assignment
          var used={};
          chordNotes.forEach(function(cn){
            var best2=null,bestScore2=Infinity;
            cn.opts.forEach(function(o){
              if(used[o.string])return;
              var score=o.fret*2+Math.abs(o.fret-curPos)*0.3+(o.fret>12?(o.fret-12)*3:0);
              if(score<bestScore2){bestScore2=score;best2=o;}
            });
            if(best2){used[best2.string]=true;results.push({note:cn.note,string:best2.string,fret:best2.fret});}
            else if(cn.opts.length>0)results.push({note:cn.note,string:cn.opts[0].string,fret:cn.opts[0].fret});
          });
        }
        var frets2=results.filter(function(r){return realGroup.indexOf(r.note)>=0;}).map(function(r){return r.fret;});
        if(frets2.length>0){var avg2=frets2.reduce(function(a,b){return a+b;},0)/frets2.length;curPos=curPos*0.5+avg2*0.5;}
      }
      // Place muted notes — assign to any available string, preferring near chord notes
      mutedGroup.forEach(function(mn){
        results.push({note:mn,string:-1,fret:0,muted:true});
      });
    });

    return results;
  }

  // Detect effects from note patterns and pitch bends
  // Build tempo regions for ATR detection
  var tempoRegions = [];
  var sortedTempos = tempoChanges.slice().sort(function(a,b){return a.tick-b.tick;});
  if (sortedTempos.length === 0) sortedTempos = [{tick:0, bpm:tempo}];

  // Snap tempo changes to nearest measure boundary to avoid mid-measure splits
  var baseTicksPerMeasure2 = midi.ppq * 4;
  for (var sti = 1; sti < sortedTempos.length; sti++) {
    var measNum = sortedTempos[sti].tick / baseTicksPerMeasure2;
    var rounded = Math.round(measNum) * baseTicksPerMeasure2;
    sortedTempos[sti].tick = rounded;
  }

  // Collect all note ticks for alignment analysis
  var allOnTicks2 = [];
  Object.keys(channelTracks).forEach(function(ch2){
    channelTracks[ch2].forEach(function(n){
      allOnTicks2.push(n.onTick);
    });
  });
  allOnTicks2.sort(function(a,b){return a-b;});
  var lastNoteTick = allOnTicks2.length > 0 ? allOnTicks2[allOnTicks2.length-1] : 0;

  var baseBPM = sortedTempos[0].bpm;
  var baseTpb = midi.ppq / 4; // base 16th-note ticks
  var baseTicksPerMeasure = midi.ppq * 4;
  var defaultBPM2 = Math.round(timeSigNum*(16/timeSigDen));

  for (var ri = 0; ri < sortedTempos.length; ri++) {
    var rStart = sortedTempos[ri].tick;
    var rEnd = (ri + 1 < sortedTempos.length) ? sortedTempos[ri+1].tick : lastNoteTick + baseTicksPerMeasure;
    var rBPM = sortedTempos[ri].bpm;
    var regionBPM = defaultBPM2;
    var regionTPB = baseTpb;
    var regionATR = false;
    var regionAtrGroup = 1, regionAtrNum = 1;
    tempoRegions.push({startTick:rStart, endTick:rEnd, bpm:rBPM, beatsPerMeasure:regionBPM, tpb:regionTPB, isATR:regionATR, atrGroup:regionAtrGroup, atrNum:regionAtrNum, realTempo:regionATR?Math.round(rBPM*regionBPM/defaultBPM2):rBPM});
  }

  // Build global measure map using time signature changes
  var measureMap = [];
  var sortedTSChanges = timeSigChanges.slice().sort(function(a,b){return a.tick-b.tick;});
  // Build TS regions: each region has a start tick, num, den
  var tsRegions = [];
  if(sortedTSChanges.length>0){
    for(var tsi2=0;tsi2<sortedTSChanges.length;tsi2++){
      var tsEnd = (tsi2+1<sortedTSChanges.length) ? sortedTSChanges[tsi2+1].tick : Infinity;
      tsRegions.push({tick:sortedTSChanges[tsi2].tick, num:sortedTSChanges[tsi2].num, den:sortedTSChanges[tsi2].den, endTick:tsEnd});
    }
  } else {
    tsRegions.push({tick:0, num:timeSigNum, den:timeSigDen, endTick:Infinity});
  }

  // Find the last note tick to determine song length
  var lastNoteTickGlobal = 0;
  Object.keys(channelTracks).forEach(function(ch2){
    channelTracks[ch2].forEach(function(n){
      if(n.onTick>lastNoteTickGlobal)lastNoteTickGlobal=n.onTick;
    });
  });

  var curTick = 0;
  var tsIdx = 0;
  while(curTick <= lastNoteTickGlobal){
    // Find current time signature
    while(tsIdx+1<tsRegions.length && tsRegions[tsIdx+1].tick<=curTick) tsIdx++;
    var curTS = tsRegions[tsIdx];
    var mBPM = Math.round(curTS.num*(16/curTS.den));
    var mTpb = baseTpb;
    var mTickLen = mBPM * mTpb;

    // Find tempo at this tick
    var mTempo = tempo;
    for(var sti=sortedTempos.length-1;sti>=0;sti--){
      if(sortedTempos[sti].tick<=curTick){mTempo=sortedTempos[sti].bpm;break;}
    }

    measureMap.push({
      startTick: curTick,
      beatsPerMeasure: mBPM,
      tpb: mTpb,
      isATR: false,
      atrGroup: 1, atrNum: 1,
      realTempo: mTempo,
      timeSigNum: curTS.num,
      timeSigDen: curTS.den
    });
    curTick += mTickLen;
  }
  // Add one trailing measure for stop/ring notes
  if(measureMap.length>0){
    while(tsIdx+1<tsRegions.length && tsRegions[tsIdx+1].tick<=curTick) tsIdx++;
    var trailTS=tsRegions[tsIdx];
    var trailBPM=Math.round(trailTS.num*(16/trailTS.den));
    measureMap.push({startTick:curTick,beatsPerMeasure:trailBPM,tpb:baseTpb,isATR:false,atrGroup:1,atrNum:1,realTempo:measureMap[measureMap.length-1].realTempo,timeSigNum:trailTS.num,timeSigDen:trailTS.den});
  }
  var totalMeasuresGlobal = measureMap.length;

  // Per-measure ATR detection: only for machine-quantized MIDI (TabIt exports)
  // Human-performed MIDI has groove/swing that looks like ATR but isn't
  var allNoteTicks3 = [];
  Object.keys(channelTracks).forEach(function(ch2){
    channelTracks[ch2].forEach(function(n){ allNoteTicks3.push(n.onTick); });
  });
  var tol16 = Math.max(3, Math.round(baseTpb * 0.08));
  var tol32 = Math.max(1, Math.round(baseTpb / 2 * 0.08));
  var tolTrip = Math.max(1, Math.round(baseTicksPerMeasure / 24 * 0.08));

  measureMap.forEach(function(mm, mi3) {
    if (mm.isATR) return;
    var mStart2 = mm.startTick;
    var mEnd2 = mStart2 + mm.beatsPerMeasure * mm.tpb;
    var mNotes = allNoteTicks3.filter(function(t){ return t >= mStart2 && t < mEnd2; });
    if (mNotes.length < 8) return;

    var count32 = 0, countTrip = 0, countOther = 0;
    var tpb32_2 = baseTpb / 2;
    var tripTpb3 = baseTicksPerMeasure / 24;
    mNotes.forEach(function(t) {
      var rel = t - mStart2;
      var mod16 = rel % baseTpb;
      var on16 = (mod16 < tol16 || baseTpb - mod16 < tol16);
      if (!on16) {
        var mod32 = rel % tpb32_2;
        var on32 = (mod32 < tol32 || tpb32_2 - mod32 < tol32);
        var modTrip = rel % tripTpb3;
        var onTrip = (modTrip < tolTrip || tripTpb3 - modTrip < tolTrip);
        if (on32) count32++;
        else if (onTrip) countTrip++;
        else countOther++;
      }
    });

    // Only trigger ATR when:
    // 1) >=25% of notes off 16th grid AND >=6 off-grid notes
    // 2) Off-grid notes mostly land on a consistent sub-grid (not scattered)
    var totalOff = count32 + countTrip + countOther;
    if (totalOff < 2) return;
    var imprecise = countOther / Math.max(1, totalOff);
    if (imprecise > 0.3) return;
    var isClean = (countOther === 0);
    var minCount = isClean ? 2 : 8;
    var minPct = isClean ? 0.05 : 0.50;

    if (count32 >= minCount && count32 / mNotes.length >= minPct) {
      mm.beatsPerMeasure = defaultBPM2 * 2;
      mm.tpb = baseTpb / 2;
      mm.isATR = true;
      mm.atrGroup = 2; mm.atrNum = 1;
    } else if (countTrip >= minCount && countTrip / mNotes.length >= minPct) {
      mm.beatsPerMeasure = defaultBPM2 * 3 / 2;
      mm.tpb = baseTicksPerMeasure / 24;
      mm.isATR = true;
      mm.atrGroup = 3; mm.atrNum = 2;
    }
  });

  // Post-filter: runs of >4 consecutive same-type ATR bars indicate musical style
  // (shuffle, swing), not TabIt per-bar ATR — revert to normal
  var runStart2=0, runType2=null;
  for(var pfi=0;pfi<=measureMap.length;pfi++){
    var curType2=(pfi<measureMap.length&&measureMap[pfi].isATR)?measureMap[pfi].atrGroup:null;
    if(curType2!==runType2){
      if(runType2!==null&&pfi-runStart2>4){
        for(var rvi=runStart2;rvi<pfi;rvi++){
          measureMap[rvi].isATR=false;
          var rvTS=measureMap[rvi].timeSigNum||timeSigNum;
          var rvTD=measureMap[rvi].timeSigDen||timeSigDen;
          measureMap[rvi].beatsPerMeasure=Math.round(rvTS*(16/rvTD));
          measureMap[rvi].tpb=baseTpb;
          measureMap[rvi].atrGroup=1;measureMap[rvi].atrNum=1;
        }
      }
      runStart2=pfi;runType2=curType2;
    }
  }

  // Rebuild tickToPos with updated measure map
  function tickToPos(tick) {
    for (var mi3 = measureMap.length - 1; mi3 >= 0; mi3--) {
      if (tick >= measureMap[mi3].startTick) {
        var relTick = tick - measureMap[mi3].startTick;
        var beat = Math.round(relTick / measureMap[mi3].tpb);
        if (beat >= measureMap[mi3].beatsPerMeasure) beat = measureMap[mi3].beatsPerMeasure - 1;
        return {measure: mi3, beat: beat};
      }
    }
    return {measure: 0, beat: 0};
  }

  // Build TabKit song
  var songTracks=[];
  var channels=Object.keys(channelTracks).map(Number).sort(function(a,b){return a-b;});

  // First pass: determine best tuning per channel, then unify across guitar tracks
  var channelTunings={};
  var guitarChannels=[];
  channels.forEach(function(ch){
    var notes=channelTracks[ch];
    if(!notes||notes.length===0)return;
    var isDrum=(ch===9);
    var prog=channelPrograms[ch]||0;
    if(isDrum){
      var drumNotes2={};
      notes.forEach(function(n){drumNotes2[n.note]=(drumNotes2[n.note]||0)+1;});
      var topDrums2=Object.keys(drumNotes2).map(Number).sort(function(a,b){return drumNotes2[b]-drumNotes2[a];}).slice(0,8);
      while(topDrums2.length<4)topDrums2.push(0);
      channelTunings[ch]={numStrings:Math.min(topDrums2.length,8),tuning:topDrums2.sort(function(a,b){return a-b;}),isDrum:true};
    } else {
      channelTunings[ch]=bestTuning(notes,false,prog);
      channelTunings[ch].isDrum=false;
      guitarChannels.push(ch);
    }
  });

  // Detect MIDI source: Songsterr uses non-GM drum mapping (0-34), TabIt uses GM (35+)
  var isSongsterrMidi=false;
  if(channelTracks[9]){
    var drumLo2=127;
    channelTracks[9].forEach(function(n){if(n.note<drumLo2)drumLo2=n.note;});
    if(drumLo2<35)isSongsterrMidi=true;
  }

  // Unify guitar tunings: find the non-standard tuning that appears, apply to all guitar tracks
  if(guitarChannels.length>1){
    var stdTuning=[40,45,50,55,59,64];
    var nonStdTunings=[];
    var allGuitarNotes=[];
    guitarChannels.forEach(function(ch2){
      var t2=channelTunings[ch2];
      if(t2.isBass)return; // exclude bass from unification
      if(t2.numStrings===6 && t2.tuning.join(",")!==stdTuning.join(",")) nonStdTunings.push(t2);
      channelTracks[ch2].forEach(function(n){allGuitarNotes.push(n);});
    });
    // If any track detected a non-standard tuning, test it against all guitar notes
    if(nonStdTunings.length>0){
      var bestUnified=null, bestUScore=Infinity;
      var uniqueTunings={};
      nonStdTunings.forEach(function(t2){
        uniqueTunings[t2.tuning.join(",")]=t2;
      });
      uniqueTunings[stdTuning.join(",")]={numStrings:6,tuning:stdTuning};
      Object.keys(uniqueTunings).forEach(function(k){
        var cand=uniqueTunings[k];
        var oor=0,tf=0,vc=0;
        allGuitarNotes.forEach(function(n){
          var bf=Infinity;
          for(var si=0;si<cand.numStrings;si++){
            var f=n.note-cand.tuning[si];
            if(f>=0&&f<=maxFret&&f<bf)bf=f;
          }
          if(bf===Infinity)oor++;else{tf+=bf;vc++;}
        });
        var oorPct=oor/allGuitarNotes.length;
        if(oorPct>0.05)return; // skip if >5% out of range
        var avg=vc>0?tf/vc:12;
        // Prefer non-standard tunings since a track specifically detected them
        var isStd=cand.tuning.join(",")===stdTuning.join(",");
        var score=oor*100+avg*2+(isStd?20:0);
        if(score<bestUScore){bestUScore=score;bestUnified=cand;}
      });
      if(bestUnified){
        guitarChannels.forEach(function(ch2){
          // Only override 6-string guitar tracks (not bass)
          if(channelTunings[ch2].numStrings>=5 && channelTunings[ch2].numStrings<=6 && !channelTunings[ch2].isBass){
            channelTunings[ch2]={numStrings:bestUnified.numStrings,tuning:bestUnified.tuning.slice(),isDrum:false};
          }
        });
      }
    }
  }

  channels.forEach(function(ch){
    var notes=channelTracks[ch];
    if(!notes||notes.length===0)return;
    var isDrum=(ch===9); // MIDI channel 10 (0-indexed = 9)
    var prog=channelPrograms[ch]||0;
    var trkName=channelNames[ch]||(isDrum?"Drums":"Track "+(songTracks.length+1));

    // Use pre-calculated tuning (unified for guitar tracks)
    var tuningInfo;
    if(channelTunings[ch]){
      tuningInfo={numStrings:channelTunings[ch].numStrings,tuning:channelTunings[ch].tuning.slice()};
    } else if(isDrum){
      var drumNotes={};
      notes.forEach(function(n){drumNotes[n.note]=(drumNotes[n.note]||0)+1;});
      var topDrums=Object.keys(drumNotes).map(Number).sort(function(a,b){return drumNotes[b]-drumNotes[a];}).slice(0,8);
      while(topDrums.length<4)topDrums.push(0);
      tuningInfo={numStrings:Math.min(topDrums.length,8),tuning:topDrums.sort(function(a,b){return a-b;})};
    } else {
      tuningInfo=bestTuning(notes,isDrum,prog);
    }

    // Assign notes to strings
    var assigned=assignToStrings(notes,tuningInfo.tuning,tuningInfo.numStrings,isDrum);

    // Detect effects
    // Use global measure map for ATR-aware measure creation
    var numMeasures = measureMap.length;
    if(numMeasures<1)numMeasures=1;

    // Create empty measures from measure map
    var measures=[];
    for(var mi=0;mi<numMeasures;mi++){
      var mBPM2 = measureMap[mi] ? measureMap[mi].beatsPerMeasure : beatsPerMeasure;
      var mATR = measureMap[mi] ? measureMap[mi].isATR : false;
      var mAG = measureMap[mi] ? measureMap[mi].atrGroup : 1;
      var mAN = measureMap[mi] ? measureMap[mi].atrNum : 1;
      var beats=[];
      for(var bi=0;bi<mBPM2;bi++){
        var beat={notes:new Array(tuningInfo.numStrings).fill(null)};
        if(mATR && mAG > 1){beat.atrGroup=mAG;beat.atrNum=mAN;}
        beats.push(beat);
      }
      var mTS = measureMap[mi] ? {num:measureMap[mi].timeSigNum||timeSigNum, den:measureMap[mi].timeSigDen||timeSigDen} : {num:timeSigNum,den:timeSigDen};
      measures.push({beats:beats,barLine:"single",beatsPerMeasure:mBPM2,globalBeatsPerMeasure:mBPM2,isATR:mATR,timeSig:mTS});
    }

    // Place notes into measures using ATR-aware tick conversion
    assigned.forEach(function(a){
      var pos2=tickToPos(a.note.onTick);
      var mIdx=pos2.measure;
      var bIdx=pos2.beat;
      if(mIdx>=numMeasures||mIdx<0)return;
      if(bIdx>=measures[mIdx].beats.length)return;

      var noteObj;
      if(isDrum){
        // For drums: find best string (exact match first, then closest with fret offset)
        var dsi=-1, dFret=0;
        // First try exact match (tuning value === note)
        for(var ds=0;ds<tuningInfo.numStrings;ds++){
          if(tuningInfo.tuning[ds]===a.note.note){dsi=ds;dFret=0;break;}
        }
        // If no exact match, find closest string where fret = note - tuning >= 0
        if(dsi<0){
          var bestDist=Infinity;
          for(var ds2=0;ds2<tuningInfo.numStrings;ds2++){
            var df=a.note.note-tuningInfo.tuning[ds2];
            if(df>=0&&df<bestDist){bestDist=df;dsi=ds2;dFret=df;}
          }
        }
        if(dsi<0)return;
        noteObj={fret:dFret,attack:true,muted:false,stop:false};
        if(measures[mIdx].beats[bIdx].notes[dsi])return; // already occupied
        measures[mIdx].beats[bIdx].notes[dsi]=noteObj;
      } else {
        noteObj={fret:a.fret,attack:true,muted:false,stop:false};
        // Detect muted/dead notes: ultra-short MIDI notes indicate X markers
        // TabIt exports: short duration + low velocity; Songsterr exports: short duration + normal velocity
        var noteDur=a.note.offTick-a.note.onTick;
        if(!isDrum && ((noteDur<=baseTpb/3 && (isSongsterrMidi || a.note.vel<=50))||a.muted)){
          noteObj.muted=true;
          noteObj.fret=0;
        }
        // Handle muted notes that need string assignment (pre-detected, string=-1)
        if(a.string<0){
          // Find a free string on this beat, preferring near existing notes
          var beat2=measures[mIdx].beats[bIdx];
          var bestMS=-1;
          // Find occupied strings to place adjacent
          var occStrs=[];
          for(var ms2=0;ms2<tuningInfo.numStrings;ms2++){if(beat2.notes[ms2])occStrs.push(ms2);}
          if(occStrs.length>0){
            // Try strings adjacent to occupied ones
            var minOcc=Math.min.apply(null,occStrs), maxOcc=Math.max.apply(null,occStrs);
            // Try inside gaps first, then adjacent
            for(var ms3=minOcc;ms3<=maxOcc;ms3++){if(!beat2.notes[ms3]){bestMS=ms3;break;}}
            if(bestMS<0&&minOcc>0&&!beat2.notes[minOcc-1])bestMS=minOcc-1;
            if(bestMS<0&&maxOcc<tuningInfo.numStrings-1&&!beat2.notes[maxOcc+1])bestMS=maxOcc+1;
          }
          if(bestMS<0){for(var ms4=0;ms4<tuningInfo.numStrings;ms4++){if(!beat2.notes[ms4]){bestMS=ms4;break;}}}
          if(bestMS<0)return;
          a.string=bestMS;
        }
        if(measures[mIdx].beats[bIdx].notes[a.string])return; // occupied
        measures[mIdx].beats[bIdx].notes[a.string]=noteObj;
        // Store positions for stop placement in second pass
        a._beatPos=mIdx;
        a._beatIdx=bIdx;
        a._endPos=tickToPos(a.note.offTick);
      }
    });

    // Reposition muted notes within chords: pack all notes onto consecutive strings
    for(var ri=0;ri<numMeasures;ri++){
      for(var rbi=0;rbi<measures[ri].beats.length;rbi++){
        var beat=measures[ri].beats[rbi];
        var mutedIdxs=[], realIdxs=[];
        for(var rsi=0;rsi<tuningInfo.numStrings;rsi++){
          var rn=beat.notes[rsi];
          if(rn&&rn.muted) mutedIdxs.push(rsi);
          else if(rn&&!rn.stop) realIdxs.push(rsi);
        }
        if(mutedIdxs.length===0||realIdxs.length<1)continue;
        // Check if any muted is outside real range or any gaps between notes
        var allIdx=mutedIdxs.concat(realIdxs).sort(function(a,b){return a-b;});
        var needsWork=false;
        var minR=Math.min.apply(null,realIdxs), maxR=Math.max.apply(null,realIdxs);
        mutedIdxs.forEach(function(mi4){if(mi4<minR||mi4>maxR)needsWork=true;});
        for(var gi=1;gi<allIdx.length;gi++){if(allIdx[gi]-allIdx[gi-1]>1)needsWork=true;}
        if(!needsWork)continue;

        // Collect all notes with MIDI pitches
        var allNotes2=[];
        for(var ci=0;ci<tuningInfo.numStrings;ci++){
          var cn=beat.notes[ci];
          if(cn&&!cn.stop){
            allNotes2.push({str:ci,note:cn,midi:cn.muted?-1:(tuningInfo.tuning[ci]+cn.fret),muted:!!cn.muted});
          }
        }
        if(allNotes2.length<2)continue;
        var realNotes2=allNotes2.filter(function(n2){return!n2.muted;}).sort(function(a,b){return a.midi-b.midi;});
        var nMuted=allNotes2.length-realNotes2.length;
        var totalN=allNotes2.length;

        // Score: minimize fret spread, moderate fret height, penalize very high frets
        function chordPackScore(frets4){
          var mn=Infinity,mx=-Infinity,sm=0,hp=0;
          frets4.forEach(function(f){if(f<mn)mn=f;if(f>mx)mx=f;sm+=f;if(f>12)hp+=(f-12)*3;});
          var spread=mx-mn;
          var avg=sm/frets4.length;
          return spread*10+avg*1.5+hp;
        }
        // Find best consecutive-string span for all notes
        var bestScore=Infinity, bestAssign=null;
        for(var startS=0;startS<=tuningInfo.numStrings-totalN;startS++){
          var slots=[];for(var si5=0;si5<totalN;si5++)slots.push(startS+si5);
          // For 1 muted note, try each slot; for multiple, place muted at lowest slots
          if(nMuted===1){
            for(var mp=0;mp<totalN;mp++){
              var rSlots=[];
              for(var sp=0;sp<totalN;sp++){if(sp!==mp)rSlots.push(slots[sp]);}
              var valid=true, frets5=[];
              for(var rni=0;rni<realNotes2.length;rni++){
                var f2=realNotes2[rni].midi-tuningInfo.tuning[rSlots[rni]];
                if(f2<0||f2>maxFret){valid=false;break;}
                frets5.push(f2);
              }
              if(valid){var sc=chordPackScore(frets5);if(sc<bestScore){bestScore=sc;bestAssign={mSlots:[slots[mp]],rSlots:rSlots};}}
            }
          } else {
            // Multiple muted: try muted at each possible subset of slots
            // Simple: muted at the lowest N slots, real at the rest
            var mSlots=slots.slice(0,nMuted), rSlots2=slots.slice(nMuted);
            var valid2=true, frets6=[];
            for(var rni2=0;rni2<realNotes2.length;rni2++){
              var f3=realNotes2[rni2].midi-tuningInfo.tuning[rSlots2[rni2]];
              if(f3<0||f3>maxFret){valid2=false;break;}
              frets6.push(f3);
            }
            if(valid2){var sc2=chordPackScore(frets6);if(sc2<bestScore){bestScore=sc2;bestAssign={mSlots:mSlots,rSlots:rSlots2};}}
            // Also try muted at highest slots
            var mSlots2=slots.slice(totalN-nMuted), rSlots3=slots.slice(0,totalN-nMuted);
            var valid3=true, frets7=[];
            for(var rni3=0;rni3<realNotes2.length;rni3++){
              var f4=realNotes2[rni3].midi-tuningInfo.tuning[rSlots3[rni3]];
              if(f4<0||f4>maxFret){valid3=false;break;}
              frets7.push(f4);
            }
            if(valid3){var sc3=chordPackScore(frets7);if(sc3<bestScore){bestScore=sc3;bestAssign={mSlots:mSlots2,rSlots:rSlots3};}}
          }
        }
        if(!bestAssign)continue;
        // Apply
        allNotes2.forEach(function(n2){beat.notes[n2.str]=null;});
        bestAssign.mSlots.forEach(function(ms){beat.notes[ms]={fret:0,attack:true,muted:true,stop:false};});
        for(var rni4=0;rni4<realNotes2.length;rni4++){
          var nf=realNotes2[rni4].midi-tuningInfo.tuning[bestAssign.rSlots[rni4]];
          beat.notes[bestAssign.rSlots[rni4]]={fret:nf,attack:realNotes2[rni4].note.attack,muted:false,stop:false,effect:realNotes2[rni4].note.effect};
        }
      }
    }

    // Context-aware chord smoothing: adjust voicings to match neighboring chords
    // Pass 0: forward (prev only), Pass 1: backward (next only)
    if(!isDrum){ for(var smoothPass=0;smoothPass<2;smoothPass++){
      // Collect chord info per beat: {strings:[], avgFret, hasMuted}
      var chordInfo=[];
      for(var cmi=0;cmi<numMeasures;cmi++){
        for(var cbi=0;cbi<measures[cmi].beats.length;cbi++){
          var cbeat=measures[cmi].beats[cbi];
          var cstrs=[], cfrets=[], cmuted=false, cnotes=[];
          for(var csi=0;csi<tuningInfo.numStrings;csi++){
            var cn2=cbeat.notes[csi];
            if(cn2&&!cn2.stop){
              cstrs.push(csi);
              if(cn2.muted)cmuted=true;else{cfrets.push(cn2.fret);cnotes.push({str:csi,fret:cn2.fret,midi:tuningInfo.tuning[csi]+cn2.fret,note:cn2,muted:cn2.muted});}
            }
          }
          if(cstrs.length>=2){
            chordInfo.push({mi:cmi,bi:cbi,strs:cstrs,frets:cfrets,avgFret:cfrets.length?cfrets.reduce(function(a,b){return a+b;},0)/cfrets.length:0,hasMuted:cmuted,notes:cnotes,minStr:Math.min.apply(null,cstrs),maxStr:Math.max.apply(null,cstrs)});
          }
        }
      }
      // For each chord with muted notes, check if neighbors suggest a better voicing
      for(var ci2=(smoothPass===0?0:chordInfo.length-1);smoothPass===0?(ci2<chordInfo.length):(ci2>=0);smoothPass===0?ci2++:ci2--){
        var cur5=chordInfo[ci2];
        if(!cur5.hasMuted||cur5.notes.length<1)continue;
        // Find previous and next chords
        var prev5=(smoothPass===0&&ci2>0)?chordInfo[ci2-1]:null;
        var next5=(smoothPass===1&&ci2<chordInfo.length-1)?chordInfo[ci2+1]:null;
        if(!prev5&&!next5)continue;

        // Try re-voicing on neighbor's string span
        var cbeat2=measures[cur5.mi].beats[cur5.bi];
        var allCNotes=[];
        for(var csi2=0;csi2<tuningInfo.numStrings;csi2++){
          var cn3=cbeat2.notes[csi2];
          if(cn3&&!cn3.stop)allCNotes.push({str:csi2,note:cn3,midi:cn3.muted?-1:(tuningInfo.tuning[csi2]+cn3.fret),muted:!!cn3.muted});
        }
        var realC=allCNotes.filter(function(n2){return!n2.muted;}).sort(function(a,b){return a.midi-b.midi;});
        var nMutedC=allCNotes.length-realC.length;
        var totalNC=allCNotes.length;

        // Try ALL consecutive string spans, with strong preference for matching neighbor strings
        var spanSize=totalNC;
        var bestCS=Infinity, bestCA=null;
        for(var ts=0;ts<=tuningInfo.numStrings-spanSize;ts++){
          var tSlots=[];for(var tsi=0;tsi<spanSize;tsi++)tSlots.push(ts+tsi);

          if(nMutedC===1){
            for(var tmp=0;tmp<spanSize;tmp++){
              var trSlots=[];
              for(var tsp=0;tsp<spanSize;tsp++){if(tsp!==tmp)trSlots.push(tSlots[tsp]);}
              var tValid=true, tFrets=[];
              for(var trni=0;trni<realC.length;trni++){
                var tf=realC[trni].midi-tuningInfo.tuning[trSlots[trni]];
                if(tf<0||tf>maxFret){tValid=false;break;}
                tFrets.push(tf);
              }
              if(tValid){
                var tAvg=tFrets.reduce(function(a,b){return a+b;},0)/tFrets.length;
                // Context-focused scoring: prioritize staying near neighbors
                var ctxScore=0;
                // Fret spread within chord
                var tMn=Math.min.apply(null,tFrets),tMx=Math.max.apply(null,tFrets);
                ctxScore+=(tMx-tMn)*5;
                // Fret distance from neighbors (dominant factor)
                if(prev5)ctxScore+=Math.abs(tAvg-prev5.avgFret)*4;
                if(next5)ctxScore+=Math.abs(tAvg-next5.avgFret)*4;
                // String match bonus (same strings as neighbor = much cheaper transition)
                if(prev5&&tSlots[0]===prev5.minStr&&tSlots[spanSize-1]===prev5.maxStr)ctxScore-=10;
                if(next5&&tSlots[0]===next5.minStr&&tSlots[spanSize-1]===next5.maxStr)ctxScore-=10;
                // High fret penalty
                tFrets.forEach(function(f){if(f>12)ctxScore+=(f-12)*2;});
                var tsc=ctxScore;
                if(tsc<bestCS){bestCS=tsc;bestCA={mSlots:[tSlots[tmp]],rSlots:trSlots};}
              }
            }
          }
        }
        // Apply if the re-voicing improves or matches context (accept even higher fret cost for same strings)
        if(bestCA){
          // Compute context score for current voicing too
          var curCtx=0;
          var curMn=cur5.frets.length?Math.min.apply(null,cur5.frets):0;
          var curMx=cur5.frets.length?Math.max.apply(null,cur5.frets):0;
          curCtx+=(curMx-curMn)*5;
          if(prev5)curCtx+=Math.abs(cur5.avgFret-prev5.avgFret)*4;
          if(next5)curCtx+=Math.abs(cur5.avgFret-next5.avgFret)*4;
          if(prev5&&cur5.minStr===prev5.minStr&&cur5.maxStr===prev5.maxStr)curCtx-=10;
          if(next5&&cur5.minStr===next5.minStr&&cur5.maxStr===next5.maxStr)curCtx-=10;
          cur5.frets.forEach(function(f){if(f>12)curCtx+=(f-12)*2;});
        // Accept if context score improves, but protect tight voicings (spread≤1 = same fret position)
        var curSpread=cur5.frets.length>1?(Math.max.apply(null,cur5.frets)-Math.min.apply(null,cur5.frets)):0;
        if(curSpread<=1)continue; // perfect voicing, don't touch
        if(bestCS<curCtx){
            allCNotes.forEach(function(n2){cbeat2.notes[n2.str]=null;});
            bestCA.mSlots.forEach(function(ms){cbeat2.notes[ms]={fret:0,attack:true,muted:true,stop:false};});
            var newFrets5=[], newMinS=6, newMaxS=0;
            for(var trni2=0;trni2<realC.length;trni2++){
              var nf2=realC[trni2].midi-tuningInfo.tuning[bestCA.rSlots[trni2]];
              cbeat2.notes[bestCA.rSlots[trni2]]={fret:nf2,attack:realC[trni2].note.attack,muted:false,stop:false,effect:realC[trni2].note.effect};
              newFrets5.push(nf2);
              if(bestCA.rSlots[trni2]<newMinS)newMinS=bestCA.rSlots[trni2];
              if(bestCA.rSlots[trni2]>newMaxS)newMaxS=bestCA.rSlots[trni2];
            }
            bestCA.mSlots.forEach(function(ms2){if(ms2<newMinS)newMinS=ms2;if(ms2>newMaxS)newMaxS=ms2;});
            // Update chordInfo so subsequent iterations see the change
            cur5.frets=newFrets5;
            cur5.avgFret=newFrets5.reduce(function(a,b){return a+b;},0)/newFrets5.length;
            cur5.minStr=newMinS;
            cur5.maxStr=newMaxS;
            }
          }
        }
    } }

    // Second pass: place stop notes where notes end (non-drum only)
    if(!isDrum){
      var byStr={};
      assigned.forEach(function(a){
        if(a._endPos===undefined)return;
        if(!byStr[a.string])byStr[a.string]=[];
        byStr[a.string].push(a);
      });
      Object.keys(byStr).forEach(function(si){
        var sNotes=byStr[si].sort(function(a,b){return a._beatPos-b._beatPos||(a._beatIdx||0)-(b._beatIdx||0);});
        for(var ni=0;ni<sNotes.length;ni++){
          var a2=sNotes[ni];
          var endM=a2._endPos.measure, endB=a2._endPos.beat;
          // Skip if note is very short (same measure+beat or adjacent)
          if(endM===a2._beatPos && endB<=a2._beatIdx+1)continue;
          if(endM===a2._beatPos && endB===a2._beatIdx)continue;
          // Skip if next note starts before this ends
          if(ni+1<sNotes.length){
            var nx=sNotes[ni+1];
            if(nx._beatPos<endM||(nx._beatPos===endM&&(nx._beatIdx||0)<=endB))continue;
          }
          if(endM>=numMeasures||endM<0)continue;
          if(endB>=measures[endM].beats.length)continue;
          if(measures[endM].beats[endB].notes[Number(si)])continue;
          measures[endM].beats[endB].notes[Number(si)]={fret:0,attack:true,muted:false,stop:true};
        }
      });
    }

    // Detect slides/bends from pitch bend data and place target notes
    if(!isDrum && channelBends[ch] && channelBends[ch].length > 1){
      var bends2 = channelBends[ch].sort(function(a,b){return a.tick-b.tick;});
      var pbRange = channelPBRange[ch] || 2;
      var semiThreshold = 0.8;
      assigned.forEach(function(a){
        if(a._beatPos===undefined)return;
        var bendsDuring=bends2.filter(function(b){return b.tick>=a.note.onTick&&b.tick<=a.note.offTick+baseTpb;});
        if(bendsDuring.length<1)return;
        var hasNonZero=false;
        bendsDuring.forEach(function(b){if(b.value!==0)hasNonZero=true;});
        if(!hasNonZero)return;

        // Extract distinct pitch steps (each significant change in bend value)
        var steps=[]; // [{tick, semitones}]
        var prevSemi=0;
        bendsDuring.forEach(function(b){
          var semi=Math.round(b.value/8192*pbRange);
          if(semi!==prevSemi){steps.push({tick:b.tick,semi:semi});prevSemi=semi;}
        });
        if(steps.length===0)return;

        // Check if max bend exceeds threshold
        var maxSemi=0;
        steps.forEach(function(s){if(Math.abs(s.semi)>Math.abs(maxSemi))maxSemi=s.semi;});
        if(Math.abs(maxSemi)<1)return; // need at least 1 semitone

        var mI3=a._beatPos, bI3=a._beatIdx||0;
        if(mI3>=numMeasures||bI3>=measures[mI3].beats.length)return;
        var n3=measures[mI3].beats[bI3].notes[a.string];
        if(!n3||n3.effect||n3.muted)return;

        // Determine effect type from final state
        var lastStep=steps[steps.length-1];
        var efxCode;
        if(lastStep.semi===0||Math.abs(lastStep.semi)<1) efxCode=98; // b (bend returns)
        else if(maxSemi>0) efxCode=47; // / (slide up)
        else efxCode=92; // \ (slide down)

        // Collect all target MIDI notes
        var targetMidis=[];
        steps.forEach(function(s){
          if(s.semi!==0)targetMidis.push({midi:a.note.note+s.semi,tick:s.tick});
        });
        if(targetMidis.length===0)return;

        // Find best string where attack AND all targets fit
        var bestStr=a.string, allFit=true;
        targetMidis.forEach(function(tm){
          var f=tm.midi-tuningInfo.tuning[a.string];
          if(f<0||f>maxFret)allFit=false;
        });

        if(!allFit){
          // Find a string where everything fits
          bestStr=-1;
          var bestScore=Infinity;
          for(var ss=0;ss<tuningInfo.numStrings;ss++){
            var atkF=a.note.note-tuningInfo.tuning[ss];
            if(atkF<0||atkF>maxFret)continue;
            var valid=true, scoreSum=atkF;
            targetMidis.forEach(function(tm){
              var f=tm.midi-tuningInfo.tuning[ss];
              if(f<0||f>maxFret)valid=false;
              else scoreSum+=f;
            });
            if(valid){
              var pen=scoreSum+(atkF>12?(atkF-12)*3:0);
              if(pen<bestScore){bestScore=pen;bestStr=ss;}
            }
          }
          if(bestStr<0){n3.effect=undefined;return;} // can't fit anywhere
          // Move attack to bestStr
          if(bestStr!==a.string){
            measures[mI3].beats[bI3].notes[a.string]=null;
            var newAtkFret=a.note.note-tuningInfo.tuning[bestStr];
            n3={fret:newAtkFret,attack:true,muted:false,stop:false,effect:efxCode};
            measures[mI3].beats[bI3].notes[bestStr]=n3;
          } else {
            n3.effect=efxCode;
          }
        } else {
          n3.effect=efxCode;
        }

        // Place each target note at its beat position on bestStr
        targetMidis.forEach(function(tm){
          var tPos=tickToPos(tm.tick);
          if(tPos.measure>=numMeasures)return;
          if(tPos.beat>=measures[tPos.measure].beats.length)return;
          // Don't overwrite the attack beat
          if(tPos.measure===mI3&&tPos.beat===bI3)return;
          var tFret=tm.midi-tuningInfo.tuning[bestStr];
          if(tFret<0||tFret>maxFret)return;
          if(!measures[tPos.measure].beats[tPos.beat].notes[bestStr]){
            measures[tPos.measure].beats[tPos.beat].notes[bestStr]={fret:tFret,attack:true,muted:false,stop:false};
          }
        });
      });
    }

    // Place volume change track effects from CC7
    if(channelVolumes[ch] && channelVolumes[ch].length > 1){
      var vols=channelVolumes[ch].sort(function(a2,b2){return a2.tick-b2.tick;});
      for(var vi=1;vi<vols.length;vi++){
        var vPos=tickToPos(vols[vi].tick);
        var vMIdx=vPos.measure, vBIdx=vPos.beat;
        if(vMIdx>=numMeasures||vMIdx<0)continue;
        if(vBIdx>=measures[vMIdx].beats.length)continue;
        if(!measures[vMIdx].beats[vBIdx].trkEffect){
          measures[vMIdx].beats[vBIdx].trkEffect={type:86,value:vols[vi].value};
        } else {
          var ex=measures[vMIdx].beats[vBIdx].trkEffect;
          if(!ex.multi)ex.multi=[];
          ex.multi.push({type:86,value:vols[vi].value});
        }
      }
    }

    // Set initial track properties from CCs
    var initVol=96;
    if(channelVolumes[ch] && channelVolumes[ch].length>0) initVol=channelVolumes[ch][0].value;
    var initPan=64;
    if(channelPans[ch] && channelPans[ch].length>0) initPan=channelPans[ch][0].value;
    var initRev=0;
    if(channelReverb[ch] && channelReverb[ch].length>0) initRev=channelReverb[ch][0].value;
    var initCho=0;
    if(channelChorus[ch] && channelChorus[ch].length>0) initCho=channelChorus[ch][0].value;
    var initMod=0;
    if(channelMod[ch] && channelMod[ch].length>0) initMod=channelMod[ch][0].value;

    // Place instrument changes as track effects (type 73 = instrument)
    if(channelInstChanges[ch] && channelInstChanges[ch].length > 1){
      for(var ici=1;ici<channelInstChanges[ch].length;ici++){
        var icPos=tickToPos(channelInstChanges[ch][ici].tick);
        if(icPos.measure<numMeasures && icPos.beat<measures[icPos.measure].beats.length){
          var icBeat=measures[icPos.measure].beats[icPos.beat];
          if(!icBeat.trkEffect){
            icBeat.trkEffect={type:73,value:channelInstChanges[ch][ici].program};
          } else {
            if(!icBeat.trkEffect.multi)icBeat.trkEffect.multi=[];
            icBeat.trkEffect.multi.push({type:73,value:channelInstChanges[ch][ici].program});
          }
        }
      }
    }

    // Determine maxFret needed for this track's note range
    var trackMaxFret = 24; // default
    if(!isDrum){
      var highestNote = 0;
      notes.forEach(function(n){ if(n.note > highestNote) highestNote = n.note; });
      var highStr = tuningInfo.tuning[tuningInfo.numStrings - 1];
      var neededFret = highestNote - highStr;
      if(neededFret > 24){
        trackMaxFret = Math.min(29, neededFret);
      }
    }

    // Songsterr uses non-GM drum mapping; auto-detect roles via rhythmic analysis
    if(isDrum && isSongsterrMidi){
      // Analyze rhythmic patterns to identify drum roles
      var drumBeats={};
      notes.forEach(function(n){
        var bar=Math.floor(n.onTick/baseTicksPerMeasure);
        var rel=n.onTick%baseTicksPerMeasure;
        var b16=Math.round(rel/baseTpb);
        if(!drumBeats[n.note])drumBeats[n.note]={count:0,beats:{},bars:{}};
        drumBeats[n.note].count++;
        drumBeats[n.note].beats[b16]=(drumBeats[n.note].beats[b16]||0)+1;
        drumBeats[n.note].bars[bar]=true;
      });
      var drumMap={};
      var assignedGM={};
      // Score each note's rhythmic role
      var roles=Object.keys(drumBeats).map(Number).map(function(nv){
        var d=drumBeats[nv];
        var barCount=Object.keys(d.bars).length;
        var backbeat=(d.beats[4]||0)+(d.beats[12]||0);
        var downbeat=(d.beats[0]||0);
        var eighthHits=0;
        for(var eb=0;eb<16;eb+=2)eighthHits+=(d.beats[eb]||0);
        var eighthPct=eighthHits/d.count;
        var beatSpread=Object.keys(d.beats).length;
        // Classify
        var role="other",confidence=0;
        if(d.count>100&&eighthPct>0.7&&beatSpread>=6){role="hihat";confidence=d.count;}
        else if(backbeat>d.count*0.35&&d.count>30){role="snare";confidence=backbeat;}
        else if(downbeat>d.count*0.5&&d.count>20&&barCount<notes.length/16*0.5){role="crash";confidence=downbeat;}
        else if(downbeat>d.count*0.3&&d.count>20){role="kick";confidence=downbeat+d.count*0.1;}
        else if(d.count>50&&eighthPct>0.5){role="ride";confidence=d.count*0.5;}
        else if(d.count<=20){role="accent";confidence=0;}
        else{
          // Check ghost note pattern (appears just before backbeats: b3,b11)
          var ghost=(d.beats[3]||0)+(d.beats[11]||0);
          if(ghost>d.count*0.3){role="snare";confidence=ghost*0.5;}
        }
        return{note:nv,role:role,confidence:confidence,count:d.count};
      });
      // Sort by confidence descending, assign GM values
      roles.sort(function(a,b){return b.confidence-a.confidence;});
      var gmPool={hihat:[42,44],ride:[51,53],snare:[38,37,40],kick:[36],crash:[49,57,55],accent:[48,47,45,52,54],other:[56]};
      roles.forEach(function(r){
        var pool=gmPool[r.role]||gmPool.other;
        var gm=null;
        for(var pi=0;pi<pool.length;pi++){if(!assignedGM[pool[pi]]){gm=pool[pi];break;}}
        if(!gm){
          // All in pool taken, use first available from accent pool
          for(var pi2=35;pi2<=81;pi2++){if(!assignedGM[pi2]){gm=pi2;break;}}
        }
        if(gm){drumMap[r.note]=gm;assignedGM[gm]=true;}
      });
      tuningInfo.tuning=tuningInfo.tuning.map(function(v){return drumMap[v]||(v<35?v+36:v);});
    }

    songTracks.push({
      name:trkName,
      numStrings:tuningInfo.numStrings,
      tuning:tuningInfo.tuning,
      instrument:prog,
      volume:initVol,pan:initPan,reverb:initRev,chorus:initCho,
      transpose:0,capo:0,
      midiChannel:ch+1, // 1-indexed
      isDrum:isDrum,
      letRing:!isDrum,
      hasTopText:false,hasBottomText:false,
      pitchBend:0,modulation:initMod,
      trackVelocity:80,trackExpression:127,
      instType:isDrum?"drums":"guitar",
      maxFret:isDrum?99:trackMaxFret,
      adt:0,
      measures:measures
    });
  });

  if(songTracks.length===0){
    songTracks.push({name:"Track 1",numStrings:6,tuning:[40,45,50,55,59,64],instrument:25,volume:96,pan:64,reverb:0,chorus:0,transpose:0,capo:0,midiChannel:1,isDrum:false,letRing:true,hasTopText:false,hasBottomText:false,pitchBend:0,modulation:0,trackVelocity:80,trackExpression:127,instType:"guitar",maxFret:24,adt:0,measures:[{beats:Array(beatsPerMeasure).fill(null).map(function(){return{notes:new Array(6).fill(null)};}),barLine:"single",beatsPerMeasure:beatsPerMeasure,globalBeatsPerMeasure:beatsPerMeasure,isATR:false,timeSig:{num:timeSigNum,den:timeSigDen}}]});
  }

  // Equalize measure count across tracks
  var maxMeasures=0;
  songTracks.forEach(function(t){if(t.measures.length>maxMeasures)maxMeasures=t.measures.length;});
  songTracks.forEach(function(t){
    while(t.measures.length<maxMeasures){
      var padIdx=t.measures.length;
      var padBPM2=measureMap[padIdx]?measureMap[padIdx].beatsPerMeasure:beatsPerMeasure;
      var padATR=measureMap[padIdx]?measureMap[padIdx].isATR:false;
      var padAG=measureMap[padIdx]?measureMap[padIdx].atrGroup:1;
      var padAN=measureMap[padIdx]?measureMap[padIdx].atrNum:1;
      var bts=[];for(var b=0;b<padBPM2;b++){
        var pb2={notes:new Array(t.numStrings).fill(null)};
        if(padATR&&padAG>1){pb2.atrGroup=padAG;pb2.atrNum=padAN;}
        bts.push(pb2);
      }
      var padTS = measureMap[t.measures.length] ? {num:measureMap[t.measures.length].timeSigNum||timeSigNum, den:measureMap[t.measures.length].timeSigDen||timeSigDen} : {num:timeSigNum,den:timeSigDen};
      t.measures.push({beats:bts,barLine:"single",beatsPerMeasure:padBPM2,globalBeatsPerMeasure:padBPM2,isATR:padATR,timeSig:padTS});
    }
  });

  // Trim trailing empty measures (keep at least 1 after last content)
  var lastContent=0;
  songTracks.forEach(function(t){
    for(var mi2=t.measures.length-1;mi2>=0;mi2--){
      var hasContent=false;
      for(var bi2=0;bi2<t.measures[mi2].beats.length&&!hasContent;bi2++)
        for(var si2=0;si2<t.numStrings&&!hasContent;si2++)
          if(t.measures[mi2].beats[bi2].notes[si2])hasContent=true;
      if(hasContent){if(mi2+2>lastContent)lastContent=mi2+2;break;}
    }
  });
  if(lastContent>0&&lastContent<maxMeasures){
    songTracks.forEach(function(t){t.measures.length=lastContent;});
  }

  // Place tempo changes as track effects on first track
  if(tempoChanges.length>1 && songTracks.length>0){
    var t0=songTracks[0];
    for(var tci=1;tci<tempoChanges.length;tci++){
      var tcPos=tickToPos(tempoChanges[tci].tick);
      var tcMIdx=tcPos.measure, tcBIdx=tcPos.beat;
      if(tcMIdx>=t0.measures.length||tcMIdx<0)continue;
      if(tcBIdx>=t0.measures[tcMIdx].beats.length)continue;
      // For ATR regions, place the real tempo (adjusted for beat subdivision)
      var realBPM=tempoChanges[tci].bpm;
      if(measureMap[tcMIdx]&&measureMap[tcMIdx].isATR){
        realBPM=measureMap[tcMIdx].realTempo;
      }
      if(!t0.measures[tcMIdx].beats[tcBIdx].trkEffect){
        t0.measures[tcMIdx].beats[tcBIdx].trkEffect={type:84,value:realBPM};
      } else {
        var ex2=t0.measures[tcMIdx].beats[tcBIdx].trkEffect;
        if(!ex2.multi)ex2.multi=[];
        ex2.multi.push({type:84,value:realBPM});
      }
    }
  }

  // Calculate song duration from tempo map
  var durationSec=0;
  var lastNoteTick2=0;
  allOnTicks2.forEach(function(t){if(t>lastNoteTick2)lastNoteTick2=t;});
  if(sortedTempos.length>0){
    for(var di=0;di<sortedTempos.length;di++){
      var dStart=sortedTempos[di].tick;
      var dEnd=(di+1<sortedTempos.length)?sortedTempos[di+1].tick:lastNoteTick2;
      if(dEnd<=dStart)continue;
      var usPerBeat=Math.round(60000000/sortedTempos[di].bpm);
      durationSec+=(dEnd-dStart)*usPerBeat/1000000/midi.ppq;
    }
  } else {
    durationSec=lastNoteTick2*(60/tempo)/midi.ppq;
  }

  var importInfo={
    duration:Math.round(durationSec),
    trackNames:songTracks.map(function(t){return t.name+(t.isDrum?" (Drums)":"");}),
    atrCount:0,measures:songTracks.length>0?songTracks[0].measures.length:0
  };
  songTracks[0].measures.forEach(function(m){if(m.isATR)importInfo.atrCount++;});

  return{title:opts.title||"",artist:"",album:"",transcribedBy:"",copyright:"",tempo:tempo,tracks:songTracks,_midiInfo:importInfo};
}
// ============ End MIDI Import ============

function App() {
  var LOGO_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAIAAACxN37FAACvm0lEQVR42tX9ecBlWVUejK+1zzl3eMeauqrnBppRaUAGRcQGnEVFI8aRSDSoAUOi0TgmGo2oGGcBRcFIvhiZVUQGgwIiMk/K2N0M3TR0V3dN73iHc/Z+vj/O2Xuvtfe+1Y1Cvt+v8n1SXVXv+957zx7WetYzMP3f+sVEuPg/YCYiQP0rw6YZjZrRuGlG49HIVI2pqqZuTFUTsyFDzMMX+q8FQOj/i0EggJiY2BhDTNba8PfqZQ3fg4gMUfg2DgQm7l8eEzGzA8IXGWYQAwDQ/xkw/Evi+MbDtwbCfyJ8T/R/zcREzIThk+hfNfc/HYBzlpjV5yP+af+jTP/PQSDw8BbBzGxM/8rgf5hh4vi2wnvp/5+z1gLOOWut7dpl17Zd17btcrmcd12XPKNVz+4zevoX/6q7/+X8OVqmn8Er0A+JmcfjyWS6PpmuTafrdd2wqYjIOpBz1jpHjjB88v2a63/XP1zE1eK/HxEYhoYHCL/qmfsl1D8NBmH4ajZ+AQJisbN4Y2oZgR38ch1eRVgk2ctZsY0J6L81iJnh/0bvNog9SxT+Ffm9aUzcHv7jUQ8kPpT4PyBmwxy2T/9/mA0zG2P8b9kwU7/GnbW2bRfzxWI2n8/m81nXtRd5oJ/dA/Guj0X6/+gXM8tPfDQar29sbWxsjafrlamdc5111lnbddZa51y/cNn0a4v9b/zRFlfYsD6Go214iAhLLDx+v5yJ2ciHTMThk0uXIoOHv1WHcL+x/BEd7gyibDmHw1hcQQzxwtivs35pUVi+ZNJV3W8mil/ud9JwYwCO4taSDxqAXCDoX68Lmwrx3fsTn/qXZgwbNlVVVXVT17Vhds4ul/PZ4f7Bwd7scK/ruvjzPjcr+y5P0n/uvfBPWMrhfY7Hk43NIxsb26PxBMRt17XLZdd1zrnhjDLqMKTh/GACwMQA+ks6LM/8HvQ1gzyX4pVO1K8JjkuPxbpH8lkxx+/c/xZEgAurgONa749RqHLG/yNf7/Q7rf/i/uc6/++4f1sEcFiwiLVS9qzCpvULH84f4ZxtGP8F6qhnxNUOxA+cgP4D78sYR/5FMZuqMvWwuA3Qdcv53v7u3u75xWL+WT+wL74+Od7I/7c2UHhvxpit7WPbR05MJmudtYv5vO1aGxbx8EH3C05+HPCLicWy9BU0r1x/QPobGr7/cMIxOFnqSak6rHlfH8Q7IX6NP8/F/iCxwoZjDmGh96992GwQZy2L/x/xQkk/3bDf+qJq+KmId4B8Ofq9kPqhw+Gg6rR+1/VbtX8xvhxPz8HhgwKIuarMaDQej8bMdHi4t3P+zO7ueWtteEyfuwOb1Jr4v3gqN01z7Nip7aPHmavZfD6fz/rD2DATG7kIY3kZVoQ/Foa7kYYuTaw5WrWgxQnJYlEnd9RQo/g160sGf/rG41d+eP5gjOVt+hLYLy/oDSJbx/JeVLdE3I7huAVEVUHxUsDq0yV8b7+1gOGeA2K9FVtX3+kOLxniEESoSzhWKwSgqqrRaDxqRnB2b+/C+bOn54vZP60I+Ey/gD9HbWm+lEej8YkTl65vHrGODmeH7XLBTMZUJI6UoQzsn5U4EkNlrE4yFoVG2rzBV8aiyo3fcLjKS+8gYhqxAhnKYw5NmDHh3mC/CAiypA6vOZZCEAcI+x/EkOt1qCuGNRNeoLyDVBsg9l2yQZFukNARMsfqCul342HTsEeNEA6PcDykXxhrrfAWe0wGRKPReG26ZipzsL9z7sztBwd7oXb6XJQD/Fk/oVn1VsPv67q55OTl20dOLNvuYH+vsx2zMZyclOGRscYU5MuNj183XqSfvV/qcVmExcGG/W06YAXqK+X/il4LGjcZFiKr4zW/hcOrSf4invK+LMaKy7j/N6K575tSXwpjuE+GGs2XvywWdHyZoeYKyzvU8YgdKsUrgRnOxZUvugcg6UYibDcc88xwjk1fqzhjqulkrWmag/0Ld9zx6cX8MJx0n5WKN1l1n5MFHQ7m48dPnTh5hXVub3/Pdl1o6YiNWAbON/Mcj0G/8iJ0IRZ/WND+LFFVygAZx8MgYM7hRPVFYTw4zVBKhyMJoEKvGa4I2fzFBSvOP1mPhOt4aA1CqxbrlLTVE1szXvAS3I4Vjt43pLoOKNRRNIdDryfKfYibUP2v6AdybN1vO0AUKaQxRzjrmHkyWWtG9f7e+TtPfyoB+z6LK/CzXNCEfzOdrp+69Op6NNk/2F8uFlXFzEZ81iy6Pn126QpTPyk1dJDAXPjYRSHC6TEAMPe9eqGCFrMKzv4JxyJEvta40Yad44/f2MtCwXJxihGhBFnSqNpBvn35D1hAzQiddKhmYznPcrmHLZW899I9IwvxUAsJuDyezUTw4GMPgIQthFiM+d3nwMasr29Uhs/e+emzZ09/1nHr6rPf/BER0clTV1x6+TWL1u7t7cC5ylQZRBiWc9jSPOAHuuoQV3b8fTzixHPheHRz1u0l6zcAEOI7Db09y7vB/47jgYq4an2pKV6X2ANJqRrfkayskbfm4fWr+jVMGcPyGBY190Ayi5OYfUk/jEpAiMAKBNiuPiuWS1p8rMM/4wGJN8xpNUjpAzOxhxi+Pnbwy+Uczh09dsnGxtZstt91nSof/ymr7nMzWOm32mg0vvKqe1XNdGf3grXWxC5MXsQkcFzIezPUDHEk1o+jORyxcZXLqjouPjmmi0CcXAlqU5Hu3cJfi9bFXwIC5UyfQSx0oW/neNCzaCvDySoWPYsCIq0MxfKRo5UegBmGeXKKHg7FcP5x1gMmC1H25v5l683G4quRzmP9RRhGn8jRtP5DNDRcyWtr63VV3XH6kxfOn/ls1dDVZ2td9x/c1tbRK66+d9thd3dHrC2Ik0cscAHTMoeZhJzCMcVZcjjJ4wPmtCUkDt/VP8Whxw/tl3h+EvGVCB+tqkfCmcZyVCEOYGY2SdltRM0iURuWG3tYjZyCvPqszO6XSMfg8CYD7jBcdQhYBItJKItuIjnsWGxDsX9jHUgBMMpPVua0gInsEs8rgAdA23bZ2e7o0ROTyXR/bzcZ6P7TT+vPVv1y6tKrto9esrOz07ZtVVUaqIqQl2xCwKrXY9kEarBYAPuc3TOR65PCraBk0JASMyguf7FB4DcMwy+ScBsk8ApinaQGcv7Nx4O+1BDITmyoThN0BAOiougM4RSmtJrhBPMRpTxiT4zYJPizIvw+jBNZnguaJIQIeEM+jWInIKp++Sz9y3PObW5uwXW33vLR5XJ+8ZK6CKPJv63+Oed8+ASNMVddfe/1zaPnz59zzlZVhXj++QEzccCGmZNXxNl2j3NcsITAOFmuiMgpiUs9XgaymEMEnwJXSYGHw0mnyxF5OidbJlb2HHrQBFtQAIE/P9jv5fAdI5IofqAp4RRhz/vyNAKgajKoVgbkkD+5NuVbisewrICTb61BGcibWFb9iNAJUwrHy2XJs9lhVdUnT10xnx32a/r/g6bQf0Co6/rqa+5TNdMLF84zkzEGiIO88IGrtdD/VQYB+3UfKWgslgwzI9YULHuVhF5HmlQpfgf5ClCYqsieLdRHYtYN9fwVjMYs5uClOxiUdYCh1EBSVvg9GT7H5MALZZL/GGIfKQ9IxKkkh4IMsj+VpUbEgij8N4fGEKIXDd1k0g5HmFuX5wldJvllDC+XS+vcyZOXd91yPjv8J6/pf8aCZgahacZX3+O+1vHu7q4xJqyzMCdmykZ0ajH5abYiDAk2jj8AWN6ALGC5OPLWfywOC0XmlMsErIui8INkSVtqnyKjI+7VOMtI16y8hVFoKPUp4T82UluIuVjWB9pLkcoSNkL8aFDG6XqSrWZtFa5kzzWPeykO94dPwDBTcpyQYuNwhucQEVWVsZ1tu+WJE5fB2cPD/buzpvkuFzTfvS8LgMY197r/srUHB/vGGPXg49KVnZmeTEGgdxTHXvG5Z0uKk2bK15jUY1OUH/lU6FskTCI+VU7WbMBTUfqGw6ndX6yJWCAy89OxZ3KHSDRAMp5I4X2hLIk4vOq6WM/bJb0OeqKpWxMEOkyyW0zC5QgbC3CI7FnPBfGnA2u6KiecrmSnhVFYmCAZY52dz2bHjp0kwuHh/t1BK7i4oPnu1RiyHB+Nxve41/3ni+Xh4UG/mjm5rRU2WVperO9YXZSlx10cE3CySMGyXYrdvV6j0NXnAJOBA28yLDROiUDc0zzVZR3ORQZDlrByZWqIXOx39lxhkKatsFckyC9SAEy+NePCVydF7ALJf8fk/FXrmEWxHY975nhCqcEkZf13vAoZcteDkgGNhN6TY7gvbOaLxbFjlwBuNtv/TGuPf2LJ0TSje177gPmiPTw4MJXxyxCqBIyfV3ZdQl6lDFInAsdPMaXaxFo8qwPFsmQ53sv3o3wd+vNCLMgVJSIcgkERRZGXN/wGOdoQz0ukfJVkxKRKJUC/xTgAVAtOrAAWV35WpUYKFEtmQZnJE+BRcHKYQvDOB/REX3N66pPC9H73ltanklb0n8FisTh67BJru8+0nv6nLOiqqu9xr/svlnZ/f89UFTnoSVB208YZl8D+S/Sj5FISUAVLNKR0QHDoXpjTijPlHanpHctZhB9YBv0JgcGUcGgG8r3v1pCWMn4CqpCO0GJFXCDZTRIg1qIWkvcVZzdIxMU0edVrB4rXIyFOc1J9DTQJhSmyE6E2XwYDhfGof+ccLw6OIjkprhQYuadeMQNuuVweO3ZJ284Xi88A9/jMFnS/Xq6+5r6OzO7ublVVcYd6vry42cSxIbrDrB1JOxD/XVjXoRyn5fETDVQCyq7PBDoIgw3WpU38XDnQ1hS9jbJBTvxpiW7AsMnZ9KXHLgRg4jaGmHOvOD650CVIhpOkxnFsKzhKASKi7mt/td0hdy0n4h3WpAPKUGeQIPhJ4CT0FGLqCSgwJ2waPwoClu3y+PFLZ7O9tl3y3Zv+fQYLuoc1rrzynvV4fWdnZ1jNijrOKe9e3mteIALBFuOUJd/3WQHsM/K4Vuc6QyFODERJayQocNrtBfaFKPaHqkAiuuF2YBaXj99mEJBypPRpTggYK6/YcATo0Tbip5Ac3bSS6Zb+JzKmCyfITlxYxYqc1Lmj9oMYEIaJKcVXnP3M/B37Ql++So7jNU7J7bazDjhx4tLdnbPO2bu7oPlurmbgxInLNrcvOX/hnDGczVOJyPiNzQCGNcfplZQUHTyMi/VshcEKGhWlX8q/4KxSCbomTzWKEL8kR0eGGuu2VazjeABHLEOhImktzrHMyMeKFzu6JRgQGaPpyitoXiALJ05o+P7Wl8xEVsyanCQru5oMmQBTYUf4EYEsrWP5LA96Rs/dZUEMC5oMf1p41hcb03XLqm62to/sXjh7dwqP6iLEpWQ1b2xun7rs6nPnzwVqRF6aeUKWuGcU0kS6f9Lzwfj4IC4puYY0vKwuNZYMJX/KZzQDf24mZx4nJbCg7hVm5f6tcw7R6PIgKJ8Vc5oVNr4KRVJIPWdUKwmpB3Gh7k1FUaMbaT1TYhY/wyvAxUuBOHoVUEjZADiH3sVRktO1PHykX2RakbJZLhfT6XpT1wf7u3e5pu9uydE0o6uvue/u3l7XtcYYz/ISistBQwx5z7ECG3LEjhOimuigItTZCx/8NlFYbbJTsvv2bgCXAQ3MqD8RXeJskpEu82T+HK4jA3Ev5RrYvN9Xu03+R7QykFSHALSghOJg1Swm82FQKhq/ukApQipJCOQdeQoCAL1tYjUS8byUvcNK66kVkIZ5sZxvbx9vl/PFYk4XXdPVijFYutuuvOrenaPZ7HCAnIfj06QPupeiiB7YC5YS9R9FyjySqYKiPIv+Lu8/sh4lFhMkHnzUcMaBuRbHZOPwREUrTi8uLEj9jVAqKHJ6UiZAFFN2MfeQRgO+qIsrCCU0N8FJC/eU3hVx9cbf57Wc0C7LtqHnG2qRIJKuGqunXPIHQLMT4s9lBtBZe/TI8d2dc3Dun35C98XGsWOn1ja2d3Z3jDHaSyABVgVyJ7o8XXSxLhqZ8mOVIyQqNjSiuVGBZRYbPlGKKQ5JdlsV+h5kRIoSc4wLY0XKl5CwvUFpiCDIQ34YFEUKHisLMyLFDQqLykNhfFfXEYsfqislSUenfFia1vklxwhNnbrrF2PU6kjZL8gfFBNba5ummU7X9vYuXKTwuOuSYzSenLzs6p3d3eSKl0hW2MKGWTOG1ekYemQxVPNNYSRJkmTECFp7v5FMOtYSznDx/mLOTn0lEichxB8WxNBsRyJFfgZr9CDdcL6pYFUyERW4UpRO2uOmR7yw+r0JFBYNQ8wcqTDYUbW67t6YlEBLqLzlroM24pD3I+7ivFUTpext+30IidcpWTuvOluXy8X29tHFfHYRRl51cdSZiK646trWuuViYYzJX1/61MK7YEkwkgceI33YkTcTuvD47RQrf5XwScqvhkXAnPpRsEQgIurLcsQi6wnNSuhHmiDd3gVGKQOSzC2H6JFeJSRPor/PizFNlaVsfpKegxxs+JjhyxJFzk+g4ujmGBcpROELUcALXr93KIksGg2Y544gQuLFSS0UeyRpRsXaqyEApn7XOue2to/sXDi7atGai6xnEI4cOTEarx0e7JvKKJ7W8LYvzh3LOpegC1aM2sEZThwbIPTGnyDO27UoypAGHTnbgaHokaQPU+7hRQ6EdSe8YLzqdniZLpY9QJwjImGfxYoIFCFX/SKRjPbEEtWUVXXWISlPoygsKRo8T4RZidGHUlwryhEeIuej8kguGo5UkKAbxSfFcSXg7klFgoQLslaCev8sgKLhMwaRMWa+mBnTHD12ieZp3a0Fjaqqj11y2d7e3nDxgVBS3qT6AqSK+sFoSphnyqYsoZyLvl2iXALHgF+sK649qCEDfJ3ooowvqIzgWzBWUFt8lv6XC/Jq/4KRnHiiiBJWpBL1RbJStTeK5BcJOa73pxOk0uHeAkmnOkhiANQqlW4HfrFCiCACDM+c9pWx+oDcdkBCt0qua5TmPhgQcf/h9VatYdY++GBGA4DwLOXGJcPV/sH+0WMnq6ouClvKbLt+sZ08dUXdTA4PD4wRlyxLHRunaFE0wIzmGpJeL8b6OeWfwvJiwSoUx0xafCpF1lDVigkip06gKzx7WD3BFXMuBa6zVovRKrvRoGQAq3sClDll+HY2UINYGCxFBz8qtWmeyWJWKd5DQSQxa2YjSLdGjm/lWVywfuYikKlAVQRPPOQNdGoLowdoICIqOGUOC8xaOxpPTGUOD/bShxtO6NTIEhiNxptbx/b3dtlEjXHCRcsQISVKABIcBt7HZbhC+jXqh3B9o4Cs3tJPPcqe015l2NzSTgKSsNM/FndRuRqjOBDO+8M4yUtPKe1mETG56JrF4fyOR7xwwiUhAkSYFCduB6HihBToxQPSpauZEnJRLgVAQt0eGOaMApoNWcNJWxsw0qdSLFMB+d4l7VVJoQlJHTnY8M0OD7a3T6SHNFBuCofj+dKrQGY+nwXmvucEe92d7p/jAFOCPwrekweTMOsSvSMJZb96xlRCBryJDOkRk5xNlmaUKbcvGCGvAuOiCzhHFarArMErkcQiaMiarKmxl3B2cN6cwF99weU2G5qLBhrIp0gKZUWpvpUUAOgNHOfrJdGEdiOPWqLo2Jo7lisdubKCI8p4DpFQbZy14/GEGbNM2GJK0yqMx9P19SMHBweDK6HyKOn/wMFXeIDsC8KOBhENjZ36RBHHMhK5FecqSLZoGDoPBuuBeLREAqhE8h1M6YDU6RkoQ7Us7xjIK5Rj7+/f7kDw8G5zvmTOCo4AOA5YiKwwAdKEOJSHNmI1JzdUtqGG1SPa2f5lOW+B7hBvMyRu7PHSYH1RDPakAuzPX6F+78MX+UsEkUiHWI2HKBHtZOznPtCsKxc3KpvD2eHm1tFcIl6Vj+dTVxKZ+SJqylPBtu7HPQFY1rTxJlWiX+ZEp8KqgZNDGtb2AGJOxzkZItVVKS5IIi4MDGoBP+mCJ+pWU9sagVGsQndyvD1tkzn/90SaKVsYYiM74GUbykXf0d6eC9nxVTBT5nx0B+R036iDTY2nwVkR4ssJ1Zgiy4YhwV8suOBAeU/1P6jruvFk2i0Xy+VCHtKFkqOuRydOXrF/uB919cwZpMDe8UkJjvxtD8q82ZIJo0BzOQb+yBybpPPQM4OMXwNJa9SbZQWZMQ4ZCoYFgPLcD/786UxMsHSkSo4VVYShRU8odMXCgVpxClAYaZeQMFZTa10dozcXZu2fxlLYkJdNuCtOCGVtHFNqF1J6mVQY3HJ5PiTaFV/2+DwDAGyqyWSyt3tefiuTH89Hjhy3ne3aTuKpmYc2+0UIVuBHiemoThOhAhatOyQqJ00vdT9IvqpRR1bQLCHDbFN4P6mt4L3I+nvReV8XDBla4uUMF71HHyUACVL8h/CX8d8g/vL1iUUJiJdbPfxzCR0XGzuWXTApOEpvbCOdtiHeeYKh6KqvuDQhYdnY73vEkFNBZOHzL3AVWVb4CDVqyiUg9IPD0Xha142sOvKSw5y89MrZfO6clVycCKux6BCZ0s7YHz+eFsvSO5yV1JdlIpvmwHDq68ZIES7FEsspbJyyjhgFXhuyGXdiClM+3XHxPyi1iNEcFWkPpmruwBOCVnaRtHfRxtgZRYSk6Z+/90REmPbbS7lZoe5D7i9V4qwkJt+Rdqaq/5KHajZ1lhQXjopySnM/MLRPDs1o5Fy3mM9iOF0CU6yvb7Jplssl9/7NdzX7gWfIUDBSAZxz4XwabIi9Lg/FyyuObQLaFTvC/ts6EJzrR3rixBatg0YLgeQYyca/EYaE6FQoHIrJ6RgnhXoIM7Rb6S8XUEOKw3vfYPVUUAqe5fEsCKNIFsTLOG4Arb795exWdneiBoqzLe6likFHEQ8WRjodQSE2A5BEELC28yndH4Fbo72xIYPoxJqPsyGIeSQLH2UmprZdbmwckWV7rS4A0Ob20cVirm61FUNGQBaJOsdEuGxKS+UgcmHl0BGXukdMVd/C0YuNVoDz0qGZRB8iiJHC80vaiwoINjmqpBmHrAdy3AqZETlYoSkIfG7JixhAGBbWdkIFJHIpdHQLZB9JWsqKgOiHmzLg/frj0jdmhPRY1i0DgjIEmIZKk1Bk4w+3SlQ0ZJcX+2m5/FgRryqxpoEEvhmYBSDPViBi4rbtNjfWm2bUtsushgbqqp5MNhaLBXuTSIie3F9JarTMRIQkAa0PYzMit1SVxqKilHdoJNBJ+AvizFZkcAEtJ4CrxtoDokaU0m3TRIBQIHnjbsgLGuqth/BYJPRYYeWmxC9IQNdCbZJPEVzmxQSS0UaqOI+1uus1jXJ4g2SKrHMFwoWWTTA57q944WhBTby8AvGJ1U0omgcvgJYSFVasYCCZOcn2lEWq0xDr50BmbX0zdGRGtoNrG1tEbG0ntGqRRiA2EDzUJT+kZLUpMZkqNcD5dZbRAPy/AVPmGg51gyXkgbQvzyIKC0s/oXKkroSh9kDCiwNJpkXSjQ3vgFGiF0OGKGsIQ6wML9YGi3Xpp6x+7Bn3ltpvTrjbRR4VBBQsp6r6E2FNyxMZH6l6VxAvEJc1QBECT0hJnPvuCJwAmjOgQfcEcu7fSdsup9ONFOXo/+HGxvZyuZStBKWjHBJ21558o6FmqFWe9UYBZQ91YcrxT8rs1MUQ6b0rNW1IC3yldUVhSpjCFPEuEI848M5kuwpRSUFuuBiPtvI4pkKLCuhHBeHZn6AbCEMeB5T4QJ5ENCQQigeDPs9Gr2KQqFHzgQl5JpRO/kR875INhYt1x37OIki7kWZF2iYoU8GkdSFARMvlshmNgwYnjLVhjBmNp4vlYiARARmyz9IKyEGatLNasogdUfLYhnRu9Wx02SYDgpCxWCRZqbh1CkQPJBVIfMXRJkFxmjjjm0I8PWnBkHZ6At5b9WAhSaeEvFCC+odIejXKzeI8tYhLGUfyGIUf8iHB+DRXeQW8g0DpFQs59gxcOioS+CABZJHMbzPpF+eHW/zkhhdinTVVPRqP0xp6MlljY7qu48GWOH4t8zBBCe4Lko7NGVMgJSCCZBi26EJZWnamSUvEQ7S3pMH7j7BcPg+Pi+VB51zMWRPokbak88NiRQsUvPL0npNTYtWuD+QTaRAG8QABADbEa8sQtbC9OYW0+8LCxOAJ4ZBhmEVZqFa9uDujp0L/+Eyw1xDSFmLDVNRvp1pPSsi1iBzJSLETGI8cOQhwPZaekisfDVj17xQyLMBIOEfE07V1Cpd1/8OmaxtdZwVRS1ejCRtXIk2JiafYb8I7CSmBLbx85SWTq/RMnBIJXEow1Cjp+RJHrDDF9a5XnBZNGumIB8/Qw7CM1omnZVo0xY3Z8zlN5gQa6FsQXg2S5s5JTSMuwGjFwqY4rE7AO9G55xoSoYlEIjFOPR5SOTenNPOYnzswbsRfJse7ZvsBeXjuKkki0iRIkjomdNZOJhvxhO5/1Hg8XS6XOohRbR/xwJRCRL1UJHyjHMoOSBkn4JnfsznAxKIRD3eszqby96F/BRKAlpTFSC1a8cISPnMyekHeJKiLMi2FpZ4piP+TuGaUHm4UU8SXHaeMonQZdMGQyYVATsGCREQk/J51hkg4ADKgCEhKMD0uYRIzgHI5zZEYFco/sPrcweVJaOqA6P17K2fdaDTpX+Kw3Y0xVTPuutYogDEceLrOTRsj0V8z5P8A6cktWLQJ5IeE+yXOPJeMTjR3D0qSKetorJRxIm86hzXvJIqVFpvS4kb3ubGWJpUMKyTDQ+Ok4QLdmMnPmaWvANLpIlRknMcWklxcyMhXhZ8i4dj3jVl4Cq5A9UbG3ciBpVghs5/dKPoOVHhjBHOAaHQhCccpCMOSGRvd77uureqmMlWsoUejiWFjrS1AXWJr5ftE5IwhwqAESvco4646/SwmDczZa0Hw+JFodgodio0nceLklarDF0L+k2rkLhoLyZLUBgmjAgXwIQAQThXWOYgo3mEh5Cg9UdIWRSNcPWSr1BcEdWaz0Fhl7Nps3q4pu3FOpC1n4txKzIagkGV9iumyGylqDkWVFPettR0zN6MRBYeE0XgqZRF6PaYCO4E2+2hdDe+LCzhOnjidr8gUM87HBzlvGVqGBEWu1YA3hywGsdtZNJUa/VTXJMoXMKcfbRo0AYW2K8WthH3CThkSGodhXJG+psoForSWgD4cY9S2hoOk5450sdFXHbTgl1QQLqSBnmpiU1Bf8PTgkUW5CaMHovJ9g3whwzyPC9eYusEoCIEAoK5HcfQ9Hk9s18lawA+u1G5TU3AR/ad5vf6fqalC0iGIuYds6iMrP1rpJ6B/VhsqngYrt01S/s0FMnpwRWROKb2FZE1VwFO2eZWNNEM3Q/pYIpG4yVHjFxUUiRNxjFDOGiTB2REWT8GRlimhwEdTD2juJAtohSLvVPkdi5ETcn9ARTILzr2MGCIVeFfMqkYZfp5T2SJRXx42IgqlDogcOeea0ZiIBlVWMxq3XUeZhJTVAeitKVhEPTNpBIsV7BE9wwuOwrmAihMTFs6bN+EPwyi4AEIZsEGxMdX0UJ6VcVITbD159TiEA/EimGKFo1Onc6sm1xtzlqI99aWs1A+S75Dqe7QrYPLDRGI5NGDB6nAP8j3mpI3JInmTq1+4lgeTJ8WPS3Hk/JRBZrNJ8nvKyFzOsYKIcFprh5KjPxmaeuScZXVX6DE2sf5o5R0jbd2QNFyQz1WPSzhBdAaJaCgaQOorE9JXbAwUTQnyz0EJ+A0904vtRaRsAylE4YFVAdYNNAtxG2fnf/8CAkQZghH15CIR21JaBAD9bM+zzjMTpmh7wPFTk77hgT6RmUZRxqujJPVI12s+gqi4xfPCXalO/ajexRYrIKCyk/X3csL+g2y6w+4SP81aW1XNsKCbZtSMRtaBucxVhcBj4oxQ0S/UPIUlqKQgdCgBeb9HIqnKiUE0Cg5BSVI3AI2pgbTDbapJEMkK0rIRWXJt6FXAeiNKmWMvCXB+iKANI2NZ67xyMLv7FPTJKpkHqqGUUnGkFTQ4bRVT7nI4VuI+g4YUFdSpam0gXXXamiwNYYyzcNGvIwul1i9TjS8YjqWEA6QBG92m+OPPWmuqKizoMRHDuoukW5OYmgrToIROYtQZL6cJAu1HLA1YN4MsyK8SJlDTi1TeID4x9g9NUuPCAwJkuZFw/ShX+hMyrCk/ySJErJKVs+N2WL/IPM+ZM0hE00DS5HJ//LO8qliwuzW2oJc1XQx+D5B2kD8rNYAezEhMR4wPEfI5ByWQk9A5lYgngzIZEDQrAetFniDk4iP/vAdaqXPGVMaYmojqum67TlBz/afUB4ypHiIc9j6pQw1FvHEUJGQasZDE90n5ObBiBJPIBFGnT+wnonGbmFxAf+TBrwrsgn8pk0aeffRU1mgKt9/c6B6S2kSSpiAAVSC1i9MXrBgck/AoU4kbspoSf+Yg0oiUPFbZoejsFkU1R8IX8GW02KnMStQb5rJKVTQI8fqeBnDR8G6gGztP7dY+PyhMzzkj04l6OncNk9sVTGxMbYiobkbOOs344mT8EFk7IM1LREK21UKP3J4/E86K8gHyM/KQH9TwgdW7E6sZClFk2UIFe7SgxUKMiWeT8kFYXigyBElDfEFPKQsVaGyPAXKea5y6BgAJbJk94kI6FQooomL2IhXW9qU8iEVICJMnZnHCweWEGpVbECWJhYmKP+IrSgeUxn9SMkBI35FCrpRGn72eNRuSsKnryhBRXTc2mEgH00lmyL4vCnMTKLwk1EpC431FolYGcnuHwmUIzzhMU9iTfgalnQ1paRiYVAY6zAq8yudZwJ56MTN0kKdIPcvcFXxfKAgg4mcjH3wLpqeeGQlcjSBn2WmLFg3BvKNf9t6iC060eCOTGE1Rmk0OSYHT+QKaAjdUfxHegrhylKIMsU7mLPNcGO/1DJnQnxGrqnEgl5uqNkRkqtpZC4mhI023iiBHjLbuI0sYeZcM1pwSrTzli87dYqhXmD8MhNVI9tO+usRporRkwHnZh6riE1S2MAkWi4cS7yYBlEqSFgUrmUguE1JxcDLp83/lhjpTmTxG5gRTPkmKfXeYLkRojXX7BoEJBllKuFdF/aqHBvKJcgAV9CXOcqCu2GjBoL4UaaO2lYQWGBFMA2VJfQrDzBEaEKqqqomoqqrF0jJhQLZ97etdp2I7JVIkWIYVy0rYE4+YuTDlz/Ho4FOY8/JA4DCiCclnhX4G6XxAdqWkfJKFB6mSowirKwwxccVEogyRDksVKddQYXJgWdYC+jLhwKVVfQWvwPWgZ/ssMXYdfShkgGqWp5pqT1aOfY7ILgcbjhLmaHps0vZZTjzFnEebnGhSu2DCkhRPQoaAkdYhgOXcKq4AB5Cp6pqZmQ1cWwps6G8cg9BNsrQTYkndJkg6buhvWNK2cnag/8OsVx5AXI5sJ9l6sWcmRN9/5IK9FJ3wLasOc4FCsDm66MvGQWMXSCWMfeYWEs6LzwRDkr7CybgUSlmbEpGF/3B0eJUNuv8QDV2MLF/AZ1gOLUH5HM6jAQ5pG5kbSxS5OcCKIVDQp+oxi57hKnsnHU2KCDmEGsw5a9gYYwwTu+FFSzcHMgOzX07XSFi+Cq4cZ7CiEG2wZChqsb9m1RUonIroAwkIIKHNMXLMrORuVaKLICHwpc2Lcny5yCpJ1DIIfpycoFZxnAfKop4DU571zwWJc5800ZpJGT+ot6HFMVF2FKRiXMxjT2tEDr1D2s0xU9nuvNBLSS2f6G8iHQyKtKynyKxDKv1ScMHqrKprZqOOT44mG4WceGG8mXq0BattDaMhzkVZb2XW7Bhht4jhWlAgW7ZokXoOoxBHmlYg2XWXsnrjVYlwDDhB4+TkEFYMDZ0crmkw8qcguuX0yxdIQmZyHNsXQ0GkwMV+nKRZpr6QVvYu8rKntESTzAd5kRbmFSWXXs288m0i9PGannviiUa7V/1UxXL3hhDWMXNtjAEIDtJVzhdVMpkmTsCjr4BU5kOzb2RfHJFZHhwCkvrHf+xIuCh3aaemWCJD0Z8xRCLUq6Wv0K0hJFOExBsNsYUe81NZGcgYhTIaNaFBQsLZrAghJbwlNavjlM+kWjNdZnAkWZQ957LUu9KWkFmSCRmGJL2LBz8h5ASNlIg+kNo0IO2DHORsw7ervpdAMvHw6zxUDDDG1INkWvBp8jsthEUlDi1SqJBELgyOJ8kRD3n++Y8jVJFAMsQVvLFgGx0rP5YgClS9Jr5UGwzLjBDIdGtQdq7ntoFQVvwZTzxeaxBpgiRDKgrzeM5ncGJz5sOQUoOKUoyQ0ClyfoZD1rUqY0iNYaIdCpRJlRYrJ6OvkvPjcDJwPlgYche8BRnSJpByBE2mVMs9zMSmrmtmDtgWJXqG6OrnkPf4wbFYB3IIdEERenJ9mzRHECG/kgagUDxWA3QPSYW4DpIiqag0UmUrQx8CyYxNueprcDvpIzmS75UgTtsOCZosC0YsfM0GUM6h6kG06DgtG0NwDq5xLN+ZOeU7ZJNKrTzIB+IsR94gYewon6HwLIMaLTmxhFg1Qqr3hbwHiTipEaGDVwWvgRWmI107jDE1MTtRkYYPYCBSJslR8fwnaZcW3SvVXJcjK0XWBnIwmhlwJKdH6tUi1V7iro2HIhcPV87rZmZ1U+SidIHuDdFS4QgD6+wFf2qFK5OVoDh8lJDljfrclLUtZZNploZnmg0K3Y+k1wAoVQVr5CR8vE7ac8fMdsWBDRSAOEVVRz0ranY/jHOyiksuJyQkemgNLonIGQ+NljPSEfhMpjJVSWIUj7HE50qdp3D6tlGrX5bt0rWQSgN9zrpnlrb5JOW4KNA7QyWXKj2SFc0ldCLoXLRSO+k8o7muMjGQ7wCQVBqKNjAaemGtC0hJoxluKy8vpa5FEjcgewNtnQMtkFBj2sitQg7bcE5eIW+hW0IHM2qwAl30aaNfIDKIKXd24mSBJHNdw6ZmY5DJD7K3oAo+pKJFUUCKWGzSpHqhQMjUlRx9EaSGDaHzz1MX5DdMZwnRvTIO9bjsViR5+ZQizb6S4eRoVxXjQG4iZi0FTyO1I/cKTAWQBgLpQURDYw5LIAXpiW9a9Ku+s5AlFfvm8rAmHsNiwE0MrdvwCBRU3Ey4JbkEbiaxnZB5EhmGrbwp8mUTSLcsekKYuqqZjZTiimDy7PELKYg/m1lw6kQsT/xMZEPDauyl1k/Ql7C4jaMDR+GWEWlROt9eHAJS0oIcOYYc7UQdOiBaamWqShLUSdmioDxUl5BOFTUvL16hBfe2AhkVpWOmzIVBlhsrcSuO/bnSAjJnDFdv+cmktNay74SMAY6gOFAaDbKfQDMjKZdIPYoQHaY+FA7TiJLhHaj2w+yEdexLQbE3BopemFUSZagkMlJFmOJlYa+gPK8u3UiMgu2+N3mVhgisHDz0LkcwrQTSkZWORSVIFWkw1A1YhUxezBxuWN9QFHl9pE8kNVSXwkZSOY4avEsE1bp0JyRasky1xlwEqzMLFgS/cX+C8UBspsTWj5NKg4sV3Qq8VW9SfbeRupECr0W444i0ucQOkJhrU9VKWKYih6NvGQsQtgQ0IreSV+QWtdCLJTuTA0VuMgvnriRPmtNJfuS4y7oAUkSiR7fI94oWiQnsjxO0T5a/nDTTLKB5SLm15h0GNRdnfLa00xc53pkGOgMoI3IK0pQCeaFoIFDiteFqBRcEAclhg4RTwtH0njOXbyjickJSRk6wTP3dWewEX6mkN2//NbUJ1lIRD86Q95UzjkxWz2UxRPBWy5ISE/msKqpEeKxOKixyKjTRFrF+lp+H4OhB8HKS5Ih4diLxymGFaKfpqpDi9cSUiAdORFLoZ011+B5OUnyYVFR44qsFDuuac86WcntPzxV4JqPoF2UghnqbiKdBP7RnaHFkZEMl3YgYFQqWGFKHv3R4W5ijD/ChKoE4RC0bo3gxxQijIPfhMgwCldetrxMkxAyt9+GLKDf9NZ47ijHlVsqUDtVZOMcMkyWk6n1kv090uD3nSNKToHADNVdJ7EQjU1PuFZRTqlI8pgBzMAlvaPmixbUJgeBT7uPBwKq0Tf3hlacwpKiDlHDRkAYO6jjZbB6QU37TF5egrkg7eUTCunTnMFUlL6h0H7MIfS5cDSF+gCHpg6LiKlF6APmUWNIEFKMu5SohXG0RLUBiU6Cua45I6lB0sHT2CTEHsY+Tfq8BPQepKhfy01LsEuY0ywVS5u1dzjUcJKo7bbMEmWksHctWGNf6rkc5lYvd5jSCE2ftSL6B+HqwggG5QEnwsEqY+yVsswSeZHm5Qdff/R+ayKtlKf4Rvg7iComP14EINeuUGEh7hZBSBeV/KRJFiY0OgY2+E04hEooDOczFNWydXTlDRmtIogD3pmtOFAkxFiLmfMi7HGrknWzVQbvX33zyo5V+NVkflWVTi69T9RRLOkcSqsBitiO7UpZVU4AzoUdG2j6QlS9C2LN+7/si2onYbl34yYxlSUDQbAV1fOT530g76VCiK4dWgV2UWhmOJCUPhuqkUs2AYihcmJmI61DXSk+N3IFVWX33XcaQmsyqcYVc2Cwg5AQA4ZUUBXn7Fajp8AmnJNylKTgRiVsCnIz6k9mktinVUiKWU+xC5DYl2QOx3VDKTi5lV6rHmKULpJb9Qn8CLngFJqgKB3cRiSYwkq0J2amj8N6guVGQNpxlXrgw7/D0DCqMLJEXzIDymiEZIBQSt1mkl3DU7zKxtP0G6nTqW8pYF+QEkCzISNpcCNJZIUE284xTU2pKnRvCThZPEuACT0iX62BOB1ZcZn7BQ1KknRIkAcwf+goicNomDIOFlWdnFXyJwhwCwetsqDvCyaxzt1JAERrM8fes8moS1M4sfAMicoyEth7IqmeAhEAls+5M9eN62hDIRij2d9CMYU4aD6HW10WKzyaQgI6s8OQYrCbqPdDV58nCt1SE4USu28BZkPGWAOsdHMrrAsEA6RiROQENoFF3Tqv4BIVEPtrmZGyMxG6wRxKodGOktwSlOQgAK6YvyInPRqFuQhGTKtbiqSxGgMkBpqV6oZxMYpgUIxEryKKQ/gVAOovhqL3XHmTxycezh3mVLC04LSa08PRI0ZAMSAL5UaKYGAdEMlSwFZJEJMOmpt4KFn01nDAJSfpMAEkJggLNiAVaIBOYjTHM/kZW/RcXjCz12uSMjMHJQc1hOmGtVYP8cI4zMQq4YvQiQUZd4HwEN1R2pq5E88rWDjnHLtJCGFFYzGnBwxFropBJmgoT4mCVmZkrUrCVy19oUtYIh45UXQ8iU1VhOYi4psF1YWBj9SHhISjSsHNOhPtJQVggCQi7cqXHyJPI5fnOA+Y4VBEsi25FVg1PTLKDOc6V6pDvRMhzjCB0G8kRC9ZEL5RJSn1raXZ2dlzbUlWnPIqcEgc9AqWSHxinG4Griold161trDXNKJqk9GAJk/y/lFzjTMX8eiXpU2Ii7FzYcYCzlmAJtLaxOZmM3RB0G2jn0XFADs39vcXajJpldyEYZ8yG2/ncLufGGCJyzrHh0dqWAFHkQEo528TVxTJBz8C5xd6FXm/hl6wDOdfZerLejKcOjplM1bTzA7s8bCZr1nauc+P1rTj54HBbBNVNOOAjGQUiolcf9SQfRSgzWNTrGjvUCT6aWB92Tt1/TPpMSAQTrIrM4AkheUiJbE1fR7brvuWbv/E+97lXzO9JXOo8nOKcA1BVhjRVra+wTWXSXGsiYnbOWWvruqlr88IXvuRTt50ej8ZQMzyRYq2MSEFp7UrpVFIVxGDmrrPf/aRvu+qqqxaL+XLZTtcmb37zO97xjneNJyPnXE4/yOolqDU3FCwuXq99OzJUdMYu5lc+6KFXfP4XzecdCHXVzPbO3fTGV8BaFukr6qnmnNwg9zJ1uzg0FT34id9bTY7a5XIyqqu6Xi67xbzbOHb8/EffdtNb39gfEO384NT9rrvvV3z3+vFr7Xzno29+yU1/98rReDoggKG3YEeQRq9qoIRyjgKrjSZH+7Hni6zLjDZWHsEAqGX7kkyWInoeZOWIykHfZgqObHZDV3V1/uyd3/M9T37+836P/q/8evs73vWJWz41nU56oxFN3cqCG1NONmeXeGBAB3MGA+Df/7unPvghDw7f6L/8zH97w+vfMF074RwZw4GuyQUqkwRvJODr7bSjRIf6yVe7nF/x4C//wif9p507CUxra7R7x6dveOOfwzlTmbyEJYUsxSKSibhqlge7kyPbj3n6s65++NceHhATTRtipoUls0afeOtfffh1/8tUFRuzONg79YCHfPV/fnndbM0Pqa7pfo96/BuP/vR7Xv7s8cYWwUnndmOMF6dSsKgULAml5BFvlsTYC9qtlGR5zLIugAIcouqTmIhq54T6OqGNKUpKz60RjbqAo5nVVEGumWY0+s7v+HYAh4ezqtcvEhI2K8vkD85PNrDKBVNPjGhYQ13nRqPKOdR1o1Ho2BFCUMVJgcFRMUikq2o9NwcA586fv9B13WKxJKLxeHRwsB8cbRDdWxTMJCrBEts9oj5JMhtVlZntH+7c3i33O1OZ+bI63N2VdDbd6bIoNFlqNLmql7vnTn3+Q77kac9dP3a/3U+1fZLbBWtNPR5Pu3e86Bff8+JfHY2m9WjcF3Gf/y9+srVb852FaerFwp5bNA98wo9/9C1/cXj2DtPUAhgz7WzX2Y6Y2FRwVDXjqhkLpyUuEqIIypmGxfgsjJAYnAXyZoBAFOj1bDuVQi2IJsGWzKOAHJ1VYustx/1yTGSIZ4vFve9734c+9MHz+XLIDObU3YqZ3RB5ymQIoMowMRvvq+5EpcLi+mT9uUhyf8yPQlotD+oMIVuB8kEK5wbpKW5YJehsZ6qqruuus0RU17WpWJFGywJuaE0vkv3MCgYX7aoDG0NVDQMyxlLVuf6hmLRtH4Lqk6Fjn/bIs5077v24Jz7ye37H8PZ8t2VTMTFTN90aXzj/6Tc869996l2vm24eAVz/ga8du/To5Q9s52BTEzFxs1i40frWsWs+f/+OT5mm4UgVcg/91h8aH71qOV+Mm2q8Pv7QG17x6fe+YTTdAGzothL1RQQyh3Awo8y6hUQ0tpNMAkCRs+yol66NqVKsXo3YoI/qNJQN2lhY7htTV7Pze1/3NV919OjRz6hsmM8WUhg8mYzv/tdWxljblS9iPwGWSZCRIwrNzkJGhvSgtWFT+cbDWkdEhitij3tIHyPPDohdX0TypDaBE3GGn7iy9+MmAjnXC5vJuV7a5Fj0BshsP/onZ6ratS1j8fAn/8y1X/3ji30y1JmqBlxr3fqx5o6PvuVvn/20vVtvmm4dd7YNQ9R2PsNyVq9h0Tqg7i8na9189xwbI2WgcN3lD/+24/d4wHJONdPGcbr94zff8vZXN2ub6qDTdZfyWVKzTrV2Ew8BZu13IRZqf8PW5An+8Gdt+NxZWt2QAJiIUvlCWpf2tY5rRiPA/cUrX2WtDUNqw6o79Q+Q+3yutbX1xzzmegMDImMMEf7mb16/u7tnjLHWyTjw8MPc0DJWBJw+fbqqDJR3BwoSIUmnRkIvZpm1QimmSMaYvpOGcwFzYmO0TkDs9mhp7rGNMNdMaJbpPHEgIzmwtdRfVJWRbT5EaokmMTITqKqb5cHueHPzUU/9vSse8oTDsw4MMoasq6qq2aJ//D/P/Yc//jnq7GRzWM3DOL6qZrtnb3zT/37Yt/2Xw0NynTWGt07UH3/vG++48V31aCqHCM62hzvnNw86t7Aziw61a1tTN3KG7+dy0R0TqoOA5LYLezBlScFM8D5eYhoImVtQe55jOHQH21EWkkmNm2jVk3TP0hMR69zaxsZvP+v3fuM3n13V9SAdV+xJabPGxpjlbP/ae1/7rne8fTwZ91BrXdc/8ZP/5R1vf3szWXcO0nfACYojG2Yy1nXT6XQynlhrRUWZJdZ7P7hYPkvuZyArK/Q97DuCj4wX6LRBRppRPKykUtblJOebxufOD5ZnzjmQdeInZVnPHtiO6nNT1Yv98yfu/cCH/Zvnbpx64P6Z1lQVge3S8Vrt6sN3vuCnbnrt80dr2zyqbdfKvAs420w2P/AXv83jo9c+5nuoXmtd94n3veHtz/+R/rP2HE7PzTEVUe2IQa5DbWMIpf5spcpMctw0c01Ye0pWqp+8QBiBI9UL1N7TAkSOyQhdB4RvNSe5ntCfnXBKII72Q4Bza2vrIYwaGYEyXvdMxvBs1Bw9drxuqv5F9g3r5tb2dPPo+trUORdXKaABhGFbOedc77DNyfxPooqZ4BzItCBcCE+LabFO45MgOImpcHQLgTLqT0YfSVWk4E6OZtpg6waLcwfqOlIa+UAOCb6XzERmvnv6Xtd/y0O/+1nE28vdtqrrvmhoNpvdsx97+/N+4OwH3zLePE5wcI4VWjU0KVU1+scX/Zeb3/z/TE9cOd87t3fLBw2Zqhn3DyKswqoeVca0HXUdAGpcn0weR1YsSSzILK5ZpZQi2AVpYvVgZBPKwWjjFHynQIQa0gM6tngCBNC5eNkgkzklbSkNkXOQAoGVg1eiqqqcBWiIVu8Ppq6j5WJhrbXW+gWdOP5ycmH068mYitkkhp4Z6qzyYMLajvMYjZyyJKAlgicXbCrYx8obYhG+xJCTc2WulrDgND+WQBbUObIWXDFZshYS3pLvjIjY1HCdW+488Jt//N5f+1/bBZHr2NS2c44x2Wo+9f7Xvvt//IfF+TsmW5c4u5RWHlCWL8RsRutHDm6/+eC2j7Op6mYCAM4OAJepqO8lHKzlzlJnyYAMD/ME5oorkJohB/G0E8Kd0HXriEDJpRmIvhCYfgjflPYhVKfYLLTwQhMuoiMHCnWz2D3pGSzt0lBazRQ8Bp1zCMQg4+kJ0eZVl9Ei7k/uLOf2ZzMQ9yKRWBRBul8KxQzDMI+aUdM0pjJDp69T3GJxwln4CBzBMVFVVcYYZ9F2bdfObX/FODdEBRhmY+qqHjVNVddEsNYBFxH6DRxq5+A6so4N+8lc5CepX6aq28XBeG360O993okH/8v5bmcM11XlrDOmatbp/a/69Q+9/Jeqqm7WtpxtCypFFgc+YGd7gGOuyLludsBNw8b0tY5dLvpIK9vNZvN2zQ63FBPBLhfzPVM3hETNRgTHxlSjqeAkqDaNU4IkqdoPuSskS6lz7alxMnaQM64DkjQJrcyJ2DBKTD2pcRMcGkmsRVx1nKAA3p3YqdMN8V9wEIGHmriuzfWP+KLReGw82s9SDcnioEBPDcfOzt5tt912xx1nZot2OhlPJhPnOmiCR8rfF4KRqjJszOHeQdu262vTE8e3Txw/dvzEia3NDWJ21hJz13Xnz1+47bbb7zxzdmd3l4jX16dVXdnOQpiWQU5kPHDqBpSDYchaSs1F+/dkmsXBua1Lr3nI9/2P7SsePt9p2VQAta2tp3Vn99/z/P/4yb//3+O1Y30nV4qMUcuJDR+7z8NMPaqb2nBNhPO3fKhHOWy7PHbN/deOXtq1bVWZ6cZx14FAlngxp+3L73/lg76smmxUPSXBOcB6rpFpF4c7N39Au2JmdoSefxxbX8ZFIqpDeVL7KBBIRjERyN/XoZP2P13id/IIN1RwQmYqZo1FFFEMWXw6bxBPxQR2RXljhb8L/S+IDDOIR+PJHz7vD66+5qq7i/aBlsvlmbNnbr75lte/4U1/8sIXv/8fP7B15EhVVUOdE0SoDMnTcIOFGls7m89nX/jwB3/t137Nl37pF9/jmmuOHDm6vrbGRr3xdtnu7Ozcdvtt7/uH97/yVa99zWv+z7kzZ48ePUqGrXXKZkscXY76Cx3sYJjsEIgjjxLDplru33nywV/2wO/6vWp0xexCWzU1QK7rxlvN3tkPv+8FT9256V2TzUtgO8AVSljR+BIx4JrJ+uc/6QWbRy4dGWKQGdObfufbDs68plk/2h1cuParfuheX/TE+R6ZipYtda3rofHZnrvsod97xcO/N7R7YR06R2vrdMdH3/m3v/I19WgiU0cSUgMSzq6um/MeLHxdnfnVBF6Lk/NwiWdraapAK5hJ2wplhB/h1scxGxWBjYM0NjwmPARbVVboJaAeP0B1VR8czG755K1XXX3lbLYwIpQpnwgPSKWDMXzy5KnLL7/8i7/4kU/9t9/3/D/8o1/+ld+czWaTydhaKziwBdNY2y2/6qu/9qd/6scf+UVfNBqPenzaWjtfLPrj1hjjy0pz5OjRE5ecuO666570Xd/xnvf8w2/99u/8yYte1ozG41HTDenUJGmURHDWtR3ZjslwXRHBCKdksKnIoT04e++v+v57fcMzu8Wom7dVXTsHcqi2mk+//5Xv/+Mfcvvnx5vHYdtwxRVCxlkAV/1Gtq6dY2E7gKtlZTvbozpVVR3u7u7uYba3rKqqxy3hV5xrLaUVAhOTs5ZMc/7mf4BdkFmH7RLmDzhNdoAy0i9TUaM6GH1qtXzO2sk6ptfLuAjOaYCpDBKZVlstfI7hS1LZhpJQU0TbcNEpoUdQQjIfMx8e7N1y883W2q5trbVw1sE566xz3dBfWuuss/3Cs9bZrrPLxfLg4HB/b386nf7oj/zQK/70hUeObM8XC2OMNAt2gvFdV2axWD7taU/9iz//0+uv/1IHOtg/PDg4XC6XzlkAzjpnnbO2R/ucc13XzWbz/f3D/f3DBz3ouj/6H3/wspf88SUnjh8czuq6pjjxi8lBzpFzZB1bR52ltkN4OVw1rl0QLx/wXb9xj6//jfagdm0Hqrq2czD1RnXTX/3ae3//uzE/qKabrlvG6yyxMKGYSiXiMsBMlrgjtkRkmCszTChh987dOu9s/64AOMdwcI4ceHivcLb/5PvfOAfYZefOffIDMQheelfreCWPEekwC6aUI01qJFNDCocFazHVjpM2iU7iCXzKeegjgw2wzLZIaOsJ4yocxbJvR0HarRlwvoZm4dTpOnv6zjvrut7a3rz7U8bFYtm1XVXVcNjb23/Uox75v/7oed/0xG+11rImlQ4lBzMbdg5XXXV1u1wu29YYJqaqqkbjkVlhMO4c5vMZEVWVWcznAL7+6772fve9zzc98Ttu+ujH1tfWOv/joiIOxvYlB8gxtd3wuXA9bg/OTY+desCT/mD96scenG+bpmI2trX1pFny/gf+5w+dfusLm/WjRIBtIdFDKP0qC0kIBSCe2TlylpxlZqqYDJt+sdquXe7vTNZqi9oZsgsyzjkPFVdNPQygkeC8TdXQwe03cDUiOFMAMdMUC6lqBsjkTgw6Ka9mpLdoOl2TDqicn87x6Ax7wgyRcMyJJYso/ZhZGQtC/auApHGY9ACUuQfpXIlhOzjnRtP117/hb0+ePDGfzavK9K0hJbNWkag3Go2vvOKKhzzkwVvbWwf7hz0WsbOz97gvu/4nfvxH/vPP/MKRI9tdj7Iql6vhf9p26QBjeDyeVBU7h09/6lMf//gnbr/99Hw+79mthnnryJErLr/0mmvucemlp4joYP+wqio2vL9/eJ/73PslL/yfX/nV37Czs1c3tXNCXcvkrOs66iwMuKqoMlzXI2dce3Du6LUPv/e3/sFo69rlzpKrurPE5Ebrzc4dH/zIi552ePM7RxvHnesIkAkLXLBPEXhC8DtlQ2T6ISUzWUfOOSIHZ00znd3+gdve9tJ23s1te/Tar1rbOEnknKV6bC588j0Ht38QbJxzIWUQ1hGbrpsdnrnR1GOCjfYYUI48moLOiV+txGrzjOQ6AKvajVeey55K5+PYuWARmJkcyOk8c3ac6mJ+mAAyIK2hI7QdzTMLNjPSmZKJYK2dTsd//Td/+xd/+VpyNsH5lMRMZHBNp5N73uOap//gDzzl+/7NctESoWnqrrPf+z1Pfu7vP//Os+ebug5eEH2nCAsw2DAxra2tVRXd8JEbXv5nr3jd6/7mhhtvOnf+wmLZWmt7NRCAqqqmk9HRI9tf+uhHPe2pP/CoR33xYrF0DnVV7ezsf97nPeA3fv1XvutJT26abY6+fmCCdWgtOcsgMo4sDAB3ePaqL/1XV3zNr9rFWnfYsmlca03N4+36jve/8oaXPN0eXGjWTzjXKsRS2QWirI6KGQ207FBX5AAmbjsafMTh6vHa7s3ves9H3wKCWx48+Ol/N9o8RS2sddVG9el3v/jm1/5yvbYNZyX83G+WerLJporDLKRp7n6JCz0sJVb5nHgHBlS4RmIzmbxDRBIixyEZq5wKdVhS7nHE6qcikcEl2UGG1RS0r8DiIZ9EtQrfzyCBBJFzbtQ04/EIQmnHgnGrtGj+UX/s4zf/23/7by/s7Pz4j/3o3t6BqarZbH7q1MkvfuQjXvjClx45dsJjTzL8kuAwnUze8553//bvPOc1f/W6M2fO13U1Hk9Go/F4MhUsWXbOOmvPnD3/x3/y0j/781f98A/94M/+zE8DtutsXdcXLux/67d88ytf+er//cKXbG1t9uwX3/Uy+mmG46Wl/cNluzh/zeN/9orrf3R5QLbrmCtjYbmupnTLG37946/6RWPqarIF1+rCEUI4k6/vBANnB3Sdo4aI2ICcDfFQDIBNXY/HIObxxmg0AshaIuK2I0dNPd2s147CuWA7GLKX+5qboii1v85NQhgHc6qAAiOlLwwHZqhvTZzGMOssYwYYKro9ZMt7P1+g7AWUo2KKzsSl7FmwTPQQrBb1skRcfTjckeg1iJmNda7rrLPWdrbrOtu2nbVd13Vd2/+vDf+f/zUej7eOXvprv/6sGz7y0dFobK3tUbkHPehBRCYM0+WH1LXtZDJ+3vOe/yXXf8X/ftHL54v22LGjm5ubVWWcg+3s8DO7tmuXzloijEbj48ePT6Zrv/ALv/Lvnv5DVVX3GkFTMQg/9B9+cGNjfZjICGOg/t53IFgyZv2qb3rhkYf96GzHdtYBpp8D2e7OD/4/33Xzq36xHq1z1cB2QocF4XmQu7tT1oUPdI2u62vovhklkSbTk1o6uM7Ztu1cDyza/kR2HVwHZ8m1/W/67hi2dc722mRmGaljtOwNtDocMgJo2ot6mPivhqpXzEhUcAkpvVGMdorlNwp2TzqnNVhBC70v5CxeqQpZpdcghpJD50z05JC6quu6qquqCv9T11X4Vff/p/8Tw0yTyXhn58K73v3u8bgOD++yyy41zUhoIeNysM4Zw+//wIcWh/NjR48w8bJtu86GYts5GawxJAz1MMslJ0889/d+93nP+8ONzfXO2sqYg4P5gx503SO/6OEH+/tRGkfUOXQ91mGJHU1Hk3rrPu2Slq21Xe++wwSqCZWb224BGWcftH8+QSOpNsL6lnnL4ckOAItl23HXkQOLpOzg8Y+uo86S8wMgZhOWVmJujzhmlaIzsX7i4N2bdMQEMD+rYCaZIxyQGqZaVSW+ABDStrQUKZl1K6YaR1ENF2pelW/jwTwGQxfEkG7EaXqM90IXajmSdHZjjJnPZ8vl0lqQbUUzIJ0RWHtd9F00kz08c/YOuVOZjQ8UATN8VCn1AnMQ1U3DVd22LeB8+htLtwbW0fA98t3CTda2f/O3f+dbv/Vb1tfX266zXVfX08c95vrXvvo1xmxHvB5kLcExg7qK2sMLN7/w8Se/9rdO3P8JmLWoKiLuOpA5ec0TXzb625+5/U2/UTUbXNWAzVFzJECX7qu9m5RvmcDOkXOAo8pRabg4dC/ODlvLWnKRGQANWyFzDWDWFEWApDsGJ5bZ0uogYjZRzlwHHrSYQ+cqzog/J4YM8SjVDA1pSR70SNLVNtAAM4aloPsFYaNQY1AJaIn87ro6OJwtD/cvu+Ky66677uorr5iuTeuq6lUbA60iJURTcAtmovl8dt0Dr1su235aNgzInQ0YuWEz0PqcCzm2IlEPYkaO1ItCXGrOYbq29rGPf/LNb37LE57w+NmFBRO3rfuCL3jIeLoWmFjEDEfWEizIEFuaW+MW+59++Xebr3rGqS/8QTuDtR24Imu5pVOP/fnR8ft+6lU/6rp5NVqDbYWAL2Jaq0MLWYZtw7G15GyMs9N04uEldpasI3IMoOtfav92HaUpXZn0LNFH5YQJlqSi4bxAKW8bAGo/ZRYhYDJqkaWC2butMWvrXgkUc5pEtkoJJnKsILYiZI5Jmokah05IzbiIgKoyOzs7D/uCh3z/9/3rL//yL7/iisvruhnQp7safcu2ZDZbzmYLYe3X+2DEw6EfEoQGo66aGAc/DJN9rqTUPYfGXpiXWmvf9e53P+EJj3fOVaZq2+6qK686cvTowcGsR7WH5rhfVY4qQwaomrUK9ra/+qnD0++/9Mt+1fA6dUuuakewe+3Rz3/S5iX3+9ifP21x543V9AjsUgo0AZ2LBiqeU/0pYS2oh+1AXgoHES0z+ARb66wjdgSHriPrAu8GwvSe8oXLUkjZTzOYVcxm1JuwJFF7l3SwiAcmojre/v74YxJmVfDa2GCITaUpIZcKcEUyhtIjZDY60gUwrg0acCKQBCKBrGEAqKqqCxfOP/UHnvLMZz5jc2Pj8HBxcDB37nBYFpIi6v0NocbwgZ3Ipoeu5QXrB5x+m7keYe1flhsO8iG5mJP4npTcJOIemdiYT3ziE10XLBvckaPb6+sbu7t7husBJmPjevooM1lyrj9EnZlsn3vn/zi4/QNXfdMLxlv3tIdLqio2VXvQVsceca9vf+Wtf/kDF278q2bteA+RQIxwBWdT0BGybKWuA3XDtd11NBBbsqaKYGDJdUQga8kiz+cSrGeZP4fkTJZuuSmaQSmymAcvwfiOyqVjZ8TQHMkeyg5a0jlH8ZTNXCU5iHN1Tcyia/W9vQM0mrEKM+2/eVVVOzs7/+6pP/CcZ/9W19GdZy4s21aqpwGvJTSmDzCH/FtP7uzJ0IRet+s8q8VFgh6RtZ1zMGJ472xHzgp0SPfLRf1XjAHB3t5e11kvuaK6rpqmkfRggJ0l1wMOjqzrkS/numW1dmLx6fd84n999bmPv9FNR2QdLDnUi4O241OXf8OLjz/8ad3iAgjEddAcBcfv7MCF5t+j62BdP1Khfn6vs7B6qMwQjLVkO1jrLzNCqdwe/lzUZFCjS2RSeJEtqRRPCieOnP46hZ2RHr3S4ox9IGA4a8PNKuaL0gskzhZZsAHF/DyQO13fF8dYM+HoSZIAr9VPIBjDBwd7133+/Z/xjJ/f3Tu0ztZ1ba1bX1ubTGoH6lob6oc4lIdn5wF9ZiMz9UjdcrHo59j9Byi7FMBZa4lgTK/ugQM564isCmhR3HutPkZgB/Tfz00mY+pDo00FYLFYDiwlwa9Er1hxxNYrbft2AG01OeIOz97+sm/GVz3z5IOfsthzljoiQ23bwZx8zK9OL73utr/5abRz00zguvSUy+SNXlvFRGwdGxvaJCXKliCxdTCW4E9mIwNGw23N6a2KaE5BnPjbeiYEZFiZlLhxqPhjPcPMte+6Eq/fkGWNbCSnlOBccvhkudzijndwg00AStzp4LnhoqYuHNGrmEtgImOqdrF4yr/53unaxvlz50bjkbVuOp1+7OMffclLXnLTTR/d3z9kHvz1gkbLU9XY9LIKOABszP7e/vd/31Me//ivOzjYD1NyoT70D8InyXaWyJgBqAZnmfIs3SeSuxMg2PaKK64cNRUcYMDE586dv3D+jDGGPB5srevs8PCcI1h4++2eFteaZspMZ/7qRxdnbtj+4mfUtnHdkrgiwvKw27r/k0dH7n/rq76vvXBzPTkC1wrJh8rVZuXn2VdWgdLb1xte58qC4+hc11rjhu7BOiKuUjvrxNszTWcGBqmi1IiIEfXgLyWGFR5LS07fWhpkSbGMzp1GUCyqnJQkiz2iE0G2z8IVXN4A4YUiZf+KDE5wrF/kSaJNoLhdtpecPPnYxz12NpsRc9d2m1sb73rXu7/5m7/l9O13mGYMJOB3Iqvxgybn6qbpFhe+8iu+YjSu9/ZVw+E/awNgPpux4SBIufrqq7karYiAkv5JxUksfYE3YbKd5XF166237uxcmK5vx2bDt1zERJa6zkXzquHYsYDh0db5t/32/I4Pnviy55rxFdzNTdUQm/leZ45+0RXf/Ko7XvfUw0/8dbV2gpyl6DaEVPvOw/5moJ+q9GeT7YSVrajFiWAdwfVYGaOnfDjkRlWUajeHng4UHaUzG2Ek0YkQxuOJ5gPk6oCkSx0jK/4Dlw6XXD0YvIc41e1RcrXJ5S4S6hVGF0OPxPGsLSVB/dXftotT11xx6alTXdcxs3WAwzN+6ZdP3372+CUnO9uFiyR6tCbiQt+911W9s+Mmkwm8E+dgauULxroy1vEtn7yVB7kkd133pY9+1Ob2lnNgZdEaEBL4MZb69IwxbdteefVVX/zIR+7tH7DhrrN1Xb37ve/tlm21aXpT02Ey63zVPaC8MSoEQdVoXb1+av6JN3zqZV95yVe+YOuyR7SHS64IzO1sQdWVJx//0vNv+cmd9z2vGm0S14QuY00KbiSIyRCxs8NP8QCz0POJ6Ar0IxUi9Lj1gNgJrE4ZY+TBFlFpr1K6UY64hpZShnrECDI5ewZ7ftQklkeEwnEDz5kDrxA1I442WOCajFVQrb/zhGbFi9T9yKqnOG5ubhKbzloiapr69Ok7b/jIDdPN9WXbWus66/q5t7VhFm2dGybeXWcHkvRAjrZs+iYSUG/Uu78wve3t71gsLAhVVc1msy94yIMfe/2jd3d2q4HAFIhWpEPkhe8VUNf1wd7+D3z/911+xZWzw1l/K1rbvulNbzb1uIe5ffHKCKNv9PJFXdf6J+K6pZkc5YPT5179xAs3vhhro34CD6qcbZfL+vj1v37pl/0m0KGbkalzcrGYaXoAFdSTmuGIHGkEmJgZrrWLvX4NWou2JR4f6zk/0aO7J9SFs4HUKDPujmSiPNSmLvHC106FYvTdk7XF+VkO02aGaPMBxWcQhoZIEvySXGZmygjNscP26SODaWwPdQQfnwAtQadlDWd623XOWde5nqs5mU7G45GztjJVsE+A/GEDzs3Klac/R21ru64n4/evgAX9HM5NxuM3vP4Nt37q1lEz7rXpy2X3cz/700e213d3dppmNBjUypQSjR0YY5rR+Owdn37847/63/+7H9zZ3WNjOmvX1tc/8P4PvO3t71pb3+iJH77WqxzIWSu9SPKMaT++6rhZg+3O/p/vO//W/7pk06FytiNUTLzcb8f3+96Tj39ptXGpW+yyGfkno/Of/XnRWwT3zH3rYlS74IgZcp09vJ0IrnMO1C6pOf6FbBpiZlOFm8mhSGkPZmVyMUX6l8SLk6l9OF8EjZ4MhFyKOY8iVtolZkrTDpiF+7WgZqcEjjRIPjmVZeKI87sYUfrKZf5u78/UNLfddvu5c+frpgawXLZbW9vf9E3fuDg8x8b07I26quOv4b+qujZNXTdNXfdcj2YwRnO9LW6i3fS40Wg8vuXmm1/1qlceO7bZdh0bs7O7f+973+9//a//ecXlp86fPdtZZ4ypavkzqx6Mq+uajdk/PDh35+3f+C+++TnPeXbb9UAXt203mYye83t/sLOzW9dGolOGBWru+udvUPpoh3Gg64jYjLb23vZLZ/7qW9ruPMzEtUu2AMziYD46+aWXPeG1k6uu72Z3MtfezUrwEQQboMfsBtwT+ciBmbk9+49dx50FHLtl25x61PbnfRdmdxIRm4ZNTVyzqYhrMg1z0ytWJTws69fEugNeYwhhSsOc24Yj2OkiIfALb2pW3VsYZLOJBb2cjFDuTSBfWc9Xz53VKTCyPbewr61BVKFEkgqaYIBGo+b220//wz/849d93ddd2FlUxuzt7T39B59+26dP/8mLXjI7PBgeha9d9cZAX88SDKEdr62TaUxVQVgX2N7SYJCOwjk7Wd96zu/+wROf+MTpdH25XBpjdnZ3vuRRj/6bv37dc3//D17xF395yydvnc8X6Jb+MZkB9q/rra2tRzz0IU960nd+27d9h7XdfL6o67rruqPHjr3yla/8kxe+eGtrU4oLB/r1YAQk6UQJtxmsBrqO4MzaJd3Nr77wF1+99bjnr514iDuYo6oq07TzBZkrjn/FS5t3/NTOPz63brbIVESW0fNCOagqnIVx6EN+I/CsnrDjajK/5XWTB/5UZSZsHRsi64496tfN5MjBjS+2s7POdh7Lr5jJgUyzzqYhuEjkZYkYyiNLnNzBfjcsbkmhJi/BSgnTYkKjliQoyUsThivgzB2clDRqQPMhIArmDPiOVUV/Ghp/PkXyNAssl0UM2gtf9OKvffzjnXV1VVlrifg3f/PX//WT/9Vb3vrWT992O+BMvwkHgWD8MRjs6qq16fhNf/fmN77+b6qqYjb987PWOV3CETCZTG684aYf+ZH/9Lzn/+Fy2Trn6qY5PNw/dvz4L/zCf/vBH3zahz74wY/ccMOdZ+5cLhZVVVV1A+fqur7ssksfdN2D7v+ABzTNeGdnxxhTVdV8vtg+cuS2T3/yR370xwPpheOwmGzvAwbvyjjow1WfWUp8IHKdmZxwuzftvPob6Et+a3z1N7vFnOBAFXVLZ6sjj/y1+uj9zr/5P5Nzpp4CLTHHjAFnu87WXrws6l29oOupPf+hxcf/bHqfJ1F7aHhEzrV2uv1FvzJ5wFMPP/02HN4CNyfAVHVV1VzVBze+YnnnP5hmGmZqgLyJ06BuET4Yi2LpKRC0tHX6+gQIkItEOAobIQUyyMsIitEc0iWPFePKx2mI+p17FwvDHA4nSrIdgs+1txBwbnNr6y//8lUve+lLv/O7vuuO22+v6oYIe3v71z3owQ996MOdByh62lzgBPdthAP1VKPtrckvPvNX3/j6v+K+6nAORNbZfn1LQUXXdVvbWy9+0YsuvfTUM5/5zN3dva5r67peLBb7BweTyfSLHvnFj/qSR/e+M+RH+K7r1bl2Pp8fHM4MGwdnOxw7fuxTt37yu5703bd88raN9bWut+YXvU5gPDmH1BlE5hAURqkM11KziW557q+fvPaQ928++Gdc2zE6rmoAy4PZ5D7ff/LIA8+84fvtzsfr6TG4LqBhDs5a9KlfDA5ObKmpFBzXa/vv/bn6skdPN+5By0OYmqhb7C/R3GNyz3syU1MNHW1jiCd0ePqjuP1tGK2Tsz0OzNLIlgWFzK9lRgn4ZKFnAfEgkk3ssou52hdLzqUVTko51hI9RYKxpEjVGXaodY7JGNPTJp1f05C5vMJVYKg9mmb0Yz/2E1ddfdWXfun1d5y+gwjGVHt7e16fp8LG/dXJ7OvTZdsCx2aH894vt+0668BMPRmV/Bgl9CXWuSPHL/nt33nO2TNnf+3Xf+3EiePnzp1vu86w6bp2sVgGlznnYF0/AOonfNT7hFlnR814c2vj7W9/69Oe9u9vuOGmza2ttm1NdM2kPu6hxzX6bdZjZ6aqYTuAiB0jIbLJJLDeUs2SqavR1sG7n2HPf3j7S37XNNtYHsLUzBXmcxx91NGvevX+W5+2+NQbqtERIge44N8H65gcsXGWCB1HglVM7WbT0Oz0wd997+QrX2Qml7j5DARHTO3MMAjo0Bu00pK6djl1XWsGV23ZKA5zZ2824k3uksIalLrmhZDP3kcu4X9h8P1gFKC7EAALqd5IzDi1SJz0ga8HiYMHcn9ScwBonXXLZddnLrnek4c9/SALhSaQg6tHzcFs9m3f+p3P/p3fmUxGl1xyYjQes6lMVRlj+pgF8r63zKYyw/HJg0GusQ6L5VKOZp1zbdstlgvYTrgvDK+06+z2kaN//Ccv+pqv/fqXvfRlxHT8+In19XVjalOZqqpMZQK2OHjusqnrumma9fXNo0ePnjlz+id/4iee8I1P/MQtt25tb/c4unARCIzViuBc18FZ6i8tJCATtN0yIL1QB89hW01PLj7x8p2//qbu8KO2WXO2JQcHYxczaq689CtffvTBT+8WF1y37Dl0xjTjxhhyzlo4a+AQAOaewR7EAbbjZqu78z13vurr57f/jW2mbbUGaghMMATTQyX9V1XG8DAHzQw3WKiaPLSBlQkyLA9yX0ODVJSeABVkjGRkbEJFrbAGAoY/8UECgpEaGLmcULKFi+hwiG5urHfOLZdtVVXT6biqqsEEUchzheBx6PSddU0zmrfLH/nRH3/Jy/70O779Wx/xiEdcccUVa2trg6Mz95+pd7vjvjrn3p6jbprtrfXxqCaCMby1MbbdxmLZ1k1jDPdCfs6CZKx1R48d/+CHbvjOJz35YQ/7gsc//mu/8BGPuPbaay85cWI8mYDIdo4NV5Uh0HLZdtbabnH77aff+773/c1fv+6vX/+3t912enNzYzwyXdfpwORhmGqYq3rqKtPyuK5M1RhiY+2CESwqgj5DI2LIDDRdW00u6c689+xffsXoEb+5fo9vZJAFNSNiotmy2f7CXzTHrjv79z+JbtY/4mY0rSfN4cK0HY3ZsGkUaUqWtbblet1euOnMq765vvwxo3t+6+jEI5vppc5M2FREtOy9SatmMjb7Vb10liRGzCw8E0UIcNyUTOS4wINXtnJ86vJrD/b3I5teG3CQdA4VXPz40XPIaAvjFMZA2sgdbnQjnih2max16+vThz7kwVVdE6ifcbzvff+4s7Nb1VVWpedWBr0JbLW/f2iXsyPHjl555ZXHjh2dTqcs6IqBm9Gjn9a6zlqCG0+mn7j51o/edNMD7n/fK6643DrXta2p+Pbb7/zIR26sm5F0Co3e6ETGMDMfHBx0i8PRZHr55VeeuvSS7c2NyWRqTDUc1cBsPt/f3zt79twdd9x55ux527Vr6xuj0UhnKyZUcmayZuMamlwOoG7GIHKL8/b8P8qbToXO6aC4JCGUiNjUrjsEcXPq+r6uGI2mTK5tFwQ2k+32zLvc4W09kNyceEQ12mzbhV3OuGpo78NufpZMJVcexO+ZDQhuvkPkeHpptXa5mRwjMx2aJ+fYsKma7vwH3OFtZBrAcbSQKV/xAkDDCnHCwA9eW1/nS6+49/7+nk+LDgkrIWYHSMIxmIWgIZjOsjKVh0slgyyU4oNEBJQWKn3f4w4ODo1h5t4+y62trVeVyfEi7TSlgHNj2BhjrV0sFl3XIaHCRPJ9P0Iw4aoYT6ej0Wg+m3VdSx79aprReDwW5vLxdpLGEMaw4coBXdcul60dsKrYLnP/rkw1appm1DuG2QG6Sq2sle4AboFuYUzF3DtLGqqnqaNGgZLuStFn4iF2+/335wAE9G651ZRM04vN0M18g2gJxPWUTR0oPLmLhj8yKhDItoS2t2btQ2EQZJlmwlUDEaxElKpH036gCAvrk219bW1Y0DHVQ/t35Z8IC2lumN8pI/nUck+6pgsOVpIhJ95CH5YV7oA+x0RurKjKKQ+fWAwnWRqoBNcjscQhtIa9V74zQ6k94PiOnLNOxiklLAVBE+t3Ofq1qx5IFLhF574g4fAGFJIdKdxWmYkr9SMHkVPuysLJEEDukh536r2ZiRhcSb/TYL3iE5IGBF1Su5icSLxOShoty4tAOWtH/P6r3ApKkFxNmjWS/yEl4WFYW1urIyM1m8ZpZ4RgEKOkWjJfvqyHV8xuFgpC9XzkKN1aF1YASzqAbgRCjRjZgTKM3YcmRI1KakeWKQV8je4Asl30U0XBpTIGnipPTAyx386lXEWtf5EdOpcgJWkRhN6Yg2LUqpTbiq6IpRVvvB5VbojML7YkWKM5o6ZvTSTL1Je6qZ1YyjiKepjsk/Z2YVksU1ILhOFocu6xgMIhYI7hz4w2rqE0oFKzpVkGBsUNrYhLKJpvBKG89jvwDyUJKIc2POHS9SLFQALo4kFfJRrQkiEDimYiSKLctDQnMTD2b0HP+FNz/Ui7EfwbjsplUuoB9dEjHQxk3yqatkpBM6BPGFYhLj6iJwYHl5PuMVDAimhtMnJmmRSWW9aktHdFkka2ymRdwKklWHD+GoZwUt6NgcsRp43IgeMB9Ihy6xBOA4maCFGrIg/59Rq3GwQTijTDWRrXsGRgEpTlowAuKfXHESpK/0vrF1Ag9QTyZKBCha+FiuyF8prJytbUhUSqRIV9RJ97oZ1fGNFgVbuOKzGDzF+PbhUxJz5hfJUGCuITBBOln170bBEyIYZSRZLmp4XRQP4s8m/LCWU0nnNiJBH+FKI/jJkgxoPIsYZhwbZTGB3JuNVwbERTC9mHKLJKCJuD3mPC4wCckk8jfS6YnUDZ8iq0NRPxUMkMx988YeHFcwjBiB0JAVZP5Tkv74ZcZKZ+sMDwWSryTNNAE4unyAXHHgalR28ATZPi1IRxKwJHTGptGXHUBMm3jcQXr3BLvfK5pDsI5yOCByYL3rgWPieHcGlJJ0+O8wNFHGWcJXkjQXIQ8Sq1S3vb/eTCBWd2IiH319sOeG0lS4NZ4SBOqYMoydM53nO9bwsoKcSZ0haTdUWTYjdatskpuZallYq/5EyE71nO1RgUttVAOedMlszK7CdjO7HAsUKBz5kXmvcqSb0aUDB9CJE+HHj4/RGhFu6QuR3nA5z4E7AmEyP56GSakX/lKZGs2I0mf8dZichCjutPX47rB7owJ7CS2QaqvSyfxdeYmGByV44VinDE+uNmFP0LGGk6kbILFDoHKgznuVDMIa2zJQkrdoDidlCVj7S8STD5/KyA/NriPUEhfQnSxzrovTmGjMmUDrlRGDHCHlLGiXwKJodT0kVZWmmDqrpu2273/Jnlct4LfknYQqhpAHw7LT5T5vwT19oL5nQ4V6i7OF4CeowmaexxRQMRBNGUIWaWXuf9WkNyiMYVHkOSTfyUy9cFYhnDySXN0M7TJfwGhSZCInisq37x4Sl5I6vQ1XDMSqI2C06L1i8qPDMBXrT4BiXZvZow9wb+AoAU4hFWUeyUs7biZwh/dkN3zSJZNMe0Ym/ok8y945WpzMHe3v3ue98/eeELv/xxj5nt75mqFhB4wVDTQwqMGAete6J4A0BdOAIODKdttFIZgvWGzyi+Ib0NemyTpeU95PNFwcQa0rVDbgzxCgi1NLtlLswtUlZGsMpnpMiARJSZQyB2gDmlqo9l4rrih/j8UMAkUJfM+NIGTgr4ZuhIeP8HkARyhEWIlTWM2FMmio8NR34zkPEL1DUybEgjpqva4a2AKFHvpieeohwRxGgnjwyayrRtu7Gx9vM//18f9agveee73v3qV7026vKNHsH5tli61woDkSElSmTkCakX0iOZudDFcPhckW2ilCoMQhHFkoSJ4EgOHYseSPMsfdhqxurJi6oAOO5KDkPf+Fcsyi1jTNd1B3u7cQYW/PwjaiDz42U2rU8UZy7UF5y4P+YLkSkNNxJMbZkTlpZV4h8zVMRQdJ4CCcEPpHhNwf2sB6tRSSa+uyzrKTgaozQ9iD1Zz0sydVXV0+lkCFMEL+aLF/yPP3z3u99z8y23rK2tEVfelQ/7+/tuCIoV5PFkD0GRjf10CERlNEe9vMITkAEJeUHKgKvrZjJZo1CbxllpsFCGwBCccPVmVp5MHN3A2BP8aZXMJDuyPe7JGZAbB4DGmLZdXn7Z5T/3cz83apo+07I3WpanRRgh6cROJh/KOhSiiEx2YXhDTFmAkABrRHrxIN4muP7Hh4fhetEiszGiD2LxjvzoDA59NGxP64PrB4HxhYdRmIzvElPP4Wdz2kugVx8CdkioiRIHF0aaYVH3Ekfn7GQ8+djHP/5Lv/TL/SB99/xtP/6T//XkqUt/+Unf9Zzffe6nFrca7gybDnZjff03fv3Xjx470rVtyFpn0f3ycBuAmIypokh9+Mnsv4RjYhjCV5Hr/zaQcjMjTOczy2VBv7a+9trXvvYFL3jB2vo6rJWkFKEMD+WNEq4wOVEOhLm18Wc+6mSMlxUdkMuVo+1LKdcghsKbw8PDN73pTU1d9eEjTNy/ecOGDefDamZtByoulIDWih+uIRv5lpE6QMnU78Edpr+s4/yWOU/AgzTRCwD1IDuQI33hwgal7jHDshjo1E5U3nB+3i0eohRcRZ429Y5kgVAGoK6r226/3dq2aZrd3b2v+KonfNmXffm3/MsnLhf7TTOazQ6dW7Bhw9wu2ze/+e+3ttbbrg01qGEOtAEfQR13bMJx6LdBMiT14fUufI8Sf5iYjXd4islrzrnRqLnxxhvrqtLza5FYEirRkCmd4SyQRi4sUlYCl4PS7Gz2PgksktdKsWtqStWXHGytPdzbuyh4QqsGd3fFTWFNFygWr8k3SShnKCE5w5lSIscUntaKF4AVM0lOc9TSfwnNaCh9f+2Ms76x7hyOHTv2p3/2p694xZ//n9e+phmN//3Tf+j06U8/+3d+65OfvqNPEdjf2/O+e1x4yawTyoq+K+VqCoXnn36YGSVouJNtNZqsTdecp0+RyjKGOJtFpA+rBjcEhDJF88npdI0vveI++/s7Q1/KCokXUlk5eEh6RKEfIDVPqqsqQf1QqP9XUqgAYr4rUDEZ3TAjhthSmWeoyAXSUmfY5rHG5eRpQM6sMtBRKXQkId2bVOpGtVDlCbsEZYAsRu2+Pep/zeeLa+91jx/7sR9nw+PReHZ4eOqyK7a3tl72spc861nPXl9fd856kcFdfsJZGRnun9gwoUBoEPpwGQXFaexYLOm4N2Tr40xJtBhi6SmKvaZl0Cq8kGhtfS3QR53AqMWTZ2IUrOtEcK0wZsy4PslsXrFOmEMUp6ClKPctFh7dig3FwxCfBVJEAgnzRW2wbg3GHlweYUXL5IS7JyxBZPyn6islpH4xK3EqkBZlVZPHqENErJV3gbPW2q6qalPVB7unf//5f3zTTR/9lV/6pSPHj7dtG2p7OdEcYIHow5ny4MPjCPunnJoVUrPl6i9fmEgoohHuEdZGkZXHYbgrLXnV2Cfr9piJpmtr1cbWseVyIQsZ6XYuTBAis0DsapNW0jJzONv3nJh9CYac9zIVT5dVDS/yvX3OnDjJmJlyNQ+nlr1KrkBYxXSI93oiUCAVbNR3psYwG4O03uC7XNDaLZuTW0XEOTOQut+LDtnUTWMGNW61vr7+sY/edMsnP9nLfDKeIgT4wOyzSlijCnK/rbji1AekvRCx4u2ymF7HbBXBRQ3tBCcFOYtVCzGWzk/Ppmn40ivvs7+3m8UisZACgcpAISNxK8umf1KiAu9CELj9SZkWlF3iRBimWiyBA1luIlEeQBBx2WP8lFKiC1PKxMyJOQ9eDB1k+G9jFvP5crlgosl02tSNdZb0h5LPZtKoF0r9W1ePa4f9DCCvEfocxNlsToTxeKyRshxBiytWqBE5J0jksgqk5wDE/UapCp0LlEmR3bGi7F4JqcndHoaZ8buura/VTJnyLOHnFKbbGMRZYLAjJBcSK7ZZOClRGNLEs0p49FJqxCpKB/F+WRnsgMUzJ2GpyZwwZCl1DGTN+EhyHjOINby15Wxx7/vc58Txo3Dupo994syZs+PxyMH5a0TX2chDTUPVf1fnOVjX/fkCBRE559bWpr0lg6JgoLBvoUwMCxFQXFxsXunDrLC2HJHmFbzdErNUOo2G+kNFgRNlbwNyKXIgONQ5OFAI1ASlxYsg1qaeHF5jYLiKwzJ9qw+G2DKPahiGsqSxMw9sk96/w0tNjHRTD4cXM5OJ1ToLb0g20SVWzOoMkShXNNnOT0BY75FevuGMMYv57Gd/9mce+9jH3fLJW6eTyamTJ3/qp3/6TW/6u8na2Fn0GjDl6mrKc0QPYhZXNRRGW8AWWIY0e2daMlW1+qBn1RYhPMVkHXIpVTgr2DyHiMVzETslPnjOODoEB+gU1FS6FPs1YXUJ6VgmC/eBiiCaQlU+5hINfcX3kjWOHmBILkAsFgs9Elf5zdlMDSVVTykaiaN7dD5ZST1QKIwDhjpOpBkmMl5eAedFixcmrpumaZoeG3nsY67/yEc+9OlPf2q+6H7yJ3/qIQ++7l/+y3+5tr4OUJ+4GejUwaWPMkQ3dGnibLo4TUzg9dDXzdDpKbBqBeyYooPp1skroCLqJKEt9TlyHiEui7m6rn3UdLK0mDgD/OT5DWHCzGnq2traeq1uGRbT2LRCgNBdMmRXLgfj/r2PRuP73+9+YRJeGk2nn0lAIEWGzZC9IERsLMh1YqQFoeXuW7ReDAVh7jQk6DrJYVeW7X6WxTJrl4iIrO3g7Hiyfu78hU/demtVV0R49WteMxpPbOe6xc6NN97wkIc8aJjAOXvl5VccO3Z02S76ayoM5yTIFcJIWDCnWYgupZ69f0m9JSmzPIAHn44sWyp8K8gRdxTkMMepZkBtWQTc+QB7MdxBSKJXgwvFguLwsgLBQdQjDLjKVOfOnT99x2ljPNIixH4sUZCcsF2U0Aipdi3Peo1gl0ufaAGBZNI5vCRjzHyxuOLyy37pl5/ZI45VVRnjq2DDLDZAUJ2piXGorAxHFW7gDKJPlUCc+3jlso+wifZIUbnip+4x04ak1rPfOU72T/1LMswgtG1nrdve3n7FK/78N37tV9c3t0AYjcbWdve65zWPfcyTn/KUp/z6b/6Wc9Q0o53Dc9/4jd/4+K/7+sOD/d4PpK4rw76A6f3Hhoy0CGb0E/i+AnEuWg4C5AiG+jwKx0SmMoSYsdPvjcE5DcEV2O9w77aO6JFJxvTOL64vUQYvaq8pJ7no4+4K5w4bNuG5aco1e+ICBCWE41iRyXZ2Ol171V/+5XN+91nr6xtuOF96kXaE8igFJIRXviZbRBi/f3GXXnGf/f1d+W4VnSalugpGOZOWs0ff0n7EubGxVlV1CJDsH55hOTuNt42ksEpTSeiPbCB7OOcJLaGhi6eRYSMrKL6IxCKLbldMqGEzmD4TgtkYY/b2drvO1vVouZjf8573+IVfeMYlJy/5wAc++MpXvvINb3xTZYavrSszna4xG3LWpR7yrFozzUnTbBLK5/HMseZUjKvSoFLXvJAc5QRgRkb+UzminBSFgTNUwM4gmIEUOSrB8ZKN4dlstmy73jgzh68EgBueOwBehfUDROSYeH19vR64CboI6Ldghp0IGuyAipkcDAsn8e7ewQCSZ/4bRcQtKe8kcVuLxJh0Zop+4ANvJhaYTKtL5RjkCeQGZqJdFCxHY6rex/Cnf/q/3HzLLU/5vh/YOXcrETXjI2bc9IzNrnMXdnZZjASQIzyBAcRJzxqB+dxIE5AeA7Facr3NFjNUq5H4wmUswgIOEX2Ygg2p9KDlfHonUig52ZpJ+xmmd2wMG6wW3kvj8zjohpcdQhjoCCxjQDmE955XBwyZ1SQcpsHpFEvilXrcS8xEVV2JlOMCEijCe5g0QqfG/5zOGoR3syzg5NjqLkxJVs7QUeD7KmkJiIjadnHikhNXXX3NS176kntfe6/pdZ/nbHdwcHDTRz/eWxKy4TqzyKBkKiO7Ch0KmrgBKOoBmayvjFS/VCuxEhGEnktzpERIPWQPiXDuk6invzp0SrIykFW6nH4i4mNmUSczK8BSd/uyxwj4Hga2XZCkaGAuDPE1bV/JhJRkP1LWmIRIiTX6pz8MjuHTkXEVtC5qNamFIC6DBNaQhoWrbaOy+QxKr1LPcmNMb1+HsLnhhg99+7d/O+C61k6n00/eeuvP/uzPAsiSa5UWgNNghcEAHmk2QqKHT0KCBFefZMmBixGHpMNC7GJktzhAzDrTO5LRdeufjZ5i+qTqGqM3jQ7b4vjjBbVeX75Q7WxwB2d5fkrTQ77synvv7u72XYUUjFLJmim11dAMEun1T15PK+2OhMjIW7SkpzUriIWSabx8ziBvUNSbdlZV7WKcKxVypSOUupoRlXDtOFpTy0C6/pdzFs6BqK5HxlSuqFcXNYuwvUyFCnnXwjKblJJRz0XIcR7auuioJrUVXFXFSy2S3wEsDI0pwc3yRJOLXpXB/idnjKiBeGIXqt/C8JIBYlqbrpkIS/drx1E0yWXR4Wb1PyiFOUsZNsM/S4xJUkAFUusql2OguSG3+mfmdrnc39trmtrabu/C+ehzwV6iqqiOLMSt+ToAKDVIkJZdWoxIIDamNlVT16OQcatsvsS0FOo0AKUPpvAfUCWvSjzSV1ByWDIuOpaTZkb6whLZQZoiF9MdOFJx2eea6wTAPiwCZY14xulFuMkYkitU2o1hoiqF2uybBj/AZ6opl5JSkjUZKwHm9L4WXEFd2JAIAOb0ooR2lUY+FBYmWxo/H7ZpVVXz+ezSU5f88H/8sXvd654AXve61/3h85/Hg6NhLA+ArHsoDWUgJXuK8IRkIhyGcy7wqgCIi5ZViKqiW5XaIDkHj0aWkriKlEOFhI4rMIFg2uEBKCmiy3gYLDIm4tCXQkCCSMbWXmrxXaPAV4FvJJlL03NV8AUGDgstMJdYCjpp20MDsTRlpj6bKNN/ITvtZbc61DKczI0Vx2Ww9y4cFnwxUrOcVA1aAS7YvvRn4GQy+cVf/rUzZ+58xi/8wrHjJ374P/5I23a//3vP2Tpy1Fo3+JoPjjCRNimWT84j84mThpg4v9lBWXS35FwS90bIFHwXuXQJp8JQJGWbr8WIBhyADGu3+r5zMPkwPK7GYAArwEsebLtZGgnBT+UZEc3KCRlI711lRIfCYJm1+4LAGKKUUMRPJvw+aQUq3xwYuhxIt0Ctob2835MCbQSeU9JBisDkYTVb280O9j1Lg5UelHI2ZHGJDQdMIIgarqxtTVVtbGzu7e4++tFfcuWVVz796U+9cO48uZmpzA8+7ekvfOELnbXOdbP9fTIsCAalujIbvKsjJKDbQbdLlPmsJA7ZKTKS/Ikcm6U/XJdUlDYQOe1M0uOz8z8MbYI8NhXscJr7l3KYIX3WBpFTJOlJCDzZVCIAxE+AlOITtqqbyXRNvySW5HBtRcZiko1YVyqgk0OsW97KKEa2VvQX2HiigDP922i75aUnT/3Yr/7GZDLqOusTRgaEeBBQ97HD/ip00a5zqMqGMRaTc+i6Fg5VVa2vr7/m1a/68z//U8Btb2/dcecdXeuOHD22v7dz9o7bx+Nma3vz9O2nj2xtPuMZv7y1vTWbzeDQU5b7b15VhofRzJB/Jc3kDDEb7gc3GZATxo9Rw95/3n3smvdZ9r5SYqmxABKYzeA73ZsNctAWUurtZ5jjkoLzf8uK88j9WwgZ81FfG50sBnErXFBiwHsckAOcdUM+WM9uGEaLKsnJ+HfKzKaq4BxIypzRK3aZ49y7H09aa/sfBZ8LvLGx/obXv/5lL33xdG3NORuvUDVS4swimFVByzl1m5m5LqNamkybU+fTgYjSe7HharFc/sM/vG88buKYOnhEMFN0dmRERCtmx3oYYWh9+hxVBzedTk/fcWcznlp34IB22Vm7rMzYmLrt7P7BIZw1pgJXH/nIh8bj0WKx6GH83u+5H2UnRjScGyQWZlHOV2xRtRVU0ANomR6REHEBCNBcP+Ie3iwLty4x3gxTOo5HqXJ+jAoLY5ioj72lPktAl0QyYxIOSvsgimop/fARYYKCS3FoOoQmhnaBFU8hQd3Dz3f+vbDhpq5vvfWTxvQD3TSZmZWSRN0Dw2wF0PdZfMdMqCEkt5x55EGwM1fNHBMiGOCqyuzu7j73Oc8ict53DNmeKQp7ViE+QcHq6vH6xsbmfHawXC7X19eITB/YtLax2XXd4cFhXdfz+fy5v/u7BKtjNqUtUKhG8mkZCtpVwuptf5F+gIt8rOxvE4UGJ75Tqz+fu0QS6G7NmDhUEcFDx2nAh1c8r2Krt/pg6C8B15pmvLa23sOsnE9746mbG9SUcEoBz9d+l3A2KR8I/CC6uAUec2iuhXDN8NbRY6XnJSF2TnxP1PGR8GdDme9c2y5Ho/GNN37syJGj119//Wtf9WdEo6//+q+/7bZPnz9/fnNrG8DWkSMrNgZYgRUJrzWirfIME6SVZHpHtOIjzutzZs5IFFRgbKxYuIOiomDmnAAgnM3ZtXjeH9QJPCZHAB4eGixXjTY5Hy4cVkiB3ACspuVKAdMHyvTXcTA1LxIiIsMjnXeRyNGNvfLw4E5eds/Dw8OeaCY2rNblZK165mJEKsav1MGnTvwFHrXyxJEApzL7YSKiylSHs9m/+Bf/4sn/+t98/GM3bm5ub24f+c8/9RMfvfHG0WRMwqBjVUMotKAq1C/5sETNnDIh1MON0vGcFcVi4EV3ZYQgX1wexJAeUjHUK8IA7HGM0kmMqI+q6rpPh4CLk0K4+Nyruibi+Xy+nM8J9jNkE6SoM5mKKzMdj6u6cq4g0xJtGmepLbHQkJWJFo1hfX2dL7n0HvPZzDoX5Xwl07iC4kD8S4Au4pURgFuWnfWqPJsI43KKaQlZXz9hPjjcv/ba+3zBQx+6mM3f8ta3XDh/YTwZA/l4lrMMUVZyUVYELdayWxHIkIjdhwUtoSNkqp4S54/1yUAZKTsd20lpIFYYLAsFJ4hLl35E4uGcm+3vDt+4bjY3t6S0msk4uP3dXYJ74IMe9NCHPnTUNMu2ZW9/BeHKG4NsEFtiH8OHvn1kY6y1N95ww3vf+57Fot3aPuKc7dmwyASHai4pTQWYuASLeetfXl9f40tOXT1fLG1n2eTKkBSGL6DKTES42J2ZuhFSZAVgdQ2Tpmsj21l9g2UWi0W7XBLRZDqt6zryYIX7uKA3oSRqZO1tqSdWyNx4RRaWJC1x9oEhPRqRGJXoaij6SMYFcTG5YXp8FIWm0LrXgCFWFT/usdcfP3FyOpm8613vfOvfv6kabQBwzhIcgdbWN66//ku++8lPvve977O3t9Muu95/uq9ZjDEJHJTwTgOY0ltwdJ1j5uPHjy+Wi+c+9w9e/rKXT6ZjhKuBE3U6rdJNri56iYjW19bDgu6EQxdrhySwEiqnXLaUpMJx2cSsecmR1C28/FmcW6AmyybgCf5nD7AbghEeJam9JCw0y7wQYZQjZpfx2IGmBae0ccG/ibESmn4R7vOkTFMrkQMSqK3P0vFv2agmA5tT7XJQSFRVtbe796+/57v/ww/98Hvf856rrrrislOXPft3n/O+972vbqpuuZxMxp//wAd9w9d//TX3uMef/dkr/vD5f/CJT3zCORhT+0WMQYUEuaFJRhRF9IMZBOcsE06evOzbvv3bvv/7f+C5v/fcX/3vv7yxte1cYjxLd6EYzmB+Fiq/6XSNT156zXy+6GwnJ4+SqZ+h0CuPYESDbPa4ZvaJ60JQM07i/oEOXgRHpE3alej1ogH/AMYGSzPKm8Cc0BpHrMHsUo+jC5RQTS7VVz/5F4/IxUp4Nj0i5pztrG3bzrUtoeV6PJ1O66oWgU2S2wnvz41o2SAsYjOMJf6oqq52zl74+Wf83LFjR5/2A9/zRV/8mGc/5/du/eQnT546VdeGiA4OZqdPn37rW//+Fa/4i4999BOjyXg5X5Bb6FuaU9+ZtBbOJxuoJht2vnj4Fz7sOb/7+8/85V962UtfurW91VmrxVwrEJLo78NDxk8ysWWejCe15gHnZcbqyyw5qpU7HkC0mM9TuavAalnd3/Btc7wNBM1c8v0L7zbiO4zUAUgPRlOBCEu5h/f80wc5pyAUJFgBmYTDFIchA+juE1aMTO6QeSX9VNXt7e5UtTlx4vi97nXt533e5zPh7W9728c+ccvuzoU+pxaDcVZpPSnvLbljOVXmMhNgKuPc3sHB/uWXX2GMWd/Y2Nnd/d7v/dd1XY2asamb+Xxx9twZuzisJ+tbR7ZGo/GT/u13bm6tt23LbHqufDRpEHf5MF5hQyIKrq8rnMPG+vpfvPJVH/rwh9759jf/6q8+84d/5Efe8pa3nrtwrq5MyEzSyEDeJwe2dCb18WakdeDTMtOK7jwhZPqmVbEakPyjpq6vvupyNkx9WPkQ0uBjGYQ/tKdNc3AB9XbqTlwXLijlYnkWedgcJJz9/MKw4iSrUZww0RFKGYr2uMrgm+NVBUVrD/CndYPGsS8WrbVt13Vd11nrnHNdt+w66ywceqWgKMh7dSO2jh7/b//t5x7xiIdvbW03zejcubPz+fypT/3B+Wz/3e9+zzve+c6dnQvWOmbymqXBmQEy8FfNjf0niWjhJ0oYHB7s3+Me95zNF87VxlTNqKmayflz50x10Nck62sbvL5hre3aJcFdfsWll19++XK59FGIkePVF9wikXIYPAU73X4G3HXdZDKuDM9ns60jp1716tc85SlPuf76L3nhn/xJz70ZLFF9AqywdksIHiIqQXP6eslKXWiXFdyH9FSQpGICpQE3MKZaLBZXX3XlC1/0wqZpDFNVVdFO2EH79/uXbtiYyg8IXd+Tendhcr4ww2DxPbCXnLP97JdiYAcDVFWGK0PorZ173aYA45LUb78znYBu3BBHCVCvk6XwB846DFrr4a+c67Weg9vLsm3btm07a7tuuVzO5/PFcjGfzZfLxXw+nx3Olu2ia7v5fD6bzWaz2QMe8IBHP/pLX/CCP/rghz788Y9//PTtp9t2fu/73O8LH/6whz7sYd/xHd85Gk+cc31yirVugBq496se3Ipj/xA43M5Z58LN0Dlnre03edfZS06efOMbX09k23Z5OJvDoRmNen0xE1nb+mveLJeLH/vR/0RsCJZMVZLAYQUwrkM5nWsm08lkQsz7OzvvfOe77n3f+1JEwEhqvFmnXYkTJycxgUWUY80y7hclDposyFZ23WrgPhqNbv3Up7792759PJ546wkhtOHgNCBDz1laFJBWZgaX3v7yEuerUz2f38VGjU4ExhbYFuG/ODRhTpKxBJgH40WKIT24ZyZ4AoMxxrAxlTF1XTWj0Xg0Ho1Gm5tbo3EzHo03NjbXNzZGzWh9Y/3IkaOnTp6q6nrU1M1oZC2ctVdffdXf//3fPeu3/ztRY+rJeDIeT9Y+/OEbPvT+d77gj2h989j6xhYRV1yBrHNWOAoYBwc4ZjO46SBMgyC1mCB2tnPOMpuq4oOD3X//wz92ySWniKwDzWcLaxeAA4z/IAb9PAFVVW8dOdbnrg98j9xZTFQdFBxQtDbJVFVvLgk4ct2FC+eOH7+ETFPkfK0UjOV1BHzHZZiIaqJoBrGaveo5fqRSKn2DA53XOzA8P/rRj3k+TZp7LSQ9iWQTRZtUrS9EfqcImLZkFiMLZf1jRPpClJNozE+zxNnTf4QFVhS2wInSxImZ0kAHNXVl2PTVnjHVaDTe27nwDU94wjOe8Ys/83O/+MEPfvj97//Hmz/xcef4uus+78EPuu7Rj77+2muvXSxbwI1HDbNxGAqqHt5l6muz6Jhvre1/1//A/kU5OGdhna0qA2C+aC+77NI3velviSZ1Vdd1DefgwBWLBJGQYWysbfv70qASGkgoqZVwnUSiZ2DDVUXMPWeJiMg0l5w8deedZ8i1FwNtCkCNDjeN46zhIqoRqNNl1Y7OO0wc05gzZDe+l8l0En+4OAlRTtqKBYFW3MU7NDp2rhhXhlxsRkZDLBMAElhYTmGNG9hwpLW5SHPIszyRdKKMxCXKP2oHAOubW3/7pjf91m/95mMf+9gvf9yXgas7zpwdN/Ull1xy++k7PvyhD/6fv/6b82fP9KgRAHKO2JjKhEGldNwjSOMe4To30KoGXt7uzrnv+I4nTcYTohawo7oyVdO2B0N4huHKVP3St9Y2df2MX/y1yy67dDafV6Ziw/C+Id4IJDqnMaOfk1vrOmt7ZnhlDDOvTdee9exn/92b3zxqqs3NtXvc896vefVrhjdVrlXSQw4lwkHygOtB4K1DQyEZzoLVFOXkJFwQmXUNBFEKx9KTHBI4S74c73cgdbK+yVOKzRDoFg3YkVjtyA4YBfBI5r/JdaZ5WhaSlQWVEDs0ilCpbenHVVJApYJogI3puu75f/AHz3/e87e2j1x++WXXPehBm1tbb3vrW2688cblbEF1w+TERyaowxqbYi5cydHsz+tLq8rY5e4XPvJR97jmXsbA2m7ZtlVVnThxvKpMVY2Wbbuzc+Fgd78ajafTade1L3/5i48dOz6bz8gNCLQD2JvIRMNvZviLw7mBLmoM11Vtna2q+hM33zydTHbP3/nd3/Nv5ovl29/+9un6JlzBjFa2gwndIIErZGo1AbU0xBARUSwfnry6KYTAKAPL6BsnXG1jqMUAtSgwLE04lXpZTl2+tVcaIahxoqlvqsZTOH9q3Rb+X6DZxBLCd/AiQxFxWo7IM2FOvYMFtTH31WBJCgmvx4GIt44edc61XfvRj33swx/+MDlXjZrJZDqdrg88nmygo/Re3uGApHgLhHw8SVRV1e752WQ8OTg4cM7t7+1NJpNnPevZG5tb88WyqU1VmbNnzr3zne/4q9f+5Yc/cqOp6te/4Y1wRLDUG3wh91lIfcKFnIfJDCZ/9WjcLfYf9+Vf/eTvecov/sLPH+wfbGxsWGdDGjcojS4sTKCSipslgRq1c4771lVa4etKPGQGyaNT43i+P4uJ3gXKaCnJgVYNOfwOSf0ZWM9XE4ab9LcoyWAEJunBQgnecmKnL33HU1IIdP0uslxUiZ7lF5V+WWt7cvN4MplMJwFwtLYDUfDj886Tq0hHLnWCAgoNBRG4OXPm7Jd/xdf8xH9+xtVXXTWbLV7xild85CM3tMs5MW1tbV191ZUP+YJHPPO//9YNH/nQn/3Zn91000faZde7pcmWvWCwSCySxtkYA+ec6/qe/tSpy77pm7/ly778K5/7e7/7+te/fn193Vob+d6pFD577fLUK1nDA+AjR09WzXh2OPOj78JAhfUyKE2OYzAjqDiK93JVFMyK49A4fn8NFzJiCkbhXbHU2mo78NzqC3qMErgclBkp63XNVGY6Zf5b2jwEuv/n1bQMbVstxkPRDy0UzCJ7MXkNMccDF0nJ4PF4/LjHPfbosRNVVb3zHW9919vfMppugfqMC0u2I0PXXfcFT/pX/+rzH3jdhfM7bdeOxw0TW+uIYQLO4w0XvRyJAVjr+mkAMztguVi2nTOV2drcuHDh/Ate8Edvfetb1tfW3NAkJpJ1SCJdYttRYs4MlNjRaNTUhre2jzfj9dnh4eCMSIklCGfyleTK09n0wUOqlG4Zap1Y3EgaNYuYL92Ocuw7xJhN1fBxbpdYWUTvB+jolBiMxCUaFZIdKyZSvHKdCHbjRRlbrDr3LJBHHVVQkiOhwi6ayihnwPKMrB9POjvb3yeuiLiueTpd0w7ihojm83nXtVdddeVVV1/d1I2+QgGKIJCOgmGFRDChh8CJTt9x+uZP3Azi6XTS/0lqGJYXyEidjwGXNw0ObjyeVBXx1vbx0WTj4GDfmKpk0py5lqlrLobEKYtHREMcyXnV1orhwAOLUa0+Vlj2f1ygWA4Tb07uHxmSzFoj4DtYlgxFbVTISknpaRSS0B1qYTCVo5EKnxYxF7KVVoCvkhowcEnUyVHm1bCYOYcgH85Ks1BMs1cKCk1n/Fb9KGe5bNu2VQ7GXnp40YlEIusCE9VNMxqNhKRNz4wFEx4QR7a0xyMtu/RDeADj8ciwq4NztPqMUKCjFaF0xSIKA1aJVEZeBsWGWBdeGM5VERrL2vRsZSXsYr2hX6k395MEWt8zhVMcXKQNI9Gl68WfFAYJqKFfZugZkOZs5GVZAZiUuTVIzWGy2y9Z1QIg1tlEqnCnCNqKUmkItHcWzHVdj0aNNkYTfMfCgg5srlxcEyx/hXAkQTlZk4X8kEghE4K6A/EsAdQONiGhJZSWok8ay1gA5M5NQYoIGZBEMoEp+ouQHGixvmIGs8CMprKC2JXA4hFr9iCbUXChijwD5wRM8U9ZYdDC2YHTg5mVcDNRWSWKZRTW9EoeAuvijbTISwc8qCW2svzxql9Bp2QztKEcPYaszRKVMlzgbtG2VSPhl3yWhuKhQCQ2B9K4Jc3j6jFwB+Os1QTcMD7Qn2fiMeV93KQjlULIBSIR+UxJ9w0VoUG5wdiKG9xHVbPsCf2VmLhmCaudeBe6+JrKChrW41ZOLR5FFBWUuwBlpEq/VeTLSuLjQ/cjMhqx2jCMojdhlP0O4eElIRCKzDWSDxlx7C+ahZSSzUmgE+MughkFEhWnzKwYnywAoeBKxio/gpnBK7z49D5xgBEYJ2sSqP7I2Httl0fslNtM+dcW5/wa/OIIO0A/oaFYQ/FggUTbi2RSgIFglCxgxERqmHFrEHZt4hEDac7CsexLHPdY6uH8c0QWw4UIggTrjmDoIwP9Vh8H/lEU6+nAnIkQVGKoRyw1owncLp8UM68+XTJzT7kmxRCEFfZUAG39HRdOSSi5KeDYN1fxOhTYfHiNzlnjrGOp/0kPEaho4ORPVQbagEFD+Sqx3/ZIc1iUqwAku3dYBCJvJE/G7H8UxTy4HMAM9MP0uhATtB7+CCsqmw149xbKfW4lNSyJVGJBtl7dJ4LTz5cFxYBXeaZBjjVZGKRzxnFDXpnqe04Qm5NRHK14CaS5D2C5fMFJXBDnc4DVWPxQOADJ5R7m+fHeRfC1E58IETtrTc/AlAGZyWoG8ukeZz6QvvNBktCijCjT/pcllVVuEZNExaggu4g3RG796o89zmbEk+MANpXg/IGew5RKf7HCrytUZInZaX7je1OlGKAZIiag67f8agW0cI/Tuckw0uhnmbltcF8cUxLYhGTHoWRVIu7c+J6RG4NIS2jpj8oiy2b1L4QtwuKqhMT2w4DWYw0C82CCc53p8ZqefMjaXTKqQ1NG1YpCIGTMJE+/9IhYrmowVI3OoqRgKOkAOI3uyy5HBR1LApFiSRUQ36TsI86zRLUAndILjXXNHfOrIIsS0o8aVBxppb6w3hWMSV2WJFFJzSWIAYSS7qhOPy4Z2hR4B8MLkM4vTKv8qlmSVkThB1WYyFOB1I6BMrQXsnJW+htffLL/N8ZZZwAneAssdSTIaRfx+4QeB2WSWU7TCWr94ZEwpc8XVPqJLK/loW6RlTDkpCVWYxlmDlXecX4Ra2MS1jAmRMgMZIAFqwfrC0Y5G5J+dBw3VXjsnqapkGekVkqsTzhkPsisq21mXWeZfKEGl1PPTqPBWhtajatoh/0/7XXJSG1V0tcG4tI5mMWFS+JpLBgQOZrEouhwTDp9q/90DDtY099SpqeHc+ZqW7j8OI+jl5qmizS8wsqOiUHKd1pmqSBjyXlmaKBoBOpNApiFCgCyy0guixgQBI2Rpp997PtlBgLFTBCmYP4t6mYRgjjM+0v0laA1YBbWSoxCE68O0sLNDV2CsY7kDpU8Z+1AcEPVwkRQ5qAeSltmYRuPHFTLg5ZRWs1lQo8gvEOUtUqbn14mQ9PV1xx1z4Bhw+iZ49rBQFgXmQLwkr5qjr6XZfAm9v4o6R0oM8lKJ8Ay+ziBd6HudF2QSHQ8EaKtAp6g/NxVV6A9bFeXvEGDQwnUn4DOXtEDscCi31IS38aFikT5TLCouZhoxefJUZ2g16Q6+ORMQAWxCvAL0S9AWgUIbynFbEHZPwCBzE4pJKmSYfQqiWxPNgRYaw0ROdsZNvoFC89KDwXK2kEfEnoqzMnLLMBQiOceq8obFIzCCy0wq2EoI76QeMBzuTtElleYzK+QAYOFQQ5DDTcZ4k7VoIUSKrEEXj2QpsEE5RbByU0MkQ5aLJHKVzrC8hZRExzNVkW8BAYjcc6+uVpFKq1KoBFgWeuSCg4oESwLsCRTObuMBZ/MMw2ZxIjR/192cM5ZQ0Rd1wYPDd3ycNEB0wu4uXxIq7MXKxQj8MMRPeYbbmhHsWZFTFhA/BS9bE7zfZOTXzXt0ohMsGuADEsyRL1ET/apzjPcREkjYVVf5vboCCLeDdkjDQMyhd1jqEnVOQBt5R2gT4V1IIcr5IeuAvHkQlevT3TMoa+IUsu4eOThnI6sOXvwwrlToksejeGk3If0Ds4ax+gVwZmbY9CbVuhly0Rkuy4Y4ehd7wJ0h1WWpkJhVZyDpj0BciUHCCnNQYnIwvyFGXqGIVJ1OGmkVox5ZQkbng7k44xOz6xnannxFociTBIXTXET5NVjPhGM4Uj9cVmsZdJJcXHGJRknHPc9KBNsyFrakBjukFzosgcOT4e5BG6UAG0qdDCx12fWzbV3FSpgOKBk4yP20FVd9SPCmog623pLcB6knaIqKGBK4qcIkq4OfUSmlRHUksKQgVnNr1bw1eTvom6fMmP3QlBkdKzi0GVoxvWQAyKi9ARPMMn+EabDAVuOsglFYA2bJWbeIDF8Iu0byYJwo0B1L81NG6tYfCPzNwySeB8LqNlKylY87SBkoyZCTkUJwuDUbSbSH1E07+RstuVXclqqiQNTgNkFjghg2HRt509o2xlDiaU5h5t6VR+ozTr1wCVUiyiBNWlEGuVhaxiIDQiHP8RBpl1zyvNfUmVLhp6y+lvFMYI/NZB4AAcYhNUbhEjBQdJXDXelyq+kKOsZrsW8hw4Nvi9ggKx+HpBPlK7CjHnDUKFkrMFyNQuRWScrRnziNapGoVcZ+l3M6uu8bi22FAP3TgNR6XJjznrRdEhFRJWp2nYZSw7AmWBFh2y9FohHqeGthKjTXMHsuAy6JS4PByApl4grc0UPFE9UlqwMb+QTB0pcKK4lyA3hpspZgwRWLx9x0Ji59cKTSQggNR4WFaLqFTnE/8lJeNB26tubORnjkKaPC6oVwkKFOpuSZkkNtJKouaJtfpHyKSxW5CeWYOxgSrVHpAAF1uuZ+aJ8vkGQwLbzCxpwtmuNMeKx+9qQ45QoiVAmyeiX2AhWZSkIsy2AssEo5EyDk9QsJyvfRN3AEsyAGrpw2qSqvceyuQ5h18mHqahtyihWtaEczbL1Qw9DWo5cpZKEC+HQZAG9eA5dbNFiEcuSniYLdpY0CuRusYVnxJoaQNJwKxndB/wNq4UGyT8WW9gbtyF6llHe50E3Hkxl4ItEYYaua6n3FuyBDmMqIfQsAhNAxKfCRyp1FJr2V+hbkhltUsqJESWK7gsS35NxOAIPS0AnQrJnoPitys9UD7tyTxGRqIp43qbnierdPAU9TdeTGZPMmuNBCYjBeUyvHgcOL86E+mWoT2LqHMm8KkkMY3Vo63Mmu30BMYcpThkK/AZCJE+S2AnQHzqjPIvhIu1MfICDkZWz3bCg+x/Ttcu6qnpat563x4GcF8dQzplUeMTgMaBXJRQoqisl6JXEhSIw43dyGuyV8CshYPDIblDkWxblbhm9XgX7DtveU4AQiQuFlle2n5xqNMNcn5HM/0tbuVDHDRUVRxlE7/Ump20h9DJDWTjIG8DZEtY57Ii1uGArKATQf1+nWiGJSSNno8lzTfcskOHDBfQMYW5RVVXbLTGokghEtGznpjK9ZRutmOFxdK6Xt1jI71O4QMIzAJPibyfu3JxkLbAahgbiAxtWMxyp0kppqKwHHmVqEZdBFRa9U9QuyBRyTsZdLBGuSNPgxLJV9oYeVeOhtuVs+Gf8FvQfAbO+qeRtlVO8RSXm8gBsjggRF6k6Wu8u6xVKeFCya2bR84RRUMjU5TSNkLMuM8YWSF2gGIVyMuglorpuuuUioI9ERO1y2bv4ENRVrYZ2St0E1mVEdtsn4cpciiFLB0uJmo6EdFFaXqbewKUyyTMkWEw2QFGRjGygwaJco4QqJPgXkPBNYYwzWJsEjKjn+4iNCN/uBSgFwpwtqcagy0foRYcSNwPBWyWen/EBcaqXE3iZh2TylcY54SIMoeLQF8xYwfVKZvRDunbSGkszk3Sui4QYB8EDqipeLucDfjfMwZzturau6yJlhPX8owSvoNQAc0o0Sh6PtLBA0BmCFdUd4lBzlCxeUQOukhkxKbZxJP0ziQlGGOnRCpZVQA9F9SxU7eRrD1bBwwzmhFTEEVHR5lZq97GGq6TFZX5QccbjlTxw2UVIAZHiliT+NCvgY0rtMGQhAwlWgMvHnKgz4NlmQaDORYNA8UkL6VAAUnoX5uViHnbY8DVtO2+aJptLUJwe8UV5dAArhqsSGIkKmNMPIkGXw1vk6HNagq6SI6vQRcqEblGjsrDSFgUFyWAnQWVArKwQygoIdn7KhczYGrHIAmlAjRXjVUzUGFAwK7Ho7DQ0zKRLADHqSt1nRFwZQ4CmuRoSqQYeHJ+MttNjNbKDQjlZ033VnhqYAvFUQKDsi+WUce+0CBJEdVP3TsFyQYOIlvPDpq6zMSv0NuZ0vYZ+NRyWydpX4IaodcOX+i+EKpWi8aLoEHT61xBOkNbJsvQCUdFk16s6vIyLWFgeqHNkiCQSkUYcENZAKYGyCQh9NUItqcf0/rkr1wnJBZBHlU6po1LZnAOzeaqGnMxBdV6cuGhDc2AKQa6J0Y1nASJFtAVBB2qWwN7RAuSg+gsQFSEyZQ4g1xCaerRczsL+jrk+y+WcCJWpkJ+B8K6LKJnFlciAKekzk8PF3S312UCqXRSjhCTCOh7AydWWSLPynkfPVknzwhI/aEJuk+qRO0jRIIrAe9hsElpl1qwmybL3xSitkCMPDtRadih1uLH5QT5VU5QUVvTSoDlX3HRfC3KZDwwQ5dIxdWiFoyVswqFhSBnYRU13UVHLHEmOXFXV/PAgnBMmfMTOueVy0YzGMeqPaLXxAhfkS6V/E5POhF66oFVLjxCULEyS6UbunycCR7yv0yqupZ/gKOQY+cHm3dXkYNgbZokpuFIvqysMiekLF/s8iV1AT3tZDkfEVFmaIiU+IJy1ZWFaH9gmgNrePfrnxTECFsxEKVBDCD8DUGRlQKKMUspRkgFo7RIKAs40KNv3u01TA92yXUiqZPw1n+33Tk3qbcoijzNas57kl15H2HeGkmsue5ayXgGvwtN6Xx7xeSW+t2JUIbstNd2VSFypFYH+8HwXKEok/WQQK/Ey4SW2p+rIKzlGiFiOMLyUWlCxSbSDC0QoOScGeUi1EIK46KkoCT+AV4xOJPcpcUEoMyuTN5hak6RC/XSkos/UqA0EMBqNF/NDeQ4ZWajNZ/uGyVRV9BNiopTwQJrPTqXOVMBkXGQjsSbKJv0ey8Gm0IfoIYzgxwbitAeqY7eSgzNK/g5KAmEByKEB5xPzWAMhfVN+JXkGB5dp+L1zSFbYq15FcHpQpDUzp2R7grbXS/wxFOafrJsYQCPbYQRGfUYLSkbgRV8/lmT0JA5BPsqBDAgOtT9Hmqqm5sksMmauq+rwYE9+OCoP2Vo7n++Px+McbNGW5LJV5IhFFN57YZycT/bKw8B0JM5yHbIa8GPFFBbKU7iEB2UDEu9gFgsMF09LnQqbmNdwqSzntEkikUGQsNizj0uBRcwBkpLqbSiARQ8+IVlbnHINVnWUoDQdOCLZoY9XY/7YWRafXVR6ZWR4SPeOqBYlcKEpVIAAgLppnO2Wi5n8kUnYKx3u746aEbOSWBTwoniK9PvYMUEGz6KMsOccBU4Pkpw3Y1gsA8jhPBfoomGcUKRVkprKIcG1gfRP4r6ND03dhRwVrJyNaMrsHY5cTVBCPCs42wmtpOJwQixUiZb4aiqWiIV9A8o2GnxgpCbbePcITj+rHAVYjesyJb5FCW4+0IBEHkw2+xYs8EFsPRqNDw53k+dlkh8+nx/CdU0zkkPKePFrYRHkc1ScDs2Hk26ByjGvNJUuG5cFoouAtrDKawa8spCNPCF9nHJSwpa+BCXGTn6/CtyX4wi9RF6iOFYOvGk9v5HgeMkbJe+eE/cnFJEXaRScE19L8xrRSCEdPCYUBWHjlo+BVvBQEyN8lhK/RNA5/GddNRXz4f5uUuqY9OQlOjzYnUwmQXtF0pYwtHRMINeTBLQgR9RXSD4j0kzCrDbgjGiWohyMbJCv58OCv04r0B/kUClKJnGgQCDJvxlKqwXSTJO1yxdJcrC+WTjY30bTxQwtLN1dBaO04OCxEn5CHM3Go6nAlBDnQuBqp3WEcsyMub3KJyhyZ7OTp/fS0AMZMc/Vs27dUBEmk+liceicTb6ryc/Cg4MdY6iuG6eQDsQZHpnIG+eELApWik2JeqKErMq2LWHgcobWpPMmoU2PY0Dpw8RUwFBzSYJCC4CLEe3U64IOd1T0RD0ARCLvJz3M0CqV4q0tB/SqN0wwdmaluuZilawnNyXtBCdtOWS5FIOYomQfJUBKTl70840J6eC8HElhTTlJ7rdY09T7exfyTtTkp6Bz7nB/dzpdS64BbakraBkJBzimuKqRLHLOMQvBT9n3DCt4JZRqW7IPgBOLzxKspEtOktmDGuVOcgAl2S5RwgSIhPTEPo2RlHReSpO7yteTYnPlVDXdFKNISFHMrXznqDmkD2jwBNUAN2pm7sWK54RVkxN+CondBQ1BwkyHw2Sytpgfdu0i/9GmWLDu7Z2vKq7rRqaFKggv6TbyGDYx99fgR8J9YD0v4ai8VmIefbJzIkVRtvpFQBGFHjwYuXBq34Kky5Iu5xxdD2OZVMQfQQINyjHZ1T6cXIDFUWB+pRoZIYvjIQS+eEKwKDQk9M8qS5Qy83dobtEqxGTF1JiGUENOAHJtGK0V+cl537t8VWY8Gu3tnCmWVFXxFQGOidfWtxeLObMhie1C6J5Eike09IcQcRXTWQJyIgWUgcOjQxBx8Qv44maWqldlMWpl9QkmZvxa1skpG411+1+604uR6bLiSNcahHglHUfrPenV6dF2GiUUxa1aZiw4VDGhhNNeViLSgY2d77VEPcXZbV+o11INZkIbZBlek1MeHdza2nq3nB3s7xQff7VqOSyX8/WNLYCt7QwbmaOjfJhATKs9bbmkoJOZNml1ymlMpAob1+ngzCvOhHz2y7EdLa1BPxlOpPLyFXLpC7lMPfCNjnLoEuZcnJJDRBYoU5G9EAfHrDzukwzhDPbOPwcWBP4hmoS1Y/IQcBRvSGnmwSJ4SXmM8iq4f+WvsrpH5iDmzW1V1ZPJ+PzZ2wpKlGLJIe+CnQtn1tbWuLTFaBUqdJFzEnE0GzKzkjEodACrmAWokkFwoBNRU7EYXxU4JEN3I108hYLBurxKOuDS99fVuPBdgPbUcMEuI0zGBWkkPck48nyGMp6lPVdvDASsrFFkmcWcXfpgRpT/QlmMa7xGNAeRZsScKtDUsxBknsyklPkiAIAkjwBYX18/3L8Q4o7yusZcZC3OZ/vL5eHa+oZzyK8Y0n7iXAABxPCvJ7sDpNI8CyP8jMMJLSw1srTVKzNG5mDVg9S0I53rUyS4y/3IWhqInH8G9W6kIT+tyiDUX66ZOyu2i4BuwRlkGMJm0s5XvR2ptpYiurBwnejHsKLTQ+AZDPwtDVXFS+6iDkI6wAyCxiZPQnLOTqZTgt3bu3CR099c/Hy9cO6O8agejRo4JwtP6FTL9Cgo9EgQTELJrmatA0Ligp9IuVKLDoYwcwCE835CHFK28OKyL9Yt0UImc+1iWg2UF+rqiOAX4nzARJk+L7P6Q8qfYJGPGahZXKixksFH8cLiQq+M1KI4Sw8SzRYnQ7HMOCq2TCVBf0a85FWMecPV2nTt/LnTdNFI0+quABdnu3b7yPH5YsZKv6NrVea7KpCiIo/THNAYUcwqpDVRsIkrQlCH8yN2NfrFRTBMnFec2f7ml0457zV5KkkjHx3F88SRFTF9JMiescRWn0zytaJzC9TY9N5kTngJKLXtrAcCsTFgEc4oh6A5V0CzqJmYVvWCnMV0cWLbysyA29rePty/cHiwe/EVW91V3c5tuxiNRmtrm/P53HCVvHEkbZfq+RJ7SmETviIEVVM+OM8d58Ks5K67D/3vkDg1DwmdGUWIkbpkCyKBiMzQ1YUn23Out9XtExdiyGW4maJNaOonU2Y9JFxqZOYgFxo21WWHZiA1J1EOTxLlYD8vl1nIGSQb42A9xVrZVufD3PCx6rlyb2OOtbV1wzh75ra7fNzV3VgRPJ/tb2xsVVXTtgtmwwr20W8L+dmFbJwigsDDXIvT8ww6r5OjzXnev3MytREh1JxhHgntSsXc5wQSkcuLhItZDqpiShPC+S4b/1KsejwTL+KtzNKSUR/UMowExMVvEPdsflFwSasizzFd5oC15rYI4a0a94TRN0TQH/cpoEDdNNPp9M47boXPb74IhFLdzeNtPj/cPnLMOmetFVTEYIbGARiDOBmEuEgin/GUgtYjsVhiwQlGQfNp1RtQcaFDHQy8YpRfWjkUpdN6M8bZTgYpCjhVcmjF6Qgiw9FLH4VnHMctzNIFTADfnNVOKwi3CeNOjpqpcFsmuBB0RhVnU1VOsorV5EUajqkPOQpzQs7XCrRaN5LxHuhXM7PZ2to+f/bT7XJ+dxZqdZdlZv/LObtczI4eO9l1rXXWhEks5zg660/yYqrDJKsRwnRZGVapG5svWiJp4I2RpjZT5DNycvwLq1wu5/oRKS/N3Hde7HCdkcrZIhyuEWjnizT7qwjyxlLEeziBVUOaCCM5Ofd1X0OSNaVmKMxhHw/T8qCiA6RnBxT4k0wmmFZ30jonkFO7daIjR47u7Zw5PNi9O7Ul3/0TmoitbbuuPXLkxLJdOuc4JK1HeQaX3wKvMCBX5y1IZzaoSlHI9xL5v0gjKqCH6pwuPWSKRlmqdQre2yl0AVkhcZlwwjKAstipsobSdU+bN4rJ6SbcJbyvzfB6TIiFLwKL+YWtJ4IJ6iC/l/wHWnjIF1GUUprDWajkvWwsjY0H3Pb20flsd+fCmbsjTfjMSo5+W7bLBZzbPnpisVh4t3OUxbLMisPCilcULvRstStr08gUSqcBYgQZU7dZXfC6gZfaEkE8wcrRHzxclJSp5V6XIy0rtW+RBhyZ8W1ejIvQO9KGq3J2Jstmzl66UG2tmskPHUHgAHL2pliSbzhNiZP13t1YO2A91YzChnBm+DvGvy+3vX2kXc7OnbmNPpNfFX1mv3i5nAH2yJHjy+XSwRnOQOXoiBnEU5yQCVeMPTnrIpRFtQqiQaT/DZmQsbpgnTvOGiajkm2IQrtUkjrJuKucpaES2VY3fKpP5LSOSZaJxEdZJniyipkXujFWKnHo0joaJGQDnBXlm4gp5RWVyoo6lRUWqS3AYvi6kLRxyFNg0TviyPbRrp2fueNTd3N6Hj79z3RBEzMvFjM4t3XkRNe11jnDJqPAcOZnJnKwBVahg8F1tgWJ41/mQvRlBCPkGHAgH6TxA0QFYrDcgR5FzFY6UtVNknZXnK4rU0ZWU/wyQbmcps1Jim58+yCTZNcV54qs9xmSQDe5YZJk1ozLIkwSMukUfwZrxiNREalizmgLnnW8vX20a2d3nr717rNAshOaP+Nz2nbL7SMnnLNd1xXWtJxrxoOV07mKbJ10XaKR2uBdpDW2LNFtWS1r3VOqh2MI8WwhdA7pQQ7otpVWzZP6fC85u2NtxpUDHQn2K7ZzdpxnS1k570vyBPIYZD2RVtxJxe7muwXw891cYKr+9O8LycisX839hX/kyLHF4uCsOJv5c1lyqIHLcj47cuQEs2nbpdfEQQg4OAbpxGYuSS5MOZmACJhk1UULkjtL6SXSEkDlD+ujUbrLcYFZwWDJOIJUpIjbPu2C1eISQ43oqgqZ3CW3lyhRA36QxZLoQVr4mFLOBK1Is07mbhxNLJJriWUSxd1hzK1k8ID0x4QE0YuDC2Yiw4Crq3r7yNHD/fPnz57+jH5wundA/9RVTajr0YmTlwPV3v6unA9B3FOx74j+2lh5a8sw7UxFm0xsUO7qOAFAkpaaBY+oYDcRI1UVdyLY7InKArziyFQJgFjB/YjhOqnFAEvRfyrdKkK5q23uShUv9FwmiezKxra4Gz8rTomRfSJJBhG0EooYzrnJeLK2sXHh3OmDvQv0z/jFqyrBz6iqPnb80sl0c29vz2d4Fn1H1P3jl3uKfwlCHuSJlaIpwh4Y2sU8gKbp+9O5xBnaDB8jjxXDQHUySlxxeCzlBMBkeC1y1uCj4BKYiOXhD2mSGjw6wXfvIvaNbAA1LoINR0oAiul7d7dqRqllQaQYODFxGxb3+vpmXfHZM59eLub/jBP2M8OhL1bNzA73Abt95Bgb07ZL3fSvKMu4+F1RGJj6gZuGSqChCRKU3Jg1gDT0SQziZG0HTll9hSo5NFEgzeyVPL4M7lCpzFl+tewmkmBuMXf0UiswK1dDTro51e/Gusx3zGCKl6TsU2K1HQkYictf+dLMzyrm1WIeVhQCIsA1dbO5udl18zN33Np17WfazH1G/eI/pfw4dvyUqcYHhwddu2RjdNfByembNune/DYEucYZmCYsIIHlRGbjivoRaZGRMiAiPwZRWK+AX8E0g+8QUJI8Bs9m+LNcL+joRo4StJjf7Jx6aSPbcWm6LFY85btx9g2dRIQoxRvRyoDCABYr60P9J85ZZp6urY+beufCmYP9nc/WKvxsLej4ftY3tre2T1iHw8N9Z50kREAUovmjk8mfUq4gYNW0Go5LGso6LTkeVNEWy1MlW4sZqzykVSAfGEV772Acnv6YUtXMKdwN6ftPIuRHlMwAl6as0BbnsYAJbwep3x64ZJITMVJdI/g43XznA+ohlESEgUEuejP9RvpXPh6PJ+PxYnGwc/6MtR19VlfhZ/9XVVXbRy5ZW99eLNvZ7MBZ2y9rRH9gnTSYxK96spz4FH2DP9y64eaP3wB5LApzUpfn0wWR68WxpNCsMKTfssz2kJ7sF8t3RjbaKx0N8Eaq8mADZPL0ReScq1vEhPYRbiKWTKPwBlXCbux74snNoPLYNev8hg9oNB5Pp1PbLS6cP7OYH97dY/Ku+9/P5YLufzXNePvIifFkfdm2s9mh7bpEdsY+DignPSRlXDiuMKi3WSEYibhPVSDeXV5pSrUYE2GniD0QWc/sLYHAgvbBRWsmpNx/4GKf+UULUmWAS8x3jXAAKSlQHM0yt155VEF5KoTrh9MrKFKVg/NVmbsDHSLX23oZHo8n0+mas+3e7rnPVo3xf29BB8xuNJpsbh9vRlNn7Xwxb5dLEBljOH3mnERbcdJtxwtduc0wsZxIB+QggRTiLZgkXLD2P4p3hrL19CUNi6xd5ZnB7LeFrK39+YcVJ0tWb6QtsiiEKIaachl8kK+NU5BM+SjcxTmnNOWB98cM6XcM0RKwOOTjmnbOEVDVzWQyaZoRXLu/d+Fzt5Q/Owv6rpC+4Z3XdbOxcWS6vsVslsvFcrm0zkLGzqrCIfpUROF1Yi4k8e54ionqAaXZiTo1BZKFxEEZrJlfpDKdUk7wYNpJlPd5Ik4F2REbO8iBtzrQAxNwJh8XCljGw4damyj5V0CGr+RFMEqPTZ85USlXhG6ZRWg0wMY0zWg0GlXGLJazg70LocAoDNL/f/+EXtX2Tacba+tbo/EUQNu2y7btug5wrEe7PECnnHT1oW5mUp9xqb5Kpo1QMVCJ7khXjarrUyuc1PxdHMPFYaU6ZC96m3khLQuqBgQupIYUElKLkYRFMWR2ILPMkwtluoY4IoOM4xxKK3g4U0UPxDRTmaYe1U3NzNYu54f7s8P90PbJocH/35UcxXAGb7NuqvFkOpmuj5oJcwWCtXbZttba/p5SlL0YpQMJg+lPh+PHOgTKg6U2EcmIA/mU1B/8qZA0qRmY1CWQ4uZIcxjDyB/p9xQrNGjGKPnu6ZyQMxfpnq6mIdHMQJI8PV8XuJrYytDZS+H+kaOrBKEzbKqqqpu6rmvD3AdeLheHs9mB7drP1pF896ctTP+cycw/72f3/3w0Go3H0/FkWlUjU9VE7OBcZ62z1jlnHeBcH7mpqw7NWxCLN5kdKoqDP058sVOKgg6qFVGJcGQ9xq40rqSkyeNVozUZlQK/lNN2grkQqcZKR8vRrDJi2pwCO1m1Lru+hKStvCn7fegSjysmYlMZY4wxVVVVVTUYbjjnXLtczBeLWbtcOOf+6cvhs3hCf0aE7c/R4q/quqnHzWjUNKOqro2pB01uHwwxxF32vwecc4jcD/hoTMSCElLUKO5+dd6oMKkAuHp8Toa/cwBWRBA2tPogmhaIYEvQ3enGYnMcqHJgn8aenJCcWKmm/bNmGalyg4LGyHAQhAJkDBOzIePnr2QMMzGb4AvZt8XO2s52Xdstu3bZtcvOn8TFC+1zfCD+80qOi/+wfx7PqdxbDkeBqauqMlXVHw1sqj6lvI/FNabqDSYjDNLXJxABB70cXkyqtYobsoHrz9/eLyqc17F26TWwq9+IUoTG+4FF5GYCRFAaDyrplobT0SYE8Ajh35htmyBvDDvcGBOWv+HgazecBf3h6pwdDhC44Zq0nbOdtb1I2l4cG7mb6+dzdHT+vzi2t3MSXjMtAAAAAElFTkSuQmCC";

  // Mobile detection: coarse pointer (touch-primary device) + mobile UA
  // Does NOT use window.innerWidth, so landscape/rotation doesn't break it
  // "Request Desktop Site" changes UA to desktop → correctly falls back to desktop mode
  var _isMob = function() {
    if (typeof window === "undefined") return false;
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!coarse) return false; // mouse/trackpad primary = desktop
    var ua = navigator.userAgent;
    // Standard mobile UA strings (Android, iPhone, iPod, Mobile)
    if (/Android|iPhone|iPod|Mobile/i.test(ua)) return true;
    // iPadOS 13+ sends Mac UA by default — detect via touch points + screen size
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 4 && Math.min(screen.width, screen.height) >= 768) return true;
    return false;
  };
  var ms = useState(_isMob); var isMobile = ms[0]; var setIsMobile = ms[1];
  var isMobileRef = useRef(isMobile);
  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  var kmState = useState(function(){return loadKeymap();}); var keymap = kmState[0]; var setKeymap = kmState[1];
  var reverseKm = useMemo(function(){return buildReverseKeymap(keymap);},[keymap]);
  function getCombo(actionId){ return keymap[actionId] || DEFAULT_KEYMAP[actionId] || ""; }
  // Mac system/browser conflicts - full shortcut strings that macOS/browser intercepts
  var _macConflicts = {"Ctrl+Q":1,"Ctrl+H":1,"Ctrl+M":1,"Ctrl+N":1,"Ctrl+T":1,"Ctrl+R":1,"Ctrl+W":1,"Ctrl+Shift+N":1,"Ctrl+Shift+T":1};
  function kLabel(s) {
    if (!isMac) return s;
    if (_macConflicts[s]) return s.replace(/Shift\+/g, "⇧");
    return s.replace(/Ctrl\+/g, "⌘").replace(/Alt\+/g, "⌥").replace(/Shift\+/g, "⇧");
  }
  isMobileRef.current = isMobile;
  var kbv = useState(true); var kbVisible = kbv[0]; var setKbVisible = kbv[1];
  var _betaKb = useState(function(){try{var v=localStorage.getItem("tabkit_betaKb");return v===null?true:v==="true";}catch(e){return true;}}); var betaKb = _betaKb[0]; var setBetaKb = function(v){_betaKb[1](v);try{localStorage.setItem("tabkit_betaKb",v?"true":"false");}catch(e){}};
  useEffect(function() {
    function onResize() { setIsMobile(_isMob()); }
    window.addEventListener("resize", onResize);
    return function() { window.removeEventListener("resize", onResize); };
  }, []);

  var ss = useState(null); var song = ss[0]; var _setSongRaw = ss[1];
  var undoStack = useRef([]); var maxUndo = 50;
  var clipboard = useRef(null);

  // === MULTI-DOCUMENT TABS ===
  var docs = useRef([]);  // [{song, ati, cur, sel, undoStack, dirty, title}]
  var ads = useState(0); var activeDocIdx = ads[0]; var setActiveDocIdx = ads[1];
  var trc = useState(0); var tabRender = trc[0]; var forceTabRender = function(){trc[1](function(c){return c+1;});};

  function saveCurrentDoc() {
    if (docs.current.length === 0 || !song) return;
    docs.current[activeDocIdx] = {
      song: song, ati: atiRef.current, cur: curRef.current,
      sel: sel, undoStack: undoStack.current.slice(), dirty: dirty.current,
      title: song ? (song.title || "Untitled") : "New",
      scrollLeft: sRef.current ? sRef.current.scrollLeft : 0
    };
  }

  function loadDoc(idx) {
    var doc = docs.current[idx];
    if (!doc || !doc.song) return;
    skipDirty.current = true;
    _autoSaveSkip.current = true;
    _setSongRaw(doc.song);
    atiRef.current = doc.ati || 0; setAti(doc.ati || 0);
    // Clamp cursor to valid range for this document
    var docCur = doc.cur || {measure:0,beat:0,string:0};
    var maxMeas = doc.song.tracks[doc.ati||0] ? doc.song.tracks[doc.ati||0].measures.length - 1 : 0;
    var clampedMeas = Math.min(docCur.measure, maxMeas);
    var maxBeat = doc.song.tracks[doc.ati||0] && doc.song.tracks[doc.ati||0].measures[clampedMeas] ? doc.song.tracks[doc.ati||0].measures[clampedMeas].beats.length - 1 : 0;
    var clampedBeat = Math.min(docCur.beat, maxBeat);
    var maxStr = doc.song.tracks[doc.ati||0] ? doc.song.tracks[doc.ati||0].numStrings - 1 : 5;
    var clampedStr = Math.min(docCur.string, maxStr);
    _setCurRaw({measure:clampedMeas, beat:clampedBeat, string:clampedStr});
    setSel(doc.sel || null);
    undoStack.current = doc.undoStack || [];
    dirty.current = doc.dirty || false;
    setActiveDocIdx(idx);
    forceTabRender();
    // Restore scroll position after React render
    var savedScroll = doc.scrollLeft || 0;
    setTimeout(function(){
      if (sRef.current) {
        setViewW(sRef.current.clientWidth);
        setScrollX(sRef.current.scrollLeft);
        sRef.current.scrollLeft = savedScroll;
      }
    }, 0);
  }

  function switchDoc(idx) {
    if (idx === activeDocIdx) return;
    if (playing) { setStatus("Stop playback before switching tabs"); return; }
    // Save inline title edit to current doc before switching
    if (editingTitle && song) {
      var s9 = Object.assign({}, song);
      s9.title = editTitleVal.trim() || "Untitled";
      s9.artist = editArtistVal.trim();
      // Save full doc state with the edited song
      docs.current[activeDocIdx] = {
        song: s9, ati: atiRef.current, cur: curRef.current,
        sel: sel, undoStack: undoStack.current.slice(), dirty: true,
        title: s9.title,
        scrollLeft: sRef.current ? sRef.current.scrollLeft : 0
      };
      setEditingTitle(false);
    } else {
      saveCurrentDoc();
    }
    loadDoc(idx);
  }

  function newDoc() {
    if (playing) { setStatus("Stop playback before opening new tab"); return; }
    // Save inline title edit before creating new tab
    if (editingTitle && song) {
      var s9 = Object.assign({}, song);
      s9.title = editTitleVal.trim() || "Untitled";
      s9.artist = editArtistVal.trim();
      docs.current[activeDocIdx] = {
        song: s9, ati: atiRef.current, cur: curRef.current,
        sel: sel, undoStack: undoStack.current.slice(), dirty: true,
        title: s9.title,
        scrollLeft: sRef.current ? sRef.current.scrollLeft : 0
      };
      setEditingTitle(false);
    } else if (docs.current.length > 0 && song) {
      saveCurrentDoc();
    }
    var blankSong = {title:"Untitled",artist:"",album:"",transcribedBy:"",copyright:"",tempo:120,tracks:[{
      name:"Track 1",numStrings:6,instType:"guitar",instrument:25,bank:0,isDrum:false,midiChannel:1,
      volume:96,pan:64,reverb:0,chorus:0,transpose:0,capo:0,pitchBend:0,modulation:0,trackVelocity:80,trackExpression:127,
      tuning:[40,45,50,55,59,64],letRing:false,hasTopText:false,hasBottomText:false,twelveStringMode:false,delayOn:false,octOn:false,maxFret:24,adt:0,
      muted:false,solo:false,measures:(function(){var ms=[];for(var i=0;i<32;i++){var bs=[];for(var j=0;j<16;j++)bs.push({notes:[null,null,null,null,null,null]});ms.push({beats:bs,barLine:"single",beatsPerMeasure:16,globalBeatsPerMeasure:16,isATR:false,timeSig:{num:4,den:4}});}return ms;})()
    }]};
    var newIdx = docs.current.length;
    docs.current.push({song:blankSong,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:"Untitled"});
    loadDoc(newIdx);
    setStatus(newIdx === 0 ? "" : "New document (Tab " + (newIdx+1) + ")");
  }

  function closeDoc(idx) {
    if (playing) { setStatus("Stop playback before closing tab"); return; }
    var doc = docs.current[idx];
    if (doc.dirty && !window.confirm("Close \"" + (doc.title||"Untitled") + "\" without saving?")) return;
    if (idx !== activeDocIdx) saveCurrentDoc();
    docs.current.splice(idx, 1);
    if (docs.current.length === 0) {
      _setSongRaw(null); setActiveDocIdx(0); dirty.current = false; undoStack.current = [];
      try { localStorage.removeItem("tabkit_autosave"); } catch(e){}
      forceTabRender(); return;
    }
    var newActive;
    if (idx === activeDocIdx) {
      newActive = Math.min(idx, docs.current.length - 1);
      loadDoc(newActive);
    } else if (idx < activeDocIdx) {
      newActive = activeDocIdx - 1;
      setActiveDocIdx(newActive);
      forceTabRender();
    } else {
      forceTabRender();
    }
  }
  var _undoLabel = useRef("");
  var setSong = useCallback(function(v) {
    _setSongRaw(function(prev) {
      var next = typeof v === "function" ? v(prev) : v;
      if (prev && next && prev !== next && !next._mobileInput && !prev._mobileInput) {
        var lbl = _undoLabel.current || "";
        _undoLabel.current = "";
        // Auto-detect label if not set
        if (!lbl) {
          try {
            var pTracks = prev.tracks.length, nTracks = next.tracks.length;
            if (nTracks > pTracks) lbl = "Add track";
            else if (nTracks < pTracks) lbl = "Delete track";
            else {
              var pMeas = prev.tracks[0].measures.length, nMeas = next.tracks[0].measures.length;
              if (nMeas > pMeas) lbl = "Insert bar";
              else if (nMeas < pMeas) lbl = "Delete bar";
              else lbl = "Edit";
            }
          } catch(e) { lbl = "Edit"; }
        }
        undoStack.current.push({data: JSON.stringify(prev), ts: Date.now(), label: lbl});
        if (undoStack.current.length > maxUndo) undoStack.current.shift();
      }
      return next;
    });
  }, []);
  var doUndo = useCallback(function() {
    if (undoStack.current.length === 0) { setStatus("Nothing to undo"); return; }
    var entry = undoStack.current.pop();
    var prev = JSON.parse(typeof entry === "string" ? entry : entry.data);
    _setSongRaw(prev);
    var lbl = (typeof entry === "object" && entry.label) ? entry.label : "Edit";
    setStatus("Undo: " + lbl + " (" + undoStack.current.length + " remaining)");
  }, []);
  var as2 = useState(0); var ati = as2[0]; var setAti = as2[1];
  var cs2 = useState({measure:0,beat:0,string:0}); var cur = cs2[0]; var _setCurRaw = cs2[1];
  var curRef = useRef(cur); curRef.current = cur;
  var songRef = useRef(null);
  useEffect(function(){ songRef.current = song; }, [song]);
  var setCur = useCallback(function(c) {
    var tapX = c._tapX, tapY = c._tapY;
    _setCurRaw({measure:c.measure, beat:c.beat, string:c.string});
    // On touch devices WITHOUT mobile keyboard, show inline input popup at tap location
    if (tapX !== undefined && tapY !== undefined && 'ontouchstart' in window && !isMobileRef.current) {
      setSong(function(prev) {
        if (!prev) return prev;
        var existing = "";
        try {
          var n = prev.tracks[ati].measures[c.measure].beats[c.beat].notes[c.string];
          if (n && n.fret >= 0) existing = String(n.fret);
        } catch(e2){}
        return Object.assign({}, prev, {_mobileInput: {x: tapX, y: tapY, existing: existing}});
      });
    }
  }, [ati]);
  var ps2 = useState(false); var playing = ps2[0]; var setPlaying = ps2[1];
  var pas = useState(true); var playAll = pas[0]; var setPlayAll = pas[1];
  var playAllRef = useRef(true);
  var atiRef = useRef(0);
  var pps = useState(-1); var playPos = pps[0]; var setPlayPos = pps[1];
  var playPosRef = useRef(-1);
  var ms2 = useState(function(){try{return localStorage.getItem("tabkit_metro")==="true";}catch(e){return false;}}); var metro = ms2[0]; var setMetro = function(v){ms2[1](v);try{localStorage.setItem("tabkit_metro",v?"true":"false");}catch(e){}};
  var metroRef = useRef(false);
  useEffect(function(){ metroRef.current = metro; }, [metro]);
  var mvs = useState(85); var masterVol = mvs[0]; var setMasterVol = mvs[1];
  var zs = useState(function(){try{var z=localStorage.getItem("tabkit_zoom");return z?Number(z):100;}catch(e){return 100;}}); var zoom = zs[0]; var setZoom = function(v){zs[1](v);zoomRef.current=v;try{localStorage.setItem("tabkit_zoom",String(v));}catch(e){}};
  var zoomRef = useRef(zoom);
  var autoScrollState = useState(function(){try{return localStorage.getItem("tabkit_autoScroll")==="true";}catch(e){return false;}}); var autoScroll = autoScrollState[0]; var setAutoScroll = function(v){autoScrollState[1](v);try{localStorage.setItem("tabkit_autoScroll",v?"true":"false");}catch(e){}};
  var autoScrollRef = useRef(false);
  useEffect(function(){ autoScrollRef.current = autoScroll; }, [autoScroll]);

  // Auto-scroll during playback
  useEffect(function(){
    if (!autoScrollRef.current || playPos < 0 || !sRef.current || !song) return;
    var BW2=18,MP2=3,LW2=48;
    var t2=song.tracks[ati];if(!t2)return;
    var px=LW2; var posAcc=0;
    for(var mi2=0;mi2<t2.measures.length;mi2++){
      var m2=t2.measures[mi2]; var nb2=m2?m2.beats.length:16;
      if(posAcc+nb2>playPos){px+=((playPos-posAcc)*BW2);break;}
      px+=nb2*BW2+MP2*2+1; posAcc+=nb2;
    }
    var zPx = px * (zoom / 100);
    var sw = sRef.current.clientWidth;
    var target = zPx - sw * 0.4;
    if (target < 0) target = 0;
    sRef.current.scrollLeft = target;
  }, [playPos]);
  var css = useState(false); var showCheatSheet = css[0]; var setShowCheatSheet = css[1];
  var ctxMenu = useState(null); var ctxMenuData = ctxMenu[0]; var setCtxMenuData = ctxMenu[1];
  var sts = useState("TabKit - Open a .tbt file"); var status = sts[0]; var _setStatusRaw = sts[1];
  var statusTimer = useRef(null);
  var setStatus = useCallback(function(msg) {
    _setStatusRaw(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(function() { _setStatusRaw("Ready"); }, 5000);
  }, []);
  var toastState = useState(null); var toast = toastState[0]; var setToast = toastState[1];
  var toastTimer = useRef(null);
  var showToast = useCallback(function(msg, duration) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(function(){ setToast(null); }, duration || 4000);
  }, []);
  var sels = useState(null); var sel = sels[0]; var setSel = sels[1]; // {startMeasure,startBeat,endMeasure,endBeat}
  var oms = useState(null); var openMenu = oms[0]; var setOpenMenu = oms[1];
  var _cmdPal = useState(false); var cmdPalOpen = _cmdPal[0]; var setCmdPalOpen = _cmdPal[1];
  var _editTrk = useState(-1); var editingTrackIdx = _editTrk[0]; var setEditingTrackIdx = _editTrk[1];
  var _editTrkVal = useState(""); var editTrackVal = _editTrkVal[0]; var setEditTrackVal = _editTrkVal[1];
  var _instPick = useState(-1); var instPickTrack = _instPick[0]; var setInstPickTrack = _instPick[1];
  var _instPickPos = useRef({x:0,y:0});
  var _midiSum = useState(null); var midiSummary = _midiSum[0]; var setMidiSummary = _midiSum[1];
  var _welDrop = useState(false); var welDrop = _welDrop[0]; var setWelDrop = _welDrop[1];
  var _scrollToCurOnLoad = useRef(false);
  var _tabBarRef = useRef(null);
  var _canInstall = useState(!!window._pwaPromptEvent); var canInstall = _canInstall[0]; var setCanInstall = _canInstall[1];
  useEffect(function() {
    var fn = function(v) { setCanInstall(v); };
    _pwaListeners.push(fn);
    return function() { var idx = _pwaListeners.indexOf(fn); if (idx >= 0) _pwaListeners.splice(idx, 1); };
  }, []);

  function getRecentInstruments() {
    try { var r = JSON.parse(localStorage.getItem("tabkit_recent_inst") || "[]"); return Array.isArray(r) ? r.slice(0, 5) : []; } catch(e) { return []; }
  }
  function addRecentInstrument(prog) {
    if (prog === 25) return; // don't track default acoustic steel
    var r = getRecentInstruments().filter(function(p) { return p !== prog; });
    r.unshift(prog);
    localStorage.setItem("tabkit_recent_inst", JSON.stringify(r.slice(0, 5)));
  }
  function changeTrackInstrument(trkIdx, prog) {
    var s9 = JSON.parse(JSON.stringify(song));
    s9.tracks[trkIdx].instrument = prog;
    setSong(s9);
    addRecentInstrument(prog);
    setInstPickTrack(-1);
  }
  var _editTitle = useState(false); var editingTitle = _editTitle[0]; var setEditingTitle = _editTitle[1];
  var _editTitleVal = useState(""); var editTitleVal = _editTitleVal[0]; var setEditTitleVal = _editTitleVal[1];
  var _editArtistVal = useState(""); var editArtistVal = _editArtistVal[0]; var setEditArtistVal = _editArtistVal[1];
  var _menuVis = useState(function(){try{return localStorage.getItem("tabkit_showMenuBar")!=="false";}catch(e){return true;}}); var showMenuBar = _menuVis[0]; var setShowMenuBar = _menuVis[1];
  useEffect(function(){try{localStorage.setItem("tabkit_showMenuBar",showMenuBar?"true":"false");}catch(e){}},[showMenuBar]);
  var _editTempo = useState(false); var editingTempo = _editTempo[0]; var setEditingTempo = _editTempo[1];
  var _editTempoVal = useState(""); var tempoVal = _editTempoVal[0]; var setTempoVal = _editTempoVal[1];
  var msub = useState(null); var mobileSubOpen = msub[0]; var setMobileSubOpen = msub[1];
  var dls = useState(null); var dlg = dls[0]; var setDlg = dls[1];
  var dld = useState({}); var dlgData = dld[0]; var setDlgData = dld[1];
  var dlgDataRef = useRef(dlgData); dlgDataRef.current = dlgData;
  // Find & Replace scratch editor state
  var _frScratch = useState(null); var frScratch = _frScratch[0]; var setFrScratch = _frScratch[1];
  var _frActive = useState(0); var frActive = _frActive[0]; var setFrActive = _frActive[1]; // 0=find, 1=replace
  var _frCur = useState({measure:0,beat:0,string:0}); var frCur = _frCur[0]; var setFrCur = _frCur[1];
  var _frReplaceWhole = useState(true); var frReplaceWhole = _frReplaceWhole[0]; var setFrReplaceWhole = _frReplaceWhole[1]; // true=overwrite beat, false=only specified strings
  var _frScope = useState("track"); var frScope = _frScope[0]; var setFrScope = _frScope[1];
  var _frStrict = useState(false); var frStrict = _frStrict[0]; var setFrStrict = _frStrict[1];
  var _frMatches = useState(null); var frMatches = _frMatches[0]; var setFrMatches = _frMatches[1];
  var _frScrollX = useState({}); var frScrollX = _frScrollX[0]; var setFrScrollX = _frScrollX[1];
  var _frCurMatch = useState(-1); var frCurMatch = _frCurMatch[0]; var setFrCurMatch = _frCurMatch[1];
  var frLastInput = useRef(0);
  var frOriginTrack = useRef(0);
  var dms = useState(function(){try{var v=localStorage.getItem("tabkit_darkMode");return v===null?true:v==="true";}catch(e){return true;}}); var darkMode = dms[0]; var setDarkMode = dms[1];
  useEffect(function(){try{localStorage.setItem("tabkit_darkMode",darkMode?"true":"false");}catch(e){}}, [darkMode]);
  // ---- Appearance (notation customization) ----
  var APPEARANCE_DEFAULTS = {
    theme: "auto",        // auto = follow dark/light; or a named preset
    accent: "",           // "" = preset default; else hex
    numFont: "mono",      // mono | condensed | hand
    numScale: 100,        // % of base fret-number size
    beatSpacing: 100,     // % of base beat width
    staffScale: 100,      // % of base string gap
    colFret: "", colEffect: "", colSelection: "", colPlayhead: "", colCursor: "", colCanvas: "", colBar: "", colLine: "",
    colTrackHdr: "", colTrackText: "", showTrackStripe: true,
    showTrackIcons: true, showNoteChip: true
  };
  var NUM_FONTS = {
    mono: "Consolas,'SF Mono',monospace",
    condensed: "'Arial Narrow','Roboto Condensed',sans-serif",
    hand: "'Comic Sans MS','Bradley Hand','Segoe Print',cursive",
    sans: "'Helvetica Neue',Arial,sans-serif",
    serif: "Georgia,'Times New Roman',serif",
    slab: "Rockwell,'Roboto Slab','Courier New',serif",
    rounded: "'Trebuchet MS','Segoe UI',Verdana,sans-serif",
    typewriter: "'Courier New',Courier,monospace",
    wide: "Impact,'Haettenschweiler','Franklin Gothic Bold',sans-serif"
  };
  var apState = useState(function(){try{var v=localStorage.getItem("tabkit_appearance");return v?Object.assign({},APPEARANCE_DEFAULTS,JSON.parse(v)):Object.assign({},APPEARANCE_DEFAULTS);}catch(e){return Object.assign({},APPEARANCE_DEFAULTS);}});
  var appearance = apState[0]; var setAppearance = apState[1];
  useEffect(function(){try{localStorage.setItem("tabkit_appearance",JSON.stringify(appearance));}catch(e){}}, [appearance]);
  // Which presets imply dark vs light base (auto = follow current darkMode)
  var THEME_IS_DARK = { contrast: true, paper: false, sepia: false, classic: false };
  // Manual dark/light toggle resets theme to auto
  function toggleDarkMode(){ setDarkMode(function(v){return !v;}); setAppearance(function(a){return a.theme==="auto"?a:Object.assign({},a,{theme:"auto"});}); }
  var TH = darkMode ? {
    bg:"#1e1e1e",canvas:"#252525",text:"#d4d4d4",fret:"#e0e0e0",dim:"#666",
    line:"#555",bar:"#888",cur:"rgba(80,140,255,0.25)",curB:"#5090ff",
    hdr:"#2d2d2d",hdrB:"#444",menuBg:"#2d2d2d",menuT:"#ddd",
    mHov:"#3d3d3d",mAct:"#3264dc",tAct:"#1a3050",tIn:"#2a2a2a",
    efx:"#ff9030",tfx:"#70b0ff",stBg:"#252525",stT:"#aaa",
    tbBg:"#2d2d2d",tbB:"#444",lblBg:"#303030",dot:"#aaa",
    sLbl:"#bbb",nStp:"#ccc",drum:"#e8a0a0",ruler:"#333",
    sel:"rgba(80,140,255,0.2)"
  } : {
    bg:"#e8eaef",canvas:"#ffffff",text:"#1a1a2e",fret:"#1a1a2e",dim:"#999",
    line:"#d0d4dc",bar:"#1a1a2e",cur:"rgba(50,100,220,0.12)",curB:"#3264dc",
    hdr:"#f0f2f5",hdrB:"#d0d4dc",menuBg:"#ffffff",menuT:"#1a1a2e",
    mHov:"#e4e8f0",mAct:"#3264dc",tAct:"#dce2f0",tIn:"#f5f6f8",
    efx:"#c06000",tfx:"#336",stBg:"#f0f2f5",stT:"#5a6070",
    tbBg:"#f0f2f5",tbB:"#d0d4dc",lblBg:"#ffffff",dot:"#1a1a2e",
    sLbl:"#5a6070",nStp:"#1a1a2e",drum:"#804",ruler:"#e8eaef",
    sel:"rgba(50,100,220,0.15)"
  };
  // Notation theme presets layered over the base dark/light TH
  var THEME_PRESETS = {
    paper:   { canvas:"#f6efd8", bg:"#ece2c4", text:"#3a2f1a", fret:"#3a2f1a", dim:"#a08a5a", line:"#c9b98a", bar:"#5a4a28", dot:"#3a2f1a", nStp:"#3a2f1a", drum:"#8a3010", efx:"#9a5000", tfx:"#5a6a30", sLbl:"#6a5a30", lblBg:"#f0e7cc", ruler:"#ece2c4", tAct:"#e8dcb8", tIn:"#f0e7cc", trkText:"#3a2f1a", accentDef:"#a06000" },
    sepia:   { canvas:"#efe6dd", bg:"#e3d8cc", text:"#43352a", fret:"#43352a", dim:"#a08f7e", line:"#cdbcab", bar:"#5a4636", dot:"#43352a", nStp:"#43352a", drum:"#8a3a20", efx:"#9a5a20", tfx:"#5a6a80", sLbl:"#6a5a48", lblBg:"#e9ddd0", ruler:"#e3d8cc", tAct:"#ddcdbc", tIn:"#e9ddd0", trkText:"#43352a", accentDef:"#a86a30" },
    contrast:{ canvas:"#000000", bg:"#000000", text:"#ffffff", fret:"#ffff00", dim:"#888", line:"#fff", bar:"#fff", dot:"#fff", nStp:"#fff", drum:"#ff80a0", efx:"#ff9030", tfx:"#60d0ff", sLbl:"#fff", lblBg:"#111", ruler:"#000", tAct:"#222", tIn:"#111", trkText:"#ffffff", accentDef:"#00d0ff" },
    classic: { canvas:"#fffef8", bg:"#d4d0c8", text:"#000000", fret:"#000080", dim:"#888", line:"#808080", bar:"#000", dot:"#000", nStp:"#000", drum:"#800040", efx:"#c06000", tfx:"#000080", sLbl:"#000", lblBg:"#fffef8", ruler:"#d4d0c8", tAct:"#c8c4bc", tIn:"#d4d0c8", trkText:"#000000", accentDef:"#000080" }
  };
  (function(){
    var preset = appearance.theme && appearance.theme !== "auto" ? THEME_PRESETS[appearance.theme] : null;
    if (preset) { for (var k in preset) { if (k !== "accentDef") TH[k] = preset[k]; } if (preset.trkText) TH.trackText = preset.trkText; }
    var acc = appearance.accent || (preset && preset.accentDef) || "";
    if (acc) { TH.curB = acc; TH.mAct = acc; }
    // Per-element overrides (Advanced)
    if (appearance.colFret) TH.fret = appearance.colFret;
    if (appearance.colEffect) TH.efx = appearance.colEffect;
    if (appearance.colSelection) TH.sel = appearance.colSelection;
    if (appearance.colPlayhead) {
      var ph = appearance.colPlayhead;
      function hx2rgba(h, a){ h=h.replace("#",""); if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return "rgba("+r+","+g+","+b+","+a+")"; }
      TH.playFill = hx2rgba(ph, 0.18); TH.playStroke = hx2rgba(ph, 0.7); TH.playCursor = hx2rgba(ph, 0.15);
    }
    if (appearance.colCursor) { TH.curB = appearance.colCursor; }
    if (appearance.colCanvas) { TH.canvas = appearance.colCanvas; }
    if (appearance.colBar) { TH.bar = appearance.colBar; }
    if (appearance.colLine) { TH.line = appearance.colLine; }
    if (appearance.colTrackHdr) { TH.tIn = appearance.colTrackHdr; TH.tAct = appearance.colTrackHdr; }
    if (appearance.colTrackText) { TH.trackText = appearance.colTrackText; }
  })();
  // Drive the global accent CSS var so chrome/menus/buttons follow the chosen accent
  useEffect(function(){
    var preset = appearance.theme && appearance.theme !== "auto" ? THEME_PRESETS[appearance.theme] : null;
    var acc = appearance.accent || (preset && preset.accentDef) || "";
    try {
      if (acc) document.documentElement.style.setProperty("--accent", acc);
      else document.documentElement.style.removeProperty("--accent");
    } catch(e){}
  }, [appearance.accent, appearance.theme]);
  // Notation font + sizing derived from appearance
  var numFontFamily = NUM_FONTS[appearance.numFont] || NUM_FONTS.mono;
  var numScale = (appearance.numScale || 100) / 100;
  var beatSpacingScale = (appearance.beatSpacing || 100) / 100;
  var staffScale = (appearance.staffScale || 100) / 100;
  var notationAppearance = { numFontFamily: numFontFamily, numScale: numScale, beatSpacing: beatSpacingScale, staffScale: staffScale };
  var _noteChip = useState(null); var noteChipRect = _noteChip[0]; var setNoteChipRect = _noteChip[1];
  var fRef = useRef(null), sRef = useRef(null), pRef = useRef(null);
  var _playIntent = useRef(false);
  var _dragState = useRef(null); // {originTrack, originMeasure, originBeat, active}
  var _selOriginTrack = useRef(null); // for mobile: track where selection started
  var _selectModeRef = useRef(false); // shared select mode flag for TrackRow
  var _globalDidDrag = useRef(false);

  // Convert clientX to {measure, beat} using shared measWidths
  function clientXToMB(clientX) {
    if (!sRef.current) return null;
    var r = sRef.current.getBoundingClientRect();
    var zf = (zoom || 100) / 100;
    var cx = (clientX - r.left) / zf + (sRef.current.scrollLeft || 0);
    var mxArr = measWidths || [];
    var BW2 = 18, MP2 = 3, mx = 24; // LW, same as TrackRow
    for (var mi = 0; mi < mxArr.length; mi++) {
      var mw = mxArr[mi] * BW2 + MP2 * 2;
      if (cx >= mx && cx < mx + mw) {
        var t8 = song.tracks[ati];
        var bCount = t8 && t8.measures[mi] ? t8.measures[mi].beats.length : 4;
        var clickBW = bCount > 0 ? ((mw - MP2*2) / bCount) : BW2;
        var b = Math.floor((cx - mx - MP2) / clickBW);
        b = Math.max(0, Math.min(b, bCount - 1));
        return {measure: mi, beat: b};
      }
      mx += mw;
    }
    // Past last measure - clamp to end
    if (mxArr.length > 0) {
      var t9 = song.tracks[ati];
      var lastM = t9.measures.length - 1;
      return {measure: lastM, beat: t9.measures[lastM] ? t9.measures[lastM].beats.length - 1 : 0};
    }
    return null;
  }

  // Find track index from clientY using data-trackidx
  function clientYToTrack(clientX, clientY) {
    var el = document.elementFromPoint(clientX, clientY);
    while (el && el !== sRef.current) {
      var tidx = el.getAttribute && el.getAttribute("data-trackidx");
      if (tidx != null) return +tidx;
      el = el.parentNode;
    }
    return null;
  }
  var stickyRefs = useRef([]);
  var seekRef = useRef(null); // {measure, beat} or {flat} — set to jump playback position
  var seekingRef = useRef(false); // true while arrow keys held during playback - pauses forward advancement
  var scrollXs = useState(0); var scrollX = scrollXs[0]; var setScrollX = scrollXs[1];
  var viewWs = useState(typeof window !== "undefined" ? window.innerWidth : 800); var viewW = viewWs[0]; var setViewW = viewWs[1];

  // Keep viewW synced with actual container width
  useEffect(function() {
    function updateW() {
      if (sRef.current) setViewW(sRef.current.clientWidth);
      else setViewW(window.innerWidth);
    }
    updateW();
    window.addEventListener("resize", updateW);
    // Poll briefly to catch late-mounting scroll container
    var polls = [16,50,100,200,300,600,1000,2000];
    var timers = polls.map(function(ms){ return setTimeout(updateW, ms); });
    // Also use requestAnimationFrame for first-frame accuracy
    var raf = requestAnimationFrame(function(){ requestAnimationFrame(updateW); });
    var ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateW);
      if (sRef.current) ro.observe(sRef.current);
    }
    return function() {
      window.removeEventListener("resize", updateW);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [song]);

  // Pinch-to-zoom on mobile
  var _pinchRef = useRef(null);
  useEffect(function() {
    var el = sRef.current;
    if (!el || !isMobile) return;
    function getDist(t) {
      var dx = t[0].clientX - t[1].clientX;
      var dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function onTS(e) {
      if (e.touches.length === 2) {
        _pinchRef.current = { dist: getDist(e.touches), zoom: zoom };
        // Cancel long-press timer
        if (el._lpTimer) { clearTimeout(el._lpTimer); el._lpTimer = null; }
      }
    }
    function onTM(e) {
      if (e.touches.length === 2 && _pinchRef.current) {
        e.preventDefault();
        var newDist = getDist(e.touches);
        var scale = newDist / _pinchRef.current.dist;
        var newZoom = Math.round(_pinchRef.current.zoom * scale / 5) * 5;
        newZoom = Math.max(50, Math.min(200, newZoom));
        if (newZoom !== zoom) setZoom(newZoom);
      }
    }
    function onTE() {
      _pinchRef.current = null;
    }
    el.addEventListener("touchstart", onTS, { passive: true });
    el.addEventListener("touchmove", onTM, { passive: false });
    el.addEventListener("touchend", onTE, { passive: true });
    return function() {
      el.removeEventListener("touchstart", onTS);
      el.removeEventListener("touchmove", onTM);
      el.removeEventListener("touchend", onTE);
    };
  }, [isMobile, zoom, song]);

  // Zoom indicator badge
  var _zoomBadge = useState(false); var showZoomBadge = _zoomBadge[0]; var setShowZoomBadge = _zoomBadge[1];
  var _zoomBadgeTimer = useRef(null);
  useEffect(function() {
    if (zoom !== 100) {
      setShowZoomBadge(true);
      if (_zoomBadgeTimer.current) clearTimeout(_zoomBadgeTimer.current);
      _zoomBadgeTimer.current = setTimeout(function(){ setShowZoomBadge(false); }, 1500);
    } else {
      setShowZoomBadge(false);
    }
  }, [zoom]);

  var dirty = useRef(false);
  var shareDirty = useRef(false);
  var skipShareDirty = useRef(false);
  var savedSongRef = useRef(null); // snapshot of song at last save/open

  // Check if song has been modified
  function isDirty() {
    return dirty.current;
  }

  // Prompt user to save if dirty. Returns true if action should proceed, false if cancelled.
  function confirmDiscard(action) {
    if (!isDirty()) return true;
    var choice = window.confirm("You have unsaved changes. Press OK to discard and " + action + ", or Cancel to go back.");
    return choice;
  }

  var newSong = useCallback(function() {
    // If current doc is clean and untouched, reuse it
    if (song && !dirty.current && song.title === "Untitled" && docs.current.length > 0) return;
    newDoc();
    if (sRef.current) sRef.current.scrollLeft = 0;
  }, []);

  // === AUTOSAVE ===
  var _autoSaveTimer = useRef(null);
  var _autoSaveSkip = useRef(false);
  var _clearingSession = useRef(false);
  var tapTimes = useRef([]);
  var tapResetTimer = useRef(null);

  useEffect(function(){
    _sf2StatusCb = setStatus;
    loadSF2(setStatus);
    // Check for autosaved session BEFORE creating new song
    var qp2 = new URLSearchParams(window.location.search);
    if (!qp2.get("url")) {
      try {
        var saved = localStorage.getItem("tabkit_autosave");
        if (saved) {
          var session = JSON.parse(saved);
          var expired = session.ts && Date.now() - session.ts > 7 * 24 * 60 * 60 * 1000;
          if (expired) {
            localStorage.removeItem("tabkit_autosave");
          } else if (session.docs && session.docs.length > 0) {
            // Multi-tab format — auto-restore
            docs.current = session.docs.map(function(d){return {song:d.song,ati:d.ati||0,cur:d.cur||{measure:0,beat:0,string:0},sel:d.sel||null,undoStack:[],dirty:d.dirty||false,title:d.title||"Untitled"};});
            var restoreIdx = Math.min(session.activeDocIdx || 0, docs.current.length - 1);
            loadDoc(restoreIdx);
            _scrollToCurOnLoad.current = true;
            var tabCount = session.docs.length;
            setStatus("Restored " + tabCount + " tab" + (tabCount>1?"s":""));
            return;
          } else if (session.song && session.song.tracks) {
            // Legacy single-doc format — auto-restore
            var title = session.song.title || "Untitled";
            docs.current = [{song:session.song,ati:session.ati||0,cur:session.cur||{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:true,title:title}];
            loadDoc(0);
            _scrollToCurOnLoad.current = true;
            setStatus("Restored: " + title);
            return;
          }
        }
      } catch(e) { console.warn("Autosave restore failed:", e); }
    }
    // Initialize with no tabs — show welcome screen
    docs.current = [];
    forceTabRender();
  }, []);

  // After session restore, scroll canvas to cursor and tab bar to active tab
  useEffect(function(){
    if (!_scrollToCurOnLoad.current || !song) return;
    _scrollToCurOnLoad.current = false;
    // Scroll canvas to cursor measure
    setTimeout(function(){
      scrollToMeasure(curRef.current.measure);
      // Scroll tab bar to active tab
      if (_tabBarRef.current) {
        var activeTab = _tabBarRef.current.children[activeDocIdx];
        if (activeTab) activeTab.scrollIntoView({block:"nearest",inline:"center"});
      }
    }, 100);
  }, [song]);

  // Debounced autosave on every song change
  useEffect(function() {
    if (!song || _autoSaveSkip.current) { _autoSaveSkip.current = false; return; }
    if (_autoSaveTimer.current) clearTimeout(_autoSaveTimer.current);
    _autoSaveTimer.current = setTimeout(function() {
      if (_clearingSession.current) return;
      try {
        saveCurrentDoc();
        var session = {
          docs: docs.current.map(function(d) {
            var s = Object.assign({}, d.song); delete s._mobileInput;
            return {song:s, ati:d.ati, cur:d.cur, sel:d.sel, dirty:d.dirty, title:d.title};
          }),
          activeDocIdx: activeDocIdx,
          metro: metro,
          autoScroll: autoScroll,
          rewind: rewindAfterStop,
          zoom: zoom,
          ts: Date.now()
        };
        localStorage.setItem("tabkit_autosave", JSON.stringify(session));
      } catch(e) {}
    }, 800);
    return function() { if (_autoSaveTimer.current) clearTimeout(_autoSaveTimer.current); };
  }, [song]);

  // Track dirty state: any song change after initial load marks dirty
  var skipDirty = useRef(true); // skip marking dirty for programmatic loads
  useEffect(function() {
    if (skipDirty.current) { skipDirty.current = false; return; }
    dirty.current = true;
    if (skipShareDirty.current) { skipShareDirty.current = false; }
    else if (song && song.shareId) { shareDirty.current = true; }
    // Sync to docs array
    if (docs.current[activeDocIdx]) {
      docs.current[activeDocIdx].dirty = true;
      if (song) docs.current[activeDocIdx].title = song.title || "Untitled";
    }
  }, [song]);
  // Warn on page navigation if dirty
  useEffect(function() {
    function beforeUnload(e) {
      if (_clearingSession.current) return;
      var anyDirty = docs.current.some(function(d){return d.dirty;}) || dirty.current;
      if (anyDirty) { e.preventDefault(); e.returnValue = ""; }
      try {
        saveCurrentDoc();
        var session = {
          docs: docs.current.map(function(d) {
            var s = Object.assign({}, d.song); delete s._mobileInput;
            return {song:s, ati:d.ati, cur:d.cur, sel:d.sel, dirty:d.dirty, title:d.title};
          }),
          activeDocIdx: activeDocIdx,
          metro: metro,
          autoScroll: autoScroll,
          rewind: rewindAfterStop,
          zoom: zoom,
          ts: Date.now()
        };
        localStorage.setItem("tabkit_autosave", JSON.stringify(session));
      } catch(e2) {}
    }
    window.addEventListener("beforeunload", beforeUnload);
    return function() { window.removeEventListener("beforeunload", beforeUnload); };
  }, [song]);
  // Set CSS variables for dark mode (used by Modal/DlgBtn outside App scope)
  useEffect(function(){
    var r = document.documentElement.style;
    r.setProperty("--dlg-bg", darkMode ? "#333340" : "#ffffff");
    r.setProperty("--dlg-text", darkMode ? "#d4d4d4" : "#1a1a2e");
    r.setProperty("--dlg-btn", darkMode ? "#434350" : "#f0f2f5");
    r.setProperty("--dlg-btn2", darkMode ? "#3a3a48" : "#e8eaef");
    r.setProperty("--dlg-border", darkMode ? "#555" : "#c0c8d8");
    r.setProperty("--dlg-input-bg", darkMode ? "#24242e" : "#ffffff");
    r.setProperty("--dlg-input-border", darkMode ? "#555" : "#c0c8d8");
    r.setProperty("--dlg-input-dis", darkMode ? "#3a3a44" : "#e8eaef");
    r.setProperty("--tb-hover", darkMode ? "#434350" : "#e4e8f0");
    r.setProperty("--tb-active", darkMode ? "#505060" : "#d0d8f0");
    r.setProperty("--tb-press", darkMode ? "#5a5a68" : "#b8c4e0");
    r.setProperty("--tb-border", darkMode ? "#666" : "#3264dc");
    // Extended design tokens
    r.setProperty("--accent", darkMode ? "#5090ff" : "#3264dc");
    r.setProperty("--accent-soft", darkMode ? "rgba(80,144,255,0.15)" : "rgba(50,100,220,0.08)");
    r.setProperty("--surface-0", darkMode ? "#242430" : "#ffffff");
    r.setProperty("--surface-1", darkMode ? "#2a2a38" : "#f8f9fa");
    r.setProperty("--surface-2", darkMode ? "#333340" : "#f0f2f5");
    r.setProperty("--surface-3", darkMode ? "#434350" : "#e4e8f0");
    r.setProperty("--text-primary", darkMode ? "#d4d4d4" : "#1a1a2e");
    r.setProperty("--text-secondary", darkMode ? "#999" : "#5a6070");
    r.setProperty("--text-muted", darkMode ? "#666" : "#999");
    r.setProperty("--border-subtle", darkMode ? "#404050" : "#e4e8f0");
    r.setProperty("--border-default", darkMode ? "#555" : "#c0c8d8");
    r.setProperty("--shadow-sm", darkMode ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.08)");
    r.setProperty("--shadow-lg", darkMode ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)");
    r.setProperty("--radius-sm", "6px");
    r.setProperty("--radius-md", "10px");
    r.setProperty("--radius-lg", "14px");
    // Global form styling
    var styleId = "tabkit-global-css";
    if (!document.getElementById(styleId)) {
      var s = document.createElement("style"); s.id = styleId; document.head.appendChild(s);
    }
    document.getElementById(styleId).textContent = "\n      select, input[type=text], input[type=number], input[type=url] { border-radius: 6px !important; border: 1px solid var(--border-default) !important; background: var(--surface-0) !important; color: var(--text-primary) !important; font-family: system-ui,-apple-system,sans-serif !important; padding: 4px 8px !important; font-size: 11px !important; outline: none !important; transition: border-color 0.15s !important; }\n      select:focus, input[type=text]:focus, input[type=number]:focus, input[type=url]:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 2px var(--accent-soft) !important; }\n      input[type=range] { accent-color: var(--accent,#3264dc); }\n      input[type=checkbox] { accent-color: var(--accent,#3264dc); width: 14px; height: 14px; cursor: pointer; }\n      ::selection { background: var(--accent-soft, rgba(50,100,220,0.2)); }\n      * { scrollbar-width: thin; scrollbar-color: var(--surface-3,#ccc) transparent; }\n      *::-webkit-scrollbar { width: 6px; height: 6px; }\n      *::-webkit-scrollbar-track { background: transparent; }\n      *::-webkit-scrollbar-thumb { background: var(--surface-3,#ccc); border-radius: 3px; }\n      button { cursor: pointer; }\n      button:active { transform: scale(0.97); }\n    ";
  }, [darkMode]);

  var handleOpen = useCallback(async function(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    e.target.value = "";
    stopPlay();
    setStatus("Loading " + f.name + "...");
    try {
      var ab = await f.arrayBuffer();
      var isTkt = isTKTFile(ab);
      var r = isTkt ? parseTKT(ab) : await loadTBT(ab);
      // Open in new tab
      saveCurrentDoc();
      var newIdx = docs.current.length;
      docs.current.push({song:r,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:r.title||f.name});
      loadDoc(newIdx);
      if (sRef.current) sRef.current.scrollLeft = 0;
      preloadSong(r.tracks);
      _autoSaveSkip.current = true;
      if (isTkt) {
        setStatus((r.title||"Untitled") + " by " + (r.artist||"") + " - " + r.tracks.length + " tracks [TabKit]");
      } else {
        setStatus(r.title + " by " + r.artist + " - " + r.tracks.length + " tracks, v" + r.ver + " [TabIt]");
      }
    } catch (err) { setStatus("Error: " + err.message); console.error(err); }
  }, []);

  var _dropState = useState(false); var dropActive = _dropState[0]; var setDropActive = _dropState[1];
  var _dropCounter = useRef(0);
  var handleDrop = useCallback(async function(e) {
    e.preventDefault(); e.stopPropagation();
    _dropCounter.current = 0; setDropActive(false);
    var files = e.dataTransfer && e.dataTransfer.files;
    if (!files || files.length === 0) return;
    stopPlay();
    for (var fi = 0; fi < files.length; fi++) {
      var f = files[fi];
      var name = f.name.toLowerCase();
      if (!name.endsWith(".tkt") && !name.endsWith(".tbt")) continue;
      try {
        setStatus("Loading " + f.name + "...");
        var ab = await f.arrayBuffer();
        var isTkt = isTKTFile(ab);
        var r = isTkt ? parseTKT(ab) : await loadTBT(ab);
        saveCurrentDoc();
        var newIdx = docs.current.length;
        docs.current.push({song:r,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:r.title||f.name});
        loadDoc(newIdx);
        if (sRef.current) sRef.current.scrollLeft = 0;
        preloadSong(r.tracks);
        _autoSaveSkip.current = true;
        if (isTkt) {
          setStatus((r.title||"Untitled") + " by " + (r.artist||"") + " - " + r.tracks.length + " tracks [TabKit]");
        } else {
          setStatus(r.title + " by " + r.artist + " - " + r.tracks.length + " tracks, v" + r.ver + " [TabIt]");
        }
      } catch (err) { setStatus("Error loading " + f.name + ": " + err.message); console.error(err); }
    }
  }, []);

  var triggerOpen = useCallback(function() {
    if (fRef.current) fRef.current.click();
  }, []);

  var openFromUrl = useCallback(async function(url, silent) {
    if (!url) return;
    if (!silent && !confirmDiscard("open a file from URL")) return;
    stopPlay();
    setStatus("Fetching " + url + "...");
    try {
      var resp;
      try {
        resp = await fetch(url);
        if (!resp.ok) throw new Error("HTTP " + resp.status);
      } catch(corsErr) {
        // Direct fetch failed (likely CORS) - try proxies
        var proxyUrls = [
          "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
          "https://corsproxy.io/?" + encodeURIComponent(url)
        ];
        var fetched = false;
        for (var pi2 = 0; pi2 < proxyUrls.length && !fetched; pi2++) {
          try {
            setStatus("Trying proxy " + (pi2+1) + "/" + proxyUrls.length + "...");
            resp = await fetch(proxyUrls[pi2]);
            if (resp.ok) { fetched = true; }
          } catch(e3) {}
        }
        if (!fetched) throw new Error("Could not fetch file. All proxies failed. The server may block external access.");
      }
      var buf = await resp.arrayBuffer();
      var isTkt = isTKTFile(buf);
      var r = isTkt ? parseTKT(buf) : await loadTBT(buf);
      r._sourceUrl = url;
      // Open in new tab (or reuse current if blank)
      var isBlank = song && !dirty.current && (!song.title || song.title === "Untitled");
      if (isBlank && docs.current.length > 0) {
        // Reuse current tab
        skipDirty.current = true;
        _setSongRaw(r); atiRef.current=0;setAti(0); _setCurRaw({measure:0,beat:0,string:0}); setSel(null);
        undoStack.current = [];
        dirty.current = false;
        docs.current[activeDocIdx] = {song:r,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:r.title||"Untitled"};
      } else {
        saveCurrentDoc();
        var newIdx2 = docs.current.length;
        docs.current.push({song:r,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:r.title||"Untitled"});
        loadDoc(newIdx2);
      }
      if (sRef.current) sRef.current.scrollLeft = 0;
      // Force canvas re-render on iOS (shared tab loads async, canvas may render with stale size)
      var _remeasure = function(){if(sRef.current){var w=sRef.current.clientWidth;if(w>0)setViewW(w);}};
      // Bump viewW to force canvas effect to re-run even if width hasn't changed
      setViewW(function(prev){return prev+1;});
      setTimeout(_remeasure,50);setTimeout(_remeasure,150);setTimeout(_remeasure,300);setTimeout(_remeasure,600);
      preloadSong(r.tracks);
      _autoSaveSkip.current = true;
      // Update URL bar with query param
      var qp = new URLSearchParams(window.location.search);
      qp.set("url", url);
      var newUrl = window.location.pathname + "?" + qp.toString();
      window.history.replaceState(null, "", newUrl);
      if (isTkt) {
        setStatus((r.title||"Untitled") + " by " + (r.artist||"") + " - " + r.tracks.length + " tracks [TabKit]");
      } else {
        setStatus(r.title + " by " + r.artist + " - " + r.tracks.length + " tracks [TabIt]");
      }
    } catch (err) { setStatus("Error loading URL: " + err.message); console.error(err); }
  }, []);

  // Share tab via Netlify function
  // Share token map in localStorage
  function getShareTokens(){try{var s=localStorage.getItem("tabkit_share_tokens");return s?JSON.parse(s):{};}catch(e){return {};}}
  function setShareToken(id,token){try{var m=getShareTokens();m[id]=token;localStorage.setItem("tabkit_share_tokens",JSON.stringify(m));}catch(e){}}
  function getShareToken(id){return getShareTokens()[id]||"";}

  var shareTab = useCallback(async function() {
    if (!song) return;
    var sid = song.shareId || "";
    var tok = sid ? getShareToken(sid) : "";
    openDlg("share", {shareId:sid, editToken:tok, status:"", shareUrl:"", newToken:"", shareVersion:song.shareVersion||0, shareUpdated:song.shareUpdated||"", hasChanges:shareDirty.current, mode: sid && tok ? "update" : "new", visibility:song.shareVisibility||"public"});
  }, [song]);

  function getVoterToken(){try{var t=localStorage.getItem("tabkit_voter_token");if(t)return t;var c="abcdefghijklmnopqrstuvwxyz0123456789";var b=new Uint8Array(24);crypto.getRandomValues(b);t="";for(var i=0;i<24;i++)t+=c.charAt(b[i]%c.length);localStorage.setItem("tabkit_voter_token",t);return t;}catch(e){return "";}}

  // Find & Replace helpers — multi-beat sequence matching
  function frBeatMatchesCol(beat, col, ns, strict) {
    var anySpec = false;
    for (var si = 0; si < ns; si++) { if (col[si]) anySpec = true; }
    for (var si = 0; si < ns; si++) {
      var c = col[si];
      var note = beat.notes[si];
      if (!c) {
        // unspecified string: wildcard unless strict (then must be empty), or unless beat is a full rest
        if (strict && anySpec) { if (note && !note.stop) return false; }
        continue;
      }
      if (c.muted) { if (!note || note.stop || !note.muted) return false; continue; }
      if (!note || note.stop || note.muted) return false;
      if (note.fret !== c.fret) return false;
    }
    return true;
  }

  // Build a find-grid (array of columns) from a scratch track
  function frBuildGrid(scratchTrack, ns, patternMode) {
    var grid = [];
    var measures = scratchTrack.measures;
    var maxBeats = patternMode ? scratchTrack.measures.reduce(function(a,m){return a+m.beats.length;},0) : 1;
    // Flatten to columns
    var lastNonEmpty = -1;
    var cols = [];
    for (var mi=0; mi<measures.length; mi++){
      for (var bi=0; bi<measures[mi].beats.length; bi++){
        var beat = measures[mi].beats[bi];
        var col = [];
        var has = false;
        for (var si=0; si<ns; si++){
          var n = beat.notes[si];
          if (n && !n.stop) { col[si] = n.muted ? {muted:true} : {fret:n.fret}; has=true; }
          else col[si] = null;
        }
        cols.push(col);
        if (has) lastNonEmpty = cols.length-1;
        if (!patternMode && has) { return [col]; } // note mode: just the first voiced beat
      }
    }
    if (!patternMode) return cols.length ? [cols[0]] : [[]];
    // pattern mode: trim leading AND trailing empty columns (so placement offset doesn't matter)
    var firstNonEmpty = -1, lastNonEmpty2 = -1;
    for (var ci=0; ci<cols.length; ci++){
      var hasAny = cols[ci].some(function(x){return x;});
      if (hasAny){ if(firstNonEmpty<0)firstNonEmpty=ci; lastNonEmpty2=ci; }
    }
    if (firstNonEmpty<0) return [];
    return cols.slice(firstNonEmpty, lastNonEmpty2+1);
  }

  function frFindMatches(s, scope, ati, sel, normSel, findGrid, fWidth, strict) {
    var matches = [];
    var trackList = [];
    if (scope === "alltracks") { for (var ti=0;ti<s.tracks.length;ti++) trackList.push(ti); }
    else trackList.push(ati);
    trackList.forEach(function(tIdx){
      var t = s.tracks[tIdx];
      var ns = t.numStrings;
      var flat = [];
      var selRange = null;
      if (scope === "selection" && sel) { selRange = normSel(sel); }
      for (var mi=0; mi<t.measures.length; mi++){
        for (var bi=0; bi<t.measures[mi].beats.length; bi++){
          if (selRange) {
            if (mi < selRange.sm || mi > selRange.em) continue;
            if (mi === selRange.sm && bi < selRange.sb) continue;
            if (mi === selRange.em && bi > selRange.eb) continue;
          }
          flat.push({mi:mi, bi:bi, beat:t.measures[mi].beats[bi]});
        }
      }
      for (var fi=0; fi+fWidth<=flat.length; fi++){
        var ok = true;
        for (var w=0; w<fWidth; w++){
          if (!frBeatMatchesCol(flat[fi+w].beat, findGrid[w], ns, strict)) { ok=false; break; }
        }
        if (ok) matches.push({track:tIdx, mi:flat[fi].mi, bi:flat[fi].bi, flatIdx:fi, flat:flat});
      }
    });
    return matches;
  }

  // Note mode: find single string+fret, replace string+fret (only touches that string)
  function frNoteFindMatches(s, scope, ati, sel, normSel, findString, findFret) {
    var matches = [];
    var trackList = [];
    if (scope === "alltracks") { for (var ti=0;ti<s.tracks.length;ti++) trackList.push(ti); }
    else trackList.push(ati);
    trackList.forEach(function(tIdx){
      var t = s.tracks[tIdx];
      if (findString >= t.numStrings) return;
      var selRange = (scope==="selection" && sel) ? normSel(sel) : null;
      for (var mi=0; mi<t.measures.length; mi++){
        for (var bi=0; bi<t.measures[mi].beats.length; bi++){
          if (selRange){ if(mi<selRange.sm||mi>selRange.em)continue; if(mi===selRange.sm&&bi<selRange.sb)continue; if(mi===selRange.em&&bi>selRange.eb)continue; }
          var n = t.measures[mi].beats[bi].notes[findString];
          if (n && !n.stop && !n.muted && n.fret === findFret) matches.push({track:tIdx, mi:mi, bi:bi});
        }
      }
    });
    return matches;
  }

  // Scratch editor note placement
  function frPlaceNote(fret){
    if (!frScratch) return;
    var s = JSON.parse(JSON.stringify(frScratch));
    var t = s.tracks[frActive];
    var beat = t.measures[frCur.measure].beats[frCur.beat];
    var existing = beat.notes[frCur.string];
    var maxFret = t.maxFret || 24;
    var now = Date.now();
    if (existing && existing.fret >= 0 && existing.fret <= 9 && (now - frLastInput.current) < 1200 && !existing.muted) {
      var combined = existing.fret * 10 + fret;
      if (combined <= maxFret) fret = combined;
    }
    frLastInput.current = now;
    beat.notes[frCur.string] = {fret:fret, attack:true};
    setFrScratch(s); setFrMatches(null); setFrCurMatch(-1);
  }
  function frPlaceMutedNote(){
    if (!frScratch) return;
    var s = JSON.parse(JSON.stringify(frScratch));
    s.tracks[frActive].measures[frCur.measure].beats[frCur.beat].notes[frCur.string] = {fret:0, attack:true, muted:true};
    setFrScratch(s); setFrMatches(null); setFrCurMatch(-1);
  }
  function frClearScratchBeat(){
    if (!frScratch) return;
    var s = JSON.parse(JSON.stringify(frScratch));
    s.tracks[frActive].measures[frCur.measure].beats[frCur.beat].notes[frCur.string] = null;
    setFrScratch(s); setFrMatches(null); setFrCurMatch(-1);
  }
  function frRunFind(){
    if (!song) return;
    var ns = song.tracks[frOriginTrack.current].numStrings;
    var grid = frBuildGrid(frScratch.tracks[0], ns, true);
    if (grid.length===0 || !grid.some(function(c){return c.some(function(x){return x;});})) { setFrMatches([]); setFrCurMatch(-1); return; }
    var ms = frFindMatches(song, frScope, frOriginTrack.current, sel, normSel, grid, grid.length, frStrict);
    setFrMatches(ms);
    if (ms.length>0){ setFrCurMatch(0); frGotoMatch(ms[0]); } else setFrCurMatch(-1);
  }
  function frGotoMatch(m){
    if(!m)return;
    if(m.track!==ati){atiRef.current=m.track;setAti(m.track);}
    _setCurRaw({measure:m.mi,beat:m.bi,string:cur.string<song.tracks[m.track].numStrings?cur.string:0});
    setTimeout(function(){
      scrollToMeasure(m.mi);
      if (sRef.current) {
        var trackEl = sRef.current.querySelector('[data-trackidx="'+m.track+'"]');
        if (trackEl && trackEl.scrollIntoView) trackEl.scrollIntoView({block:"center",inline:"nearest"});
      }
    },60);
  }
  function frDoReplaceAll(){
    if (!song) return;
    var ns = song.tracks[frOriginTrack.current].numStrings;
    var s2 = JSON.parse(JSON.stringify(song));
    var grid = frBuildGrid(frScratch.tracks[0], ns, true);
    var repCols = frBuildGrid(frScratch.tracks[1], ns, true);
    if (grid.length===0 || !grid.some(function(c){return c.some(function(x){return x;});})){ setFrMatches([]); return; }
    var ms2 = frFindMatches(s2, frScope, frOriginTrack.current, sel, normSel, grid, grid.length, frStrict);
    var byTrack={}; ms2.forEach(function(m){if(!byTrack[m.track])byTrack[m.track]=[];byTrack[m.track].push(m);});
    var replaced = 0;
    Object.keys(byTrack).forEach(function(tk){
      var arr=byTrack[tk]; arr.sort(function(a,b){return b.flatIdx-a.flatIdx;});
      arr.forEach(function(m){
        var t = s2.tracks[m.track];
        for (var w=0; w<grid.length; w++){
          var pos = m.flat[m.flatIdx+w]; if(!pos)break;
          var beat = t.measures[pos.mi].beats[pos.bi];
          var rcol2 = w < repCols.length ? repCols[w] : null;
          for (var si2=0; si2<t.numStrings; si2++){
            var rc = rcol2 ? rcol2[si2] : null;
            if (frReplaceWhole) {
              // Overwrite entire beat: replace value or clear
              if (!rc) beat.notes[si2] = null;
              else if (rc.muted) beat.notes[si2] = {fret:0,attack:true,muted:true};
              else beat.notes[si2] = {fret:rc.fret, attack:true};
            } else {
              // Only touch strings specified in the replace column; leave others alone
              if (rc) {
                if (rc.muted) beat.notes[si2] = {fret:0,attack:true,muted:true};
                else beat.notes[si2] = {fret:rc.fret, attack:true};
              }
            }
          }
        }
        replaced++;
      });
    });
    if (replaced>0){ _undoLabel.current="Find & Replace"; setSong(s2); setStatus("Replaced "+replaced+" match"+(replaced!==1?"es":"")); frCloseEditor(); }
    else setFrMatches([]);
  }
  function frOpenEditor(){
    var t = song.tracks[ati];
    var ns = t.numStrings;
    function mkTrack(name){
      var beats=[]; for(var i=0;i<BPM;i++) beats.push({notes:new Array(ns).fill(null)});
      return {name:name, numStrings:ns, instType:t.instType, instrument:t.instrument, bank:t.bank, isDrum:t.isDrum, midiChannel:t.midiChannel, tuning:t.tuning.slice(), maxFret:t.maxFret||24, letRing:false, hasTopText:false, hasBottomText:false, capo:0, transpose:0, volume:96, pan:64, measures:[{beats:beats, barLine:"single", beatsPerMeasure:BPM, globalBeatsPerMeasure:BPM, isATR:false, timeSig:{num:4,den:4}}]};
    }
    setFrScratch({tracks:[mkTrack("Find"), mkTrack("Replace")], tempo:120});
    frOriginTrack.current = ati;
    setFrActive(0); setFrCur({measure:0,beat:0,string:0}); setFrMatches(null); setFrCurMatch(-1);
    setDlg("findReplace");
  }
  function frCloseEditor(){ setDlg(null); setFrScratch(null); setFrMatches(null); setFrCurMatch(-1); }

  // After a share/update, fetch the stored bytes back and CRC32-compare to what we sent.
  // Returns {ok:true} on match, {ok:false, reason} on mismatch or fetch failure.
  async function validateSharedData(shareId, sentBytes) {
    try {
      var sentCrc = crc32(sentBytes);
      var sentLen = sentBytes.length;
      // cache-bust so we read the freshly-stored object, not a CDN/browser cache
      var resp = await fetch("/.netlify/functions/share?id=" + encodeURIComponent(shareId) + "&_v=" + Date.now());
      if (!resp.ok) return {ok:false, reason:"could not read back stored tab ("+resp.status+")"};
      var stored = new Uint8Array(await resp.arrayBuffer());
      if (stored.length !== sentLen) return {ok:false, reason:"size mismatch (sent "+sentLen+", stored "+stored.length+")"};
      if (crc32(stored) !== sentCrc) return {ok:false, reason:"checksum mismatch"};
      return {ok:true};
    } catch(e) {
      return {ok:false, reason:"validation request failed"};
    }
  }

  var doShareNew = useCallback(async function() {
    if (!song) return;
    // Prevent resharing unchanged content from another share
    if (song.shareId && !shareDirty.current) {
      setDlgData(function(d){return Object.assign({},d,{status:"No changes detected. Please modify the tab before sharing as new."});});
      return;
    }
    try {
      setDlgData(function(d){return Object.assign({},d,{status:"Sharing..."});});
      var tktData = saveTKT(song);
      var resp;
      try {
        resp = await fetch("/.netlify/functions/share", {
          method: "POST",
          headers: {"Content-Type":"application/octet-stream","X-Tab-Title":song.title||"Untitled","X-Tab-Artist":song.artist||"","X-Tab-Album":song.album||"","X-Tab-Transcriber":song.transcribedBy||"","X-Tab-Tracks":String(song.tracks.length),"X-Voter-Token":getVoterToken(),"X-Tab-Visibility":dlgDataRef.current.visibility||"public"},
          body: tktData
        });
      } catch(fetchErr) {
        setDlgData(function(d){return Object.assign({},d,{status:"Share requires deployment to Netlify."});});
        return;
      }
      if (!resp.ok) {
        var errText=""; try{var ej=await resp.json();errText=ej.error||"";}catch(e){errText=resp.status+" "+resp.statusText;}
        setDlgData(function(d){return Object.assign({},d,{status:"Failed: "+errText});});
        return;
      }
      var result = await resp.json();
      var shareUrl = window.location.origin + "/tab/" + result.id;
      // Save token and shareId
      setShareToken(result.id, result.token);
      var sVer = result.version || 1;
      var ts = new Date().toLocaleString();
      var s2 = JSON.parse(JSON.stringify(song)); s2.shareId = result.id; s2.shareVersion = sVer; s2.shareUpdated = ts; s2.shareVisibility = result.visibility || "public";
      skipShareDirty.current = true; shareDirty.current = false; setSong(s2);
      setDlgData(function(d){return Object.assign({},d,{status:"success",shareUrl:shareUrl,shareId:result.id,editToken:result.token,newToken:result.token,shareVersion:sVer,shareTime:ts,visibility:result.visibility||"public"});});
      // Round-trip validation: confirm the server stored exactly what we sent
      var vr = await validateSharedData(result.id, tktData);
      if (!vr.ok) { setDlgData(function(d){return Object.assign({},d,{validationWarning:"Stored copy could not be verified: "+vr.reason+". Please re-share to be safe."});}); }
      else { setDlgData(function(d){return Object.assign({},d,{validationWarning:null,validated:true});}); }
    } catch(err2) {
      setDlgData(function(d){return Object.assign({},d,{status:"Failed: "+err2.message});});
    }
  }, [song]);

  var doShareUpdate = useCallback(async function(shareId, editToken, force) {
    if (!song || !shareId || !editToken) return;
    try {
      setDlgData(function(d){return Object.assign({},d,{status:"Updating...",conflict:null});});
      var tktData = saveTKT(song);
      var hdrs = {"Content-Type":"application/octet-stream","Authorization":"Bearer "+editToken,"X-Tab-Title":song.title||"Untitled","X-Tab-Artist":song.artist||"","X-Tab-Album":song.album||"","X-Tab-Transcriber":song.transcribedBy||"","X-Tab-Tracks":String(song.tracks.length),"X-Voter-Token":getVoterToken(),"X-Tab-Visibility":dlgDataRef.current.visibility||"public"};
      if (!force && song.shareVersion) hdrs["X-Expected-Version"] = String(song.shareVersion);
      var resp;
      try {
        resp = await fetch("/.netlify/functions/share?id=" + encodeURIComponent(shareId), {
          method: "PUT",
          headers: hdrs,
          body: tktData
        });
      } catch(fetchErr) {
        setDlgData(function(d){return Object.assign({},d,{status:"Update requires deployment to Netlify."});});
        return;
      }
      if (resp.status === 409) {
        var cj = await resp.json();
        setDlgData(function(d){return Object.assign({},d,{status:"conflict",conflict:cj});});
        return;
      }
      if (!resp.ok) {
        var errText=""; try{var ej=await resp.json();errText=ej.error||"";}catch(e){errText=resp.status+" "+resp.statusText;}
        setDlgData(function(d){return Object.assign({},d,{status:"Failed: "+errText});});
        return;
      }
      var result = await resp.json();
      var shareUrl = window.location.origin + "/tab/" + shareId;
      // Save token and shareId, use server version
      setShareToken(shareId, editToken);
      var sVer = result.version || ((song.shareVersion || 0) + 1);
      var ts = new Date().toLocaleString();
      var s2 = JSON.parse(JSON.stringify(song)); s2.shareId = shareId; s2.shareVersion = sVer; s2.shareUpdated = ts; s2.shareVisibility = result.visibility || dlgDataRef.current.visibility || "public";
      skipShareDirty.current = true; shareDirty.current = false; setSong(s2);
      setDlgData(function(d){return Object.assign({},d,{status:"updated",shareUrl:shareUrl,shareVersion:sVer,shareTime:ts,visibility:result.visibility||d.visibility||"public"});});
      // Round-trip validation: confirm the server stored exactly what we sent
      var vr = await validateSharedData(shareId, tktData);
      if (!vr.ok) { setDlgData(function(d){return Object.assign({},d,{validationWarning:"Stored copy could not be verified: "+vr.reason+". Please re-update to be safe."});}); }
      else { setDlgData(function(d){return Object.assign({},d,{validationWarning:null,validated:true});}); }
    } catch(err2) {
      setDlgData(function(d){return Object.assign({},d,{status:"Failed: "+err2.message});});
    }
  }, [song]);

  var doShareDelete = useCallback(async function(shareId, editToken) {
    if (!shareId || !editToken) return;
    if (!window.confirm("Delete this shared file? The share link will stop working. This cannot be undone.")) return;
    try {
      setDlgData(function(d){return Object.assign({},d,{status:"Deleting..."});});
      var resp;
      try {
        resp = await fetch("/.netlify/functions/share?id=" + encodeURIComponent(shareId), {
          method: "DELETE",
          headers: {"Authorization":"Bearer "+editToken}
        });
      } catch(fetchErr) {
        setDlgData(function(d){return Object.assign({},d,{status:"Failed: network error"});});
        return;
      }
      if (!resp.ok) {
        var errText=""; try{var ej=await resp.json();errText=ej.error||"";}catch(e){errText=resp.status+" "+resp.statusText;}
        setDlgData(function(d){return Object.assign({},d,{status:"Failed: "+errText});});
        return;
      }
      // Clear share metadata from song
      var s2 = JSON.parse(JSON.stringify(song));
      delete s2.shareId; delete s2.shareVersion; delete s2.shareUpdated;
      skipShareDirty.current = true; shareDirty.current = false; setSong(s2);
      // Remove token from localStorage
      try{var m=getShareTokens();delete m[shareId];localStorage.setItem("tabkit_share_tokens",JSON.stringify(m));}catch(e){}
      closeDlg();
      setStatus("Share deleted");
    } catch(err2) {
      setDlgData(function(d){return Object.assign({},d,{status:"Failed: "+err2.message});});
    }
  }, [song]);

  // Version check banner
  var updateBannerState = useState(null); var updateBanner = updateBannerState[0]; var setUpdateBanner = updateBannerState[1];
  var checkShareVersion = useCallback(async function() {
    if (!song || !song.shareId) return;
    try {
      var resp = await fetch("/.netlify/functions/share?id=" + encodeURIComponent(song.shareId), {method:"HEAD"});
      if (!resp.ok) return;
      var sv = resp.headers.get("X-Share-Version");
      if (sv) {
        var serverVer = parseInt(sv, 10) || 0;
        if (serverVer > (song.shareVersion || 0)) {
          setUpdateBanner({shareId:song.shareId, localVer:song.shareVersion||0, serverVer:serverVer});
        }
      }
    } catch(e) { /* silent */ }
  }, [song]);
  useEffect(function() {
    function onVisible() { if (document.visibilityState === "visible") checkShareVersion(); }
    document.addEventListener("visibilitychange", onVisible);
    if (song && song.shareId) { var t = setTimeout(checkShareVersion, 2000); return function(){ document.removeEventListener("visibilitychange", onVisible); clearTimeout(t); }; }
    return function(){ document.removeEventListener("visibilitychange", onVisible); };
  }, [song && song.shareId, checkShareVersion]);

  var loadSharedTab = useCallback(async function(id) {
    try {
      setStatus("Loading shared tab...");
      var resp;
      try {
        resp = await fetch("/.netlify/functions/share?id=" + encodeURIComponent(id));
      } catch(fetchErr) {
        setStatus("Share loading requires Netlify deployment");
        return;
      }
      if (!resp.ok) {
        var errText = "";
        try { var ej = await resp.json(); errText = ej.error || ""; } catch(e) { errText = resp.status + " " + resp.statusText; }
        setStatus("Shared tab not found: " + errText);
        return;
      }
      var buf = new Uint8Array(await resp.arrayBuffer());
      var r = parseTKT(buf);
      r.shareId = id; // Remember which share this came from
      var sv = resp.headers.get("X-Share-Version");
      if (sv) r.shareVersion = parseInt(sv, 10) || 1;
      var su = resp.headers.get("X-Share-Updated");
      if (su) { try { r.shareUpdated = new Date(su).toLocaleString(); } catch(e) { r.shareUpdated = su; } }
      var svis = resp.headers.get("X-Share-Visibility");
      r.shareVisibility = svis || "public";
      // Open in new tab or reuse blank
      var isBlank = song && !dirty.current && (!song.title || song.title === "Untitled");
      if (isBlank && docs.current.length > 0) {
        skipDirty.current = true;
        skipShareDirty.current = true;
        _setSongRaw(r); atiRef.current=0;setAti(0); _setCurRaw({measure:0,beat:0,string:0}); setSel(null);
        undoStack.current = [];
        dirty.current = false;
        shareDirty.current = false;
        docs.current[activeDocIdx] = {song:r,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:r.title||"Untitled"};
      } else {
        saveCurrentDoc();
        var newIdx2 = docs.current.length;
        docs.current.push({song:r,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:r.title||"Untitled"});
        skipShareDirty.current = true;
        loadDoc(newIdx2);
      }
      shareDirty.current = false;
      if (sRef.current) sRef.current.scrollLeft = 0;
      preloadSong(r.tracks);
      setStatus("Loaded shared tab: " + (r.title || "Untitled"));
      showToast({icon:"\uD83C\uDFB8",title:"Shared tab loaded",detail:r.title||"Untitled"});
      // Clean up URL without reloading
      try { window.history.replaceState(null, "", window.location.pathname); } catch(e) {}
    } catch(err2) {
      setStatus("Failed to load shared tab: " + err2.message);
    }
  }, [song]);

  // Auto-load from ?url= or ?share= query parameter on mount
  useEffect(function() {
    var qp = new URLSearchParams(window.location.search);
    var urlParam = qp.get("url");
    if (urlParam) { openFromUrl(urlParam, true); return; }
    var shareParam = qp.get("share");
    if (shareParam) { loadSharedTab(shareParam); }
  }, []);

  // Listen for messages from browse page
  useEffect(function() {
    function onMsg(e) {
      if (e.data && e.data.type === "loadShare" && e.data.id) {
        loadSharedTab(e.data.id);
      }
    }
    window.addEventListener("message", onMsg);
    return function(){ window.removeEventListener("message", onMsg); };
  }, [loadSharedTab]);

  var handleSave = useCallback(async function() {
    if (!song) return;
    try {
      var d = saveTKT(song);
      var b = new Blob([d]);
      var u = URL.createObjectURL(b);
      var a = document.createElement("a");
      a.href = u; a.download = (song.title||"song")+".tkt"; a.click();
      URL.revokeObjectURL(u);
      setStatus("Saved " + (song.title||"song") + ".tkt");
      dirty.current = false;
    } catch (err) { setStatus("Save error: "+err.message); }
  }, [song]);

  var handleExportTBT = useCallback(async function() {
    if (!song) return;
    try {
      // Build compatibility report
      var warnings = [];
      var exportSong = JSON.parse(JSON.stringify(song));
      // Split tracks with >7 strings into TBT-compatible tracks
      var splitTracks = [];
      for (var ei = 0; ei < exportSong.tracks.length; ei++) {
        var et = exportSong.tracks[ei];
        if (et.numStrings > 7) {
          var origNS = et.numStrings;
          
          if (origNS === 12) {
            // 12-string: split even indices (fundamentals) and odd indices (octaves/unisons)
            var evenIndices = [], oddIndices = [];
            for (var si12 = 0; si12 < 12; si12++) { if (si12 % 2 === 0) evenIndices.push(si12); else oddIndices.push(si12); }
            
            var fundTrack = JSON.parse(JSON.stringify(et));
            fundTrack.name = (et.name || "Track") + " (Fundamentals)";
            fundTrack.numStrings = 6;
            fundTrack.tuning = evenIndices.map(function(i){return et.tuning[i];});
            for (var smi = 0; smi < fundTrack.measures.length; smi++) {
              for (var sbi = 0; sbi < fundTrack.measures[smi].beats.length; sbi++) {
                var origNotes = et.measures[smi].beats[sbi].notes;
                fundTrack.measures[smi].beats[sbi].notes = evenIndices.map(function(i){return origNotes[i]||null;});
              }
            }
            splitTracks.push(fundTrack);
            
            var octTrack = JSON.parse(JSON.stringify(et));
            octTrack.name = (et.name || "Track") + " (Octaves)";
            octTrack.numStrings = 6;
            octTrack.tuning = oddIndices.map(function(i){return et.tuning[i];});
            for (var smi2 = 0; smi2 < octTrack.measures.length; smi2++) {
              for (var sbi2 = 0; sbi2 < octTrack.measures[smi2].beats.length; sbi2++) {
                var origNotes2 = et.measures[smi2].beats[sbi2].notes;
                octTrack.measures[smi2].beats[sbi2].notes = oddIndices.map(function(i){return origNotes2[i]||null;});
              }
            }
            splitTracks.push(octTrack);
            warnings.push("Track " + (ei+1) + " \"" + (et.name||"") + "\": 12 strings split into Fundamentals + Octaves tracks");
          } else {
            // Non-12-string: top 6 strings = main (standard tuning), remainder = extra (low strings)
            var mainStart = origNS - 6;
            var mainTrack = JSON.parse(JSON.stringify(et));
            mainTrack.name = (et.name || "Track") + " (Main)";
            mainTrack.numStrings = 6;
            mainTrack.tuning = et.tuning.slice(mainStart, origNS);
            for (var smi3 = 0; smi3 < mainTrack.measures.length; smi3++) {
              for (var sbi3 = 0; sbi3 < mainTrack.measures[smi3].beats.length; sbi3++) {
                mainTrack.measures[smi3].beats[sbi3].notes = et.measures[smi3].beats[sbi3].notes.slice(mainStart, origNS);
              }
            }
            splitTracks.push(mainTrack);
            
            var extraNS = mainStart;
            var extraTrack = JSON.parse(JSON.stringify(et));
            extraTrack.name = (et.name || "Track") + " (Low " + extraNS + ")";
            extraTrack.numStrings = extraNS;
            extraTrack.tuning = et.tuning.slice(0, extraNS);
            for (var smi4 = 0; smi4 < extraTrack.measures.length; smi4++) {
              for (var sbi4 = 0; sbi4 < extraTrack.measures[smi4].beats.length; sbi4++) {
                extraTrack.measures[smi4].beats[sbi4].notes = et.measures[smi4].beats[sbi4].notes.slice(0, extraNS);
              }
            }
            // Pad to 4 strings minimum for TBT compatibility
            if (extraTrack.numStrings < 4) {
              var padCount = 4 - extraTrack.numStrings;
              for (var pi3 = 0; pi3 < padCount; pi3++) extraTrack.tuning.push(0);
              for (var smi5 = 0; smi5 < extraTrack.measures.length; smi5++) {
                for (var sbi5 = 0; sbi5 < extraTrack.measures[smi5].beats.length; sbi5++) {
                  for (var pi4 = 0; pi4 < padCount; pi4++) extraTrack.measures[smi5].beats[sbi5].notes.push(null);
                }
              }
              extraTrack.numStrings = 4;
            }
            splitTracks.push(extraTrack);
            warnings.push("Track " + (ei+1) + " \"" + (et.name||"") + "\": " + origNS + " strings split into Main (6) + Low (" + extraNS + ") tracks");
          }
        } else {
          splitTracks.push(et);
        }
      }
      exportSong.tracks = splitTracks;

      for (var ei2 = 0; ei2 < exportSong.tracks.length; ei2++) {
        var et2 = exportSong.tracks[ei2];
        if (et2.twelveStringMode) {
          warnings.push("Track " + (ei2+1) + " \"" + (et2.name||"") + "\": 12-string doubling mode stripped");
        }
        if (et2.instType && et2.instType !== "guitar" && et2.instType !== "drums") {
          warnings.push("Track " + (ei2+1) + " \"" + (et2.name||"") + "\": instrument type \"" + et2.instType + "\" stored as generic");
        }
        if (et2.trackVelocity !== undefined && et2.trackVelocity !== 80) {
          warnings.push("Track " + (ei2+1) + " \"" + (et2.name||"") + "\": track velocity stripped");
        }
        // Strip per-note velocity
        var hadNoteVel = false;
        var hadVelFx = false;
        for (var emi2 = 0; emi2 < et2.measures.length; emi2++) {
          for (var ebi2 = 0; ebi2 < et2.measures[emi2].beats.length; ebi2++) {
            var notes2 = et2.measures[emi2].beats[ebi2].notes;
            for (var eni = 0; eni < notes2.length; eni++) {
              if (notes2[eni] && notes2[eni].vel !== undefined) { delete notes2[eni].vel; hadNoteVel = true; }
              if (notes2[eni] && notes2[eni].ring) { delete notes2[eni].ring; }
              if (notes2[eni] && notes2[eni].preBend !== undefined) { delete notes2[eni].preBend; }
              if (notes2[eni] && notes2[eni].bendHold) { delete notes2[eni].bendHold; }
              if (notes2[eni] && notes2[eni].techniqueOnly) { delete notes2[eni].techniqueOnly; }
              if (notes2[eni] && notes2[eni].vibratoOnly) { delete notes2[eni].vibratoOnly; }
            }
            // Strip velocity and delay track effects (types 200, 201)
            var be2 = et2.measures[emi2].beats[ebi2];
            if (be2.trkEffect) {
              if (be2.trkEffect.type === 200 || be2.trkEffect.type === 201 || be2.trkEffect.type === 202 || be2.trkEffect.type === 204) {
                if (be2.trkEffect.multi && be2.trkEffect.multi.length > 0) {
                  var first = be2.trkEffect.multi.shift();
                  first.multi = be2.trkEffect.multi.length > 0 ? be2.trkEffect.multi : undefined;
                  be2.trkEffect = first;
                } else {
                  delete be2.trkEffect;
                }
                hadVelFx = true;
              } else if (be2.trkEffect.multi) {
                var origLen = be2.trkEffect.multi.length;
                be2.trkEffect.multi = be2.trkEffect.multi.filter(function(f){return f.type !== 200 && f.type !== 201 && f.type !== 202 && f.type !== 204;});
                if (be2.trkEffect.multi.length === 0) delete be2.trkEffect.multi;
                if (be2.trkEffect.multi && origLen !== be2.trkEffect.multi.length) hadVelFx = true;
              }
            }
          }
        }
        if (hadNoteVel) {
          warnings.push("Track " + (ei2+1) + " \"" + (et2.name||"") + "\": per-note velocity removed (TBT has no velocity field)");
        }
        if (hadVelFx) {
          warnings.push("Track " + (ei2+1) + " \"" + (et2.name||"") + "\": velocity track effects removed (TBT has no velocity effect)");
        }
        // Strip TabKit-only fields
        delete et2.twelveStringMode;
        delete et2.instType;
        if (et2.delayOn) warnings.push("Track " + (ei2+1) + " \"" + (et2.name||"") + "\": delay effect stripped");
        delete et2.delayOn; delete et2.delayTime; delete et2.delayTaps; delete et2.delayMix;
        delete et2.octOn; delete et2.octShift; delete et2.octDry; delete et2.octMix;
        delete et2.tremOn; delete et2.tremSpeed; delete et2.tremDepth;
        delete et2.drumLabels;
        delete et2.trackVelocity;
        delete et2.trackExpression;

      }
      delete exportSong._tktVersion;
      delete exportSong._sourceUrl;

      var msg = "Export as TabIt (.tbt)?\n\n";
      if (warnings.length > 0) {
        msg += "Compatibility notes:\n";
        for (var wi = 0; wi < warnings.length; wi++) msg += "• " + warnings[wi] + "\n";
        msg += "\nThese features will be lost in the TBT file. Continue?";
      } else {
        msg += "\"" + (song.title || "Untitled") + "\" (" + song.tracks.length + " tracks)\n\nNo compatibility issues detected.";
      }
      if (!window.confirm(msg)) return;

      var d = await saveTBT(exportSong);
      var b = new Blob([d]);
      var u = URL.createObjectURL(b);
      var a = document.createElement("a");
      a.href = u; a.download = (song.title||"song")+".tbt"; a.click();
      URL.revokeObjectURL(u);
      setStatus("Exported " + (song.title||"song") + ".tbt" + (warnings.length > 0 ? " (with " + warnings.length + " compatibility note" + (warnings.length>1?"s":"") + ")" : ""));
    } catch (err) { setStatus("Export error: "+err.message); }
  }, [song]);

  var lastInputTime = useRef(0);
  var releaseValidTimer = useRef(null);
  var placeNote = useCallback(function(fret) {
    if (!song) return;
    _undoLabel.current = "Fret " + fret;
    var s3 = JSON.parse(JSON.stringify(song));
    var t = s3.tracks[ati], m = t.measures[cur.measure];
    if (!m) return;
    var existing = m.beats[cur.beat].notes[cur.string];
    var maxFret = t.isDrum ? 99 : (t.maxFret || 24);
    var now = Date.now();
    // Multi-digit: if typed within 1200ms and existing note, append digit (e.g. 1 then 2 = 12)
    if (existing && existing.fret >= 0 && existing.fret <= 9 && (now - lastInputTime.current) < 1200) {
      var combined = existing.fret * 10 + fret;
      if (combined <= maxFret) { fret = combined; }
    }
    lastInputTime.current = now;
    m.beats[cur.beat].notes[cur.string] = {fret:fret,attack:true,effect:existing?existing.effect:0,ring:existing?existing.ring:undefined,preBend:existing?existing.preBend:undefined,bendHold:existing?existing.bendHold:undefined};
    // Slide auto-correction: ensure / and \ match the fret direction
    var placedNote = m.beats[cur.beat].notes[cur.string];
    if (placedNote.effect === 47 || placedNote.effect === 92) {
      // This note has a slide - find next real note on same string (skip technique-only markers)
      var sn = null;
      for (var slm = cur.measure; slm < t.measures.length && !sn; slm++) {
        var slStart = (slm === cur.measure) ? cur.beat + 1 : 0;
        for (var slb = slStart; slb < t.measures[slm].beats.length; slb++) {
          var sln = t.measures[slm].beats[slb].notes[cur.string];
          if (sln && sln.attack && !sln.stop && !sln.muted && !sln.techniqueOnly) { sn = sln; break; }
        }
      }
      if (sn) {
        if (fret < sn.fret) placedNote.effect = 47;
        else if (fret > sn.fret) placedNote.effect = 92;
        else { placedNote.effect = 0; }
      }
    }
    // Check backward: previous note or technique-only slide marker pointing to us
    var foundPrevSlide = false;
    for (var plm = cur.measure; plm >= 0 && !foundPrevSlide; plm--) {
      var plEnd = (plm === cur.measure) ? cur.beat - 1 : t.measures[plm].beats.length - 1;
      for (var plb = plEnd; plb >= 0; plb--) {
        var pln = t.measures[plm].beats[plb].notes[cur.string];
        if (!pln) continue;
        // Technique-only slide marker between prev note and placed note
        if (pln.techniqueOnly && (pln.effect === 47 || pln.effect === 92)) {
          // Find the ringing note before this marker to get source fret
          for (var plm3 = plm; plm3 >= 0; plm3--) {
            var plEnd3 = (plm3 === plm) ? plb - 1 : t.measures[plm3].beats.length - 1;
            for (var plb3 = plEnd3; plb3 >= 0; plb3--) {
              var pln3 = t.measures[plm3].beats[plb3].notes[cur.string];
              if (pln3 && pln3.attack && !pln3.stop && !pln3.muted && !pln3.techniqueOnly) {
                if (pln3.fret < fret) pln.effect = 47;
                else if (pln3.fret > fret) pln.effect = 92;
                else { t.measures[plm].beats[plb].notes[cur.string] = null; }
                plm3 = -1; break;
              }
            }
          }
          foundPrevSlide = true; break;
        }
        // Real note with slide effect
        if (pln.attack && !pln.stop && !pln.muted && !pln.techniqueOnly) {
          if (pln.effect === 47 || pln.effect === 92) {
            if (pln.fret < fret) pln.effect = 47;
            else if (pln.fret > fret) pln.effect = 92;
            else pln.effect = 0;
          }
          foundPrevSlide = true; break;
        }
      }
    }
    // Check forward: technique-only slide markers between placed note and next real note
    for (var sfm2 = cur.measure; sfm2 < t.measures.length; sfm2++) {
      var sfStart2 = (sfm2 === cur.measure) ? cur.beat + 1 : 0;
      for (var sfb2 = sfStart2; sfb2 < t.measures[sfm2].beats.length; sfb2++) {
        var sfn2 = t.measures[sfm2].beats[sfb2].notes[cur.string];
        if (!sfn2) continue;
        if (sfn2.attack && !sfn2.stop && !sfn2.muted && !sfn2.techniqueOnly) {
          // Reached target - check if it has a slide pointing back at us
          // (no action needed - the target's own auto-correct handles this)
          sfm2 = t.measures.length; break;
        }
        if (sfn2.techniqueOnly && (sfn2.effect === 47 || sfn2.effect === 92)) {
          // Technique-only slide marker after placed note - find its target to auto-correct
          var sfTarget = null;
          for (var sfm3 = sfm2; sfm3 < t.measures.length && !sfTarget; sfm3++) {
            var sfStart3 = (sfm3 === sfm2) ? sfb2 + 1 : 0;
            for (var sfb3 = sfStart3; sfb3 < t.measures[sfm3].beats.length; sfb3++) {
              var sfn3 = t.measures[sfm3].beats[sfb3].notes[cur.string];
              if (sfn3 && sfn3.attack && !sfn3.stop && !sfn3.muted && !sfn3.techniqueOnly) { sfTarget = sfn3; break; }
            }
          }
          if (sfTarget) {
            if (fret < sfTarget.fret) sfn2.effect = 47;
            else if (fret > sfTarget.fret) sfn2.effect = 92;
            else { t.measures[sfm2].beats[sfb2].notes[cur.string] = null; }
          }
          sfm2 = t.measures.length; break;
        }
      }
    }
    setSong(s3);
    // Delayed bend/release/slide target validation after multi-digit input timeout
    if (releaseValidTimer.current) clearTimeout(releaseValidTimer.current);
    var valMi = cur.measure, valBi = cur.beat, valSi = cur.string, valAti = ati;
    releaseValidTimer.current = setTimeout(function() {
      var cs = songRef.current; if (!cs) return;
      var vt = cs.tracks[valAti]; if (!vt || vt.isDrum) return;
      var vNote = vt.measures[valMi] && vt.measures[valMi].beats[valBi] && vt.measures[valMi].beats[valBi].notes[valSi];
      if (!vNote || !vNote.attack || vNote.stop || vNote.muted) return;
      // Find previous item on same string (real note OR technique-only marker)
      var prevNote = null, prevMi2 = -1, prevBi2 = -1;
      var prevTechMarker = null; // technique-only marker between prev note and placed note
      for (var vlm = valMi; vlm >= 0; vlm--) {
        var vlEnd = (vlm === valMi) ? valBi - 1 : vt.measures[vlm].beats.length - 1;
        for (var vlb = vlEnd; vlb >= 0; vlb--) {
          var vln = vt.measures[vlm].beats[vlb] && vt.measures[vlm].beats[vlb].notes[valSi];
          if (!vln) continue;
          if (vln.techniqueOnly || vln.vibratoOnly) {
            // Remember the technique-only marker closest to the placed note
            if (!prevTechMarker) prevTechMarker = {effect: vln.effect, mi: vlm, bi: vlb};
            continue;
          }
          if (vln.attack && !vln.stop && !vln.muted) {
            prevNote = vln; prevMi2 = vlm; prevBi2 = vlb;
            vlm = -1; break;
          }
        }
      }
      if (!prevNote) return;
      // Determine effective previous effect: technique-only marker overrides note's own effect
      var effPrevEffect = prevTechMarker ? prevTechMarker.effect : prevNote.effect;
      // Rule 1: Bend target must be strictly higher than source
      if (effPrevEffect === 98 && vNote.fret <= prevNote.fret) {
        setStatus("Bend target fret " + vNote.fret + " must be higher than bend source fret " + prevNote.fret);
        var fix1 = JSON.parse(JSON.stringify(cs));
        fix1.tracks[valAti].measures[valMi].beats[valBi].notes[valSi] = null;
        // Also clear the technique-only marker if it was the bend source
        if (prevTechMarker) fix1.tracks[valAti].measures[prevTechMarker.mi].beats[prevTechMarker.bi].notes[valSi] = null;
        setSong(fix1);
        return;
      }
      // Rule 2: Release target must be >= bend origin
      if (effPrevEffect === 114) {
        for (var vlm3 = prevMi2; vlm3 >= 0; vlm3--) {
          var vlEnd3 = (vlm3 === prevMi2) ? prevBi2 - 1 : vt.measures[vlm3].beats.length - 1;
          for (var vlb3 = vlEnd3; vlb3 >= 0; vlb3--) {
            var vln3 = vt.measures[vlm3].beats[vlb3] && vt.measures[vlm3].beats[vlb3].notes[valSi];
            if (vln3 && vln3.attack && !vln3.stop && !vln3.muted && !vln3.techniqueOnly) {
              var originFret3 = vln3.preBend !== undefined ? vln3.preBend : vln3.fret;
              if (vln3.effect === 98 || vln3.preBend !== undefined) {
                if (vNote.fret < originFret3) {
                  setStatus("Release target fret " + vNote.fret + " cannot be below bend origin fret " + originFret3);
                  var fix2 = JSON.parse(JSON.stringify(cs));
                  fix2.tracks[valAti].measures[valMi].beats[valBi].notes[valSi] = null;
                  setSong(fix2);
                }
              }
              vlm3 = -1; break;
            }
          }
        }
        return;
      }
      // Rule 3: Pre-bend value must be less than the fret value
      if (vNote.preBend !== undefined && vNote.preBend >= vNote.fret) {
        setStatus("Pre-bend fret " + vNote.preBend + " must be lower than note fret " + vNote.fret + " — pre-bend cleared");
        var fix3 = JSON.parse(JSON.stringify(cs));
        delete fix3.tracks[valAti].measures[valMi].beats[valBi].notes[valSi].preBend;
        setSong(fix3);
        return;
      }
      // Rule 4: If this note has bend effect and next note is <= this fret, clear bend and cascade
      if (vNote.effect === 98) {
        // Find next real note on same string
        var bendNext = null, bnMi = -1, bnBi = -1;
        for (var bnlm = valMi; bnlm < vt.measures.length && !bendNext; bnlm++) {
          var bnStart = (bnlm === valMi) ? valBi + 1 : 0;
          for (var bnlb = bnStart; bnlb < vt.measures[bnlm].beats.length; bnlb++) {
            var bnn = vt.measures[bnlm].beats[bnlb].notes[valSi];
            if (bnn && bnn.attack && !bnn.stop && !bnn.muted && !bnn.techniqueOnly) {
              bendNext = bnn; bnMi = bnlm; bnBi = bnlb; break;
            }
          }
        }
        if (bendNext && bendNext.fret <= vNote.fret) {
          var fix4 = JSON.parse(JSON.stringify(cs));
          fix4.tracks[valAti].measures[valMi].beats[valBi].notes[valSi].effect = 0;
          // Cascade: clear release effects in the chain forward
          for (var clm = bnMi; clm < vt.measures.length; clm++) {
            var clStart = (clm === bnMi) ? bnBi : 0;
            for (var clb = clStart; clb < vt.measures[clm].beats.length; clb++) {
              var cln = fix4.tracks[valAti].measures[clm].beats[clb].notes[valSi];
              if (cln && cln.attack && !cln.stop && !cln.muted && !cln.techniqueOnly) {
                if (cln.effect === 114) { cln.effect = 0; }
                else if (cln.bendHold) { cln.bendHold = false; }
                else { break; } // no more chain members
              }
            }
          }
          setSong(fix4);
          setStatus("Bend source fret " + vNote.fret + " is not lower than target fret " + bendNext.fret + " — bend cleared");
          return;
        }
      }
      // Rule 5: Forward scan — check if a technique-only marker after this note is now invalid
      var fwdMarker = null, fwdMi = -1, fwdBi = -1;
      var fwdTarget = null;
      for (var fwm = valMi; fwm < vt.measures.length; fwm++) {
        var fwStart = (fwm === valMi) ? valBi + 1 : 0;
        for (var fwb = fwStart; fwb < vt.measures[fwm].beats.length; fwb++) {
          var fwn = vt.measures[fwm].beats[fwb] && vt.measures[fwm].beats[fwb].notes[valSi];
          if (!fwn) continue;
          if ((fwn.techniqueOnly || fwn.vibratoOnly) && !fwdMarker) {
            if (fwn.effect === 98 || fwn.effect === 47 || fwn.effect === 92 || fwn.effect === 114) {
              fwdMarker = fwn; fwdMi = fwm; fwdBi = fwb;
            }
            continue;
          }
          if (fwn.attack && !fwn.stop && !fwn.muted && !fwn.techniqueOnly) {
            fwdTarget = fwn; break;
          }
        }
        if (fwdTarget) break;
      }
      if (fwdMarker && fwdTarget) {
        if (fwdMarker.effect === 98 && fwdTarget.fret <= vNote.fret) {
          var fix5 = JSON.parse(JSON.stringify(cs));
          fix5.tracks[valAti].measures[fwdMi].beats[fwdBi].notes[valSi] = null;
          setSong(fix5);
          setStatus("Delayed bend invalid: target fret " + fwdTarget.fret + " must be higher than source fret " + vNote.fret + " — bend marker cleared");
          return;
        }
        if ((fwdMarker.effect === 47 || fwdMarker.effect === 92) && fwdTarget.fret === vNote.fret) {
          var fix5b = JSON.parse(JSON.stringify(cs));
          fix5b.tracks[valAti].measures[fwdMi].beats[fwdBi].notes[valSi] = null;
          setSong(fix5b);
          setStatus("Delayed slide invalid: target fret equals source fret — slide marker cleared");
          return;
        }
      }
    }, 1200);
    // Preview chord: play all notes on this beat simultaneously
    // First, scan backward for track effects to get current state
    var prevInst = t.instrument, prevVol = t.volume, prevPan = t.pan;
    var prevRev = t.reverb || 0, prevChor = t.chorus || 0, prevVel = t.trackVelocity || 80;
    var prevMod = t.modulation || 0, prevPB = null, prevExpr = 127;
    for (var pmi = 0; pmi <= cur.measure; pmi++) {
      var pEndBi = (pmi === cur.measure) ? cur.beat : (t.measures[pmi] ? t.measures[pmi].beats.length - 1 : 0);
      for (var pbi = 0; pbi <= pEndBi; pbi++) {
        var pbt = t.measures[pmi] && t.measures[pmi].beats[pbi];
        if (pbt && pbt.trkEffect) {
          var scanFx = function(fx) {
            if (fx.type === 86) prevVol = fx.value;
            else if (fx.type === 73) prevInst = fx.value & 0x7F;
            else if (fx.type === 80) prevPan = fx.value;
            else if (fx.type === 82) prevRev = fx.value;
            else if (fx.type === 67) prevChor = fx.value;
            else if (fx.type === 200) prevVel = fx.value;
            else if (fx.type === 77) prevMod = fx.value;
            else if (fx.type === 66) prevPB = fx.raw16 || 0;
            else if (fx.type === 69) prevExpr = fx.value;
            else if (fx.type === 201) { t._pDly = {on:fx.delayOn, time:fx.delayTime, taps:fx.delayTaps, mix:fx.delayMix}; }
            else if (fx.type === 202) { t._pOct = {on:fx.octOn, shift:fx.octShift, dry:fx.octDry, mix:fx.octMix}; }
            else if (fx.type === 204) { t._pTrem = {on:fx.tremOn, speed:fx.tremSpeed, depth:fx.tremDepth}; }
            else if (fx.type === 205) { t._pAdt = fx.value; }
          };
          scanFx(pbt.trkEffect);
          if (pbt.trkEffect.multi) pbt.trkEffect.multi.forEach(scanFx);
        }
      }
    }
    synthAllOff();
    // Apply accumulated track effects to channel for preview
    setChVolume(t.midiChannel, prevVol);
    setChPan(t.midiChannel, prevPan);
    setChReverb(t.midiChannel, prevRev);
    setChBank(t.midiChannel, t.bank || 0);
    setChChorus(t.midiChannel, prevChor);
    setChModulation(t.midiChannel, prevMod);
    setChExpression(t.midiChannel, prevExpr);
    if (prevPB !== null) setChPitchBend(t.midiChannel, prevPB);
    var beat = m.beats[cur.beat];
    for (var pi2 = 0; pi2 < beat.notes.length; pi2++) {
      var pn = beat.notes[pi2];
      if (pn && pn.attack && !pn.stop && !pn.muted) {
        var pVel=pn.vel!==undefined?pn.vel:prevVel;
        var midi = t.isDrum ? (t.tuning[pi2]||0)+pn.fret : (t.tuning[pi2]||40)+pn.fret+(t.capo||0)+(t.transpose||0);
        if(pn.effect===60&&!t.isDrum){
          var hF=pn.fret;var oM=(t.tuning[pi2]||40)+(t.capo||0)+(t.transpose||0);
          if(hF===12)midi=oM+12;else if(hF===7||hF===19)midi=oM+19;else if(hF===5||hF===24)midi=oM+24;
          else if(hF===4||hF===9||hF===16)midi=oM+28;else if(hF===3)midi=oM+31;else midi=oM+12+hF;
        }
        var isHarm=pn.effect===60&&!t.isDrum;
        var _ppOct=t._pOct||{on:t.octOn,shift:t.octShift,dry:t.octDry,mix:t.octMix};
        var pDryScale=(_ppOct.on&&!t.isDrum&&_ppOct.dry!=null)?_ppOct.dry/100:1;
        var pPlayVel=Math.max(0,Math.round(pVel*(isHarm?0.5:0.8)*pDryScale));
        if(pPlayVel>0)synthOn(t.midiChannel, midi, pPlayVel, prevInst, isHarm?undefined:pn.effect===109?0.15:undefined);
        if(isHarm){var shimMidi=Math.min(127,midi+12);synthOn(t.midiChannel,shimMidi,Math.round(pVel*0.5),prevInst);}
        delete t._pDly; delete t._pOct; delete t._pTrem; delete t._pAdt;
        // Pitch Shifter on note preview
        if(_ppOct.on&&!t.isDrum){
          var pPsNote=Math.max(0,Math.min(127,midi+(_ppOct.shift||-12)));
          synthOn(t.midiChannel,pPsNote,Math.round(pVel*0.8*(_ppOct.mix||50)/100),prevInst);
        }

        // Delay on note preview
        var _ppDly=t._pDly||{on:t.delayOn,time:t.delayTime,taps:t.delayTaps,mix:t.delayMix};
        if(_ppDly.on&&!t.isDrum){
          var pDMs=getDelayMs(_ppDly.time||"8d",song.tempo||120);
          scheduleDelay(t.midiChannel,midi,Math.round(pVel*0.8),prevInst,0,t.bank||0,pDMs,_ppDly.taps||3,_ppDly.mix||50);
        }
        if(t.twelveStringMode&&!t.isDrum){
          var oct12p=pi2<(t.numStrings-2)?12:0;
          synthOn(t.midiChannel, midi+oct12p, Math.round(pVel*0.7), prevInst, pn.effect===109?0.15:undefined);
        }
      }
    }
    setTimeout(function(){synthAllOff();}, 400);
    // Do NOT advance cursor - stay in place for chords and multi-digit
  }, [song, ati, cur]);

  // Toggle per-string effect on current note
  // efxCharCode: ASCII code of effect char (e.g. 0x68='h' for hammer-on)
  var toggleEffect = useCallback(function(efxCharCode) {
    if (!song) return;
    var efxIdx = EFX_CHARS.indexOf(String.fromCharCode(efxCharCode));
    _undoLabel.current = efxIdx >= 0 ? EFX_NAMES[efxIdx] : "Effect";
    var s3 = JSON.parse(JSON.stringify(song));
    var t = s3.tracks[ati], m = t.measures[cur.measure];
    if (!m) return;
    var note = m.beats[cur.beat].notes[cur.string];
    // Vibrato, bend, release, slide can be placed without a note (affects ringing string)
    var delayable = (efxCharCode === 126 || efxCharCode === 98 || efxCharCode === 114 || efxCharCode === 47 || efxCharCode === 92);
    if (!note && delayable) {
      // Verify there's actually a ringing note to apply this to
      var hasRinging = false;
      for (var vrm = cur.measure; vrm >= 0 && !hasRinging; vrm--) {
        var vrEnd = (vrm === cur.measure) ? cur.beat - 1 : t.measures[vrm].beats.length - 1;
        for (var vrb = vrEnd; vrb >= 0; vrb--) {
          var vrn = t.measures[vrm].beats[vrb].notes[cur.string];
          if (vrn && vrn.attack && !vrn.stop && !vrn.muted && !vrn.techniqueOnly) { hasRinging = true; break; }
          if (vrn && (vrn.stop || vrn.muted)) { vrm = -1; break; } // string was stopped
        }
      }
      if (!hasRinging) { setStatus("No ringing note on this string to apply technique to"); return; }
      // Validate technique-only markers against surrounding notes
      if (efxCharCode === 98 || efxCharCode === 47 || efxCharCode === 92) {
        // Find the ringing note (backward) and the target (forward)
        var ringNote = null;
        for (var vbm = cur.measure; vbm >= 0 && !ringNote; vbm--) {
          var vbEnd = (vbm === cur.measure) ? cur.beat - 1 : t.measures[vbm].beats.length - 1;
          for (var vbb = vbEnd; vbb >= 0; vbb--) {
            var vbn = t.measures[vbm].beats[vbb].notes[cur.string];
            if (vbn && vbn.attack && !vbn.stop && !vbn.muted && !vbn.techniqueOnly) { ringNote = vbn; break; }
          }
          if (ringNote) break;
        }
        var targetNote = null;
        for (var vfm = cur.measure; vfm < t.measures.length && !targetNote; vfm++) {
          var vfStart = (vfm === cur.measure) ? cur.beat + 1 : 0;
          for (var vfb = vfStart; vfb < t.measures[vfm].beats.length; vfb++) {
            var vfn = t.measures[vfm].beats[vfb].notes[cur.string];
            if (vfn && vfn.attack && !vfn.stop && !vfn.muted && !vfn.techniqueOnly) { targetNote = vfn; break; }
          }
          if (targetNote) break;
        }
        if (ringNote && targetNote) {
          if (efxCharCode === 98 && targetNote.fret <= ringNote.fret) {
            setStatus("Cannot place bend: target fret " + targetNote.fret + " must be higher than source fret " + ringNote.fret);
            return;
          }
          // Auto-correct slide direction for technique-only markers
          if (efxCharCode === 47 || efxCharCode === 92) {
            if (ringNote.fret === targetNote.fret) {
              setStatus("Cannot slide to same fret"); return;
            }
            efxCharCode = (ringNote.fret < targetNote.fret) ? 47 : 92;
          }
        }
      }
      m.beats[cur.beat].notes[cur.string] = {fret:0, attack:false, effect:efxCharCode, techniqueOnly:true};
      // Slide/vibrato mutual exclusion: vibrato AFTER a slide is not allowed
      if (efxCharCode === 47 || efxCharCode === 92) {
        // Placing a slide — remove any vibrato markers AFTER this slide (between slide and target)
        for (var svm = cur.measure; svm < t.measures.length; svm++) {
          var svStart = (svm === cur.measure) ? cur.beat + 1 : 0;
          for (var svb = svStart; svb < t.measures[svm].beats.length; svb++) {
            var svn = t.measures[svm].beats[svb].notes[cur.string];
            if (svn && svn.attack && !svn.stop && !svn.muted && !svn.techniqueOnly) break;
            if (svn && svn.techniqueOnly && svn.effect === 126) {
              t.measures[svm].beats[svb].notes[cur.string] = null;
              setStatus("Vibrato removed — not allowed after slide");
            }
          }
        }
      }
      if (efxCharCode === 126) {
        // Placing vibrato — check if there's a slide BEFORE this position (between source note and here)
        var hasSlideBeforeVib = false;
        for (var vsbm = cur.measure; vsbm >= 0 && !hasSlideBeforeVib; vsbm--) {
          var vsbEnd = (vsbm === cur.measure) ? cur.beat - 1 : t.measures[vsbm].beats.length - 1;
          for (var vsbb = vsbEnd; vsbb >= 0; vsbb--) {
            var vsbn = t.measures[vsbm].beats[vsbb].notes[cur.string];
            if (vsbn && vsbn.attack && !vsbn.stop && !vsbn.muted && !vsbn.techniqueOnly) {
              // Reached source note — check if it has a slide effect
              if (vsbn.effect === 47 || vsbn.effect === 92) hasSlideBeforeVib = true;
              break;
            }
            if (vsbn && vsbn.techniqueOnly && (vsbn.effect === 47 || vsbn.effect === 92)) { hasSlideBeforeVib = true; break; }
          }
        }
        if (hasSlideBeforeVib) {
          m.beats[cur.beat].notes[cur.string] = null;
          setStatus("Vibrato not allowed after a slide");
          setSong(s3);
          return;
        }
      }
      if (efxCharCode === 114) {
        // Placing release — verify there's a prior bend or pre-bend on this string
        var hasPriorBend = false;
        for (var rbm = cur.measure; rbm >= 0 && !hasPriorBend; rbm--) {
          var rbEnd = (rbm === cur.measure) ? cur.beat - 1 : t.measures[rbm].beats.length - 1;
          for (var rbb = rbEnd; rbb >= 0; rbb--) {
            var rbn = t.measures[rbm].beats[rbb].notes[cur.string];
            if (rbn && rbn.techniqueOnly && rbn.effect === 98) { hasPriorBend = true; break; }
            if (rbn && rbn.attack && !rbn.stop && !rbn.muted && !rbn.techniqueOnly) {
              if (rbn.effect === 98 || rbn.preBend !== undefined) hasPriorBend = true;
              break;
            }
          }
        }
        if (!hasPriorBend) {
          m.beats[cur.beat].notes[cur.string] = null;
          setStatus("Release requires a prior bend or pre-bend on this string");
          setSong(s3);
          return;
        }
      }
      setSong(s3);
      return;
    }
    if (!note) return;
    // If toggling off a techniqueOnly marker, remove it entirely
    if (note.techniqueOnly && note.effect === efxCharCode) {
      m.beats[cur.beat].notes[cur.string] = null;
      setSong(s3);
      return;
    }
    note.effect = (note.effect === efxCharCode) ? 0 : efxCharCode;
    // Clean up techniqueOnly flag if note has a real fret
    if (note.attack) delete note.techniqueOnly;
    // Validate bend target must be higher than source
    if (note.attack && note.effect === 98) {
      var bNextV = null;
      for (var bvm = cur.measure; bvm < t.measures.length && !bNextV; bvm++) {
        var bvStart = (bvm === cur.measure) ? cur.beat + 1 : 0;
        for (var bvb = bvStart; bvb < t.measures[bvm].beats.length; bvb++) {
          var bvn = t.measures[bvm].beats[bvb].notes[cur.string];
          if (bvn && bvn.attack && !bvn.stop && !bvn.muted && !bvn.techniqueOnly) { bNextV = bvn; break; }
        }
      }
      if (bNextV && bNextV.fret <= note.fret) {
        note.effect = 0;
        setStatus("Bend target fret " + bNextV.fret + " must be higher than source fret " + note.fret);
      }
    }
    // Validate release requires prior bend or pre-bend
    if (note.attack && note.effect === 114 && note.preBend === undefined) {
      var hasPriorBend2 = false;
      for (var rbm2 = cur.measure; rbm2 >= 0 && !hasPriorBend2; rbm2--) {
        var rbEnd2 = (rbm2 === cur.measure) ? cur.beat - 1 : t.measures[rbm2].beats.length - 1;
        for (var rbb2 = rbEnd2; rbb2 >= 0; rbb2--) {
          var rbn2 = t.measures[rbm2].beats[rbb2].notes[cur.string];
          if (rbn2 && rbn2.techniqueOnly && rbn2.effect === 98) { hasPriorBend2 = true; break; }
          if (rbn2 && rbn2.attack && !rbn2.stop && !rbn2.muted && !rbn2.techniqueOnly) {
            if (rbn2.effect === 98 || rbn2.preBend !== undefined) hasPriorBend2 = true;
            break;
          }
        }
      }
      if (!hasPriorBend2) {
        note.effect = 0;
        setStatus("Release requires a prior bend or pre-bend on this string");
      }
    }
    // Auto-correct slide direction on direct placement
    if (note.attack && (note.effect === 47 || note.effect === 92)) {
      // Remove vibrato markers AFTER this slide (between slide and target)
      for (var svfm = cur.measure; svfm < t.measures.length; svfm++) {
        var svfStart = (svfm === cur.measure) ? cur.beat + 1 : 0;
        for (var svfb = svfStart; svfb < t.measures[svfm].beats.length; svfb++) {
          var svfn = t.measures[svfm].beats[svfb].notes[cur.string];
          if (svfn && svfn.attack && !svfn.stop && !svfn.muted && !svfn.techniqueOnly) break;
          if (svfn && svfn.techniqueOnly && svfn.effect === 126) {
            t.measures[svfm].beats[svfb].notes[cur.string] = null;
            setStatus("Vibrato removed — not allowed after slide");
          }
        }
      }
      // Forward: check next note
      for (var sfm = cur.measure; sfm < t.measures.length; sfm++) {
        var sfStart = (sfm === cur.measure) ? cur.beat + 1 : 0;
        for (var sfb = sfStart; sfb < t.measures[sfm].beats.length; sfb++) {
          var sfn = t.measures[sfm].beats[sfb].notes[cur.string];
          if (sfn && sfn.attack && !sfn.stop && !sfn.muted && !sfn.techniqueOnly) {
            if (note.fret < sfn.fret) note.effect = 47;
            else if (note.fret > sfn.fret) note.effect = 92;
            else { note.effect = 0; setStatus("Cannot slide to same fret"); }
            sfm = t.measures.length; break;
          }
        }
      }
      // Backward: if previous note has a slide, auto-correct it too
      for (var sbm = cur.measure; sbm >= 0; sbm--) {
        var sbEnd = (sbm === cur.measure) ? cur.beat - 1 : t.measures[sbm].beats.length - 1;
        for (var sbb = sbEnd; sbb >= 0; sbb--) {
          var sbn = t.measures[sbm].beats[sbb].notes[cur.string];
          if (sbn && sbn.attack && !sbn.stop && !sbn.muted && !sbn.techniqueOnly) {
            if (sbn.effect === 47 || sbn.effect === 92) {
              if (sbn.fret < note.fret) sbn.effect = 47;
              else if (sbn.fret > note.fret) sbn.effect = 92;
              else sbn.effect = 0;
            }
            sbm = -1; break;
          }
          // Also check technique-only slide markers
          if (sbn && sbn.techniqueOnly && (sbn.effect === 47 || sbn.effect === 92)) {
            // Find the ringing note before this marker
            for (var sbm2 = sbm; sbm2 >= 0; sbm2--) {
              var sbEnd2 = (sbm2 === sbm) ? sbb - 1 : t.measures[sbm2].beats.length - 1;
              for (var sbb2 = sbEnd2; sbb2 >= 0; sbb2--) {
                var sbn2 = t.measures[sbm2].beats[sbb2].notes[cur.string];
                if (sbn2 && sbn2.attack && !sbn2.stop && !sbn2.muted && !sbn2.techniqueOnly) {
                  if (sbn2.fret < note.fret) sbn.effect = 47;
                  else if (sbn2.fret > note.fret) sbn.effect = 92;
                  else { m.beats[sbb].notes[cur.string] = null; } // same fret, remove marker
                  sbm2 = -1; break;
                }
              }
            }
            sbm = -1; break;
          }
        }
      }
    }
    setSong(s3);
  }, [song, ati, cur]);

  // Clear all track effects from current track
  var clearTrackEffects = useCallback(function() {
    if (!song) return; _undoLabel.current = "Clear All Track Effects";
    var s3 = JSON.parse(JSON.stringify(song));
    var t = s3.tracks[ati];
    for (var mi = 0; mi < t.measures.length; mi++) {
      for (var bi = 0; bi < t.measures[mi].beats.length; bi++) {
        delete t.measures[mi].beats[bi].trkEffect;
      }
    }
    setSong(s3);
  }, [song, ati]);

  // Place muted string marker (x)
  var placeMuted = useCallback(function() {
    if (!song) return; _undoLabel.current = "Muted note";
    var s3 = JSON.parse(JSON.stringify(song));
    s3.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string] = {fret:-1,attack:true,effect:0,muted:true};
    setSong(s3);
  }, [song, ati, cur]);

  // Place stop string marker (*)
  var placeStop = useCallback(function() {
    if (!song) return; _undoLabel.current = "Stop note";
    var s3 = JSON.parse(JSON.stringify(song));
    s3.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string] = {fret:-2,attack:true,effect:0,stop:true};
    setSong(s3);
  }, [song, ati, cur]);

  // Clear current beat position (all strings)
  var clearBeat = useCallback(function() {
    if (!song) return; _undoLabel.current = "Clear";
    var s3 = JSON.parse(JSON.stringify(song));
    var t3 = s3.tracks[ati];
    if (sel) {
      // Clear all notes in selection (multi-track aware)
      var sm1 = Math.min(sel.startMeasure, sel.endMeasure);
      var sm2 = Math.max(sel.startMeasure, sel.endMeasure);
      var sb1 = sel.startMeasure <= sel.endMeasure ? sel.startBeat : sel.endBeat;
      var sb2 = sel.startMeasure <= sel.endMeasure ? sel.endBeat : sel.startBeat;
      if (sel.startMeasure === sel.endMeasure) { sb1 = Math.min(sel.startBeat, sel.endBeat); sb2 = Math.max(sel.startBeat, sel.endBeat); }
      var tStart = sel.startTrack != null ? Math.min(sel.startTrack, sel.endTrack) : ati;
      var tEnd = sel.endTrack != null ? Math.max(sel.startTrack, sel.endTrack) : ati;
      for (var ti3 = tStart; ti3 <= tEnd && ti3 < s3.tracks.length; ti3++) {
        var tk3 = s3.tracks[ti3];
        for (var mi3 = sm1; mi3 <= sm2 && mi3 < tk3.measures.length; mi3++) {
          var m3 = tk3.measures[mi3];
          var bStart = (mi3 === sm1) ? sb1 : 0;
          var bEnd = (mi3 === sm2) ? sb2 : m3.beats.length - 1;
          for (var bi3 = bStart; bi3 <= bEnd && bi3 < m3.beats.length; bi3++) {
            var bt3 = m3.beats[bi3];
            for (var ci = 0; ci < bt3.notes.length; ci++) bt3.notes[ci] = null;
            bt3.topChar = 0; bt3.botChar = 0;
          }
        }
      }
    } else {
      // Clear only the note under the cursor
      var beat = t3.measures[cur.measure].beats[cur.beat];
      beat.notes[cur.string] = null;
    }
    setSong(s3);
  }, [song, ati, cur, sel]);

  // Move note up/down (change fret number)
  var moveNote = useCallback(function(delta) {
    if (!song) return; _undoLabel.current = "Move note " + (delta > 0 ? "up" : "down");
    var t2 = song.tracks[ati];
    if (t2.isDrum) { setStatus("Cannot move notes on drum tracks"); return; }

    function isFretted(n) { return n && n.attack && !n.muted && !n.stop && !n.techniqueOnly && !n.vibratoOnly; }

    // Multi-beat selection
    if (sel) {
      var ns2 = normSel(sel, t2);
      var tSt = sel.startTrack != null ? Math.min(sel.startTrack, sel.endTrack) : ati;
      var tEn = sel.endTrack != null ? Math.max(sel.startTrack, sel.endTrack) : ati;
      // Validate all notes can move
      for (var vti = tSt; vti <= tEn && vti < song.tracks.length; vti++) {
        var vt = song.tracks[vti]; if (vt.isDrum) { setStatus("Cannot move notes on drum track " + (vti+1)); return; }
        for (var vmi = ns2.sm; vmi <= ns2.em; vmi++) {
          var vm = vt.measures[vmi]; if (!vm) continue;
          var vbs = (vmi === ns2.sm) ? ns2.sb : 0, vbe = (vmi === ns2.em) ? ns2.eb : vm.beats.length - 1;
          for (var vbi = vbs; vbi <= vbe; vbi++) {
            var vbt = vm.beats[vbi];
            for (var vsi = 0; vsi < vt.numStrings; vsi++) {
              var vn = vbt.notes[vsi];
              if (!vn) continue;
              var ts = vsi + delta;
              if (ts < 0 || ts >= vt.numStrings) { setStatus("Cannot move — note at string " + (vsi+1) + " would go out of range"); return; }
              if (isFretted(vn)) {
                var curP = (vt.tuning[vsi] || 40) + vn.fret + (vt.capo || 0) + (vt.transpose || 0);
                var newF = curP - (vt.tuning[ts] || 40) - (vt.capo || 0) - (vt.transpose || 0);
                if (newF < 0 || newF > (vt.maxFret||24)) { setStatus("Cannot move — fret " + newF + " out of range on string " + (ts+1)); return; }
              }
            }
          }
        }
      }
      // Apply moves
      var s3 = JSON.parse(JSON.stringify(song));
      for (var ati2 = tSt; ati2 <= tEn && ati2 < s3.tracks.length; ati2++) {
        var at = s3.tracks[ati2]; if (at.isDrum) continue;
        for (var ami = ns2.sm; ami <= ns2.em; ami++) {
          var am = at.measures[ami]; if (!am) continue;
          var abs2 = (ami === ns2.sm) ? ns2.sb : 0, abe = (ami === ns2.em) ? ns2.eb : am.beats.length - 1;
          for (var abi = abs2; abi <= abe; abi++) {
            var abt = am.beats[abi];
            var indices = [];
            for (var asi = 0; asi < at.numStrings; asi++) if (abt.notes[asi]) indices.push(asi);
            if (delta > 0) indices.sort(function(a,b){return b-a;}); else indices.sort(function(a,b){return a-b;});
            for (var aii = 0; aii < indices.length; aii++) {
              var si = indices[aii], ts2 = si + delta;
              var n2 = abt.notes[si];
              if (isFretted(n2)) {
                var moved = JSON.parse(JSON.stringify(n2));
                var cp = (at.tuning[si] || 40) + n2.fret + (at.capo || 0) + (at.transpose || 0);
                moved.fret = cp - (at.tuning[ts2] || 40) - (at.capo || 0) - (at.transpose || 0);
                // Adjust pre-bend
                if (moved.preBend !== undefined) {
                  var pbPitch = (at.tuning[si] || 40) + n2.preBend + (at.capo || 0) + (at.transpose || 0);
                  var newPb = pbPitch - (at.tuning[ts2] || 40) - (at.capo || 0) - (at.transpose || 0);
                  if (newPb < 0 || newPb > (at.maxFret||24) || newPb >= moved.fret) { delete moved.preBend; }
                  else { moved.preBend = newPb; }
                }
                abt.notes[ts2] = moved;
              } else {
                abt.notes[ts2] = JSON.parse(JSON.stringify(n2));
              }
              abt.notes[si] = null;
            }
          }
        }
      }
      setSong(s3);
      setStatus("Moved notes " + (delta > 0 ? "up" : "down"));
      return;
    }
    // Single note
    var targetStr = cur.string + delta;
    if (targetStr < 0 || targetStr >= t2.numStrings) { setStatus("Cannot move — target string out of range"); return; }
    var beat = t2.measures[cur.measure].beats[cur.beat];
    var note = beat.notes[cur.string];
    if (!note) { setStatus("No note to move"); return; }
    if (beat.notes[targetStr]) { setStatus("Cannot move — string " + (targetStr+1) + " already has a note"); return; }
    var s4 = JSON.parse(JSON.stringify(song));
    var b2 = s4.tracks[ati].measures[cur.measure].beats[cur.beat];
    if (isFretted(note)) {
      var moved2 = JSON.parse(JSON.stringify(note));
      var curPitch = (t2.tuning[cur.string] || 40) + note.fret + (t2.capo || 0) + (t2.transpose || 0);
      var newFret = curPitch - (t2.tuning[targetStr] || 40) - (t2.capo || 0) - (t2.transpose || 0);
      if (newFret < 0 || newFret > (t2.maxFret||24)) { setStatus("Cannot move — fret " + newFret + " out of range on string " + (targetStr+1)); return; }
      moved2.fret = newFret;
      // Adjust pre-bend
      if (moved2.preBend !== undefined) {
        var pbPitch2 = (t2.tuning[cur.string] || 40) + note.preBend + (t2.capo || 0) + (t2.transpose || 0);
        var newPb2 = pbPitch2 - (t2.tuning[targetStr] || 40) - (t2.capo || 0) - (t2.transpose || 0);
        if (newPb2 < 0 || newPb2 > (t2.maxFret||24) || newPb2 >= moved2.fret) { delete moved2.preBend; setStatus("Pre-bend dropped (out of range on target string)"); }
        else { moved2.preBend = newPb2; }
      }
      b2.notes[targetStr] = moved2;
    } else {
      b2.notes[targetStr] = JSON.parse(JSON.stringify(note));
    }
    b2.notes[cur.string] = null;
    setSong(s4);
    setCur({ measure: cur.measure, beat: cur.beat, string: targetStr });
  }, [song, ati, cur, sel]);

  // Shift Note Up/Down: move note to adjacent string, keeping exact fret value and effects
  var shiftNote = useCallback(function(delta) {
    if (!song) return;
    var t2 = song.tracks[ati];
    if (sel) {
      var ns2 = normSel(sel, t2);
      var tSt = sel.startTrack != null ? Math.min(sel.startTrack, sel.endTrack) : ati;
      var tEn = sel.endTrack != null ? Math.max(sel.startTrack, sel.endTrack) : ati;
      // Validate all notes can shift
      for (var vti = tSt; vti <= tEn && vti < song.tracks.length; vti++) {
        var vt = song.tracks[vti];
        for (var vmi = ns2.sm; vmi <= ns2.em; vmi++) {
          var vm = vt.measures[vmi]; if (!vm) continue;
          var vbs = (vmi === ns2.sm) ? ns2.sb : 0, vbe = (vmi === ns2.em) ? ns2.eb : vm.beats.length - 1;
          for (var vbi = vbs; vbi <= vbe; vbi++) {
            for (var vsi = 0; vsi < vt.numStrings; vsi++) {
              if (vm.beats[vbi].notes[vsi]) {
                var ts = vsi + delta;
                if (ts < 0 || ts >= vt.numStrings) { setStatus("Cannot shift — note at string " + (vsi+1) + " would go out of range"); return; }
              }
            }
          }
        }
      }
      _undoLabel.current = "Shift " + (delta > 0 ? "up" : "down");
      var s3 = JSON.parse(JSON.stringify(song));
      for (var ati2 = tSt; ati2 <= tEn && ati2 < s3.tracks.length; ati2++) {
        var at = s3.tracks[ati2];
        for (var ami = ns2.sm; ami <= ns2.em; ami++) {
          var am = at.measures[ami]; if (!am) continue;
          var abs2 = (ami === ns2.sm) ? ns2.sb : 0, abe = (ami === ns2.em) ? ns2.eb : am.beats.length - 1;
          for (var abi = abs2; abi <= abe; abi++) {
            var abt = am.beats[abi];
            var indices = [];
            for (var asi = 0; asi < at.numStrings; asi++) if (abt.notes[asi]) indices.push(asi);
            if (delta > 0) indices.sort(function(a,b){return b-a;}); else indices.sort(function(a,b){return a-b;});
            for (var aii = 0; aii < indices.length; aii++) {
              var si = indices[aii], ts2 = si + delta;
              abt.notes[ts2] = JSON.parse(JSON.stringify(abt.notes[si]));
              abt.notes[si] = null;
            }
          }
        }
      }
      setSong(s3);
      setStatus("Shifted notes " + (delta > 0 ? "up" : "down"));
      return;
    }
    // Single note
    var targetStr = cur.string + delta;
    if (targetStr < 0 || targetStr >= t2.numStrings) { setStatus("Cannot shift — target string out of range"); return; }
    var beat = t2.measures[cur.measure].beats[cur.beat];
    var note = beat.notes[cur.string];
    if (!note) { setStatus("No note to shift"); return; }
    if (beat.notes[targetStr]) { setStatus("Cannot shift — string " + (targetStr+1) + " already has a note"); return; }
    _undoLabel.current = "Shift " + (delta > 0 ? "up" : "down");
    var s4 = JSON.parse(JSON.stringify(song));
    var b2 = s4.tracks[ati].measures[cur.measure].beats[cur.beat];
    b2.notes[targetStr] = JSON.parse(JSON.stringify(note));
    b2.notes[cur.string] = null;
    setSong(s4);
    setCur({ measure: cur.measure, beat: cur.beat, string: targetStr });
  }, [song, ati, cur, sel]);

  var transposeNote = useCallback(function(delta) {
    if (!song) return; _undoLabel.current = "Transpose " + (delta > 0 ? "up" : "down");
    var t2 = song.tracks[ati];
    if (t2.isDrum) { setStatus("Cannot transpose notes on drum tracks"); return; }
    var step = delta * 12; // one octave

    function isTransposable(n) { return n && n.attack && !n.muted && !n.stop && !n.techniqueOnly && !n.vibratoOnly; }

    // Multi-beat selection
    if (sel) {
      var ns2 = normSel(sel, t2);
      var tSt = sel.startTrack != null ? Math.min(sel.startTrack, sel.endTrack) : ati;
      var tEn = sel.endTrack != null ? Math.max(sel.startTrack, sel.endTrack) : ati;
      // Validate all transposable notes
      for (var vti = tSt; vti <= tEn && vti < song.tracks.length; vti++) {
        var vt = song.tracks[vti]; if (vt.isDrum) { setStatus("Cannot transpose notes on drum track " + (vti+1)); return; }
        for (var vmi = ns2.sm; vmi <= ns2.em; vmi++) {
          var vm = vt.measures[vmi]; if (!vm) continue;
          var vbs = (vmi === ns2.sm) ? ns2.sb : 0, vbe = (vmi === ns2.em) ? ns2.eb : vm.beats.length - 1;
          for (var vbi = vbs; vbi <= vbe; vbi++) {
            var vbt = vm.beats[vbi];
            for (var vsi = 0; vsi < vt.numStrings; vsi++) {
              var vn = vbt.notes[vsi];
              if (!isTransposable(vn)) continue;
              var nf = vn.fret + step;
              if (nf < 0 || nf > (vt.maxFret||24)) { setStatus("Cannot transpose — fret " + nf + " out of range on string " + (vsi+1)); return; }
            }
          }
        }
      }
      // Apply
      var s3 = JSON.parse(JSON.stringify(song));
      for (var ati2 = tSt; ati2 <= tEn && ati2 < s3.tracks.length; ati2++) {
        var at = s3.tracks[ati2]; if (at.isDrum) continue;
        for (var ami = ns2.sm; ami <= ns2.em; ami++) {
          var am = at.measures[ami]; if (!am) continue;
          var abs2 = (ami === ns2.sm) ? ns2.sb : 0, abe = (ami === ns2.em) ? ns2.eb : am.beats.length - 1;
          for (var abi = abs2; abi <= abe; abi++) {
            var abt = am.beats[abi];
            for (var asi = 0; asi < at.numStrings; asi++) {
              var n2 = abt.notes[asi];
              if (!isTransposable(n2)) continue;
              n2.fret += step;
              // Adjust pre-bend
              if (n2.preBend !== undefined) {
                n2.preBend += step;
                if (n2.preBend < 0 || n2.preBend > (at.maxFret||24) || n2.preBend >= n2.fret) { delete n2.preBend; }
              }
            }
          }
        }
      }
      setSong(s3);
      setStatus("Transposed " + (delta > 0 ? "up" : "down") + " one octave");
      return;
    }
    // Single note
    var beat = t2.measures[cur.measure].beats[cur.beat];
    var note = beat.notes[cur.string];
    if (!note) { setStatus("No note to transpose"); return; }
    if (!isTransposable(note)) return; // silently skip muted/stop/technique
    var newFret = note.fret + step;
    if (newFret < 0 || newFret > (t2.maxFret||24)) { setStatus("Cannot transpose — fret " + newFret + " out of range"); return; }
    var s4 = JSON.parse(JSON.stringify(song));
    var tn = s4.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];
    tn.fret = newFret;
    // Adjust pre-bend
    if (tn.preBend !== undefined) {
      tn.preBend += step;
      if (tn.preBend < 0 || tn.preBend > (t2.maxFret||24) || tn.preBend >= tn.fret) {
        delete tn.preBend;
        setStatus("Transposed to fret " + newFret + " (pre-bend dropped — out of range)");
        setSong(s4); return;
      }
    }
    setSong(s4);
    setStatus("Transposed to fret " + newFret);
  }, [song, ati, cur, sel]);

  // Fret Adjust: increment or decrement fret value by 1
  var fretAdjust = useCallback(function(delta) {
    if (!song) return; _undoLabel.current = delta > 0 ? "Increment note" : "Decrement note";
    var t2 = song.tracks[ati];
    if (t2.isDrum) { setStatus("Cannot adjust frets on drum tracks"); return; }

    function isAdjustable(n) { return n && n.attack && !n.muted && !n.stop && !n.techniqueOnly && !n.vibratoOnly; }
    var mf = t2.maxFret || 24;

    // Multi-beat selection
    if (sel) {
      var ns2 = normSel(sel, t2);
      var tSt = sel.startTrack != null ? Math.min(sel.startTrack, sel.endTrack) : ati;
      var tEn = sel.endTrack != null ? Math.max(sel.startTrack, sel.endTrack) : ati;
      // Validate
      for (var vti = tSt; vti <= tEn && vti < song.tracks.length; vti++) {
        var vt = song.tracks[vti]; if (vt.isDrum) continue;
        var vmf = vt.maxFret || 24;
        for (var vmi = ns2.sm; vmi <= ns2.em; vmi++) {
          var vm = vt.measures[vmi]; if (!vm) continue;
          var vbs = (vmi === ns2.sm) ? ns2.sb : 0, vbe = (vmi === ns2.em) ? ns2.eb : vm.beats.length - 1;
          for (var vbi = vbs; vbi <= vbe; vbi++) {
            for (var vsi = 0; vsi < vt.numStrings; vsi++) {
              var vn = vm.beats[vbi].notes[vsi];
              if (!isAdjustable(vn)) continue;
              var nf = vn.fret + delta;
              if (nf < 0 || nf > vmf) { setStatus("Cannot adjust — fret " + nf + " out of range"); return; }
            }
          }
        }
      }
      // Apply
      var s3 = JSON.parse(JSON.stringify(song));
      var count = 0;
      for (var ati2 = tSt; ati2 <= tEn && ati2 < s3.tracks.length; ati2++) {
        var at = s3.tracks[ati2]; if (at.isDrum) continue;
        for (var ami = ns2.sm; ami <= ns2.em; ami++) {
          var am = at.measures[ami]; if (!am) continue;
          var abs2 = (ami === ns2.sm) ? ns2.sb : 0, abe = (ami === ns2.em) ? ns2.eb : am.beats.length - 1;
          for (var abi = abs2; abi <= abe; abi++) {
            for (var asi = 0; asi < at.numStrings; asi++) {
              var n2 = am.beats[abi].notes[asi];
              if (!isAdjustable(n2)) continue;
              n2.fret += delta;
              count++;
            }
          }
        }
      }
      setSong(s3);
      setStatus("Adjusted " + count + " note" + (count !== 1 ? "s" : "") + " by " + (delta > 0 ? "+" : "") + delta);
      return;
    }
    // Single note
    var beat = t2.measures[cur.measure].beats[cur.beat];
    var note = beat.notes[cur.string];
    if (!note) { setStatus("No note to adjust"); return; }
    if (!isAdjustable(note)) return;
    var newFret = note.fret + delta;
    if (newFret < 0 || newFret > mf) { setStatus("Cannot adjust — fret " + newFret + " out of range"); return; }
    var s4 = JSON.parse(JSON.stringify(song));
    s4.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].fret = newFret;
    setSong(s4);
    setStatus("Fret " + newFret);
  }, [song, ati, cur, sel]);

  // Cut beat (copy + clear)
  var cutBeat = useCallback(function() {
    if (!song) return; _undoLabel.current = "Cut";
    try {
      var cb2 = song.tracks[ati].measures[cur.measure].beats[cur.beat];
      clipboard.current = {type:"beat", data:JSON.parse(JSON.stringify(cb2))};
    } catch(e2) {}
    var s3 = JSON.parse(JSON.stringify(song));
    var beat = s3.tracks[ati].measures[cur.measure].beats[cur.beat];
    for (var ci2 = 0; ci2 < beat.notes.length; ci2++) beat.notes[ci2] = null;
    beat.topChar = 0; beat.botChar = 0;
    setSong(s3); setStatus("Cut beat");
  }, [song, ati, cur]);

  // Delete track
  var deleteTrack = useCallback(function() {
    if (!song || song.tracks.length <= 1) return;
    var s3 = JSON.parse(JSON.stringify(song));
    s3.tracks.splice(ati, 1);
    var newAti = Math.min(ati, s3.tracks.length - 1);
    atiRef.current = newAti; setAti(newAti);
    setSong(s3);
  }, [song, ati]);

  // Scroll canvas to show target measure at ~30% from left
  function scrollToMeasure(mi) {
    if (!sRef.current || !song) return;
    var BW3=18,MP3=3,LW3=48;
    var px=LW3;
    for(var gi=0;gi<mi&&gi<measWidths.length;gi++){
      px+=measWidths[gi]*BW3+MP3*2+1;
    }
    var el3=sRef.current;
    if(px<el3.scrollLeft+40||px>el3.scrollLeft+el3.clientWidth*0.8){
      el3.scrollLeft=Math.max(0,px-el3.clientWidth*0.3);
    }
  }

  // Normalize selection so start <= end
  function normSel(s, t) {
    if (!s) return null;
    var sm = s.startMeasure, sb = s.startBeat, em = s.endMeasure, eb = s.endBeat;
    if (sm > em || (sm === em && sb > eb)) { var tm=sm; sm=em; em=tm; var tb=sb; sb=eb; eb=tb; }
    return {sm:sm, sb:sb, em:em, eb:eb};
  }

  // Welcome screen keyboard shortcuts (Ctrl+N, Ctrl+O only)
  useEffect(function() {
    if (song) return;
    function wkh(e) {
      var ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "n") { e.preventDefault(); newDoc(); }
      if (ctrl && e.key.toLowerCase() === "o") { e.preventDefault(); triggerOpen(); }
    }
    window.addEventListener("keydown", wkh);
    return function(){ window.removeEventListener("keydown", wkh); };
  }, [song]);

  useEffect(function() {
    if (!song) return;
    var t = song.tracks[ati];
    function kh(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
      // Ctrl+F: open/close Find & Replace (handled before the dialog guard so it works while FR is open)
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        if (dlg === "findReplace") { frCloseEditor(); } else if (!dlg) { frOpenEditor(); }
        return;
      }
      if (dlg && dlg !== "remapKeys") return; // Don't process shortcuts when a dialog is open
      var k = e.key, ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey, alt = e.altKey;
      // Fret input (digits)
      // Text line input (when cursor is on top or bottom text line)
      if (cur.string === t.numStrings && t.hasTopText && k.length === 1 && !ctrl) {
        e.preventDefault();
        var st2=JSON.parse(JSON.stringify(song));
        st2.tracks[ati].measures[cur.measure].beats[cur.beat].topChar=k.charCodeAt(0);
        setSong(st2);
        var bts5=t.measures[cur.measure]?t.measures[cur.measure].beats.length:BPM;
        if(cur.beat+1<bts5) setCur({measure:cur.measure,beat:cur.beat+1,string:cur.string});
        else if(cur.measure+1<t.measures.length) setCur({measure:cur.measure+1,beat:0,string:cur.string});
        return;
      }
      if (cur.string === -1 && t.hasBottomText && k.length === 1 && !ctrl) {
        e.preventDefault();
        var st3=JSON.parse(JSON.stringify(song));
        st3.tracks[ati].measures[cur.measure].beats[cur.beat].botChar=k.charCodeAt(0);
        setSong(st3);
        var bts6=t.measures[cur.measure]?t.measures[cur.measure].beats.length:BPM;
        if(cur.beat+1<bts6) setCur({measure:cur.measure,beat:cur.beat+1,string:cur.string});
        else if(cur.measure+1<t.measures.length) setCur({measure:cur.measure+1,beat:0,string:cur.string});
        return;
      }
      if (/^[0-9]$/.test(k) && !shift && !ctrl) { e.preventDefault(); placeNote(parseInt(k)); return; }
      // Remap dialog key capture
      if (dlg === "remapKeys" && dlgData && dlgData.editingAction) {
        e.preventDefault(); e.stopPropagation();
        if (e.key === "Escape") { setDlgData(Object.assign({}, dlgData, {editingAction:null,capturedCombo:null})); return; }
        if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
        var cap = eventToCombo(e);
        if (!cap) return;
        var newKm = Object.assign({}, dlgData.tempKeymap);
        for (var ck in newKm) { if (ck !== dlgData.editingAction && newKm[ck] === cap) { newKm[ck] = newKm[dlgData.editingAction]; break; } }
        newKm[dlgData.editingAction] = cap;
        setDlgData(Object.assign({}, dlgData, {capturedCombo:cap, tempKeymap:newKm, editingAction:null}));
        return;
      }
      var combo = eventToCombo(e);
      // Command Palette
      if (combo === "Ctrl+K") { e.preventDefault(); setCmdPalOpen(true); return; }
      var _action = combo ? reverseKm[combo] : null;
      if (_action==="noteVelocity") { e.preventDefault(); var vt=song.tracks[ati],vb2=vt.measures[cur.measure]&&vt.measures[cur.measure].beats[cur.beat],vn=vb2&&vb2.notes[cur.string]; if(vn){var curV=vn.vel!==undefined?vn.vel:(vt.trackVelocity||80);var newV=window.prompt("Note velocity (1-127, track default: "+(vt.trackVelocity||80)+")\nLeave empty to use track default:",vn.vel!==undefined?String(vn.vel):"");if(newV!==null){var s9=JSON.parse(JSON.stringify(song));var nn=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(newV.trim()===""){delete nn.vel;}else{var vv=parseInt(newV);if(!isNaN(vv)&&vv>=1&&vv<=127)nn.vel=vv;}setSong(s9);}}else{setStatus("No note at cursor");} return; }
      if (_action==="midiControllers") { e.preventDefault(); var qd=buildEfxData(); qd.tab="midi"; openDlg("trackEffects",qd); return; }
      // Navigation
      // Ctrl+Right = start of next bar, Ctrl+Left = start of current/previous bar
      if (k==="ArrowRight" && ctrl && shift) { e.preventDefault(); var bts4=t.measures[cur.measure]?t.measures[cur.measure].beats.length-1:15; if(!sel){setSel({startMeasure:cur.measure,startBeat:0,endMeasure:cur.measure,endBeat:bts4});setCur({measure:cur.measure,beat:bts4,string:cur.string});}else{var nem=Math.min(sel.endMeasure+1,t.measures.length-1);var neb=t.measures[nem]?t.measures[nem].beats.length-1:15;setSel({startMeasure:sel.startMeasure,startBeat:sel.startBeat,endMeasure:nem,endBeat:neb});setCur({measure:nem,beat:neb,string:cur.string});} scrollToMeasure(cur.measure); return; }
      if (k==="ArrowLeft" && ctrl && shift) { e.preventDefault(); if(!sel){var pm=Math.max(0,cur.measure-1);var plb=t.measures[pm]?t.measures[pm].beats.length-1:15;setSel({startMeasure:pm,startBeat:0,endMeasure:pm,endBeat:plb});setCur({measure:pm,beat:0,string:cur.string});}else{var nsm=Math.max(0,sel.startMeasure-1);setSel({startMeasure:nsm,startBeat:0,endMeasure:sel.endMeasure,endBeat:sel.endBeat});setCur({measure:nsm,beat:0,string:cur.string});} scrollToMeasure(Math.max(0,cur.measure-1)); return; }
      if (k==="ArrowRight" && ctrl && !shift) { e.preventDefault(); setSel(null); var nm=Math.min(cur.measure+1,t.measures.length-1); setCur({measure:nm,beat:0,string:cur.string}); if(playing)seekRef.current={measure:nm,beat:0}; scrollToMeasure(nm); return; }
      if (k==="ArrowLeft" && ctrl && !shift) { e.preventDefault(); setSel(null); var pm3=cur.beat>0?cur.measure:Math.max(0,cur.measure-1); setCur({measure:pm3,beat:0,string:cur.string}); if(playing)seekRef.current={measure:pm3,beat:0}; scrollToMeasure(pm3); return; }
      // During playback: plain Left/Right seek playback position
      // During playback: plain Left/Right seek playback position by 1 global beat
      if (playing && k==="ArrowRight" && !shift && !ctrl) { e.preventDefault(); seekingRef.current = true; seekRef.current = {flat: playPosRef.current + 1}; return; }
      if (playing && k==="ArrowLeft" && !shift && !ctrl) { e.preventDefault(); seekingRef.current = true; seekRef.current = {flat: Math.max(0, playPosRef.current - 1)}; return; }
      if (k==="ArrowRight" && shift) { e.preventDefault(); if(!sel) setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat}); var bts3=t.measures[cur.measure]?t.measures[cur.measure].beats.length:BPM; if(cur.beat+1<bts3){setSel(function(s){return s?{startMeasure:s.startMeasure,startBeat:s.startBeat,endMeasure:cur.measure,endBeat:cur.beat+1}:{startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat+1};});setCur({measure:cur.measure,beat:cur.beat+1,string:cur.string});}else if(cur.measure+1<t.measures.length){setSel(function(s){return s?{startMeasure:s.startMeasure,startBeat:s.startBeat,endMeasure:cur.measure+1,endBeat:0}:{startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure+1,endBeat:0};});setCur({measure:cur.measure+1,beat:0,string:cur.string});} scrollToMeasure(cur.measure); return; }
      if (k==="ArrowLeft" && shift) { e.preventDefault(); if(!sel) setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat}); if(cur.beat>0){setSel(function(s){return s?{startMeasure:s.startMeasure,startBeat:s.startBeat,endMeasure:cur.measure,endBeat:cur.beat-1}:{startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat-1};});setCur({measure:cur.measure,beat:cur.beat-1,string:cur.string});}else if(cur.measure>0){var pb2=t.measures[cur.measure-1]?t.measures[cur.measure-1].beats.length-1:BPM-1;setSel(function(s){return s?{startMeasure:s.startMeasure,startBeat:s.startBeat,endMeasure:cur.measure-1,endBeat:pb2}:{startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure-1,endBeat:pb2};});setCur({measure:cur.measure-1,beat:pb2,string:cur.string});} scrollToMeasure(cur.measure>0?cur.measure-1:0); return; }
      if (k==="ArrowRight" && !shift) { e.preventDefault(); setSel(null); var bts=t.measures[cur.measure]?t.measures[cur.measure].beats.length:BPM; if(cur.beat+1<bts){setCur({measure:cur.measure,beat:cur.beat+1,string:cur.string});scrollToMeasure(cur.measure);}else if(cur.measure+1<t.measures.length){setCur({measure:cur.measure+1,beat:0,string:cur.string});scrollToMeasure(cur.measure+1);} }
      if (k==="ArrowLeft" && !shift) { e.preventDefault(); setSel(null); if(cur.beat>0){setCur({measure:cur.measure,beat:cur.beat-1,string:cur.string});scrollToMeasure(cur.measure);}else if(cur.measure>0){var pb=t.measures[cur.measure-1]?t.measures[cur.measure-1].beats.length-1:BPM-1; setCur({measure:cur.measure-1,beat:pb,string:cur.string});scrollToMeasure(cur.measure-1);} }
      if (k==="ArrowDown" && !ctrl) { e.preventDefault(); var minS=t.hasBottomText?-1:0; setCur({measure:cur.measure,beat:cur.beat,string:Math.max(cur.string-1,minS)}); }
      if (k==="ArrowUp" && !ctrl) { e.preventDefault(); var maxS=t.hasTopText?t.numStrings:t.numStrings-1; setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string+1,maxS)}); }
      if (k==="Home") { e.preventDefault(); if(ctrl&&shift){setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:0,endBeat:0});setCur({measure:0,beat:0,string:cur.string});if(sRef.current)sRef.current.scrollLeft=0;}else if(ctrl){setSel(null);setCur({measure:0,beat:0,string:cur.string});if(sRef.current)sRef.current.scrollLeft=0;}else{setSel(null);setCur({measure:cur.measure,beat:0,string:cur.string});} }
      if (k==="End") { e.preventDefault(); var lastM=t.measures.length-1; var lastB=t.measures[lastM].beats.length-1; if(ctrl&&shift){setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:lastM,endBeat:lastB});setCur({measure:lastM,beat:lastB,string:cur.string});scrollToMeasure(lastM);}else if(ctrl){setSel(null);setCur({measure:lastM,beat:0,string:cur.string});scrollToMeasure(lastM);}else{setSel(null);setCur({measure:cur.measure,beat:t.measures[cur.measure].beats.length-1,string:cur.string});} }
      if (k==="Tab" && !ctrl) { e.preventDefault(); var nt=shift?((ati-1+song.tracks.length)%song.tracks.length):((ati+1)%song.tracks.length); atiRef.current=nt; setAti(nt); setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[nt].numStrings-1)}); return; }
      // Move Note Up/Down (Ctrl+Up/Down)
      if (k==="ArrowUp" && ctrl && !alt && !shift) { e.preventDefault(); moveNote(1); return; }
      if (k==="ArrowDown" && ctrl && !alt && !shift) { e.preventDefault(); moveNote(-1); return; }
      // Shift Note Up/Down (Ctrl+Shift+Up/Down)
      if (k==="ArrowUp" && ctrl && shift && !alt) { e.preventDefault(); shiftNote(1); return; }
      if (k==="ArrowDown" && ctrl && shift && !alt) { e.preventDefault(); shiftNote(-1); return; }
      // Transpose Note Up/Down (Ctrl+Alt+Up/Down)
      if (k==="ArrowUp" && ctrl && alt) { e.preventDefault(); transposeNote(1); return; }
      if (k==="ArrowDown" && ctrl && alt) { e.preventDefault(); transposeNote(-1); return; }
      // Increment/Decrement Note (Alt+Up/Down)
      if (k==="ArrowUp" && alt && !ctrl && !shift) { e.preventDefault(); fretAdjust(1); return; }
      if (k==="ArrowDown" && alt && !ctrl && !shift) { e.preventDefault(); fretAdjust(-1); return; }

      // PageUp/PageDown: switch tracks
      if (k==="PageUp") { e.preventDefault();
        var ntUp=Math.max(0,ati-1);
        if(ntUp!==ati){atiRef.current=ntUp;setAti(ntUp);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[ntUp].numStrings-1)});
          setTimeout(function(){var el=stickyRefs.current[ntUp+1];if(el&&el.parentElement&&sRef.current){var wrapper=el.parentElement;var wTop=wrapper.offsetTop;var wH=wrapper.offsetHeight;var sH=sRef.current.clientHeight;if(wH<=sH){sRef.current.scrollTop=Math.max(0,wTop-Math.max(0,(sH-wH)/2));}else{sRef.current.scrollTop=Math.max(0,wTop-4);}}},50);}
        return; }
      if (k==="PageDown") { e.preventDefault();
        var ntDn=Math.min(song.tracks.length-1,ati+1);
        if(ntDn!==ati){atiRef.current=ntDn;setAti(ntDn);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[ntDn].numStrings-1)});
          setTimeout(function(){var el=stickyRefs.current[ntDn+1];if(el&&el.parentElement&&sRef.current){var wrapper=el.parentElement;var wTop=wrapper.offsetTop;var wH=wrapper.offsetHeight;var sH=sRef.current.clientHeight;if(wH<=sH){sRef.current.scrollTop=Math.max(0,wTop-Math.max(0,(sH-wH)/2));}else{sRef.current.scrollTop=Math.max(0,wTop-4);}}},50);}
        return; }
      // Delete / clear current note or text
      if (k==="Backspace" && !ctrl) { e.preventDefault(); var s4=JSON.parse(JSON.stringify(song)); if(cur.string===t.numStrings){s4.tracks[ati].measures[cur.measure].beats[cur.beat].topChar=0;} else if(cur.string===-1){s4.tracks[ati].measures[cur.measure].beats[cur.beat].botChar=0;} else {s4.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string]=null; if(shift){s4.tracks[ati].measures[cur.measure].beats[cur.beat].topChar=0;s4.tracks[ati].measures[cur.measure].beats[cur.beat].botChar=0;}} setSong(s4); }
      if (_action==="deleteNote") { e.preventDefault();
        // Delete Note: remove beat at cursor, shift everything right of cursor left across all bars
        var sd=JSON.parse(JSON.stringify(song)); var dt=sd.tracks[ati];
        // Collect all beats from cursor to end of song
        var allBeats = [];
        for (var dmi = cur.measure; dmi < dt.measures.length; dmi++) {
          var dStart = (dmi === cur.measure) ? cur.beat : 0;
          for (var dbi = dStart; dbi < dt.measures[dmi].beats.length; dbi++) {
            allBeats.push(dt.measures[dmi].beats[dbi]);
          }
        }
        // Remove the first beat (at cursor) and add blank at end
        allBeats.shift();
        allBeats.push({notes: new Array(dt.numStrings).fill(null)});
        // Write back into bar structure
        var dIdx = 0;
        for (var dmi2 = cur.measure; dmi2 < dt.measures.length; dmi2++) {
          var dStart2 = (dmi2 === cur.measure) ? cur.beat : 0;
          for (var dbi2 = dStart2; dbi2 < dt.measures[dmi2].beats.length; dbi2++) {
            dt.measures[dmi2].beats[dbi2] = allBeats[dIdx++];
          }
        }
        setSong(sd); setStatus("Deleted note at cursor"); return;
      }
      if (_action==="insertNote") { e.preventDefault();
        // Insert Note: insert blank beat at cursor, shift everything right across all bars, drop last beat
        var si2=JSON.parse(JSON.stringify(song)); var it=si2.tracks[ati];
        var allBeats2 = [];
        for (var imi = cur.measure; imi < it.measures.length; imi++) {
          var iStart = (imi === cur.measure) ? cur.beat : 0;
          for (var ibi = iStart; ibi < it.measures[imi].beats.length; ibi++) {
            allBeats2.push(it.measures[imi].beats[ibi]);
          }
        }
        // Insert blank at beginning (cursor position), drop last beat
        allBeats2.unshift({notes: new Array(it.numStrings).fill(null)});
        allBeats2.pop();
        // Write back
        var iIdx = 0;
        for (var imi2 = cur.measure; imi2 < it.measures.length; imi2++) {
          var iStart2 = (imi2 === cur.measure) ? cur.beat : 0;
          for (var ibi2 = iStart2; ibi2 < it.measures[imi2].beats.length; ibi2++) {
            it.measures[imi2].beats[ibi2] = allBeats2[iIdx++];
          }
        }
        setSong(si2); setStatus("Inserted note at cursor"); return;
      }
      // Clear beat (Space when no text line, or Ctrl+Backspace for track effects)
      if (_action==="clearTrackEffect") { e.preventDefault(); _undoLabel.current="Clear Track Effects";var sc2=JSON.parse(JSON.stringify(song)); delete sc2.tracks[ati].measures[cur.measure].beats[cur.beat].trkEffect; setSong(sc2); setOpenMenu(null); return; }
      // Muted String (x), Stop String (*)
      if (k==="x" && !ctrl) { e.preventDefault(); placeMuted(); return; }
      if (k==="*" || (k==="8" && shift)) { e.preventDefault(); placeStop(); return; }
      if (k==="!" || (k==="1" && shift)) { e.preventDefault();
        if (!song || cur.string < 0 || cur.string >= track.numStrings) return;
        var s9r = JSON.parse(JSON.stringify(song));
        var n9r = s9r.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];
        if (n9r && n9r.attack && !n9r.stop && !n9r.muted) {
          n9r.ring = !n9r.ring;
          setSong(s9r);
          setStatus(n9r.ring ? "Indefinite ring ON" : "Indefinite ring OFF");
        } else {
          setStatus("Place a note first, then toggle ring with !");
        }
        return;
      }
      // Bend hold (=)
      if (!ctrl && (k==="=" || (k==="=" && shift))) { e.preventDefault();
        if (!song || cur.string < 0 || cur.string >= track.numStrings) return;
        var s9h = JSON.parse(JSON.stringify(song));
        var n9h = s9h.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];
        if (n9h && n9h.attack && !n9h.stop && !n9h.muted) {
          n9h.bendHold = !n9h.bendHold;
          setSong(s9h);
          setStatus(n9h.bendHold ? "Bend hold ON" : "Bend hold OFF");
        } else { setStatus("Place a note first"); }
        return;
      }
      // Pre-bend (Ctrl+B)
      if (_action==="preBend") { e.preventDefault();
        if (!song || cur.string < 0 || cur.string >= track.numStrings) return;
        var n9pb = song.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];
        if (n9pb && n9pb.attack && !n9pb.stop && !n9pb.muted) {
          var pbVal = window.prompt("Pre-bend from fret (empty to clear):", n9pb.preBend !== undefined ? String(n9pb.preBend) : "");
          if (pbVal !== null) {
            var s9pb = JSON.parse(JSON.stringify(song));
            var nn9pb = s9pb.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];
            if (pbVal.trim() === "") { delete nn9pb.preBend; }
            else { var pf = parseInt(pbVal); if (!isNaN(pf) && pf >= 0 && pf <= 24) { if (pf >= nn9pb.fret) { setStatus("Pre-bend fret " + pf + " must be lower than note fret " + nn9pb.fret); } else { nn9pb.preBend = pf; } } }
            setSong(s9pb);
          }
        } else { setStatus("Place a note first"); }
        return;
      }
      // Per-string effects (keyboard shortcuts from exe)
      if (!ctrl && "hp/\\^br~ts(<{wm".indexOf(k) >= 0 && k !== "" && cur.string >= 0 && cur.string < t.numStrings) { e.preventDefault(); toggleEffect(k.charCodeAt(0)); return; }
      // Playback
      if (_action==="playTrack") { e.preventDefault(); doPlay(false); return; }
      if (_action==="playAll") { e.preventDefault(); doPlay(true); return; }
      if (_action==="playAllSpace") { e.preventDefault(); doPlay(true); return; }
      if (_action==="holdToPlay") { e.preventDefault(); if(!playing) doPlay(true); return; }
      if (k==="Escape"||_action==="stop") { e.preventDefault(); if(showCheatSheet){setShowCheatSheet(false);return;} if(ctxMenuData){setCtxMenuData(null);return;} if(!playing){_setCurRaw({measure:0,beat:0,string:cur.string});if(sRef.current)sRef.current.scrollLeft=0;return;} stopPlay(); return; }
      if (_action==="rewind") { e.preventDefault(); setRewindAfterStop(!rewindAfterStop); setStatus(rewindAfterStop?"Rewind after stop OFF":"Rewind after stop ON"); return; }
      if (k===" " && !ctrl && t.hasTopText && cur.string === t.numStrings) { e.preventDefault(); var st=JSON.parse(JSON.stringify(song)); st.tracks[ati].measures[cur.measure].beats[cur.beat].topChar=32; setSong(st); var bts2=t.measures[cur.measure]?t.measures[cur.measure].beats.length:BPM; if(cur.beat+1<bts2) setCur({measure:cur.measure,beat:cur.beat+1,string:cur.string}); else if(cur.measure+1<t.measures.length) setCur({measure:cur.measure+1,beat:0,string:cur.string}); return; }
      if (k===" " && !ctrl) { e.preventDefault(); clearBeat(); return; }
      // Dialogs
      if (k==="F2"||_action==="trackProps") { e.preventDefault(); var tp=song.tracks[ati]; openDlg("trackProps",trackPropsData(tp)); return; }
      if (k==="F4"||_action==="songTempo") { e.preventDefault(); openDlg("tempo",{tempo:song.tempo}); return; }
      if (_action==="timeSig") { e.preventDefault(); var curTs=getTimeSig(t.measures[cur.measure]);openDlg("timeSig",{num:curTs.num,den:curTs.den,applyAll:false}); return; }
      if (_action==="songTitle") { e.preventDefault(); openDlg("title",{title:song.title,artist:song.artist,album:song.album,transcribedBy:song.transcribedBy,copyright:song.copyright}); return; }
      if (_action==="goToBar") { e.preventDefault(); openDlg("goToBar",{bar:cur.measure+1}); return; }
      if (_action==="chordBuilder") { e.preventDefault(); var t2c=song.tracks[ati];openDlg("chord",{root:0,qualIdx:0,posIdx:0,bass:"root",tuning:t2c.tuning.slice(),numStrings:t2c.numStrings,voicings:[],selectedFrets:null}); return; }
      if (_action==="altTimeRegion") { e.preventDefault(); openDlg("altTime"); return; }
      if (_action==="closeTab") { e.preventDefault(); closeDoc(activeDocIdx); return; }
      if (k==="Tab"&&ctrl) { e.preventDefault(); if(docs.current.length>1){var ni=(activeDocIdx+(shift?-1:1)+docs.current.length)%docs.current.length;switchDoc(ni);} return; }
      // Zoom: Ctrl+= / Ctrl+- / Ctrl+0
      if (ctrl && (k==="=" || k==="+")) { e.preventDefault(); setZoom(Math.min((zoomRef.current||100)+10,200)); return; }
      if (ctrl && k==="-") { e.preventDefault(); setZoom(Math.max((zoomRef.current||100)-10,50)); return; }
      if (ctrl && k==="0") { e.preventDefault(); setZoom(100); return; }
      // Practice mode loop markers
      if (k==="[" && !ctrl) { e.preventDefault(); setLoopAValidated({measure:cur.measure,beat:cur.beat}); return; }
      if (k==="]" && !ctrl) { e.preventDefault(); setLoopBValidated({measure:cur.measure,beat:cur.beat}); return; }
      if (_action==="metronome") { e.preventDefault(); setMetro(!metro); return; }
      if (k==="?" || (k==="/" && shift)) { e.preventDefault(); setShowCheatSheet(!showCheatSheet); return; }
      if (_action==="insertBar") { e.preventDefault(); var s9i=JSON.parse(JSON.stringify(song));var iTs=getTimeSig(s9i.tracks[0].measures[cur.measure]);var iBts=timeSigBeats(iTs.num,iTs.den);for(var ti9=0;ti9<s9i.tracks.length;ti9++){var nb9=[];for(var bi9=0;bi9<iBts;bi9++)nb9.push({notes:new Array(s9i.tracks[ti9].numStrings).fill(null)});s9i.tracks[ti9].measures.splice(cur.measure,0,{beats:nb9,barLine:"single",beatsPerMeasure:iBts,globalBeatsPerMeasure:iBts,isATR:false,timeSig:{num:iTs.num,den:iTs.den}});}shiftSections(s9i,cur.measure,1);setSong(s9i);setStatus("Inserted bar"); return; }
      if (_action==="deleteBar") { e.preventDefault(); if(song.tracks[0].measures.length<=1){setStatus("Cannot delete last bar");return;}var s9d=JSON.parse(JSON.stringify(song));for(var ti9d=0;ti9d<s9d.tracks.length;ti9d++)s9d.tracks[ti9d].measures.splice(cur.measure,1);var nm9=Math.min(cur.measure,s9d.tracks[0].measures.length-1);setCur({measure:nm9,beat:0,string:cur.string});shiftSections(s9d,cur.measure,-1);setSong(s9d);setStatus("Deleted bar"); return; }
      // Undo
      if (_action==="undo") { e.preventDefault(); doUndo(); setOpenMenu(null); return; }
      // Cut/Copy/Paste
      if (_action==="cut") { e.preventDefault();
        if(sel){
          var selN=normSel(sel,t);
          var s5=JSON.parse(JSON.stringify(song));
          var tSt=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
          var tEn=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
          if(tSt===tEn){
            var copied=[];for(var si5=selN.sm;si5<=selN.em;si5++){var m5=t.measures[si5];if(!m5)continue;var sb5=(si5===selN.sm)?selN.sb:0;var eb5=(si5===selN.em)?selN.eb:m5.beats.length-1;for(var bi5=sb5;bi5<=eb5;bi5++){copied.push(JSON.parse(JSON.stringify(m5.beats[bi5])));s5.tracks[ati].measures[si5].beats[bi5]={notes:Array(t.numStrings).fill(null)};}}
            clipboard.current={type:"range",data:copied,numStrings:t.numStrings};setStatus("Cut "+copied.length+" beats");
          } else {
            var mtTracks=[];
            for(var mti=tSt;mti<=tEn&&mti<song.tracks.length;mti++){var mtk=song.tracks[mti];var mtd=[];for(var msi=selN.sm;msi<=selN.em;msi++){var mm=mtk.measures[msi];if(!mm)continue;var msb=(msi===selN.sm)?selN.sb:0;var meb=(msi===selN.em)?selN.eb:mm.beats.length-1;for(var mbi=msb;mbi<=meb;mbi++){mtd.push(JSON.parse(JSON.stringify(mm.beats[mbi])));s5.tracks[mti].measures[msi].beats[mbi]={notes:Array(mtk.numStrings).fill(null)};}}mtTracks.push({data:mtd,numStrings:mtk.numStrings});}
            clipboard.current={type:"multitrack",tracks:mtTracks};setStatus("Cut "+mtTracks.length+" tracks");
          }
          setSong(s5);setSel(null);
        }else{cutBeat();}setOpenMenu(null);return;}
      if (_action==="copy") { e.preventDefault();
        if(sel){
          var selN2=normSel(sel,t);
          var tSt2=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
          var tEn2=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
          if(tSt2===tEn2){
            var copied2=[];for(var si6=selN2.sm;si6<=selN2.em;si6++){var m6=t.measures[si6];if(!m6)continue;var sb6=(si6===selN2.sm)?selN2.sb:0;var eb6=(si6===selN2.em)?selN2.eb:m6.beats.length-1;for(var bi6=sb6;bi6<=eb6;bi6++){copied2.push(JSON.parse(JSON.stringify(m6.beats[bi6])));}}
            clipboard.current={type:"range",data:copied2,numStrings:t.numStrings};setStatus("Copied "+copied2.length+" beats");
          } else {
            var mtTracks2=[];
            for(var mti2=tSt2;mti2<=tEn2&&mti2<song.tracks.length;mti2++){var mtk2=song.tracks[mti2];var mtd2=[];for(var msi2=selN2.sm;msi2<=selN2.em;msi2++){var mm2=mtk2.measures[msi2];if(!mm2)continue;var msb2=(msi2===selN2.sm)?selN2.sb:0;var meb2=(msi2===selN2.em)?selN2.eb:mm2.beats.length-1;for(var mbi2=msb2;mbi2<=meb2;mbi2++){mtd2.push(JSON.parse(JSON.stringify(mm2.beats[mbi2])));}}mtTracks2.push({data:mtd2,numStrings:mtk2.numStrings});}
            clipboard.current={type:"multitrack",tracks:mtTracks2};setStatus("Copied "+mtTracks2.length+" tracks");
          }
        }else{try{var cb=t.measures[cur.measure].beats[cur.beat];clipboard.current={type:"beat",data:JSON.parse(JSON.stringify(cb)),numStrings:t.numStrings};setStatus("Copied beat");}catch(ec){}}setOpenMenu(null);return;}
      if (_action==="paste") { e.preventDefault();
        if(clipboard.current){
          var s6=JSON.parse(JSON.stringify(song));
          if(clipboard.current.type==="multitrack"){
            var mtSrc=clipboard.current.tracks;
            for(var pti=0;pti<mtSrc.length&&ati+pti<s6.tracks.length;pti++){
              var pdst=s6.tracks[ati+pti];var psrcNS=mtSrc[pti].numStrings||6;var pdstNS=pdst.numStrings;var pbeats=mtSrc[pti].data;
              var ppm=cur.measure,ppb=cur.beat;
              for(var ppi=0;ppi<pbeats.length;ppi++){if(ppm>=pdst.measures.length)break;var pSrcBt=JSON.parse(JSON.stringify(pbeats[ppi]));var pMap=Array(pdstNS).fill(null);for(var psn=0;psn<psrcNS&&psn<pSrcBt.notes.length;psn++){if(!pSrcBt.notes[psn])continue;if(pdstNS<psrcNS){if(psn<pdstNS)pMap[psn]=pSrcBt.notes[psn];}else if(pdstNS>psrcNS){var poff=pdstNS-psrcNS;if(psn+poff<pdstNS)pMap[psn+poff]=pSrcBt.notes[psn];}else{pMap[psn]=pSrcBt.notes[psn];}}pSrcBt.notes=pMap;pdst.measures[ppm].beats[ppb]=pSrcBt;ppb++;if(ppb>=pdst.measures[ppm].beats.length){ppm++;ppb=0;}}
            }
            setSong(s6);setSel(null);setStatus("Pasted "+mtSrc.length+" tracks");
          } else if(clipboard.current.type==="range"||clipboard.current.type==="beat"){
            var dst=s6.tracks[ati];var srcNS=clipboard.current.numStrings||6;var dstNS=dst.numStrings;var beats6=clipboard.current.type==="range"?clipboard.current.data:[clipboard.current.data];var pm=cur.measure;var pb3=cur.beat;for(var pi2=0;pi2<beats6.length;pi2++){if(pm>=dst.measures.length)break;var srcBeat=JSON.parse(JSON.stringify(beats6[pi2]));var mappedNotes=Array(dstNS).fill(null);for(var sn=0;sn<srcNS&&sn<srcBeat.notes.length;sn++){if(!srcBeat.notes[sn])continue;if(dstNS<srcNS){if(sn<dstNS)mappedNotes[sn]=srcBeat.notes[sn];}else if(dstNS>srcNS){var offset=dstNS-srcNS;if(sn+offset<dstNS)mappedNotes[sn+offset]=srcBeat.notes[sn];}else{mappedNotes[sn]=srcBeat.notes[sn];}}srcBeat.notes=mappedNotes;dst.measures[pm].beats[pb3]=srcBeat;pb3++;if(pb3>=dst.measures[pm].beats.length){pm++;pb3=0;}}
            setSong(s6);setSel(null);setStatus("Pasted "+beats6.length+" beats");
          }
        }setOpenMenu(null);return;}
      // Select All (copy measure)
      if (k==="a"&&ctrl&&!shift) { /* handled above as track props */ }
      // File
      if (_action==="openFile") { e.preventDefault(); triggerOpen(); return; }
      if (_action==="save") { e.preventDefault(); handleSave(); return; }
      if (_action==="newSong") { e.preventDefault(); newSong(); return; }
      // Track Effects dialog
      if (_action==="tempoChange") { e.preventDefault(); openDlg("tempoChange",{tempo:song.tempo}); return; }
      if (_action==="instChange") { e.preventDefault(); openDlg("instChange",{instrument:song.tracks[ati].instrument,letRing:song.tracks[ati].letRing||false}); return; }
      if (_action==="volChange") { e.preventDefault(); openDlg("volChange",{volume:song.tracks[ati].volume}); return; }
      if (_action==="print") { e.preventDefault(); setOpenMenu(null); window.print(); return; }
      if (_action==="trackEffects") { e.preventDefault(); openDlg("trackEffects",buildEfxData()); return; }
      // Staff Break (Ctrl+Shift+K)
      if (_action==="staffBreak") { e.preventDefault(); if(cur.measure>0){var sbk=JSON.parse(JSON.stringify(song));for(var tik=0;tik<sbk.tracks.length;tik++){var mbk=sbk.tracks[tik].measures[cur.measure-1];if(!mbk)continue;if(mbk.staffBreak){mbk.staffBreak=false;if(mbk.barLine==="double")mbk.barLine="single";}else{mbk.staffBreak=true;if(mbk.barLine==="single")mbk.barLine="double";}}setSong(sbk);} return; }
      // Time at cursor (Ctrl+')
      if (k==="'"&&ctrl) { e.preventDefault(); var spb3=60/song.tempo/4;var totalS=0;for(var mit=0;mit<cur.measure;mit++){totalS+=(t.measures[mit]?t.measures[mit].globalBeatsPerMeasure||BPM:BPM)*spb3;}if(t.measures[cur.measure]){var gA=0;for(var bit=0;bit<Math.min(cur.beat,t.measures[cur.measure].beats.length);bit++){var wbt=t.measures[cur.measure].beats[bit];var gct=1;if(wbt&&wbt.atrGroup&&wbt.atrGroup>1)gct=(wbt.atrNum||1)/wbt.atrGroup;gA+=gct;}totalS+=gA*spb3;}var mmt=Math.floor(totalS/60);var sst=Math.floor(totalS%60);var cst=Math.floor((totalS%1)*100);openDlg("timeAtCursor",{time:mmt+":"+String(sst).padStart(2,"0")+"."+String(cst).padStart(2,"0")}); return; }
      // Repeat Open/Close
      if (_action==="repeatOpen") { e.preventDefault(); var sr=JSON.parse(JSON.stringify(song)); var ex0=sr.tracks[ati].measures[cur.measure]?sr.tracks[ati].measures[cur.measure].barLine:"single"; var newBl=ex0==="repeatStart"?"single":ex0==="repeatBoth"?"repeatEnd":ex0==="repeatEnd"?"repeatBoth":"repeatStart"; sr.tracks.forEach(function(tr2){if(cur.measure<tr2.measures.length){tr2.measures[cur.measure].barLine=newBl;}}); setSong(sr); return; }
      if (_action==="repeatClose") { e.preventDefault(); var curBl=t.measures[cur.measure]?t.measures[cur.measure].barLine:"single"; if(curBl==="repeatEnd"){var sr2=JSON.parse(JSON.stringify(song));sr2.tracks.forEach(function(tr3){if(cur.measure<tr3.measures.length){tr3.measures[cur.measure].barLine="single";tr3.measures[cur.measure].repeatCount=0;}});setSong(sr2);}else if(curBl==="repeatBoth"){var sr3=JSON.parse(JSON.stringify(song));sr3.tracks.forEach(function(tr3){if(cur.measure<tr3.measures.length){tr3.measures[cur.measure].barLine="repeatStart";tr3.measures[cur.measure].repeatCount=0;}});setSong(sr3);}else{openDlg("repeatClose",{count:2});} return; }
      // Text line editing
      if (t.hasTopText && k.length === 1 && !ctrl && !e.metaKey && /^[A-Za-z!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~ ]$/.test(k)) {
        // Don't capture single chars that are effect shortcuts
        if ("hp/\\^br~ts(<{w".indexOf(k) >= 0) return;
        e.preventDefault();
        var sc = JSON.parse(JSON.stringify(song));
        var charCode = k.charCodeAt(0);
        if (shift && t.hasBottomText) { sc.tracks[ati].measures[cur.measure].beats[cur.beat].botChar = charCode; }
        else { sc.tracks[ati].measures[cur.measure].beats[cur.beat].topChar = charCode; }
        setSong(sc);
        var bts3 = t.measures[cur.measure] ? t.measures[cur.measure].beats.length : BPM;
        if (cur.beat + 1 < bts3) setCur({measure:cur.measure,beat:cur.beat+1,string:cur.string});
        else if (cur.measure + 1 < t.measures.length) setCur({measure:cur.measure+1,beat:0,string:cur.string});
        return;
      }
    }
    window.addEventListener("keydown",kh);
    function ku(e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { seekingRef.current = false; }
      var kuCombo = eventToCombo(e);
      if (kuCombo === keymap.holdToPlay) { e.preventDefault(); if(playing) stopPlay(); }
    }
    window.addEventListener("keyup", ku);
    return function(){window.removeEventListener("keydown",kh);window.removeEventListener("keyup",ku);};
  }, [song, ati, cur, sel, playing, placeNote, placeMuted, placeStop, moveNote, shiftNote, transposeNote, cutBeat, stopPlay, doPlay, newSong, openDlg, doUndo, metro, dlg, dlgData, keymap, reverseKm]);

  var rwState = useState(function(){try{return localStorage.getItem("tabkit_rewind")==="true";}catch(e){return false;}}); var rewindAfterStop = rwState[0]; var setRewindAfterStop = function(v){rwState[1](v);try{localStorage.setItem("tabkit_rewind",v?"true":"false");}catch(e){}};
  var rewindRef = useRef(false);

  // Practice mode state
  var _practice = useState(false); var practiceMode = _practice[0]; var setPracticeMode = _practice[1];
  var _loopA = useState(null); var loopA = _loopA[0]; var setLoopA = _loopA[1]; // {measure, beat}
  var _loopB = useState(null); var loopB = _loopB[0]; var setLoopB = _loopB[1]; // {measure, beat}
  var _practiceSpeed = useState(100); var practiceSpeed = _practiceSpeed[0]; var setPracticeSpeed = _practiceSpeed[1]; // percentage
  var _practiceAutoInc = useState(false); var practiceAutoInc = _practiceAutoInc[0]; var setPracticeAutoInc = _practiceAutoInc[1];
  var _practiceIncStep = useState(5); var practiceIncStep = _practiceIncStep[0]; var setPracticeIncStep = _practiceIncStep[1];
  var _practiceTargetSpeed = useState(100); var practiceTargetSpeed = _practiceTargetSpeed[0]; var setPracticeTargetSpeed = _practiceTargetSpeed[1];
  var _practiceLoopCount = useRef(0);
  var practiceSpeedRef = useRef(100); practiceSpeedRef.current = practiceSpeed;
  var loopARef = useRef(null); loopARef.current = loopA;
  var loopBRef = useRef(null); loopBRef.current = loopB;
  var practiceAutoIncRef = useRef(false); practiceAutoIncRef.current = practiceAutoInc;

  // Validated loop setters: A must be before B, same position clears
  function setLoopAValidated(pos) {
    if (!pos) { setLoopA(null); return; }
    if (loopA && pos.measure === loopA.measure && pos.beat === loopA.beat) { setLoopA(null); setStatus("Loop Start cleared"); return; }
    if (loopB && (pos.measure > loopB.measure || (pos.measure === loopB.measure && pos.beat >= loopB.beat))) {
      setLoopB(null); // A is at or after B, remove B
    }
    setLoopA(pos); _practiceLoopCount.current = 0;
    setStatus("Loop Start: M"+(pos.measure+1)+":B"+(pos.beat+1));
  }
  function setLoopBValidated(pos) {
    if (!pos) { setLoopB(null); return; }
    if (loopB && pos.measure === loopB.measure && pos.beat === loopB.beat) { setLoopB(null); setStatus("Loop End cleared"); return; }
    if (loopA && (pos.measure < loopA.measure || (pos.measure === loopA.measure && pos.beat <= loopA.beat))) {
      setLoopA(null); // B is at or before A, remove A
    }
    setLoopB(pos); _practiceLoopCount.current = 0;
    setStatus("Loop End: M"+(pos.measure+1)+":B"+(pos.beat+1));
  }
  useEffect(function(){ rewindRef.current = rewindAfterStop; }, [rewindAfterStop]);
  var playStartPos = useRef(null);

  // Lookahead: find next note on same string in a track
  function findNextNote(trk, mi, bi, stringIdx) {
    for (var lm = mi; lm < trk.measures.length; lm++) {
      var startBi = (lm === mi) ? bi + 1 : 0;
      var m = trk.measures[lm];
      for (var lb = startBi; lb < m.beats.length; lb++) {
        var ln = m.beats[lb] && m.beats[lb].notes[stringIdx];
        if (ln && ln.attack && !ln.stop && !ln.muted) {
          // Calculate distance in beats
          var dist = 0;
          for (var dm = mi; dm <= lm; dm++) {
            var dStart = (dm === mi) ? bi : 0;
            var dEnd = (dm === lm) ? lb : trk.measures[dm].beats.length;
            for (var db = dStart; db < dEnd; db++) {
              var wb = trk.measures[dm].beats[db];
              dist += (wb && wb.atrGroup && wb.atrGroup > 1) ? (wb.atrNum || 1) / wb.atrGroup : 1;
            }
          }
          return { fret: ln.fret, midi: (trk.isDrum ? (trk.tuning[stringIdx] || 0) + ln.fret : (trk.tuning[stringIdx] || 40) + ln.fret + (trk.capo || 0) + (trk.transpose || 0)), beats: dist, mi: lm, bi: lb };
        }
      }
    }
    return null;
  }
  // Find previous note's bend state on same string
  function findPrevBendState(trk, mi, bi, stringIdx) {
    for (var lm = mi; lm >= 0; lm--) {
      var endBi = (lm === mi) ? bi - 1 : trk.measures[lm].beats.length - 1;
      for (var lb = endBi; lb >= 0; lb--) {
        var ln = trk.measures[lm].beats[lb] && trk.measures[lm].beats[lb].notes[stringIdx];
        if (ln && ln.attack && !ln.stop && !ln.muted) {
          if (ln.effect === 98 || ln.preBend) {
            // This note was a bend - find what it bent to
            var next = findNextNote(trk, lm, lb, stringIdx);
            if (next) return next.midi - ((trk.isDrum ? (trk.tuning[stringIdx] || 0) + ln.fret : (trk.tuning[stringIdx] || 40) + ln.fret + (trk.capo || 0) + (trk.transpose || 0)));
          }
          if (ln.bendHold) return null; // hold means previous bend continues
          return 0; // normal note, no bend state
        }
      }
    }
    return 0;
  }

  var _savedTrackState = useRef(null);
  var stopPlay = useCallback(function() {
    _playIntent.current = false; // Cancel any pending resume→schedule
    if (pRef.current) { clearInterval(pRef.current); pRef.current = null; }
    // Restore track state modified during playback
    if (_savedTrackState.current && song) {
      var saved = _savedTrackState.current;
      for (var ri = 0; ri < song.tracks.length && ri < saved.length; ri++) {
        song.tracks[ri].instrument = saved[ri].instrument;
        song.tracks[ri].volume = saved[ri].volume;
        song.tracks[ri].pan = saved[ri].pan;
        song.tracks[ri].letRing = saved[ri].letRing;
        song.tracks[ri].bank = saved[ri].bank;
      }
      _savedTrackState.current = null;
    }
    setPlaying(false); setPlayPos(-1); playPosRef.current = -1; synthAllOff();
    // Rewind cursor and scroll to play-start position
    if (rewindRef.current && playStartPos.current) {
      var rp = playStartPos.current;
      _setCurRaw({measure:rp.measure, beat:rp.beat, string:rp.string});
      if (sRef.current) sRef.current.scrollLeft = rp.scrollLeft;
    }
    playStartPos.current = null;
  }, [song]);

  var doPlay = useCallback(function(forceAll) {
    if (pRef.current) { stopPlay(); return; } // use ref check instead of playing state
    if (!song) return;
    var useAll = (forceAll !== undefined) ? forceAll : playAllRef.current;
    var useAti = atiRef.current;
    var curSnap = curRef.current; // snapshot cursor at play start
    playStartPos.current = {measure:curSnap.measure, beat:curSnap.beat, string:curSnap.string, scrollLeft:sRef.current?sRef.current.scrollLeft:0};
    synthInit(); setPlaying(true);
    _playIntent.current = true; // Flag that we intend to play
    // Ensure AudioContext is running before scheduling notes
    var _ctx0 = getCtx();
    function _startScheduling() {
    // Save track state so we can restore after playback
    _savedTrackState.current = song.tracks.map(function(t2) {
      return { instrument: t2.instrument, volume: t2.volume, pan: t2.pan, letRing: t2.letRing, bank: t2.bank || 0 };
    });
    // Initialize per-track volume and pan
    var allTrks = song.tracks;
    for (var vi = 0; vi < allTrks.length; vi++) {
      setChVolume(allTrks[vi].midiChannel, allTrks[vi].volume !== undefined ? allTrks[vi].volume : 96);
      setChPan(allTrks[vi].midiChannel, allTrks[vi].pan !== undefined ? allTrks[vi].pan : 64);
      setChPitchBend(allTrks[vi].midiChannel, allTrks[vi].pitchBend || 0);
      setChModulation(allTrks[vi].midiChannel, allTrks[vi].modulation || 0);
      setChReverb(allTrks[vi].midiChannel, allTrks[vi].reverb || 0);
      setChBank(allTrks[vi].midiChannel, allTrks[vi].bank || 0);
      setChChorus(allTrks[vi].midiChannel, allTrks[vi].chorus || 0);
      setChExpression(allTrks[vi].midiChannel, allTrks[vi].trackExpression !== undefined ? allTrks[vi].trackExpression : 127);
      var chn = getChNode(allTrks[vi].midiChannel);
      chn.bendCents = allTrks[vi].pitchBend || 0; chn.modDepth = allTrks[vi].modulation || 0;
    }
    var ctx = getCtx();
    var _pracSpd = practiceSpeedRef.current || 100;
    var _effTempo = song.tempo * (_pracSpd / 100);
    var spb = 60 / _effTempo / 4; // seconds per beat (16th note)
    var nextT = ctx.currentTime + 0.15;
    // Count-in: clicks before playback when metronome is on (skip if mid-measure)
    var countingIn = false;
    if (metroRef.current && curSnap.beat === 0) {
      countingIn = true;
      var ciTs = getTimeSig(song.tracks[0].measures[curSnap.measure]);
      var ciCount = ciTs.num || 4;
      var cSpb = 60 / song.tempo * (4 / (ciTs.den || 4)); // beat duration for this time sig
      for (var ci = 0; ci < ciCount; ci++) {
        synthClick(ci === 0, nextT + ci * cSpb);
      }
      nextT += ciCount * cSpb;
      setTimeout(function(){ countingIn = false; }, ciCount * cSpb * 1000);
    }
    // Queue of pending visual updates: {t: audioTime, pos, mi, bi, str}
    var visQueue = [];
    function pollVis() {
      if (!pRef.current) return;
      var now = ctx.currentTime;
      while (visQueue.length && visQueue[0].t <= now) {
        var ev = visQueue.shift();
        setPlayPos(ev.pos); playPosRef.current = ev.pos;
        _setCurRaw({ measure: ev.mi, beat: ev.bi, string: ev.str });
      }
      requestAnimationFrame(pollVis);
    }
    requestAnimationFrame(pollVis);

    // Build measure position map using GLOBAL beat counts (not per-track note positions)
    var refTrack = useAll ? song.tracks[0] : song.tracks[useAti];
    var maxMeasLen = refTrack.measures.length;
    if (useAll) { for (var mmi = 0; mmi < song.tracks.length; mmi++) { if (song.tracks[mmi].measures.length > maxMeasLen) maxMeasLen = song.tracks[mmi].measures.length; } }
    var measMap = [];
    var flatPos = 0;
    for (var mm = 0; mm < maxMeasLen; mm++) {
      var barLine = "single", repeatCount = 0;
      // Use globalBeatsPerMeasure (from header ATR), NOT the per-track beat count
      var globalBeats = BPM;
      // Use first track (track 0) as authoritative source for barLine/repeats
      // All tracks should share the same bar structure
      var refM = song.tracks[0].measures[mm];
      if (refM) {
        if (refM.globalBeatsPerMeasure) globalBeats = refM.globalBeatsPerMeasure;
        if (refM.barLine && refM.barLine !== "single") { barLine = refM.barLine; repeatCount = refM.repeatCount || 0; }
      }
      measMap.push({ start: flatPos, beats: globalBeats, barLine: barLine, repeatCount: repeatCount });
      if (barLine !== "single") console.log("[MEASMAP] M" + mm + ": barLine=" + barLine + " rc=" + repeatCount);
      flatPos += globalBeats;
    }
    var totalFlat = flatPos;

    // Find starting measure/beat from cursor
    var curMi = curSnap.measure, curBi = curSnap.beat;
    if (curMi >= measMap.length) curMi = 0;
    var pos = measMap[curMi] ? measMap[curMi].start + curBi : 0;

    // Scan prior beats for track effects to set correct state at cursor
    if (curMi > 0 || curBi > 0) {
      var tks2 = useAll ? song.tracks : [song.tracks[useAti]];
      for (var pi2 = 0; pi2 < tks2.length; pi2++) {
        var pt = tks2[pi2];
        for (var pmi = 0; pmi < curMi && pmi < pt.measures.length; pmi++) {
          for (var pbi = 0; pbi < pt.measures[pmi].beats.length; pbi++) {
            var pfx = pt.measures[pmi].beats[pbi].trkEffect;
            if (!pfx) continue;
            var applyPrior = function(fx) {
              if (fx.type === 86) { pt.volume = fx.value; setChVolume(pt.midiChannel, fx.value); }
              else if (fx.type === 200) { pt.trackVelocity = fx.value; }
              else if (fx.type === 69) { setChExpression(pt.midiChannel, fx.value); }
              else if (fx.type === 82) { setChReverb(pt.midiChannel, fx.value); }
              else if (fx.type === 67) { setChChorus(pt.midiChannel, fx.value); }
              else if (fx.type === 73) { pt.instrument = fx.value & 0x7F; if (fx.letRing !== undefined) pt.letRing = fx.letRing; }
              else if (fx.type === 84 && fx.value >= 30 && fx.value <= 500) { spb = 60 / fx.value / 4; }
              else if (fx.type === 80) { pt.pan = fx.value; setChPan(pt.midiChannel, fx.value); }
              else if (fx.type === 66) { setChPitchBend(pt.midiChannel, fx.raw16 || 0); }
              else if (fx.type === 77) { setChModulation(pt.midiChannel, fx.value); getChNode(pt.midiChannel).modDepth = fx.value; }
            };
            applyPrior(pfx);
            if (pfx.multi) { for (var pm2 = 0; pm2 < pfx.multi.length; pm2++) applyPrior(pfx.multi[pm2]); }
          }
        }
        // Also scan current measure up to cursor beat
        if (curMi < pt.measures.length) {
          for (var pbi2 = 0; pbi2 < curBi && pbi2 < pt.measures[curMi].beats.length; pbi2++) {
            var pfx2 = pt.measures[curMi].beats[pbi2].trkEffect;
            if (!pfx2) continue;
            var applyPrior2 = function(fx) {
              if (fx.type === 86) { pt.volume = fx.value; setChVolume(pt.midiChannel, fx.value); }
              else if (fx.type === 200) { pt.trackVelocity = fx.value; }
              else if (fx.type === 69) { setChExpression(pt.midiChannel, fx.value); }
              else if (fx.type === 82) { setChReverb(pt.midiChannel, fx.value); }
              else if (fx.type === 67) { setChChorus(pt.midiChannel, fx.value); }
              else if (fx.type === 73) { pt.instrument = fx.value & 0x7F; if (fx.letRing !== undefined) pt.letRing = fx.letRing; }
              else if (fx.type === 84 && fx.value >= 30 && fx.value <= 500) { spb = 60 / fx.value / 4; }
              else if (fx.type === 80) { pt.pan = fx.value; setChPan(pt.midiChannel, fx.value); }
              else if (fx.type === 66) { setChPitchBend(pt.midiChannel, fx.raw16 || 0); }
              else if (fx.type === 77) { setChModulation(pt.midiChannel, fx.value); getChNode(pt.midiChannel).modDepth = fx.value; }
            };
            applyPrior2(pfx2);
            if (pfx2.multi) { for (var pm3 = 0; pm3 < pfx2.multi.length; pm3++) applyPrior2(pfx2.multi[pm3]); }
          }
        }
      }
    }

    // Repeat tracking: repeatCounts[measureIdx] = times played so far
    var repeatCounts = {};
    // Pre-exhaust repeat regions that are entirely before the cursor position
    // so they don't fire again if playback loops into them
    if (curMi > 0) {
      for (var prm = 0; prm < curMi; prm++) {
        var prBl = measMap[prm].barLine;
        if (prBl === "repeatEnd" || prBl === "repeatBoth") {
          repeatCounts["end_" + prm] = measMap[prm].repeatCount || 2;
        }
      }
    }

    // Convert flat pos to measure/beat
    function posToMB(p) {
      for (var i = 0; i < measMap.length; i++) {
        if (p < measMap[i].start + measMap[i].beats) {
          return { mi: i, bi: p - measMap[i].start };
        }
      }
      return { mi: measMap.length, bi: 0 };
    }

    // Find matching repeat start for a repeat end at measureIdx
    // Looks for repeatStart/repeatBoth, or implied open (bar after last repeatEnd)
    function findRepeatStart(endMi) {
      for (var i = endMi - 1; i >= 0; i--) {
        if (measMap[i].barLine === "repeatStart" || measMap[i].barLine === "repeatBoth") return i;
        if (measMap[i].barLine === "repeatEnd") return i + 1; // implied open after previous close
      }
      return 0; // default to beginning of song (implicit repeat start)
    }

    // Track active notes per track per string
    var activeNotes = {};
    var ringFlags = {}; // ringFlags[trkIdx][si] = true if note has indefinite ring
    var bendState = {}; // bendState[trkIdx][si] = semitones offset from current bent pitch
    var pedalState = {}; // pedalState[trkIdx] = {delayOn, octOn, tremOn, ...} runtime pedal effect state
    for (var ai = 0; ai < song.tracks.length; ai++) { activeNotes[ai] = {}; ringFlags[ai] = {}; bendState[ai] = {}; var _t=song.tracks[ai]; pedalState[ai] = {delayOn:!!_t.delayOn,delayTime:_t.delayTime||"8d",delayTaps:_t.delayTaps||3,delayMix:_t.delayMix||50,octOn:!!_t.octOn,octShift:_t.octShift||-12,octDry:_t.octDry!=null?_t.octDry:100,octMix:_t.octMix||50,tremOn:!!_t.tremOn,tremSpeed:_t.tremSpeed||"8",tremDepth:_t.tremDepth||70}; }
    var hammerNext = {}; // hammerNext[trkIdx][si] = true if next note should have reduced velocity
    var suppressNext = {}; // suppressNext[trkIdx][si] = true if next note is a bend/slide/release destination
    var playedBeats = {}; // "trackIdx-measure-beatIdx" prevents double scheduling
    function killString(trkIdx, trk, si, hard) {
      var off = hard === "choke" ? synthChoke : hard ? synthKill : synthOff;
      var old = activeNotes[trkIdx][si];
      if (old !== undefined) { off(trk.midiChannel, old); delete activeNotes[trkIdx][si]; }
      var oldShim = activeNotes[trkIdx]["h_"+si];
      if (oldShim !== undefined) { off(trk.midiChannel, oldShim); delete activeNotes[trkIdx]["h_"+si]; }
      var old12 = activeNotes[trkIdx]["12s_"+si];
      if (old12 !== undefined) { off(trk.midiChannel, old12); delete activeNotes[trkIdx]["12s_"+si]; }
      // Kill ADT doubled note
      var oldAdt = activeNotes[trkIdx]["adt_"+si];
      if (oldAdt !== undefined) { synthOff(trk.midiChannel, oldAdt.midi, oldAdt.detune); delete activeNotes[trkIdx]["adt_"+si]; }
      delete ringFlags[trkIdx][si];
    }

    // Pre-scan expression timeline for smooth ramping between markers
    var scanTrks = useAll ? song.tracks : [song.tracks[useAti]];
    for (var eti = 0; eti < scanTrks.length; eti++) {
      var eTrk = scanTrks[eti];
      var eCh = eTrk.midiChannel;
      var eNode = getChNode(eCh);
      // Use current expression (set by init scan of prior effects) as starting value
      var curExpr = eNode._cc11 !== undefined ? eNode._cc11 : (eTrk.trackExpression !== undefined ? eTrk.trackExpression : 127);
      // Collect all expression events from playback start forward
      var exprEvents = [];
      var ePos2 = 0;
      for (var emi = 0; emi < eTrk.measures.length; emi++) {
        var em = eTrk.measures[emi];
        for (var ebi = 0; ebi < em.beats.length; ebi++) {
          if (ePos2 >= pos) {
            var eb = em.beats[ebi];
            if (eb && eb.trkEffect) {
              var eScanFx = function(fx) { if (fx.type === 69) exprEvents.push({pos: ePos2, value: fx.value}); };
              eScanFx(eb.trkEffect);
              if (eb.trkEffect.multi) { for (var emf = 0; emf < eb.trkEffect.multi.length; emf++) eScanFx(eb.trkEffect.multi[emf]); }
            }
          }
          ePos2++;
        }
      }
      // Schedule complete expression automation timeline
      if (exprEvents.length > 0) {
        try {
          eNode.expr.gain.cancelScheduledValues(0);
          eNode.expr.gain.setValueAtTime(curExpr / 127, nextT);
          for (var eei = 0; eei < exprEvents.length; eei++) {
            var evt = exprEvents[eei];
            var evtTime = nextT + (evt.pos - pos) * spb;
            eNode.expr.gain.linearRampToValueAtTime(evt.value / 127, evtTime);
            eNode.expr.gain.setValueAtTime(evt.value / 127, evtTime);
          }
        } catch(e) {}
      }
    }

    pRef.current = setInterval(function() {
      // Safety: if stop was called but interval wasn't cleared (race condition)
      if (!_playIntent.current) { if(pRef.current){clearInterval(pRef.current);pRef.current=null;} return; }
      // Handle seek requests from arrow keys / canvas clicks during playback
      if (seekRef.current) {
        var sk = seekRef.current; seekRef.current = null;
        var skMi, skBi;
        if (sk.flat !== undefined) {
          // Direct flat position seek
          pos = Math.max(0, Math.min(sk.flat, totalFlat - 1));
          var skMB = posToMB(pos);
          skMi = skMB.mi; skBi = skMB.bi;
        } else {
          skMi = Math.max(0, Math.min(sk.measure, measMap.length - 1));
          skBi = sk.beat || 0;
          pos = measMap[skMi] ? measMap[skMi].start + skBi : 0;
        }
        nextT = ctx.currentTime + 10.0; // push far ahead - will be reset on resume
        playedBeats = {};
        repeatCounts = {};
        visQueue = []; // clear pending visual updates
        // Kill all active notes
        synthAllOff();
        for (var ski = 0; ski < song.tracks.length; ski++) activeNotes[ski] = {};
        // Re-scan prior effects from start to new position
        var tks3 = useAll ? song.tracks : [song.tracks[useAti]];
        for (var ski2 = 0; ski2 < tks3.length; ski2++) {
          var skt = tks3[ski2];
          var skp = 0;
          for (var skm = 0; skm < skMi && skm < skt.measures.length; skm++) {
            for (var skb = 0; skb < skt.measures[skm].beats.length; skb++) {
              var skbt = skt.measures[skm].beats[skb];
              if (skbt.trkEffect) {
                var skfx = function(fx) {
                  if (fx.type === 86) { skt.volume = fx.value; setChVolume(skt.midiChannel, fx.value); }
                  else if (fx.type === 200) { skt.trackVelocity = fx.value; }
                  else if (fx.type === 69) { setChExpression(skt.midiChannel, fx.value); }
                  else if (fx.type === 82) { setChReverb(skt.midiChannel, fx.value); }
                  else if (fx.type === 67) { setChChorus(skt.midiChannel, fx.value); }
                  else if (fx.type === 73) { skt.instrument = fx.value & 0x7F; if (fx.letRing !== undefined) skt.letRing = fx.letRing; }
                  else if (fx.type === 84 && fx.value >= 30 && fx.value <= 500) { spb = 60 / fx.value / 4; }
                  else if (fx.type === 80) { skt.pan = fx.value; setChPan(skt.midiChannel, fx.value); }
                  else if (fx.type === 66) { setChPitchBend(skt.midiChannel, fx.raw16 || 0); }
                  else if (fx.type === 77) { setChModulation(skt.midiChannel, fx.value); getChNode(skt.midiChannel).modDepth = fx.value; }
                  else if (fx.type === 201) { if(pedalState[useAll?ski2:useAti]){var _skp=pedalState[useAll?ski2:useAti]; _skp.delayOn = fx.delayOn; _skp.delayTime = fx.delayTime; _skp.delayTaps = fx.delayTaps; _skp.delayMix = fx.delayMix;} }
                  else if (fx.type === 202) { if(pedalState[useAll?ski2:useAti]){var _skp2=pedalState[useAll?ski2:useAti]; _skp2.octOn = fx.octOn; _skp2.octShift = fx.octShift; _skp2.octDry = fx.octDry; _skp2.octMix = fx.octMix;} }
                  else if (fx.type === 204) { if(pedalState[useAll?ski2:useAti]){var _skp3=pedalState[useAll?ski2:useAti]; _skp3.tremOn = fx.tremOn; _skp3.tremSpeed = fx.tremSpeed; _skp3.tremDepth = fx.tremDepth;} }
                };
                skfx(skbt.trkEffect);
                if (skbt.trkEffect.multi) skbt.trkEffect.multi.forEach(skfx);
              }
            }
          }
        }
        // Play notes at seek position immediately
        setPlayPos(pos); playPosRef.current = pos;
        var skMBc = posToMB(pos);
        _setCurRaw({ measure: skMBc.mi, beat: skMBc.bi, string: curRef.current.string });
        // Play the beat at the seek position for all active tracks
        var skTks = useAll ? song.tracks : [song.tracks[useAti]];
        for (var skti = 0; skti < skTks.length; skti++) {
          var skTr = skTks[skti];
          var skTi = useAll ? skti : useAti;
          if (skMBc.mi >= skTr.measures.length) continue;
          var skMeas = skTr.measures[skMBc.mi];
          // Find which beat in this track's measure corresponds to the global beat
          var skVbi = skMBc.bi, skGa = 0;
          for (var skvi = 0; skvi < skMeas.beats.length; skvi++) {
            if (skGa >= skMBc.bi) { skVbi = skvi; break; }
            var skVb = skMeas.beats[skvi];
            skGa += (skVb && skVb.atrGroup && skVb.atrGroup > 1) ? (skVb.atrNum || 1) / skVb.atrGroup : 1;
            skVbi = skvi + 1;
          }
          if (skVbi < skMeas.beats.length) {
            var skBeat = skMeas.beats[skVbi];
            // Apply effects
            if (skBeat.trkEffect) {
              var skApply = function(fx) {
                if (fx.type === 86) { skTr.volume = fx.value; setChVolume(skTr.midiChannel, fx.value); }
                else if (fx.type === 200) { skTr.trackVelocity = fx.value; }
                else if (fx.type === 69) { setChExpression(skTr.midiChannel, fx.value); }
                else if (fx.type === 82) { setChReverb(skTr.midiChannel, fx.value); }
                else if (fx.type === 67) { setChChorus(skTr.midiChannel, fx.value); }
                else if (fx.type === 80) { skTr.pan = fx.value; setChPan(skTr.midiChannel, fx.value); }
                else if (fx.type === 66) { setChPitchBend(skTr.midiChannel, fx.raw16 || 0); }
                else if (fx.type === 77) { setChModulation(skTr.midiChannel, fx.value); }
                else if (fx.type === 201) { if(pedalState[skTi]){var _skpa=pedalState[skTi]; _skpa.delayOn = fx.delayOn; _skpa.delayTime = fx.delayTime; _skpa.delayTaps = fx.delayTaps; _skpa.delayMix = fx.delayMix;} }
                else if (fx.type === 202) { if(pedalState[skTi]){var _skpb=pedalState[skTi]; _skpb.octOn = fx.octOn; _skpb.octShift = fx.octShift; _skpb.octDry = fx.octDry; _skpb.octMix = fx.octMix;} }
                else if (fx.type === 204) { if(pedalState[skTi]){var _skpc=pedalState[skTi]; _skpc.tremOn = fx.tremOn; _skpc.tremSpeed = fx.tremSpeed; _skpc.tremDepth = fx.tremDepth;} }
              };
              skApply(skBeat.trkEffect);
              if (skBeat.trkEffect.multi) skBeat.trkEffect.multi.forEach(skApply);
            }
            // Play notes
            for (var sksi = 0; sksi < skBeat.notes.length; sksi++) {
              var skn = skBeat.notes[sksi]; if (!skn || !skn.attack || skn.stop) continue;
              if (skn.muted) continue;
              killString(skTi, skTr, sksi);
              var skMid = skTr.isDrum ? (skTr.tuning[sksi]||0)+skn.fret : (skTr.tuning[sksi]||40)+skn.fret+(skTr.capo||0)+(skTr.transpose||0);
              var skVel=skn.vel!==undefined?skn.vel:(skTr.trackVelocity||80);
              var _skps=pedalState[skTi]||{};
              var skDryScale=(_skps.octOn&&!skTr.isDrum&&_skps.octDry!=null)?_skps.octDry/100:1;
              var skPlayVel=Math.max(0,Math.round(skVel*skDryScale));
              if(skPlayVel>0)synthOn(skTr.midiChannel, skMid, skPlayVel, skTr.instrument, 0);
              if (!skTr.isDrum) activeNotes[skTi][sksi] = skMid;
              if(_skps.octOn&&!skTr.isDrum){
                var skPsNote=Math.max(0,Math.min(127,skMid+(_skps.octShift||-12)));
                synthOn(skTr.midiChannel,skPsNote,Math.round(skVel*(_skps.octMix||50)/100),skTr.instrument,0);
              }

              if(_skps.delayOn&&!skTr.isDrum){
                var skDMs=getDelayMs(_skps.delayTime||"8d",song.tempo||120);
                scheduleDelay(skTr.midiChannel,skMid,skVel,skTr.instrument,0,skTr.bank||0,skDMs,_skps.delayTaps||3,_skps.delayMix||50);
              }
              if(skTr.twelveStringMode&&!skTr.isDrum){
                var oct12s=sksi<(skTr.numStrings-2)?12:0;
                synthOn(skTr.midiChannel, skMid+oct12s, Math.round(skVel*0.9), skTr.instrument, 0);
              }
            }
          }
        }
        return;
      }
      // If user is holding arrow keys, pause forward playback
      if (seekingRef.current) {
        return;
      }
      // Resume after seek: detect nextT was pushed far ahead and reset (skip during count-in)
      if (!countingIn && nextT > ctx.currentTime + 1.0) {
        nextT = ctx.currentTime + 0.15;
        playedBeats = {};
      }
      var tickBase = ctx.currentTime;
      while (nextT < tickBase + 0.4) {
        if (pos >= totalFlat) { stopPlay(); return; }
        var mb = posToMB(pos);
        if (mb.mi >= measMap.length) { stopPlay(); return; }

        // Check for repeat BEFORE playing this beat (when entering a new measure at beat 0)
        if (mb.bi === 0) {
          var curMeasInfo = measMap[mb.mi];
          if (curMeasInfo.barLine !== "single") {
            console.log("[REPEAT] Entering M" + mb.mi + " beat 0, barLine=" + curMeasInfo.barLine + " rc=" + curMeasInfo.repeatCount);
          }
          // repeatStart and repeatBoth: no action at entry, just markers
          // repeatBoth close fires at measure END (see below)
        }

        var mTs = getTimeSig(refTrack.measures[mb.mi]);
        var mClickInterval = Math.round(16 / (mTs.den || 4));
        if (metroRef.current && mb.bi % mClickInterval === 0) synthClick(mb.bi === 0, nextT);

        // Each global beat always takes spb seconds
        var beatDur = spb;

        // Play notes from all tracks at this beat position
        var tks = useAll ? song.tracks : [song.tracks[useAti]];
        for (var ti2 = 0; ti2 < tks.length; ti2++) {
          var trk = tks[ti2];
          var trkIdx = useAll ? ti2 : useAti;
          // Live solo/mute check from current song state
          var liveTrks = songRef.current ? songRef.current.tracks : song.tracks;
          var liveTrk = liveTrks[trkIdx];
          if (liveTrk && liveTrk.muted) continue;
          var anySolo = liveTrks.some(function(lt){return lt.solo;});
          if (anySolo && liveTrk && !liveTrk.solo) continue;
          if (mb.mi >= trk.measures.length) continue;
          var meas = trk.measures[mb.mi];

          // Find which track beat positions fall within this global beat
          var gAccum = 0;
          var matchPositions = [];
          for (var wi = 0; wi < meas.beats.length; wi++) {
            var wb = meas.beats[wi];
            var gCost = 1;
            if (wb && wb.atrGroup && wb.atrGroup > 1) {
              gCost = (wb.atrNum || 1) / wb.atrGroup;
            }
            if (gAccum >= mb.bi && gAccum < mb.bi + 1) {
              matchPositions.push({idx: wi, delay: (gAccum - mb.bi) * spb * 1000}); // delay in ms
            }
            gAccum += gCost;
            if (gAccum >= mb.bi + 1.001) break;
          }
          if (matchPositions.length === 0 && mb.bi < meas.beats.length) {
            matchPositions.push({idx: mb.bi, delay: 0});
          }

          // Sync: apply ONLY tempo changes (needed for scheduling math)
          // V/I/P/B/M are applied in the setTimeout callback at the correct audio time
          for (var efi = 0; efi < matchPositions.length; efi++) {
            var efBi = matchPositions[efi].idx;
            if (efBi >= meas.beats.length) continue;
            var efBeat = meas.beats[efBi]; if (!efBeat || !efBeat.trkEffect) continue;
            var applySync = function(fx) {
              var eT = fx.type, eV = fx.value;
              if (eT === 84) { if (eV >= 30 && eV <= 500) spb = 60 / eV / 4; }
            };
            applySync(efBeat.trkEffect);
            if (efBeat.trkEffect.multi) { for (var mfi5 = 0; mfi5 < efBeat.trkEffect.multi.length; mfi5++) applySync(efBeat.trkEffect.multi[mfi5]); }
          }

          // Schedule notes + B/M with ABSOLUTE delays from ctx.currentTime
          var absBase = Math.max(0, Math.round((nextT - tickBase) * 1000));
          // Find the first matchPosition that has attacks (for mass-kill)
          var firstAttackMpi = -1;
          for (var fam = 0; fam < matchPositions.length; fam++) {
            var faBeat = meas.beats[matchPositions[fam].idx];
            if (faBeat) {
              for (var fas = 0; fas < faBeat.notes.length; fas++) {
                var fan = faBeat.notes[fas];
                if (fan && fan.attack) { firstAttackMpi = fam; break; }
              }
              if (firstAttackMpi >= 0) break;
            }
          }
          for (var mpi = 0; mpi < matchPositions.length; mpi++) {
            var mp = matchPositions[mpi];
            if (mp.idx >= meas.beats.length) continue;
            var absDelay = absBase + Math.round(mp.delay);
            // Guard: prevent any beat from being scheduled twice
            var pbKey = trkIdx + "-" + mb.mi + "-" + mp.idx;
            if (playedBeats[pbKey]) { console.warn("[DUP] beat " + mp.idx + " already played"); continue; }
            playedBeats[pbKey] = true;
            // IIFE captures ALL needed state - no shared function reference
            (function(trkRef, trkIdxRef, measRef, measIdx, beatIdx, isFirst, dl, beatTime) {
              var doPlay = function() {
                if (!pRef.current) return;
                // Live mute/solo check - skip if this track should be silent
                var liveTrks2 = songRef.current ? songRef.current.tracks : null;
                if (liveTrks2) {
                  var lt2 = liveTrks2[trkIdxRef];
                  if (lt2 && lt2.muted) return;
                  var anySolo3 = liveTrks2.some(function(t9){return t9.solo;});
                  if (anySolo3 && lt2 && !lt2.solo) return;
                }
                var beat2 = measRef.beats[beatIdx]; if (!beat2) return;
                if (beat2.trkEffect) {
                  var applyFx = function(fx) {
                    var eT = fx.type, eV = fx.value;
                    if (eT === 86) { trkRef.volume = eV; setChVolume(trkRef.midiChannel, eV); }
                    else if (eT === 73) {
                      trkRef.instrument = eV & 0x7F;
                      if (fx.letRing !== undefined) {
                        var wasRing = trkRef.letRing; trkRef.letRing = fx.letRing;
                        if (wasRing && !trkRef.letRing && !trkRef.isDrum) {
                          for (var kr=0;kr<trkRef.numStrings;kr++) killString(trkIdxRef,trkRef,kr);
                        }
                      }
                    }
                    else if (eT === 84) { if (eV >= 30 && eV <= 500) spb = 60 / eV / 4; }
                    else if (eT === 80) { trkRef.pan = eV; setChPan(trkRef.midiChannel, eV); }
                    else if (eT === 66) {
                      setChPitchBend(trkRef.midiChannel, fx.raw16 || 0);
                    }
                    else if (eT === 77) { setChModulation(trkRef.midiChannel, eV); }
                    else if (eT === 69) { /* expression handled by pre-scan timeline */ }
                    else if (eT === 82) { setChReverb(trkRef.midiChannel, eV); }
                    else if (eT === 67) { setChChorus(trkRef.midiChannel, eV); }
                    else if (eT === 200) { trkRef.trackVelocity = eV; }
                    else if (eT === 201) { var _ps=pedalState[trkIdxRef]; _ps.delayOn = fx.delayOn; _ps.delayTime = fx.delayTime; _ps.delayTaps = fx.delayTaps; _ps.delayMix = fx.delayMix; }
                    else if (eT === 202) { var _ps2=pedalState[trkIdxRef]; _ps2.octOn = fx.octOn; _ps2.octShift = fx.octShift; _ps2.octDry = fx.octDry; _ps2.octMix = fx.octMix; }
                    else if (eT === 204) { var _ps3=pedalState[trkIdxRef]; _ps3.tremOn = fx.tremOn; _ps3.tremSpeed = fx.tremSpeed; _ps3.tremDepth = fx.tremDepth; }
                    else if (eT === 205) { trkRef.adt = fx.value; }
                  };
                  applyFx(beat2.trkEffect);
                  if (beat2.trkEffect.multi) { for (var mf=0;mf<beat2.trkEffect.multi.length;mf++) applyFx(beat2.trkEffect.multi[mf]); }
                }
                var hasAtt2 = false, hasStp2 = false;
                for (var si3=0;si3<beat2.notes.length;si3++) {
                  var n3=beat2.notes[si3]; if(!n3||!n3.attack) continue;
                  if(n3.stop) hasStp2=true; else hasAtt2=true;
                }
                if (isFirst && !trkRef.letRing && !trkRef.isDrum && (hasAtt2||hasStp2)) {
                  for (var ks4=0;ks4<trkRef.numStrings;ks4++) {
                    if (!beat2.notes[ks4] || (!beat2.notes[ks4].attack)) {
                      // Skip killing strings with indefinite ring flag
                      if (ringFlags[trkIdxRef] && ringFlags[trkIdxRef][ks4]) continue;
                      killString(trkIdxRef,trkRef,ks4);
                    }
                  }
                }
                for (var si4=0;si4<beat2.notes.length;si4++) {
                  var n4=beat2.notes[si4]; if(!n4||!n4.attack) {
                    // Technique-only markers (no attack, affects ringing string)
                    if (n4 && (n4.techniqueOnly || n4.vibratoOnly) && activeNotes[trkIdxRef][si4] !== undefined) {
                      var activeMidi = activeNotes[trkIdxRef][si4];
                      if (n4.effect === 126) {
                        // Don't fire vibrato if there's an active slide/bend chain
                        if (suppressNext[trkIdxRef] && suppressNext[trkIdxRef][si4] > 0) {
                          // skip - vibrato not allowed during active pitch ramp
                        } else {
                          var vibOff = bendState[trkIdxRef] ? (bendState[trkIdxRef][si4] || 0) : 0;
                          var dvKey = trkRef.midiChannel + "-" + activeMidi;
                          var dvN = _notes[dvKey];
                          if (dvN && dvN.sf && dvN.src) {
                            var dvBase = dvN.baseRate || 1;
                            var dvBC = (getChNode(trkRef.midiChannel).bendCents || 0);
                            var dvCenter = dvBase * Math.pow(2, (dvBC + vibOff * 100) / 1200);
                            var dvC = 35, dvR = 6, dvT = _actx ? _actx.currentTime : 0;
                            try {
                              dvN.src.playbackRate.cancelScheduledValues(dvT);
                              dvN.src.playbackRate.setValueAtTime(dvCenter, dvT);
                              for (var dvvi = 0; dvvi < 60; dvvi++) {
                                dvN.src.playbackRate.setValueAtTime(dvCenter * Math.pow(2, dvC/1200), dvT + dvvi/dvR);
                                dvN.src.playbackRate.setValueAtTime(dvCenter * Math.pow(2, -dvC/1200), dvT + dvvi/dvR + 0.5/dvR);
                              }
                              dvN.src.playbackRate.setValueAtTime(dvCenter, dvT + 60/dvR);
                            } catch(e3){}
                          }
                        }
                      }
                      // Delayed bend or slide: anchor current pitch then scan chain
                      if (n4.effect === 98 || n4.effect === 47 || n4.effect === 92) {
                        // Cancel any existing automation (e.g., vibrato oscillation) before sliding
                        var dKey = trkRef.midiChannel + "-" + activeMidi;
                        var dN = _notes[dKey];
                        if (dN && dN.src) {
                          try {
                            var dCtx = _actx;
                            dN.src.playbackRate.cancelScheduledValues(dCtx.currentTime);
                            dN.src.playbackRate.setValueAtTime(dN.src.playbackRate.value, dCtx.currentTime);
                          } catch(e2) {}
                        }
                        var dChainTime = beatTime;
                        var dChainMi = measIdx, dChainBi = beatIdx;
                        for (var dci = 0; dci < 20; dci++) {
                          var dNext = findNextNote(trkRef, dChainMi, dChainBi, si4);
                          if (!dNext) break;
                          var dRampSemi = dNext.midi - activeMidi;
                          dChainTime += dNext.beats * spb;
                          synthChainRamp(trkRef.midiChannel, activeMidi, dRampSemi, dChainTime);
                          bendState[trkIdxRef][si4] = dRampSemi;
                          if (!suppressNext[trkIdxRef]) suppressNext[trkIdxRef] = {};
                          suppressNext[trkIdxRef][si4] = (suppressNext[trkIdxRef][si4] || 0) + 1;
                          dChainMi = dNext.mi; dChainBi = dNext.bi;
                          var dBeat = trkRef.measures[dNext.mi] && trkRef.measures[dNext.mi].beats[dNext.bi];
                          var dN = dBeat && dBeat.notes[si4];
                          if (!dN) break;
                          if (dN.effect === 114 || dN.effect === 98 || dN.effect === 47 || dN.effect === 92) continue;
                          if (dN.bendHold) { suppressNext[trkIdxRef][si4] = 0; break; }
                          break;
                        }
                      }
                      // Delayed release: ramp from bend state
                      if (n4.effect === 114) {
                        var dPrevBend = bendState[trkIdxRef][si4] || 0;
                        if (dPrevBend) {
                          var dRNext = findNextNote(trkRef, measIdx, beatIdx, si4);
                          if (dRNext) {
                            var dRSemi = dRNext.midi - activeMidi;
                            synthBendNote(trkRef.midiChannel, activeMidi, dRSemi, dRNext.beats * spb);
                            if (!suppressNext[trkIdxRef]) suppressNext[trkIdxRef] = {};
                            suppressNext[trkIdxRef][si4] = (suppressNext[trkIdxRef][si4] || 0) + 1;
                          }
                          bendState[trkIdxRef][si4] = 0;
                        }
                      }
                    }
                    continue;
                  }
                  if(n4.stop){killString(trkIdxRef,trkRef,si4,trkRef.isDrum?"choke":true);}
                  else if(n4.muted){
                    killString(trkIdxRef,trkRef,si4,true);
                    var mutVel=Math.round((n4.vel!==undefined?n4.vel:(trkRef.trackVelocity||80))*0.4);
                    var mm2=trkRef.isDrum?(trkRef.tuning[si4]||0):(trkRef.tuning[si4]||40)+(trkRef.capo||0)+(trkRef.transpose||0);
                    // Check if another string has an active note at the same MIDI pitch
                    // If so, skip playing the muted note to avoid killing the other string's sound
                    var mutCollision = false;
                    if (!trkRef.isDrum) {
                      for (var mcs = 0; mcs < trkRef.numStrings; mcs++) {
                        if (mcs !== si4 && activeNotes[trkIdxRef][mcs] === mm2) { mutCollision = true; break; }
                      }
                    }
                    if (!mutCollision) {
                      synthOn(trkRef.midiChannel,mm2,mutVel,trkRef.instrument,beatDur*0.2);
                      if(trkRef.twelveStringMode&&!trkRef.isDrum){
                        var oct12m=si4<(trkRef.numStrings-2)?12:0;
                        synthOn(trkRef.midiChannel,mm2+oct12m,Math.round(mutVel*0.75),trkRef.instrument,beatDur*0.2);
                      }
                    }
                  } else {
                    // Forward suppress: this note is a destination in a bend/slide/release chain
                    if (!suppressNext[trkIdxRef]) suppressNext[trkIdxRef] = {};
                    if (suppressNext[trkIdxRef][si4] > 0 && !n4.bendHold) {
                      // Suppressed — no new attack. Source note's pitch ramp handles this.
                      if (n4.ring) ringFlags[trkIdxRef][si4] = true;
                      suppressNext[trkIdxRef][si4]--;
                      // Don't fire vibrato here - chain scan pre-schedules it for bends,
                      // and vibrato is not allowed during slides
                      continue;
                    }
                    suppressNext[trkIdxRef][si4] = 0;
                    killString(trkIdxRef,trkRef,si4);
                    var nVel=n4.vel!==undefined?n4.vel:(trkRef.trackVelocity||80);
                    if (!hammerNext[trkIdxRef]) hammerNext[trkIdxRef] = {};
                    if (hammerNext[trkIdxRef][si4]) { nVel = Math.round(nVel * 0.9); delete hammerNext[trkIdxRef][si4]; }
                    var md2=trkRef.isDrum?(trkRef.tuning[si4]||0)+n4.fret:(trkRef.tuning[si4]||40)+n4.fret+(trkRef.capo||0)+(trkRef.transpose||0);
                    if(n4.effect===60&&!trkRef.isDrum){
                      var hFret=n4.fret; var openMidi=(trkRef.tuning[si4]||40)+(trkRef.capo||0)+(trkRef.transpose||0);
                      if(hFret===12) md2=openMidi+12;
                      else if(hFret===7||hFret===19) md2=openMidi+19;
                      else if(hFret===5||hFret===24) md2=openMidi+24;
                      else if(hFret===4||hFret===9||hFret===16) md2=openMidi+28;
                      else if(hFret===3) md2=openMidi+31;
                      else md2=openMidi+12+hFret;
                    }
                    var isHarm4=n4.effect===60&&!trkRef.isDrum;
                    var pmDur=n4.effect===109?beatDur*0.3:0;
                    var harmVel=isHarm4?Math.round(nVel*0.5):nVel;
                    var _psr=pedalState[trkIdxRef]||{};
                    var dryScale=(_psr.octOn&&!trkRef.isDrum&&_psr.octDry!=null)?_psr.octDry/100:1;
                    var playVel=Math.max(0,Math.round(harmVel*dryScale));
                    if(playVel>0)synthOn(trkRef.midiChannel,md2,playVel,trkRef.instrument,trkRef.isDrum?0:pmDur,!!n4.ring);
                    // ADT: automatic double tracking - play detuned copy with slight delay
                    var _adtAmt = trkRef.adt || 0;
                    if (_adtAmt > 0 && !trkRef.isDrum && playVel > 0) {
                      var adtDetune = 5 + Math.round(_adtAmt * 0.15); // 5-20 cents
                      var adtDelay = 8 + Math.round(_adtAmt * 0.35); // 8-43ms
                      var adtVol = Math.round(playVel * (0.6 + (_adtAmt / 200))); // 60-110% velocity
                      var adtSign = (si4 % 2 === 0) ? 1 : -1; // alternate detune direction per string
                      var adtDet = adtSign * adtDetune;
                      activeNotes[trkIdxRef]["adt_"+si4] = {midi: md2, detune: adtDet};
                      (function(_ch, _md, _vel, _inst, _dur, _ring, _det, _dl) {
                        setTimeout(function() {
                          if (!pRef.current) return;
                          synthOn(_ch, _md, _vel, _inst, _dur, _ring, undefined, _det);
                        }, _dl);
                      })(trkRef.midiChannel, md2, adtVol, trkRef.instrument, trkRef.isDrum ? 0 : pmDur, !!n4.ring, adtDet, adtDelay);
                    }
                    // Drum choke groups: playing one kills ringing notes in same group
                    if (trkRef.isDrum) {
                      // GM hi-hat group: 42=closed, 44=pedal, 46=open
                      var chokeGroups = [[42,44,46],[80,81],[78,79],[86,87]];
                      for (var cgi=0; cgi<chokeGroups.length; cgi++) {
                        var cg = chokeGroups[cgi];
                        if (cg.indexOf(md2) >= 0) {
                          for (var csi=0; csi<trkRef.numStrings; csi++) {
                            if (csi === si4) continue;
                            var activeM = activeNotes[trkIdxRef][csi];
                            if (activeM !== undefined && cg.indexOf(activeM) >= 0) {
                              killString(trkIdxRef, trkRef, csi, "choke");
                            }
                          }
                        }
                      }
                    }
                    if(isHarm4){var shimMd=Math.min(127,md2+12);synthOn(trkRef.midiChannel,shimMd,Math.round(nVel*0.5),trkRef.instrument,0);activeNotes[trkIdxRef]["h_"+si4]=shimMd;}
                    // Pitch Shifter effect
                    if(_psr.octOn&&!trkRef.isDrum){
                      var psShift=_psr.octShift||-12;var psWet=_psr.octMix||50;
                      var psNote=Math.max(0,Math.min(127,md2+psShift));
                      synthOn(trkRef.midiChannel,psNote,Math.round(harmVel*psWet/100),trkRef.instrument,pmDur);
                    }

                    // Tremolo effect
                    if(_psr.tremOn&&!trkRef.isDrum){
                      var tremBPM=song.tempo||120;var tremSpd=_psr.tremSpeed||"8";
                      var tremHz=tremSpd==="4"?tremBPM/60:tremSpd==="8"?tremBPM/30:tremSpd==="8t"?tremBPM/20:tremBPM/15;
                      scheduleTremolo(trkRef.midiChannel,tremHz,_psr.tremDepth||70);
                    }
                    // Delay effect
                    if(_psr.delayOn&&!trkRef.isDrum){
                      var dMs=getDelayMs(_psr.delayTime||"8d",song.tempo||120);
                      scheduleDelay(trkRef.midiChannel,md2,harmVel,trkRef.instrument,pmDur,trkRef.bank||0,dMs,_psr.delayTaps||3,_psr.delayMix||50);
                    }
                    activeNotes[trkIdxRef][si4]=md2;
                    if(n4.ring) ringFlags[trkIdxRef][si4]=true; else delete ringFlags[trkIdxRef][si4];
                    // Set pre-bend state BEFORE technique processing
                    if (!trkRef.isDrum && n4.preBend !== undefined) {
                      var pbFrom = (trkRef.tuning[si4] || 40) + n4.preBend + (trkRef.capo || 0) + (trkRef.transpose || 0);
                      bendState[trkIdxRef][si4] = md2 - pbFrom;
                    }
                    // Technique playback
                    if(!trkRef.isDrum && n4.effect) {
                      var efx4 = n4.effect;
                      if (efx4 === 126) { synthVibratoNote(trkRef.midiChannel, md2, 3, bendState[trkIdxRef] ? bendState[trkIdxRef][si4] : undefined); }
                      // Bend/Slide: scan FULL chain and schedule all ramps at once
                      if (efx4 === 98 || efx4 === 47 || efx4 === 92) {
                        var chainMidi = md2;
                        var chainTime = beatTime;
                        var chainMi = measIdx, chainBi = beatIdx;
                        var chainIsBend = (efx4 === 98); // only bends allow vibrato on targets
                        for (var ci = 0; ci < 20; ci++) {
                          var cNext = findNextNote(trkRef, chainMi, chainBi, si4);
                          if (!cNext) break;
                          var cRampSemi = cNext.midi - md2; // always relative to source note
                          chainTime += cNext.beats * spb;
                          synthChainRamp(trkRef.midiChannel, md2, cRampSemi, chainTime);
                          bendState[trkIdxRef][si4] = cRampSemi;
                          if (!suppressNext[trkIdxRef]) suppressNext[trkIdxRef] = {};
                          suppressNext[trkIdxRef][si4] = (suppressNext[trkIdxRef][si4] || 0) + 1;
                          chainMidi = cNext.midi;
                          chainMi = cNext.mi; chainBi = cNext.bi;
                          var cBeat = trkRef.measures[cNext.mi] && trkRef.measures[cNext.mi].beats[cNext.bi];
                          var cN = cBeat && cBeat.notes[si4];
                          if (!cN) break;
                          // If chain member has vibrato, schedule it starting at ramp arrival (bends only, not slides)
                          if (chainIsBend && cN.effect === 126) {
                            var vKey = trkRef.midiChannel + "-" + md2;
                            var vN = _notes[vKey];
                            if (vN && vN.sf && vN.src) {
                              var vBase = vN.baseRate || 1;
                              var vBC = (getChNode(trkRef.midiChannel).bendCents || 0);
                              var vCenter = vBase * Math.pow(2, (vBC + cRampSemi * 100) / 1200);
                              var vC2 = 35, vR = 6;
                              try { for (var vvi = 0; vvi < 60; vvi++) {
                                vN.src.playbackRate.setValueAtTime(vCenter * Math.pow(2, vC2/1200), chainTime + vvi/vR);
                                vN.src.playbackRate.setValueAtTime(vCenter * Math.pow(2, -vC2/1200), chainTime + vvi/vR + 0.5/vR);
                              } vN.src.playbackRate.setValueAtTime(vCenter, chainTime + 60/vR); } catch(e3){}
                            }
                          }
                          // Continue chain if target has r, b, /, or \
                          if (cN.effect === 114 || cN.effect === 98 || cN.effect === 47 || cN.effect === 92) continue;
                          // Hold note gets attack — stop chain, clear suppress
                          if (cN.bendHold) { suppressNext[trkIdxRef][si4] = 0; break; }
                          break; // plain target — suppressed, end of chain
                        }
                      }
                      // Release (r=114): standalone release after pb or = (not part of a chain from b/slide)
                      if (efx4 === 114) {
                        var prevBend = bendState[trkIdxRef][si4] || 0;
                        if (prevBend) {
                          var rNext = findNextNote(trkRef, measIdx, beatIdx, si4);
                          if (rNext) {
                            var rSemi = rNext.midi - md2;
                            synthBendNote(trkRef.midiChannel, md2, rSemi, rNext.beats * spb);
                            if (!suppressNext[trkIdxRef]) suppressNext[trkIdxRef] = {};
                            suppressNext[trkIdxRef][si4] = (suppressNext[trkIdxRef][si4] || 0) + 1;
                          }
                          bendState[trkIdxRef][si4] = 0;
                        }
                      }
                    }
                    // Bend hold: preserve state for future release
                    if (!trkRef.isDrum && n4.bendHold) { /* bendState persists */ }
                    // Clear bend state if note has no bend-related attributes
                    var efx4c = n4.effect || 0;
                    if (!n4.bendHold && efx4c !== 98 && efx4c !== 114 && efx4c !== 47 && efx4c !== 92 && n4.preBend === undefined) {
                      delete bendState[trkIdxRef][si4];
                    }
                    if (n4.effect === 104 || n4.effect === 112) {
                      if (!hammerNext[trkIdxRef]) hammerNext[trkIdxRef] = {};
                      hammerNext[trkIdxRef][si4] = true;
                    }
                    // 12-string doubling in 6-line mode
                    if(trkRef.twelveStringMode&&!trkRef.isDrum){
                      var oct12=si4<(trkRef.numStrings-2)?12:0;
                      synthOn(trkRef.midiChannel,md2+oct12,Math.round(nVel*0.9),trkRef.instrument,0);
                      activeNotes[trkIdxRef]["12s_"+si4]=md2+oct12;
                    }
                  }
                }
              };
              setTimeout(doPlay, dl);
            })(trk, trkIdx, meas, mb.mi, mp.idx, mpi === firstAttackMpi, absDelay, nextT);
          }
        }

        // Schedule visual update to match audio playback time (not scheduling time)
        var visPos = pos; var visMb = { mi: mb.mi, bi: mb.bi };
        var visBeatSnap = mb.bi;
        var actTrk = song.tracks[useAll ? atiRef.current : useAti];
        if (actTrk && mb.mi < actTrk.measures.length) {
          var actMeas = actTrk.measures[mb.mi];
          if (actMeas.beats.length !== measMap[mb.mi].beats) {
            var ga = 0;
            for (var vbi = 0; vbi < actMeas.beats.length; vbi++) {
              if (ga >= mb.bi) { visBeatSnap = vbi; break; }
              var vb2 = actMeas.beats[vbi];
              var gc = 1;
              if (vb2 && vb2.atrGroup && vb2.atrGroup > 1) gc = (vb2.atrNum || 1) / vb2.atrGroup;
              ga += gc;
              visBeatSnap = vbi + 1;
            }
          }
        }
        // Queue visual update to fire at audio-sync time
        visQueue.push({ t: nextT, pos: pos, mi: visMb.mi, bi: visBeatSnap, str: curSnap.string });
        pos++;
        nextT += spb; // always advance by one global beat

        // Check for repeat END at measure boundary (right-side bar)
        var nextMb = posToMB(pos);
        if (nextMb.mi !== mb.mi && mb.mi < measMap.length) {
          var endMeas = measMap[mb.mi];
          if (endMeas.barLine !== "single") {
            console.log("[REPEAT] Leaving M" + mb.mi + ", barLine=" + endMeas.barLine + " rc=" + endMeas.repeatCount);
          }
          if (endMeas.barLine === "repeatEnd" || endMeas.barLine === "repeatBoth") {
            var rc = endMeas.repeatCount || 2;
            var rkey = "end_" + mb.mi;
            if (!repeatCounts[rkey]) repeatCounts[rkey] = 0;
            repeatCounts[rkey]++;
            console.log("[REPEAT] End of M" + mb.mi + ", pass=" + repeatCounts[rkey] + "/" + rc);
            if (repeatCounts[rkey] < rc) {
              // repeatBoth: open is on this measure, so jump back to self
              // repeatEnd: scan backwards for matching open
              var startMi = endMeas.barLine === "repeatBoth" ? mb.mi : findRepeatStart(mb.mi);
              console.log("[REPEAT] Jumping back to M" + startMi);
              pos = measMap[startMi].start; playedBeats = {};
            }
          }
        }

        // Practice mode A/B loop check
        if (loopARef.current && loopBRef.current) {
          var lbMi = loopBRef.current.measure, lbBi = loopBRef.current.beat;
          var lbFlat = lbMi < measMap.length ? measMap[lbMi].start + lbBi : totalFlat;
          if (pos > lbFlat) {
            var laMi = loopARef.current.measure, laBi = loopARef.current.beat;
            pos = laMi < measMap.length ? measMap[laMi].start + laBi : 0;
            nextT += 0.05; // tiny gap between loops
            playedBeats = {};
            synthAllOff();
            _practiceLoopCount.current++;
            // Auto-increment speed every 2 loops
            if (practiceAutoIncRef.current && _practiceLoopCount.current > 0 && _practiceLoopCount.current % 2 === 0) {
              var newSpd = Math.min((practiceSpeedRef.current || 100) + (practiceIncStep || 5), practiceTargetSpeed || 100);
              if (newSpd !== practiceSpeedRef.current) {
                practiceSpeedRef.current = newSpd;
                setPracticeSpeed(newSpd);
                spb = 60 / (song.tempo * newSpd / 100) / 4;
              }
            }
          }
        }
      }
    }, 25);
    } // end _startScheduling
    // Wait for AudioContext to be running before scheduling notes (Safari fix)
    if (_ctx0.state === "running") {
      _startScheduling();
    } else {
      _ctx0.resume().then(function() {
        // Guard: if stopPlay was called while we were resuming, don't start
        if (!_playIntent.current) return;
        _startScheduling();
      }).catch(function(e) { console.warn("Resume failed:", e); setPlaying(false); });
    }
  }, [song, metro, stopPlay]);

  useEffect(function(){return function(){if(pRef.current)clearInterval(pRef.current);synthAllOff();};}, []);

  // Auto-scroll during playback
  useEffect(function() {
    if (!playing || playPos < 0 || !sRef.current || !song) return;
    var BW2 = 18, MP2 = 3, LW2 = 48;
    var refTrk = song.tracks[atiRef.current] || song.tracks[0];
    // Compute shared measure widths (max beats across all tracks)
    var mw2 = [];
    var maxMC = 0;
    for (var wi = 0; wi < song.tracks.length; wi++) { if (song.tracks[wi].measures.length > maxMC) maxMC = song.tracks[wi].measures.length; }
    for (var wj = 0; wj < maxMC; wj++) {
      var maxB2 = 0;
      for (var wk = 0; wk < song.tracks.length; wk++) { if (wj < song.tracks[wk].measures.length && song.tracks[wk].measures[wj].beats.length > maxB2) maxB2 = song.tracks[wk].measures[wj].beats.length; }
      mw2.push(maxB2);
    }
    // Calculate pixel position of current playback cursor
    var px = LW2, flatP = 0;
    for (var mi = 0; mi < refTrk.measures.length; mi++) {
      var gBeats = refTrk.measures[mi].globalBeatsPerMeasure || BPM;
      var sharedB = (mi < mw2.length) ? mw2[mi] : refTrk.measures[mi].beats.length;
      var measW = sharedB * BW2 + MP2 * 2;
      if (flatP + gBeats > playPos) {
        // Map global beat to visual beat within this measure
        var visBi = 0, ga2 = 0;
        for (var vb = 0; vb < refTrk.measures[mi].beats.length; vb++) {
          if (ga2 >= playPos - flatP) { visBi = vb; break; }
          var bt = refTrk.measures[mi].beats[vb];
          ga2 += (bt && bt.atrGroup && bt.atrGroup > 1) ? (bt.atrNum || 1) / bt.atrGroup : 1;
          visBi = vb + 1;
        }
        var trkBeatW2 = refTrk.measures[mi].beats.length > 0 ? ((measW - MP2*2) / refTrk.measures[mi].beats.length) : BW2;
        px += MP2 + visBi * trkBeatW2;
        break;
      }
      px += measW + 1;
      flatP += gBeats;
    }
    var el = sRef.current;
    if (px < el.scrollLeft + 40 || px > el.scrollLeft + el.clientWidth * 0.8) {
      var target = px - el.clientWidth * 0.3;
      if (target < 0) target = 0;
      el.scrollLeft = target;
    }
  }, [playing, playPos, song]);

  // Global Enter/Escape for dialogs
  useEffect(function(){
    function onDlgKey(e){
      if(!dlg)return;
      if(dlg==="findReplace")return; // pattern editor has its own handler
      if(e.key==="Escape"){
        if(dlg==="remapKeys")return;
        e.preventDefault();setDlg(null);return;
      }
      if(e.key==="Enter"){
        if(dlg==="remapKeys")return;
        var tag=e.target.tagName;
        if(tag==="TEXTAREA")return;
        if(tag==="SELECT")return;
        e.preventDefault();
        var primaryBtn=document.querySelector("[data-dlg-primary]");
        if(primaryBtn&&!primaryBtn.disabled)primaryBtn.click();
      }
    }
    window.addEventListener("keydown",onDlgKey);
    return function(){window.removeEventListener("keydown",onDlgKey);};
  },[dlg]);

  // Desktop keyboard for the Find & Replace scratch editor
  useEffect(function(){
    if(dlg!=="findReplace"||!frScratch)return;
    function fkh(e){
      var tag=e.target.tagName;
      if(tag==="INPUT"||tag==="SELECT"||tag==="TEXTAREA")return;
      var k=e.key, ns=frScratch.tracks[frActive].numStrings;
      if(e.key==="Escape"){e.preventDefault();frCloseEditor();return;}
      if(/^[0-9]$/.test(k)){e.preventDefault();frPlaceNote(parseInt(k));return;}
      if(k==="x"||k==="X"){e.preventDefault();frPlaceMutedNote();return;}
      if(k==="Backspace"||k==="Delete"){e.preventDefault();frClearScratchBeat();return;}
      if(k==="ArrowUp"){e.preventDefault();setFrCur({measure:frCur.measure,beat:frCur.beat,string:Math.min(ns-1,frCur.string+1)});return;}
      if(k==="ArrowDown"){e.preventDefault();setFrCur({measure:frCur.measure,beat:frCur.beat,string:Math.max(0,frCur.string-1)});return;}
      if(k==="ArrowLeft"){e.preventDefault();if(frCur.beat>0)setFrCur({measure:frCur.measure,beat:frCur.beat-1,string:frCur.string});return;}
      if(k==="ArrowRight"){e.preventDefault();var bl=frScratch.tracks[frActive].measures[frCur.measure].beats.length;if(frCur.beat<bl-1)setFrCur({measure:frCur.measure,beat:frCur.beat+1,string:frCur.string});return;}
      if(k==="Tab"){e.preventDefault();setFrActive(frActive===0?1:0);return;}
    }
    window.addEventListener("keydown",fkh);
    return function(){window.removeEventListener("keydown",fkh);};
  },[dlg,frScratch,frActive,frCur]);

  var track = song ? song.tracks[ati] : null;
  var curStrLbl = track ? (cur.string === track.numStrings ? "Top Text" : cur.string === -1 ? "Bot Text" : track.isDrum ? String(track.tuning[cur.string]) : midiName(track.tuning[cur.string]||40)) : "";

  if (!song) return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif",fontSize:12,background:TH.bg,color:TH.text,userSelect:"none",overflow:"hidden"}}
      onDragOver={function(e){e.preventDefault();e.stopPropagation();}}
      onDrop={function(e){e.preventDefault();e.stopPropagation();if(e.dataTransfer.files&&e.dataTransfer.files.length>0){handleFiles(e.dataTransfer.files);}}}>
      <input type="file" ref={fRef} accept=".tbt,.tkt" style={{display:"none"}} onChange={handleOpen} />
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:TH.canvas}}>
        <div style={{textAlign:"center",maxWidth:isMobile?320:400,padding:isMobile?"20px":"32px"}}>
          <div style={{display:"inline-block",width:isMobile?100:120,height:isMobile?100:120,borderRadius:isMobile?28:32,overflow:"hidden",marginBottom:12}}><img src={LOGO_SRC} alt="TabKit" style={{width:"100%",height:"100%",display:"block"}} /></div>
          <div style={{fontSize:isMobile?12:13,color:TH.dim||"#888",marginBottom:isMobile?20:28,lineHeight:"1.5"}}>{"Create, edit, and play guitar tabs in your browser"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
              <div style={{padding:isMobile?"12px 20px":"10px 24px",background:"var(--accent,#3264dc)",color:"#fff",borderRadius:10,cursor:"pointer",fontSize:isMobile?14:13,fontWeight:"600"}}
                onClick={function(){newDoc();}}>{"Create New"}</div>
              <div style={{display:"flex",border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:10,position:"relative"}}>
                <div style={{padding:isMobile?"12px 16px":"10px 20px",background:"var(--surface-2,#f0f2f5)",color:TH.text,cursor:"pointer",fontSize:isMobile?14:13,fontWeight:"600",borderRadius:"10px 0 0 10px"}}
                  onClick={function(){triggerOpen();setWelDrop(false);}}>{"Open File"}</div>
                <div style={{padding:isMobile?"12px 8px":"10px 8px",background:"var(--surface-2,#f0f2f5)",color:TH.dim,cursor:"pointer",fontSize:isMobile?12:10,borderLeft:"1px solid var(--border-subtle,#e4e8f0)",display:"flex",alignItems:"center",borderRadius:"0 10px 10px 0"}}
                  onClick={function(ev){ev.stopPropagation();setWelDrop(!welDrop);}}>{"▾"}</div>
                {welDrop && <div>
                  <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99}} onClick={function(){setWelDrop(false);}} />
                  <div style={{position:"absolute",top:"100%",right:0,marginTop:4,zIndex:100,background:darkMode?"#2a2a30":"#fff",border:"1px solid "+(darkMode?"#444":"#ddd"),borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",minWidth:150,padding:"4px 0",fontSize:isMobile?13:12}}>
                    <div style={{padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap",transition:"background 0.1s"}}
                      onMouseEnter={function(e){e.target.style.background=darkMode?"#333":"#f0f0f0";}}
                      onMouseLeave={function(e){e.target.style.background="transparent";}}
                      onClick={function(){setWelDrop(false);triggerMidiImport();}}>{"Import MIDI..."}</div>
                  </div>
                </div>}
              </div>
            </div>
            <div style={{padding:isMobile?"10px 20px":"8px 20px",color:"var(--accent,#3264dc)",borderRadius:8,cursor:"pointer",fontSize:isMobile?13:12,fontWeight:"500"}}
              onClick={function(){window.open("browse.html","_blank");}}>{"Browse Shared Tabs"}</div>
            {canInstall ? <div style={{padding:isMobile?"10px 20px":"8px 20px",color:TH.dim,borderRadius:8,cursor:"pointer",fontSize:isMobile?12:11,fontWeight:"500",transition:"color 0.15s"}}
              onMouseEnter={function(e){e.target.style.color="var(--accent,#3264dc)";}}
              onMouseLeave={function(e){e.target.style.color=TH.dim;}}
              onClick={function(){if(window._pwaPromptEvent){window._pwaPromptEvent.prompt();window._pwaPromptEvent.userChoice.then(function(r){if(r.outcome==="accepted"){setCanInstall(false);window._pwaPromptEvent=null;}});}}}>{"\uD83D\uDCE5 Install App"}</div> : null}
          </div>
          <div style={{marginTop:isMobile?24:32,opacity:0.5,fontSize:isMobile?11:10}}>
            <a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" style={{color:darkMode?"#e08090":"#c04060",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
              {React.createElement("svg",{width:12,height:12,viewBox:"0 0 24 24",fill:"currentColor"},React.createElement("path",{d:"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"}))}
              {"If you enjoy TabKit, consider buying me a coffee"}
            </a>
          </div>
        </div>
      </div>
      <div style={{height:isMobile?26:28,background:TH.stBg,borderTop:"1px solid var(--border-subtle,"+TH.tbB+")",display:"flex",alignItems:"center",padding:"0 12px",fontSize:isMobile?10:11,flexShrink:0,color:TH.stT}}>
        <div style={{flex:1,opacity:0.8}}>{status}</div>
        <a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" title="Support TabKit" style={{color:darkMode?"#e06080":"#d04060",textDecoration:"none",fontSize:isMobile?12:11,opacity:0.6}}>{"\u2764"}</a>
      </div>
    </div>
  );

  // Compute shared measure widths: max beats across all tracks per measure
  var measWidths = [];
  var maxMeasCount = 0;
  for (var mwi = 0; mwi < song.tracks.length; mwi++) {
    if (song.tracks[mwi].measures.length > maxMeasCount) maxMeasCount = song.tracks[mwi].measures.length;
  }
  for (var mwj = 0; mwj < maxMeasCount; mwj++) {
    var maxB = 0;
    for (var mwk = 0; mwk < song.tracks.length; mwk++) {
      if (mwj < song.tracks[mwk].measures.length) {
        var bl = song.tracks[mwk].measures[mwj].beats.length;
        if (bl > maxB) maxB = bl;
      }
    }
    measWidths.push(maxB || 16);
  }

  var track = song.tracks[ati];
  var curStrLbl = cur.string === track.numStrings ? "Top Text" : cur.string === -1 ? "Bot Text" : track.isDrum ? String(track.tuning[cur.string]) : midiName(track.tuning[cur.string]||40);

  // Menu structure
  function openDlg(name, data) { setDlg(name); setDlgData(data || {}); setOpenMenu(null); }
  function trackPropsData(tp,tab){return{tab:tab||"main",name:tp.name,numStrings:tp.numStrings,instrument:tp.instrument,volume:tp.volume,pan:tp.pan,reverb:tp.reverb!==undefined?tp.reverb:0,chorus:tp.chorus!==undefined?tp.chorus:0,transpose:tp.transpose||0,capo:tp.capo||0,midiChannel:tp.midiChannel,isDrum:tp.isDrum||tp.midiChannel===10,letRing:tp.letRing!==false,hasTopText:!!tp.hasTopText,hasBottomText:!!tp.hasBottomText,tuning:tp.tuning?tp.tuning.slice():[40,45,50,55,59,64],pitchBend:tp.pitchBend!==undefined?tp.pitchBend:0,modulation:tp.modulation!==undefined?tp.modulation:0,trackVelocity:tp.trackVelocity!==undefined?tp.trackVelocity:80,trackExpression:tp.trackExpression!==undefined?tp.trackExpression:127,instType:tp.instType||(tp.isDrum||tp.midiChannel===10?"drums":"guitar"),twelveStringMode:!!tp.twelveStringMode,delayOn:!!tp.delayOn,delayTime:tp.delayTime||"8d",delayTaps:tp.delayTaps||3,delayMix:tp.delayMix||50,octOn:!!tp.octOn,octShift:tp.octShift||-12,octDry:tp.octDry!=null?tp.octDry:100,octMix:tp.octMix||50,tremOn:!!tp.tremOn,tremSpeed:tp.tremSpeed||"8",tremDepth:tp.tremDepth||70,bank:(tp.bank!=null?tp.bank:0),maxFret:tp.maxFret||24,adt:tp.adt||0};}
  function addTrackData(){return{tab:"main",name:"Track "+(song.tracks.length+1),instType:"guitar",numStrings:6,instrument:25,bank:0,volume:96,pan:64,reverb:0,chorus:0,pitchBend:0,modulation:0,transpose:0,capo:0,midiChannel:song.tracks.length+1>10?song.tracks.length+2:song.tracks.length+1,letRing:false,hasTopText:false,hasBottomText:false,tuning:[40,45,50,55,59,64],twelveStringMode:false,maxFret:24};}

  // Build pre-populated data for Track Effects dialog
  // Scans backwards for last-set values, checks only effects at current beat
  function triggerMidiImport(){var inp=document.createElement("input");inp.type="file";inp.accept=".mid,.midi";inp.onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){try{var midi=parseMIDI(ev.target.result);var s=midiToSong(midi,{title:f.name.replace(/\.(mid|midi)$/i,""),position:5,});if(song)saveCurrentDoc();var newIdx2=docs.current.length;docs.current.push({song:s,ati:0,cur:{measure:0,beat:0,string:0},sel:null,undoStack:[],dirty:false,title:s.title||"Imported MIDI"});loadDoc(newIdx2);var info=s._midiInfo;if(info){var dur=info.duration;var mins=Math.floor(dur/60);var secs=dur%60;setMidiSummary({title:s.title||"Untitled",duration:mins+":"+(secs<10?"0":"")+secs,tempo:s.tempo,tracks:info.trackNames.length,measures:info.measures,atr:info.atrCount});}delete s._midiInfo;setStatus("Imported MIDI: "+s.tracks.length+" track"+(s.tracks.length!==1?"s":""));}catch(err){setStatus("MIDI import failed: "+err.message);console.error(err);}};r.readAsArrayBuffer(f);};inp.click();}

  function buildEfxData() {
    var d = {tab:"general"};
    var t2 = song.tracks[ati];
    // Defaults from track properties
    d.valT = song.tempo || 120;
    d.valI = t2.instrument; d.valLR = t2.letRing || false;
    d.valV = t2.volume !== undefined ? t2.volume : 96;
    d.valVel = t2.trackVelocity !== undefined ? t2.trackVelocity : 80;
    d.valB = t2.pitchBend !== undefined ? t2.pitchBend : 0; d.valM = t2.modulation !== undefined ? t2.modulation : 0; d.valP = t2.pan !== undefined ? t2.pan : 64;
    d.valRv = t2.reverb !== undefined ? t2.reverb : 0; d.valCh = t2.chorus !== undefined ? t2.chorus : 0;
    d.valDlyOn = !!t2.delayOn; d.valDlyTime = t2.delayTime || "8d"; d.valDlyTaps = t2.delayTaps || 3; d.valDlyMix = t2.delayMix || 50;
    d.valOctOn = !!t2.octOn; d.valOctShift = t2.octShift || -12; d.valOctDry = t2.octDry != null ? t2.octDry : 100; d.valOctMix = t2.octMix || 50;
    d.valTremOn = !!t2.tremOn; d.valTremSpeed = t2.tremSpeed || '8'; d.valTremDepth = t2.tremDepth || 70;
    d.valAdt = t2.adt || 0;
    // Scan backwards for last-set effect values (override defaults)
    for (var mi2 = cur.measure; mi2 >= 0; mi2--) {
      var m2 = t2.measures[mi2]; if (!m2) continue;
      var startBi = (mi2 === cur.measure) ? cur.beat - 1 : m2.beats.length - 1;
      for (var bi2 = startBi; bi2 >= 0; bi2--) {
        var bt2 = m2.beats[bi2]; if (!bt2 || !bt2.trkEffect) continue;
        var all2 = [bt2.trkEffect];
        if (bt2.trkEffect.multi) all2 = all2.concat(bt2.trkEffect.multi);
        for (var fi2 = 0; fi2 < all2.length; fi2++) {
          var fx2 = all2[fi2];
          if (fx2.type===84 && d.valT===undefined) d.valT = fx2.value;
          else if (fx2.type===84 && d._scannedT===undefined) { d.valT = fx2.value; d._scannedT = true; }
          if (fx2.type===73 && !d._scannedI) { d.valI = fx2.value & 0x7F; d.valLR = fx2.letRing !== false; d._scannedI = true; }
          if (fx2.type===86 && !d._scannedV) { d.valV = fx2.value; d._scannedV = true; }
          if (fx2.type===200 && !d._scannedVel) { d.valVel = fx2.value; d._scannedVel = true; }
          if (fx2.type===66 && !d._scannedB) { var sv2 = fx2.raw16 || 0; if (sv2 > 32767) sv2 -= 65536; d.valB = sv2; d._scannedB = true; }
          if (fx2.type===77 && !d._scannedM) { d.valM = fx2.value; d._scannedM = true; }
          if (fx2.type===80 && !d._scannedP) { d.valP = fx2.value; d._scannedP = true; }
          if (fx2.type===82 && !d._scannedRv) { d.valRv = fx2.value; d._scannedRv = true; }
          if (fx2.type===67 && !d._scannedCh) { d.valCh = fx2.value; d._scannedCh = true; }
          if (fx2.type===201 && !d._scannedDly) { d.valDlyOn = fx2.delayOn; d.valDlyTime = fx2.delayTime||"8d"; d.valDlyTaps = fx2.delayTaps||3; d.valDlyMix = fx2.delayMix||50; d._scannedDly = true; }
          if (fx2.type===202 && !d._scannedOct) { d.valOctOn = fx2.octOn; d.valOctShift = fx2.octShift||-12; d.valOctDry = fx2.octDry!=null?fx2.octDry:100; d.valOctMix = fx2.octMix||50; d._scannedOct = true; }
          if (fx2.type===204 && !d._scannedTrem) { d.valTremOn = fx2.tremOn; d.valTremSpeed = fx2.tremSpeed||'8'; d.valTremDepth = fx2.tremDepth||70; d._scannedTrem = true; }
          if (fx2.type===205 && !d._scannedAdt) { d.valAdt = fx2.value; d._scannedAdt = true; }
        }
      }
    }
    // Now check effects at current beat (these get checked)
    try {
      var cBeat = t2.measures[cur.measure].beats[cur.beat];
      if (cBeat && cBeat.trkEffect) {
        var all3 = [cBeat.trkEffect];
        if (cBeat.trkEffect.multi) all3 = all3.concat(cBeat.trkEffect.multi);
        all3.forEach(function(fx3) {
          if (fx3.type===84) { d.chkT = true; d.valT = fx3.value; }
          if (fx3.type===73) { d.chkI = true; d.valI = fx3.value & 0x7F; d.valLR = fx3.letRing !== false; }
          if (fx3.type===86) { d.chkV = true; d.valV = fx3.value; }
          if (fx3.type===200) { d.chkVel = true; d.valVel = fx3.value; }
          if (fx3.type===66) { d.chkB = true; var sv3 = fx3.raw16 || 0; if (sv3 > 32767) sv3 -= 65536; d.valB = sv3; }
          if (fx3.type===77) { d.chkM = true; d.valM = fx3.value; }
          if (fx3.type===80) { d.chkP = true; d.valP = fx3.value; }
          if (fx3.type===82) { d.chkRv = true; d.valRv = fx3.value; }
          if (fx3.type===67) { d.chkCh = true; d.valCh = fx3.value; }
          if (fx3.type===69) { d.chkEx = true; d.valEx = fx3.value; }
          if (fx3.type===68) { d.chkSD = true; }
          if (fx3.type===85) { d.chkSU = true; }
          if (fx3.type===201) { d.chkDly = true; d.valDlyOn = fx3.delayOn; d.valDlyTime = fx3.delayTime||"8d"; d.valDlyTaps = fx3.delayTaps||3; d.valDlyMix = fx3.delayMix||50; }
          if (fx3.type===202) { d.chkOct = true; d.valOctOn = fx3.octOn; d.valOctShift = fx3.octShift||-12; d.valOctDry = fx3.octDry!=null?fx3.octDry:100; d.valOctMix = fx3.octMix||50; }
          if (fx3.type===204) { d.chkTrem = true; d.valTremOn = fx3.tremOn; d.valTremSpeed = fx3.tremSpeed||'8'; d.valTremDepth = fx3.tremDepth||70; }
          if (fx3.type===205) { d.chkAdt = true; d.valAdt = fx3.value||0; }
        });
      }
    } catch(e2) {}
    return d;
  }
  function closeDlg() { setDlg(null); }

  var menus = [
    {label:"File", items:[
      {n:"New...",k:getCombo("newSong"),a:function(){newSong();setOpenMenu(null);}},
      {n:"Open...",k:getCombo("openFile"),a:function(){triggerOpen();setOpenMenu(null);}},
      {n:"Open from URL...",a:function(){openDlg("openUrl",{url:""});setOpenMenu(null);}},
      {n:"Open Shared...",a:function(){openDlg("openShared",{shareInput:""});setOpenMenu(null);}},
      {n:"Browse Shared Tabs...",a:function(){window.open("browse.html","_blank");setOpenMenu(null);}},
      {n:"Import MIDI...",a:function(){setOpenMenu(null);triggerMidiImport();}},
      {n:"-"},
      {n:"Save (.tkt)",k:getCombo("save"),a:function(){handleSave();setOpenMenu(null);}},
      {n:"Share...",a:function(){shareTab();setOpenMenu(null);}},
      {n:"-"},
      {n:"Export as TabIt (.tbt)",a:function(){handleExportTBT();setOpenMenu(null);}},
      {n:"Export Text...",a:function(){openDlg("export");}},
      {n:"Export MIDI...",a:function(){var sel={};for(var xi=0;xi<song.tracks.length;xi++)sel[xi]=true;openDlg("exportMidi",{trackSel:sel});}},
      {n:"-"},
      {n:"Print...",k:getCombo("print"),a:function(){setOpenMenu(null);window.print();}},
    ].concat(isMobile?[{n:"-"}].concat(canInstall?[{n:"\uD83D\uDCE5 Install App",a:function(){setOpenMenu(null);if(window._pwaPromptEvent){window._pwaPromptEvent.prompt();window._pwaPromptEvent.userChoice.then(function(r){if(r.outcome==="accepted"){setCanInstall(false);window._pwaPromptEvent=null;}});}}}]:[]).concat([{n:"About TabKit",a:function(){setOpenMenu(null);openDlg("about");}}]):[])},
    {label:"Edit", items:[
      {n:"Undo",k:getCombo("undo"),a:function(){doUndo();setOpenMenu(null);}},
      {n:"Undo History...",a:function(){openDlg("undoHistory",{});setOpenMenu(null);}},
      {n:"-"},
      {n:"Cut",k:getCombo("cut"),a:function(){
        if(sel){
          var selN=normSel(sel,track);var s5=JSON.parse(JSON.stringify(song));
          var tSt=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
          var tEn=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
          if(tSt===tEn){
            var copied=[];for(var si5=selN.sm;si5<=selN.em;si5++){var m5=track.measures[si5];if(!m5)continue;var sb5=(si5===selN.sm)?selN.sb:0;var eb5=(si5===selN.em)?selN.eb:m5.beats.length-1;for(var bi5=sb5;bi5<=eb5;bi5++){copied.push(JSON.parse(JSON.stringify(m5.beats[bi5])));s5.tracks[ati].measures[si5].beats[bi5]={notes:Array(track.numStrings).fill(null)};}}
            clipboard.current={type:"range",data:copied,numStrings:track.numStrings};setStatus("Cut "+copied.length+" beats");
          } else {
            var mtTracks=[];
            for(var mti=tSt;mti<=tEn&&mti<song.tracks.length;mti++){var mtk=song.tracks[mti];var mtd=[];for(var msi=selN.sm;msi<=selN.em;msi++){var mm=mtk.measures[msi];if(!mm)continue;var msb=(msi===selN.sm)?selN.sb:0;var meb=(msi===selN.em)?selN.eb:mm.beats.length-1;for(var mbi=msb;mbi<=meb;mbi++){mtd.push(JSON.parse(JSON.stringify(mm.beats[mbi])));s5.tracks[mti].measures[msi].beats[mbi]={notes:Array(mtk.numStrings).fill(null)};}}mtTracks.push({data:mtd,numStrings:mtk.numStrings});}
            clipboard.current={type:"multitrack",tracks:mtTracks};setStatus("Cut "+mtTracks.length+" tracks");
          }
          setSong(s5);setSel(null);
        }else{cutBeat();}setOpenMenu(null);}},
      {n:"Copy",k:getCombo("copy"),a:function(){
        if(sel){
          var selN2=normSel(sel,track);
          var tSt2=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
          var tEn2=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
          if(tSt2===tEn2){
            var copied2=[];for(var si6=selN2.sm;si6<=selN2.em;si6++){var m6=track.measures[si6];if(!m6)continue;var sb6=(si6===selN2.sm)?selN2.sb:0;var eb6=(si6===selN2.em)?selN2.eb:m6.beats.length-1;for(var bi6=sb6;bi6<=eb6;bi6++){copied2.push(JSON.parse(JSON.stringify(m6.beats[bi6])));}}
            clipboard.current={type:"range",data:copied2,numStrings:track.numStrings};setStatus("Copied "+copied2.length+" beats");
          } else {
            var mtTracks2=[];
            for(var mti2=tSt2;mti2<=tEn2&&mti2<song.tracks.length;mti2++){var mtk2=song.tracks[mti2];var mtd2=[];for(var msi2=selN2.sm;msi2<=selN2.em;msi2++){var mm2=mtk2.measures[msi2];if(!mm2)continue;var msb2=(msi2===selN2.sm)?selN2.sb:0;var meb2=(msi2===selN2.em)?selN2.eb:mm2.beats.length-1;for(var mbi2=msb2;mbi2<=meb2;mbi2++){mtd2.push(JSON.parse(JSON.stringify(mm2.beats[mbi2])));}}mtTracks2.push({data:mtd2,numStrings:mtk2.numStrings});}
            clipboard.current={type:"multitrack",tracks:mtTracks2};setStatus("Copied "+mtTracks2.length+" tracks");
          }
        }else{try{var cb=track.measures[cur.measure].beats[cur.beat];clipboard.current={type:"beat",data:JSON.parse(JSON.stringify(cb)),numStrings:track.numStrings};setStatus("Copied beat");}catch(e2){}}setOpenMenu(null);}},
      {n:"Paste",k:getCombo("paste"),a:function(){
        if(!clipboard.current){setOpenMenu(null);return;}
        var s6=JSON.parse(JSON.stringify(song));
        if(clipboard.current.type==="multitrack"){
          var mtSrc=clipboard.current.tracks;
          for(var pti=0;pti<mtSrc.length&&ati+pti<s6.tracks.length;pti++){var pdst=s6.tracks[ati+pti];var psrcNS=mtSrc[pti].numStrings||6;var pdstNS=pdst.numStrings;var pbeats=mtSrc[pti].data;var ppm=cur.measure,ppb=cur.beat;for(var ppi=0;ppi<pbeats.length;ppi++){if(ppm>=pdst.measures.length)break;var pSrcBt=JSON.parse(JSON.stringify(pbeats[ppi]));var pMap=Array(pdstNS).fill(null);for(var psn=0;psn<psrcNS&&psn<pSrcBt.notes.length;psn++){if(!pSrcBt.notes[psn])continue;if(pdstNS<psrcNS){if(psn<pdstNS)pMap[psn]=pSrcBt.notes[psn];}else if(pdstNS>psrcNS){var poff=pdstNS-psrcNS;if(psn+poff<pdstNS)pMap[psn+poff]=pSrcBt.notes[psn];}else{pMap[psn]=pSrcBt.notes[psn];}}pSrcBt.notes=pMap;pdst.measures[ppm].beats[ppb]=pSrcBt;ppb++;if(ppb>=pdst.measures[ppm].beats.length){ppm++;ppb=0;}}}
          setSong(s6);setSel(null);setStatus("Pasted "+mtSrc.length+" tracks");
        } else {
          var dst=s6.tracks[ati];var srcNS=clipboard.current.numStrings||6;var dstNS=dst.numStrings;var beats6=clipboard.current.type==="range"?clipboard.current.data:[clipboard.current.data];var pm=cur.measure;var pb3=cur.beat;for(var pi2=0;pi2<beats6.length;pi2++){if(pm>=dst.measures.length)break;var srcBeat=JSON.parse(JSON.stringify(beats6[pi2]));var mappedNotes=Array(dstNS).fill(null);for(var sn=0;sn<srcNS&&sn<srcBeat.notes.length;sn++){if(!srcBeat.notes[sn])continue;if(dstNS<srcNS){if(sn<dstNS)mappedNotes[sn]=srcBeat.notes[sn];}else if(dstNS>srcNS){var offset=dstNS-srcNS;if(sn+offset<dstNS)mappedNotes[sn+offset]=srcBeat.notes[sn];}else{mappedNotes[sn]=srcBeat.notes[sn];}}srcBeat.notes=mappedNotes;dst.measures[pm].beats[pb3]=srcBeat;pb3++;if(pb3>=dst.measures[pm].beats.length){pm++;pb3=0;}}
          setSong(s6);setSel(null);setStatus("Pasted "+beats6.length+" beats");
        }setOpenMenu(null);}},
      {n:"Select All",a:function(){var t7=song.tracks[ati];var lastM=t7.measures.length-1;var lastB=t7.measures[lastM]?t7.measures[lastM].beats.length-1:0;setSel({startMeasure:0,startBeat:0,endMeasure:lastM,endBeat:lastB,startTrack:0,endTrack:song.tracks.length-1});setOpenMenu(null);}},
      {n:"-"},
      {n:"Clear",k:"Space",a:function(){clearBeat();setOpenMenu(null);}},
      {n:"Clear Track Effects",k:getCombo("clearTrackEffect"),a:function(){_undoLabel.current="Clear Track Effects";var sc=JSON.parse(JSON.stringify(song));delete sc.tracks[ati].measures[cur.measure].beats[cur.beat].trkEffect;setSong(sc);setOpenMenu(null);}},
      {n:"-"},
      {n:"Modify Notes",sub:[
        {n:"Move Note Up",k:"Ctrl+Up",a:function(){moveNote(1);setOpenMenu(null);}},
        {n:"Move Note Down",k:"Ctrl+Down",a:function(){moveNote(-1);setOpenMenu(null);}},
        {n:"-"},
        {n:"Shift Note Up",k:"Ctrl+Shift+Up",a:function(){shiftNote(1);setOpenMenu(null);}},
        {n:"Shift Note Down",k:"Ctrl+Shift+Down",a:function(){shiftNote(-1);setOpenMenu(null);}},
        {n:"-"},
        {n:"Increment Note",k:"Alt+Up",a:function(){fretAdjust(1);setOpenMenu(null);}},
        {n:"Decrement Note",k:"Alt+Down",a:function(){fretAdjust(-1);setOpenMenu(null);}},
        {n:"-"},
        {n:"Transpose Note Up",k:"Ctrl+Alt+Up",a:function(){transposeNote(1);setOpenMenu(null);}},
        {n:"Transpose Note Down",k:"Ctrl+Alt+Down",a:function(){transposeNote(-1);setOpenMenu(null);}},
      ]},
      {n:"-"},
      {n:"Find & Replace...",k:"Ctrl+F",a:function(){frOpenEditor();setOpenMenu(null);}},
      {n:"-"},
      {n:"Chord Builder...",k:getCombo("chordBuilder"),a:function(){var t2=song.tracks[ati];openDlg("chord",{root:0,qualIdx:0,posIdx:0,bass:"root",tuning:t2.tuning.slice(),numStrings:t2.numStrings,voicings:[],selectedFrets:null});setOpenMenu(null);}},
      {n:"-"},
      {n:"Go to Bar...",k:getCombo("goToBar"),a:function(){openDlg("goToBar",{bar:cur.measure+1});}},
      {n:"-"},
      {n:"Insert Note",k:getCombo("insertNote"),a:function(){var si2=JSON.parse(JSON.stringify(song));var it=si2.tracks[ati];var ab=[];for(var m=cur.measure;m<it.measures.length;m++){var s=(m===cur.measure)?cur.beat:0;for(var b=s;b<it.measures[m].beats.length;b++)ab.push(it.measures[m].beats[b]);}ab.unshift({notes:new Array(it.numStrings).fill(null)});ab.pop();var i=0;for(var m2=cur.measure;m2<it.measures.length;m2++){var s2=(m2===cur.measure)?cur.beat:0;for(var b2=s2;b2<it.measures[m2].beats.length;b2++)it.measures[m2].beats[b2]=ab[i++];}setSong(si2);setStatus("Inserted note at cursor");setOpenMenu(null);}},
      {n:"Delete Note",k:getCombo("deleteNote"),a:function(){var sd=JSON.parse(JSON.stringify(song));var dt=sd.tracks[ati];var ab=[];for(var m=cur.measure;m<dt.measures.length;m++){var s=(m===cur.measure)?cur.beat:0;for(var b=s;b<dt.measures[m].beats.length;b++)ab.push(dt.measures[m].beats[b]);}ab.shift();ab.push({notes:new Array(dt.numStrings).fill(null)});var i=0;for(var m2=cur.measure;m2<dt.measures.length;m2++){var s2=(m2===cur.measure)?cur.beat:0;for(var b2=s2;b2<dt.measures[m2].beats.length;b2++)dt.measures[m2].beats[b2]=ab[i++];}setSong(sd);setStatus("Deleted note at cursor");setOpenMenu(null);}},
    ]},
    {label:"Song", items:[
      {n:"Title & Comments...",k:getCombo("songTitle"),a:function(){openDlg("title",{title:song.title,artist:song.artist,album:song.album,transcribedBy:song.transcribedBy,copyright:song.copyright});}},
      {n:"Tempo...",k:getCombo("songTempo"),a:function(){openDlg("tempo",{tempo:song.tempo});}},
      {n:"Time Signature...",k:getCombo("timeSig"),a:function(){var curTs=getTimeSig(song.tracks[ati].measures[cur.measure]);openDlg("timeSig",{num:curTs.num,den:curTs.den,applyAll:false});setOpenMenu(null);}},
      {n:"-"},
      {n:"Insert Bar at Cursor",k:getCombo("insertBar"),a:function(){var s9=JSON.parse(JSON.stringify(song));var iTs=getTimeSig(s9.tracks[0].measures[cur.measure]);var iBts=timeSigBeats(iTs.num,iTs.den);for(var ti9=0;ti9<s9.tracks.length;ti9++){var newBeats=[];for(var bi9=0;bi9<iBts;bi9++)newBeats.push({notes:new Array(s9.tracks[ti9].numStrings).fill(null)});s9.tracks[ti9].measures.splice(cur.measure,0,{beats:newBeats,barLine:"single",beatsPerMeasure:iBts,globalBeatsPerMeasure:iBts,isATR:false,timeSig:{num:iTs.num,den:iTs.den}});}shiftSections(s9,cur.measure,1);setSong(s9);setStatus("Inserted bar at "+(cur.measure+1));setOpenMenu(null);}},
      {n:"Delete Bar at Cursor",k:getCombo("deleteBar"),a:function(){if(!song||song.tracks[0].measures.length<=1){setStatus("Cannot delete last bar");setOpenMenu(null);return;}var s9=JSON.parse(JSON.stringify(song));for(var ti9=0;ti9<s9.tracks.length;ti9++)s9.tracks[ti9].measures.splice(cur.measure,1);var nm=Math.min(cur.measure,s9.tracks[0].measures.length-1);setCur({measure:nm,beat:0,string:cur.string});shiftSections(s9,cur.measure,-1);setSong(s9);setStatus("Deleted bar "+(cur.measure+1));setOpenMenu(null);}},
      {n:"Duplicate Bar",a:function(){var s9=JSON.parse(JSON.stringify(song));for(var ti9=0;ti9<s9.tracks.length;ti9++){var dup=JSON.parse(JSON.stringify(s9.tracks[ti9].measures[cur.measure]));s9.tracks[ti9].measures.splice(cur.measure+1,0,dup);}setSong(s9);setCur({measure:cur.measure+1,beat:0,string:cur.string});setStatus("Duplicated bar "+(cur.measure+1));setOpenMenu(null);}},
      {n:"Add Bars...",a:function(){openDlg("bars",{count:16});}},
      {n:"Remove Unused Bars",a:function(){if(!song)return;_undoLabel.current="Remove Unused Bars";var s9=JSON.parse(JSON.stringify(song));var lastUsed=0;s9.tracks.forEach(function(tr){for(var mi=tr.measures.length-1;mi>=0;mi--){var hasNote=tr.measures[mi].beats.some(function(b){return b.notes.some(function(n){return!!n;});});if(hasNote){if(mi+1>lastUsed)lastUsed=mi+1;break;}}});if(lastUsed<1)lastUsed=1;var removed=0;s9.tracks.forEach(function(tr){if(tr.measures.length>lastUsed){removed=tr.measures.length-lastUsed;tr.measures.length=lastUsed;}});if(removed>0){setSong(s9);setStatus("Removed "+removed+" unused bar"+(removed!==1?"s":""));}else{setStatus("No unused bars to remove");}setOpenMenu(null);}},
      {n:"-"},
      {n:"Arrangement...",a:function(){openDlg("editSections",{sections:JSON.parse(JSON.stringify(song.sections||[]))});setOpenMenu(null);}},
      {n:"-"},
      {n:"Staff Break",k:getCombo("staffBreak"),a:function(){if(!song||cur.measure===0)return setOpenMenu(null);var s2=JSON.parse(JSON.stringify(song));for(var ti2=0;ti2<s2.tracks.length;ti2++){var m=s2.tracks[ti2].measures[cur.measure-1];if(!m)continue;if(m.staffBreak){m.staffBreak=false;if(m.barLine==="double")m.barLine="single";}else{m.staffBreak=true;if(m.barLine==="single")m.barLine="double";}}setSong(s2);setOpenMenu(null);}},
      {n:"Insert Bar Line",a:function(){if(!song)return setOpenMenu(null);if(cur.beat<=0){setStatus("Place cursor past beat 1 to insert a bar line");setOpenMenu(null);return;}var sb=JSON.parse(JSON.stringify(song));var splitBeat=cur.beat;for(var ti2=0;ti2<sb.tracks.length;ti2++){var trk=sb.tracks[ti2];var m=trk.measures[cur.measure];if(!m)continue;var bp=splitBeat,bp2=m.beats.length-splitBeat;if(bp2<=0)continue;var od=(m.timeSig&&m.timeSig.den)||4;var ts1=beatsToTimeSig(bp,od),ts2=beatsToTimeSig(bp2,od);var first={beats:m.beats.slice(0,splitBeat),barLine:"single",beatsPerMeasure:bp,globalBeatsPerMeasure:bp,isATR:!!m.isATR,timeSig:ts1};var second={beats:m.beats.slice(splitBeat),barLine:m.barLine||"single",beatsPerMeasure:bp2,globalBeatsPerMeasure:bp2,isATR:!!m.isATR,timeSig:ts2,staffBreak:m.staffBreak,repeatCount:m.repeatCount};trk.measures.splice(cur.measure,1,first,second);}shiftSections(sb,cur.measure+1,1);_undoLabel.current="Insert Bar Line";setSong(sb);setCur({measure:cur.measure+1,beat:0,string:cur.string});setStatus("Inserted bar line at M"+(cur.measure+1));setOpenMenu(null);}},
      {n:"Repeat Open",k:getCombo("repeatOpen"),a:function(){var sr=JSON.parse(JSON.stringify(song));var ex0=sr.tracks[ati].measures[cur.measure]?sr.tracks[ati].measures[cur.measure].barLine:"single";var newBl=ex0==="repeatStart"?"single":ex0==="repeatBoth"?"repeatEnd":ex0==="repeatEnd"?"repeatBoth":"repeatStart";sr.tracks.forEach(function(tr2){if(cur.measure<tr2.measures.length){tr2.measures[cur.measure].barLine=newBl;}});setSong(sr);setOpenMenu(null);}},
      {n:"Repeat Close...",k:getCombo("repeatClose"),a:function(){if(!song)return;var curBl2=song.tracks[ati].measures[cur.measure]?song.tracks[ati].measures[cur.measure].barLine:"single";if(curBl2==="repeatEnd"){var sr4=JSON.parse(JSON.stringify(song));sr4.tracks.forEach(function(tr4){if(cur.measure<tr4.measures.length){tr4.measures[cur.measure].barLine="single";tr4.measures[cur.measure].repeatCount=0;}});setSong(sr4);setOpenMenu(null);}else if(curBl2==="repeatBoth"){var sr5=JSON.parse(JSON.stringify(song));sr5.tracks.forEach(function(tr4){if(cur.measure<tr4.measures.length){tr4.measures[cur.measure].barLine="repeatStart";tr4.measures[cur.measure].repeatCount=0;}});setSong(sr5);setOpenMenu(null);}else{openDlg("repeatClose",{count:2});}}},
    ]},
    {label:"Track", items:[
      {n:"Track Properties...",k:getCombo("trackProps"),a:function(){var tp2=song.tracks[ati];openDlg("trackProps",trackPropsData(tp2));}},
      {n:"-"},
      {n:"Add Track...",a:function(){openDlg("addTrack",addTrackData());}},
      {n:"Delete Track",a:function(){if(song.tracks.length>1){deleteTrack();setStatus("Deleted track");}setOpenMenu(null);}},
      {n:"Duplicate Track",a:function(){var s9=JSON.parse(JSON.stringify(song));var dup=JSON.parse(JSON.stringify(s9.tracks[ati]));dup.name=(dup.name||"Track")+" (copy)";s9.tracks.splice(ati+1,0,dup);setSong(s9);atiRef.current=ati+1;setAti(ati+1);setStatus("Duplicated track");setOpenMenu(null);}},
      {n:"Move Tracks...",a:function(){openDlg("moveTracks");}},
    ]},
    {label:"Create", items:[
      {n:"Muted String",k:"X",sym:"x",a:function(){placeMuted();setOpenMenu(null);}},
      {n:"Stop String",k:"*",sym:"*",a:function(){placeStop();setOpenMenu(null);}},
      {n:"-"},
      {n:"Note Effects",sub:[
        {n:"Hammer-on",k:"H",sym:"h",a:function(){toggleEffect(104);setOpenMenu(null);}},
        {n:"Pull-off",k:"P",sym:"p",a:function(){toggleEffect(112);setOpenMenu(null);}},
        {n:"Slide Up",k:"/",sym:"/",a:function(){toggleEffect(47);setOpenMenu(null);}},
        {n:"Slide Down",k:"\\",sym:"\\",a:function(){toggleEffect(92);setOpenMenu(null);}},
        {n:"Pre-Bend...",k:getCombo("preBend"),sym:"Pb",a:function(){setOpenMenu(null);var n9pb=song.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(n9pb&&n9pb.attack&&!n9pb.stop&&!n9pb.muted){var pbVal=window.prompt("Pre-bend from fret (empty to clear):",n9pb.preBend!==undefined?String(n9pb.preBend):"");if(pbVal!==null){var s9pb=JSON.parse(JSON.stringify(song));var nn9pb=s9pb.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(pbVal.trim()===""){delete nn9pb.preBend;}else{var pf=parseInt(pbVal);if(!isNaN(pf)&&pf>=0&&pf<=24){if(pf>=nn9pb.fret){setStatus("Pre-bend fret "+pf+" must be lower than note fret "+nn9pb.fret);}else{nn9pb.preBend=pf;}}}setSong(s9pb);}}else{setStatus("No note at cursor");}}},
        {n:"Bend",k:"B",sym:"b",a:function(){toggleEffect(98);setOpenMenu(null);}},
        {n:"Bend Hold",k:"=",sym:"=",a:function(){var n9h=song.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(n9h&&n9h.attack&&!n9h.stop&&!n9h.muted){var s9h=JSON.parse(JSON.stringify(song));s9h.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].bendHold=!n9h.bendHold;setSong(s9h);}setOpenMenu(null);}},
        {n:"Release Bend",k:"R",sym:"r",a:function(){toggleEffect(114);setOpenMenu(null);}},
        {n:"Vibrato",k:"~",sym:"~",a:function(){toggleEffect(126);setOpenMenu(null);}},
        {n:"-"},
        {n:"Tap",k:"T",sym:"t",a:function(){toggleEffect(116);setOpenMenu(null);}},
        {n:"Slap",k:"S",sym:"s",a:function(){toggleEffect(115);setOpenMenu(null);}},
        {n:"Soft",k:"(",sym:"(",a:function(){toggleEffect(40);setOpenMenu(null);}},
        {n:"Harmonic",k:"<",sym:"<",a:function(){toggleEffect(60);setOpenMenu(null);}},
        {n:"Tremolo",k:"{",sym:"{",a:function(){toggleEffect(123);setOpenMenu(null);}},
        {n:"Whammy",k:"W",sym:"w",a:function(){toggleEffect(119);setOpenMenu(null);}},
        {n:"Palm Mute",k:"M",sym:"m",a:function(){toggleEffect(109);setOpenMenu(null);}},
        {n:"-"},
        {n:"Note Velocity...",k:getCombo("noteVelocity"),sym:"Ve",a:function(){setOpenMenu(null);var vt=song.tracks[ati],vb2=vt.measures[cur.measure]&&vt.measures[cur.measure].beats[cur.beat],vn=vb2&&vb2.notes[cur.string];if(vn){var newV=window.prompt("Note velocity (1-127, track default: "+(vt.trackVelocity||80)+")\nLeave empty to use track default:",vn.vel!==undefined?String(vn.vel):"");if(newV!==null){var s9=JSON.parse(JSON.stringify(song));var nn=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(newV.trim()===""){delete nn.vel;}else{var vv=parseInt(newV);if(!isNaN(vv)&&vv>=1&&vv<=127)nn.vel=vv;}setSong(s9);}}else{setStatus("No note at cursor");}}},
        {n:"Indefinite Ring",k:"!",sym:"!",a:function(){var n9c=song.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(n9c&&n9c.attack&&!n9c.stop&&!n9c.muted){var s9c=JSON.parse(JSON.stringify(song));s9c.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].ring=!n9c.ring;setSong(s9c);}setOpenMenu(null);}},
      ]},
      {n:"-"},
      {n:"Tempo Change...",k:getCombo("tempoChange"),a:function(){openDlg("tempoChange",{tempo:song.tempo});}},
      {n:"Instrument Change...",k:getCombo("instChange"),a:function(){openDlg("instChange",{instrument:song.tracks[ati].instrument,letRing:song.tracks[ati].letRing||false});}},
      {n:"Volume Change...",k:getCombo("volChange"),a:function(){openDlg("volChange",{volume:song.tracks[ati].volume});}},
      {n:"All Track Effects...",k:getCombo("trackEffects"),a:function(){openDlg("trackEffects",buildEfxData());}},
      {n:"-"},
      {n:"Alternate Time Region...",k:getCombo("altTimeRegion"),a:function(){openDlg("altTime");}},
    ]},
    {label:"Play", items:[
      {n:"Play",k:"F5",a:function(){playAllRef.current=false;setPlayAll(false);doPlay(false);setOpenMenu(null);}},
      {n:"Play All Tracks",k:"F6",a:function(){playAllRef.current=true;setPlayAll(true);doPlay(true);setOpenMenu(null);}},
      {n:"Stop",k:"F8",a:function(){if(!playing){_setCurRaw({measure:0,beat:0,string:curRef.current.string});if(sRef.current)sRef.current.scrollLeft=0;}else{stopPlay();}setOpenMenu(null);}},
      {n:"-"},
      {n:(metro?"\u2713 ":"")+"Metronome",k:"F11",a:function(){setMetro(!metro);setOpenMenu(null);}},
      {n:(rewindAfterStop?"\u2713 ":"")+"Rewind After Stop",k:"F9",a:function(){setRewindAfterStop(!rewindAfterStop);setOpenMenu(null);}},
      {n:"-"},
      {n:"Practice Mode",sub:[
        {n:"Settings...",a:function(){openDlg("practice",{speed:practiceSpeed,autoInc:practiceAutoInc,incStep:practiceIncStep,targetSpeed:practiceTargetSpeed});setOpenMenu(null);}},
        {n:"Set Loop Start",k:"[",a:function(){setLoopAValidated({measure:cur.measure,beat:cur.beat});setOpenMenu(null);}},
        {n:"Set Loop End",k:"]",a:function(){setLoopBValidated({measure:cur.measure,beat:cur.beat});setOpenMenu(null);}},
        {n:"Clear Loop",a:function(){setLoopA(null);setLoopB(null);setPracticeSpeed(100);practiceSpeedRef.current=100;_practiceLoopCount.current=0;setStatus("Loop cleared");setOpenMenu(null);}},
      ]},
    ]},
    {label:"View", items:[
      {n:darkMode?"Light Mode":"Dark Mode",a:function(){toggleDarkMode();setOpenMenu(null);}},
    ].concat(isMobile?[{n:(!betaKb?"\u2713 ":"")+"Classic Keyboard",a:function(){setBetaKb(!betaKb);setOpenMenu(null);}}]:[]).concat([
      {n:"-"},
      {n:"Zoom In",k:"Ctrl+=",a:function(){setZoom(Math.min((zoom||100)+10,200));setOpenMenu(null);}},
      {n:"Zoom Out",k:"Ctrl+-",a:function(){setZoom(Math.max((zoom||100)-10,50));setOpenMenu(null);}},
      {n:"Zoom Reset",k:"Ctrl+0",a:function(){setZoom(100);setOpenMenu(null);}},
      {n:"-"},
      {n:(autoScroll?"\u2713 ":"")+"Auto-Scroll",a:function(){setAutoScroll(!autoScroll);setOpenMenu(null);}},
      {n:(showMenuBar?"\u2713 ":"")+"Menu Bar",a:function(){setShowMenuBar(!showMenuBar);setOpenMenu(null);}},
    ])},
    {label:"Tools", items:[
      {n:"Time at Cursor",k:"Ctrl+'",a:function(){if(!song)return;var bpm2=song.tempo;var spb2=60/bpm2/4;var totalSecs=0;var t2=song.tracks[ati];for(var mi2=0;mi2<cur.measure;mi2++){var gBeats2=t2.measures[mi2]?t2.measures[mi2].globalBeatsPerMeasure||BPM:BPM;totalSecs+=gBeats2*spb2;}var curMeasBeats=t2.measures[cur.measure];if(curMeasBeats){var gAccum2=0;for(var bi2=0;bi2<Math.min(cur.beat,curMeasBeats.beats.length);bi2++){var wb2=curMeasBeats.beats[bi2];var gc2=1;if(wb2&&wb2.atrGroup&&wb2.atrGroup>1)gc2=(wb2.atrNum||1)/wb2.atrGroup;gAccum2+=gc2;}totalSecs+=gAccum2*spb2;}var mm=Math.floor(totalSecs/60);var ss=Math.floor(totalSecs%60);var cs=Math.floor((totalSecs%1)*100);openDlg("timeAtCursor",{time:mm+":"+String(ss).padStart(2,"0")+"."+String(cs).padStart(2,"0")});setOpenMenu(null);}},
      {n:"-"},
    ].concat(isMobile ? [] : [{n:"Customize Shortcuts...",a:function(){openDlg("remapKeys",{tempKeymap:Object.assign({},keymap),editingAction:null,capturedCombo:null});setOpenMenu(null);}}]).concat([
      {n:"Edit Token Manager...",a:function(){
        var toks = getShareTokens();
        var ids = Object.keys(toks);
        if (ids.length === 0) { openDlg("editTokens",{tokens:toks, tabInfo:{}}); setOpenMenu(null); return; }
        // Fetch info for each share ID (works for both public and private)
        Promise.all(ids.map(function(sid){
          return fetch("/.netlify/functions/share?id="+encodeURIComponent(sid)+"&info=true")
            .then(function(r){return r.ok?r.json():null;})
            .catch(function(){return null;});
        })).then(function(results){
          var map = {};
          results.forEach(function(r,i){ if(r) map[ids[i]] = {title:r.title||"Untitled", artist:r.artist||"", visibility:r.visibility||"public"}; });
          openDlg("editTokens",{tokens:toks, tabInfo:map});
        });
        setOpenMenu(null);
      }},
      {n:"Appearance...",a:function(){openDlg("appearance",Object.assign({},appearance));}},
      {n:"Options...",a:function(){openDlg("options",{sfUrl:_sf2LocalName?"":SF_URL});}},
    ])},
  ].concat(isMobile ? [] : [{label:"Help", items:[
      {n:"Help Topics",k:"F1",a:function(){openDlg("help");}},
      {n:"Keyboard Shortcuts",k:"?",a:function(){setShowCheatSheet(true);setOpenMenu(null);}},
    ].concat(!isMobile?[{n:"-"}].concat(canInstall?[{n:"\uD83D\uDCE5 Install App",a:function(){setOpenMenu(null);if(window._pwaPromptEvent){window._pwaPromptEvent.prompt();window._pwaPromptEvent.userChoice.then(function(r){if(r.outcome==="accepted"){setCanInstall(false);window._pwaPromptEvent=null;}});}}}]:[]).concat([{n:"About TabKit...",a:function(){openDlg("about");}}]):[])}]);

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif",fontSize:12,background:TH.bg,color:TH.text,userSelect:"none",overflow:"hidden"}}
      onDragOver={function(e){e.preventDefault();e.stopPropagation();}}
      onDragEnter={function(e){e.preventDefault();e.stopPropagation();_dropCounter.current++;if(_dropCounter.current===1)setDropActive(true);}}
      onDragLeave={function(e){e.preventDefault();e.stopPropagation();_dropCounter.current--;if(_dropCounter.current<=0){_dropCounter.current=0;setDropActive(false);}}}
      onDrop={handleDrop}>
      {/* Command Palette */}
      {cmdPalOpen ? (function(){
        var _cpQ = ""; var _cpSel = 0;
        var CmdPal = function(){
          var _qs = useState(""); var cpQuery = _qs[0]; var setCpQuery = _qs[1];
          var _si = useState(0); var cpIdx = _si[0]; var setCpIdx = _si[1];
          var inputRef = useRef(null);
          useEffect(function(){if(inputRef.current)inputRef.current.focus();},[]);
          var allCmds = useMemo(function(){
            var cmds = [];
            menus.forEach(function(menu){
              menu.items.forEach(function(item){
                if(item.n==="-")return;
                if(item.sub){
                  item.sub.forEach(function(sub){
                    if(sub.n==="-")return;
                    cmds.push({name:sub.n.replace(/^\u2713 /,""),group:menu.label+" \u203A "+item.n,shortcut:sub.k||"",action:sub.a});
                  });
                } else {
                  cmds.push({name:item.n.replace(/^\u2713 /,""),group:menu.label,shortcut:item.k||"",action:item.a});
                }
              });
            });
            // Extra commands for features not in menus
            var tp0=function(tab){return function(){var tp2=song.tracks[ati];openDlg("trackProps",trackPropsData(tp2,tab));};};
            cmds.push({name:"Delay (Set on Track)",group:"Track Properties \u203A Effects",shortcut:"",action:tp0("effects")});
            cmds.push({name:"Pitch Shifter (Set on Track)",group:"Track Properties \u203A Effects",shortcut:"",action:tp0("effects")});
            cmds.push({name:"Tremolo (Set on Track)",group:"Track Properties \u203A Effects",shortcut:"",action:tp0("effects")});
            cmds.push({name:"Track Tuning",group:"Track Properties \u203A Tuning",shortcut:"",action:tp0("tuning")});
            cmds.push({name:"Track Playback Settings",group:"Track Properties \u203A Playback",shortcut:"",action:tp0("playback")});
            cmds.push({name:"Pedal Effects (Set on Track)",group:"Track Properties \u203A Effects",shortcut:"",action:tp0("effects")});
            cmds.push({name:"Track MIDI Controllers",group:"Track Properties \u203A MIDI",shortcut:"",action:tp0("midi")});
            cmds.push({name:"Volume (Set on Track)",group:"Track Properties \u203A Playback",shortcut:"",action:tp0("playback")});
            cmds.push({name:"Pan (Set on Track)",group:"Track Properties \u203A Playback",shortcut:"",action:tp0("playback")});
            cmds.push({name:"Reverb (Set on Track)",group:"Track Properties \u203A Playback",shortcut:"",action:tp0("playback")});
            cmds.push({name:"Chorus (Set on Track)",group:"Track Properties \u203A Playback",shortcut:"",action:tp0("playback")});
            cmds.push({name:"Expression (Set on Track)",group:"Track Properties \u203A Playback",shortcut:"",action:tp0("playback")});
            cmds.push({name:"Pitch Bend (Set on Track)",group:"Track Properties \u203A MIDI",shortcut:"",action:tp0("midi")});
            cmds.push({name:"Modulation (Set on Track)",group:"Track Properties \u203A MIDI",shortcut:"",action:tp0("midi")});
            var efx0=function(tab){return function(){var qd=buildEfxData();qd.tab=tab;openDlg("trackEffects",qd);};};
            cmds.push({name:"Track Effects at Cursor",group:"Track Effects \u203A General",shortcut:getCombo("trackEffects"),action:efx0("general")});
            cmds.push({name:"Delay (Set at Cursor)",group:"Track Effects \u203A Effects",shortcut:"",action:efx0("effects")});
            cmds.push({name:"Pitch Shifter (Set at Cursor)",group:"Track Effects \u203A Effects",shortcut:"",action:efx0("effects")});
            cmds.push({name:"Tremolo (Set at Cursor)",group:"Track Effects \u203A Effects",shortcut:"",action:efx0("effects")});
            cmds.push({name:"Tempo Change (Set at Cursor)",group:"Track Effects \u203A General",shortcut:getCombo("tempoChange"),action:function(){openDlg("tempoChange",{tempo:song.tempo});}});
            cmds.push({name:"Instrument Change (Set at Cursor)",group:"Track Effects \u203A General",shortcut:getCombo("instChange"),action:function(){openDlg("instChange",{instrument:song.tracks[ati].instrument,letRing:song.tracks[ati].letRing||false});}});
            cmds.push({name:"Volume Change (Set at Cursor)",group:"Track Effects \u203A General",shortcut:getCombo("volChange"),action:function(){openDlg("volChange",{volume:song.tracks[ati].volume});}});
            cmds.push({name:"Velocity (Set at Cursor)",group:"Track Effects \u203A General",shortcut:"",action:efx0("general")});
            cmds.push({name:"Expression (Set at Cursor)",group:"Track Effects \u203A General",shortcut:"",action:efx0("general")});
            cmds.push({name:"Stroke Down (Set at Cursor)",group:"Track Effects \u203A General",shortcut:"",action:efx0("general")});
            cmds.push({name:"Stroke Up (Set at Cursor)",group:"Track Effects \u203A General",shortcut:"",action:efx0("general")});
            cmds.push({name:"MIDI Controllers at Cursor",group:"Track Effects \u203A MIDI",shortcut:getCombo("midiControllers"),action:efx0("midi")});
            cmds.push({name:"Pitch Bend (Set at Cursor)",group:"Track Effects \u203A MIDI",shortcut:"",action:efx0("midi")});
            cmds.push({name:"Modulation (Set at Cursor)",group:"Track Effects \u203A MIDI",shortcut:"",action:efx0("midi")});
            cmds.push({name:"Reverb (Set at Cursor)",group:"Track Effects \u203A MIDI",shortcut:"",action:efx0("midi")});
            cmds.push({name:"Chorus (Set at Cursor)",group:"Track Effects \u203A MIDI",shortcut:"",action:efx0("midi")});
            cmds.push({name:"Pan (Set at Cursor)",group:"Track Effects \u203A MIDI",shortcut:"",action:efx0("midi")});
            cmds.push({name:"Channel (Set at Cursor)",group:"Track Effects \u203A MIDI",shortcut:"",action:efx0("midi")});
            cmds.push({name:"Solo Track",group:"Track",shortcut:"",action:function(){var s9=JSON.parse(JSON.stringify(song));var tr=s9.tracks[ati];tr.solo=!tr.solo;setSong(s9);setStatus(tr.solo?"Solo ON":"Solo OFF");}});
            cmds.push({name:"Mute Track",group:"Track",shortcut:"",action:function(){var s9=JSON.parse(JSON.stringify(song));var tr=s9.tracks[ati];tr.mute=!tr.mute;setSong(s9);setStatus(tr.mute?"Muted":"Unmuted");}});
            cmds.push({name:"Next Track",group:"Track",shortcut:"PgDn",action:function(){var n=Math.min(ati+1,song.tracks.length-1);if(n!==ati){atiRef.current=n;setAti(n);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[n].numStrings-1)});setTimeout(function(){var el=stickyRefs.current[n+1];if(el&&el.parentElement&&sRef.current){var wrapper=el.parentElement;var wTop=wrapper.offsetTop;var wH=wrapper.offsetHeight;var sH=sRef.current.clientHeight;if(wH<=sH){sRef.current.scrollTop=Math.max(0,wTop-Math.max(0,(sH-wH)/2));}else{sRef.current.scrollTop=Math.max(0,wTop-4);}}},50);}}});
            cmds.push({name:"Previous Track",group:"Track",shortcut:"PgUp",action:function(){var n=Math.max(ati-1,0);if(n!==ati){atiRef.current=n;setAti(n);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[n].numStrings-1)});setTimeout(function(){var el=stickyRefs.current[n+1];if(el&&el.parentElement&&sRef.current){var wrapper=el.parentElement;var wTop=wrapper.offsetTop;var wH=wrapper.offsetHeight;var sH=sRef.current.clientHeight;if(wH<=sH){sRef.current.scrollTop=Math.max(0,wTop-Math.max(0,(sH-wH)/2));}else{sRef.current.scrollTop=Math.max(0,wTop-4);}}},50);}}});
            cmds.push({name:"Zoom In",group:"View",shortcut:"Ctrl+=",action:function(){setZoom(Math.min((zoom||100)+10,200));}});
            cmds.push({name:"Zoom Out",group:"View",shortcut:"Ctrl+-",action:function(){setZoom(Math.max((zoom||100)-10,50));}});
            cmds.push({name:"Zoom Reset",group:"View",shortcut:"Ctrl+0",action:function(){setZoom(100);}});
            if(isMobile){cmds.push({name:"Select Mode",group:"Edit",shortcut:"",action:function(){var newSM=!_selectModeRef.current;_selectModeRef.current=newSM;if(newSM){setSel({startMeasure:cur.measure,startBeat:cur.beat,endMeasure:cur.measure,endBeat:cur.beat});_selOriginTrack.current=ati;}else{setSel(null);_selOriginTrack.current=null;}}});}
            cmds.push({name:"Undo History...",group:"Edit",shortcut:"",action:function(){openDlg("undoHistory",{});}});
            cmds.push({name:"Practice Mode...",group:"Play",shortcut:"",action:function(){openDlg("practice",{speed:practiceSpeed,autoInc:practiceAutoInc,incStep:practiceIncStep,targetSpeed:practiceTargetSpeed});}});
            cmds.push({name:"Set Loop Start",group:"Play",shortcut:"[",action:function(){setLoopAValidated({measure:cur.measure,beat:cur.beat});}});
            cmds.push({name:"Set Loop End",group:"Play",shortcut:"]",action:function(){setLoopBValidated({measure:cur.measure,beat:cur.beat});}});
            cmds.push({name:"Clear Loop",group:"Play",shortcut:"",action:function(){setLoopA(null);setLoopB(null);setPracticeSpeed(100);practiceSpeedRef.current=100;_practiceLoopCount.current=0;setStatus("Loop cleared");}});
            cmds.push({name:"Chord Progression...",group:"Tools",shortcut:"",action:function(){var t2=song.tracks[ati];openDlg("chord",{root:0,qualIdx:0,posIdx:0,bass:"root",tuning:t2.tuning.slice(),numStrings:t2.numStrings,voicings:[],selectedFrets:null,progMode:true});}});
            cmds.push({name:showMenuBar?"Hide Menu Bar":"Show Menu Bar",group:"View",shortcut:"",action:function(){setShowMenuBar(!showMenuBar);}});
            return cmds;
          },[]);
          var filtered = useMemo(function(){
            if(!cpQuery)return allCmds;
            var q = cpQuery.toLowerCase();
            return allCmds.filter(function(c){return c.name.toLowerCase().indexOf(q)>=0 || c.group.toLowerCase().indexOf(q)>=0;});
          },[cpQuery, allCmds]);
          var safeIdx = Math.min(cpIdx, filtered.length-1);
          var runCmd = function(cmd){if(cmd&&cmd.action){setCmdPalOpen(false);cmd.action();}};
          return React.createElement("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,background:"rgba(0,0,0,0.4)",display:"flex",justifyContent:"center",paddingTop:isMobile?20:60},
            onClick:function(){setCmdPalOpen(false);}},
            React.createElement("div",{style:{background:darkMode?"#252525":"#fff",border:"1px solid "+(darkMode?"#555":"#d0d4dc"),borderRadius:12,width:isMobile?"92%":"420px",maxHeight:isMobile?"80vh":"400px",display:"flex",flexDirection:"column",boxShadow:"0 16px 48px rgba(0,0,0,0.3)",overflow:"hidden"},
              onClick:function(e){e.stopPropagation();}},
              React.createElement("div",{style:{padding:"12px 14px 8px",borderBottom:"1px solid "+(darkMode?"#444":"#e4e8f0")}},
                React.createElement("input",{ref:inputRef,type:"text",placeholder:"Type a command...",value:cpQuery,
                  onChange:function(e){setCpQuery(e.target.value);setCpIdx(0);},
                  onKeyDown:function(e){
                    if(e.key==="Escape"){e.preventDefault();setCmdPalOpen(false);}
                    else if(e.key==="ArrowDown"){e.preventDefault();setCpIdx(Math.min(cpIdx+1,filtered.length-1));}
                    else if(e.key==="ArrowUp"){e.preventDefault();setCpIdx(Math.max(cpIdx-1,0));}
                    else if(e.key==="Enter"){e.preventDefault();runCmd(filtered[safeIdx]);}
                  },
                  style:{width:"100%",padding:"8px 10px",fontSize:14,border:"1px solid "+(darkMode?"#555":"#d0d4dc"),borderRadius:8,outline:"none",background:darkMode?"#1e1e1e":"#fff",color:darkMode?"#d4d4d4":"#1a1a2e",fontFamily:"system-ui,-apple-system,sans-serif",boxSizing:"border-box"}
                })
              ),
              React.createElement("div",{style:{overflowY:"auto",flex:1,padding:"4px 0"}},
                filtered.length === 0 ? React.createElement("div",{style:{padding:"16px",textAlign:"center",opacity:0.5,fontSize:12}},"No commands found") :
                filtered.map(function(cmd, ci){
                  var isActive = ci === safeIdx;
                  return React.createElement("div",{key:ci,
                    onMouseEnter:function(){setCpIdx(ci);},
                    onClick:function(){runCmd(cmd);},
                    style:{padding:"7px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
                      background:isActive?(darkMode?"#3264dc":"#e8eeff"):"transparent",
                      color:isActive?(darkMode?"#fff":"#1a1a2e"):(darkMode?"#ccc":"#333")}},
                    React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:1}},
                      React.createElement("span",{style:{fontSize:13,fontWeight:isActive?"500":"400"}},cmd.name),
                      React.createElement("span",{style:{fontSize:10,opacity:0.5}},cmd.group)
                    ),
                    cmd.shortcut ? React.createElement("span",{style:{fontSize:10,padding:"2px 6px",borderRadius:4,background:darkMode?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)",fontFamily:"monospace",whiteSpace:"nowrap",flexShrink:0,marginLeft:8}},cmd.shortcut) : null
                  );
                })
              )
            )
          );
        };
        return React.createElement(CmdPal);
      })() : null}
      {dropActive && <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,background:"var(--accent-soft,rgba(50,100,220,0.1))",border:"3px dashed var(--accent,#3264dc)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",borderRadius:0}}>
        <div style={{background:"var(--surface-0,#fff)",padding:"28px 44px",borderRadius:16,boxShadow:"var(--shadow-lg, 0 4px 20px rgba(0,0,0,0.15))",textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:10}}>{"\uD83C\uDFB8"}</div>
          <div style={{fontSize:16,fontWeight:"600",letterSpacing:"-0.01em"}}>{"Drop .tkt or .tbt files here"}</div>
        </div>
      </div>}
      <input type="file" ref={fRef} accept=".tbt,.tkt" style={{display:"none"}} onChange={handleOpen} />

      {/* Menu bar */}
      {showMenuBar ? <div style={{display:"flex",height:isMobile?32:22,background:TH.hdr,borderBottom:"1px solid var(--border-subtle,"+TH.hdrB+")",padding:0,flexShrink:0,position:"relative",zIndex:100}}>
        {menus.map(function(menu, menuIdx) {
          return (
          <div key={menu.label} style={{position:"relative",flexShrink:isMobile?1:0}}>
            <div style={{padding:isMobile?"6px 10px":"3px 10px",cursor:"pointer",fontSize:isMobile?12:11,whiteSpace:"nowrap",
              borderRadius:isMobile?0:4,margin:isMobile?0:"0 1px",
              background:openMenu===menu.label?"var(--accent,#3264dc)":"transparent",
              color:openMenu===menu.label?"#fff":TH.menuT,transition:"background 0.15s"}}
              onClick={function(){setOpenMenu(openMenu===menu.label?null:menu.label);setMobileSubOpen(null);}}
              onMouseEnter={function(ev){if(openMenu)setOpenMenu(menu.label);else{ev.currentTarget.style.background="var(--surface-3,#e4e8f0)";}}}
              onMouseLeave={function(ev){if(openMenu!==menu.label){ev.currentTarget.style.background="";}}}
            >{menu.label}</div>
            {openMenu === menu.label ? (
              <div ref={function(el){if(el){var r=el.getBoundingClientRect();if(r.right>window.innerWidth){el.style.left="auto";el.style.right="0";}var r2=el.getBoundingClientRect();if(r2.left<0){el.style.left="0";el.style.right="auto";}if(r2.bottom>window.innerHeight){el.style.maxHeight=Math.max(200,window.innerHeight-r2.top-10)+"px";el.style.overflowY="auto";}}}}
                style={{position:"absolute",top:isMobile?32:22,left:0,background:TH.menuBg,color:TH.menuT,border:"1px solid var(--border-subtle,#e4e8f0)",boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,.12))",minWidth:isMobile?240:200,maxWidth:isMobile?"92vw":"none",maxHeight:isMobile?"70vh":"none",overflowY:isMobile?"auto":"visible",zIndex:200,padding:"4px 0",borderRadius:10}}>
                {menu.items.map(function(item,ii){
                  if (item.n==="-") return (<div key={ii} style={{height:1,background:"var(--border-subtle,#e4e8f0)",margin:"4px 8px"}} />);
                  if (item.sub) {
                    if (isMobile) {
                      // Mobile: inline expandable submenu
                      return (
                        <div key={ii}>
                          <div style={{padding:"10px 24px 10px 20px",cursor:"pointer",fontSize:14,whiteSpace:"nowrap",display:"flex",justifyContent:"space-between"}}
                            onClick={function(){setMobileSubOpen(mobileSubOpen===ii?null:ii);}}>
                            <span>{item.n}</span><span>{mobileSubOpen===ii?"\u25BC":"\u25B6"}</span>
                          </div>
                          {(mobileSubOpen===ii) && (
                            <div style={{background:TH.menuBg,borderTop:"1px solid var(--border-subtle,#e4e8f0)",borderBottom:"1px solid var(--border-subtle,#e4e8f0)",padding:"4px 0 4px 16px"}}>
                              {item.sub.map(function(si,sii){
                                if(si.n==="-") return (<div key={sii} style={{height:1,background:"var(--border-subtle,#e4e8f0)",margin:"4px 8px"}} />);
                                return (<div key={sii} style={{padding:"10px 24px 10px 20px",cursor:"pointer",fontSize:14,whiteSpace:"nowrap",display:"flex",justifyContent:"space-between",color:TH.menuT}}
                                  onClick={si.a}><span>{si.n}</span>{si.sym?<span style={{opacity:0.5,fontFamily:"Consolas,monospace",minWidth:24,textAlign:"right"}}>{si.sym}</span>:null}</div>);
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                    <div key={ii} style={{position:"relative",padding:"4px 16px 4px 14px",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",display:"flex",justifyContent:"space-between",borderRadius:6,margin:"0 4px",transition:"background 0.1s"}}
                      onMouseEnter={function(ev3){ev3.currentTarget.style.background="var(--accent,#3264dc)";ev3.currentTarget.style.color="#fff";ev3.currentTarget.querySelector('.submenu').style.display='block';}}
                      onMouseLeave={function(ev3){ev3.currentTarget.style.background="";ev3.currentTarget.style.color="";ev3.currentTarget.querySelector('.submenu').style.display='none';}}>
                      <span>{item.n}</span><span>{"\u25B6"}</span>
                      <div className="submenu" style={{display:"none",position:"absolute",top:-2,left:"100%",background:TH.menuBg,border:"1px solid var(--border-subtle,#e4e8f0)",boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,.12))",minWidth:180,zIndex:300,padding:"4px 0",color:TH.menuT,borderRadius:10}}>
                        {item.sub.map(function(si,sii){
                          if(si.n==="-") return (<div key={sii} style={{height:1,background:"var(--border-subtle,#e4e8f0)",margin:"4px 8px"}} />);
                          return (<div key={sii} style={{padding:"4px 16px 4px 14px",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",display:"flex",justifyContent:"space-between",borderRadius:6,margin:"0 4px",transition:"background 0.1s"}}
                            onMouseEnter={function(ev4){ev4.currentTarget.style.background="var(--accent-soft,rgba(50,100,220,0.1))";ev4.currentTarget.style.color="var(--accent,#3264dc)";}}
                            onMouseLeave={function(ev4){ev4.currentTarget.style.background="";ev4.currentTarget.style.color="";}}
                            onClick={si.a}><span>{si.n}</span>{si.k?<span style={{fontSize:10,marginLeft:20}}>{kLabel(si.k)}</span>:null}</div>);
                        })}
                      </div>
                    </div>
                  );}
                  return (
                    <div key={ii} style={{padding:isMobile?"10px 18px":"4px 16px 4px 14px",cursor:"pointer",fontSize:isMobile?14:11,whiteSpace:"nowrap",display:"flex",justifyContent:"space-between",borderRadius:6,margin:"0 4px",transition:"background 0.1s"}}
                      onMouseEnter={function(ev3){ev3.currentTarget.style.background="var(--accent-soft,rgba(50,100,220,0.1))";ev3.currentTarget.style.color="var(--accent,#3264dc)";}}
                      onMouseLeave={function(ev3){ev3.currentTarget.style.background="";ev3.currentTarget.style.color="";}}
                      onClick={item.a}>
                      <span>{item.n}</span>
                      {isMobile && item.sym ? <span style={{opacity:0.5,fontFamily:"Consolas,monospace",minWidth:24,textAlign:"right"}}>{item.sym}</span> : null}
                      {!isMobile && item.k ? <span style={{color:"inherit",fontSize:10,marginLeft:20}}>{kLabel(item.k)}</span> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );})}
        {openMenu ? <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99}} onClick={function(){setOpenMenu(null);setMobileSubOpen(null);}} /> : null}
      </div> : null}

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",height:isMobile?42:28,background:TH.tbBg,borderBottom:"1px solid var(--border-subtle,"+TH.tbB+")",padding:"0 4px",gap:isMobile?4:2,flexShrink:0,overflowX:isMobile?"auto":"visible",overflowY:"hidden",position:"relative"}}>
        {isMobile && <TBB t={showMenuBar?"Hide Menu Bar":"Show Menu Bar"} c={function(){setShowMenuBar(!showMenuBar);}} a={showMenuBar}>{React.createElement("svg",{width:14,height:14,viewBox:"0 0 16 16",fill:"none",stroke:darkMode?"#ccc":"#555",strokeWidth:1.6,strokeLinecap:"round"},React.createElement("line",{x1:2,y1:4,x2:14,y2:4}),React.createElement("line",{x1:2,y1:8,x2:14,y2:8}),React.createElement("line",{x1:2,y1:12,x2:14,y2:12}))}</TBB>}
        {isMobile && <div style={{width:1,height:16,background:"var(--border-subtle,#e4e8f0)",margin:"0 2px"}} />}
        <TBB t="New (Ctrl+N)" c={newSong}>{_ico("new")}</TBB>
        <TBB t="Open (Ctrl+O)" c={function(){triggerOpen();}}>{_ico("open")}</TBB>
        <TBB t="Browse Shared" c={function(){window.open("browse.html","_blank");}}>{React.createElement("svg",{width:14,height:14,viewBox:"0 0 32 32",fill:"none",stroke:darkMode?"#ccc":"#555",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("line",{x1:3,y1:16,x2:15,y2:16}),React.createElement("path",{d:"M21.8,13c-0.6-5.7-3-10-5.8-10c-3.3,0-6,5.8-6,13s2.7,13,6,13"}),React.createElement("path",{d:"M28.9,17c0-0.3,0.1-0.7,0.1-1c0-7.2-5.8-13-13-13S3,8.8,3,16s5.8,13,13,13c1,0,2-0.1,3-0.4"}),React.createElement("path",{d:"M24.5,17.5c1.9,1.9,1.9,5.1,0,7c-0.5,0.5-1,0.8-1.6,1.1c-1.8,0.7-3.9,0.4-5.4-1.1c-1.9-1.9-1.9-5.1,0-7S22.6,15.6,24.5,17.5z"}),React.createElement("path",{d:"M25.5,23l3.9,3.6c0.8,0.8,0.8,2,0,2.8c-0.8,0.8-2,0.8-2.8,0l-3.5-3.5"}))}</TBB>
        <TBB t="Save (Ctrl+S)" c={handleSave}>{_ico("save")}</TBB>
        <TBB t="Share" c={function(){shareTab();}}>{_ico("share")}</TBB>
        <div style={{width:1,height:16,background:"var(--border-subtle,#e4e8f0)",margin:"0 4px"}} />
        {!isMobile && <TBB t="Play Track (Space)" c={function(){playAllRef.current=false;setPlayAll(false);doPlay(false);}} a={playing&&!playAll}>{"\u25B6"}</TBB>}
        {!isMobile && <TBB t="Play All (Ctrl+Space)" c={function(){playAllRef.current=true;setPlayAll(true);doPlay(true);}} a={playing&&playAll}>{_playAllIco(darkMode?"#ccc":"#333")}</TBB>}
        {!isMobile && <TBB t="Stop" c={function(){if(!playing){_setCurRaw({measure:0,beat:0,string:curRef.current.string});if(sRef.current)sRef.current.scrollLeft=0;}else{stopPlay();}}}>{_stopIco(darkMode?"#ccc":"#333")}</TBB>}
        {!isMobile && <TBB t={rewindAfterStop?"Rewind After Stop (ON)":"Rewind After Stop (OFF)"} c={function(){setRewindAfterStop(!rewindAfterStop);setStatus(rewindAfterStop?"Rewind after stop OFF":"Rewind after stop ON");}} a={rewindAfterStop}>{_rewindIco(darkMode?"#ccc":"#333")}</TBB>}
        {!isMobile && <div style={{width:1,height:16,background:"var(--border-subtle,#e4e8f0)",margin:"0 4px"}} />}
        <TBB t="Metronome" c={function(){setMetro(!metro);}} a={metro}>{_ico("metro")}</TBB>
        <TBB t={darkMode?"Light Mode":"Dark Mode"} c={function(){toggleDarkMode();}}>{darkMode?_ico("sun"):_ico("moon")}</TBB>
        {!isMobile && <TBB t={"Search Commands (Ctrl+K)"} c={function(){setCmdPalOpen(true);}}>{React.createElement("svg",{width:14,height:14,viewBox:"0 0 16 16",fill:"none",stroke:darkMode?"#ccc":"#555",strokeWidth:1.8,strokeLinecap:"round"},React.createElement("circle",{cx:6.5,cy:6.5,r:4.5}),React.createElement("line",{x1:10,y1:10,x2:14,y2:14}))}</TBB>}
        <div style={{width:1,height:16,background:"var(--border-subtle,#e4e8f0)",margin:"0 4px"}} />
        {editingTempo ? <input type="number" min={30} max={500} autoFocus value={tempoVal}
              style={{width:isMobile?48:60,height:isMobile?24:20,fontSize:isMobile?12:11,padding:"0 4px",textAlign:"center"}}
              onChange={function(e){setTempoVal(e.target.value);}}
              onBlur={function(){var v=parseInt(tempoVal);if(!isNaN(v)&&v>=30&&v<=500)setSong(Object.assign({},song,{tempo:v}));setEditingTempo(false);}}
              onKeyDown={function(e){if(e.key==="Enter"){e.target.blur();}if(e.key==="Escape"){setEditingTempo(false);}}} />
          : <div style={{display:"flex",alignItems:"center",gap:3,cursor:"pointer",padding:isMobile?"3px 8px":"2px 6px",borderRadius:6,fontSize:isMobile?12:11,transition:"background 0.15s",fontWeight:"600"}}
            onClick={function(){setTempoVal(String(song.tempo));setEditingTempo(true);}}
            onMouseEnter={function(e){e.currentTarget.style.background="var(--surface-3,#e4e8f0)";}}
            onMouseLeave={function(e){e.currentTarget.style.background="";}}
            title="Click to edit tempo">
            <span style={{fontSize:isMobile?9:8,opacity:0.4,fontWeight:"500"}}>{"BPM"}</span>
            <span>{song.tempo}</span>
          </div>}
        {!(isMobile && betaKb) && <React.Fragment>
        <div style={{width:1,height:16,background:"var(--border-subtle,#e4e8f0)",margin:"0 4px"}} />
        <span style={{fontSize:isMobile?11:10,padding:"0 2px"}}>{"Track:"}</span>
        <select value={ati} style={{fontSize:isMobile?12:10,height:isMobile?28:22,maxWidth:isMobile?150:220,padding:"0 4px"}}
          onChange={function(ev){var v2=Number(ev.target.value);atiRef.current=v2;setAti(v2);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,song.tracks[v2].numStrings-1)});
            // Scroll canvas vertically to show selected track
            setTimeout(function(){var el=stickyRefs.current[v2+1];if(el&&sRef.current){var containerRect=sRef.current.getBoundingClientRect();var elRect=el.getBoundingClientRect();if(elRect.top<containerRect.top||elRect.bottom>containerRect.bottom){sRef.current.scrollTop+=elRect.top-containerRect.top-20;}}},0);}}>
          {song.tracks.map(function(tr,idx){ return (
            <option key={idx} value={idx}>{String(idx+1)+": "+tr.name+" ("+(tr.isDrum?(DRUM_KITS[tr.instrument]?DRUM_KITS[tr.instrument].name:"Drums"):(GM[tr.instrument]||"?"))+")"}</option>
          );})}
        </select>
        </React.Fragment>}
        {isMobile && <div style={{position:"sticky",right:0,width:24,height:"100%",background:"linear-gradient(to right, transparent, "+TH.tbBg+")",pointerEvents:"none",flexShrink:0,marginLeft:-24}} />}
      </div>

      {/* Update available banner */}
      {updateBanner && updateBanner.shareId === (song && song.shareId) ? <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",background:"var(--accent-soft,rgba(50,100,220,0.08))",borderBottom:"1px solid var(--border-subtle,#e4e8f0)",fontSize:11,borderRadius:0,flexShrink:0}}>
        <span>{"A newer version (v"+updateBanner.serverVer+") is available."}</span>
        <span style={{display:"flex",gap:8}}>
          <span style={{cursor:"pointer",opacity:0.6,textDecoration:"underline"}} onClick={function(){setUpdateBanner(null);}}>{"Dismiss"}</span>
          <span style={{cursor:"pointer",fontWeight:"600",color:"var(--accent,#3264dc)",textDecoration:"underline"}} onClick={function(){loadSharedTab(updateBanner.shareId);setUpdateBanner(null);}}>{"Load Latest"}</span>
        </span>
      </div> : null}

      {/* Document tab bar */}
      {docs.current.length > 0 ? <div ref={_tabBarRef} style={{display:"flex",background:TH.hdr,borderBottom:"1px solid var(--border-subtle,"+TH.hdrB+")",flexShrink:0,overflowX:"auto",overflowY:"hidden",minHeight:isMobile?32:26,gap:1,padding:"0 2px",alignItems:"flex-end"}}>
        {docs.current.map(function(doc,di){
          var isActive = di === activeDocIdx;
          var docTitle = doc.title || (doc.song && doc.song.title) || "New";
          if (docTitle.length > 20) docTitle = docTitle.substring(0,18) + "\u2026";
          return <div key={di} style={{display:"flex",alignItems:"center",padding:isMobile?"6px 12px":"3px 12px",fontSize:isMobile?12:11,cursor:"pointer",background:isActive?TH.canvas:"transparent",borderRadius:isActive?"8px 8px 0 0":"8px 8px 0 0",color:isActive?TH.text:TH.stT,fontWeight:isActive?"600":"400",whiteSpace:"nowrap",maxWidth:isMobile?200:180,transition:"background 0.15s",WebkitTapHighlightColor:"transparent"}}
            onClick={function(){if(isActive){setEditTitleVal(song.title||"");setEditArtistVal(song.artist||"");setEditingTitle(true);}else{switchDoc(di);}}}>            <span>{(doc.dirty?"\u25CF ":"")+docTitle}</span>
            <span style={{marginLeft:8,fontSize:isMobile?12:10,opacity:0.4,lineHeight:"1",width:isMobile?22:16,height:isMobile?22:16,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",transition:"all 0.15s",WebkitTapHighlightColor:"transparent"}}
              onMouseEnter={function(e){e.currentTarget.style.opacity="1";e.currentTarget.style.background="var(--surface-3,#e4e8f0)";}}
              onMouseLeave={function(e){e.currentTarget.style.opacity="0.4";e.currentTarget.style.background="transparent";}}
              onClick={function(e2){e2.stopPropagation();closeDoc(di);}}>{"\u00D7"}</span>
          </div>;
        })}
        <div style={{padding:isMobile?"6px 12px":"3px 10px",cursor:"pointer",fontSize:isMobile?15:12,color:TH.stT,display:"flex",alignItems:"center",opacity:0.5,transition:"opacity 0.15s",WebkitTapHighlightColor:"transparent"}}
          onMouseEnter={function(e){e.currentTarget.style.opacity="1";}}
          onMouseLeave={function(e){e.currentTarget.style.opacity="0.5";}}
          onClick={function(){newDoc();}} title="New tab">{"+"}</div>
      </div> : null}

      {/* Inline title edit row */}
      {editingTitle && <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"nowrap",padding:isMobile?"6px 12px":"4px 12px",background:TH.canvas,borderBottom:"1px solid var(--border-subtle,"+TH.hdrB+")",flexShrink:0,overflow:"hidden"}}>
        <input type="text" autoFocus value={editTitleVal} placeholder="Title"
          style={{fontWeight:"600",fontSize:isMobile?13:12,border:"none",borderBottom:"2px solid var(--accent,#3264dc)",background:"transparent",color:TH.text,padding:"2px 4px",outline:"none",width:isMobile?100:140,letterSpacing:"-0.01em",flexShrink:1,minWidth:60}}
          onClick={function(e){e.stopPropagation();}}
          onChange={function(e){setEditTitleVal(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter"){var s9=Object.assign({},song);s9.title=editTitleVal.trim()||"Untitled";s9.artist=editArtistVal.trim();docs.current[activeDocIdx].title=s9.title;setSong(s9);setEditingTitle(false);}if(e.key==="Escape"){setEditingTitle(false);}}} />
        <span style={{opacity:0.3,fontSize:11}}>{"\u2014"}</span>
        <input type="text" value={editArtistVal} placeholder="Artist"
          style={{fontWeight:"400",fontSize:isMobile?12:11,border:"none",borderBottom:"2px solid var(--border-default,#c0c8d8)",background:"transparent",color:TH.text,padding:"2px 4px",outline:"none",width:isMobile?80:110,flexShrink:1,minWidth:50}}
          onClick={function(e){e.stopPropagation();}}
          onChange={function(e){setEditArtistVal(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter"){var s9=Object.assign({},song);s9.title=editTitleVal.trim()||"Untitled";s9.artist=editArtistVal.trim();docs.current[activeDocIdx].title=s9.title;setSong(s9);setEditingTitle(false);}if(e.key==="Escape"){setEditingTitle(false);}}} />
        <span style={{fontSize:isMobile?11:10,color:"var(--accent,#3264dc)",cursor:"pointer",padding:"2px 8px",borderRadius:4,background:"var(--accent-soft,rgba(50,100,220,0.08))",flexShrink:0}}
          onClick={function(){var s9=Object.assign({},song);s9.title=editTitleVal.trim()||"Untitled";s9.artist=editArtistVal.trim();docs.current[activeDocIdx].title=s9.title;setSong(s9);setEditingTitle(false);}}>{"Done"}</span>
        <span style={{fontSize:isMobile?11:10,color:"var(--text-secondary,#5a6070)",cursor:"pointer",padding:"2px 6px",borderRadius:4,opacity:0.7,flexShrink:0}}
          onClick={function(){var s9=Object.assign({},song);s9.title=editTitleVal.trim()||"Untitled";s9.artist=editArtistVal.trim();docs.current[activeDocIdx].title=s9.title;setSong(s9);setEditingTitle(false);openDlg("title",{title:s9.title,artist:s9.artist,album:s9.album||"",transcribedBy:s9.transcribedBy||"",copyright:s9.copyright||""});}}>{"More\u2026"}</span>
      </div>}

      {/* Zoomable content area */}
      <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,zoom:zoom!==100?(zoom/100):undefined,position:"relative"}}>
      {showZoomBadge && <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",color:"#fff",padding:"4px 10px",borderRadius:12,fontSize:11,fontWeight:"600",zIndex:20,pointerEvents:"none",transition:"opacity 0.3s"}}>{zoom+"%"}</div>}
      {/* Section markers */}
      <SectionStrip song={song} scrollX={scrollX} viewW={viewW} measWidths={measWidths} th={TH} darkMode={darkMode} isMobile={isMobile} sel={sel} zoom={zoom} cur={cur} playing={playing}
        onArrangement={function(){openDlg("editSections",{sections:JSON.parse(JSON.stringify(song.sections||[]))});}}
        onClickSection={function(idx){
          var sec = (song.sections||[])[idx];
          if (sec) { setCur({measure: sec.bar, beat: 0, string: cur.string}); scrollToMeasure(sec.bar); }
        }}
        onAdd={function(bar, bars){
          var sb4=bar, sbc4=bars||4;
          if(sel){sb4=Math.min(sel.startMeasure,sel.endMeasure);sbc4=Math.abs(sel.endMeasure-sel.startMeasure)+1;}
          openDlg("section",{mode:"add",name:"",color:SECTION_COLORS[((song.sections||[]).length)%SECTION_COLORS.length].color,bar:sb4,bars:sbc4});
        }}
        onRemove={function(idx){
          var sec=(song.sections||[])[idx];
          var s9=JSON.parse(JSON.stringify(song));
          s9.sections.splice(idx,1);
          setSong(s9);setStatus("Removed \""+((sec&&sec.name)||"section")+"\" marker (bars kept)");
        }}
        onEditSection={function(idx){
          var sec=(song.sections||[])[idx];
          if(sec)openDlg("section",{mode:"edit",editIdx:idx,name:sec.name,color:sec.color,bar:sec.bar,bars:sec.bars||1});
        }}
        onDelete={function(idx){
          var sec=(song.sections||[])[idx];if(!sec)return;
          var bc=sec.bars||1;
          if(!confirm("Delete \""+sec.name+"\" and its "+bc+" bar(s)? Notes will be lost."))return;
          var s9=JSON.parse(JSON.stringify(song));
          if(s9.tracks[0].measures.length-bc<1){setStatus("Cannot delete all bars");return;}
          for(var ti9=0;ti9<s9.tracks.length;ti9++){s9.tracks[ti9].measures.splice(sec.bar,bc);}
          s9.sections.splice(idx,1);
          for(var si9=0;si9<s9.sections.length;si9++){if(s9.sections[si9].bar>=sec.bar)s9.sections[si9].bar=Math.max(0,s9.sections[si9].bar-bc);}
          setSong(s9);setStatus("Deleted \""+sec.name+"\" ("+bc+" bars)");
        }}
      />
      {/* Beat ruler */}
      <BeatRuler song={song} ati={ati} cur={cur} scrollX={scrollX} viewW={viewW} measWidths={measWidths} th={TH} zoom={zoom} loopA={loopA} loopB={loopB} setCur={function(c){_setCurRaw(c);if(playing)seekRef.current={measure:c.measure,beat:c.beat};}} />

      {/* Track display */}
      <div ref={sRef} style={{flex:1,minHeight:0,overflow:"auto",background:TH.canvas,WebkitOverflowScrolling:"touch",position:"relative"}}
        onContextMenu={function(e){e.preventDefault();var el=e.target;while(el&&el!==sRef.current){var ti=el.getAttribute&&el.getAttribute("data-trackidx");if(ti!==null){atiRef.current=+ti;setAti(+ti);break;}el=el.parentNode;}setCtxMenuData({x:e.clientX,y:e.clientY});}}
        onTouchStart={function(e){if(!isMobile||e.touches.length>=2)return;var touch=e.touches[0];var el2=e.target;var foundTi=null;while(el2&&el2!==sRef.current){var ti2=el2.getAttribute&&el2.getAttribute("data-trackidx");if(ti2!==null){foundTi=+ti2;break;}el2=el2.parentNode;}var t9=setTimeout(function(){if(foundTi!=null){atiRef.current=foundTi;setAti(foundTi);}setCtxMenuData({x:touch.clientX,y:touch.clientY});},600);sRef.current._lpTimer=t9;}}
        onTouchEnd={function(){if(sRef.current&&sRef.current._lpTimer){clearTimeout(sRef.current._lpTimer);sRef.current._lpTimer=null;}}}
        onTouchMove={function(){if(sRef.current&&sRef.current._lpTimer){clearTimeout(sRef.current._lpTimer);sRef.current._lpTimer=null;}}}
        onScroll={function(e){
          var sx = e.target.scrollLeft;
          // Directly update sticky elements synchronously to prevent stutter
          for (var si = 0; si < stickyRefs.current.length; si++) {
            var el = stickyRefs.current[si];
            if (el) el.style.transform = "translateX(" + sx + "px)";
          }
          setScrollX(sx);
          if(Math.abs(viewW-e.target.clientWidth)>10)setViewW(e.target.clientWidth);
        }}
        onMouseMove={function(e){
          if(e.buttons!==1||!_dragState.current||!_dragState.current.active)return;
          var ds=_dragState.current;
          // Auto-scroll horizontal
          if(sRef.current){var r=sRef.current.getBoundingClientRect();var dx=e.clientX-r.left;var dy=e.clientY-r.top;
            if(dx<30)sRef.current.scrollLeft-=20;else if(dx>r.width-30)sRef.current.scrollLeft+=20;
            if(dy<30)sRef.current.scrollTop-=20;else if(dy>r.height-30)sRef.current.scrollTop+=20;
          }
          // Detect track from Y
          var hoverTrack=clientYToTrack(e.clientX,e.clientY);
          if(hoverTrack==null)hoverTrack=ds.originTrack;
          // Detect beat from X
          var mb=clientXToMB(e.clientX);
          if(!mb)return;
          // Build selection
          var newSel={startMeasure:ds.originMeasure,startBeat:ds.originBeat,endMeasure:mb.measure,endBeat:mb.beat};
          if(hoverTrack!==ds.originTrack){newSel.startTrack=Math.min(ds.originTrack,hoverTrack);newSel.endTrack=Math.max(ds.originTrack,hoverTrack);}
          setSel(newSel);
          _globalDidDrag.current=true;
          // Move cursor to drag end
          var curTrack=hoverTrack;if(curTrack!==ati){atiRef.current=curTrack;setAti(curTrack);}
          setCur({measure:mb.measure,beat:mb.beat,string:cur.string});
        }}
        onMouseUp={function(){_dragState.current=null;}}>
        {song.tracks.map(function(tr,idx){
          var iName = tr.isDrum ? (DRUM_KITS[tr.instrument] ? DRUM_KITS[tr.instrument].name : "Standard Kit") : ((tr.bank && tr.bank !== 0) ? getSF2PresetName(tr.bank, tr.instrument) : (GM[tr.instrument] || "?"));
          if (tr.bank && tr.bank !== 0) iName = "[B"+tr.bank+"] "+iName;
          var _presetMissing = _sf2State === "done" && !sf2HasPreset(tr.bank || 0, tr.instrument);
          if (idx === 0) stickyRefs.current.length = song.tracks.length + 1; // keep array sized
          var anySolo = song.tracks.some(function(t9){return t9.solo;});
          var isDimmed = tr.muted || (anySolo && !tr.solo);
          return (
            <div key={activeDocIdx+"-"+idx} data-trackidx={idx}>
              <div ref={function(el){stickyRefs.current[idx+1]=el;}} style={{display:"flex",alignItems:"center",gap:6,padding:isMobile?"5px 8px":"3px 8px",background:idx===ati?TH.tAct:TH.tIn,color:TH.trackText||undefined,cursor:"pointer",fontSize:isMobile?11:10,borderTop:"1px solid var(--border-subtle,"+(TH.hdrB||"#ccc")+")",borderLeft:(appearance.showTrackStripe!==false?"3px solid "+(TRACK_COLORS[idx%TRACK_COLORS.length]):"3px solid transparent"),boxShadow:(idx===ati && (appearance.colTrackHdr || TH.tAct===TH.tIn))?"inset 0 0 0 1px "+(TH.mAct||"#3264dc"):undefined,zIndex:3,width:viewW||"100vw",boxSizing:"border-box",transform:"translateX("+scrollX+"px)",willChange:"transform",transition:"background 0.15s"}}
                onClick={function(ev){
                  if(ev.shiftKey&&sel){
                    // Extend track range to include this track
                    var curST=sel.startTrack!=null?sel.startTrack:ati;
                    var curET=sel.endTrack!=null?sel.endTrack:ati;
                    var newST=Math.min(curST,idx);
                    var newET=Math.max(curET,idx);
                    setSel(Object.assign({},sel,{startTrack:newST,endTrack:newET}));
                  } else if(ev.shiftKey&&!sel) {
                    // Start new multi-track selection using cursor position
                    var st2=Math.min(ati,idx),et2=Math.max(ati,idx);
                    var t7=song.tracks[ati];var lastB2=t7.measures[t7.measures.length-1]?t7.measures[t7.measures.length-1].beats.length-1:0;
                    setSel({startMeasure:0,startBeat:0,endMeasure:t7.measures.length-1,endBeat:lastB2,startTrack:st2,endTrack:et2});
                  }
                  atiRef.current=idx;setAti(idx);setCur({measure:cur.measure,beat:cur.beat,string:Math.min(cur.string,tr.numStrings-1)});
                }}>
                <span style={{display:"flex",alignItems:"center",gap:4,flex:1,minWidth:0,opacity:isDimmed?0.4:1}}>
                {editingTrackIdx===idx ? <input type="text" autoFocus value={editTrackVal}
                  style={{fontWeight:"600",fontSize:isMobile?11:10,border:"none",borderBottom:"2px solid var(--accent,#3264dc)",background:"transparent",color:"inherit",padding:"0 2px",outline:"none",width:isMobile?120:100}}
                  onClick={function(e){e.stopPropagation();}}
                  onChange={function(e){setEditTrackVal(e.target.value);}}
                  onBlur={function(){if(editTrackVal.trim()){var s9=JSON.parse(JSON.stringify(song));s9.tracks[idx].name=editTrackVal.trim();setSong(s9);}setEditingTrackIdx(-1);}}
                  onKeyDown={function(e){if(e.key==="Enter"){e.target.blur();}if(e.key==="Escape"){setEditingTrackIdx(-1);}}} />
                : <b style={{cursor:idx===ati?"text":"pointer"}}
                    onClick={function(e){if(idx===ati&&isMobile){e.stopPropagation();setEditTrackVal(tr.name);setEditingTrackIdx(idx);}}}
                    onDoubleClick={function(e){if(!isMobile){e.stopPropagation();setEditTrackVal(tr.name);setEditingTrackIdx(idx);}}}>{(appearance.showTrackIcons!==false?(tr.isDrum?"\uD83E\uDD41 ":"\uD83C\uDFB8 "):"")+tr.name}</b>}
                <span style={{color:TH.dim||"#888",fontSize:isMobile?10:10,cursor:"pointer"}}
                  onClick={function(ev){ev.stopPropagation();if(!tr.isDrum){atiRef.current=idx;setAti(idx);var rect=ev.currentTarget.getBoundingClientRect();_instPickPos.current={x:rect.left,y:rect.bottom+2};setInstPickTrack(instPickTrack===idx?-1:idx);}}}>{iName}
                </span>
                {_presetMissing ? <span title="This bank/instrument is not available in the loaded SoundFont. Track will be silent." style={{color:"#e0a000",fontSize:isMobile?12:11,cursor:"pointer"}} onClick={function(ev){ev.stopPropagation();atiRef.current=idx;setAti(idx);var tp5=song.tracks[idx];openDlg("trackProps",trackPropsData(tp5,"playback"));}}>{"\u26A0"}</span> : null}
                {!isMobile && <span style={{color:"#888"}}>{"CH"+String(tr.midiChannel)}</span>}
                {tr.transpose ? <span style={{color:"#c60",fontSize:isMobile?10:10}}>{"Transpose "+(tr.transpose>0?"+":"")+tr.transpose}</span> : null}
                </span>
                <span style={{display:"flex",gap:3}}>
                  <span style={{padding:isMobile?"2px 8px":"2px 8px",fontSize:isMobile?10:9,fontWeight:"600",borderRadius:5,background:tr.solo?"#fbbc04":"transparent",color:tr.solo?(darkMode?"#000":"#000"):"var(--text-muted,#999)",border:"1px solid "+(tr.solo?"#fbbc04":"var(--border-subtle,#e4e8f0)"),cursor:"pointer",lineHeight:isMobile?"16px":"14px",transition:"background 0.15s, color 0.15s",letterSpacing:"0.02em"}}
                    onClick={function(e3){e3.stopPropagation();atiRef.current=idx;setAti(idx);var s9=JSON.parse(JSON.stringify(song));s9.tracks[idx].solo=!s9.tracks[idx].solo;songRef.current=s9;setSong(s9);
                      var anySolo4=s9.tracks.some(function(t9){return t9.solo;});
                      for(var ki2=0;ki2<s9.tracks.length;ki2++){var kt2=s9.tracks[ki2];if(kt2.muted||(anySolo4&&!kt2.solo)){synthKillChannel(kt2.midiChannel);}}
                    }}>{"Solo"}</span>
                  <span style={{padding:isMobile?"2px 8px":"2px 8px",fontSize:isMobile?10:9,fontWeight:"600",borderRadius:5,background:tr.muted?"#ea4335":"transparent",color:tr.muted?"#fff":"var(--text-muted,#999)",border:"1px solid "+(tr.muted?"#ea4335":"var(--border-subtle,#e4e8f0)"),cursor:"pointer",lineHeight:isMobile?"16px":"14px",transition:"background 0.15s, color 0.15s",letterSpacing:"0.02em"}}
                    onClick={function(e3){e3.stopPropagation();atiRef.current=idx;setAti(idx);var s9=JSON.parse(JSON.stringify(song));s9.tracks[idx].muted=!s9.tracks[idx].muted;songRef.current=s9;setSong(s9);
                      var anySolo4=s9.tracks.some(function(t9){return t9.solo;});
                      for(var ki2=0;ki2<s9.tracks.length;ki2++){var kt2=s9.tracks[ki2];if(kt2.muted||(anySolo4&&!kt2.solo)){synthKillChannel(kt2.midiChannel);}}
                    }}>{"Mute"}</span>
                </span>
              </div>
              <div style={Object.assign({position:"relative"},isDimmed?{opacity:0.4}:{})}>
              <TrackRow track={tr} ti={idx} activeTi={ati} cursor={cur}
                setCursor={idx===ati?function(c2){setCur(c2);if(playing)seekRef.current={measure:c2.measure,beat:c2.beat};}:function(c2){atiRef.current=idx;setAti(idx);setCur(c2);if(playing)seekRef.current={measure:c2.measure,beat:c2.beat};}}
                playing={playing} playPos={playPos} scrollX={scrollX} viewW={viewW} measWidths={measWidths} th={TH} sel={sel} setSel={setSel} zoom={zoom} appearance={notationAppearance} onCursorRect={(idx===ati && !isMobile && appearance.showNoteChip!==false && !playing)?function(r){setNoteChipRect(function(prev){if(r===null)return prev===null?prev:null;if(prev&&prev.x===r.x&&prev.y===r.y&&prev.string===r.string)return prev;return r;});}:null} onDragStart={function(trkIdx,m,b){_dragState.current={originTrack:trkIdx,originMeasure:m,originBeat:b,active:true};_globalDidDrag.current=false;}} globalDidDrag={_globalDidDrag} selectModeRef={_selectModeRef} selOriginTrack={_selOriginTrack} />
              {idx===ati && !isMobile && appearance.showNoteChip!==false && !playing && noteChipRect ? (function(){
                var cs = cur.string;
                if (cs === tr.numStrings || cs === -1) return null; // text rows: no chip
                var beat = tr.measures[cur.measure] && tr.measures[cur.measure].beats[cur.beat];
                var note = beat && beat.notes[cs];
                var label = "";
                if (note && note.attack && !note.muted && !note.stop && note.fret >= 0) {
                  if (tr.isDrum) { var dn = (tr.tuning[cs]||0) + note.fret; label = (PERC_FULL[dn] || PERC[dn] || ("Drum "+dn)); }
                  else { var midi = (tr.tuning[cs]||40) + note.fret + (tr.capo||0) + (tr.transpose||0); label = midiName(midi).replace(/-?\d+$/, ""); }
                }
                if (!label) return null;
                return <div style={{position:"absolute",left:noteChipRect.x,top:noteChipRect.y-22,transform:"translateX(-50%)",zIndex:15,pointerEvents:"none",background:TH.curB||"#2060d0",color:"#fff",fontSize:10,fontWeight:"700",padding:"2px 7px",borderRadius:10,whiteSpace:"nowrap",boxShadow:"0 2px 6px rgba(0,0,0,0.25)",letterSpacing:"0.02em",fontFamily:"system-ui,-apple-system,sans-serif"}}>{label}</div>;
              })() : null}
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* end zoom wrapper */}
      {dlg==="findReplace" && frScratch && isMobile ? <div style={{flexShrink:0,height:(186+5*36+4*3+28)+"px"}} /> : null}
      {dlg==="findReplace" && frScratch && !isMobile ? <div style={{flexShrink:0,height:260}} /> : null}

      {/* Find & Replace docked panel — in-flow sibling so the canvas above shrinks (no overlap) */}
      {dlg==="findReplace" && frScratch ? (function(){
        var mwArr = [BPM];
        function renderStaff(idx){
          var isActive = frActive===idx;
          var scrollKey = idx===0 ? "find" : "rep";
          var sx = (frScrollX && frScrollX[scrollKey]) || 0;
          return <div onClick={function(){if(frActive!==idx)setFrActive(idx);}}
            style={{border:"2px solid "+(isActive?"var(--accent,#3264dc)":"transparent"),borderRadius:6,marginBottom:6,background:TH.bg2||TH.bg,cursor:isActive?"default":"pointer",overflow:"hidden"}}>
            <div style={{fontSize:10,fontWeight:"600",padding:"3px 8px",background:isActive?"var(--accent,#3264dc)":(darkMode?"#2a2a3a":"#e8ecf4"),color:isActive?"#fff":TH.text}}>{idx===0?"Find":"Replace"}{isActive?"  \u2022 editing":""}</div>
            <div style={{overflowX:"auto"}} onScroll={function(e){var nx=e.target.scrollLeft;setFrScrollX(function(prev){var o=Object.assign({},prev||{});o[scrollKey]=nx;return o;});}}>
              <TrackRow track={frScratch.tracks[idx]} ti={idx} activeTi={frActive}
                cursor={isActive?frCur:null} setCursor={function(c){setFrActive(idx);setFrCur(c);}}
                playing={false} playPos={-1} scrollX={sx} viewW={600} measWidths={mwArr} th={TH} zoom={100} appearance={notationAppearance}
                sel={null} setSel={function(){}} />
            </div>
          </div>;
        }
        var KBH = 5*36+4*3+28; // keyboard height
        return <div style={isMobile?{position:"fixed",left:0,right:0,bottom:KBH,zIndex:60,height:186,display:"flex",flexDirection:"column",background:TH.bg,borderTop:"2px solid var(--accent,#3264dc)",boxShadow:"0 -4px 16px rgba(0,0,0,0.3)"}:{position:"fixed",left:0,right:0,bottom:0,height:"auto",maxHeight:"50vh",zIndex:60,display:"flex",flexDirection:"column",background:TH.bg,borderTop:"2px solid var(--accent,#3264dc)",boxShadow:"0 -8px 30px rgba(0,0,0,0.4)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px",borderBottom:"1px solid var(--border-subtle,#333)",flexShrink:0}}>
            <span style={{fontSize:13,fontWeight:"700"}}>{"Find & Replace"}</span>
            <span onClick={frCloseEditor} style={{cursor:"pointer",fontSize:18,opacity:0.6,padding:"0 8px"}}>{"\u00D7"}</span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"8px 14px",minHeight:0,width:"100%",maxWidth:isMobile?"none":1100,margin:"0 auto"}}>
            {isMobile ? <div>{renderStaff(0)}{renderStaff(1)}</div> : <div style={{display:"flex",gap:10}}><div style={{flex:1,minWidth:0}}>{renderStaff(0)}</div><div style={{flex:1,minWidth:0}}>{renderStaff(1)}</div></div>}
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6,flexWrap:"wrap",fontSize:11}}>
              <span>{"Scope:"}</span>
              <select value={frScope} onChange={function(e){setFrScope(e.target.value);setFrMatches(null);}} style={{fontSize:11}}>
                <option value="track">{"Current track"}</option>
                {sel ? <option value="selection">{"Selection"}</option> : null}
                <option value="alltracks">{"All tracks"}</option>
              </select>
              {frMatches!==null ? <span style={{fontSize:11}}>
                {frMatches.length===0?"No matches":(frCurMatch+1)+" / "+frMatches.length}
                {frMatches.length>0 ? <span>
                  <span onClick={function(){var ni=(frCurMatch-1+frMatches.length)%frMatches.length;setFrCurMatch(ni);frGotoMatch(frMatches[ni]);}} style={{cursor:"pointer",padding:"0 8px",fontSize:16}}>{"\u2039"}</span>
                  <span onClick={function(){var ni=(frCurMatch+1)%frMatches.length;setFrCurMatch(ni);frGotoMatch(frMatches[ni]);}} style={{cursor:"pointer",padding:"0 8px",fontSize:16}}>{"\u203A"}</span>
                </span> : null}
              </span> : null}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3,marginTop:6,fontSize:10,opacity:0.85}}>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                <input type="checkbox" checked={frReplaceWhole} onChange={function(e){setFrReplaceWhole(e.target.checked);}} />
                <span>{"Overwrite entire matched beats"}</span>
              </label>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                <input type="checkbox" checked={frStrict} onChange={function(e){setFrStrict(e.target.checked);setFrMatches(null);}} />
                <span>{"Strict match (blank string = silent)"}</span>
              </label>
            </div>
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              <DlgBtn o={frRunFind}>{"Find"}</DlgBtn>
              <DlgBtn primary o={frDoReplaceAll}>{"Replace All"}</DlgBtn>
              <DlgBtn o={frCloseEditor}>{"Close"}</DlgBtn>
            </div>
            {!isMobile ? <div style={{fontSize:9,opacity:0.4,marginTop:6}}>{"Keys: 0-9 fret, X muted, Backspace clear, arrows move, Tab switch staff."}</div> : null}
          </div>
        </div>;
      })() : null}
      {/* FR scratch keyboard (mobile) — fixed at viewport bottom */}
      {dlg==="findReplace" && frScratch && isMobile ? <MobileKeyboardBeta song={frScratch} ati={frActive} cur={frCur} track={frScratch.tracks[frActive]}
        setCur={function(c){setFrCur(c);}} setAti={setFrActive} atiRef={{current:frActive}} setSong={setFrScratch} undoLabel={_undoLabel}
        placeNote={frPlaceNote} placeMuted={frPlaceMutedNote} placeStop={function(){}}
        clearBeat={frClearScratchBeat} toggleEffect={function(){}} doPlay={function(){}}
        stopPlay={function(){}} playing={false} openDlg={function(){}} sRef={{current:null}}
        buildEfxData={function(){return {};}} doUndo={function(){}} th={TH}
        sel={null} setSel={function(){}} clipboard={{current:null}} normSel={normSel}
        setStatus={setStatus} cutBeat={function(){}}
        kbVisible={true} onToggleKb={function(){}}
        scrollToMeasure={function(){}} selOriginTrack={{current:0}} selectModeRef={{current:false}} /> : null}

      {/* Toast notification */}
      {toast && <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"var(--surface-0,#fff)",color:TH.text,padding:"28px 32px",borderRadius:16,boxShadow:"var(--shadow-lg, 0 12px 40px rgba(0,0,0,.2))",zIndex:999,textAlign:"center",maxWidth:isMobile?"85vw":360,border:"1px solid var(--border-subtle,#e4e8f0)",backdropFilter:"blur(8px)"}}
        onClick={function(){setToast(null);}}>
        <div style={{fontSize:32,marginBottom:10}}>{toast.icon||"\u2705"}</div>
        <div style={{fontSize:15,fontWeight:"600",marginBottom:toast.detail?8:0,lineHeight:"1.4",letterSpacing:"-0.01em"}}>{toast.title}</div>
        {toast.detail&&<div style={{fontSize:11,color:"var(--text-secondary,#888)",fontFamily:"SF Mono,Consolas,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%",marginTop:4}}>{toast.detail}</div>}
      </div>}

      {/* Status bar */}
      <div style={{height:isMobile?26:28,background:TH.stBg,borderTop:"1px solid var(--border-subtle,"+TH.tbB+")",display:"flex",alignItems:"center",padding:"0 12px",fontSize:isMobile?10:11,flexShrink:0,color:TH.stT,gap:isMobile?4:8}}>
        <div style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",opacity:0.8}}>{status}</div>
        {(practiceSpeed !== 100 || (loopA && loopB)) && <div style={{whiteSpace:"nowrap",fontSize:isMobile?9:9,padding:"2px 6px",borderRadius:5,background:"rgba(48,160,80,0.12)",color:"#30a050",fontWeight:"600",cursor:"pointer"}}
          onClick={function(){openDlg("practice",{speed:practiceSpeed,autoInc:practiceAutoInc,incStep:practiceIncStep,targetSpeed:practiceTargetSpeed});}}>{practiceSpeed !== 100 ? practiceSpeed+"%" : ""}{practiceSpeed !== 100 && loopA && loopB ? " " : ""}{loopA && loopB ? React.createElement("svg",{width:12,height:12,viewBox:"0 0 24 24",fill:"#30a050",style:{verticalAlign:"middle",marginLeft:2}},React.createElement("path",{d:"M6 4h15a1 1 0 0 1 1 1v7h-2V6H6v3L1 5l5-4v3zm12 16H3a1 1 0 0 1-1-1v-7h2v6h14v-3l5 4-5 4v-3z"})) : ""}</div>}
        {song && song.sections && song.sections.length > 0 && (function(){
          var curSec = null;
          var secs = song.sections;
          for (var si2 = secs.length - 1; si2 >= 0; si2--) { if (cur.measure >= secs[si2].bar && cur.measure < secs[si2].bar + (secs[si2].bars||1)) { curSec = secs[si2]; break; } }
          return React.createElement("div", {style:{whiteSpace:"nowrap",cursor:"pointer",fontSize:isMobile?9:9,padding:"2px 6px",borderRadius:5,borderLeft:"3px solid "+(curSec?curSec.color:"transparent"),background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",color:TH.stT,transition:"background 0.15s"},
            onClick:function(e){
              openDlg("sectionNav",{});
            }}, (curSec?curSec.name:"—")+" \u25BC");
        })()}
        <a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" title="Buy me a coffee" style={{color:darkMode?"#e06080":"#d04060",textDecoration:"none",fontSize:isMobile?12:11,lineHeight:1,opacity:0.6,cursor:"pointer"}}>{"\u2764"}</a>
        <div style={{whiteSpace:"nowrap",opacity:0.5,fontSize:isMobile?10:10,fontFamily:"SF Mono,Consolas,monospace",letterSpacing:"-0.02em"}}>{"M"+(cur.measure+1)+" B"+(Math.floor(cur.beat/4)+1)+"."+(cur.beat%4+1)}</div>
        {!isMobile && <div style={{whiteSpace:"nowrap",opacity:0.5,fontSize:10,fontFamily:"SF Mono,Consolas,monospace"}}>{cur.string===track.numStrings?"Top Text":cur.string===-1?"Bot Text":"S"+(cur.string+1)}</div>}
        {sel && sel.startTrack != null && <div style={{whiteSpace:"nowrap",fontSize:isMobile?9:9,padding:"2px 6px",borderRadius:5,background:"var(--accent-soft,rgba(50,106,197,0.1))",color:"var(--accent,#3264dc)"}}>{(Math.abs(sel.endTrack-sel.startTrack)+1)+" tracks"}</div>}
        <div style={{whiteSpace:"nowrap",cursor:"pointer",fontSize:isMobile?10:9,padding:"2px 6px",borderRadius:5,background:autoScroll?"var(--accent-soft,rgba(50,100,220,0.1))":"transparent",border:"none",color:autoScroll?"var(--accent,#3264dc)":"var(--text-muted,#999)",fontWeight:autoScroll?"600":"400",transition:"all 0.15s"}} onClick={function(){setAutoScroll(!autoScroll);}} title={autoScroll?"Auto-scroll ON (click to disable)":"Auto-scroll OFF (click to enable)"}>{"Scroll"}</div>
        <div style={{display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap",borderLeft:"1px solid var(--border-subtle,#e4e8f0)",paddingLeft:8}}>
          <span style={{fontSize:isMobile?14:11,cursor:"pointer",opacity:0.5,transition:"opacity 0.15s"}} onClick={function(){setZoom(Math.max(50,zoom-10));}} title="Zoom out"
            onMouseEnter={function(e){e.currentTarget.style.opacity="1";}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.5";}}>{"\u2212"}</span>
          <span style={{fontSize:isMobile?10:9,minWidth:isMobile?32:28,textAlign:"center",cursor:"pointer",fontFamily:"SF Mono,Consolas,monospace"}} onClick={function(){setZoom(100);}} title="Reset zoom">{zoom+"%"}</span>
          <span style={{fontSize:isMobile?14:11,cursor:"pointer",opacity:0.5,transition:"opacity 0.15s"}} onClick={function(){setZoom(Math.min(200,zoom+10));}} title="Zoom in"
            onMouseEnter={function(e){e.currentTarget.style.opacity="1";}} onMouseLeave={function(e){e.currentTarget.style.opacity="0.5";}}>{"+"}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap",borderLeft:"1px solid var(--border-subtle,#e4e8f0)",paddingLeft:8}}>
          <span style={{fontSize:isMobile?12:10,opacity:0.5}}>{"Vol"}</span>
          <input type="range" min={0} max={100} value={masterVol} onChange={function(e){var v=+e.target.value;setMasterVol(v);if(_mg)_mg.gain.value=v/100;}} style={{width:isMobile?60:50,margin:0,height:14}} title={"Master volume: "+masterVol+"%"} />
        </div>
      </div>

      {/* Beta keyboard spacer - pushes status bar above fixed keyboard */}
      {isMobile && betaKb && kbVisible && dlg!=="findReplace" && <div style={{height:5*36+4*3+28,flexShrink:0}} />}

      {/* Mobile keyboard */}
      {isMobile && song && !betaKb && dlg!=="findReplace" && <MobileKeyboard song={song} ati={ati} cur={cur} track={track}
        setCur={function(c){_setCurRaw(c);}} setAti={setAti} atiRef={atiRef} setSong={setSong}
        placeNote={placeNote} placeMuted={placeMuted} placeStop={placeStop}
        clearBeat={clearBeat} toggleEffect={toggleEffect} doPlay={doPlay}
        stopPlay={stopPlay} playing={playing} openDlg={openDlg} sRef={sRef}
        buildEfxData={buildEfxData} doUndo={doUndo} th={TH}
        sel={sel} setSel={setSel} clipboard={clipboard} normSel={normSel}
        setStatus={setStatus} cutBeat={cutBeat}
        kbVisible={kbVisible} onToggleKb={function(){setKbVisible(!kbVisible);}}
        setCmdPalOpen={setCmdPalOpen} addTrackData={addTrackData} trackPropsData={trackPropsData}
        practiceSpeed={practiceSpeed} practiceAutoInc={practiceAutoInc} practiceIncStep={practiceIncStep} practiceTargetSpeed={practiceTargetSpeed}
        loopA={loopA} loopB={loopB} setLoopAValidated={setLoopAValidated} setLoopBValidated={setLoopBValidated}
        clearLoop={function(){setLoopA(null);setLoopB(null);setPracticeSpeed(100);practiceSpeedRef.current=100;_practiceLoopCount.current=0;setStatus("Loop cleared");}}
        scrollToMeasure={scrollToMeasure} selOriginTrack={_selOriginTrack} selectModeRef={_selectModeRef}
        scrollToTrack={function(ti){var el=stickyRefs.current[ti+1];if(el&&el.parentElement&&sRef.current){var wrapper=el.parentElement;var wTop=wrapper.offsetTop;var wH=wrapper.offsetHeight;var sH=sRef.current.clientHeight;if(wH<=sH){var centered=wTop-Math.max(0,(sH-wH)/2);sRef.current.scrollTop=Math.max(0,centered);}else{sRef.current.scrollTop=Math.max(0,wTop-4);}}}} />}
      {isMobile && song && betaKb && dlg!=="findReplace" && <MobileKeyboardBeta song={song} ati={ati} cur={cur} track={track}
        setCur={function(c){_setCurRaw(c);}} setAti={setAti} atiRef={atiRef} setSong={setSong} undoLabel={_undoLabel}
        placeNote={placeNote} placeMuted={placeMuted} placeStop={placeStop}
        clearBeat={clearBeat} toggleEffect={toggleEffect} doPlay={doPlay}
        stopPlay={stopPlay} playing={playing} openDlg={openDlg} sRef={sRef}
        buildEfxData={buildEfxData} doUndo={doUndo} th={TH}
        sel={sel} setSel={setSel} clipboard={clipboard} normSel={normSel}
        setStatus={setStatus} cutBeat={cutBeat}
        kbVisible={kbVisible} onToggleKb={function(){setKbVisible(!kbVisible);}}
        setCmdPalOpen={setCmdPalOpen}
        practiceSpeed={practiceSpeed} practiceAutoInc={practiceAutoInc} practiceIncStep={practiceIncStep} practiceTargetSpeed={practiceTargetSpeed}
        loopA={loopA} loopB={loopB} setLoopAValidated={setLoopAValidated} setLoopBValidated={setLoopBValidated}
        clearLoop={function(){setLoopA(null);setLoopB(null);setPracticeSpeed(100);practiceSpeedRef.current=100;_practiceLoopCount.current=0;setStatus("Loop cleared");}}
        scrollToMeasure={scrollToMeasure} selOriginTrack={_selOriginTrack} selectModeRef={_selectModeRef}
        metro={metro} setMetro={setMetro}
        addTrackData={addTrackData} trackPropsData={trackPropsData}
        scrollToTrack={function(ti){var el=stickyRefs.current[ti+1];if(el&&el.parentElement&&sRef.current){var wrapper=el.parentElement;var wTop=wrapper.offsetTop;var wH=wrapper.offsetHeight;var sH=sRef.current.clientHeight;if(wH<=sH){var centered=wTop-Math.max(0,(sH-wH)/2);sRef.current.scrollTop=Math.max(0,centered);}else{sRef.current.scrollTop=Math.max(0,wTop-4);}}}} />}

      {/* Mobile text line input: hidden input that brings up native keyboard */}
      {isMobile && song && (cur.string === track.numStrings || cur.string === -1) && (
        <input autoFocus key={"textline"} type="text" maxLength={1}
          autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck="false"
          style={{position:"fixed",top:40,left:0,width:1,height:1,opacity:0.01,fontSize:16,zIndex:-1}}
          ref={function(el){if(el){setTimeout(function(){el.focus({preventScroll:true});},50);}}}
          onInput={function(e){
            var val = e.target.value;
            if (val && val.length > 0) {
              var sc = JSON.parse(JSON.stringify(song));
              var charCode = val.charCodeAt(0);
              if (cur.string === track.numStrings) sc.tracks[ati].measures[cur.measure].beats[cur.beat].topChar = charCode;
              else sc.tracks[ati].measures[cur.measure].beats[cur.beat].botChar = charCode;
              setSong(sc);
              var bts = track.measures[cur.measure] ? track.measures[cur.measure].beats.length : 16;
              if (cur.beat + 1 < bts) _setCurRaw({measure:cur.measure,beat:cur.beat+1,string:cur.string});
              else if (cur.measure + 1 < track.measures.length) _setCurRaw({measure:cur.measure+1,beat:0,string:cur.string});
            }
            e.target.value = "";
          }}
          onKeyDown={function(e){
            if (e.key === "Backspace") {
              e.preventDefault();
              var sc2 = JSON.parse(JSON.stringify(song));
              if (cur.string === track.numStrings) sc2.tracks[ati].measures[cur.measure].beats[cur.beat].topChar = 0;
              else sc2.tracks[ati].measures[cur.measure].beats[cur.beat].botChar = 0;
              setSong(sc2);
            }
          }}
          onFocus={function(){if(sRef.current){var st=sRef.current.scrollTop;setTimeout(function(){if(sRef.current)sRef.current.scrollTop=st;},100);}}} />
      )}

      {/* Mobile fret input popup (only for non-mobile-keyboard touch devices) */}
      {!isMobile && song && song._mobileInput && (
        <div style={{position:"fixed",left:Math.min(song._mobileInput.x-30,window.innerWidth-80),top:Math.max(0,song._mobileInput.y-44),zIndex:9999,background:TH.menuBg||"#fff",border:"2px solid #4080c0",borderRadius:4,padding:4,boxShadow:"0 2px 8px rgba(0,0,0,.3)",color:TH.menuT||"#000"}}>
          <input autoFocus type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
            defaultValue={song._mobileInput.existing || ""}
            style={{width:40,height:30,fontSize:18,textAlign:"center",border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:2}}
            onKeyDown={function(e){
              if(e.key==="Enter"){
                e.preventDefault();
                var v=parseInt(e.target.value);
                var maxF=song.tracks[ati].isDrum?99:24;
                if(!isNaN(v)&&v>=0&&v<=maxF){
                  var sn=JSON.parse(JSON.stringify(song));
                  delete sn._mobileInput;
                  var m=sn.tracks[ati].measures[cur.measure];
                  if(m&&m.beats[cur.beat]){m.beats[cur.beat].notes[cur.string]={fret:v,attack:true,effect:0};}
                  setSong(sn);
                } else {
                  setSong(function(prev){var cp=Object.assign({},prev);delete cp._mobileInput;return cp;});
                }
              }
              if(e.key==="Escape"){setSong(function(prev){var cp=Object.assign({},prev);delete cp._mobileInput;return cp;});}
              if(e.key==="Backspace"&&!e.target.value){
                e.preventDefault();
                var sd=JSON.parse(JSON.stringify(song));delete sd._mobileInput;
                sd.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string]=null;
                setSong(sd);
              }
            }}
            onBlur={function(e){
              // Delay to allow keydown to fire first on mobile
              var val=e.target.value;
              setTimeout(function(){
                var v2=parseInt(val);
                var maxF2=song.tracks[ati].isDrum?99:24;
                if(!isNaN(v2)&&v2>=0&&v2<=maxF2){
                  var sn2=JSON.parse(JSON.stringify(song));delete sn2._mobileInput;
                  var m2=sn2.tracks[ati].measures[cur.measure];
                  if(m2&&m2.beats[cur.beat]){m2.beats[cur.beat].notes[cur.string]={fret:v2,attack:true,effect:0};}
                  setSong(sn2);
                } else {
                  setSong(function(prev){if(!prev)return prev;var cp=Object.assign({},prev);delete cp._mobileInput;return cp;});
                }
              },100);
            }}
          />
        </div>
      )}
      <Modal show={dlg==="appearance"} title="Appearance" onClose={closeDlg}>
        {(function(){
          var d = dlgData;
          function setD(patch){ setDlgData(Object.assign({},d,patch)); }
          var swatches = ["#3264dc","#7c4dff","#00897b","#e53935","#fb8c00","#43a047","#d81b60","#00acc1","#5d4037","#000080"];
          var sampleFamily = (NUM_FONTS[d.numFont]||NUM_FONTS.mono);
          var effPreset = (d.theme && d.theme!=="auto") ? THEME_PRESETS[d.theme] : null;
          return React.createElement("div",{style:{fontSize:12}},
            // Live preview
            React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"10px 0",marginBottom:8,background:(d.colCanvas||(effPreset&&effPreset.canvas)||TH.canvas),borderRadius:8,border:"1px solid var(--border-subtle,#e4e8f0)"}},
              [0,3,5,7,12].map(function(n,i){return React.createElement("span",{key:i,style:{fontFamily:sampleFamily,fontWeight:"bold",fontSize:Math.round(15*((d.numScale||100)/100)),color:(d.colFret||(effPreset&&effPreset.fret)||TH.fret)}},String(n));})
            ),
            // Theme preset
            React.createElement(DlgRow,{label:"Theme:",lw:90},
              React.createElement("select",{value:d.theme||"auto",onChange:function(e){setD({theme:e.target.value});},style:{flex:1}},
                React.createElement("option",{value:"auto"},"Auto (Dark/Light)"),
                React.createElement("option",{value:"paper"},"Paper"),
                React.createElement("option",{value:"sepia"},"Sepia"),
                React.createElement("option",{value:"contrast"},"High Contrast"),
                React.createElement("option",{value:"classic"},"Classic")
              )
            ),
            // Accent color
            React.createElement(DlgRow,{label:"Accent:",lw:90},
              React.createElement("div",{style:{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}},
                swatches.map(function(c){return React.createElement("span",{key:c,onClick:function(){setD({accent:c});},style:{width:20,height:20,borderRadius:5,background:c,cursor:"pointer",border:(d.accent===c)?"2px solid "+TH.text:"2px solid transparent"}});}),
                React.createElement("input",{type:"color",value:d.accent||"#3264dc",onChange:function(e){setD({accent:e.target.value});},style:{width:28,height:24,padding:0,border:"none",background:"none",cursor:"pointer"},title:"Custom accent"}),
                d.accent?React.createElement("span",{onClick:function(){setD({accent:""});},style:{fontSize:10,cursor:"pointer",opacity:0.6,textDecoration:"underline"}},"reset"):null
              )
            ),
            // Number font
            React.createElement(DlgRow,{label:"Number font:",lw:90},
              React.createElement("select",{value:d.numFont||"mono",onChange:function(e){setD({numFont:e.target.value});},style:{flex:1}},
                React.createElement("option",{value:"mono"},"Monospace"),
                React.createElement("option",{value:"sans"},"Sans-serif"),
                React.createElement("option",{value:"serif"},"Serif"),
                React.createElement("option",{value:"slab"},"Slab"),
                React.createElement("option",{value:"rounded"},"Rounded"),
                React.createElement("option",{value:"condensed"},"Condensed"),
                React.createElement("option",{value:"wide"},"Wide"),
                React.createElement("option",{value:"typewriter"},"Typewriter"),
                React.createElement("option",{value:"hand"},"Handwritten")
              )
            ),
            // Number size
            React.createElement(DlgRow,{label:"Number size:",lw:90},
              React.createElement("input",{type:"range",min:70,max:160,step:5,value:d.numScale||100,onChange:function(e){setD({numScale:+e.target.value});},style:{flex:1}}),
              React.createElement("span",{style:{width:42,textAlign:"right"}},(d.numScale||100)+"%")
            ),
            // Staff height
            React.createElement(DlgRow,{label:"Staff height:",lw:90},
              React.createElement("input",{type:"range",min:80,max:160,step:5,value:d.staffScale||100,onChange:function(e){setD({staffScale:+e.target.value});},style:{flex:1}}),
              React.createElement("span",{style:{width:42,textAlign:"right"}},(d.staffScale||100)+"%")
            ),
            // Track header icons
            React.createElement("label",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginTop:6,fontSize:12}},
              React.createElement("input",{type:"checkbox",checked:d.showTrackIcons!==false,onChange:function(e){setD({showTrackIcons:e.target.checked});}}),
              React.createElement("span",null,"Show instrument icons on track headers")
            ),
            React.createElement("label",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginTop:4,fontSize:12}},
              React.createElement("input",{type:"checkbox",checked:d.showTrackStripe!==false,onChange:function(e){setD({showTrackStripe:e.target.checked});}}),
              React.createElement("span",null,"Show colored stripe on track headers")
            ),
            isMobile ? null : React.createElement("label",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginTop:4,fontSize:12}},
              React.createElement("input",{type:"checkbox",checked:d.showNoteChip!==false,onChange:function(e){setD({showNoteChip:e.target.checked});}}),
              React.createElement("span",null,"Show note name at cursor")
            ),
            // Advanced colors
            React.createElement("div",{style:{marginTop:8,borderTop:"1px solid var(--border-subtle,#e4e8f0)",paddingTop:8}},
              React.createElement("div",{style:{fontSize:11,fontWeight:"600",cursor:"pointer",opacity:0.8,marginBottom:d._adv?6:0},onClick:function(){setD({_adv:!d._adv});}},(d._adv?"\u25BC":"\u25B6")+" Advanced colors"),
              d._adv?React.createElement("div",null,
                [["colCanvas","Background","canvas",TH.canvas],["colFret","Fret numbers","fret",TH.fret],["colLine","String lines","line",TH.line],["colBar","Bar lines","bar",TH.bar],["colEffect","Effects","efx",TH.efx],["colCursor","Cursor",null,TH.curB],["colPlayhead","Playback",null,(d.colPlayhead||"#00b400")],["colTrackHdr","Header bg","tIn",TH.tIn],["colTrackText","Header text","trkText",TH.text]].map(function(row){
                  var shown = d[row[0]] || (row[2]&&effPreset&&effPreset[row[2]]) || row[3];
                  return React.createElement("div",{key:row[0],style:{display:"flex",alignItems:"center",gap:8,marginBottom:4}},
                    React.createElement("span",{style:{width:90,fontSize:11}},row[1]),
                    React.createElement("input",{type:"color",value:shown,onChange:function(e){var p={};p[row[0]]=e.target.value;setD(p);},style:{width:32,height:22,padding:0,border:"none",background:"none",cursor:"pointer"}}),
                    d[row[0]]?React.createElement("span",{onClick:function(){var p={};p[row[0]]="";setD(p);},style:{fontSize:10,cursor:"pointer",opacity:0.6,textDecoration:"underline"}},"reset"):null
                  );
                })
              ):null
            ),
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",gap:6,marginTop:12}},
              React.createElement(DlgBtn,{o:function(){setDlgData(Object.assign({},APPEARANCE_DEFAULTS));}},"Reset All"),
              React.createElement("div",{style:{display:"flex",gap:6}},
                React.createElement(DlgBtn,{o:function(){var clean=Object.assign({},d);delete clean._adv;setAppearance(clean);if(clean.theme&&clean.theme!=="auto"&&THEME_IS_DARK[clean.theme]!==undefined){setDarkMode(THEME_IS_DARK[clean.theme]);}closeDlg();setStatus("Appearance updated");},primary:true},"Apply"),
                React.createElement(DlgBtn,{o:closeDlg},"Cancel")
              )
            )
          );
        })()}
      </Modal>
      <Modal show={dlg==="practice"} title="Practice Mode" onClose={closeDlg}>
        <DlgRow label="Speed:" lw={90}>
          <input type="range" min={25} max={100} step={5} value={dlgData.speed||100} style={{flex:1}}
            onChange={function(e){var v=+e.target.value;setDlgData(Object.assign({},dlgData,{speed:v}));}} />
          <span style={{width:40,textAlign:"right",fontWeight:"600",fontSize:13}}>{(dlgData.speed||100)+"%"}</span>
        </DlgRow>
        <DlgRow label="Loop Start:" lw={90}>
          <span style={{fontSize:12}}>{loopA ? "M"+(loopA.measure+1)+":B"+(loopA.beat+1) : "Not set"}</span>
          <DlgBtn o={function(){setLoopAValidated({measure:cur.measure,beat:cur.beat});setDlgData(Object.assign({},dlgData));}}>Set to Cursor</DlgBtn>
          {loopA && <DlgBtn o={function(){setLoopA(null);setDlgData(Object.assign({},dlgData));}}>Clear</DlgBtn>}
        </DlgRow>
        <DlgRow label="Loop End:" lw={90}>
          <span style={{fontSize:12}}>{loopB ? "M"+(loopB.measure+1)+":B"+(loopB.beat+1) : "Not set"}</span>
          <DlgBtn o={function(){setLoopBValidated({measure:cur.measure,beat:cur.beat});setDlgData(Object.assign({},dlgData));}}>Set to Cursor</DlgBtn>
          {loopB && <DlgBtn o={function(){setLoopB(null);setDlgData(Object.assign({},dlgData));}}>Clear</DlgBtn>}
        </DlgRow>
        <div style={{borderTop:"1px solid var(--dlg-border,#ccc)",margin:"10px 0",paddingTop:10}}>
          <DlgRow label="Auto Speed Up:" lw={90}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,cursor:"pointer"}}>
              <input type="checkbox" checked={!!dlgData.autoInc} onChange={function(e){setDlgData(Object.assign({},dlgData,{autoInc:e.target.checked}));}} />
              {"Increase every 2 loops"}
            </label>
          </DlgRow>
          {dlgData.autoInc && <DlgRow label="Increment:" lw={90}>
            <select value={dlgData.incStep||5} onChange={function(e){setDlgData(Object.assign({},dlgData,{incStep:+e.target.value}));}}>
              <option value={2}>2%</option><option value={5}>5%</option><option value={10}>10%</option>
            </select>
          </DlgRow>}
          {dlgData.autoInc && <DlgRow label="Target:" lw={90}>
            <input type="number" min={25} max={200} value={dlgData.targetSpeed||100} style={{width:50}}
              onChange={function(e){setDlgData(Object.assign({},dlgData,{targetSpeed:+e.target.value}));}} />
            <span style={{fontSize:11,opacity:0.6}}>{"%"}</span>
          </DlgRow>}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}>
          <DlgBtn o={function(){setPracticeSpeed(dlgData.speed||100);practiceSpeedRef.current=dlgData.speed||100;setPracticeAutoInc(!!dlgData.autoInc);setPracticeIncStep(dlgData.incStep||5);setPracticeTargetSpeed(dlgData.targetSpeed||100);_practiceLoopCount.current=0;closeDlg();setStatus("Practice: "+(dlgData.speed||100)+"% speed"+(loopA&&loopB?" with A/B loop":""));}} primary>Apply</DlgBtn>
          <DlgBtn o={function(){setPracticeSpeed(100);practiceSpeedRef.current=100;setLoopA(null);setLoopB(null);setPracticeAutoInc(false);_practiceLoopCount.current=0;closeDlg();setStatus("Practice mode reset");}}>Reset</DlgBtn>
          <DlgBtn o={closeDlg}>Cancel</DlgBtn>
        </div>
      </Modal>
      <Modal show={dlg==="undoHistory"} title={"Undo History (" + undoStack.current.length + " steps)"} onClose={closeDlg}>
        <div style={{maxHeight:isMobile?320:400,overflowY:"auto",margin:"-4px -4px 8px"}}>
          <div style={{padding:"8px 12px",fontSize:isMobile?12:11,background:"var(--accent-soft,rgba(50,100,220,0.08))",borderRadius:6,marginBottom:4,fontWeight:"600",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{"Current State"}</span>
            <span style={{fontSize:10,opacity:0.5}}>{"now"}</span>
          </div>
          {undoStack.current.length === 0 && <div style={{padding:"16px 12px",fontSize:isMobile?12:11,opacity:0.5,textAlign:"center"}}>{"No undo history yet"}</div>}
          {undoStack.current.slice().reverse().map(function(entry, ri) {
            var idx = undoStack.current.length - 1 - ri;
            var ts = typeof entry === "string" ? null : entry.ts;
            var ago = ts ? (function(){ var d = Math.floor((Date.now() - ts)/1000); if(d<5) return "just now"; if(d<60) return d+"s ago"; if(d<3600) return Math.floor(d/60)+"m ago"; return Math.floor(d/3600)+"h ago"; })() : "";
            return React.createElement("div", {key:idx, style:{padding:isMobile?"8px 12px":"6px 12px",fontSize:isMobile?12:11,cursor:"pointer",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background 0.15s"},
              onMouseEnter:function(e){e.currentTarget.style.background="var(--surface-3,#e4e8f0)";},
              onMouseLeave:function(e){e.currentTarget.style.background="";},
              onClick:function(){
                // Restore to this point: pop everything above this entry
                var entry2 = undoStack.current[idx];
                var restored = JSON.parse(typeof entry2 === "string" ? entry2 : entry2.data);
                undoStack.current = undoStack.current.slice(0, idx);
                _setSongRaw(restored);
                setStatus("Restored to step " + (idx + 1));
                closeDlg();
              }},
              React.createElement("span", null, (idx + 1) + ". " + (typeof entry === "object" && entry.label ? entry.label : "Edit")),
              React.createElement("span", {style:{fontSize:10,opacity:0.5}}, ago)
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",gap:6}}>
          <DlgBtn o={function(){if(undoStack.current.length>0&&window.confirm("Clear all undo history?")){undoStack.current=[];closeDlg();setStatus("Undo history cleared");}}}>Clear All</DlgBtn>
          <DlgBtn o={closeDlg}>Close</DlgBtn>
        </div>
      </Modal>
      <Modal show={dlg==="title"} title="Title & Comments" onClose={closeDlg}>
        <DlgRow label="Title:" lw={90}><input value={dlgData.title||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{title:e.target.value}));}} style={{flex:1,flex:1}} /></DlgRow>
        <DlgRow label="Artist:" lw={90}><input value={dlgData.artist||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{artist:e.target.value}));}} style={{flex:1,flex:1}} /></DlgRow>
        <DlgRow label="Album:" lw={90}><input value={dlgData.album||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{album:e.target.value}));}} style={{flex:1,flex:1}} /></DlgRow>
        <DlgRow label="Transcribed By:" lw={90}><input value={dlgData.transcribedBy||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{transcribedBy:e.target.value}));}} style={{flex:1,flex:1}} /></DlgRow>
        <DlgRow label="Comments:" lw={90}><textarea value={dlgData.copyright||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{copyright:e.target.value}));}} rows={4} style={{flex:1,flex:1,fontFamily:"system-ui,-apple-system,sans-serif",resize:"vertical"}} /></DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){_undoLabel.current="Song Info";var s9=Object.assign({},song,dlgData);docs.current[activeDocIdx].title=s9.title||"Untitled";setSong(s9);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="tempo"||dlg==="tempoChange"} title="Tempo" onClose={function(){tapTimes.current=[];closeDlg();}}>
        <DlgRow label="BPM:" lw={60}>
          <input type="number" min={30} max={500} value={dlgData.tempo!==undefined&&dlgData.tempo!==""?dlgData.tempo:""} placeholder="Tap or type..." onChange={function(e){setDlgData(Object.assign({},dlgData,{tempo:e.target.value===""?"":+e.target.value}));}} style={{width:60,flex:1}} />
          <DlgBtn o={function(){
            var now = Date.now();
            if (tapTimes.current.length > 0 && now - tapTimes.current[tapTimes.current.length-1] > 3000) {
              tapTimes.current = [];
            }
            if (tapTimes.current.length === 0) {
              setDlgData(Object.assign({},dlgData,{tempo:""}));
            }
            tapTimes.current.push(now);
            if (tapTimes.current.length > 21) tapTimes.current = tapTimes.current.slice(-21);
            if (tapTimes.current.length >= 5) {
              var intervals = [];
              for (var ti9 = 1; ti9 < tapTimes.current.length; ti9++) {
                intervals.push(tapTimes.current[ti9] - tapTimes.current[ti9-1]);
              }
              var avg = intervals.reduce(function(a,b){return a+b;},0) / intervals.length;
              var bpm = Math.round(60000 / avg);
              bpm = Math.max(30, Math.min(500, bpm));
              setDlgData(Object.assign({},dlgData,{tempo:bpm}));
            }
            if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
            tapResetTimer.current = setTimeout(function(){ tapTimes.current = []; }, 3000);
          }}>{"Tap"}</DlgBtn>
        </DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){_undoLabel.current="Tempo";tapTimes.current=[];var newT=Math.max(30,Math.min(500,dlgData.tempo||120));var sb=JSON.parse(JSON.stringify(song));sb.tempo=newT;if(dlg==="tempoChange"){var tb=sb.tracks[ati];var mb2=tb.measures[cur.measure];if(mb2&&mb2.beats[cur.beat]){mb2.beats[cur.beat].trkEffect={type:84,value:newT};}}setSong(sb);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={function(){tapTimes.current=[];closeDlg();}}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="timeSig"} title="Time Signature" onClose={closeDlg}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <select value={dlgData.num||4} onChange={function(e){setDlgData(Object.assign({},dlgData,{num:+e.target.value}));}} style={{fontSize:18,fontWeight:"700",width:60,textAlign:"center"}}>
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(function(n){return <option key={n} value={n}>{n}</option>;})}
          </select>
          <span style={{fontSize:24,fontWeight:"700"}}>{"/"}</span>
          <select value={dlgData.den||4} onChange={function(e){setDlgData(Object.assign({},dlgData,{den:+e.target.value}));}} style={{fontSize:18,fontWeight:"700",width:60,textAlign:"center"}}>
            {[2,4,8,16].map(function(d){return <option key={d} value={d}>{d}</option>;})}
          </select>
          <span style={{fontSize:12,opacity:0.6,marginLeft:8}}>{"= "+timeSigBeats(dlgData.num||4,dlgData.den||4)+" beats"}</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
          {[{n:"4/4",num:4,den:4},{n:"3/4",num:3,den:4},{n:"2/4",num:2,den:4},{n:"6/8",num:6,den:8},{n:"5/4",num:5,den:4},{n:"7/8",num:7,den:8},{n:"2/2",num:2,den:2},{n:"3/8",num:3,den:8},{n:"12/8",num:12,den:8}].map(function(preset){
            return <DlgBtn key={preset.n} o={function(){setDlgData(Object.assign({},dlgData,{num:preset.num,den:preset.den}));}}>{preset.n}</DlgBtn>;
          })}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,marginBottom:8}}>
          <input type="checkbox" checked={!!dlgData.applyAll} onChange={function(e){setDlgData(Object.assign({},dlgData,{applyAll:e.target.checked}));}} />
          {"Apply to all bars from here onward"}
        </label>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){
          var num=dlgData.num||4,den=dlgData.den||4;
          var newBeats=timeSigBeats(num,den);
          var s9=JSON.parse(JSON.stringify(song));
          var startM=cur.measure;
          var totalM=s9.tracks[0].measures.length;
          var blank=function(ti){return {notes:new Array(s9.tracks[ti].numStrings).fill(null)};};
          // Build the target beat-count per measure from startM..end.
          // applyAll: every measure from startM uses newBeats.
          // single: only startM uses newBeats; following measures keep their own time-sig beat count.
          var targetCounts=[];
          for(var mi=startM;mi<totalM;mi++){
            if(dlgData.applyAll || mi===startM) targetCounts.push(newBeats);
            else { var ets=getTimeSig(s9.tracks[0].measures[mi]); targetCounts.push(timeSigBeats(ets.num,ets.den)); }
          }
          // For each track: flatten beats from startM..end into one stream, then re-chunk by targetCounts.
          var maxMeasuresNeeded=0;
          for(var ti9=0;ti9<s9.tracks.length;ti9++){
            var trk=s9.tracks[ti9];
            var flat=[];
            for(var mi2=startM;mi2<totalM;mi2++){ var mm=trk.measures[mi2]; if(mm&&mm.beats) flat=flat.concat(mm.beats); }
            // Re-chunk
            var chunks=[]; var idx=0; var tc=0;
            while(idx<flat.length || tc<targetCounts.length){
              var cnt = (tc<targetCounts.length)?targetCounts[tc]:newBeats;
              var slice=flat.slice(idx, idx+cnt);
              while(slice.length<cnt) slice.push(blank(ti9)); // pad final/short bars
              chunks.push(slice); idx+=cnt; tc++;
              if(idx>=flat.length && tc>=targetCounts.length) break;
            }
            if(chunks.length===0) chunks.push((function(){var a=[];for(var z=0;z<newBeats;z++)a.push(blank(ti9));return a;})());
            maxMeasuresNeeded=Math.max(maxMeasuresNeeded,chunks.length);
            trk._reflowChunks=chunks;
          }
          // Apply chunks back, building measure objects. Preserve barLine/timeSig appropriately.
          for(var ti3=0;ti3<s9.tracks.length;ti3++){
            var trk3=s9.tracks[ti3];
            var oldTail=trk3.measures.slice(startM); // for barLine reference
            var newMeas=[];
            for(var ci=0;ci<trk3._reflowChunks.length;ci++){
              var refOld=oldTail[ci]||oldTail[oldTail.length-1]||{};
              var thisCount=(ci<targetCounts.length)?targetCounts[ci]:newBeats;
              var useNewTs=(dlgData.applyAll || ci===0);
              var ts = useNewTs ? {num:num,den:den} : (refOld.timeSig||{num:4,den:4});
              newMeas.push({
                beats:trk3._reflowChunks[ci],
                barLine:refOld.barLine||"single",
                beatsPerMeasure:thisCount,
                globalBeatsPerMeasure:thisCount,
                isATR:!!refOld.isATR,
                timeSig:ts
              });
            }
            trk3.measures = trk3.measures.slice(0,startM).concat(newMeas);
            delete trk3._reflowChunks;
          }
          // Sections: if measure count changed, shift sections after startM by the delta
          var deltaM=(s9.tracks[0].measures.length)-totalM;
          if(deltaM!==0) shiftSections(s9,startM,deltaM);
          _undoLabel.current="Time Signature";setSong(s9);closeDlg();setStatus("Time signature: "+num+"/"+den+(dlgData.applyAll?" (applied to all from M"+(startM+1)+")":""));
        }} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="goToBar"} title="Go to Bar" onClose={closeDlg}>
        <DlgRow label="Bar:" lw={40}><input type="number" min={1} max={999} value={dlgData.bar||1} onChange={function(e){setDlgData(Object.assign({},dlgData,{bar:+e.target.value}));}} style={{width:60,flex:1}} /></DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){var tgt=Math.max(0,Math.min((dlgData.bar||1)-1,track.measures.length-1));setCur({measure:tgt,beat:0,string:cur.string});closeDlg();if(sRef.current){var BW3=18,MP3=3,LW3=48;var px3=LW3;for(var gi=0;gi<tgt;gi++){var gm=track.measures[gi];var gb3=gm?gm.beats.length:BPM;px3+=gb3*BW3+MP3*2+1;}sRef.current.scrollLeft=Math.max(0,px3-sRef.current.clientWidth*0.3);}}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="trackProps"} title={"Track "+(ati+1)+" Properties"} onClose={closeDlg}>
        {_sf2State==="done"&&!sf2HasPreset(dlgData.bank!=null?dlgData.bank:0, dlgData.instrument||0) ? <div style={{fontSize:10,padding:"6px 8px",marginBottom:8,borderRadius:4,background:darkMode?"rgba(255,180,0,0.15)":"#fff3cd",color:darkMode?"#ffc040":"#856404",border:"1px solid "+(darkMode?"rgba(255,180,0,0.3)":"#ffc107")}}>
          {"The loaded SoundFont does not include "+(dlgData.bank?"Bank "+dlgData.bank+", ":"")+"Program "+(dlgData.instrument||0)+". This track will be silent during playback."}
        </div> : null}
        {/* Tab bar */}
        <div style={{display:"flex",borderBottom:"1px solid var(--border-subtle,#e4e8f0)",marginBottom:10,gap:2}}>
          {["main","tuning","playback","effects","midi"].map(function(tab){ return (
            <div key={tab} style={{padding:"4px 12px",cursor:"pointer",fontSize:11,fontWeight:dlgData.tab===tab?"bold":"normal",
              borderBottom:"none",borderRadius:20,
              background:dlgData.tab===tab?"var(--accent-soft,rgba(50,100,220,0.08))":"transparent",
              color:dlgData.tab===tab?"var(--accent,#3264dc)":"var(--text-secondary,#888)"}}
              onClick={function(){setDlgData(Object.assign({},dlgData,{tab:tab}));}}>{({main:"Main",tuning:"Tuning",playback:"Playback",effects:"Effects",midi:"MIDI Controllers"})[tab]}</div>
          );})}
        </div>
        {/* Main tab */}
        {dlgData.tab==="main" ? <div>
          <DlgRow label="Name:" lw={50}><input value={dlgData.name||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{name:e.target.value}));}} style={{flex:1}} /></DlgRow>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:6}}>{"Instrument Type"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["guitar","bass","banjo","drums"].map(function(it){return (
                <label key={it} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}>
                  <input type="radio" name="instTypeProp" checked={(dlgData.instType||"guitar")===it} onChange={function(){
                    var p=INST_PRESETS[it]; var ns=p.defStrings; var firstTuning=Object.values(p.tunings)[0];
                    var updates={instType:it,numStrings:ns,instrument:p.defInstrument,tuning:firstTuning.slice(0,ns),isDrum:it==="drums",midiChannel:it==="drums"?10:(dlgData.midiChannel===10?1:dlgData.midiChannel)};
                    setDlgData(Object.assign({},dlgData,updates));
                  }} />{INST_PRESETS[it].label}</label>
              );})}
            </div>
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:6}}>{"Strings"}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="range" min={1} max={12} value={dlgData.numStrings||6} style={{flex:1}} onChange={function(e){
                var ns=+e.target.value; var it=dlgData.instType||"guitar"; var presets=INST_PRESETS[it].tunings;
                var bestTuning=null; var keys=Object.keys(presets);
                for(var pi=0;pi<keys.length;pi++){if(presets[keys[pi]].length===ns){if(!bestTuning||keys[pi].indexOf("Standard")>=0)bestTuning=presets[keys[pi]];}}
                var t2=bestTuning?bestTuning.slice():(dlgData.tuning||[]); while(t2.length<ns)t2.push(0); t2=t2.slice(0,ns);
                var upd={numStrings:ns,tuning:t2}; if(ns!==6)upd.twelveStringMode=false;
                setDlgData(Object.assign({},dlgData,upd));
              }} />
              <span style={{fontSize:14,fontWeight:"600",minWidth:24,textAlign:"center"}}>{dlgData.numStrings||6}</span>
            </div>
            {(dlgData.instType||"guitar")==="guitar"&&(dlgData.numStrings===12||dlgData.twelveStringMode) ? <div style={{marginTop:6}}>
              <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}>
                <input type="checkbox" checked={!!dlgData.twelveStringMode} onChange={function(e){
                  if(e.target.checked){setDlgData(Object.assign({},dlgData,{twelveStringMode:true,numStrings:6,tuning:[40,45,50,55,59,64]}));}
                  else{setDlgData(Object.assign({},dlgData,{twelveStringMode:false,numStrings:12,tuning:[40,52,45,57,50,62,55,67,59,59,64,64]}));}
                }} />
                {"6-line mode (pairs doubled in playback)"}
              </label>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:6}}>{"Options"}</div>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}><input type="checkbox" checked={!!dlgData.hasTopText} onChange={function(e){setDlgData(Object.assign({},dlgData,{hasTopText:e.target.checked}));}} />{"Text Line on Top"}</label>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,marginTop:4}}><input type="checkbox" checked={!!dlgData.hasBottomText} onChange={function(e){setDlgData(Object.assign({},dlgData,{hasBottomText:e.target.checked}));}} />{"Text Line on Bottom"}</label>
            {dlgData.midiChannel!==10 && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12,marginTop:4}}>
              <span>{"Max Fret:"}</span>
              <input type="text" inputMode="numeric" value={dlgData._ed_maxFret!==undefined?dlgData._ed_maxFret:String(dlgData.maxFret||24)} style={{width:40,fontSize:12,padding:"1px 4px",textAlign:"center"}}
                onFocus={function(e){setDlgData(Object.assign({},dlgData,{_ed_maxFret:String(dlgData.maxFret||24)}));e.target.select();}}
                onChange={function(e){setDlgData(Object.assign({},dlgData,{_ed_maxFret:e.target.value}));}}
                onBlur={function(e){var v=parseInt(e.target.value);var dd=Object.assign({},dlgData);delete dd._ed_maxFret;if(isNaN(v)||e.target.value.trim()===""){dd.maxFret=24;}else if(v<12){dd.maxFret=12;}else if(v>36){dd.maxFret=36;}else{dd.maxFret=v;}setDlgData(dd);}} />
              <span style={{fontSize:10,opacity:0.5}}>{"(12–36)"}</span>
            </div>}
          </div>
        </div> : null}
        {/* Tuning tab */}
        {dlgData.tab==="tuning" ? <div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontWeight:"600",fontSize:11}}>{"Tuning"}</div>
            </div>
            {(dlgData.tuning||[]).slice(0,dlgData.numStrings).map(function(tv,ti){return ti;}).sort(function(a,b){return b-a;}).map(function(ti){
              var tv=dlgData.tuning[ti]; var isDr=(dlgData.instType||"guitar")==="drums"||dlgData.midiChannel===10;
              function stepTuning(dir){var nt=dlgData.tuning.slice();nt[ti]=Math.max(0,Math.min(127,nt[ti]+dir));setDlgData(Object.assign({},dlgData,{tuning:nt}));}
              return (<div key={ti} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                <span style={{width:22,fontSize:11,textAlign:"right",fontWeight:"500"}}>{"S"+(ti+1)}</span>
                <span style={{width:16,fontSize:13,cursor:"pointer",textAlign:"center",userSelect:"none",lineHeight:"18px",borderRadius:3,fontWeight:"600"}} onClick={function(){stepTuning(-1);}}>{"−"}</span>
                <span style={{width:38,fontSize:12,fontWeight:"600",textAlign:"center"}}>{isDr?(PERC[tv]||tv):midiName(tv)}</span>
                <span style={{width:16,fontSize:13,cursor:"pointer",textAlign:"center",userSelect:"none",lineHeight:"18px",borderRadius:3,fontWeight:"600"}} onClick={function(){stepTuning(1);}}>{"+"}</span>
                <input type="range" min={0} max={127} value={tv} style={{flex:1}} onChange={function(e){var nt=dlgData.tuning.slice();nt[ti]=+e.target.value;setDlgData(Object.assign({},dlgData,{tuning:nt}));}} />
                <span style={{width:26,fontSize:11,opacity:0.7}}>{tv}</span>
              </div>);
            })}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
            {Object.keys(INST_PRESETS[dlgData.instType||"guitar"].tunings).filter(function(tn){
              return INST_PRESETS[dlgData.instType||"guitar"].tunings[tn].length===dlgData.numStrings;
            }).map(function(tn){
              var tv2=INST_PRESETS[dlgData.instType||"guitar"].tunings[tn];
              return <DlgBtn key={tn} o={function(){setDlgData(Object.assign({},dlgData,{tuning:tv2.slice()}));}}>{tn}</DlgBtn>;
            })}
            {(dlgData.instType||"guitar")==="drums" ? <DlgBtn o={function(){setDlgData(Object.assign({},dlgData,{tuning:new Array(dlgData.numStrings).fill(0)}));}}>All Zeros</DlgBtn> : null}
          </div>
          <DlgRow label="Transpose:" lw={70}><input type="number" min={0} max={24} value={Math.abs(dlgData.transpose||0)} onChange={function(e){var a=Math.abs(+e.target.value||0);setDlgData(Object.assign({},dlgData,{transpose:((dlgData.transpose||0)<0?-a:a)}));}} style={{width:44}} /><select value={(dlgData.transpose||0)>=0?"up":"down"} onChange={function(e){var a=Math.abs(dlgData.transpose||0);setDlgData(Object.assign({},dlgData,{transpose:e.target.value==="down"?-a:a}));}} style={{marginLeft:4}}><option value="up">{"Up"}</option><option value="down">{"Down"}</option></select><span style={{fontSize:11,marginLeft:4,opacity:0.7}}>{"half-steps"}</span></DlgRow>
          <div style={{marginTop:8}}><DlgBtn o={function(){synthAllOff();var isDr2=(dlgData.instType||"guitar")==="drums"||dlgData.midiChannel===10;var inst2=dlgData.instrument!==undefined?dlgData.instrument:25;var trans2=dlgData.transpose||0;var tun2=dlgData.tuning||[];var ns2=dlgData.numStrings||6;var ch2=dlgData.midiChannel||1;for(var si9=0;si9<ns2;si9++){var midi9=isDr2?(tun2[si9]||0):(tun2[si9]||40)+trans2;(function(m,d){setTimeout(function(){synthOn(ch2,m,70,inst2);},d);})(midi9,si9*200);}}}>Preview Tuning</DlgBtn></div>
        </div> : null}
        {/* Playback tab */}
        {dlgData.tab==="playback" ? <div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:4}}>{"Instrument"}</div>
            <DlgRow label="Instrument:" lw={70}>{dlgData.midiChannel===10 ?
              <select value={dlgData.instrument||0} onChange={function(e){setDlgData(Object.assign({},dlgData,{instrument:+e.target.value}));}} style={{flex:1}}>{DRUM_KIT_LIST.map(function(kid){var dk=DRUM_KITS[kid];return (<option key={kid} value={kid}>{kid+" - "+dk.name}</option>);})}</select> :
              <select value={dlgData.instrument||0} onChange={function(e){setDlgData(Object.assign({},dlgData,{instrument:+e.target.value}));}} style={{flex:1}}>{((dlgData.bank==null||dlgData.bank===0) ? GM.map(function(n2,i2){return (<option key={i2} value={i2}>{i2+" - "+getSF2PresetName(0,i2)}</option>);}) : getSF2PresetsForBank(dlgData.bank!=null?dlgData.bank:0).map(function(p2){return (<option key={p2} value={p2}>{p2+" - "+getSF2PresetName(dlgData.bank!=null?dlgData.bank:0,p2)}</option>);}))}</select>
            }</DlgRow>
            <DlgRow label="Bank:" lw={70}>
              <select value={dlgData.bank!=null?dlgData.bank:0} onChange={function(e){(function(){var nb=+e.target.value;var avail=getSF2PresetsForBank(nb);var newInst=nb===0?(dlgData.instrument||0):(avail.length>0?avail[0]:0);setDlgData(Object.assign({},dlgData,{bank:nb,instrument:newInst}));})();}} style={{flex:1}}>{(function(){var bl=getSF2Banks();var cb=dlgData.bank!=null?dlgData.bank:0;if(bl.indexOf(cb)<0)bl=bl.concat([cb]).sort(function(a,b){return a-b;});return bl;})().map(function(b){return (<option key={b} value={b}>{b===0?"0 - GM":b===128?"128 - Drums":"Bank "+b}</option>);})}</select>
            </DlgRow>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:11,marginTop:4}}><input type="checkbox" checked={dlgData.letRing!==false} onChange={function(e){setDlgData(Object.assign({},dlgData,{letRing:e.target.checked}));}} />{"Let Notes Ring"}</label>
          </div>
          <DlgRow label="Volume:" lw={70}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.volume,96)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{volume:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"volume",96)} onFocus={dlgNumFocus(dlgData,setDlgData,"volume",96)} onChange={dlgNumChange(dlgData,setDlgData,"volume")} onBlur={dlgNumBlur(dlgData,setDlgData,"volume",96,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Velocity:" lw={70}>
            <input type="range" min={1} max={127} value={dlgNumSlider(dlgData.trackVelocity,80)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{trackVelocity:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"trackVelocity",80)} onFocus={dlgNumFocus(dlgData,setDlgData,"trackVelocity",80)} onChange={dlgNumChange(dlgData,setDlgData,"trackVelocity")} onBlur={dlgNumBlur(dlgData,setDlgData,"trackVelocity",80,1,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Expression:" lw={70}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.trackExpression,127)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{trackExpression:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"trackExpression",127)} onFocus={dlgNumFocus(dlgData,setDlgData,"trackExpression",127)} onChange={dlgNumChange(dlgData,setDlgData,"trackExpression")} onBlur={dlgNumBlur(dlgData,setDlgData,"trackExpression",127,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="MIDI Ch:" lw={70}>
            <select value={dlgData.midiChannel||1} onChange={function(e){var ch=+e.target.value;setDlgData(Object.assign({},dlgData,{midiChannel:ch,isDrum:ch===10}));}} style={{}}>
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(function(ch){return (<option key={ch} value={ch}>{"Channel "+ch+(ch===10?" (Drums)":"")}</option>);})}
            </select>
          </DlgRow>
        </div> : null}
        {dlgData.tab==="effects" ? <div style={{fontSize:11}}>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.delayOn?6:0}}><input type="checkbox" checked={!!dlgData.delayOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayOn:e.target.checked}));}} />{"Delay"}</label>
            {dlgData.delayOn ? <div>
              <DlgRow label="Time:" lw={50}><select value={dlgData.delayTime||"8d"} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayTime:e.target.value}));}} style={{flex:1}}><option value="4">{"Quarter"}</option><option value="8">{"Eighth"}</option><option value="8d">{"Dotted 8th"}</option><option value="16">{"16th"}</option><option value="slap">{"Slapback"}</option></select></DlgRow>
              <DlgRow label="Taps:" lw={50}><input type="range" min={1} max={8} value={dlgData.delayTaps||3} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayTaps:+e.target.value}));}} style={{flex:1}} /><span style={{width:24,textAlign:"right"}}>{dlgData.delayTaps||3}</span></DlgRow>
              <DlgRow label="Mix:" lw={50}><input type="range" min={10} max={90} value={dlgData.delayMix||50} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayMix:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.delayMix||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.octOn?6:0}}><input type="checkbox" checked={!!dlgData.octOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{octOn:e.target.checked}));}} />{"Pitch Shifter"}</label>
            {dlgData.octOn ? <div>
              <DlgRow label="Shift:" lw={50}><select value={dlgData.octShift||-12} onChange={function(e){setDlgData(Object.assign({},dlgData,{octShift:+e.target.value}));}} style={{flex:1}}><option value={-24}>{"-2 oct"}</option><option value={-12}>{"-1 oct"}</option><option value={-7}>{"-5th"}</option><option value={-5}>{"-4th"}</option><option value={3}>{"+min 3rd"}</option><option value={4}>{"+maj 3rd"}</option><option value={5}>{"+4th"}</option><option value={7}>{"+5th"}</option><option value={12}>{"+1 oct"}</option><option value={24}>{"+2 oct"}</option></select></DlgRow>
              <DlgRow label="Dry:" lw={50}><input type="range" min={0} max={100} value={dlgData.octDry!=null?dlgData.octDry:100} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{octDry:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.octDry!=null?dlgData.octDry:100)+"%"}</span></DlgRow>
              <DlgRow label="Wet:" lw={50}><input type="range" min={10} max={100} value={dlgData.octMix||50} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{octMix:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.octMix||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.tremOn?6:0}}><input type="checkbox" checked={!!dlgData.tremOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{tremOn:e.target.checked}));}} />{"Tremolo"}</label>
            {dlgData.tremOn ? <div>
              <DlgRow label="Speed:" lw={50}><select value={dlgData.tremSpeed||"8"} onChange={function(e){setDlgData(Object.assign({},dlgData,{tremSpeed:e.target.value}));}} style={{flex:1}}><option value="4">{"Quarter"}</option><option value="8">{"Eighth"}</option><option value="8t">{"Eighth triplet"}</option><option value="16">{"16th"}</option></select></DlgRow>
              <DlgRow label="Depth:" lw={50}><input type="range" min={20} max={100} value={dlgData.tremDepth||70} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{tremDepth:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.tremDepth||70)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.adt>0?6:0}}><input type="checkbox" checked={dlgData.adt>0} onChange={function(e){setDlgData(Object.assign({},dlgData,{adt:e.target.checked?(dlgData.adt||50):0}));}} />{"Auto Double Tracking"}</label>
            {dlgData.adt>0 ? <div>
              <DlgRow label="Amount:" lw={60}><input type="range" min={1} max={100} value={dlgData.adt||50} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{adt:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.adt||50)+"%"}</span></DlgRow>
              <div style={{fontSize:10,color:TH.dim,marginTop:2}}>Adds thickness by playing a slightly detuned, delayed copy of each note</div>
            </div> : null}
          </div>
        </div> : null}
        {dlgData.tab==="midi" ? <div>
          <DlgRow label="Pitch Bend:" lw={90}>
            <input type="range" min={-2400} max={2400} value={dlgNumSlider(dlgData.pitchBend,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{pitchBend:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"pitchBend",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"pitchBend",0)} onChange={dlgNumChange(dlgData,setDlgData,"pitchBend")} onBlur={dlgNumBlur(dlgData,setDlgData,"pitchBend",0,-2400,2400)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Modulation:" lw={90}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.modulation,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{modulation:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"modulation",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"modulation",0)} onChange={dlgNumChange(dlgData,setDlgData,"modulation")} onBlur={dlgNumBlur(dlgData,setDlgData,"modulation",0,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Pan:" lw={90}>
            <input type="range" min={0} max={127} value={dlgData.pan!==undefined?dlgData.pan:64} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{pan:+e.target.value}));}} style={{flex:1}} />
            <input type="number" min={0} max={127} value={dlgData.pan!==undefined?dlgData.pan:64} onChange={function(e){setDlgData(Object.assign({},dlgData,{pan:+e.target.value}));}} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Reverb:" lw={90}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.reverb,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{reverb:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"reverb",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"reverb",0)} onChange={dlgNumChange(dlgData,setDlgData,"reverb")} onBlur={dlgNumBlur(dlgData,setDlgData,"reverb",0,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Chorus:" lw={90}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.chorus,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{chorus:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"chorus",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"chorus",0)} onChange={dlgNumChange(dlgData,setDlgData,"chorus")} onBlur={dlgNumBlur(dlgData,setDlgData,"chorus",0,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
        </div> : null}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){var s5=JSON.parse(JSON.stringify(song));var t2=s5.tracks[ati];var oldNS=t2.numStrings;var newNS=dlgData.numStrings;var oldTuning=t2.tuning.slice(0,oldNS);Object.assign(t2,{name:dlgData.name||t2.name,instrument:dlgData.instrument,bank:(dlgData.bank!=null?dlgData.bank:0),numStrings:newNS,volume:(dlgData.volume!==""&&!isNaN(+dlgData.volume))?+dlgData.volume:96,pan:dlgData.pan,capo:dlgData.capo||0,transpose:dlgData.transpose||0,midiChannel:dlgData.midiChannel,isDrum:dlgData.midiChannel===10,letRing:dlgData.letRing!==false,hasTopText:!!dlgData.hasTopText,hasBottomText:!!dlgData.hasBottomText,tuning:dlgData.tuning.slice(0,newNS),reverb:(dlgData.reverb!==""&&!isNaN(+dlgData.reverb))?+dlgData.reverb:0,chorus:(dlgData.chorus!==""&&!isNaN(+dlgData.chorus))?+dlgData.chorus:0,pitchBend:(dlgData.pitchBend!==""&&!isNaN(+dlgData.pitchBend))?+dlgData.pitchBend:0,modulation:(dlgData.modulation!==""&&!isNaN(+dlgData.modulation))?+dlgData.modulation:0,trackVelocity:(dlgData.trackVelocity!==""&&!isNaN(+dlgData.trackVelocity))?+dlgData.trackVelocity:80,trackExpression:(dlgData.trackExpression!==""&&!isNaN(+dlgData.trackExpression))?+dlgData.trackExpression:127,instType:dlgData.instType||"guitar",twelveStringMode:!!dlgData.twelveStringMode,delayOn:!!dlgData.delayOn,delayTime:dlgData.delayTime||"8d",delayTaps:dlgData.delayTaps||3,delayMix:dlgData.delayMix||50,octOn:!!dlgData.octOn,octShift:dlgData.octShift||-12,octDry:dlgData.octDry!=null?dlgData.octDry:100,octMix:dlgData.octMix||50,tremOn:!!dlgData.tremOn,tremSpeed:dlgData.tremSpeed||"8",tremDepth:dlgData.tremDepth||70,maxFret:dlgData.maxFret||24,adt:dlgData.adt||0});if(oldNS!==newNS){for(var mi5=0;mi5<t2.measures.length;mi5++){for(var bi5=0;bi5<t2.measures[mi5].beats.length;bi5++){var n5=t2.measures[mi5].beats[bi5].notes;while(n5.length<newNS)n5.push(null);t2.measures[mi5].beats[bi5].notes=n5.slice(0,newNS);}}}
          var newTuning=dlgData.tuning.slice(0,newNS);
          var tuningChanged=oldNS===newNS&&oldTuning.some(function(v,i){return v!==newTuning[i];});
          if(tuningChanged){
            // Check if track has any real notes
            var hasNotes=false;
            for(var hmi=0;hmi<t2.measures.length&&!hasNotes;hmi++){
              for(var hbi=0;hbi<t2.measures[hmi].beats.length&&!hasNotes;hbi++){
                for(var hsi=0;hsi<newNS;hsi++){
                  var hn=t2.measures[hmi].beats[hbi].notes[hsi];
                  if(hn&&!hn.stop&&!hn.muted){hasNotes=true;break;}
                }
              }
            }
            if(hasNotes){closeDlg();openDlg("retuneConfirm",{pendingSong:s5,oldTuning:oldTuning,newTuning:newTuning,trackIdx:ati,instrument:dlgData.instrument});return;}
          }
          _undoLabel.current="Track Properties";setSong(s5);addRecentInstrument(dlgData.instrument);preloadSong(s5.tracks);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="addTrack"} title="Add Track" onClose={closeDlg}>
        {_sf2State==="done"&&(dlgData.bank!=null&&dlgData.bank!==0)&&!sf2HasPreset(dlgData.bank, dlgData.instrument||0) ? <div style={{fontSize:10,padding:"6px 8px",marginBottom:8,borderRadius:4,background:darkMode?"rgba(255,180,0,0.15)":"#fff3cd",color:darkMode?"#ffc040":"#856404",border:"1px solid "+(darkMode?"rgba(255,180,0,0.3)":"#ffc107")}}>
          {"The loaded SoundFont does not include Bank "+dlgData.bank+", Program "+(dlgData.instrument||0)+". This track will be silent during playback."}
        </div> : null}
        <div style={{display:"flex",borderBottom:"1px solid var(--border-subtle,#e4e8f0)",marginBottom:10,gap:2}}>
          {["main","tuning","playback","effects","midi"].map(function(tab){ return (
            <div key={tab} style={{padding:"4px 12px",cursor:"pointer",fontSize:11,fontWeight:dlgData.tab===tab?"bold":"normal",
              borderBottom:"none",borderRadius:20,
              background:dlgData.tab===tab?"var(--accent-soft,rgba(50,100,220,0.08))":"transparent",
              color:dlgData.tab===tab?"var(--accent,#3264dc)":"var(--text-secondary,#888)"}}
              onClick={function(){setDlgData(Object.assign({},dlgData,{tab:tab}));}}>{({main:"Main",tuning:"Tuning",playback:"Playback",effects:"Effects",midi:"MIDI Controllers"})[tab]}</div>
          );})}
        </div>
        {dlgData.tab==="main" ? <div>
          <DlgRow label="Name:" lw={50}><input value={dlgData.name||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{name:e.target.value}));}} style={{flex:1}} /></DlgRow>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:6}}>{"Instrument Type"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["guitar","bass","banjo","drums"].map(function(it){return (
                <label key={it} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}>
                  <input type="radio" name="instTypeAdd" checked={(dlgData.instType||"guitar")===it} onChange={function(){
                    var p=INST_PRESETS[it]; var ns=p.defStrings; var firstTuning=Object.values(p.tunings)[0];
                    var updates={instType:it,numStrings:ns,instrument:p.defInstrument,tuning:firstTuning.slice(0,ns),isDrum:it==="drums",midiChannel:it==="drums"?10:(dlgData.midiChannel===10?1:dlgData.midiChannel)};
                    setDlgData(Object.assign({},dlgData,updates));
                  }} />{INST_PRESETS[it].label}</label>
              );})}
            </div>
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:6}}>{"Strings"}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="range" min={1} max={12} value={dlgData.numStrings||6} style={{flex:1}} onChange={function(e){
                var ns=+e.target.value; var it=dlgData.instType||"guitar"; var presets=INST_PRESETS[it].tunings;
                var bestTuning=null; var keys=Object.keys(presets);
                for(var pi=0;pi<keys.length;pi++){if(presets[keys[pi]].length===ns){if(!bestTuning||keys[pi].indexOf("Standard")>=0)bestTuning=presets[keys[pi]];}}
                var t2=bestTuning?bestTuning.slice():(dlgData.tuning||[]); while(t2.length<ns)t2.push(0); t2=t2.slice(0,ns);
                var upd={numStrings:ns,tuning:t2}; if(ns!==6)upd.twelveStringMode=false;
                setDlgData(Object.assign({},dlgData,upd));
              }} />
              <span style={{fontSize:14,fontWeight:"600",minWidth:24,textAlign:"center"}}>{dlgData.numStrings||6}</span>
            </div>
            {(dlgData.instType||"guitar")==="guitar"&&(dlgData.numStrings===12||dlgData.twelveStringMode) ? <div style={{marginTop:6}}>
              <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}>
                <input type="checkbox" checked={!!dlgData.twelveStringMode} onChange={function(e){
                  if(e.target.checked){setDlgData(Object.assign({},dlgData,{twelveStringMode:true,numStrings:6,tuning:[40,45,50,55,59,64]}));}
                  else{setDlgData(Object.assign({},dlgData,{twelveStringMode:false,numStrings:12,tuning:[40,52,45,57,50,62,55,67,59,59,64,64]}));}
                }} />
                {"6-line mode (pairs doubled in playback)"}
              </label>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:6}}>{"Options"}</div>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12}}><input type="checkbox" checked={!!dlgData.hasTopText} onChange={function(e){setDlgData(Object.assign({},dlgData,{hasTopText:e.target.checked}));}} />{"Text Line on Top"}</label>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,marginTop:4}}><input type="checkbox" checked={!!dlgData.hasBottomText} onChange={function(e){setDlgData(Object.assign({},dlgData,{hasBottomText:e.target.checked}));}} />{"Text Line on Bottom"}</label>
            {dlgData.midiChannel!==10 && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12,marginTop:4}}>
              <span>{"Max Fret:"}</span>
              <input type="text" inputMode="numeric" value={dlgData._ed_maxFret!==undefined?dlgData._ed_maxFret:String(dlgData.maxFret||24)} style={{width:40,fontSize:12,padding:"1px 4px",textAlign:"center"}}
                onFocus={function(e){setDlgData(Object.assign({},dlgData,{_ed_maxFret:String(dlgData.maxFret||24)}));e.target.select();}}
                onChange={function(e){setDlgData(Object.assign({},dlgData,{_ed_maxFret:e.target.value}));}}
                onBlur={function(e){var v=parseInt(e.target.value);var dd=Object.assign({},dlgData);delete dd._ed_maxFret;if(isNaN(v)||e.target.value.trim()===""){dd.maxFret=24;}else if(v<12){dd.maxFret=12;}else if(v>36){dd.maxFret=36;}else{dd.maxFret=v;}setDlgData(dd);}} />
              <span style={{fontSize:10,opacity:0.5}}>{"(12–36)"}</span>
            </div>}
          </div>
        </div> : null}
        {dlgData.tab==="tuning" ? <div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:10,margin:"4px 0",borderRadius:6}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontWeight:"600",fontSize:11}}>{"Tuning"}</div>
            </div>
            {(dlgData.tuning||[]).slice(0,dlgData.numStrings).map(function(tv,ti){return ti;}).sort(function(a,b){return b-a;}).map(function(ti){
              var tv=(dlgData.tuning||[])[ti]||0; var isDr=dlgData.midiChannel===10;
              function stepTuning2(dir){var nt=dlgData.tuning.slice();nt[ti]=Math.max(0,Math.min(127,nt[ti]+dir));setDlgData(Object.assign({},dlgData,{tuning:nt}));}
              return (<div key={ti} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                <span style={{width:22,fontSize:11,textAlign:"right",fontWeight:"500"}}>{"S"+(ti+1)}</span>
                <span style={{width:16,fontSize:13,cursor:"pointer",textAlign:"center",userSelect:"none",lineHeight:"18px",borderRadius:3,fontWeight:"600"}} onClick={function(){stepTuning2(-1);}}>{"−"}</span>
                <span style={{width:38,fontSize:12,fontWeight:"600",textAlign:"center"}}>{isDr?(PERC[tv]||tv):midiName(tv)}</span>
                <span style={{width:16,fontSize:13,cursor:"pointer",textAlign:"center",userSelect:"none",lineHeight:"18px",borderRadius:3,fontWeight:"600"}} onClick={function(){stepTuning2(1);}}>{"+"}</span>
                <input type="range" min={0} max={127} value={tv} style={{flex:1}} onChange={function(e){var nt=dlgData.tuning.slice();nt[ti]=+e.target.value;setDlgData(Object.assign({},dlgData,{tuning:nt}));}} />
                <span style={{width:26,fontSize:11,opacity:0.7}}>{tv}</span>
              </div>);
            })}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
            {Object.keys(INST_PRESETS[dlgData.instType||"guitar"].tunings).filter(function(tn){
              return INST_PRESETS[dlgData.instType||"guitar"].tunings[tn].length===dlgData.numStrings;
            }).map(function(tn){
              var tv2=INST_PRESETS[dlgData.instType||"guitar"].tunings[tn];
              return <DlgBtn key={tn} o={function(){setDlgData(Object.assign({},dlgData,{tuning:tv2.slice()}));}}>{tn}</DlgBtn>;
            })}
            {(dlgData.instType||"guitar")==="drums" ? <DlgBtn o={function(){setDlgData(Object.assign({},dlgData,{tuning:new Array(dlgData.numStrings).fill(0)}));}}>All Zeros</DlgBtn> : null}
          </div>
          <DlgRow label="Transpose:" lw={70}><input type="number" min={0} max={24} value={Math.abs(dlgData.transpose||0)} onChange={function(e){var a=Math.abs(+e.target.value||0);setDlgData(Object.assign({},dlgData,{transpose:((dlgData.transpose||0)<0?-a:a)}));}} style={{width:44}} /><select value={(dlgData.transpose||0)>=0?"up":"down"} onChange={function(e){var a=Math.abs(dlgData.transpose||0);setDlgData(Object.assign({},dlgData,{transpose:e.target.value==="down"?-a:a}));}} style={{marginLeft:4}}><option value="up">{"Up"}</option><option value="down">{"Down"}</option></select><span style={{fontSize:11,marginLeft:4,opacity:0.7}}>{"half-steps"}</span></DlgRow>
          <div style={{marginTop:8}}><DlgBtn o={function(){synthAllOff();var isDr2=(dlgData.instType||"guitar")==="drums"||dlgData.midiChannel===10;var inst2=dlgData.instrument!==undefined?dlgData.instrument:25;var trans2=dlgData.transpose||0;var tun2=dlgData.tuning||[];var ns2=dlgData.numStrings||6;var ch2=dlgData.midiChannel||1;for(var si9=0;si9<ns2;si9++){var midi9=isDr2?(tun2[si9]||0):(tun2[si9]||40)+trans2;(function(m,d){setTimeout(function(){synthOn(ch2,m,70,inst2);},d);})(midi9,si9*200);}}}>Preview Tuning</DlgBtn></div>
        </div> : null}
        {dlgData.tab==="playback" ? <div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <div style={{fontWeight:"600",fontSize:11,marginBottom:4}}>{"Instrument"}</div>
            <DlgRow label="Instrument:" lw={70}>{dlgData.midiChannel===10 ?
              <select value={dlgData.instrument||0} onChange={function(e){setDlgData(Object.assign({},dlgData,{instrument:+e.target.value}));}} style={{flex:1}}>{DRUM_KIT_LIST.map(function(kid){var dk=DRUM_KITS[kid];return (<option key={kid} value={kid}>{kid+" - "+dk.name}</option>);})}</select> :
              <select value={dlgData.instrument||0} onChange={function(e){setDlgData(Object.assign({},dlgData,{instrument:+e.target.value}));}} style={{flex:1}}>{((dlgData.bank==null||dlgData.bank===0) ? GM.map(function(n2,i2){return (<option key={i2} value={i2}>{i2+" - "+getSF2PresetName(0,i2)}</option>);}) : getSF2PresetsForBank(dlgData.bank!=null?dlgData.bank:0).map(function(p2){return (<option key={p2} value={p2}>{p2+" - "+getSF2PresetName(dlgData.bank!=null?dlgData.bank:0,p2)}</option>);}))}</select>
            }</DlgRow>
            <DlgRow label="Bank:" lw={70}>
              <select value={dlgData.bank!=null?dlgData.bank:0} onChange={function(e){(function(){var nb=+e.target.value;var avail=getSF2PresetsForBank(nb);var newInst=nb===0?(dlgData.instrument||0):(avail.length>0?avail[0]:0);setDlgData(Object.assign({},dlgData,{bank:nb,instrument:newInst}));})();}} style={{flex:1}}>{(function(){var bl=getSF2Banks();var cb=dlgData.bank!=null?dlgData.bank:0;if(bl.indexOf(cb)<0)bl=bl.concat([cb]).sort(function(a,b){return a-b;});return bl;})().map(function(b){return (<option key={b} value={b}>{b===0?"0 - GM":b===128?"128 - Drums":"Bank "+b}</option>);})}</select>
            </DlgRow>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:11,marginTop:4}}><input type="checkbox" checked={dlgData.letRing!==false} onChange={function(e){setDlgData(Object.assign({},dlgData,{letRing:e.target.checked}));}} />{"Let Notes Ring"}</label>
          </div>
          <DlgRow label="Volume:" lw={70}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.volume,96)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{volume:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"volume",96)} onFocus={dlgNumFocus(dlgData,setDlgData,"volume",96)} onChange={dlgNumChange(dlgData,setDlgData,"volume")} onBlur={dlgNumBlur(dlgData,setDlgData,"volume",96,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Velocity:" lw={70}>
            <input type="range" min={1} max={127} value={dlgNumSlider(dlgData.trackVelocity,80)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{trackVelocity:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"trackVelocity",80)} onFocus={dlgNumFocus(dlgData,setDlgData,"trackVelocity",80)} onChange={dlgNumChange(dlgData,setDlgData,"trackVelocity")} onBlur={dlgNumBlur(dlgData,setDlgData,"trackVelocity",80,1,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Expression:" lw={70}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.trackExpression,127)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{trackExpression:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"trackExpression",127)} onFocus={dlgNumFocus(dlgData,setDlgData,"trackExpression",127)} onChange={dlgNumChange(dlgData,setDlgData,"trackExpression")} onBlur={dlgNumBlur(dlgData,setDlgData,"trackExpression",127,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="MIDI Ch:" lw={70}>
            <select value={dlgData.midiChannel||1} onChange={function(e){var ch=+e.target.value;setDlgData(Object.assign({},dlgData,{midiChannel:ch,isDrum:ch===10}));}} style={{}}>
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(function(ch){return (<option key={ch} value={ch}>{"Channel "+ch+(ch===10?" (Drums)":"")}</option>);})}
            </select>
          </DlgRow>
        </div> : null}
        {dlgData.tab==="effects" ? <div style={{fontSize:11}}>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.delayOn?6:0}}><input type="checkbox" checked={!!dlgData.delayOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayOn:e.target.checked}));}} />{"Delay"}</label>
            {dlgData.delayOn ? <div>
              <DlgRow label="Time:" lw={50}><select value={dlgData.delayTime||"8d"} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayTime:e.target.value}));}} style={{flex:1}}><option value="4">{"Quarter"}</option><option value="8">{"Eighth"}</option><option value="8d">{"Dotted 8th"}</option><option value="16">{"16th"}</option><option value="slap">{"Slapback"}</option></select></DlgRow>
              <DlgRow label="Taps:" lw={50}><input type="range" min={1} max={8} value={dlgData.delayTaps||3} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayTaps:+e.target.value}));}} style={{flex:1}} /><span style={{width:24,textAlign:"right"}}>{dlgData.delayTaps||3}</span></DlgRow>
              <DlgRow label="Mix:" lw={50}><input type="range" min={10} max={90} value={dlgData.delayMix||50} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{delayMix:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.delayMix||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.octOn?6:0}}><input type="checkbox" checked={!!dlgData.octOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{octOn:e.target.checked}));}} />{"Pitch Shifter"}</label>
            {dlgData.octOn ? <div>
              <DlgRow label="Shift:" lw={50}><select value={dlgData.octShift||-12} onChange={function(e){setDlgData(Object.assign({},dlgData,{octShift:+e.target.value}));}} style={{flex:1}}><option value={-24}>{"-2 oct"}</option><option value={-12}>{"-1 oct"}</option><option value={-7}>{"-5th"}</option><option value={-5}>{"-4th"}</option><option value={3}>{"+min 3rd"}</option><option value={4}>{"+maj 3rd"}</option><option value={5}>{"+4th"}</option><option value={7}>{"+5th"}</option><option value={12}>{"+1 oct"}</option><option value={24}>{"+2 oct"}</option></select></DlgRow>
              <DlgRow label="Dry:" lw={50}><input type="range" min={0} max={100} value={dlgData.octDry!=null?dlgData.octDry:100} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{octDry:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.octDry!=null?dlgData.octDry:100)+"%"}</span></DlgRow>
              <DlgRow label="Wet:" lw={50}><input type="range" min={10} max={100} value={dlgData.octMix||50} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{octMix:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.octMix||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.tremOn?6:0}}><input type="checkbox" checked={!!dlgData.tremOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{tremOn:e.target.checked}));}} />{"Tremolo"}</label>
            {dlgData.tremOn ? <div>
              <DlgRow label="Speed:" lw={50}><select value={dlgData.tremSpeed||"8"} onChange={function(e){setDlgData(Object.assign({},dlgData,{tremSpeed:e.target.value}));}} style={{flex:1}}><option value="4">{"Quarter"}</option><option value="8">{"Eighth"}</option><option value="8t">{"Eighth triplet"}</option><option value="16">{"16th"}</option></select></DlgRow>
              <DlgRow label="Depth:" lw={50}><input type="range" min={20} max={100} value={dlgData.tremDepth||70} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{tremDepth:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.tremDepth||70)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.adt>0?6:0}}><input type="checkbox" checked={dlgData.adt>0} onChange={function(e){setDlgData(Object.assign({},dlgData,{adt:e.target.checked?(dlgData.adt||50):0}));}} />{"Auto Double Tracking"}</label>
            {dlgData.adt>0 ? <div>
              <DlgRow label="Amount:" lw={60}><input type="range" min={1} max={100} value={dlgData.adt||50} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{adt:+e.target.value}));}} style={{flex:1}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.adt||50)+"%"}</span></DlgRow>
              <div style={{fontSize:10,color:TH.dim,marginTop:2}}>Adds thickness by playing a slightly detuned, delayed copy of each note</div>
            </div> : null}
          </div>
        </div> : null}
        {dlgData.tab==="midi" ? <div>
          <DlgRow label="Pitch Bend:" lw={90}>
            <input type="range" min={-2400} max={2400} value={dlgNumSlider(dlgData.pitchBend,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{pitchBend:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"pitchBend",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"pitchBend",0)} onChange={dlgNumChange(dlgData,setDlgData,"pitchBend")} onBlur={dlgNumBlur(dlgData,setDlgData,"pitchBend",0,-2400,2400)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Modulation:" lw={90}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.modulation,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{modulation:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"modulation",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"modulation",0)} onChange={dlgNumChange(dlgData,setDlgData,"modulation")} onBlur={dlgNumBlur(dlgData,setDlgData,"modulation",0,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Pan:" lw={90}>
            <input type="range" min={0} max={127} value={dlgData.pan!==undefined?dlgData.pan:64} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{pan:+e.target.value}));}} style={{flex:1}} />
            <input type="number" min={0} max={127} value={dlgData.pan!==undefined?dlgData.pan:64} onChange={function(e){setDlgData(Object.assign({},dlgData,{pan:+e.target.value}));}} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Reverb:" lw={90}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.reverb,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{reverb:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"reverb",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"reverb",0)} onChange={dlgNumChange(dlgData,setDlgData,"reverb")} onBlur={dlgNumBlur(dlgData,setDlgData,"reverb",0,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
          <DlgRow label="Chorus:" lw={90}>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.chorus,0)} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{chorus:+e.target.value}));}} style={{flex:1}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"chorus",0)} onFocus={dlgNumFocus(dlgData,setDlgData,"chorus",0)} onChange={dlgNumChange(dlgData,setDlgData,"chorus")} onBlur={dlgNumBlur(dlgData,setDlgData,"chorus",0,0,127)} style={{width:50,marginLeft:4}} />
          </DlgRow>
        </div> : null}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:12}}><DlgBtn o={function(){var s6=JSON.parse(JSON.stringify(song));var ns3=dlgData.numStrings||6;var isDrumNew=dlgData.midiChannel===10;var ms3=[];var ref0=s6.tracks[0];var numM2=ref0?ref0.measures.length:32;for(var mi4=0;mi4<numM2;mi4++){var rm=ref0&&ref0.measures[mi4]?ref0.measures[mi4]:null;var bcount=rm&&rm.beats?rm.beats.length:BPM;var bs4=[];for(var bi4=0;bi4<bcount;bi4++)bs4.push({notes:new Array(ns3).fill(null)});ms3.push({beats:bs4,barLine:rm?rm.barLine||"single":"single",beatsPerMeasure:rm&&rm.beatsPerMeasure!=null?rm.beatsPerMeasure:bcount,globalBeatsPerMeasure:rm&&rm.globalBeatsPerMeasure!=null?rm.globalBeatsPerMeasure:bcount,isATR:rm?!!rm.isATR:false,timeSig:rm&&rm.timeSig?rm.timeSig:{num:4,den:4},staffBreak:rm?rm.staffBreak:false,repeatCount:rm?rm.repeatCount:0});}_undoLabel.current="Add Track";s6.tracks.push({name:dlgData.name||"New",numStrings:ns3,instType:dlgData.instType||"guitar",instrument:isDrumNew?(dlgData.instrument===30?0:dlgData.instrument):dlgData.instrument||25,bank:(dlgData.bank!=null?dlgData.bank:0),isDrum:isDrumNew,midiChannel:dlgData.midiChannel||s6.tracks.length+1,volume:(dlgData.volume!==""&&!isNaN(+dlgData.volume))?+dlgData.volume:96,pan:dlgData.pan!==undefined?dlgData.pan:64,reverb:(dlgData.reverb!==""&&!isNaN(+dlgData.reverb))?+dlgData.reverb:0,chorus:(dlgData.chorus!==""&&!isNaN(+dlgData.chorus))?+dlgData.chorus:0,transpose:dlgData.transpose||0,capo:0,pitchBend:(dlgData.pitchBend!==""&&!isNaN(+dlgData.pitchBend))?+dlgData.pitchBend:0,modulation:(dlgData.modulation!==""&&!isNaN(+dlgData.modulation))?+dlgData.modulation:0,trackVelocity:(dlgData.trackVelocity!==""&&!isNaN(+dlgData.trackVelocity))?+dlgData.trackVelocity:80,trackExpression:(dlgData.trackExpression!==""&&!isNaN(+dlgData.trackExpression))?+dlgData.trackExpression:127,tuning:(dlgData.tuning||STD6).slice(0,ns3),drumMidi:isDrumNew?DMIDI.slice(0,ns3):null,drumLabels:isDrumNew?DLBL.slice(0,ns3):null,muted:false,solo:false,letRing:dlgData.letRing||false,hasTopText:!!dlgData.hasTopText,hasBottomText:!!dlgData.hasBottomText,twelveStringMode:!!dlgData.twelveStringMode,delayOn:!!dlgData.delayOn,delayTime:dlgData.delayTime||"8d",delayTaps:dlgData.delayTaps||3,delayMix:dlgData.delayMix||50,octOn:!!dlgData.octOn,octShift:dlgData.octShift||-12,octDry:dlgData.octDry!=null?dlgData.octDry:100,octMix:dlgData.octMix||50,tremOn:!!dlgData.tremOn,tremSpeed:dlgData.tremSpeed||"8",tremDepth:dlgData.tremDepth||70,maxFret:dlgData.maxFret||24,adt:dlgData.adt||0,measures:ms3});setSong(s6);atiRef.current=s6.tracks.length-1;setAti(s6.tracks.length-1);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="deleteTrack"} title="Delete Track" onClose={closeDlg}>
        <p>{"Delete \"" + (song?song.tracks[ati].name:"") + "\"? This cannot be undone."}</p>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){deleteTrack();closeDlg();}} primary>Delete</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="bars"} title="Add Bars" onClose={closeDlg}>
        <DlgRow label="Bars to add:" lw={80}><input type="number" min={1} max={200} value={dlgData.count||16} onChange={function(e){setDlgData(Object.assign({},dlgData,{count:+e.target.value}));}} style={{width:50}} /></DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){var s8=JSON.parse(JSON.stringify(song));_undoLabel.current="Add Measures";for(var ti3=0;ti3<s8.tracks.length;ti3++){for(var mi5=0;mi5<(dlgData.count||16);mi5++){var bs5=[];for(var bi5=0;bi5<BPM;bi5++)bs5.push({notes:new Array(s8.tracks[ti3].numStrings).fill(null)});s8.tracks[ti3].measures.push({beats:bs5,barLine:"single",beatsPerMeasure:16,globalBeatsPerMeasure:16,isATR:false});}}setSong(s8);closeDlg();}} primary>Add</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="instChange"} title="Instrument Change" onClose={closeDlg}>
        <DlgRow label="Instrument:" lw={70}><select value={dlgData.instrument||0} onChange={function(e){setDlgData(Object.assign({},dlgData,{instrument:+e.target.value}));}} style={{flex:1}}>{(function(){var bnk=song&&song.tracks[ati]?(song.tracks[ati].bank!=null?song.tracks[ati].bank:0):0;if(bnk===0)return GM.map(function(n4,i4){return (<option key={i4} value={i4}>{i4+": "+getSF2PresetName(0,i4)}</option>);});return getSF2PresetsForBank(bnk).map(function(p4){return (<option key={p4} value={p4}>{p4+": "+getSF2PresetName(bnk,p4)}</option>);});})()}</select></DlgRow>
        <DlgRow label="Let Ring:" lw={70}><input type="checkbox" checked={dlgData.letRing||false} onChange={function(e){setDlgData(Object.assign({},dlgData,{letRing:e.target.checked}));}} /></DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){var s9=JSON.parse(JSON.stringify(song));var t3=s9.tracks[ati];var m3=t3.measures[cur.measure];if(m3&&m3.beats[cur.beat]){_undoLabel.current="Instrument Change";m3.beats[cur.beat].trkEffect={type:73,value:dlgData.instrument&0x7F,letRing:dlgData.letRing||false};}setSong(s9);preloadSong(s9.tracks);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="volChange"} title="Volume Change" onClose={closeDlg}>
        <DlgRow label="Volume:" lw={50}><input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"volume",96)} onFocus={dlgNumFocus(dlgData,setDlgData,"volume",96)} onChange={dlgNumChange(dlgData,setDlgData,"volume")} onBlur={dlgNumBlur(dlgData,setDlgData,"volume",96,0,127)} style={{width:50}} /></DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){var sa=JSON.parse(JSON.stringify(song));var ta=sa.tracks[ati];var ma=ta.measures[cur.measure];if(ma&&ma.beats[cur.beat]){_undoLabel.current="Volume Change";ma.beats[cur.beat].trkEffect={type:86,value:(dlgData.volume!==""&&!isNaN(+dlgData.volume))?+dlgData.volume:96};}setSong(sa);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="new"} title="New Song" onClose={closeDlg}>
        <p>{"Create a new blank song? Current work will be lost."}</p>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){newSong();closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="repeatClose"} title="Repeat Close" onClose={closeDlg}>
        <DlgRow label="Repeat:" lw={60}><input type="number" min={2} max={99} value={dlgData.count||2} onChange={function(e){setDlgData(Object.assign({},dlgData,{count:+e.target.value}));}} style={{width:40}} /><span style={{fontSize:11,marginLeft:4}}>{"times"}</span></DlgRow>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){var sr2=JSON.parse(JSON.stringify(song));_undoLabel.current="Repeat";var existing=sr2.tracks[ati].measures[cur.measure]?sr2.tracks[ati].measures[cur.measure].barLine:"single";var newBl2=existing==="repeatStart"?"repeatBoth":"repeatEnd";var newRc=dlgData.count||2;sr2.tracks.forEach(function(tr3){if(cur.measure<tr3.measures.length){tr3.measures[cur.measure].barLine=newBl2;tr3.measures[cur.measure].repeatCount=newRc;}});setSong(sr2);closeDlg();}} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="timeAtCursor"} title="Time at Cursor" onClose={closeDlg}>
        <div style={{textAlign:"center",padding:"10px 0",fontSize:18,fontWeight:"bold",fontFamily:"Consolas,monospace"}}>{dlgData.time||"0:00.00"}</div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}><DlgBtn o={closeDlg} primary>OK</DlgBtn></div>
      </Modal>
      {/* Section nav dropdown */}
      {dlg==="sectionNav" && song && song.sections && <React.Fragment>
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:997}} onClick={closeDlg} />
        <div style={{position:"fixed",left:isMobile?16:undefined,right:isMobile?16:240,bottom:isMobile?32:30,zIndex:998,background:darkMode?"#2a2a2a":"#fff",border:"1px solid "+(darkMode?"#444":"#ccc"),borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",padding:"6px 0",maxHeight:isMobile?"60vh":300,overflowY:"auto",minWidth:160}}>
        {song.sections.map(function(sec,idx){
          var isCur2 = cur.measure >= sec.bar && cur.measure < sec.bar + (sec.bars||1);
          return React.createElement("div",{key:idx,style:{padding:isMobile?"10px 16px":"6px 12px",cursor:"pointer",fontSize:isMobile?13:11,display:"flex",alignItems:"center",gap:8,background:isCur2?(darkMode?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.04)"):"transparent"},
            onClick:function(){setCur({measure:sec.bar,beat:0,string:cur.string});scrollToMeasure(sec.bar);closeDlg();}},
            React.createElement("span",{style:{width:10,height:10,borderRadius:5,background:sec.color||"#3b82f6",flexShrink:0}}),
            React.createElement("span",{style:{flex:1}},sec.name),
            React.createElement("span",{style:{opacity:0.4,fontSize:isMobile?10:9}},("bar "+(sec.bar+1)+"\u2013"+(sec.bar+(sec.bars||1))))
          );
        })}
        {song.sections.length===0&&<div style={{padding:isMobile?"12px 16px":"8px 12px",fontSize:isMobile?13:11,opacity:0.5}}>{"No sections defined"}</div>}
      </div></React.Fragment>}

      {/* Add/edit single section */}
      <Modal show={dlg==="section"} title={dlgData.mode==="edit"?"Edit Section":"Add Section"} onClose={closeDlg}>
        {(function(){
          var overlapName = song ? checkSectionOverlap(song.sections||[], dlgData.bar||0, dlgData.bars||4, dlgData.mode==="edit"?dlgData.editIdx:undefined) : null;
          var beyondEnd = song ? (dlgData.bar||0) + (dlgData.bars||4) > song.tracks[0].measures.length : false;
          return React.createElement(React.Fragment, null,
        React.createElement(DlgRow, {label:"Name:", lw:60}, React.createElement("input", {type:"text", value:dlgData.name||"", onChange:function(e){setDlgData(Object.assign({},dlgData,{name:e.target.value}));}, placeholder:"e.g. Intro, Verse, Chorus", style:{flex:1}})),
        React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}},
          SECTION_PRESETS.map(function(p){return React.createElement("span",{key:p,style:{fontSize:isMobile?11:9,padding:isMobile?"5px 10px":"2px 6px",borderRadius:isMobile?6:3,cursor:"pointer",background:darkMode?"rgba(255,255,255,0.1)":"#eee",color:darkMode?"#ccc":"#444"},onClick:function(){setDlgData(Object.assign({},dlgData,{name:p}));}},p);})),
        React.createElement(DlgRow, {label:"Start bar:", lw:60}, React.createElement("input", {type:"number", value:(dlgData.bar||0)+1, onChange:function(e){var newStart=Math.max(0,(+e.target.value||1)-1);var endBar3=(dlgData.bar||0)+(dlgData.bars||4);var newBars=Math.max(1,endBar3-newStart);setDlgData(Object.assign({},dlgData,{bar:newStart,bars:newBars}));}, min:1, max:song?song.tracks[0].measures.length:999, style:{width:60}})),
        React.createElement(DlgRow, {label:"End bar:", lw:60}, React.createElement("input", {type:"number", value:(dlgData.bar||0)+(dlgData.bars||4), onChange:function(e){var endVal=Math.max((dlgData.bar||0)+1,+e.target.value||1);setDlgData(Object.assign({},dlgData,{bars:endVal-(dlgData.bar||0)}));}, min:(dlgData.bar||0)+1, max:song?song.tracks[0].measures.length:999, style:{width:60}})),
        (overlapName || beyondEnd) ? React.createElement("div", {style:{fontSize:10,padding:"6px 8px",marginTop:6,borderRadius:4,background:darkMode?"rgba(255,80,80,0.15)":"#fff0f0",color:darkMode?"#ff8080":"#c00",border:"1px solid "+(darkMode?"rgba(255,80,80,0.3)":"#fcc")}},
          overlapName ? "\u26A0 Overlaps with "+overlapName : "\u26A0 Section extends beyond end of song"
        ) : null,
        React.createElement(DlgRow, {label:"Color:", lw:60},
          React.createElement("div", {style:{display:"flex",gap:4,flexWrap:"wrap"}}, SECTION_COLORS.map(function(c2){return React.createElement("span",{key:c2.color,style:{width:20,height:20,borderRadius:4,background:c2.color,cursor:"pointer",border:dlgData.color===c2.color?"2px solid "+(darkMode?"#fff":"#000"):"2px solid transparent"},onClick:function(){setDlgData(Object.assign({},dlgData,{color:c2.color}));}});}))),
        React.createElement("div", {style:{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}},
          React.createElement(DlgBtn, {o:function(){
            if (overlapName) { setStatus("Cannot save — overlaps with "+overlapName); return; }
            var s9=JSON.parse(JSON.stringify(song));
            if(!s9.sections)s9.sections=[];
            var name2=(dlgData.name||"").trim()||"Section";
            var secBars2=Math.max(1,Math.min(dlgData.bars||4,s9.tracks[0].measures.length-(dlgData.bar||0)));
            if(dlgData.mode==="edit"&&dlgData.editIdx!=null){
              s9.sections[dlgData.editIdx]={bar:dlgData.bar||0,name:name2,color:dlgData.color||"#3b82f6",bars:secBars2};
            }else{
              s9.sections.push({bar:dlgData.bar||0,name:name2,color:dlgData.color||"#3b82f6",bars:secBars2});
            }
            s9.sections.sort(function(a,b){return a.bar-b.bar;});
            var rt=dlgData.returnTo;
            _undoLabel.current="Section";setSong(s9);closeDlg();setStatus(dlgData.mode==="edit"?"Section updated":"Section added: "+name2);
            if(rt==="editSections")openDlg("editSections",{sections:JSON.parse(JSON.stringify(s9.sections))});
          }, primary:true, disabled:!!overlapName||!!beyondEnd}, dlgData.mode==="edit"?"Save":"Add"),
          dlgData.mode==="edit" ? React.createElement(DlgBtn, {o:function(){var s10=JSON.parse(JSON.stringify(song));var rt2=dlgData.returnTo;if(s10.sections&&dlgData.editIdx!=null){s10.sections.splice(dlgData.editIdx,1);}setSong(s10);closeDlg();setStatus("Section deleted");if(rt2==="editSections")openDlg("editSections",{sections:JSON.parse(JSON.stringify(s10.sections))});}}, "Delete") : null,
          React.createElement(DlgBtn, {o:function(){var rt3=dlgData.returnTo;closeDlg();if(rt3==="editSections")openDlg("editSections",{sections:JSON.parse(JSON.stringify(song.sections||[]))});}}, "Cancel")
        )
          );
        })()}
      </Modal>

      {/* Arrangement / Edit Sections */}
      <Modal show={dlg==="editSections"} title="Arrangement" onClose={closeDlg}>
        {(function(){
          var secs = song ? (song.sections || []) : [];
          if (secs.length === 0) return React.createElement("div",{style:{fontSize:11,opacity:0.5,padding:"12px 0",textAlign:"center"}},
            React.createElement("div",null,"No sections defined yet."),
            React.createElement("div",{style:{marginTop:6}},"Use the section strip above the ruler to add one.")
          );
          function doRefresh(s) { setDlgData(Object.assign({},dlgData,{sections:JSON.parse(JSON.stringify(s.sections||[])),menuIdx:undefined})); }
          var menuIdx = dlgData.menuIdx;
          return React.createElement("div",{style:{maxHeight:isMobile?"60vh":350,overflowY:"auto",position:"relative"}},
            secs.map(function(sec2, idx2) {
              var secBars3 = sec2.bars || 1;
              return React.createElement("div",{key:idx2,style:{display:"flex",alignItems:"center",gap:isMobile?8:6,padding:isMobile?"10px 4px":"6px 4px",borderBottom:"1px solid "+(darkMode?"#333":"#eee")}},
                // Move arrows
                React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:1,flexShrink:0}},
                  React.createElement("span",{style:{fontSize:isMobile?12:10,cursor:idx2>0?"pointer":"default",opacity:idx2>0?0.6:0.15,lineHeight:1,padding:"2px"},
                    onClick:function(){
                      if(idx2===0)return;
                      var s11=JSON.parse(JSON.stringify(song));
                      var curS=s11.sections[idx2],prevS=s11.sections[idx2-1];
                      var cb2=curS.bars||1;
                      for(var ti=0;ti<s11.tracks.length;ti++){var ext=s11.tracks[ti].measures.splice(curS.bar,cb2);s11.tracks[ti].measures.splice(prevS.bar,0,...ext);}
                      curS.bar=prevS.bar;prevS.bar=prevS.bar+cb2;
                      s11.sections.sort(function(a,b){return a.bar-b.bar;});
                      setSong(s11);doRefresh(s11);setStatus("Moved "+curS.name+" up");
                    }},"\u25B2"),
                  React.createElement("span",{style:{fontSize:isMobile?12:10,cursor:idx2<secs.length-1?"pointer":"default",opacity:idx2<secs.length-1?0.6:0.15,lineHeight:1,padding:"2px"},
                    onClick:function(){
                      if(idx2>=secs.length-1)return;
                      var s12=JSON.parse(JSON.stringify(song));
                      var curS2=s12.sections[idx2],nextS=s12.sections[idx2+1];
                      var nb2=nextS.bars||1;
                      for(var ti2=0;ti2<s12.tracks.length;ti2++){var ext2=s12.tracks[ti2].measures.splice(nextS.bar,nb2);s12.tracks[ti2].measures.splice(curS2.bar,0,...ext2);}
                      curS2.bar=curS2.bar+nb2;nextS.bar=curS2.bar-nb2;
                      s12.sections.sort(function(a,b){return a.bar-b.bar;});
                      setSong(s12);doRefresh(s12);setStatus("Moved "+curS2.name+" down");
                    }},"\u25BC")
                ),
                // Color dot
                React.createElement("span",{style:{width:10,height:10,borderRadius:5,background:sec2.color||"#3b82f6",flexShrink:0}}),
                // Name and bar info
                React.createElement("div",{style:{flex:1,minWidth:0}},
                  React.createElement("div",{style:{fontSize:isMobile?13:11,fontWeight:"600",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},sec2.name),
                  React.createElement("div",{style:{fontSize:isMobile?10:9,opacity:0.45}},secBars3+" bar"+(secBars3!==1?"s":"")+" ("+( sec2.bar+1)+"\u2013"+(sec2.bar+secBars3)+")")
                ),
                // ⋮ overflow menu
                React.createElement("div",{style:{position:"relative",flexShrink:0}},
                  React.createElement("span",{style:{fontSize:isMobile?18:14,cursor:"pointer",padding:isMobile?"6px 8px":"2px 6px",opacity:0.4,lineHeight:1,display:"block"},
                    onClick:function(ev){
                      var rect=ev.currentTarget.getBoundingClientRect();
                      setDlgData(Object.assign({},dlgData,{menuIdx:menuIdx===idx2?undefined:idx2,menuX:rect.right,menuY:rect.top}));
                    }
                  },"\u22EE"),
                  menuIdx===idx2?React.createElement(React.Fragment,null,
                    React.createElement("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:998},onClick:function(){setDlgData(Object.assign({},dlgData,{menuIdx:undefined}));}}),
                    React.createElement("div",{style:{position:"fixed",
                      right:Math.max(8,window.innerWidth-(dlgData.menuX||0)),
                      top:((dlgData.menuY||0)+140>window.innerHeight)?(dlgData.menuY||0)-140:((dlgData.menuY||0)),
                      zIndex:999,background:darkMode?"#333":"#fff",border:"1px solid "+(darkMode?"#555":"#ddd"),borderRadius:6,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",padding:"4px 0",minWidth:130}},
                      [{label:"Edit",action:function(){
                        var sec4=secs[idx2];
                        openDlg("section",{mode:"edit",editIdx:idx2,name:sec4.name,color:sec4.color,bar:sec4.bar,bars:sec4.bars||1,returnTo:"editSections"});
                      }},{label:"Duplicate",action:function(){
                        var s13=JSON.parse(JSON.stringify(song));var sec3=s13.sections[idx2];var bc=sec3.bars||1;var ins=sec3.bar+bc;
                        for(var ti3=0;ti3<s13.tracks.length;ti3++){var dup2=JSON.parse(JSON.stringify(s13.tracks[ti3].measures.slice(sec3.bar,ins)));s13.tracks[ti3].measures.splice(ins,0,...dup2);}
                        for(var si4=0;si4<s13.sections.length;si4++){if(s13.sections[si4].bar>=ins)s13.sections[si4].bar+=bc;}
                        s13.sections.push({bar:ins,name:sec3.name+" (copy)",color:sec3.color,bars:bc});
                        s13.sections.sort(function(a,b){return a.bar-b.bar;});
                        setSong(s13);doRefresh(s13);setStatus("Duplicated "+sec3.name);
                      }},{label:"Remove marker",sub:"Keep bars",action:function(){
                        var s15=JSON.parse(JSON.stringify(song));s15.sections.splice(idx2,1);
                        setSong(s15);doRefresh(s15);setStatus("Removed section marker (bars kept)");
                      }},{label:"Delete",sub:"Remove bars",color:darkMode?"#ff6666":"#cc3333",action:function(){
                        var sec5=secs[idx2];var bc2=sec5.bars||1;
                        if(!confirm("Delete \""+sec5.name+"\" and its "+bc2+" bar(s)? Notes will be lost."))return;
                        var s14=JSON.parse(JSON.stringify(song));
                        if(s14.tracks[0].measures.length-bc2<1){setStatus("Cannot delete all bars");return;}
                        var db=s14.sections[idx2].bar;
                        for(var ti4=0;ti4<s14.tracks.length;ti4++){s14.tracks[ti4].measures.splice(db,bc2);}
                        s14.sections.splice(idx2,1);
                        for(var si5=0;si5<s14.sections.length;si5++){if(s14.sections[si5].bar>=db)s14.sections[si5].bar=Math.max(0,s14.sections[si5].bar-bc2);}
                        setSong(s14);doRefresh(s14);setStatus("Deleted "+sec5.name+" ("+bc2+" bars)");
                      }}].map(function(item,mi){
                        return React.createElement("div",{key:mi,style:{padding:isMobile?"8px 14px":"5px 12px",cursor:"pointer",fontSize:isMobile?13:11,
                          color:item.color||(darkMode?"#ddd":"#333"),display:"flex",flexDirection:"column"},
                          onClick:function(){item.action();},
                          onMouseEnter:function(e){e.currentTarget.style.background=darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)";},
                          onMouseLeave:function(e){e.currentTarget.style.background="transparent";}},
                          React.createElement("span",null,item.label),
                          item.sub?React.createElement("span",{style:{fontSize:isMobile?9:8,opacity:0.5}},item.sub):null
                        );
                      })
                    )
                  ):null
                )
              );
            })
          );
        })()}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}>
          <DlgBtn o={closeDlg}>Close</DlgBtn>
        </div>
      </Modal>

      {/* Chord Builder dialog */}
      <Modal show={dlg==="chord"} title="Chord Builder" onClose={closeDlg}>
        {(function(){
          var dd=dlgData, sd=setDlgData;
          var root=dd.root||0, qualIdx=dd.qualIdx||0, bass=dd.bass||"root", posIdx=dd.posIdx||0;
          var qual=CHORD_QUALS[qualIdx]||CHORD_QUALS[0];
          var tuning=dd.tuning||[40,45,50,55,59,64];
          var numStr=dd.numStrings||6;
          var voicings=generateVoicings(root,qual,tuning,{bass:bass});
          var selV=voicings[posIdx]||voicings[0]||null;
          var chordName=NOTE_NAMES[root%12]+" "+qual.name;
          var isPower=qual.tones.length<=2;
          var prog=dd.progression||[];
          var fill=dd.fill||"strum";
          var bpc=dd.bpc||1;
          var step=dd.step||4; // quarter=4, eighth=2, 16th=1, half=8, whole=16
          var cyc=fill==="chug"?(dd.cyc||1):1;
          var cpb=dd.cpb||1;
          var curTs=getTimeSig(song.tracks[ati].measures[cur.measure]);
          var qBeats=Math.round(curTs.num*(4/curTs.den));

          function upd(o){var nd=Object.assign({},dd,o);var nq=CHORD_QUALS[nd.qualIdx||0]||CHORD_QUALS[0];if(nq.tones.length<=2)nd.bass="root";var nv=generateVoicings(nd.root||0,nq,nd.tuning||tuning,{bass:nd.bass||"root"});nd.posIdx=Math.min(nd.posIdx||0,Math.max(0,nv.length-1));sd(nd);}
          var lbl={fontSize:isMobile?11:10,opacity:0.5,marginBottom:3,marginTop:8};
          var drp={fontSize:isMobile?14:12,padding:isMobile?"8px 6px":"4px 4px",borderRadius:4,border:"1px solid "+(darkMode?"#555":"#ccc"),background:darkMode?"#2a2a2a":"#fff",color:darkMode?"#ddd":"#333"};

          function addToProg(){if(!selV)return;var np=prog.slice();np.push({root:root,qualIdx:qualIdx,name:chordName,posIdx:posIdx,bass:bass,frets:selV.frets.slice(),minFret:selV.minFret});sd(Object.assign({},dd,{progression:np}));}
          function removeProg(idx){var np=prog.slice();np.splice(idx,1);sd(Object.assign({},dd,{progression:np}));}

          // Shared fill builder
          function buildFill(measure,entries,fillMode,ns2,stp,ncyc){
            // entries: single entry {frets:[...]} OR array [{frets:[...], start:0, end:8}, ...]
            if(!Array.isArray(entries))entries=[{frets:entries.frets,start:0,end:measure.beats.length}];
            function entryAt(pos){for(var ei=entries.length-1;ei>=0;ei--){if(pos>=entries[ei].start)return entries[ei];}return entries[0];}
            function notesFor(entry){var arpN=[];for(var ai=0;ai<ns2;ai++){if(entry.frets[ai]>=0)arpN.push({str:ai,fret:entry.frets[ai]});}return arpN;}

            var totalBeats=measure.beats.length;
            var segLen=Math.floor(totalBeats/ncyc);

            for(var cyci=0;cyci<ncyc;cyci++){
              var segStart=cyci*segLen;
              var segEnd=cyci===ncyc-1?totalBeats:segStart+segLen;
              var beats=[];for(var bi0=segStart;bi0<segEnd;bi0+=stp){beats.push(bi0);}
              if(beats.length===0)continue;

              // Track chord changes to reset pattern cycle
              var _lastEn=null,_cycIdx=0;
              function _advCyc(en){if(en!==_lastEn){_cycIdx=0;_lastEn=en;}var ci=_cycIdx;_cycIdx++;return ci;}

              if(fillMode==="strum"){
                for(var bi=0;bi<beats.length;bi++){var bp=beats[bi];var en=entryAt(bp);for(var si=0;si<ns2;si++){if(en.frets[si]===-1){measure.beats[bp].notes[si]=null;}else{measure.beats[bp].notes[si]={fret:en.frets[si],attack:true,effect:0};}}}
              } else if(fillMode==="arp_down"||fillMode==="arp_up"){
                _lastEn=null;_cycIdx=0;
                for(var bi2=0;bi2<beats.length;bi2++){var en2=entryAt(beats[bi2]);var ci2=_advCyc(en2);var aN=notesFor(en2);var seq2=aN.slice();if(fillMode==="arp_down")seq2.reverse();if(seq2.length>0){var an=seq2[ci2%seq2.length];measure.beats[beats[bi2]].notes[an.str]={fret:an.fret,attack:true,effect:0};}}
              } else if(fillMode==="arp_alt"||fillMode==="arp_alt_up"){
                // With multiple chords: direction alternates per chord (wave across bar)
                // With single chord: bounce within bar (existing behavior)
                var _altLastEn=null,_altCycIdx=0,_altChordNum=0;
                for(var bi3=0;bi3<beats.length;bi3++){
                  var en3=entryAt(beats[bi3]);
                  if(en3!==_altLastEn){_altCycIdx=0;_altLastEn=en3;_altChordNum++;}
                  var aN2=notesFor(en3);
                  var multiChord=entries.length>1;
                  if(multiChord){
                    // Alternate direction per chord: even chords go initial dir, odd chords go opposite
                    var goReverse=(fillMode==="arp_alt")?(_altChordNum%2===1):(_altChordNum%2===0);
                    var seq3=aN2.slice();if(goReverse)seq3.reverse();
                    if(seq3.length>0){var an2=seq3[_altCycIdx%seq3.length];measure.beats[beats[bi3]].notes[an2.str]={fret:an2.fret,attack:true,effect:0};}
                  } else {
                    // Single chord: bounce within bar
                    var alt=[];
                    if(fillMode==="arp_alt"){if(aN2.length>1){for(var a1=aN2.length-1;a1>=0;a1--)alt.push(aN2[a1]);for(var a2=1;a2<aN2.length-1;a2++)alt.push(aN2[a2]);}else alt=aN2.slice();}
                    else{if(aN2.length>1){for(var a3=0;a3<aN2.length;a3++)alt.push(aN2[a3]);for(var a4=aN2.length-2;a4>0;a4--)alt.push(aN2[a4]);}else alt=aN2.slice();}
                    if(alt.length>0){var an2b=alt[_altCycIdx%alt.length];measure.beats[beats[bi3]].notes[an2b.str]={fret:an2b.fret,attack:true,effect:0};}
                  }
                  _altCycIdx++;
                }
              } else if(fillMode==="fp_pima"||fillMode==="fp_pimi"||fillMode==="fp_travis"){
                _lastEn=null;_cycIdx=0;
                for(var bi4=0;bi4<beats.length;bi4++){var en4=entryAt(beats[bi4]);var ci4=_advCyc(en4);var aN3=notesFor(en4);var bN=aN3.slice(0,Math.min(2,aN3.length));var tN=aN3.length>2?aN3.slice(aN3.length-3):aN3.slice();var fp;
                  if(fillMode==="fp_pima"){fp=[bN[0]||aN3[0]];if(tN.length>=3){fp.push(tN[0],tN[1],tN[2]);}else if(tN.length===2){fp.push(tN[0],tN[1],tN[0]);}else{fp.push(aN3[aN3.length>1?1:0]);}}
                  else if(fillMode==="fp_pimi"){fp=[bN[0]||aN3[0]];if(tN.length>=2){fp.push(tN[0],tN[1],tN[0]);}else{fp.push(aN3[aN3.length>1?1:0]);}}
                  else{var b1=bN[0]||aN3[0],b2=bN.length>1?bN[1]:b1;var t1=tN.length>=3?tN[0]:(aN3.length>2?aN3[2]:aN3[aN3.length>1?1:0]);var t2=tN.length>=3?tN[1]:t1;var t3=tN.length>=3?tN[2]:t1;fp=[b1,t1,b2,t2,b1,t1,b2,t3];}
                  if(fp){var an3=fp[ci4%fp.length];if(an3)measure.beats[beats[bi4]].notes[an3.str]={fret:an3.fret,attack:true,effect:0};}}
              } else if(fillMode==="chug"){
                // Full chord on first beat, chug (low strings) on rest
                // At chord boundaries, re-accent with the new chord
                var lastEntry=null;
                for(var bi5=0;bi5<beats.length;bi5++){
                  var en5=entryAt(beats[bi5]);var aN4=notesFor(en5);
                  var isNewChord=(bi5===0||en5!==lastEntry);
                  lastEntry=en5;
                  if(isNewChord){
                    for(var sc=0;sc<ns2;sc++){if(en5.frets[sc]===-1){measure.beats[beats[bi5]].notes[sc]=null;}else{measure.beats[beats[bi5]].notes[sc]={fret:en5.frets[sc],attack:true,effect:0};}}
                  } else {
                    var chugN=aN4.slice(0,Math.min(2,aN4.length));
                    for(var ci2=0;ci2<chugN.length;ci2++){measure.beats[beats[bi5]].notes[chugN[ci2].str]={fret:chugN[ci2].fret,attack:true,effect:0};}
                  }
                }
              } else {
                var en6=entryAt(beats[0]);for(var si2=0;si2<ns2;si2++){if(en6.frets[si2]===-1){measure.beats[beats[0]].notes[si2]=null;}else{measure.beats[beats[0]].notes[si2]={fret:en6.frets[si2],attack:true,effect:0};}}
              }
            }
          }

          function doInsert(){
            var s9=JSON.parse(JSON.stringify(song));var tr=s9.tracks[ati];
            if(prog.length===0){
              if(!selV)return;
              buildFill(tr.measures[cur.measure],{frets:selV.frets,start:0,end:tr.measures[cur.measure].beats.length},fill,numStr,step,cyc);
              setSong(s9);closeDlg();setStatus("Inserted "+chordName);
            } else {
              var startBar=cur.measure;var totalBars=Math.ceil(prog.length/cpb);
              while(tr.measures.length<startBar+totalBars){var tmpl=JSON.parse(JSON.stringify(tr.measures[tr.measures.length-1]));tmpl.beats.forEach(function(b){b.notes=b.notes.map(function(){return null;});});tr.measures.push(tmpl);}
              for(var bi2=0;bi2<totalBars;bi2++){
                var m=tr.measures[startBar+bi2];
                var barEntries=[];
                for(var ci3=0;ci3<cpb;ci3++){
                  var pi2=bi2*cpb+ci3;if(pi2>=prog.length)break;
                  var segSize=Math.floor(m.beats.length/cpb);
                  barEntries.push({frets:prog[pi2].frets,start:ci3*segSize,end:ci3===cpb-1?m.beats.length:ci3*segSize+segSize});
                }
                buildFill(m,barEntries.length===1?barEntries[0]:barEntries,fill,numStr,step,cyc);
              }
              setSong(s9);closeDlg();setStatus("Inserted "+prog.length+" chords ("+totalBars+" bar"+(totalBars!==1?"s":"")+")");
            }
          }

          function doPreviewChord(){
            if(!selV)return;var tr2=song.tracks[ati];var pr2=tr2.instrument||0,bk2=tr2.bank!=null?tr2.bank:0,ch2=tr2.midiChannel||1;
            for(var p2=0;p2<numStr;p2++){if(selV.frets[p2]>=0){synthOn(ch2,tuning[p2]+selV.frets[p2]+(tr2.capo||0)+(tr2.transpose||0),80,pr2,1.5,false,bk2);}}
          }

          function doPreviewProg(){
            var items=prog.length>0?prog:[{frets:selV?selV.frets:[]}];
            var tr2=song.tracks[ati];var pr2=tr2.instrument||0,bk2=tr2.bank!=null?tr2.bank:0,ch2=tr2.midiChannel||1;
            var capo2=tr2.capo||0,trans2=tr2.transpose||0;
            var beatsPerBar=song.tracks[ati].measures[cur.measure].beats.length;
            var beatDur=60/(song.tempo||120)/4;
            var barDur=beatsPerBar*beatDur;
            items.forEach(function(entry,ci){
              var arpN=[];for(var ai=0;ai<numStr;ai++){if(entry.frets[ai]>=0)arpN.push({str:ai,fret:entry.frets[ai]});}
              var bassN=arpN.slice(0,Math.min(2,arpN.length));
              var trebN=arpN.length>2?arpN.slice(arpN.length-3):arpN.slice();
              var posInBar2=ci%cpb;
              var segSize2=Math.floor(beatsPerBar/cpb);
              var chordStart=posInBar2*segSize2;
              var chordEnd=posInBar2===cpb-1?beatsPerBar:chordStart+segSize2;
              var chordBeats=chordEnd-chordStart;
              var segLen2=Math.floor(chordBeats/cyc);
              var seq=[];
              for(var cyci2=0;cyci2<cyc;cyci2++){
                var sStart=chordStart+cyci2*segLen2;
                var sEnd=cyci2===cyc-1?chordEnd:sStart+segLen2;
                var sBeats=[];for(var sb2=sStart;sb2<sEnd;sb2+=step){sBeats.push(sb2);}
                var nSt=sBeats.length;
                if(fill==="strum"){for(var b=0;b<nSt;b++)seq.push({pos:sBeats[b],notes:arpN.slice()});}
                else if(fill==="arp_down"){var rev=arpN.slice().reverse();for(var b2=0;b2<nSt;b2++)seq.push({pos:sBeats[b2],notes:[rev[b2%rev.length]]});}
                else if(fill==="arp_up"){for(var b3=0;b3<nSt;b3++)seq.push({pos:sBeats[b3],notes:[arpN[b3%arpN.length]]});}
                else if(fill==="arp_alt"){var alt2=[];if(arpN.length>1){for(var x1=arpN.length-1;x1>=0;x1--)alt2.push(arpN[x1]);for(var x2=1;x2<arpN.length-1;x2++)alt2.push(arpN[x2]);}else{alt2=arpN.slice();}for(var b4=0;b4<nSt;b4++)seq.push({pos:sBeats[b4],notes:[alt2[b4%alt2.length]]});}
                else if(fill==="arp_alt_up"){var alt3b=[];if(arpN.length>1){for(var x3=0;x3<arpN.length;x3++)alt3b.push(arpN[x3]);for(var x4=arpN.length-2;x4>0;x4--)alt3b.push(arpN[x4]);}else{alt3b=arpN.slice();}for(var b4b=0;b4b<nSt;b4b++)seq.push({pos:sBeats[b4b],notes:[alt3b[b4b%alt3b.length]]});}
                else if(fill==="fp_pima"){var fp=[bassN[0]||arpN[0],trebN[0]||arpN[0],trebN.length>1?trebN[1]:trebN[0],trebN.length>2?trebN[2]:trebN[0]];for(var b5=0;b5<nSt;b5++)seq.push({pos:sBeats[b5],notes:[fp[b5%fp.length]]});}
                else if(fill==="fp_pimi"){var fp2=[bassN[0]||arpN[0],trebN[0]||arpN[0],trebN.length>1?trebN[1]:trebN[0],trebN[0]||arpN[0]];for(var b6=0;b6<nSt;b6++)seq.push({pos:sBeats[b6],notes:[fp2[b6%fp2.length]]});}
                else if(fill==="fp_travis"){var b1t=bassN[0]||arpN[0],b2t=bassN.length>1?bassN[1]:b1t;var t1t=trebN[0]||arpN[0],t2t=trebN.length>1?trebN[1]:t1t;var tv2=[b1t,t1t,b2t,t2t];for(var b7=0;b7<nSt;b7++)seq.push({pos:sBeats[b7],notes:[tv2[b7%tv2.length]]});}
                else if(fill==="chug"){seq.push({pos:sBeats[0],notes:arpN.slice()});var chugP=arpN.slice(0,Math.min(2,arpN.length));for(var b8=1;b8<nSt;b8++)seq.push({pos:sBeats[b8],notes:chugP});}
                else{seq.push({pos:sBeats[0],notes:arpN.slice()});for(var b9=1;b9<nSt;b9++)seq.push({pos:sBeats[b9],notes:[]});}
              }
              // Play the sequence
              var barIdx2=Math.floor(ci/cpb);var posInBar2=ci%cpb;
              var segSize2=Math.floor(beatsPerBar/cpb);
              var chordOffset=barIdx2*barDur+posInBar2*segSize2*beatDur;
              seq.forEach(function(item){
                  var relPos=item.pos-(posInBar2*segSize2);
                  setTimeout(function(){
                    item.notes.forEach(function(n){synthOn(ch2,tuning[n.str]+n.fret+capo2+trans2,80,pr2,step*beatDur*1.2,false,bk2);});
                  },chordOffset*1000+relPos*beatDur*1000);
                });
            });
          }

          return React.createElement(React.Fragment, null,
            // Chord selector row
            React.createElement("div",{style:{display:"flex",gap:isMobile?8:8,maxWidth:"100%"}},
              React.createElement("div",{style:{flex:1,minWidth:0}},React.createElement("div",{style:lbl},"Root"),
                React.createElement("select",{value:root,onChange:function(e){upd({root:+e.target.value});},style:Object.assign({},drp,{width:"100%"})},
                  NOTE_NAMES.map(function(n,ni){return React.createElement("option",{key:ni,value:ni},n);}))),
              React.createElement("div",{style:{flex:2}},React.createElement("div",{style:lbl},"Quality"),
                React.createElement("select",{value:qualIdx,onChange:function(e){upd({qualIdx:+e.target.value,posIdx:0});},style:Object.assign({},drp,{width:"100%"})},
                  CHORD_QUALS.map(function(q,qi){return React.createElement("option",{key:qi,value:qi},q.name);}))),
              React.createElement("div",{style:{flex:1}},React.createElement("div",{style:lbl},"Bass"),
                qual.tones.length<=2?
                  React.createElement("select",{value:"root",disabled:true,style:Object.assign({},drp,{width:"100%",opacity:0.5})},React.createElement("option",{value:"root"},"Root")):
                  React.createElement("select",{value:bass==="any"?"root":bass,onChange:function(e){upd({bass:e.target.value,posIdx:0});},style:Object.assign({},drp,{width:"100%"})},
                    React.createElement("option",{value:"root"},"Root"),React.createElement("option",{value:"1st"},"1st inv"),React.createElement("option",{value:"2nd"},"2nd inv")))
            ),
            // Voicing selector row with buttons
            React.createElement("div",{style:{display:"flex",gap:6,marginTop:8,alignItems:"flex-end"}},
              React.createElement("div",{style:{flex:1,minWidth:0}},
                React.createElement("div",{style:lbl},"Voicing"),
                voicings.length>0?(function(){
                  var posCount={},posTotals={};
                  voicings.forEach(function(v2){var pk=(v2.minFret===0||v2.frets.indexOf(0)>=0)?"Open":"Fret "+v2.minFret;if(!posTotals[pk])posTotals[pk]=0;posTotals[pk]++;});
                  var posIdx2={};
                  return React.createElement("select",{value:posIdx,onChange:function(e){upd({posIdx:+e.target.value});},style:Object.assign({},drp,{width:"100%"})},
                    voicings.map(function(v2,vi){
                      var pk=(v2.minFret===0||v2.frets.indexOf(0)>=0)?"Open":"Fret "+v2.minFret;
                      if(!posIdx2[pk])posIdx2[pk]=0;posIdx2[pk]++;
                      var txt=pk;
                      if(posTotals[pk]>1)txt+=" (voicing "+posIdx2[pk]+")";
                      if(isPower){var sc2=0;for(var ci3=0;ci3<v2.frets.length;ci3++){if(v2.frets[ci3]>=0)sc2++;}txt+=" \u2013 "+sc2+" note";}
                      return React.createElement("option",{key:vi,value:vi},txt);
                    })
                  );
                })():React.createElement("div",{style:{fontSize:11,opacity:0.5}},"No voicings")
              ),
              React.createElement("span",{style:{fontSize:isMobile?10:9,cursor:"pointer",padding:isMobile?"7px 9px":"4px 7px",borderRadius:4,
                border:"1px solid "+(darkMode?"#555":"#ccc"),color:darkMode?"#ccc":"#444",whiteSpace:"nowrap",flexShrink:0,boxSizing:"border-box",lineHeight:"1"},
                onClick:doPreviewChord},"\u25B6"),
              React.createElement("span",{style:{fontSize:isMobile?11:10,cursor:"pointer",padding:isMobile?"6px 8px":"3px 6px",borderRadius:4,
                background:darkMode?"#3264dc":"#2252cc",color:"#fff",fontWeight:"600",whiteSpace:"nowrap",flexShrink:0,boxSizing:"border-box",lineHeight:"1.2"},
                onClick:addToProg},"\u002B Progression")
            ),
            // Diagram + Tab preview centered
            selV?React.createElement("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",gap:isMobile?8:10,marginTop:8,padding:"8px 4px",
              background:darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)",borderRadius:6,border:"1px solid "+(darkMode?"#333":"#eee")}},
              // Chord finger diagram
              (function(){
                var fg=selV.fingering||{fingers:{},barre:null};var fingers=fg.fingers||{};var barre=fg.barre;
                var minFr=selV.minFret||0;var startFret=minFr<=1?1:minFr;var numFrets=4;
                var cw=isMobile?24:20,ch2=isMobile?24:20,topPad=isMobile?16:14,pad=topPad+12;
                var totalW=topPad*2+(numStr-1)*cw+12,totalH=pad+numFrets*ch2+20;var isOpenPos=startFret===1;
                var svgEls=[];
                if(isOpenPos){svgEls.push(React.createElement("line",{key:"nut",x1:pad-1,y1:pad,x2:pad+(numStr-1)*cw+1,y2:pad,stroke:darkMode?"#ccc":"#333",strokeWidth:3}));}
                else{svgEls.push(React.createElement("text",{key:"fn2",x:pad-6,y:pad+ch2/2+4,fontSize:isMobile?10:8,fill:darkMode?"#999":"#666",textAnchor:"end"},startFret));}
                for(var fi2=0;fi2<=numFrets;fi2++){svgEls.push(React.createElement("line",{key:"f"+fi2,x1:pad,y1:pad+fi2*ch2,x2:pad+(numStr-1)*cw,y2:pad+fi2*ch2,stroke:darkMode?"#555":"#ccc",strokeWidth:1}));}
                for(var si4=0;si4<numStr;si4++){svgEls.push(React.createElement("line",{key:"s"+si4,x1:pad+si4*cw,y1:pad,x2:pad+si4*cw,y2:pad+numFrets*ch2,stroke:darkMode?"#666":"#aaa",strokeWidth:1}));}
                for(var si5=0;si5<numStr;si5++){var fr=selV.frets[si5];var sx=pad+si5*cw;
                  if(fr===-1){svgEls.push(React.createElement("text",{key:"x"+si5,x:sx,y:pad-4,fontSize:isMobile?10:8,fill:darkMode?"#888":"#999",textAnchor:"middle",fontWeight:"600"},"x"));}
                  else if(fr===0){svgEls.push(React.createElement("circle",{key:"o"+si5,cx:sx,cy:pad-7,r:isMobile?4:3.5,fill:"none",stroke:darkMode?"#888":"#666",strokeWidth:1.5}));}
                  else{var dy=pad+(fr-startFret+0.5)*ch2;if(dy>pad&&dy<pad+numFrets*ch2+ch2/2){
                    var fn3=fingers[si5];var isB=barre&&si5>=barre.from&&si5<=barre.to&&fr===barre.fret;
                    if(!isB){svgEls.push(React.createElement("circle",{key:"d"+si5,cx:sx,cy:dy,r:isMobile?8:6,fill:darkMode?"#ddd":"#333"}));
                    if(fn3)svgEls.push(React.createElement("text",{key:"t"+si5,x:sx,y:dy+(isMobile?4:3),fontSize:isMobile?10:8,fill:darkMode?"#222":"#fff",textAnchor:"middle",fontWeight:"600"},fn3));}}}}
                if(barre){var bx1=pad+barre.from*cw,bx2=pad+barre.to*cw,by2=pad+(barre.fret-startFret+0.5)*ch2;
                  svgEls.push(React.createElement("rect",{key:"br",x:bx1-(isMobile?7:5),y:by2-(isMobile?7:5),width:bx2-bx1+(isMobile?14:10),height:isMobile?14:10,rx:isMobile?7:5,fill:darkMode?"#ddd":"#333"}));
                  var barreFn=fingers[barre.from]||1;
                  svgEls.push(React.createElement("text",{key:"bf",x:(bx1+bx2)/2,y:by2+(isMobile?4:3),fontSize:isMobile?10:8,fill:darkMode?"#222":"#fff",textAnchor:"middle",fontWeight:"600"},barreFn));}
                for(var si6=0;si6<numStr;si6++){svgEls.push(React.createElement("text",{key:"sn"+si6,x:pad+si6*cw,y:pad+numFrets*ch2+12,fontSize:isMobile?8:7,fill:darkMode?"#777":"#999",textAnchor:"middle"},NOTE_NAMES[tuning[si6]%12]));}
                return React.createElement("svg",{key:"diag",width:totalW,height:totalH,style:{flexShrink:0}},svgEls);
              })(),
              // Tab preview
              React.createElement("div",{key:"tab",style:{display:"flex",flexDirection:"column",justifyContent:"center"}},
                React.createElement("div",{style:{fontSize:isMobile?12:10,fontWeight:"600",marginBottom:4,textAlign:"center"}},chordName),
                React.createElement("div",{style:{fontFamily:"'Courier New',monospace",fontSize:isMobile?12:10,lineHeight:isMobile?1.5:1.4}},
                  tuning.slice().reverse().map(function(t,ti2){
                    var si8=numStr-1-ti2;
                    var fret=selV.frets[si8];
                    var strName=NOTE_NAMES[t%12];
                    var pad2=strName.length<2?" ":"";
                    return React.createElement("div",{key:ti2,style:{opacity:fret===-1?0.2:1,whiteSpace:"pre"}},
                      pad2+strName+" \u2502"+(fret===-1?"\u2500\u2500\u2500":(fret<10?"\u2500"+fret+"\u2500":""+fret+"\u2500"))+"\u2502");
                  })
                )
              ),
            ):null,
            // Progression list (only shows when chords added)
            prog.length>0?React.createElement("div",{style:{marginTop:10,borderTop:"1px solid "+(darkMode?"#333":"#eee"),paddingTop:8}},
              React.createElement("div",{style:{fontSize:isMobile?11:10,fontWeight:"600",opacity:0.5,marginBottom:4}},"Progression"),
              prog.map(function(p,pi3){
                var fretDisp=p.frets.map(function(f){return f===-1?"\u00B7":f;}).join(" ");
                return React.createElement("div",{key:pi3,style:{display:"flex",alignItems:"center",gap:6,padding:isMobile?"4px 0":"2px 0",fontSize:isMobile?12:11}},
                  React.createElement("span",{style:{opacity:0.3,fontSize:isMobile?10:9,width:16,textAlign:"right"}},(pi3+1)+"."),
                  React.createElement("span",{style:{fontWeight:"600"}},p.name),
                  React.createElement("span",{style:{flex:1,opacity:0.4,fontFamily:"monospace",fontSize:isMobile?10:9}},fretDisp),
                  React.createElement("span",{style:{cursor:"pointer",opacity:0.3,fontSize:isMobile?14:12,padding:"0 4px"},onClick:function(){removeProg(pi3);}},"\u2715"));
              }),
              React.createElement("div",{style:{marginTop:6}},
                React.createElement("div",{style:{fontSize:isMobile?10:9,opacity:0.4,marginBottom:2}},"Pattern"),
                React.createElement("select",{value:fill,onChange:function(e){sd(Object.assign({},dd,{fill:e.target.value}));},style:Object.assign({},drp,{fontSize:isMobile?12:11,width:"100%"})},
                  React.createElement("option",{value:"strum"},"Strum"),
                  React.createElement("option",{value:"arp_down"},"Arpeggio \u2193 (high to low)"),
                  React.createElement("option",{value:"arp_up"},"Arpeggio \u2191 (low to high)"),
                  React.createElement("option",{value:"arp_alt"},"Arpeggio \u2193\u2191 (rolling)"),
                  React.createElement("option",{value:"arp_alt_up"},"Arpeggio \u2191\u2193 (rolling)"),
                  React.createElement("option",{value:"fp_pima"},"Classical picking"),
                  React.createElement("option",{value:"fp_pimi"},"Folk picking"),
                  React.createElement("option",{value:"fp_travis"},"Travis picking"),
                  React.createElement("option",{value:"chug"},"Chug")
                )),
              React.createElement("div",{style:{display:"flex",gap:8,marginTop:6}},
                React.createElement("div",{style:{flex:2,minWidth:0}},
                  React.createElement("div",{style:{fontSize:isMobile?10:9,opacity:0.4,marginBottom:2}},"Rhythm"),
                  (function(){
                    var smDrp=Object.assign({},drp,{fontSize:isMobile?12:11,width:"100%"});
                    var barLen=song.tracks[ati].measures[cur.measure].beats.length;
                    var beatUnit=Math.round(16/curTs.den);
                    var isPickPattern=(fill!=="strum"&&fill!=="chug");
                    var segLen=isPickPattern&&cpb>1?Math.floor(barLen/cpb):barLen;
                    // Minimum hits for pattern to be meaningful
                    var minHits=1;
                    if(fill==="chug")minHits=2;
                    else if(fill==="arp_down"||fill==="arp_up")minHits=3;
                    else if(isPickPattern)minHits=4; // p-i-m-a, p-i-m-i, travis, rolling arp
                    function viable(s){return Math.floor(segLen/s)>=minHits;}
                    var rOpts=[];
                    if(fill==="strum"){
                      rOpts.push({v:barLen,l:"Per bar"});
                      if(barLen>2&&barLen%2===0)rOpts.push({v:Math.floor(barLen/2),l:"Half bar"});
                    }
                    if(fill==="strum"||fill==="chug"){
                      if(beatUnit>=2&&viable(beatUnit))rOpts.push({v:beatUnit,l:"Per beat"});
                      var sub=Math.max(1,Math.floor(beatUnit/2));if(sub<beatUnit&&viable(sub))rOpts.push({v:sub,l:beatUnit===4?"Eighth":"Sub-beat"});
                    } else {
                      if(beatUnit>=2&&viable(beatUnit))rOpts.push({v:beatUnit,l:"Per beat"});
                      var sub2=Math.max(1,Math.floor(beatUnit/2));if(sub2<beatUnit&&viable(sub2))rOpts.push({v:sub2,l:beatUnit===4?"Eighth":"Sub-beat"});
                      if(beatUnit>2){var sub3=Math.max(1,Math.floor(beatUnit/4));if(sub3>=1&&sub3<sub2&&viable(sub3))rOpts.push({v:sub3,l:"16th"});}
                    }
                    if((fill==="strum"||fill==="chug")&&viable(1)&&rOpts[rOpts.length-1].v!==1)rOpts.push({v:1,l:"16th"});
                    if(rOpts.length===0)rOpts.push({v:Math.max(1,Math.floor(segLen/minHits)),l:"Auto"});
                    // Clamp step to valid values
                    var validSteps=rOpts.map(function(r){return r.v;});
                    var curStep=validSteps.indexOf(step)>=0?step:rOpts[0].v;
                    if(curStep!==step)setTimeout(function(){sd(Object.assign({},dd,{step:curStep}));},0);
                    return React.createElement("select",{value:curStep,onChange:function(e){sd(Object.assign({},dd,{step:+e.target.value}));},style:smDrp},
                      rOpts.map(function(r){return React.createElement("option",{key:r.v,value:r.v},r.l);})
                    );
                  })()),
                prog.length>1?React.createElement("div",{style:{flex:1,minWidth:0}},
                  React.createElement("div",{style:{fontSize:isMobile?10:9,opacity:0.4,marginBottom:2}},"Chords/bar"),
                  React.createElement("select",{value:cpb,onChange:function(e){sd(Object.assign({},dd,{cpb:+e.target.value}));},style:Object.assign({},drp,{fontSize:isMobile?12:11,width:"100%"})},
                    React.createElement("option",{value:1},"1"),
                    React.createElement("option",{value:2},"2")
                  )):null,
                fill==="chug"?(function(){
                  var aOpts=[{v:1,l:"Beat 1"}];
                  if(qBeats>=4&&qBeats%2===0)aOpts.push({v:2,l:"Beats 1 & "+(qBeats/2+1)});
                  if(qBeats>=3)aOpts.push({v:qBeats,l:"Every beat"});
                  var curCyc=aOpts.some(function(a){return a.v===cyc;})?cyc:1;
                  return React.createElement("div",{style:{flex:2,minWidth:0}},
                    React.createElement("div",{style:{fontSize:isMobile?10:9,opacity:0.4,marginBottom:2}},"Accent"),
                    React.createElement("select",{value:curCyc,onChange:function(e){sd(Object.assign({},dd,{cyc:+e.target.value}));},style:Object.assign({},drp,{fontSize:isMobile?12:11,width:"100%"})},
                      aOpts.map(function(a){return React.createElement("option",{key:a.v,value:a.v},a.l);})
                    ));
                })():null,
              )
            ):null,
            // Bottom buttons
            React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:6,marginTop:12}},
              prog.length>0?React.createElement(DlgBtn,{o:doPreviewProg},"\u25B6 Preview"):null,
              React.createElement(DlgBtn,{primary:true,disabled:!selV&&prog.length===0,o:doInsert},
                prog.length>0?"Insert "+Math.ceil(prog.length/cpb)+" bar"+(Math.ceil(prog.length/cpb)!==1?"s":""):"Insert"),
              React.createElement(DlgBtn,{o:closeDlg},"Cancel")
            )
          );
        })()}
      </Modal>

      <Modal show={dlg==="about"} title="About TabKit" onClose={closeDlg}>
        <div style={{textAlign:"center",padding:"10px 0"}}>
          <div style={{display:"inline-block",width:isMobile?100:120,height:isMobile?100:120,borderRadius:isMobile?28:32,overflow:"hidden",marginBottom:12}}><img src={LOGO_SRC} alt="TabKit" style={{width:"100%",height:"100%",display:"block"}} /></div>
          <div style={{fontSize:12,lineHeight:"1.7",textAlign:"left",color:"var(--text-primary,#444)",marginBottom:16}}>
            <p style={{margin:"0 0 10px"}}>{"A free guitar tablature editor built for the web. Create, edit, and play multi-track tabs for guitar, bass, banjo, and drums with SoundFont playback, MIDI export, and real-time audio effects."}</p>
            <p style={{margin:"0 0 10px"}}>{"Save in TabKit\u2019s native format (.tkt) to preserve everything: expression dynamics, per-note velocity, time signatures, 12-string support, and more. Share your work instantly with a link, no accounts or file hosting needed."}</p>
            <p style={{margin:0}}>{"Already have TabIt files? Open them directly and unlock TabKit\u2019s full feature set. Need a .tbt? Our compatibility layer intelligently converts your work for TabIt users."}</p>
          </div>
          <div style={{fontSize:11,opacity:0.6,marginBottom:14}}>{"No install. No account. Desktop and mobile."}</div>
          <div style={{padding:"12px",background:"var(--surface-1,#f8f9fa)",border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:8,fontSize:11,lineHeight:"1.5"}}>
            <div>{"If you enjoy using TabKit, please consider "}<a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" style={{color:"var(--accent,#3264dc)",fontWeight:"600"}}>{"buying me a coffee"}</a>{" to support the project."}</div>
          </div>
          <div style={{marginTop:14}}><DlgBtn o={closeDlg} primary>OK</DlgBtn></div>
        </div>
      </Modal>
      <Modal show={dlg==="help"} title="TabKit Help" onClose={closeDlg}>
        <div style={{maxHeight:400,overflow:"auto",fontSize:12,lineHeight:1.7}}>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Navigation"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"Arrows — move cursor"}</div>
            <div>{"Ctrl+Left/Right — prev/next bar"}</div>
            <div>{"Home/End — start/end of bar"}</div>
            <div>{"Ctrl+Home/End — start/end of song"}</div>
            <div>{"Tab/Shift+Tab — next/prev track"}</div>
            <div>{"Ctrl+G — go to bar"}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Note Input"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"0-9 — fret number (double-digit within 1.2s)"}</div>
            <div>{"X — muted string"}</div>
            <div>{"* — stop string"}</div>
            <div>{"Space — clear note or selection"}</div>
            <div>{"Ctrl+Up/Down — move note to adjacent string"}</div>
            <div>{"Ctrl+Alt+Up/Down — transpose note up/down one octave"}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Techniques"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"H — hammer-on"}</div>
            <div>{"P — pull-off"}</div>
            <div>{"/ — slide up"}</div>
            <div>{"\\ — slide down"}</div>
            <div>{"Ctrl+B — pre-bend"}</div>
            <div>{"B — bend"}</div>
            <div>{"= — bend hold"}</div>
            <div>{"R — release bend"}</div>
            <div>{"~ — vibrato"}</div>
            <div>{"T — tap"}</div>
            <div>{"S — slap"}</div>
            <div>{"( — soft"}</div>
            <div>{"< — harmonic"}</div>
            <div>{"{ — tremolo"}</div>
            <div>{"W — whammy"}</div>
            <div>{"M — palm mute"}</div>
            <div>{"! — indefinite ring"}</div>
            <div>{"Ctrl+Shift+V — note velocity"}</div>
            <div style={{opacity:0.7,marginTop:4}}>{"Chains: 7b 9r 7 plays as one fluid bend."}</div>
            <div style={{opacity:0.7}}>{"Place on empty beats for delayed effects on ringing strings."}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Track Effects & Structure"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"F — track effects dialog"}</div>
            <div>{"Ctrl+Q — MIDI controllers"}</div>
            <div>{"Ctrl+T — tempo change"}</div>
            <div>{"Ctrl+I — instrument change"}</div>
            <div>{"Ctrl+H — volume change"}</div>
            <div>{"Ctrl+Bksp — clear track effect"}</div>
            <div>{"Ctrl+K — staff break"}</div>
            <div>{"Ctrl+E — repeat open"}</div>
            <div>{"Ctrl+R — repeat close"}</div>
            <div>{"Ctrl+Alt+W — alternate time region"}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Playback"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"F5 — play current track"}</div>
            <div>{"F6 — play all tracks"}</div>
            <div>{"F7 — hold to play, release to stop"}</div>
            <div>{"F8/Esc — stop (again to jump to beginning)"}</div>
            <div>{"F9 — rewind after stop"}</div>
            <div>{"F11 — metronome"}</div>
            <div>{"Click during playback — seek"}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Editing"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"Ctrl+Z — undo"}</div>
            <div>{"Ctrl+X/C/V — cut/copy/paste"}</div>
            <div>{"Shift+arrows — select range"}</div>
            <div>{"Ctrl+Shift+arrows — select by bar"}</div>
            <div>{"Shift+Click — extend selection"}</div>
            <div>{"Ctrl+Shift+Home — select to start"}</div>
            <div>{"Ctrl+Shift+End — select to end"}</div>
            <div>{"Insert — insert blank note, shift right"}</div>
            <div>{"Delete — delete note, shift left"}</div>
            <div>{"Ctrl+Ins — insert bar"}</div>
            <div>{"Ctrl+Del — delete bar"}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"File & Song"}</div>
          <div style={{marginBottom:8,paddingLeft:8}}>
            <div>{"Ctrl+N — new"}</div>
            <div>{"Ctrl+O — open"}</div>
            <div>{"Ctrl+S — save (.tkt)"}</div>
            <div>{"Ctrl+P — print"}</div>
            <div>{"Ctrl+L — title and comments"}</div>
            <div>{"Ctrl+A — track properties"}</div>
            <div>{"Ctrl+M — tempo"}</div>
            <div>{"Ctrl+Shift+M — time signature"}</div>
          </div>
          <div style={{fontWeight:"600",fontSize:12,marginBottom:4,color:"var(--accent,#3264dc)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{"Formats & Audio"}</div>
          <div style={{paddingLeft:8}}>
            <div>{".tkt — TabKit native format (all features)"}</div>
            <div>{".tbt — TabIt compatible export"}</div>
            <div>{"MIDI and text export available"}</div>
            <div>{"Share — upload and copy link"}</div>
            <div>{"SF2 SoundFont playback (configurable in Options)"}</div>
            <div>{"Guitar (1-12 strings), Bass, Banjo, Drums"}</div>
            <div>{"Solo/Mute via S/M on track headers"}</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><DlgBtn o={closeDlg} primary>OK</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="options"} title="Options" onClose={closeDlg}>
        <div style={{fontSize:12,fontWeight:"600",marginBottom:8,color:TH.text}}>{"SoundFont"}</div>
        <div style={{fontSize:10,padding:"10px 12px",background:"var(--surface-1,#f8f9fa)",borderRadius:8,marginBottom:10,border:"1px solid var(--border-subtle,#e4e8f0)"}}>
          {_sf2LocalName
            ? <div><span style={{fontWeight:"600"}}>{"Local file: "}</span><span style={{fontFamily:"SF Mono,Consolas,monospace",fontSize:10}}>{_sf2LocalName}</span></div>
            : <div><span style={{fontWeight:"600"}}>{"URL: "}</span><span style={{fontFamily:"SF Mono,Consolas,monospace",fontSize:10}}>{SF_URL}</span></div>
          }
          <div style={{marginTop:6,fontSize:10,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:_sf2State==="done"?"#34a853":_sf2State==="loading"?"#fbbc04":"#ea4335",display:"inline-block",flexShrink:0}} />
            <span style={{color:"var(--text-secondary,#666)"}}>
            {_sf2State==="done"?"Ready":_sf2State==="loading"?"Loading...":"Failed"}
            {_sf2WarmState==="warming"?" — caching samples":_sf2WarmState==="done"?" — all samples cached":""}
            {_actx ? (" | Audio: " + _actx.state + " " + Math.round(_actx.sampleRate) + "Hz") : " | Audio: no context"}
            </span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <DlgBtn o={function(){
              var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".sf2";
              inp.onchange = function(ev) {
                var file = ev.target.files && ev.target.files[0];
                if (!file) return;
                setStatus("Loading " + file.name + "...");
                var reader = new FileReader();
                reader.onload = function(re) {
                  loadSF2FromBuffer(re.target.result, file.name, setStatus);
                  setDlgData(Object.assign({},dlgData,{sfUrl:""}));
                };
                reader.readAsArrayBuffer(file);
              };
              inp.click();
            }}>Load Local .sf2</DlgBtn>
            <DlgBtn o={function(){
              _setSf2LocalName("");
              sfIDBClear().catch(function(){});
              _sf2 = null; _sf2State = "none"; _sf2Bufs = {};
              SF_URL = SF_URL_DEFAULT;
              try{localStorage.removeItem("tabkit_sfUrl");}catch(e2){}
              setStatus("Loading default SoundFont (gm.sf2)...");
              setTimeout(function(){ loadSF2(setStatus); }, 100);
              setDlgData(Object.assign({},dlgData,{sfUrl:SF_URL_DEFAULT}));
            }}>Restore Default (gm.sf2)</DlgBtn>
          </div>
          <DlgRow label="URL:" lw={30}>
            <input value={dlgData.sfUrl!==undefined?dlgData.sfUrl:(_sf2LocalName?"":SF_URL)} onChange={function(e){setDlgData(Object.assign({},dlgData,{sfUrl:e.target.value}));}} style={{flex:1,border:"1px solid var(--dlg-input-border,#7f9db9)",fontSize:10,padding:"2px 4px"}} />
          </DlgRow>
          <div style={{fontSize:10,opacity:0.6}}>{"Enter a URL to load an SF2 from the web. Applied on OK."}</div>
        </div>
        <div style={{borderTop:"1px solid var(--border-subtle,#e4e8f0)",marginTop:14,paddingTop:12}}>
          <div style={{fontSize:12,fontWeight:"600",marginBottom:8,color:TH.text}}>{"Session Data"}</div>
          <DlgBtn o={function(){
            if(window.confirm("Clear all session data and reload? This will close all tabs and reset everything.")){
              _clearingSession.current = true;
              if(_autoSaveTimer.current) clearTimeout(_autoSaveTimer.current);
              try{localStorage.removeItem("tabkit_autosave");localStorage.removeItem("tabkit_zoom");localStorage.removeItem("tabkit_metro");localStorage.removeItem("tabkit_autoScroll");localStorage.removeItem("tabkit_rewind");}catch(e){}
              window.location.reload();
            }
          }}>Clear Session &amp; Reload</DlgBtn>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:14}}>
          <DlgBtn o={function(){
            var newUrl = (dlgData.sfUrl!==undefined?dlgData.sfUrl:SF_URL) || SF_URL_DEFAULT;
            if (newUrl !== SF_URL) {
              SF_URL = newUrl;
              _setSf2LocalName("");
              try{localStorage.setItem("tabkit_sfUrl",newUrl===SF_URL_DEFAULT?"":newUrl);}catch(e2){}
              _sf2 = null; _sf2State = "none"; _sf2Bufs = {};
              sfIDBClear().catch(function(){});
              setStatus("Loading SoundFont...");
              setTimeout(function(){ loadSF2(setStatus); }, 100);
            }
            closeDlg();
          }} primary>OK</DlgBtn>
          <DlgBtn o={closeDlg}>Cancel</DlgBtn>
        </div>
      </Modal>

      <Modal show={dlg==="share"} title="Share" onClose={closeDlg}>
        {dlgData ? <div>
          {dlgData.status==="success" || dlgData.status==="updated" ? <div>
            <div style={{textAlign:"center",fontSize:14,fontWeight:"600",color:"#34a853",marginBottom:14}}>{dlgData.status==="updated" ? "\u2714 Updated successfully!" : "\u2714 Shared successfully!"}</div>
            {dlgData.validationWarning ? <div style={{fontSize:11,marginBottom:12,padding:"8px 10px",background:"rgba(251,188,4,0.12)",borderRadius:8,border:"1px solid rgba(251,188,4,0.4)",color:darkMode?"#ffc040":"#856404"}}>{"\u26A0 "+dlgData.validationWarning}</div> : (dlgData.validated ? <div style={{fontSize:10,textAlign:"center",marginBottom:12,opacity:0.6}}>{"\u2714 Verified \u2014 stored copy matches what was sent"}</div> : <div style={{fontSize:10,textAlign:"center",marginBottom:12,opacity:0.5}}>{"Verifying stored copy\u2026"}</div>)}
            <DlgRow label="Link:" lw={dlgData.newToken?75:35}><input value={dlgData.shareUrl||""} readOnly style={{flex:1,fontSize:11}} onClick={function(e){e.target.select();}} /></DlgRow>
            <div style={{textAlign:"right",marginBottom:8}}><DlgBtn o={function(){try{navigator.clipboard.writeText(dlgData.shareUrl);setDlgData(Object.assign({},dlgData,{linkCopied:true}));setTimeout(function(){setDlgData(function(d){return d?Object.assign({},d,{linkCopied:false}):d;});},2000);}catch(e){window.prompt("Copy link:",dlgData.shareUrl);}}} primary={!!dlgData.linkCopied}>{dlgData.linkCopied ? "\u2714 Copied!" : "Copy Link"}</DlgBtn></div>
            {dlgData.newToken ? <div>
              <DlgRow label="Edit Token:" lw={75}><input value={dlgData.editToken||""} readOnly style={{flex:1,fontSize:11,fontFamily:"monospace"}} onClick={function(e){e.target.select();}} /></DlgRow>
              <div style={{textAlign:"right",marginBottom:8}}><DlgBtn o={function(){try{navigator.clipboard.writeText(dlgData.editToken);setDlgData(Object.assign({},dlgData,{tokenCopied:true}));setTimeout(function(){setDlgData(function(d){return d?Object.assign({},d,{tokenCopied:false}):d;});},2000);}catch(e){window.prompt("Copy token:",dlgData.editToken);}}} primary={!!dlgData.tokenCopied}>{dlgData.tokenCopied ? "\u2714 Copied!" : "Copy Token"}</DlgBtn></div>
              <div style={{fontSize:10,opacity:0.7,marginBottom:8,padding:"6px 8px",background:"rgba(251,188,4,0.1)",borderRadius:8,border:"1px solid rgba(251,188,4,0.3)"}}>{"\u26A0 Save this token! Anyone with it can update this shared file. Share it only with collaborators."}</div>
            </div> : null}
            <div style={{display:"flex",gap:16,fontSize:11,opacity:0.6,marginTop:8}}>
              <span>{"ID: "+(dlgData.shareId||"")}</span>
              <span>{"Version "+(dlgData.shareVersion||1)}</span>
              <span>{dlgData.shareTime||""}</span>
              <span>{dlgData.visibility==="private"?"\uD83D\uDD12 Private":"\uD83C\uDF10 Public"}</span>
            </div>
            {dlgData.visibility!=="private" ? <div style={{borderTop:"1px solid var(--dlg-border,#ccc)",marginTop:12,paddingTop:10}}>
              <div style={{fontSize:11,fontWeight:"600",marginBottom:6}}>{"Share on Reddit"}</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <DlgBtn o={function(){var t2=encodeURIComponent("[Shared Tab] "+(song.artist?song.artist+" - ":"")+(song.title||"Untitled"));var lk=encodeURIComponent(dlgData.shareUrl||"");window.open("https://www.reddit.com/r/TabKit/submit?type=link&title="+t2+"&url="+lk,"_blank");}}>{"Post to r/TabKit"}</DlgBtn>
              </div>
              <div style={{fontSize:10,opacity:0.6,marginBottom:6}}>{"After posting, paste your Reddit thread URL here (optional):"}</div>
              <div style={{display:"flex",gap:4}}>
                <input value={dlgData.redditUrl||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{redditUrl:e.target.value}));}} style={{flex:1,fontSize:11}} placeholder="https://reddit.com/r/TabKit/comments/..." />
                <DlgBtn o={function(){var ru=(dlgData.redditUrl||"").trim();if(ru&&!/^https?:\/\/(www\.)?reddit\.com\/r\/TabKit\/(comments|s)\/\w+/i.test(ru)){setDlgData(Object.assign({},dlgData,{redditSaved:"Must be a r/TabKit post URL"}));return;}fetch("/.netlify/functions/share?id="+encodeURIComponent(dlgData.shareId)+"&action=reddit",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(dlgData.editToken||"")},body:JSON.stringify({redditUrl:ru})}).then(function(r){return r.json();}).then(function(d){if(d.ok)setDlgData(Object.assign({},dlgData,{redditSaved:ru?"\u2714 Saved!":"\u2714 Removed"}));else setDlgData(Object.assign({},dlgData,{redditSaved:d.error||"Failed"}));}).catch(function(){setDlgData(Object.assign({},dlgData,{redditSaved:"Failed"}));});}} primary={!!dlgData.redditUrl}>{dlgData.redditSaved||"Save"}</DlgBtn>
              </div>
            </div> : null}
            <div style={{textAlign:"center",fontSize:10,marginTop:12,opacity:0.5}}>{"Enjoying TabKit? "}<a href="https://buymeacoffee.com/tabkit" target="_blank" rel="noopener noreferrer" style={{color:"var(--accent,#3264dc)"}}>{"Buy me a coffee \u2615"}</a></div>
          </div> : <div>
            {song && song.shareId ? <div style={{fontSize:11,opacity:0.8,marginBottom:10,padding:"8px 10px",background:darkMode?"rgba(255,255,255,0.08)":"#f4f0e8",borderRadius:6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{"Shared as "}<span style={{fontFamily:"monospace"}}>{song.shareId}</span></span>
                <span>{"v"+(song.shareVersion||1)}</span>
              </div>
              {song.shareUpdated ? <div style={{fontSize:10,opacity:0.6,marginTop:2}}>{"Last shared: "+song.shareUpdated}</div> : null}
              {dlgData.hasChanges ? <div style={{fontSize:10,color:"#c60",marginTop:4,fontWeight:"600"}}>{"\u25CF Unsaved changes since last share"}</div> : <div style={{fontSize:10,color:darkMode?"#6c6":"#080",marginTop:4}}>{"\u2714 Up to date"}</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
                <span style={{fontSize:10}}>{(song.shareVisibility||"public")==="private"?"\uD83D\uDD12 Private (unlisted)":"\uD83C\uDF10 Public (listed on Browse)"}</span>
                {dlgData.editToken ? <span style={{fontSize:10,cursor:"pointer",color:"var(--accent,#3264dc)",textDecoration:"underline"}} onClick={function(){
                  var newVis = (song.shareVisibility||"public")==="public"?"private":"public";
                  fetch("/.netlify/functions/share?id="+encodeURIComponent(song.shareId)+"&action=setVisibility",{
                    method:"POST",headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({visibility:newVis,token:dlgData.editToken})
                  }).then(function(r){return r.json();}).then(function(data){
                    if(data.visibility){
                      var s2=JSON.parse(JSON.stringify(song));s2.shareVisibility=data.visibility;
                      skipShareDirty.current=true;setSong(s2);
                      setDlgData(function(d){return Object.assign({},d,{visibility:data.visibility});});
                      setStatus(data.visibility==="public"?"Share is now public":"Share is now private");
                    }
                  }).catch(function(){});
                }}>{"Make "+((song.shareVisibility||"public")==="public"?"Private":"Public")}</span> : null}
              </div>
              {dlgData.editToken ? <div style={{marginTop:6,textAlign:"right"}}><span style={{fontSize:10,cursor:"pointer",opacity:0.5,textDecoration:"underline"}} onClick={function(){doShareDelete(song.shareId,dlgData.editToken);}}>{"Delete share"}</span></div> : null}
            </div> : null}
            <div style={{fontSize:12,marginBottom:10,opacity:0.7}}>{"Create a unique link anyone can open."}</div>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11,marginBottom:10}}><input type="checkbox" checked={(dlgData.visibility||"public")==="public"} onChange={function(e){setDlgData(Object.assign({},dlgData,{visibility:e.target.checked?"public":"private"}));}} />{"List publicly on Browse page"}</label>
            <div style={{marginBottom:6}}>
              <DlgBtn o={function(){doShareNew();}} primary>Share as New</DlgBtn>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
              <div style={{flex:1,borderTop:"1px solid var(--dlg-border,#ccc)"}} />
              <span style={{fontSize:10,opacity:0.5,textTransform:"uppercase",letterSpacing:1}}>{"or"}</span>
              <div style={{flex:1,borderTop:"1px solid var(--dlg-border,#ccc)"}} />
            </div>
            <div style={{marginBottom:4}}>
              <div style={{fontSize:11,fontWeight:"600",marginBottom:8}}>{"Update an existing share"}</div>
              <DlgRow label="Share ID:" lw={75}><input value={dlgData.shareId||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{shareId:e.target.value.trim()}));}} style={{flex:1,fontSize:11,fontFamily:"monospace"}} placeholder="e.g. abc12345" /></DlgRow>
              <DlgRow label="Edit Token:" lw={75}><input value={dlgData.editToken||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{editToken:e.target.value.trim()}));}} style={{flex:1,fontSize:11,fontFamily:"monospace"}} placeholder="Paste token here" /></DlgRow>
              <div style={{textAlign:"right",marginTop:8}}>
                <DlgBtn o={function(){doShareUpdate(dlgData.shareId,dlgData.editToken);}} primary disabled={!dlgData.shareId||!dlgData.editToken}>Update Share</DlgBtn>
              </div>
            </div>
            {dlgData.status && dlgData.status==="conflict" && dlgData.conflict ? <div style={{padding:"10px",background:darkMode?"#3a2000":"#fff3e0",border:"1px solid "+(darkMode?"#c47000":"#e65100"),borderRadius:6,marginTop:8}}>
              <div style={{fontSize:12,fontWeight:"600",color:darkMode?"#ffb040":"#e65100",marginBottom:6}}>{"\u26A0 Version Conflict"}</div>
              <div style={{fontSize:11,marginBottom:8,color:darkMode?"#ddd":"inherit"}}>{dlgData.conflict.error}</div>
              <div style={{display:"flex",gap:8}}>
                <DlgBtn o={function(){window.open(window.location.origin+window.location.pathname+"?share="+dlgData.shareId,"_blank");}}>Open Latest</DlgBtn>
                <DlgBtn o={function(){doShareUpdate(dlgData.shareId,dlgData.editToken,true);}} primary>Force Overwrite</DlgBtn>
              </div>
            </div> : null}
            {dlgData.status && dlgData.status!=="success" && dlgData.status!=="updated" && dlgData.status!=="conflict" ? <div style={{fontSize:11,color:dlgData.status.startsWith("Failed")?"#c00":"inherit",marginTop:8,textAlign:"center"}}>{dlgData.status}</div> : null}
          </div>}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><DlgBtn o={closeDlg}>Close</DlgBtn></div>
        </div> : null}
      </Modal>

      <Modal show={dlg==="remapKeys"} title="Customize Shortcuts" onClose={closeDlg}>
        {dlgData && dlgData.tempKeymap ? <div style={{maxHeight:"60vh",overflowY:"auto"}}>
          {KEYMAP_GROUPS.map(function(grp) {
            return React.createElement("div", {key:grp.label},
              React.createElement("div", {style:{fontSize:10,fontWeight:"700",textTransform:"uppercase",opacity:0.5,padding:"8px 0 2px",borderBottom:"1px solid var(--dlg-border,#ddd)"}}, grp.label),
              grp.actions.map(function(aid) {
                var isEditing = dlgData.editingAction === aid;
                var currentCombo = dlgData.tempKeymap[aid] || DEFAULT_KEYMAP[aid];
                var isDefault = currentCombo === DEFAULT_KEYMAP[aid];
                var conflict = null;
                if (isEditing && dlgData.capturedCombo) {
                  for (var ca in dlgData.tempKeymap) {
                    if (ca !== aid && dlgData.tempKeymap[ca] === dlgData.capturedCombo) { conflict = KEYMAP_LABELS[ca]; break; }
                  }
                }
                return React.createElement("div", {key:aid, style:{display:"flex",alignItems:"center",padding:"6px 4px",borderBottom:"1px solid var(--dlg-border,#eee)",background:isEditing?"var(--sel-bg,#d0e8ff)":"transparent",cursor:"pointer",fontSize:12},
                  onClick:function(){
                    if (isEditing) { setDlgData(Object.assign({},dlgData,{editingAction:null,capturedCombo:null})); }
                    else { setDlgData(Object.assign({},dlgData,{editingAction:aid,capturedCombo:null})); }
                  }},
                  React.createElement("span", {style:{flex:1}}, KEYMAP_LABELS[aid]),
                  isEditing ?
                    React.createElement("span", {style:{fontFamily:"monospace",fontSize:11,fontWeight:"600",color:conflict?"#c00":"#0066cc",minWidth:100,textAlign:"right"}},
                      dlgData.capturedCombo ? (conflict ? kLabel(dlgData.capturedCombo) + " \u26A0" : kLabel(dlgData.capturedCombo)) : "Press a key...") :
                    React.createElement("span", {style:{fontFamily:"monospace",fontSize:11,opacity:isDefault?0.6:1,fontWeight:isDefault?"400":"600",color:isDefault?"inherit":"#0066cc",minWidth:100,textAlign:"right"}}, kLabel(currentCombo))
                );
              })
            );
          })}
          {dlgData.editingAction && dlgData.capturedCombo ? <div style={{padding:"8px 4px",fontSize:11}}>
            {(function(){
              var conflict2=null;
              for(var ca2 in dlgData.tempKeymap){if(ca2!==dlgData.editingAction&&dlgData.tempKeymap[ca2]===dlgData.capturedCombo){conflict2=KEYMAP_LABELS[ca2];break;}}
              return conflict2 ? React.createElement("span",{style:{color:"#c00"}},"\u26A0 Conflicts with: "+conflict2+". The other shortcut will be swapped.") : React.createElement("span",{style:{color:"#080"}},"\u2714 "+kLabel(dlgData.capturedCombo)+" is available.");
            })()}
          </div> : null}
        </div> : null}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12,gap:6}}>
          <DlgBtn o={function(){
            setDlgData(Object.assign({},dlgData,{tempKeymap:Object.assign({},DEFAULT_KEYMAP),editingAction:null,capturedCombo:null}));
          }}>Reset All</DlgBtn>
          <div style={{display:"flex",gap:6}}>
            <DlgBtn o={closeDlg}>Cancel</DlgBtn>
            <DlgBtn o={function(){
              var km = dlgData.tempKeymap;
              setKeymap(km);
              saveKeymap(km);
              closeDlg();
              setStatus("Keyboard shortcuts saved");
            }} primary>Save</DlgBtn>
          </div>
        </div>
      </Modal>

      <Modal show={dlg==="exportMidi"} title="Export MIDI" onClose={closeDlg}>
        <div style={{fontSize:11,marginBottom:8}}>{"Select tracks to include:"}</div>
        {song && song.tracks.map(function(tr,ti){return (
          <label key={ti} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:11,marginBottom:3}}>
            <input type="checkbox" checked={!!(dlgData.trackSel&&dlgData.trackSel[ti])}
              onChange={function(e){var ns=Object.assign({},dlgData.trackSel);ns[ti]=e.target.checked;setDlgData(Object.assign({},dlgData,{trackSel:ns}));}} />
            {"Track "+(ti+1)+": "+tr.name+" ("+GM[tr.instrument]+")"+(tr.isDrum?" [Drums]":"")}
          </label>
        );})}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}>
          <DlgBtn o={function(){
            if(!song)return closeDlg();
            var selTracks=[];
            for(var xi=0;xi<song.tracks.length;xi++){if(dlgData.trackSel&&dlgData.trackSel[xi])selTracks.push(xi);}
            if(!selTracks.length){setStatus("No tracks selected");return closeDlg();}
            var midi=buildMidi(song,selTracks);
            var blob=new Blob([midi],{type:"audio/midi"});
            var url=URL.createObjectURL(blob);
            var a=document.createElement("a");
            a.href=url;a.download=(song.title||"export")+".mid";a.click();
            URL.revokeObjectURL(url);
            setStatus("Exported MIDI");closeDlg();
          }} primary>Export</DlgBtn>
          <DlgBtn o={closeDlg}>Cancel</DlgBtn>
        </div>
      </Modal>
      <Modal show={dlg==="export"} title="Export as Text" onClose={closeDlg}>
        <p style={{fontSize:11}}>{"Export current track as ASCII tab text."}</p>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){
          if(!song)return closeDlg();
          var t2=song.tracks[ati]; var lines=[]; var ns2=t2.numStrings;
          var lbls=[]; for(var si2=0;si2<ns2;si2++){lbls.push(t2.isDrum?String(t2.tuning[si2]):midiName(t2.tuning[si2]||40));}
          var maxLbl=Math.max.apply(null,lbls.map(function(l){return l.length;}));
          var measPerLine=4; var mi2=0;
          while(mi2<t2.measures.length){
            var rowEnd=Math.min(mi2+measPerLine,t2.measures.length);
            var sLines=[]; for(var si3=0;si3<ns2;si3++){var pad=lbls[ns2-1-si3]; while(pad.length<maxLbl)pad=" "+pad; sLines.push(pad+"|");}
            for(var mj=mi2;mj<rowEnd;mj++){
              var m2=t2.measures[mj];
              for(var bi2=0;bi2<m2.beats.length;bi2++){
                for(var si4=0;si4<ns2;si4++){
                  var n2=m2.beats[bi2].notes[ns2-1-si4];
                  if(!n2) sLines[si4]+="-";
                  else if(n2.muted) sLines[si4]+="x";
                  else if(n2.stop) sLines[si4]+="*";
                  else{var fs2=String(n2.fret); sLines[si4]+=fs2; if(fs2.length>1)bi2;}
                }
              }
              for(var si5=0;si5<ns2;si5++) sLines[si5]+="|";
            }
            lines.push(sLines.join("\n")); mi2=rowEnd;
          }
          var txt=(song.title||"Untitled")+"\n"+(song.artist?"by "+song.artist+"\n":"")+"\n"+lines.join("\n\n")+"\n";
          var blob=new Blob([txt],{type:"text/plain"});
          var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=(song.title||"tab")+".txt"; a.click();
          closeDlg();
        }} primary>Export</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="altTime"} title="Alternate Time Region" onClose={closeDlg}>
        <p style={{fontSize:11}}>{"Insert N notes in the time of D beats at the current position."}</p>
        <DlgRow label="N (notes):" lw={100}><input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"atrN",3)} onFocus={dlgNumFocus(dlgData,setDlgData,"atrN",3)} onChange={dlgNumChange(dlgData,setDlgData,"atrN")} onBlur={dlgNumBlur(dlgData,setDlgData,"atrN",3,2,16)} style={{width:40}} /></DlgRow>
        <DlgRow label="in time of D:" lw={100}><input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"atrD",1)} onFocus={dlgNumFocus(dlgData,setDlgData,"atrD",1)} onChange={dlgNumChange(dlgData,setDlgData,"atrD")} onBlur={dlgNumBlur(dlgData,setDlgData,"atrD",1,1,8)} style={{width:40}} /></DlgRow>
        <div style={{fontSize:10,color:"var(--text-primary,#000)",opacity:0.6,marginTop:4}}>{"3:1 = triplet (3 notes in 1 beat). 3:2 = triplet (3 in 2). 2:1 = duplet."}</div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){
          if(!song)return closeDlg();
          var aN=(dlgData.atrN!==""&&!isNaN(+dlgData.atrN))?+dlgData.atrN:3, aD=(dlgData.atrD!==""&&!isNaN(+dlgData.atrD))?+dlgData.atrD:1;
          if(aN<2||aD<1||aN>16||aD>8||aD>=aN){closeDlg();return;}
          var s2=JSON.parse(JSON.stringify(song));
          var bi=cur.beat;
          var t2=s2.tracks[ati]; var m2=t2.measures[cur.measure];
          if(!m2){closeDlg();return;}
          var ns2=t2.numStrings;
          var removeCount=Math.min(aD, m2.beats.length-bi);
          if(removeCount<=0){closeDlg();return;}
          var oldBeat=m2.beats[bi]?JSON.parse(JSON.stringify(m2.beats[bi])):null;
          m2.beats.splice(bi, removeCount);
          for(var ai=0;ai<aN;ai++){
            var nb={notes:new Array(ns2).fill(null), atrGroup:aN, atrNum:aD};
            if(ai===0&&oldBeat){nb.notes=oldBeat.notes; if(oldBeat.topChar)nb.topChar=oldBeat.topChar; if(oldBeat.botChar)nb.botChar=oldBeat.botChar; if(oldBeat.trkEffect)nb.trkEffect=oldBeat.trkEffect;}
            m2.beats.splice(bi+ai,0,nb);
          }
          setSong(s2); closeDlg();
        }} primary>OK</DlgBtn><DlgBtn o={function(){
          // Remove ATR: find the ATR group at current beat and collapse on current track only
          if(!song)return closeDlg();
          var s2=JSON.parse(JSON.stringify(song));
          var refM=s2.tracks[ati].measures[cur.measure];
          if(!refM||!refM.beats[cur.beat])return closeDlg();
          var b2=refM.beats[cur.beat];
          if(!b2.atrGroup||b2.atrGroup<=1){closeDlg();return;}
          var grp=b2.atrGroup, num=b2.atrNum||1;
          var start=cur.beat;
          while(start>0&&refM.beats[start-1]&&refM.beats[start-1].atrGroup===grp&&refM.beats[start-1].atrNum===num) start--;
          var end=start;
          while(end<refM.beats.length&&refM.beats[end]&&refM.beats[end].atrGroup===grp&&refM.beats[end].atrNum===num) end++;
          var atrCount=end-start;
          var ns2=s2.tracks[ati].numStrings;
          var removeEnd=Math.min(start+atrCount, refM.beats.length);
          var savedBeat=JSON.parse(JSON.stringify(refM.beats[start]));
          refM.beats.splice(start, removeEnd-start);
          for(var ri=0;ri<num;ri++){
            var rb2={notes:new Array(ns2).fill(null)};
            if(ri===0){rb2.notes=savedBeat.notes; if(savedBeat.topChar)rb2.topChar=savedBeat.topChar; if(savedBeat.botChar)rb2.botChar=savedBeat.botChar; if(savedBeat.trkEffect)rb2.trkEffect=savedBeat.trkEffect;}
            refM.beats.splice(start+ri,0,rb2);
          }
          setCur({measure:cur.measure,beat:start,string:cur.string});
          setSong(s2); closeDlg();
        }}>Remove</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="moveTracks"} title="Move Tracks" onClose={closeDlg}>
        <div style={{fontSize:11,marginBottom:6}}>{"Drag or use buttons to reorder tracks:"}</div>
        <div style={{maxHeight:200,overflow:"auto",border:"1px solid var(--border-subtle,#e4e8f0)",background:"var(--dlg-input-bg,#fff)"}}>
          {song && song.tracks.map(function(tr2,idx2){
            var isSel = idx2===(dlgData.selTrack||0);
            return (<div key={idx2} onClick={function(){setDlgData(Object.assign({},dlgData,{selTrack:idx2}));}}
              style={{padding:"3px 6px",cursor:"pointer",background:isSel?"var(--accent,#3264dc)":"transparent",color:isSel?"#fff":"var(--text-primary,#000)",fontSize:11,borderBottom:"1px solid var(--dlg-input-border,#eee)"}}>
              {String(idx2+1)+". "+tr2.name+" ("+(tr2.isDrum?"Drums":(GM[tr2.instrument]||"?"))+")"}</div>);
          })}
        </div>
        <div style={{display:"flex",gap:4,marginTop:6}}>
          <DlgBtn o={function(){var si2=dlgData.selTrack||0; if(si2<=0)return; var s2=JSON.parse(JSON.stringify(song)); var tmp=s2.tracks[si2]; s2.tracks[si2]=s2.tracks[si2-1]; s2.tracks[si2-1]=tmp; setSong(s2); setDlgData(Object.assign({},dlgData,{selTrack:si2-1})); if(ati===si2){atiRef.current=si2-1;setAti(si2-1);}else if(ati===si2-1){atiRef.current=si2;setAti(si2);}}}>Move Up</DlgBtn>
          <DlgBtn o={function(){var si2=dlgData.selTrack||0; if(!song||si2>=song.tracks.length-1)return; var s2=JSON.parse(JSON.stringify(song)); var tmp=s2.tracks[si2]; s2.tracks[si2]=s2.tracks[si2+1]; s2.tracks[si2+1]=tmp; setSong(s2); setDlgData(Object.assign({},dlgData,{selTrack:si2+1})); if(ati===si2){atiRef.current=si2+1;setAti(si2+1);}else if(ati===si2+1){atiRef.current=si2;setAti(si2);}}}>Move Down</DlgBtn>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={closeDlg} primary>Done</DlgBtn></div>
      </Modal>
      <Modal show={dlg==="trackEffects"} title="Create Track Effects" onClose={closeDlg}>
        <div style={{fontSize:11}}>
        {/* Tab bar */}
        <div style={{display:"flex",borderBottom:"1px solid var(--border-subtle,#e4e8f0)",marginBottom:10,gap:2}}>
          {["general","effects","midi"].map(function(tab){ return (
            <div key={tab} style={{padding:"4px 16px",cursor:"pointer",fontWeight:dlgData.tab===tab?"bold":"normal",
              borderBottom:"none",borderRadius:20,
              background:dlgData.tab===tab?"var(--accent-soft,rgba(50,100,220,0.08))":"transparent",
              color:dlgData.tab===tab?"var(--accent,#3264dc)":"var(--text-secondary,#888)"}}
              onClick={function(){setDlgData(Object.assign({},dlgData,{tab:tab}));}}>{({general:"General",effects:"Effects",midi:"MIDI Controllers"})[tab]}</div>
          );})}
        </div>
        {dlgData.tab==="general" ? <div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkT} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkT:e.target.checked}));}} />{"Tempo:"}</label>
            <input type="number" min={30} max={500} value={dlgData.valT||song.tempo||120} disabled={!dlgData.chkT} onChange={function(e){setDlgData(Object.assign({},dlgData,{valT:+e.target.value}));}} style={{width:50,background:dlgData.chkT?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkI} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkI:e.target.checked}));}} />{"Instrument:"}</label>
            <select value={dlgData.valI!==undefined?dlgData.valI:track.instrument} disabled={!dlgData.chkI} onChange={function(e){setDlgData(Object.assign({},dlgData,{valI:+e.target.value}));}} style={{flex:1,background:dlgData.chkI?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}}>{GM.map(function(n2,i2){return (<option key={i2} value={i2}>{i2+" - "+n2}</option>);})}</select>
          </div>
          {dlgData.chkI ? <div style={{display:"flex",alignItems:"center",marginBottom:6,paddingLeft:100}}>
            <label style={{display:"flex",alignItems:"center",gap:4}}><input type="checkbox" checked={dlgData.valLR!==false} onChange={function(e){setDlgData(Object.assign({},dlgData,{valLR:e.target.checked}));}} />{"Let Notes Ring"}</label>
          </div> : null}
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkV} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkV:e.target.checked}));}} />{"Volume:"}</label>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.valV,96)} disabled={!dlgData.chkV} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valV:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valV",96)} disabled={!dlgData.chkV} style={{width:50,marginLeft:4,background:dlgData.chkV?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valV",96)} onChange={dlgNumChange(dlgData,setDlgData,"valV")} onBlur={dlgNumBlur(dlgData,setDlgData,"valV",96,0,127)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkVel} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkVel:e.target.checked}));}} />{"Velocity:"}</label>
            <input type="range" min={1} max={127} value={dlgNumSlider(dlgData.valVel,80)} disabled={!dlgData.chkVel} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valVel:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valVel",80)} disabled={!dlgData.chkVel} style={{width:50,marginLeft:4,background:dlgData.chkVel?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valVel",80)} onChange={dlgNumChange(dlgData,setDlgData,"valVel")} onBlur={dlgNumBlur(dlgData,setDlgData,"valVel",80,1,127)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkEx} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkEx:e.target.checked}));}} />{"Expression:"}</label>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.valEx,127)} disabled={!dlgData.chkEx} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valEx:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valEx",127)} disabled={!dlgData.chkEx} style={{width:50,marginLeft:4,background:dlgData.chkEx?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valEx",127)} onChange={dlgNumChange(dlgData,setDlgData,"valEx")} onBlur={dlgNumBlur(dlgData,setDlgData,"valEx",127,0,127)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkSD} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkSD:e.target.checked}));}} />{"Stroke Down"}</label>
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkSU} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkSU:e.target.checked}));}} />{"Stroke Up"}</label>
          </div>

        </div> : null}
        {dlgData.tab==="midi" ? <div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkB} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkB:e.target.checked}));}} />{"Pitch Bend:"}</label>
            <input type="range" min={-2400} max={2400} value={dlgNumSlider(dlgData.valB,0)} disabled={!dlgData.chkB} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valB:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valB",0)} disabled={!dlgData.chkB} style={{width:50,marginLeft:4,background:dlgData.chkB?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valB",0)} onChange={dlgNumChange(dlgData,setDlgData,"valB")} onBlur={dlgNumBlur(dlgData,setDlgData,"valB",0,-2400,2400)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkM} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkM:e.target.checked}));}} />{"Modulation:"}</label>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.valM,0)} disabled={!dlgData.chkM} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valM:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valM",0)} disabled={!dlgData.chkM} style={{width:50,marginLeft:4,background:dlgData.chkM?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valM",0)} onChange={dlgNumChange(dlgData,setDlgData,"valM")} onBlur={dlgNumBlur(dlgData,setDlgData,"valM",0,0,127)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkP} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkP:e.target.checked}));}} />{"Pan:"}</label>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.valP,64)} disabled={!dlgData.chkP} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valP:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valP",64)} disabled={!dlgData.chkP} style={{width:50,marginLeft:4,background:dlgData.chkP?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valP",64)} onChange={dlgNumChange(dlgData,setDlgData,"valP")} onBlur={dlgNumBlur(dlgData,setDlgData,"valP",64,0,127)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkRv} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkRv:e.target.checked}));}} />{"Reverb:"}</label>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.valRv,0)} disabled={!dlgData.chkRv} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valRv:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valRv",0)} disabled={!dlgData.chkRv} style={{width:50,marginLeft:4,background:dlgData.chkRv?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valRv",0)} onChange={dlgNumChange(dlgData,setDlgData,"valRv")} onBlur={dlgNumBlur(dlgData,setDlgData,"valRv",0,0,127)} />
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,minWidth:100}}><input type="checkbox" checked={!!dlgData.chkCh} onChange={function(e){setDlgData(Object.assign({},dlgData,{chkCh:e.target.checked}));}} />{"Chorus:"}</label>
            <input type="range" min={0} max={127} value={dlgNumSlider(dlgData.valCh,0)} disabled={!dlgData.chkCh} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valCh:+e.target.value}));}} />
            <input type="text" inputMode="numeric" value={dlgNumVal(dlgData,"valCh",0)} disabled={!dlgData.chkCh} style={{width:50,marginLeft:4,background:dlgData.chkCh?"var(--dlg-input-bg,#fff)":"var(--dlg-input-dis,#ddd)"}} onFocus={dlgNumFocus(dlgData,setDlgData,"valCh",0)} onChange={dlgNumChange(dlgData,setDlgData,"valCh")} onBlur={dlgNumBlur(dlgData,setDlgData,"valCh",0,0,127)} />
          </div>
        </div> : null}
                {dlgData.tab==="effects" ? <div style={{fontSize:11}}>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.valDlyOn?6:0}}><input type="checkbox" checked={!!dlgData.valDlyOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{valDlyOn:e.target.checked,chkDly:true}));}} />{"Delay"}</label>
            {dlgData.valDlyOn ? <div>
              <DlgRow label="Time:" lw={50}><select value={dlgData.valDlyTime||"8d"} onChange={function(e){setDlgData(Object.assign({},dlgData,{valDlyTime:e.target.value,chkDly:true}));}} style={{flex:1}}><option value="4">{"Quarter"}</option><option value="8">{"Eighth"}</option><option value="8d">{"Dotted 8th"}</option><option value="16">{"16th"}</option><option value="slap">{"Slapback"}</option></select></DlgRow>
              <DlgRow label="Taps:" lw={50}><input type="range" min={1} max={8} value={dlgData.valDlyTaps||3} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valDlyTaps:+e.target.value,chkDly:true}));}} /><span style={{width:24,textAlign:"right"}}>{dlgData.valDlyTaps||3}</span></DlgRow>
              <DlgRow label="Mix:" lw={50}><input type="range" min={10} max={90} value={dlgData.valDlyMix||50} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valDlyMix:+e.target.value,chkDly:true}));}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.valDlyMix||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.valOctOn?6:0}}><input type="checkbox" checked={!!dlgData.valOctOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{valOctOn:e.target.checked,chkOct:true}));}} />{"Pitch Shifter"}</label>
            {dlgData.valOctOn ? <div>
              <DlgRow label="Shift:" lw={50}><select value={dlgData.valOctShift||-12} onChange={function(e){setDlgData(Object.assign({},dlgData,{valOctShift:+e.target.value,chkOct:true}));}} style={{flex:1}}><option value={-24}>{"-2 oct"}</option><option value={-12}>{"-1 oct"}</option><option value={-7}>{"-5th"}</option><option value={-5}>{"-4th"}</option><option value={3}>{"+min 3rd"}</option><option value={4}>{"+maj 3rd"}</option><option value={5}>{"+4th"}</option><option value={7}>{"+5th"}</option><option value={12}>{"+1 oct"}</option><option value={24}>{"+2 oct"}</option></select></DlgRow>
              <DlgRow label="Dry:" lw={50}><input type="range" min={0} max={100} value={dlgData.valOctDry!=null?dlgData.valOctDry:100} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valOctDry:+e.target.value,chkOct:true}));}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.valOctDry!=null?dlgData.valOctDry:100)+"%"}</span></DlgRow>
              <DlgRow label="Wet:" lw={50}><input type="range" min={10} max={100} value={dlgData.valOctMix||50} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valOctMix:+e.target.value,chkOct:true}));}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.valOctMix||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>


          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600",marginBottom:dlgData.valTremOn?6:0}}><input type="checkbox" checked={!!dlgData.valTremOn} onChange={function(e){setDlgData(Object.assign({},dlgData,{valTremOn:e.target.checked,chkTrem:true}));}} />{"Tremolo"}</label>
            {dlgData.valTremOn ? <div>
              <DlgRow label="Speed:" lw={50}><select value={dlgData.valTremSpeed||"8"} onChange={function(e){setDlgData(Object.assign({},dlgData,{valTremSpeed:e.target.value,chkTrem:true}));}} style={{flex:1}}><option value="4">{"Quarter"}</option><option value="8">{"Eighth"}</option><option value="8t">{"Eighth triplet"}</option><option value="16">{"16th"}</option></select></DlgRow>
              <DlgRow label="Depth:" lw={50}><input type="range" min={20} max={100} value={dlgData.valTremDepth||70} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valTremDepth:+e.target.value,chkTrem:true}));}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.valTremDepth||70)+"%"}</span></DlgRow>
            </div> : null}
          </div>
          <div style={{border:"1px solid var(--border-subtle,#e4e8f0)",padding:8,margin:"4px 0",borderRadius:6}}>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontWeight:"600"}}><input type="checkbox" checked={(dlgData.valAdt||0)>0} onChange={function(e){setDlgData(Object.assign({},dlgData,{valAdt:e.target.checked?(dlgData.valAdt||50):0,chkAdt:true}));}} />{"ADT (Auto Double Tracking)"}</label>
            {(dlgData.valAdt||0)>0 ? <div style={{marginTop:6}}>
              <DlgRow label="Amount:" lw={60}><input type="range" min={1} max={100} value={dlgData.valAdt||50} style={{flex:1}} onMouseDown={blurActive} onTouchStart={blurActive} onChange={function(e){setDlgData(Object.assign({},dlgData,{valAdt:+e.target.value,chkAdt:true}));}} /><span style={{width:30,textAlign:"right"}}>{(dlgData.valAdt||50)+"%"}</span></DlgRow>
            </div> : null}
          </div>
        </div> : null}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}><DlgBtn o={function(){
          if(!song)return closeDlg();
          var s2=JSON.parse(JSON.stringify(song));
          var m2=s2.tracks[ati].measures[cur.measure];
          if(!m2||!m2.beats[cur.beat]){closeDlg();return;}
          // Build effects list from checked items
          _undoLabel.current="Track Effects";var effects=[];
          if(dlgData.chkT) effects.push({type:84,value:dlgData.valT||song.tempo||120});
          if(dlgData.chkI){var iv=(dlgData.valI!==undefined?dlgData.valI:track.instrument)&0x7F; effects.push({type:73,value:iv,letRing:dlgData.valLR!==false});}
          if(dlgData.chkV) effects.push({type:86,value:(dlgData.valV!==""&&!isNaN(+dlgData.valV))?+dlgData.valV:96});
          if(dlgData.chkVel) effects.push({type:200,value:(dlgData.valVel!==""&&!isNaN(+dlgData.valVel))?+dlgData.valVel:80});
          if(dlgData.chkEx) effects.push({type:69,value:(dlgData.valEx!==""&&!isNaN(+dlgData.valEx))?+dlgData.valEx:127});
          if(dlgData.chkSD) effects.push({type:68,value:0});
          if(dlgData.chkSU) effects.push({type:85,value:0});
          if(dlgData.chkB){var bv=(dlgData.valB!==""&&!isNaN(+dlgData.valB))?+dlgData.valB:0; var r16=bv<0?bv+65536:bv; effects.push({type:66,value:r16,raw16:r16&0xFFFF});}
          if(dlgData.chkM) effects.push({type:77,value:(dlgData.valM!==""&&!isNaN(+dlgData.valM))?+dlgData.valM:0});
          if(dlgData.chkP) effects.push({type:80,value:(dlgData.valP!==""&&!isNaN(+dlgData.valP))?+dlgData.valP:64});
          if(dlgData.chkRv) effects.push({type:82,value:(dlgData.valRv!==""&&!isNaN(+dlgData.valRv))?+dlgData.valRv:0});
          if(dlgData.chkCh) effects.push({type:67,value:(dlgData.valCh!==""&&!isNaN(+dlgData.valCh))?+dlgData.valCh:0});
          if(dlgData.chkDly) effects.push({type:201,delayOn:dlgData.valDlyOn!==false,delayTime:dlgData.valDlyTime||"8d",delayTaps:dlgData.valDlyTaps||3,delayMix:dlgData.valDlyMix||50});
          if(dlgData.chkTrem) effects.push({type:204,tremOn:!!dlgData.valTremOn,tremSpeed:dlgData.valTremSpeed||'8',tremDepth:dlgData.valTremDepth||70});
          if(dlgData.chkAdt) effects.push({type:205,value:dlgData.valAdt||0});
          if(dlgData.chkOct) effects.push({type:202,octOn:!!dlgData.valOctOn,octShift:dlgData.valOctShift||-12,octDry:dlgData.valOctDry!=null?dlgData.valOctDry:100,octMix:dlgData.valOctMix||50});
          if(effects.length===0){delete m2.beats[cur.beat].trkEffect;}
          else if(effects.length===1){m2.beats[cur.beat].trkEffect=effects[0];}
          else{m2.beats[cur.beat].trkEffect=effects[0]; effects[0].multi=effects.slice(1);}
          setSong(s2); closeDlg();
        }} primary>OK</DlgBtn><DlgBtn o={closeDlg}>Cancel</DlgBtn></div>
        </div>
      </Modal>

      <Modal show={dlg==="openUrl"} title="Open from URL" onClose={closeDlg}>
        <div style={{fontSize:11}}>
          <p>{"Enter the URL of a .tbt file:"}</p>
          <input value={dlgData.url||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{url:e.target.value}));}}
            onKeyDown={function(e){if(e.key==="Enter"){openFromUrl(dlgData.url);closeDlg();}}}
            placeholder="https://example.com/song.tbt"
            style={{width:"100%",border:"1px solid var(--dlg-input-border,#7f9db9)",padding:"4px",fontSize:11,boxSizing:"border-box"}} />
          <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}>
            <DlgBtn o={function(){openFromUrl(dlgData.url);closeDlg();}} primary>Open</DlgBtn>
            <DlgBtn o={closeDlg}>Cancel</DlgBtn>
          </div>
        </div>
      </Modal>

      <Modal show={dlg==="openShared"} title="Open Shared" onClose={closeDlg}>
        <div style={{fontSize:11}}>
          <p>{"Enter a share ID or share link:"}</p>
          <input value={dlgData.shareInput||""} onChange={function(e){setDlgData(Object.assign({},dlgData,{shareInput:e.target.value}));}}
            onKeyDown={function(e){if(e.key==="Enter"){var inp=(dlgData.shareInput||"").trim();var sid=inp.match(/[?&]share=([a-z0-9]+)/);sid=sid?sid[1]:inp.replace(/[^a-z0-9]/g,"");if(sid)loadSharedTab(sid);closeDlg();}}}
            placeholder="abc12345 or https://...?share=abc12345"
            style={{width:"100%",border:"1px solid var(--dlg-input-border,#7f9db9)",padding:"4px",fontSize:11,boxSizing:"border-box",fontFamily:"monospace"}} />
          <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:10}}>
            <DlgBtn o={function(){var inp=(dlgData.shareInput||"").trim();var sid=inp.match(/[?&]share=([a-z0-9]+)/);sid=sid?sid[1]:inp.replace(/[^a-z0-9]/g,"");if(sid)loadSharedTab(sid);closeDlg();}} primary>Open</DlgBtn>
            <DlgBtn o={closeDlg}>Cancel</DlgBtn>
          </div>
        </div>
      </Modal>

      {/* Retune Confirmation Dialog */}
      <Modal show={dlg==="retuneConfirm"} title="Tuning Changed" onClose={function(){if(dlgData&&dlgData.pendingSong){setSong(dlgData.pendingSong);addRecentInstrument(dlgData.instrument);preloadSong(dlgData.pendingSong.tracks);}closeDlg();}}>
        {dlgData && dlgData.oldTuning ? <div>
          <div style={{fontSize:12,marginBottom:12}}>{"The tuning has changed. Would you like to adjust the existing notes to preserve their pitch?"}</div>
          <div style={{fontSize:11,opacity:0.7,marginBottom:4}}>{"Old: "+dlgData.oldTuning.map(function(v){return noteKey(v);}).join(", ")}</div>
          <div style={{fontSize:11,opacity:0.7,marginBottom:14}}>{"New: "+dlgData.newTuning.map(function(v){return noteKey(v);}).join(", ")}</div>
          {dlgData.retuneResult ? <div style={{fontSize:11,padding:"8px 10px",background:darkMode?"rgba(50,200,80,0.1)":"#f0f8f0",border:"1px solid "+(darkMode?"#2a6":"#8c8"),borderRadius:6,marginBottom:10}}>
            <div style={{fontWeight:"600",marginBottom:4}}>{"\u2714 Notes adjusted"}</div>
            <div>{dlgData.retuneResult.adjusted+" notes retuned"+(dlgData.retuneResult.moved?", "+dlgData.retuneResult.moved+" moved to different strings":"")}</div>
            {dlgData.retuneResult.outOfRange>0 ? <div style={{color:darkMode?"#f80":"#c60",marginTop:4}}>{"\u26A0 "+dlgData.retuneResult.outOfRange+" note"+(dlgData.retuneResult.outOfRange!==1?"s":"")+" out of range"+
              (dlgData.retuneResult.outOfRangeLocs.length>0?" (bar "+dlgData.retuneResult.outOfRangeLocs.map(function(l){return l.measure;}).join(", ")+")":"")}</div> : null}
            <div style={{fontSize:10,opacity:0.5,marginTop:6,fontStyle:"italic"}}>{"Some manual adjustment to fingering and voicings may be necessary."}</div>
          </div> : null}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {!dlgData.retuneResult ? <DlgBtn o={function(){
              var s6=dlgData.pendingSong;
              var t6=s6.tracks[dlgData.trackIdx];
              _undoLabel.current="Retune (preserve pitch)";var result=retuneTrack(t6,dlgData.oldTuning,dlgData.newTuning,t6.maxFret||24);
              setSong(s6);addRecentInstrument(dlgData.instrument);preloadSong(s6.tracks);
              setDlgData(Object.assign({},dlgData,{retuneResult:result}));
              setStatus("Retuned: "+result.adjusted+" adjusted"+(result.moved?", "+result.moved+" moved":"")+(result.outOfRange?", "+result.outOfRange+" out of range":""));
            }} primary>{"Adjust Notes (preserve pitch)"}</DlgBtn> : null}
            {!dlgData.retuneResult ? <DlgBtn o={function(){
              _undoLabel.current="Tuning Change";setSong(dlgData.pendingSong);addRecentInstrument(dlgData.instrument);preloadSong(dlgData.pendingSong.tracks);closeDlg();
              setStatus("Tuning changed — fret numbers kept as-is");
            }}>{"Keep Fret Numbers (pitch will change)"}</DlgBtn> : null}
            {dlgData.retuneResult ? <DlgBtn o={closeDlg} primary>{"Done"}</DlgBtn> : null}
          </div>
        </div> : null}
      </Modal>

      {/* Find & Replace */}

      {/* Edit Tokens Manager */}
      <Modal show={dlg==="editTokens"} title="Edit Token Manager" onClose={closeDlg}>
        {dlgData && dlgData.tokens ? <div>
          <div style={{fontSize:11,opacity:0.6,marginBottom:10}}>{"Edit tokens give you permission to update or delete your shared tabs. Losing a token means losing edit access to that share."}</div>
          {Object.keys(dlgData.tokens).length === 0 ? <div style={{fontSize:12,opacity:0.4,padding:"16px 0",textAlign:"center"}}>{"No edit tokens stored"}</div> :
          <div style={{maxHeight:240,overflowY:"auto",border:"1px solid var(--dlg-border,#ccc)",borderRadius:6,marginBottom:10}}>
            {Object.keys(dlgData.tokens).map(function(sid){
              var info = (dlgData.tabInfo||{})[sid];
              var label = info ? (info.artist ? info.artist + " \u2013 " : "") + info.title : sid;
              var isPrivate = info && info.visibility === "private";
              return <div key={sid} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderBottom:"1px solid var(--dlg-border,#e0e0e0)",fontSize:11}}>
                <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
                  <div style={{fontWeight:"600",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={label}>{label}{isPrivate ? <span style={{fontSize:9,opacity:0.5,marginLeft:6}}>{"\uD83D\uDD12"}</span> : null}</div>
                  <div style={{fontSize:9,opacity:0.4,fontFamily:"monospace"}}>{sid}</div>
                </div>
                <span style={{cursor:"pointer",color:"var(--accent,#3264dc)",fontSize:10,flexShrink:0}} onClick={function(){try{navigator.clipboard.writeText(dlgData.tokens[sid]);}catch(e){window.prompt("Token:",dlgData.tokens[sid]);}}}>{"copy"}</span>
                <span style={{cursor:"pointer",color:"#c44",fontSize:10,flexShrink:0}} onClick={function(){var t2=Object.assign({},dlgData.tokens);delete t2[sid];localStorage.setItem("tabkit_share_tokens",JSON.stringify(t2));setDlgData(Object.assign({},dlgData,{tokens:t2}));}}>{"del"}</span>
              </div>;
            })}
          </div>}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <DlgBtn o={function(){
              var json=JSON.stringify(dlgData.tokens,null,2);
              var blob=new Blob([json],{type:"application/json"});
              var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tabkit-tokens.json";a.click();URL.revokeObjectURL(a.href);
            }}>{"Export All"}</DlgBtn>
            <DlgBtn o={function(){
              var inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=function(){
                var r=new FileReader();r.onload=function(){
                  try{
                    var imported=JSON.parse(r.result);
                    if(typeof imported!=="object"||Array.isArray(imported)){setDlgData(Object.assign({},dlgData,{importErr:"Invalid format"}));return;}
                    var merged=Object.assign({},dlgData.tokens,imported);
                    localStorage.setItem("tabkit_share_tokens",JSON.stringify(merged));
                    var added=Object.keys(imported).filter(function(k){return !dlgData.tokens[k];}).length;
                    var updated=Object.keys(imported).filter(function(k){return dlgData.tokens[k]&&dlgData.tokens[k]!==imported[k];}).length;
                    setDlgData(Object.assign({},dlgData,{tokens:merged,importErr:null,importMsg:added+" added, "+updated+" updated"}));
                  }catch(e){setDlgData(Object.assign({},dlgData,{importErr:"Invalid JSON"}));}
                };r.readAsText(inp.files[0]);
              };inp.click();
            }}>{"Import"}</DlgBtn>
            <DlgBtn o={function(){
              var sid=prompt("Share ID:");
              if(!sid||!sid.trim())return;
              var tok=prompt("Edit token for "+sid+":");
              if(!tok||!tok.trim())return;
              var t2=Object.assign({},dlgData.tokens);t2[sid.trim()]=tok.trim();
              localStorage.setItem("tabkit_share_tokens",JSON.stringify(t2));
              setDlgData(Object.assign({},dlgData,{tokens:t2}));
            }}>{"Add Token"}</DlgBtn>
          </div>
          {dlgData.importErr ? <div style={{fontSize:10,color:"#c44",marginTop:6}}>{dlgData.importErr}</div> : null}
          {dlgData.importMsg ? <div style={{fontSize:10,color:"#4a4",marginTop:6}}>{dlgData.importMsg}</div> : null}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><DlgBtn o={closeDlg} primary>{"Done"}</DlgBtn></div>
        </div> : null}
      </Modal>

      {/* Instrument Quick-Pick Overlay */}
      {instPickTrack>=0 && song && instPickTrack<song.tracks.length && !song.tracks[instPickTrack].isDrum && <div>
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:450}} onClick={function(){setInstPickTrack(-1);}} />
        <div style={{position:"fixed",left:Math.min(_instPickPos.current.x,window.innerWidth-200),top:Math.min(_instPickPos.current.y,window.innerHeight-200),zIndex:451,background:darkMode?"#2a2a30":"#fff",border:"1px solid "+(darkMode?"#444":"#ccc"),borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",minWidth:190,padding:"4px 0",fontSize:12,color:TH.text}}
          onClick={function(ev){ev.stopPropagation();}}>
          {getRecentInstruments().length===0 && <div style={{padding:"8px 12px",color:TH.dim||"#888",fontStyle:"italic",fontSize:11}}>Recent instruments will appear here</div>}
          {getRecentInstruments().map(function(p){
            var isCur=song.tracks[instPickTrack].instrument===p;
            return <div key={p} style={{padding:"7px 12px",cursor:"pointer",background:isCur?(darkMode?"#3264dc":"#3264dc"):"transparent",color:isCur?"#fff":"inherit",transition:"background 0.1s"}}
              onMouseEnter={function(e){if(!isCur)e.target.style.background=darkMode?"#333":"#f0f0f0";}}
              onMouseLeave={function(e){if(!isCur)e.target.style.background="transparent";}}
              onClick={function(){changeTrackInstrument(instPickTrack,p);}}>{GM[p]||"Program "+p}</div>;
          })}
          <div style={{borderTop:"1px solid "+(darkMode?"#444":"#ddd"),margin:"2px 0"}}></div>
          <div style={{padding:"7px 12px",cursor:"pointer",color:darkMode?"#6898e0":"#3264dc",fontWeight:"600",transition:"background 0.1s"}}
            onMouseEnter={function(e){e.target.style.background=darkMode?"#333":"#f0f0f0";}}
            onMouseLeave={function(e){e.target.style.background="transparent";}}
            onClick={function(){var ti=instPickTrack;setInstPickTrack(-1);var tp5=song.tracks[ti];openDlg("trackProps",trackPropsData(tp5,"playback"));}}>Show All...</div>
        </div>
      </div>}

      {/* MIDI Import Summary */}
      {midiSummary && <div>
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,background:"rgba(0,0,0,0.4)"}} onClick={function(){setMidiSummary(null);}} />
        <div style={isMobile?{position:"fixed",bottom:0,left:0,right:0,zIndex:501,background:darkMode?"#222":"#fff",borderRadius:"14px 14px 0 0",boxShadow:"0 -4px 24px rgba(0,0,0,0.2)",padding:"20px 20px 28px",color:TH.text}:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:501,background:darkMode?"#222":"#fff",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",padding:"24px 28px",maxWidth:340,width:"90%",color:TH.text}}>
          {isMobile && <div style={{width:36,height:4,borderRadius:2,background:darkMode?"#555":"#ccc",margin:"0 auto 14px"}} />}
          <div style={{fontSize:16,fontWeight:700,marginBottom:14}}>MIDI Import Summary</div>
          <div style={{fontSize:13,lineHeight:"22px"}}>
            <div><span style={{color:TH.dim}}>Title:</span> {midiSummary.title}</div>
            <div><span style={{color:TH.dim}}>Duration:</span> {midiSummary.duration}</div>
            <div><span style={{color:TH.dim}}>Tempo:</span> {midiSummary.tempo} BPM</div>
            <div><span style={{color:TH.dim}}>Tracks:</span> {midiSummary.tracks}</div>
            <div><span style={{color:TH.dim}}>Measures:</span> {midiSummary.measures}{midiSummary.atr>0?" ("+midiSummary.atr+" ATR)":""}</div>
          </div>
          <div style={{fontSize:11,color:TH.dim,marginTop:14,lineHeight:"16px"}}>
            Note: Reconstructing tablature from MIDI is not 100% accurate. Fret positions, string assignments, and effects are approximated. Some post-import cleanup may be needed.
          </div>
          <div style={{textAlign:"right",marginTop:16}}>
            <button style={{padding:"8px 24px",fontSize:14,fontWeight:600,borderRadius:8,border:"none",background:"var(--accent,#3264dc)",color:"#fff",cursor:"pointer"}} onClick={function(){setMidiSummary(null);}}>OK</button>
          </div>
        </div>
      </div>}

      {/* Context Menu (right-click desktop / long-press mobile) */}
      {ctxMenuData ? <div>
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:400}} onClick={function(){setCtxMenuData(null);}} />
        <div style={{position:"fixed",left:Math.min(ctxMenuData.x,window.innerWidth-180),top:Math.min(ctxMenuData.y,window.innerHeight-300),background:"var(--surface-0,#fff)",border:"1px solid var(--border-subtle,#e4e8f0)",borderRadius:12,boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.15))",zIndex:401,padding:"4px 0",minWidth:190,color:TH.text,fontSize:12}}>
          {[
            {n:"Cut",k:getCombo("cut"),a:function(){
              if(sel){
                var selN=normSel(sel,track);var s5=JSON.parse(JSON.stringify(song));
                var tSt=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
                var tEn=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
                if(tSt===tEn){
                  var copied=[];for(var si5=selN.sm;si5<=selN.em;si5++){var m5=track.measures[si5];if(!m5)continue;var sb5=(si5===selN.sm)?selN.sb:0;var eb5=(si5===selN.em)?selN.eb:m5.beats.length-1;for(var bi5=sb5;bi5<=eb5;bi5++){copied.push(JSON.parse(JSON.stringify(m5.beats[bi5])));s5.tracks[ati].measures[si5].beats[bi5]={notes:Array(track.numStrings).fill(null)};}}
                  clipboard.current={type:"range",data:copied,numStrings:track.numStrings};setStatus("Cut "+copied.length+" beats");
                } else {
                  var mtTracks=[];
                  for(var mti=tSt;mti<=tEn&&mti<song.tracks.length;mti++){var mtk=song.tracks[mti];var mtd=[];for(var msi=selN.sm;msi<=selN.em;msi++){var mm=mtk.measures[msi];if(!mm)continue;var msb=(msi===selN.sm)?selN.sb:0;var meb=(msi===selN.em)?selN.eb:mm.beats.length-1;for(var mbi=msb;mbi<=meb;mbi++){mtd.push(JSON.parse(JSON.stringify(mm.beats[mbi])));s5.tracks[mti].measures[msi].beats[mbi]={notes:Array(mtk.numStrings).fill(null)};}}mtTracks.push({data:mtd,numStrings:mtk.numStrings});}
                  clipboard.current={type:"multitrack",tracks:mtTracks};setStatus("Cut "+mtTracks.length+" tracks");
                }
                setSong(s5);setSel(null);
              }else{cutBeat();}}},
            {n:"Copy",k:getCombo("copy"),a:function(){
              if(sel){
                var selN2=normSel(sel,track);
                var tSt2=sel.startTrack!=null?Math.min(sel.startTrack,sel.endTrack):ati;
                var tEn2=sel.endTrack!=null?Math.max(sel.startTrack,sel.endTrack):ati;
                if(tSt2===tEn2){
                  var copied2=[];for(var si6=selN2.sm;si6<=selN2.em;si6++){var m6=track.measures[si6];if(!m6)continue;var sb6=(si6===selN2.sm)?selN2.sb:0;var eb6=(si6===selN2.em)?selN2.eb:m6.beats.length-1;for(var bi6=sb6;bi6<=eb6;bi6++){copied2.push(JSON.parse(JSON.stringify(m6.beats[bi6])));}}
                  clipboard.current={type:"range",data:copied2,numStrings:track.numStrings};setStatus("Copied "+copied2.length+" beats");
                } else {
                  var mtTracks2=[];
                  for(var mti2=tSt2;mti2<=tEn2&&mti2<song.tracks.length;mti2++){var mtk2=song.tracks[mti2];var mtd2=[];for(var msi2=selN2.sm;msi2<=selN2.em;msi2++){var mm2=mtk2.measures[msi2];if(!mm2)continue;var msb2=(msi2===selN2.sm)?selN2.sb:0;var meb2=(msi2===selN2.em)?selN2.eb:mm2.beats.length-1;for(var mbi2=msb2;mbi2<=meb2;mbi2++){mtd2.push(JSON.parse(JSON.stringify(mm2.beats[mbi2])));}}mtTracks2.push({data:mtd2,numStrings:mtk2.numStrings});}
                  clipboard.current={type:"multitrack",tracks:mtTracks2};setStatus("Copied "+mtTracks2.length+" tracks");
                }
              }else{try{var cb=track.measures[cur.measure].beats[cur.beat];clipboard.current={type:"beat",data:JSON.parse(JSON.stringify(cb)),numStrings:track.numStrings};setStatus("Copied beat");}catch(e){}}}},
            {n:"Paste",k:getCombo("paste"),a:function(){
              if(!clipboard.current)return;
              var s6=JSON.parse(JSON.stringify(song));
              if(clipboard.current.type==="multitrack"){
                var mtSrc=clipboard.current.tracks;
                for(var pti=0;pti<mtSrc.length&&ati+pti<s6.tracks.length;pti++){var pdst=s6.tracks[ati+pti];var psrcNS=mtSrc[pti].numStrings||6;var pdstNS=pdst.numStrings;var pbeats=mtSrc[pti].data;var ppm=cur.measure,ppb=cur.beat;for(var ppi=0;ppi<pbeats.length;ppi++){if(ppm>=pdst.measures.length)break;var pSrcBt=JSON.parse(JSON.stringify(pbeats[ppi]));var pMap=Array(pdstNS).fill(null);for(var psn=0;psn<psrcNS&&psn<pSrcBt.notes.length;psn++){if(!pSrcBt.notes[psn])continue;if(pdstNS<psrcNS){if(psn<pdstNS)pMap[psn]=pSrcBt.notes[psn];}else if(pdstNS>psrcNS){var poff=pdstNS-psrcNS;if(psn+poff<pdstNS)pMap[psn+poff]=pSrcBt.notes[psn];}else{pMap[psn]=pSrcBt.notes[psn];}}pSrcBt.notes=pMap;pdst.measures[ppm].beats[ppb]=pSrcBt;ppb++;if(ppb>=pdst.measures[ppm].beats.length){ppm++;ppb=0;}}}
                setSong(s6);setSel(null);setStatus("Pasted "+mtSrc.length+" tracks");
              } else {
                var dst=s6.tracks[ati];var srcNS=clipboard.current.numStrings||6;var dstNS=dst.numStrings;var beats6=clipboard.current.type==="range"?clipboard.current.data:[clipboard.current.data];var pm=cur.measure;var pb3=cur.beat;for(var pi2=0;pi2<beats6.length;pi2++){if(pm>=dst.measures.length)break;var srcBeat=JSON.parse(JSON.stringify(beats6[pi2]));var mappedNotes=Array(dstNS).fill(null);for(var sn=0;sn<srcNS&&sn<srcBeat.notes.length;sn++){if(!srcBeat.notes[sn])continue;if(dstNS<srcNS){if(sn<dstNS)mappedNotes[sn]=srcBeat.notes[sn];}else if(dstNS>srcNS){var offset=dstNS-srcNS;if(sn+offset<dstNS)mappedNotes[sn+offset]=srcBeat.notes[sn];}else{mappedNotes[sn]=srcBeat.notes[sn];}}srcBeat.notes=mappedNotes;dst.measures[pm].beats[pb3]=srcBeat;pb3++;if(pb3>=dst.measures[pm].beats.length){pm++;pb3=0;}}
                setSong(s6);setSel(null);setStatus("Pasted "+beats6.length+" beats");
              }}},
            {n:"-"},
            {n:"Clear Beat",k:"Space",a:function(){clearBeat();}},
            {n:"Clear Note",k:getCombo("deleteNote"),a:function(){var s9=JSON.parse(JSON.stringify(song));if(cur.string>=0&&cur.string<track.numStrings)s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string]=null;setSong(s9);}},
            {n:"-"},
            {n:"Note Velocity...",k:getCombo("noteVelocity"),sym:"Ve",a:function(){var vn=track.measures[cur.measure]&&track.measures[cur.measure].beats[cur.beat]&&track.measures[cur.measure].beats[cur.beat].notes[cur.string];if(vn){var newV=window.prompt("Note velocity (1-127, track default: "+(track.trackVelocity||80)+")\nLeave empty to use track default:",vn.vel!==undefined?String(vn.vel):"");if(newV!==null){var s9=JSON.parse(JSON.stringify(song));var nn=s9.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];if(newV.trim()===""){delete nn.vel;}else{var vv=parseInt(newV);if(!isNaN(vv)&&vv>=1&&vv<=127)nn.vel=vv;}setSong(s9);}}else{setStatus("No note at cursor");}}},
            {n:"Track Effects...",k:getCombo("trackEffects"),a:function(){openDlg("trackEffects",buildEfxData());}},
            {n:"Track Properties...",k:getCombo("trackProps"),a:function(){var tp3=song.tracks[ati];openDlg("trackProps",trackPropsData(tp3));}},
            {n:"-"},
            {n:"Insert Bar at Cursor",k:getCombo("insertBar"),a:function(){var s9=JSON.parse(JSON.stringify(song));var iTs=getTimeSig(s9.tracks[0].measures[cur.measure]);var iBts=timeSigBeats(iTs.num,iTs.den);for(var ti9=0;ti9<s9.tracks.length;ti9++){var nb=[];for(var bi9=0;bi9<iBts;bi9++)nb.push({notes:new Array(s9.tracks[ti9].numStrings).fill(null)});s9.tracks[ti9].measures.splice(cur.measure,0,{beats:nb,barLine:"single",beatsPerMeasure:iBts,globalBeatsPerMeasure:iBts,isATR:false,timeSig:{num:iTs.num,den:iTs.den}});}shiftSections(s9,cur.measure,1);setSong(s9);setStatus("Inserted bar");}},
            {n:"Delete Bar at Cursor",k:getCombo("deleteBar"),a:function(){if(song.tracks[0].measures.length<=1){setStatus("Cannot delete last bar");return;}var s9=JSON.parse(JSON.stringify(song));for(var ti9=0;ti9<s9.tracks.length;ti9++)s9.tracks[ti9].measures.splice(cur.measure,1);var nm9=Math.min(cur.measure,s9.tracks[0].measures.length-1);setCur({measure:nm9,beat:0,string:cur.string});shiftSections(s9,cur.measure,-1);setSong(s9);setStatus("Deleted bar");}},
            {n:"Duplicate Bar",a:function(){var s9=JSON.parse(JSON.stringify(song));for(var ti9=0;ti9<s9.tracks.length;ti9++){var dup=JSON.parse(JSON.stringify(s9.tracks[ti9].measures[cur.measure]));s9.tracks[ti9].measures.splice(cur.measure+1,0,dup);}shiftSections(s9,cur.measure+1,1);setSong(s9);setCur({measure:cur.measure+1,beat:0,string:cur.string});setStatus("Duplicated bar");}},
            {n:"Insert Bar Line",a:function(){if(cur.beat<=0){setStatus("Place cursor past beat 1 to insert a bar line");return;}var sb=JSON.parse(JSON.stringify(song));var splitBeat=cur.beat;for(var ti2=0;ti2<sb.tracks.length;ti2++){var trk=sb.tracks[ti2];var m=trk.measures[cur.measure];if(!m)continue;var bp=splitBeat,bp2=m.beats.length-splitBeat;if(bp2<=0)continue;var od=(m.timeSig&&m.timeSig.den)||4;var ts1=beatsToTimeSig(bp,od),ts2=beatsToTimeSig(bp2,od);var first={beats:m.beats.slice(0,splitBeat),barLine:"single",beatsPerMeasure:bp,globalBeatsPerMeasure:bp,isATR:!!m.isATR,timeSig:ts1};var second={beats:m.beats.slice(splitBeat),barLine:m.barLine||"single",beatsPerMeasure:bp2,globalBeatsPerMeasure:bp2,isATR:!!m.isATR,timeSig:ts2,staffBreak:m.staffBreak,repeatCount:m.repeatCount};trk.measures.splice(cur.measure,1,first,second);}shiftSections(sb,cur.measure+1,1);_undoLabel.current="Insert Bar Line";setSong(sb);setCur({measure:cur.measure+1,beat:0,string:cur.string});setStatus("Inserted bar line at M"+(cur.measure+1));}},
            {n:"-"},
            {n:"Indefinite Ring",k:"!",sym:"!",a:function(){
              var n9c=song.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string];
              if(n9c&&n9c.attack&&!n9c.stop&&!n9c.muted){var s9c=JSON.parse(JSON.stringify(song));s9c.tracks[ati].measures[cur.measure].beats[cur.beat].notes[cur.string].ring=!n9c.ring;setSong(s9c);}
            }},
            {n:"Time Signature...",k:getCombo("timeSig"),a:function(){var curTs2=getTimeSig(song.tracks[ati].measures[cur.measure]);openDlg("timeSig",{num:curTs2.num,den:curTs2.den,applyAll:false});}},
            {n:"Preview Tuning",a:function(){synthAllOff();var t9=song.tracks[ati];for(var si9=0;si9<t9.numStrings;si9++){var midi9=t9.isDrum?(t9.tuning[si9]||0):(t9.tuning[si9]||40)+(t9.capo||0)+(t9.transpose||0);setTimeout(function(m,d){return function(){synthOn(t9.midiChannel,m,70,t9.instrument);setTimeout(function(){},500);};}(midi9,si9*150),si9*150);}setStatus("Preview tuning: "+t9.name);}},
          ].map(function(item,ii){
            if(item.n==="-") return <div key={ii} style={{height:1,background:"var(--border-subtle,#e4e8f0)",margin:"4px 8px"}} />;
            return <div key={ii} style={{padding:isMobile?"10px 16px":"6px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",gap:16,borderRadius:6,margin:"0 4px",transition:"background 0.1s"}}
              onMouseEnter={function(e2){e2.currentTarget.style.background="var(--accent-soft,rgba(50,100,220,0.1))";e2.currentTarget.style.color="var(--accent,#3264dc)";}}
              onMouseLeave={function(e2){e2.currentTarget.style.background="";e2.currentTarget.style.color="";}}
              onClick={function(){item.a();setCtxMenuData(null);}}>
              <span>{item.n}</span>{!isMobile&&item.k?<span style={{fontSize:10,opacity:0.6}}>{kLabel(item.k)}</span>:null}
            </div>;
          })}
        </div>
      </div> : null}

      {/* Cheat Sheet Overlay */}
      {showCheatSheet ? <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}
        onClick={function(){setShowCheatSheet(false);}}>
        <div style={{background:"var(--surface-0,#fff)",color:TH.text,borderRadius:16,padding:"24px 32px",maxWidth:650,maxHeight:"85vh",overflow:"auto",boxShadow:"var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.2))",fontSize:12,lineHeight:1.9,border:"1px solid var(--border-subtle,#e4e8f0)"}} onClick={function(e){e.stopPropagation();}}>
          <div style={{fontSize:16,fontWeight:"700",marginBottom:14,textAlign:"center",letterSpacing:"-0.02em"}}>{"Keyboard Shortcuts"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 28px"}}>
            <div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Navigation"}</div>
              <div>{"← → ↑ ↓ — Move cursor"}</div>
              <div>{"Ctrl+←/→ — Prev/next bar"}</div>
              <div>{"Home/End — Start/end of bar"}</div>
              <div>{"Ctrl+Home/End — Start/end of song"}</div>
              <div>{"Tab/Shift+Tab — Next/prev track"}</div>
              <div>{"Ctrl+G — Go to bar"}</div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginTop:10,marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Input"}</div>
              <div>{"0-9 — Enter fret"}</div>
              <div>{"X — Muted"}</div>
              <div>{"* — Stop"}</div>
              <div>{"Space — Clear note (or selection)"}</div>
              <div>{"Del — Clear note"}</div>
              <div>{"Ctrl+↑/↓ — Move note to string"}</div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginTop:10,marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Techniques & Effects"}</div>
              <div>{"H P / \\ B R ~ T S ( < { W M"}</div>
              <div>{"! — Ring"}</div>
              <div>{"= — Bend Hold"}</div>
              <div>{"Ctrl+B — Pre-bend"}</div>
              <div>{"Ctrl+Shift+V — Velocity"}</div>
              <div>{"F — Track effects dialog"}</div>
              <div>{"Ctrl+Q — MIDI controllers"}</div>
            </div>
            <div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"File"}</div>
              <div>{"Ctrl+N — New"}</div>
              <div>{"Ctrl+O — Open"}</div>
              <div>{"Ctrl+S — Save (.tkt)"}</div>
              <div>{"Ctrl+W — Close tab"}</div>
              <div>{"Ctrl+Tab — Next tab"}</div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginTop:10,marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Edit"}</div>
              <div>{"Ctrl+Z — Undo"}</div>
              <div>{"Ctrl+X/C/V — Cut/Copy/Paste"}</div>
              <div>{"Shift+arrows — Select range"}</div>
              <div>{"Ctrl+Shift+arrows — Select bars"}</div>
              <div>{"Shift+Click — Extend selection"}</div>
              <div>{"Insert — Insert note"}</div>
              <div>{"Delete — Delete note"}</div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginTop:10,marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Song"}</div>
              <div>{"Ctrl+L — Title"}</div>
              <div>{"Ctrl+M — Tempo"}</div>
              <div>{"Ctrl+Shift+M — Time signature"}</div>
              <div>{"Ctrl+A — Track props"}</div>
              <div>{"Ctrl+Ins — Insert bar"}</div>
              <div>{"Ctrl+Del — Delete bar"}</div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginTop:10,marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Playback"}</div>
              <div>{"F5 — Play track"}</div>
              <div>{"F6 — Play all"}</div>
              <div>{"F7 — Hold to play"}</div>
              <div>{"F8/Esc — Stop"}</div>
              <div>{"F9 — Rewind after stop"}</div>
              <div>{"F11 — Metronome"}</div>
              <div style={{fontWeight:"600",color:"var(--accent,#3264dc)",marginTop:10,marginBottom:3,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>{"Tools"}</div>
              <div>{"Ctrl+K — Command palette"}</div>
              <div>{"Ctrl+Shift+C — Chord builder"}</div>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:14,color:"var(--text-muted,#999)",fontSize:11}}>{"Press ? or Esc to close \u00B7 Customize in Tools \u203A Shortcuts"}</div>
        </div>
      </div> : null}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
