// pages/api/roadmap.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Minimal Roadmap generator
 * - No database required
 * - Uses query params: focus, minutes, energy, client_id
 * - Returns a 7-day plan with tiny actions + reflection prompts
 *
 * Example:
 *   /api/roadmap?focus=boundaries&minutes=12&energy=morning&client_id=demo-123
 */

type Focus = "motivation" | "boundaries" | "empathy" | "visualization" | "routine";
type Energy = "morning" | "evening" | "flex";

const FOCUS: Focus[] = ["motivation", "boundaries", "empathy", "visualization", "routine"];

const focusCopy: Record<Focus, { theme: string; why: string }> = {
  motivation: {
    theme: "Clarify motives → make action lighter",
    why:   "Align with what genuinely matters, not pressure or perfection.",
  },
  boundaries: {
    theme: "Kind limits → more self-respect",
    why:   "A clean 'no' creates space for a wholehearted 'yes.'",
  },
  empathy: {
    theme: "Empathy inward → empathy outward",
    why:   "Self-empathy lowers threat and unlocks better choices.",
  },
  visualization: {
    theme: "See it → then do it",
    why:   "A quick mental rehearsal reduces friction at go-time.",
  },
  routine: {
    theme: "Tiny rituals → big results",
    why:   "Consistency beats intensity for sustainable change.",
  },
};

function makePlan(minutes: number, energy: Energy, focus: Focus) {
  const anchor = energy === "morning" ? "morning" : energy === "evening" ? "evening" : "your best time";
  const mins = Math.max(5, Math.min(minutes, 30)); // keep it tiny and humane

  const days = [
    {
      title: "Day 1 — Orient & Intend",
      micro_action: `Spend ${mins} minutes in the ${anchor}. 2 slow breaths, then write 1 sentence about why ${focus} matters this week.`,
      reflection: "Note one feeling you want more of. No fixing, just noticing.",
    },
    {
      title: "Day 2 — Define a 1-inch Goal",
      micro_action: `Choose a ${mins}-minute action related to ${focus} that feels almost laughably small.`,
      reflection: "Rate ease 1–5. If <3, shrink it again.",
    },
    {
      title: "Day 3 — Prototype",
      micro_action: `Do the 1-inch goal. Use a 3-minute timer. Stop while it still feels doable.`,
      reflection: "What felt light? Keep only that piece tomorrow.",
    },
    {
      title: "Day 4 — Rehearse Success",
      micro_action: `Visualize a smooth version for 60 seconds (eyes open, soft gaze).`,
      reflection: `Complete the sentence: "When ___ happens, I’ll ___."`,
    },
    {
      title: "Day 5 — Iterate, Don’t Escalate",
      micro_action: `Repeat the 1-inch goal. If any friction shows up, halve the action.`,
      reflection: "Praise a specific effort (not outcome).",
    },
    {
      title: "Day 6 — Stack the Cue",
      micro_action: `Attach your 1-inch goal to an existing cue (coffee, commute, lunch).`,
      reflection: "Which cue felt most natural?",
    },
    {
      title: "Day 7 — Integrate",
      micro_action: `Book next week: ${anchor}, ${mins} minutes, 3 days. Add 1 calendar reminder.`,
      reflection: "Pick one word you want to feel next week.",
    },
  ];

  return days;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // read & sanitize inputs
  const focusParam = String(req.query.focus ?? "routine").toLowerCase();
  const focus: Focus = (FOCUS.includes(focusParam as Focus) ? (focusParam as Focus) : "routine");
  const minutes = Math.max(5, Math.min(Number(req.query.minutes ?? 10) || 10, 40));
  const energy = (String(req.query.energy ?? "flex").toLowerCase() as Energy);
  const client_id = req.query.client_id ? String(req.query.client_id) : null;

  // base plan
  const plan = makePlan(minutes, energy, focus);

  // gentle coaching reminder in your voice
  const reminder =
    "Notice when blame shows up. Replace it with a 1-inch action and a kind next step.";

   const payload = {
    ok: true,
    meta: {
      focus,
      theme: focusCopy[focus].theme,
      why: focusCopy[focus].why,
      minutes,
      energy,
      client_id,
    },
    days: plan,
    badge_hint: focus === "routine" ? "Early Bird" : focus === "empathy" ? "Resilient" : null,
    coaching_reminder: reminder,
  };

  // Optional pretty JSON (add ?pretty=1)
  if (String(req.query.pretty || "") === "1") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(JSON.stringify(payload, null, 2));
  }

  // Optional basic HTML view (add ?format=html)
  if (String(req.query.format || "") === "html") {
    const rows = payload.days.map(d => `
      <li style="margin: 0 0 12px 0;">
        <strong>${d.title}</strong><br>
        <em>Micro-action:</em> ${d.micro_action}<br>
        <em>Reflection:</em> ${d.reflection}
      </li>
    `).join("");
    const html = `
      <!doctype html>
      <meta charset="utf-8">
      <title>IDR Roadmap</title>
      <body style="font-family: system-ui, sans-serif; line-height: 1.6; padding: 24px; max-width: 720px;">
        <h1 style="margin:0 0 8px 0;">IDR Roadmap</h1>
        <p style="margin:0 0 16px 0;"><strong>Focus:</strong> ${payload.meta.focus} · <strong>${payload.meta.theme}</strong><br>${payload.meta.why}</p>
        <p style="margin:0 0 16px 0;"><strong>Time:</strong> ${payload.meta.minutes} min · <strong>Energy:</strong> ${payload.meta.energy}</p>
        <ol style="padding-left: 18px;">${rows}</ol>
        <p style="margin-top:16px;"><em>${payload.coaching_reminder}</em></p>
      </body>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  // Default: compact JSON
  return res.status(200).json(payload);
