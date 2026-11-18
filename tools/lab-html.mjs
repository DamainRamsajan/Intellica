// HTML shared by the workshop page and the course page: the evidence behind the lab design.
// Content lives in site/training/training.json (workshops[].course.lab.research).
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function researchHtml(r, kicker, h = 2) {
  const idx = (id) => r.sources.findIndex((s) => s.id === id) + 1;
  return `${kicker}
      <h${h} id="res-t">${esc(r.title)}</h${h}>
      <p class="sub">${esc(r.lead)}</p>
      <div class="lx-research">
${r.items.map((i) => `        <article class="lx-r"><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p><p class="lx-src"><a href="#res-${i.src}">Source ${idx(i.src)}</a></p></article>`).join('\n')}
      </div>
      <p class="muted small">${esc(r.honesty)}</p>
      <ol class="lx-sources" aria-label="Sources">
${r.sources.map((s) => `        <li id="res-${s.id}"><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join('\n')}
      </ol>`;
}

// The leaderboard block on the workshop page. The text is static (works without JavaScript); the table is filled in by board.js.
export function boardHtml(kicker, h = 2) {
  return `${kicker}
      <h${h} id="lb-t">Leaderboard</h${h}>
      <p class="sub">Compete with other learners, and with your own best week. Points reward doing the work: answering from memory, reviewing on schedule, building your own arc42 and showing up. Never speed.</p>
      <div data-board-public><p class="muted">Loading the board…</p></div>
      <details class="lb-how"><summary>How points work</summary>
        <table><thead><tr><th scope="col">Activity</th><th scope="col">Points</th></tr></thead><tbody>
          <tr><th scope="row">Check question, first try</th><td>10 if correct, 2 if not</td></tr>
          <tr><th scope="row">Review when it falls due</th><td>8 on time, 4 if late, 2 if wrong</td></tr>
          <tr><th scope="row">Section written in your lab document</th><td>15 each</td></tr>
          <tr><th scope="row">Health check passed (of six)</th><td>10 each</td></tr>
          <tr><th scope="row">First activity of a day</th><td>5, plus 1 for each day of your streak, up to 10</td></tr>
        </tbody></table>
        <p>The board resets every Monday at 00:00 UTC, so a new learner can lead the week. An all-time board sits beside it. Your streak counts days in a row, and one missed day is forgiven. Your four progress parts (Recall, Build, Reviews, Consistency) and an overall score out of 100 are on your course page.</p>
        <p class="muted small">Your device works out your points from your own activity, and everything you have already done counts from day one. Joining is optional. When you join, we store your handle and these numbers: points, streak and the four progress parts. We do not store your answers or your document. You can remove yourself at any time and your record is deleted.</p>
      </details>`;
}
