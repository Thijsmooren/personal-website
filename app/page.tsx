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
    </main>
  );
}
