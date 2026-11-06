"use client";

import { useState } from "react";

const tasks = [
  { id: "risk", title: "Read the risk checklist", detail: "A 3-minute guide to liquidity, valuation and capital risk.", points: 25, label: "RISK BASICS" },
  { id: "asset", title: "Explore an asset class", detail: "Compare the operating factors behind land, energy and materials.", points: 25, label: "ASSET KNOWLEDGE" },
  { id: "source", title: "Check the source", detail: "Learn how to distinguish verified information from estimates.", points: 25, label: "DUE DILIGENCE" },
];

export function TaskCenter() {
  const [completed, setCompleted] = useState<string[]>([]);
  const points = completed.reduce((total, id) => total + (tasks.find((task) => task.id === id)?.points ?? 0), 0);

  function toggleTask(id: string) {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="task-center">
      <div className="task-center-header"><div><span className="task-overline">TASK CENTRE <i /> PREVIEW</span><h3>Build your understanding.</h3></div><div className="points-balance"><span>PREVIEW POINTS</span><strong>{points.toString().padStart(3, "0")}</strong><small>no cash value</small></div></div>
      <div className="task-list">{tasks.map((task, index) => {
        const done = completed.includes(task.id);
        return <article className={`task-row${done ? " task-done" : ""}`} key={task.id}><span className="task-index">0{index + 1}</span><div className="task-copy"><span>{task.label}</span><h4>{task.title}</h4><p>{task.detail}</p></div><div className="task-reward"><strong>+{task.points}</strong><span>sample points</span></div><button type="button" className="task-action" onClick={() => toggleTask(task.id)} aria-pressed={done}>{done ? "Completed ✓" : "Mark complete"}</button></article>;
      })}</div>
      <div className="task-foot"><span><i /> PREVIEW SIMULATION</span><span>Progress resets when you leave this page.</span></div>
    </div>
  );
}
