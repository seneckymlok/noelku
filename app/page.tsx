"use client";

import { useState, FormEvent } from "react";
import BeatList from "./BeatList";

const ZIP_PATH = "/noeliiizi-stash-kit.zip";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(val: string): string {
  if (!val.trim()) return "Enter your email to get the kit.";
  if (!EMAIL_RE.test(val)) return "That doesn't look like a valid email.";
  return "";
}

export default function Page() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiError, setApiError] = useState("");

  function onChange(val: string) {
    setEmail(val);
    // Re-validate live only after the user has already seen an error.
    if (fieldError) setFieldError(validateEmail(val));
  }

  function onBlur() {
    // Validate on blur only if something was typed — don't nag on empty untouched field.
    if (email) setFieldError(validateEmail(email));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const err = validateEmail(email);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setApiError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setApiError(data.error || "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
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
      setApiError("Network error. Try again.");
    }
  }

  // The single error to display — field validation takes priority over API errors.
  const activeError = fieldError || apiError;

  return (
    <main className="page">
      <div className="bg" />

      <div className="frame">
        <div className="grid">
          <section className="hero">
            <div className="kicker fade" style={{ animationDelay: "0ms" }}>Noeliiizi · Drop 01</div>
            <h1 className="title fade" style={{ animationDelay: "100ms" }}>
              Free <span className="accent">Stash</span><br />Kit 01
            </h1>

            {status === "success" ? (
              <div className="success-block fade" style={{ animationDelay: "220ms" }}>
                <p className="success-msg">Locked in. Your stash is ready.</p>
                <a className="download-btn" href={ZIP_PATH} download="noeliiizi-stash-kit.zip">
                  ↓ Download Kit
                </a>
              </div>
            ) : (
              <div className="form-wrap fade" style={{ animationDelay: "220ms" }}>
                <form className="form" onSubmit={onSubmit} noValidate>
                  <input
                    className={`input${activeError ? " input--error" : ""}`}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    autoComplete="email"
                    disabled={status === "loading"}
                    aria-invalid={!!activeError}
                    aria-describedby={activeError ? "form-error" : undefined}
                  />
                  <button className="submit" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Sending…" : "Get Kit"}
                  </button>
                </form>

                <div className="form-feedback" aria-live="polite">
                  {activeError && (
                    <p className="field-error" id="form-error" key={activeError}>
                      <span className="field-error__icon" aria-hidden="true">!</span>
                      {activeError}
                    </p>
                  )}
                </div>

                <p className="consent">
                  By submitting you agree to receive occasional drops & updates. Unsubscribe any time.
                </p>
              </div>
            )}
          </section>

          <aside className="aside">
            <BeatList />
          </aside>
        </div>

        <footer className="footer fade" style={{ animationDelay: "880ms" }}>
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
