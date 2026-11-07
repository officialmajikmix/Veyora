"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useState, type FormEvent } from "react";

const areas = [["agriculture", "Agriculture"], ["energy", "Energy"], ["precious-metals", "Precious metals"]] as const;
const statuses = [["draft", "Draft"], ["under-review", "Under review"], ["hold", "On hold"], ["closed", "Closed"]] as const;
type Intake = { id: string; asset_class: string; asset_name: string; country_region: string; operator_name: string; rights_evidence: string; permits_evidence: string; operations_evidence: string; source_url: string; open_questions: string; review_status: string; updated_at: string };
type Draft = Omit<Intake, "id" | "updated_at">;
const emptyDraft: Draft = { asset_class: "agriculture", asset_name: "", country_region: "", operator_name: "", rights_evidence: "", permits_evidence: "", operations_evidence: "", source_url: "", open_questions: "", review_status: "draft" };

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createBrowserClient(url, key) : null;
}

export function AdminAssetIntake() {
  const [items, setItems] = useState<Intake[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const db = client();
    if (!db) { setMessage("Database connection is not configured."); setLoading(false); return; }
    const { data, error } = await db.from("private_asset_intakes").select("*").order("updated_at", { ascending: false });
    if (error) setMessage(error.code === "42P01" || error.code === "PGRST205" ? "The private intake table has not been installed yet. Apply the private asset intake migration in Supabase." : "We could not load internal records. Confirm your admin role and database policies.");
    else { setItems(data ?? []); setMessage(""); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  function startNew() { setEditingId(null); setDraft(emptyDraft); setMessage(""); }
  function edit(item: Intake) {
    const { id, updated_at, ...values } = item;
    void updated_at;
    setEditingId(id); setDraft(values); setMessage("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const db = client();
    if (!db) { setMessage("Database connection is not configured."); return; }
    setSaving(true); setMessage("");
    const { data: auth, error: authError } = await db.auth.getUser();
    if (authError || !auth.user) { setMessage("Your session expired. Sign in again."); setSaving(false); return; }
    const payload = { ...draft, updated_at: new Date().toISOString() };
    const result = editingId ? await db.from("private_asset_intakes").update(payload).eq("id", editingId) : await db.from("private_asset_intakes").insert({ ...payload, created_by: auth.user.id });
    if (result.error) setMessage("We could not save this record. Check required fields and admin access.");
    else { setMessage(editingId ? "Internal record updated." : "Draft added to the private intake queue."); startNew(); await load(); }
    setSaving(false);
  }
  async function remove(item: Intake) {
    if (!window.confirm("Remove internal draft: " + item.asset_name + "?")) return;
    const db = client();
    if (!db) return;
    const { error } = await db.from("private_asset_intakes").delete().eq("id", item.id);
    if (error) setMessage("We could not remove this record. Check your admin access.");
    else { if (editingId === item.id) startNew(); setItems((current) => current.filter((entry) => entry.id !== item.id)); setMessage("Internal draft removed."); }
  }

  return <main className="intake-page">
    <header className="intake-hero"><span className="eyebrow"><span className="eyebrow-rule" /> PRIVATE · INTERNAL REVIEW</span><h1>Asset intake<br/><em>starts with evidence.</em></h1><p>Capture candidate agriculture, energy and precious-metals assets for internal review. These records are drafts; nothing here is published as an offer or opportunity.</p><div className="intake-boundary"><strong>Internal records only.</strong> Do not enter investor or customer details, account credentials, wallet keys, or confidential personal information. Add references to approved document storage rather than uploading files here.</div></header>
    <section className="intake-columns" aria-label="Internal asset intake workspace">
      <form className="intake-form" onSubmit={save}>
        <div className="intake-form-heading"><div><span className="eyebrow">{editingId ? "EDIT INTERNAL RECORD" : "NEW CANDIDATE"}</span><h2>{editingId ? "Update asset intake" : "Add a candidate"}</h2></div>{editingId && <button type="button" onClick={startNew}>New record</button>}</div>
        <label htmlFor="intake-name">Asset or project name</label><input id="intake-name" required maxLength={160} value={draft.asset_name} onChange={(event) => setDraft({ ...draft, asset_name: event.target.value })} />
        <div className="intake-field-pair"><div><label htmlFor="intake-class">Asset class</label><select id="intake-class" value={draft.asset_class} onChange={(event) => setDraft({ ...draft, asset_class: event.target.value })}>{areas.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label htmlFor="intake-status">Review status</label><select id="intake-status" value={draft.review_status} onChange={(event) => setDraft({ ...draft, review_status: event.target.value })}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
        <label htmlFor="intake-location">Country or region</label><input id="intake-location" value={draft.country_region} onChange={(event) => setDraft({ ...draft, country_region: event.target.value })} />
        <label htmlFor="intake-operator">Owner or operator named in source materials</label><input id="intake-operator" value={draft.operator_name} onChange={(event) => setDraft({ ...draft, operator_name: event.target.value })} />
        <label htmlFor="intake-rights">Ownership, title or rights evidence reference</label><textarea id="intake-rights" rows={3} value={draft.rights_evidence} onChange={(event) => setDraft({ ...draft, rights_evidence: event.target.value })} />
        <label htmlFor="intake-permits">Permits and approvals evidence reference</label><textarea id="intake-permits" rows={3} value={draft.permits_evidence} onChange={(event) => setDraft({ ...draft, permits_evidence: event.target.value })} />
        <label htmlFor="intake-operations">Operations and counterparties evidence reference</label><textarea id="intake-operations" rows={3} value={draft.operations_evidence} onChange={(event) => setDraft({ ...draft, operations_evidence: event.target.value })} />
        <label htmlFor="intake-source">Public source URL</label><input id="intake-source" type="url" placeholder="https://" value={draft.source_url} onChange={(event) => setDraft({ ...draft, source_url: event.target.value })} />
        <label htmlFor="intake-questions">Open questions, gaps or follow-up</label><textarea id="intake-questions" rows={4} value={draft.open_questions} onChange={(event) => setDraft({ ...draft, open_questions: event.target.value })} />
        <button className="button button-dark" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Save private draft"}</button>
      </form>
      <section className="intake-queue" aria-labelledby="intake-queue-title"><div className="intake-queue-heading"><div><span className="eyebrow">NOT PUBLIC</span><h2 id="intake-queue-title">Candidate queue</h2></div><span>{String(items.length).padStart(2, "0")}</span></div>
        {loading ? <p>Loading internal records…</p> : items.length === 0 ? <p>No internal candidates yet. Add one to start an evidence review.</p> : <div className="intake-list">{items.map((item) => <article className="intake-card" key={item.id}><div className="intake-card-meta"><span>{areas.find(([value]) => value === item.asset_class)?.[1] ?? "Asset"} · {item.country_region || "Location not set"}</span><span>{statuses.find(([value]) => value === item.review_status)?.[1] ?? item.review_status}</span></div><h3>{item.asset_name}</h3>{item.operator_name && <p>Named operator: {item.operator_name}</p>}{item.open_questions && <p><strong>Open questions:</strong> {item.open_questions}</p>}<small>Updated {new Date(item.updated_at).toLocaleDateString()}</small><div className="intake-actions"><button type="button" onClick={() => edit(item)}>Edit</button><button type="button" onClick={() => void remove(item)}>Remove</button></div></article>)}</div>}
      </section>
    </section>
    {message && <p className="intake-message" role="status">{message}</p>}
    <p className="intake-disclaimer">Internal research tracking only. Saving a candidate does not verify its claims, authorize a public offer, or make it suitable for any investor.</p>
  </main>;
}
