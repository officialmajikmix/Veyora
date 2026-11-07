const tasks = [
  { id: "video", title: "Watch a short video", detail: "View a partner’s approved explainer and confirm you watched it.", reward: "Provider-set", label: "VIDEO TASK" },
  { id: "form", title: "Complete a research form", detail: "Answer a partner’s questions and submit your responses for review.", reward: "Provider-set", label: "FORM TASK" },
  { id: "register", title: "Register with a partner", detail: "Open a verified partner offer and complete its registration steps.", reward: "Provider-set", label: "PARTNER SIGN-UP" },
];

export function TaskCenter() {
  return (
    <div className="task-center" id="task-activities">
      <div className="task-center-header"><div><span className="task-overline">TASK CENTRE <i /> PARTNER SETUP</span><h3>Earn through verified tasks.</h3></div><div className="points-balance"><span>REWARD STATUS</span><strong>Setup</strong><small>provider link needed</small></div></div>
      <div className="task-list">{tasks.map((task, index) => (
        <article className="task-row" key={task.id}><span className="task-index">0{index + 1}</span><div className="task-copy"><span>{task.label}</span><h4>{task.title}</h4><p>{task.detail}</p></div><div className="task-reward"><strong>{task.reward}</strong><span>not active yet</span></div><button type="button" className="task-action" disabled>Coming soon</button></article>
      ))}</div>
      <div className="task-foot"><span><i /> PARTNER INTEGRATION PREVIEW</span><span>No tasks or cash rewards are active.</span></div>
      <p className="task-policy-note">Google ad clicks, standard ad views, and searches are not reward tasks. Any future ad-based reward must use a Google-approved rewarded format. Non-ad sponsor tasks require a verified provider and funded payout partner.</p>
    </div>
  );
}
