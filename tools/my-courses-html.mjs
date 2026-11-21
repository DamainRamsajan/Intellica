// The "Open your course" page: one place to paste an access code for any course. Written by build-course.mjs once the courses exist.
import { page, esc } from './training-shell.mjs';

/* list: [{ id, title, store, probe, probeId, learn }] */
export function myCoursesPage(list) {
  const body = `
    <nav class="subnav" aria-label="Open my course"><p class="crumb"><a href="/training/">Training</a><span aria-hidden="true"> / </span>Open my course</p></nav>
    <section class="t-hero t-hero-single" aria-labelledby="mc-t">
      <div class="t-hero-copy">
        <p class="eyebrow">Already bought a course?</p>
        <h1 id="mc-t">Open your course</h1>
        <p class="lead">Paste the access code we sent you. It works for whichever course you bought, and your progress stays on this device.</p>
      </div>
    </section>
    <section class="t-block mycourses" data-mycourses data-courses="${esc(JSON.stringify(list))}">
      <div class="mine" data-mine hidden></div>
      <form class="unlock" data-code-form autocomplete="off">
        <label for="mc-code">Access code<input id="mc-code" name="code" autocomplete="off" spellcheck="false" placeholder="Paste your access code here"></label>
        <div class="actions"><button class="btn btn-primary" type="submit">Open my course</button></div>
        <p class="muted small" role="status" data-msg></p>
      </form>
      <p class="muted small">No code yet? <a href="/training/#courses">Browse the courses</a>. Lost your code? Message us and we will send it again.</p>
    </section>`;
  return page({ title: 'Open your course | Intellica Training', description: 'Enter your access code to open the course you bought.', canonicalPath: '/training/my-courses/', body });
}
