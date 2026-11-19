"use client";

import { useEffect, useState } from "react";

const words = ["THIJS", "MATTHIAS", "NDESARIO"];

export default function Home() {
  const [text, setText] = useState("");

  useEffect(() => {
    let word = 0;
    let length = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = words[word];
      length += deleting ? -1 : 1;
      setText(full.slice(0, length));
      let delay = deleting ? 70 : 140;
      if (!deleting && length === full.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && length === 0) {
        deleting = false;
        word = (word + 1) % words.length;
        delay = 400;
      }
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="wip-page">
      <section className="wip-hero">
        <h1 className="type-name" aria-label="Thijs Matthias Ndesario Mooren">
          <span aria-hidden="true">{text}<span className="type-cursor" /><br />MOOREN</span>
        </h1>
      </section>
      <footer className="wip-footer contact-footer">
        <span className="contact-links">
          <a href="mailto:mnm@matthiasndesario.com" className="contact-email">mnm@matthiasndesario.com</a>
          <a href="https://www.linkedin.com/in/thijs-mooren/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
        </span>
      </footer>
    </main>
  );
}
