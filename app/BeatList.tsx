"use client";

import { useEffect, useRef, useState } from "react";
import waveforms from "./waveforms.json";

type Beat = {
  src: string;
  key: keyof typeof waveforms;
  title: string;
  bpm: number;
  scale?: string;
  collabs?: string[];
};

const BEATS: Beat[] = [
  { src: "/beats/loveemotions.mp3", key: "loveemotions", title: "loveemotions", bpm: 144 },
  { src: "/beats/remote.mp3", key: "remote", title: "remote", bpm: 147, collabs: ["@jonas8000808000"] },
  { src: "/beats/slovakian-trap-house.mp3", key: "slovakian-trap-house", title: "slovakian trap house", bpm: 140, collabs: ["@______jo__a", "@noeliiizi"] },
  { src: "/beats/swistem.mp3", key: "swistem", title: "swistem", bpm: 128 },
];

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Waveform({
  peaks,
  progress,
  onSeekStart,
}: {
  peaks: number[];
  progress: number;
  onSeekStart: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  // viewBox uses a fixed virtual width so peaks align across base + active layers.
  const W = peaks.length * 2;
  const H = 36;
  const bars = peaks.map((p, i) => {
    const h = Math.max(1.5, p * (H - 4));
    const y = (H - h) / 2;
    return <rect key={i} x={i * 2} y={y} width={1.2} height={h} />;
  });

  return (
    <div className="waveform" onPointerDown={onSeekStart} role="slider" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <svg className="wf-svg base" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {bars}
      </svg>
      <div className="wf-clip" style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}>
        <svg className="wf-svg active" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {bars}
        </svg>
      </div>
    </div>
  );
}

export default function BeatList() {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState<number[]>(BEATS.map(() => 0));
  const [duration, setDuration] = useState<number[]>(BEATS.map(() => 0));
  const [current, setCurrent] = useState<number[]>(BEATS.map(() => 0));

  useEffect(() => {
    return () => audioRefs.current.forEach((a) => a?.pause());
  }, []);

  function togglePlay(idx: number) {
    const audios = audioRefs.current;
    const target = audios[idx];
    if (!target) return;

    if (activeIdx === idx && !target.paused) {
      target.pause();
      setActiveIdx(null);
      return;
    }

    audios.forEach((a, i) => { if (a && i !== idx) a.pause(); });
    target.play().catch(() => {});
    setActiveIdx(idx);
  }

  function onTimeUpdate(idx: number) {
    const a = audioRefs.current[idx];
    if (!a) return;
    setProgress((p) => {
      const next = [...p];
      next[idx] = a.duration ? (a.currentTime / a.duration) * 100 : 0;
      return next;
    });
    setCurrent((c) => {
      const next = [...c];
      next[idx] = a.currentTime;
      return next;
    });
  }

  function onLoaded(idx: number) {
    const a = audioRefs.current[idx];
    if (!a) return;
    setDuration((d) => {
      const next = [...d];
      next[idx] = a.duration || 0;
      return next;
    });
  }

  function onEnded(idx: number) {
    setActiveIdx(null);
    setProgress((p) => { const n = [...p]; n[idx] = 0; return n; });
    setCurrent((c) => { const n = [...c]; n[idx] = 0; return n; });
  }

  function seekFromPointer(idx: number, clientX: number, rect: DOMRect) {
    const a = audioRefs.current[idx];
    if (!a || !a.duration) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    a.currentTime = pct * a.duration;
    setProgress((p) => { const n = [...p]; n[idx] = pct * 100; return n; });
    setCurrent((c) => { const n = [...c]; n[idx] = pct * a.duration; return n; });
  }

  function onSeekStart(idx: number) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      el.setPointerCapture(e.pointerId);
      seekFromPointer(idx, e.clientX, rect);

      const move = (ev: PointerEvent) => seekFromPointer(idx, ev.clientX, rect);
      const up = (ev: PointerEvent) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        try { el.releasePointerCapture(ev.pointerId); } catch {}
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    };
  }

  return (
    <div className="beats">
      <div className="beats-header fade" style={{ animationDelay: "380ms" }}>
        <span className="beats-title">Preview Beats</span>
        <span className="beats-count">{BEATS.length} TRACKS</span>
      </div>
      <ul className="beat-list">
        {BEATS.map((b, idx) => {
          const isActive = activeIdx === idx;
          const trackNo = String(idx + 1).padStart(2, "0");
          return (
            <li
              key={b.src}
              className={`beat-row fade ${isActive ? "active" : ""}`}
              style={{ animationDelay: `${460 + idx * 80}ms` }}
            >
              <audio
                ref={(el) => { audioRefs.current[idx] = el; }}
                src={b.src}
                preload="metadata"
                onTimeUpdate={() => onTimeUpdate(idx)}
                onLoadedMetadata={() => onLoaded(idx)}
                onEnded={() => onEnded(idx)}
              />
              <button
                className="play-btn"
                onClick={() => togglePlay(idx)}
                aria-label={isActive ? `Pause ${b.title}` : `Play ${b.title}`}
              >
                {isActive ? (
                  <>
                    <span className="eq" aria-hidden="true">
                      <span /><span /><span />
                    </span>
                    <svg className="pause-hover" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <rect x="2.5" y="1.5" width="3" height="11" />
                      <rect x="8.5" y="1.5" width="3" height="11" />
                    </svg>
                  </>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                    <path d="M3 1.5 L12.5 7 L3 12.5 Z" />
                  </svg>
                )}
              </button>

              <div className="beat-body">
                <div className="beat-meta-row">
                  <div className="beat-title-line">
                    <span className="track-no">{trackNo}</span>
                    <span className="track-sep">/</span>
                    <span className="beat-title">{b.title}</span>
                  </div>
                  <span className="beat-meta">
                    {b.bpm} BPM
                    {b.scale ? ` · ${b.scale}` : ""}
                    {duration[idx] > 0 && (
                      <span className="meta-duration"> · {formatTime(duration[idx])}</span>
                    )}
                  </span>
                </div>
                {b.collabs && (
                  <div className="beat-collabs">w/ {b.collabs.join(", ")}</div>
                )}
                <Waveform
                  peaks={waveforms[b.key]}
                  progress={progress[idx]}
                  onSeekStart={onSeekStart(idx)}
                />
                <div className="beat-times" data-active={isActive ? "true" : "false"}>
                  <span>{formatTime(current[idx])}</span>
                  <span>{formatTime(duration[idx])}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
