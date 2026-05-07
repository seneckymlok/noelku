// Pre-generates per-beat waveform peak data so we ship JSON, not 23MB of MP3 decoding at runtime.
// Reads each MP3 in public/beats, decodes it, downsamples into N normalized peaks, writes app/waveforms.json.

import decode from "audio-decode";
import fs from "node:fs/promises";
import path from "node:path";

const BEATS_DIR = "public/beats";
const OUT_FILE = "app/waveforms.json";
const BARS = 96; // visual resolution per waveform

const files = (await fs.readdir(BEATS_DIR)).filter((f) => f.endsWith(".mp3"));

const result = {};
for (const file of files) {
  const buf = await fs.readFile(path.join(BEATS_DIR, file));
  const audio = await decode(buf);
  const ch = audio.channelData[0];
  const block = Math.floor(ch.length / BARS);

  // Peak (max abs) per block — produces visible dynamics for mastered audio.
  // RMS would average out into a flat line because the tracks are loudness-normalized.
  const peaks = new Array(BARS);
  for (let i = 0; i < BARS; i++) {
    let max = 0;
    const start = i * block;
    const end = start + block;
    for (let j = start; j < end; j++) {
      const v = ch[j] < 0 ? -ch[j] : ch[j];
      if (v > max) max = v;
    }
    peaks[i] = max;
  }

  // Normalize to 0..1, then expand dynamic range with a >1 gamma so quiet sections look quieter.
  const max = Math.max(...peaks);
  const normalized = peaks.map((p) => Math.pow(p / (max || 1), 1.6));

  // Floor so even the quietest bars are still visible (no zero-height bars).
  const FLOOR = 0.08;
  const rounded = normalized.map((p) => Number((FLOOR + (1 - FLOOR) * p).toFixed(3)));

  const key = file.replace(/\.mp3$/, "");
  result[key] = rounded;
  console.log(`✓ ${file} → ${BARS} bars`);
}

await fs.writeFile(OUT_FILE, JSON.stringify(result));
console.log(`\nWrote ${OUT_FILE}`);
