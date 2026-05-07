"use client";

import { useEffect, useRef, useState } from "react";

type Beat = {
  src: string;
  title: string;
  bpm: number;
  key?: string;
  collabs?: string[];
};

const BEATS: Beat[] = [
  {
    src: "/beats/loveemotions.mp3",
    title: "loveemotions",
    bpm: 144,
  },
  {
    src: "/beats/remote.mp3",
    title: "remote",
    bpm: 147,
    collabs: ["ashphryg", "@jonas8000808000"],
  },
  {
    src: "/beats/slovakian-trap-house.mp3",
    title: "slovakian trap house",
    bpm: 140,
    key: "D min",
    collabs: ["@______jo__a", "@noeliiizi"],
  },
  {
    src: "/beats/swistem.mp3",
    title: "swistem",
    bpm: 128,
  },
];

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function BeatList() {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState<number[]>(BEATS.map(() => 0));
  const [duration, setDuration] = useState<number[]>(BEATS.map(() => 0));
  const [current, setCurrent] = useState<number[]>(BEATS.map(() => 0));

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((a) => a?.pause());
    };
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

    audios.forEach((a, i) => {
      if (a && i !== idx) {
        a.pause();
      }
    });

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
    setProgress((p) => {
      const next = [...p];
      next[idx] = 0;
      return next;
    });
    setCurrent((c) => {
      const next = [...c];
      next[idx] = 0;
      return next;
    });
  }

  function seekFromPointer(idx: number, clientX: number, rect: DOMRect) {
    const a = audioRefs.current[idx];
    if (!a || !a.duration) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    a.currentTime = pct * a.duration;
    setProgress((p) => {
      const next = [...p];
      next[idx] = pct * 100;
      return next;
    });
    setCurrent((c) => {
      const next = [...c];
      next[idx] = pct * a.duration;
      return next;
    });
  }

  function onProgressPointerDown(idx: number, e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.setPointerCapture(e.pointerId);
    seekFromPointer(idx, e.clientX, rect);

    const move = (ev: PointerEvent) => {
      seekFromPointer(idx, ev.clientX, rect);
    };
    const up = (ev: PointerEvent) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      try { el.releasePointerCapture(ev.pointerId); } catch {}
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  return (
    <div className="beats">
      <div className="beats-header">
        <span className="beats-title">Preview Beats</span>
        <span className="beats-count">{BEATS.length}</span>
      </div>
      <ul className="beat-list">
        {BEATS.map((b, idx) => {
          const isActive = activeIdx === idx;
          return (
            <li key={b.src} className={`beat-row ${isActive ? "active" : ""}`}>
              <audio
                ref={(el) => {
                  audioRefs.current[idx] = el;
                }}
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
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="2" y="1" width="3.5" height="12" />
                    <rect x="8.5" y="1" width="3.5" height="12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M2 1 L13 7 L2 13 Z" />
                  </svg>
                )}
              </button>

              <div className="beat-body">
                <div className="beat-meta-row">
                  <span className="beat-title">{b.title}</span>
                  <span className="beat-meta">
                    {b.bpm} BPM
                    {b.key ? ` · ${b.key}` : ""}
                  </span>
                </div>
                {b.collabs && (
                  <div className="beat-collabs">w/ {b.collabs.join(", ")}</div>
                )}
                <div
                  className="progress"
                  onPointerDown={(e) => onProgressPointerDown(idx, e)}
                  role="slider"
                  aria-label="Seek"
                  aria-valuenow={Math.round(progress[idx])}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${progress[idx]}%` }}
                  />
                </div>
                <div className="beat-times">
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
