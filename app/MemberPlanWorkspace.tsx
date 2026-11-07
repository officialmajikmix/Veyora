"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useState, type FormEvent } from "react";

const areas = [
  ["agriculture", "Agricultural assets"],
  ["energy", "Energy assets"],
  ["precious-metals", "Precious metals"],
  ["digital-assets", "Digital assets and coin markets"],
] as const;
const goals = [
  ["ownership", "Understand ownership and legal rights"],
  ["operations", "Review operators and counterparties"],
  ["valuation", "Compare valuation methods and assumptions"],
  ["custody", "Trace custody, storage and control"],
  ["liquidity", "Understand liquidity, fees and exit limits"],
] as const;
type Plan = { id: string; focus_area: string; learning_goal: string; status: "active" | "completed" };

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createBrowserClient(url, key) : null;
}

export function MemberPlanWorkspace() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [area, setArea] = useState<string>(areas[0][0]);
  const [goal, setGoal] = useState<string>(goals[0][0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const db = client();
    if (!db) { setMessage("Your secure planning space is not connected yet."); setLoading(false); return; }
    const { data, error } = await db.from("member_research_plans").select("id, focus_area, learning_goal, status").order("created_at", { ascending: false });
    if (error) setMessage(error.code === "42P01" || error.code === "PGRST205" ? "Saved plans will be available after the database setup is complete." : "We could not load your plans. Please try again.");
    else { setPlans(data ?? []); setMessage(""); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const db = client();
    if (!db) { setMessage("Your secure planning space is not connected yet."); return; }
    setSaving(true); setMessage("");
    const { data, error: authError } = await db.auth.getUser();
    if (authError || !data.user) { setMessage("Your session expired. Sign in again to save a plan."); setSaving(false); return; }
    const { error } = await db.from("member_research_plans").insert({ user_id: data.user.id, focus_area: area, learning_goal: goal });
    if (error) setMessage("We could not save this plan. Please try again.");
    else { setMessage("Research plan saved to your account."); await load(); }
    setSaving(false);
  }

  async function setStatus(plan: Plan) {
    const status = plan.status === "completed" ? "active" : "completed";
    const db = client();
    if (!db) return;
    const { error } = await db.from("member_research_plans").update({ status }).eq("id", plan.id);
    if (error) { setMessage("We could not update this plan. Please try again."); return; }
    setPlans((items) => items.map((item) => item.id === plan.id ? { ...item, status } : item));
    setMessage(status === "completed" ? "Plan marked complete." : "Plan reopened.");
  }
  async function remove(plan: Plan) {
    const db = client();
    if (!db) return;
    const { error } = await db.from("member_research_plans").delete().eq("id", plan.id);
    if (error) { setMessage("We could not remove this plan. Please try again."); return; }
    setPlans((items) => items.filter((item) => item.id !== plan.id));
    setMessage("Plan removed from your account.");
  }

  return <main className="planning-page">
    <a className="brand" href="/member" aria-label="Veyora member home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>
    <section className="planning-hero"><div className="eyebrow"><span className="eyebrow-rule" /> MEMBER RESEARCH WORKSPACE</div><h1>A plan for<br/><em>better questions.</em></h1><p>Save the asset areas you want to research and the due-diligence questions you want to answer. Your plans stay with your account.</p><div className="planning-boundary"><strong>Planning tool only.</strong> Veyora does not recommend assets or coins, set an allocation, assess suitability, or enable investing or trading here.</div></section>
    <section className="planning-columns" aria-label="Research plan workspace">
      <form className="planning-form" onSubmit={save}><span className="eyebrow">CREATE A RESEARCH PLAN</span><label htmlFor="focus-area">Asset area</label><select id="focus-area" value={area} onChange={(event) => setArea(event.target.value)}>{areas.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label htmlFor="learning-goal">Question to explore</label><select id="learning-goal" value={goal} onChange={(event) => setGoal(event.target.value)}>{goals.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="button button-dark" type="submit" disabled={saving || loading}>{saving ? "Saving…" : "Save research plan"}</button><p className="planning-privacy">Your selections are stored in your Veyora account. Do not enter wallet keys or private financial details.</p></form>
      <section className="saved-plans" aria-labelledby="saved-plans-title"><div className="saved-plans-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h2 id="saved-plans-title">Saved plans</h2></div><span className="plan-count">{String(plans.length).padStart(2, "0")}</span></div>{loading ? <p className="plan-empty">Loading your saved plans…</p> : plans.length === 0 ? <p className="plan-empty">Your saved plans will appear here. Start with one question you want to investigate.</p> : <div className="saved-plan-list">{plans.map((plan) => { const asset = areas.find(([value]) => value === plan.focus_area)?.[1] ?? "Asset area"; const question = goals.find(([value]) => value === plan.learning_goal)?.[1] ?? "Research question"; return <article className={"saved-plan" + (plan.status === "completed" ? " is-complete" : "")} key={plan.id}><div className="saved-plan-meta"><span>{asset}</span><span>{plan.status === "completed" ? "COMPLETE" : "IN PROGRESS"}</span></div><h3>{question}</h3><div className="saved-plan-actions"><button type="button" onClick={() => void setStatus(plan)}>{plan.status === "completed" ? "Reopen plan" : "Mark complete"}</button><button type="button" onClick={() => void remove(plan)}>Remove</button></div></article>; })}</div>}</section>
    </section>
    {message && <p className="planning-message" role="status">{message}</p>}<p className="planning-disclaimer">This workspace organizes independent research. It is not financial advice, a recommendation, an offer, a trading service or an evaluation of whether any investment is right for you.</p><a className="planning-back" href="/member">← Back to member home</a>
  </main>;
}
