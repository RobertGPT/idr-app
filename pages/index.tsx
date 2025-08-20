// pages/index.tsx
import { useEffect, useMemo, useState } from "react";

type Day = { title: string; micro_action: string; reflection: string };
type Roadmap = {
  ok: boolean;
  meta: { focus: string; theme: string; why: string; minutes: number; energy: string };
  days: Day[];
  coaching_reminder: string;
  badge_hint?: string | null;
};

function getClientId(): string {
  if (typeof window === "undefined") return "anon";
  const key = "idr_client_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const [focus, setFocus] = useState("routine");
  const [minutes, setMinutes] = useState(10);
  const [energy, setEnergy] = useState("flex");
  const [data, setData] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const clientId = useMemo(getClientId, []);

  async function loadPlan() {
    setLoading(true);
    setSavedMsg(null);
    try {
      const url = `/api/roadmap?focus=${encodeURIComponent(focus)}&minutes=${minutes}&energy=${encodeURIComponent(energy)}`;
      const resp = await fetch(url);
      const json = await resp.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markDone() {
    if (!data) return;
    // map focus to module slug (same mapping used in /api/roadmap)
    const mapping: Record<string, string> = {
      motivation: "motivation_module",
      boundaries: "boundaries_module",
      empathy: "empathy_module",
      visualization: "visualization_module",
      routine: "routine_module",
    };
    const module_slug = mapping[focus] ?? "routine_module";

    try {
        const url = `/api/completions?client_id=${encodeURIComponent(clientId)}&module_slug=${encodeURIComponent(module_slug)}`;
    const resp = await fetch(url);
    const out = await resp.json();
    if (out.ok) {
      setSavedMsg("Nice — marked done. Tiny wins add up.");
    } else {
      setSavedMsg("Could not save just now. Try again in a moment.");
    }
  } catch (error) {
    setSavedMsg("Network hiccup. Try again.");
  }

      catch (error) {
    setSavedMsg("Network hiccup. Try again.");
  } 
      }
      setSavedMsg("Network hiccup. Try again.");
    }
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, lineHeight: 1.6, maxWidth: 840, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Ideal Day Roadmap</h1>
      <p style={{ marginTop: 6, color: "#444" }}>Tiny, kind steps. No all-or-nothing.</p>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", margin: "16px 0" }}>
        <label>
          <div style={{ fontWeight: 600 }}>Focus</div>
          <select value={focus} onChange={e => setFocus(e.target.value)} style={{ padding: 6, width: "100%" }}>
            <option value="routine">Routine</option>
            <option value="motivation">Motivation</option>
            <option value="boundaries">Boundaries</option>
            <option value="empathy">Empathy</option>
            <option value="visualization">Visualization</option>
          </select>
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>Minutes</div>
          <input type="number" min={5} max={30} value={minutes} onChange={e => setMinutes(Number(e.target.value))} style={{ padding: 6, width: "100%" }} />
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>Energy</div>
          <select value={energy} onChange={e => setEnergy(e.target.value)} style={{ padding: 6, width: "100%" }}>
            <option value="flex">Best time</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </label>
      </section>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={loadPlan} disabled={loading} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>
          {loading ? "Loading…" : "Generate plan"}
        </button>
        <button onClick={markDone} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>
          Mark today done
        </button>
        {savedMsg && <span style={{ marginLeft: 8, color: "#0a7" }}>{savedMsg}</span>}
      </div>

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
            {data.badge_hint && <div style={{ marginTop: 6, color: "#884400" }}><strong>Badge target:</strong> {data.badge_hint}</div>}
          </section>
          <ol style={{ paddingLeft: 18 }}>
            {data.days.map((d, i) => (
              <li key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600 }}>{d.title}</div>
                <div><em>Micro-action:</em> {d.micro_action}</div>
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
