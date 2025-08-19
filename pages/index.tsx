// pages/index.tsx
import { useEffect, useState } from "react";

type Roadmap = {
  ok: boolean;
  meta: { focus: string; theme: string; why: string; minutes: number; energy: string };
  days: { title: string; micro_action: string; reflection: string }[];
  coaching_reminder: string;
};

export default function Home() {
  const [data, setData] = useState<Roadmap | null>(null);

  // defaults; tweak these in the URL if you want (e.g., ?focus=empathy&minutes=12&energy=morning)
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const focus = params.get("focus") || "routine";
  const minutes = params.get("minutes") || "10";
  const energy = params.get("energy") || "flex";

  useEffect(() => {
    const url = `/api/roadmap?focus=${encodeURIComponent(focus)}&minutes=${encodeURIComponent(minutes)}&energy=${encodeURIComponent(energy)}`;
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [focus, minutes, energy]);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, lineHeight: 1.6, maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>IDR Roadmap</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Try quick views:{" "}
        <a href="/?focus=boundaries&minutes=12&energy=morning">Boundaries AM</a>{" · "}
        <a href="/?focus=visualization&minutes=8&energy=evening">Visualization PM</a>{" · "}
        <a href="/?focus=routine&minutes=10&energy=flex">Routine</a>
      </p>

      {!data ? (
        <p>Loading…</p>
      ) : (
        <>
          <section style={{ margin: "12px 0 20px 0" }}>
            <strong>Focus:</strong> {data.meta.focus} · <strong>{data.meta.theme}</strong>
            <div style={{ color: "#555" }}>{data.meta.why}</div>
            <div style={{ marginTop: 6 }}>
              <strong>Time:</strong> {data.meta.minutes} min · <strong>Energy:</strong> {data.meta.energy}
            </div>
          </section>
          <ol style={{ paddingLeft: 18 }}>
            {data.days.map((d, i) => (
              <li key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>{d.title}</div>
                <div><em>Micro‑action:</em> {d.micro_action}</div>
                <div><em>Reflection:</em> {d.reflection}</div>
              </li>
            ))}
          </ol>
          <p style={{ marginTop: 16, fontStyle: "italic" }}>{data.coaching_reminder}</p>
        </>
      )}
    </main>
  );
}

