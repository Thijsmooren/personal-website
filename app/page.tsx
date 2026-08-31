import Image from "next/image";

const photos = [
  { src: "/thijs-portrait.jpg", alt: "Thijs Mooren" },
  { src: "/thijs-at-desk.jpeg", alt: "Thijs Mooren at work" },
  { src: "/thijs-outside.jpg", alt: "Portrait of Thijs Mooren" },
];

export default function Home() {
  return (
    <main className="wip-page">
      <header className="wip-header"><span>TM</span><span>Work in progress</span></header>
      <section className="wip-hero">
        <p className="wip-kicker">Personal website · 2026</p>
        <h1>THIJS<br />MOOREN</h1>
        <p className="wip-intro">A place for work, ideas and things in the making.</p>
      </section>
      <section className="photo-strip" aria-label="Photos of Thijs Mooren">
        {photos.map((photo, index) => <figure key={photo.src} className={`photo photo-${index + 1}`}><Image src={photo.src} alt={photo.alt} fill priority={index === 0} sizes="(max-width: 700px) 88vw, 31vw" /></figure>)}
      </section>
      <footer className="wip-footer"><span>Based in Dublin</span><span>More soon</span></footer>
    </main>
  );
}
