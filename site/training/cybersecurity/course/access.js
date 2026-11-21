// Access-code helpers shared by the course and the training pages. Nothing here talks to a server:
// a saved code is checked by decrypting one lesson file in the browser.
import { $$, storage } from '/kit/dom.js';

export const CODE_KEY = 'iwc-course-code';
export const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export function parseCode(text) {
  try {
    const o = JSON.parse(new TextDecoder().decode(b64u(String(text).trim())));
    if (o && o.v === 1 && typeof o.k === 'string' && o.k.length >= 40) return { name: String(o.b || ''), key: o.k };
  } catch { /* fall through */ }
  return null;
}

export async function decryptLesson(url, id, code) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('missing');
  const enc = await res.json();
  const key = await crypto.subtle.importKey('raw', b64u(code.key), 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64u(enc.iv), additionalData: new TextEncoder().encode(id) }, key, b64u(enc.ct));
  return JSON.parse(new TextDecoder().decode(plain));
}

/* Buttons marked data-access say "Get access". If this browser already holds a working code, they
   become "Open the course" and go straight to the learner's page. */
export async function upgradeAccessButtons() {
  const btns = $$('[data-access]');
  if (!btns.length) return;
  const code = parseCode(storage.get(CODE_KEY) || '');
  if (!code) return;
  const b = btns[0];
  try { await decryptLesson(b.dataset.probe, b.dataset.probeId, code); } catch { return; }
  for (const a of btns) { a.textContent = 'Open the course'; a.setAttribute('href', a.dataset.learn); }
}
