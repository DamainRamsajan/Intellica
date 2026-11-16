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
