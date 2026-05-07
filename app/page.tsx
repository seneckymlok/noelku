"use client";

import { useState, FormEvent } from "react";
import BeatList from "./BeatList";

const ZIP_PATH = "/noeliiizi-stash-kit.zip";

export default function Page() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
      setMessage("Locked in. Your stash is ready.");
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = ZIP_PATH;
        a.download = "noeliiizi-stash-kit.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 500);
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <main className="page">
      <div className="bg" />

      <div className="frame">
        <div className="grid">
          <section className="hero">
            <div className="kicker">Noeliiizi · Drop 01</div>
            <h1 className="title">
              Free <span className="accent">Stash</span><br />Kit 01
            </h1>

            {status === "success" ? (
              <div className="success-block">
                <div className="message">{message}</div>
                <a className="download-btn" href={ZIP_PATH} download="noeliiizi-stash-kit.zip">
                  ↓ Download Kit
                </a>
              </div>
            ) : (
              <>
                <form className="form" onSubmit={onSubmit}>
                  <input
                    className="input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={status === "loading"}
                  />
                  <button className="submit" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Sending…" : "Get Kit"}
                  </button>
                </form>
                {message && status === "error" && (
                  <div className="message error">{message}</div>
                )}
                <div className="consent">
                  By submitting you agree to receive occasional drops & updates. Unsubscribe any time.
                </div>
              </>
            )}
          </section>

          <aside className="aside">
            <BeatList />
          </aside>
        </div>

        <footer className="footer">
          <a className="social-link" href="https://www.instagram.com/noeliiizi/" target="_blank" rel="noopener noreferrer">
            Instagram ↗
          </a>
          <a className="social-link" href="https://www.beatstars.com/vesternoel55" target="_blank" rel="noopener noreferrer">
            Beatstars ↗
          </a>
        </footer>
      </div>
    </main>
  );
}
