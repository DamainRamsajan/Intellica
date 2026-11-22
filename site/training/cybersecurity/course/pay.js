// Buying by bank deposit, sending the receipt, receiving the code, and the owner's review page.
import { $, $$, storage, copyText } from '/kit/dom.js';

const CODE_KEY = 'iwc-course-code', ORDER_KEY = 'iwc-order', ORDER_CODE_KEY = 'iwc-order-code';
const api = async (path, init) => {
  const res = await fetch('/api/pay/' + path, init);
  let body = {}; try { body = await res.json(); } catch { /* ignore */ }
  return { res, body };
};
const say = (node, text, bad) => { node.textContent = text; node.dataset.bad = bad ? '1' : ''; };

// Shrinks a phone photo to a JPEG under ~600 KB so it uploads fast on mobile data.
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas');
  cv.width = Math.round(bmp.width * scale); cv.height = Math.round(bmp.height * scale);
  cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
  for (const q of [0.8, 0.65, 0.5]) {
    const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size < 900000) return blob;
  }
  throw new Error('That photo is too large. Try a smaller screenshot.');
}

export async function buy() {
  const priceEl = $('[data-price]'), note = $('[data-price-note]'), openBtn = $('[data-pay-open]');
  const { body } = await api('region').catch(() => ({ body: {} }));
  if (body.tt && openBtn) {
    priceEl.textContent = 'TT$' + priceEl.dataset.ttd;
    note.textContent = 'One payment by bank deposit. Lifetime access to this edition. Your course opens the moment you send your receipt.';
    $('[data-tt]').hidden = false;
  } else if (openBtn) {
    note.textContent = 'Card payment for visitors outside Trinidad and Tobago is opening soon. Message us on WhatsApp to buy now. Lifetime access to this edition.';
  }
  if (!openBtn) return;
  const dlg = $('[data-pay]'), steps = $$('[data-step]', dlg), msg = $('[data-pay-msg]', dlg);
  const show = (n) => steps.forEach((s) => { s.hidden = s.dataset.step !== String(n); });
  let order = null;
  try { order = JSON.parse(storage.get(ORDER_KEY) || 'null'); } catch { order = null; }
  const fill = (o) => {
    $('[data-amount]', dlg).textContent = 'TT$' + o.amount;
    $('[data-bank]', dlg).textContent = o.bank.name; $('[data-branch]', dlg).textContent = o.bank.branch;
    $('[data-account]', dlg).textContent = o.bank.account; $('[data-ref]', dlg).textContent = o.ref;
  };
  const finish = async (data, o) => {
    show(4);
    const link = $('[data-done-link]', dlg), t = $('[data-done-title]', dlg), x = $('[data-done-text]', dlg);
    link.href = '/training/cybersecurity/course/welcome/?o=' + o.id;
    t.textContent = data.status === 'paid' ? 'Payment confirmed' : 'Receipt received';
    x.textContent = 'Opening your course…'; link.textContent = 'Open my course';
    // Open the course at once. If the bank check could not confirm the receipt, the course still opens and we double-check by hand.
    const { res, body: c } = await api('claim?o=' + encodeURIComponent(o.id)).catch(() => ({ res: null, body: {} }));
    if (res && res.ok && c.code) {
      storage.set(CODE_KEY, c.code); storage.set(ORDER_CODE_KEY, c.code);
      if (c.provisional) x.textContent = 'Your course is open now. We are double-checking the deposit with the bank, which usually takes a few hours.';
      link.href = c.learn; setTimeout(() => location.assign(c.learn), c.provisional ? 2500 : 900);
    } else x.textContent = 'We received your receipt. Open the next page to get your course.';
  };
  openBtn.addEventListener('click', () => { dlg.showModal(); if (order) { fill(order); show(2); } else show(1); });
  $('[data-pay-form]', dlg).addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, b = $('button', f); b.disabled = true;
    const { res, body: o } = await api('order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ course: openBtn.dataset.payOpen, name: f.elements.name.value, email: f.elements.email.value }) }).catch(() => ({ res: { ok: false }, body: {} }));
    b.disabled = false;
    if (!res.ok) { alert(o.error || 'Please try again, or message us on WhatsApp.'); return; }
    order = o; storage.set(ORDER_KEY, JSON.stringify(o)); fill(o); show(2);
  });
  $('[data-copy-account]', dlg).addEventListener('click', async (e) => { e.target.textContent = (await copyText(order.bank.account)) ? 'Copied' : 'Select and copy'; });
  $('[data-copy-ref]', dlg).addEventListener('click', async (e) => { e.target.textContent = (await copyText(order.ref)) ? 'Copied' : 'Select and copy'; });
  $('[data-to-3]', dlg).addEventListener('click', () => show(3));
  for (const input of $$('[data-file]', dlg)) input.addEventListener('change', async () => {
    const file = input.files[0]; if (!file) return;
    say(msg, 'Checking your receipt… this can take up to 20 seconds.');
    try {
      const blob = await shrink(file);
      const { res, body: data } = await api('receipt?o=' + order.id, { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: blob });
      if (!res.ok) throw new Error(data.error || 'Please try again.');
      finish(data, order);
    } catch (err) { say(msg, err.message || 'Please try again.', true); }
    input.value = '';
  });
}

// Runs quietly on course pages for a buyer: opens the course if it was approved meanwhile, and closes it if the owner revoked it.
export async function recheck() {
  let o = null; try { o = JSON.parse(storage.get(ORDER_KEY) || 'null'); } catch { o = null; }
  if (!o || !o.id) return;
  const { res, body } = await api('claim?o=' + encodeURIComponent(o.id)).catch(() => ({ res: null, body: {} }));
  if (!res) return;
  if (res.status === 403) {
    if (storage.get(CODE_KEY) && storage.get(CODE_KEY) === storage.get(ORDER_CODE_KEY)) {
      try { localStorage.removeItem(CODE_KEY); localStorage.removeItem(ORDER_CODE_KEY); } catch { /* ignore */ }
      alert('Your access has been paused because we could not confirm your payment. Please message us on WhatsApp and we will sort it out.');
      location.reload();
    }
  } else if (res.ok && body.code && !storage.get(CODE_KEY)) { storage.set(CODE_KEY, body.code); storage.set(ORDER_CODE_KEY, body.code); location.reload(); }
}

export async function welcome() {
  const root = $('[data-welcome]'), title = $('[data-welcome-title]'), msg = $('[data-welcome-msg]');
  const id = new URLSearchParams(location.search).get('o') || '';
  try {
    const { res, body: data } = await api('claim?o=' + encodeURIComponent(id));
    if (res.status === 202) { title.textContent = 'We are waiting for your receipt.'; msg.textContent = 'Reference ' + (data.ref || ''); $('[data-welcome-wait]', root).hidden = false; return; }
    if (!res.ok) throw new Error(data.error);
    storage.set(CODE_KEY, data.code); storage.set(ORDER_CODE_KEY, data.code);
    title.textContent = 'Welcome, ' + data.name + '.';
    msg.textContent = data.provisional ? 'Your course is open. We are still double-checking the deposit with the bank.' : 'Payment confirmed. Thank you.';
    $('textarea', root).value = data.code;
    $('[data-welcome-done]', root).hidden = false;
    $('[data-copy]', root).addEventListener('click', async (e) => { e.target.textContent = (await copyText(data.code)) ? 'Copied' : 'Select the code and copy it'; });
  } catch (err) {
    title.textContent = 'We could not open your order.';
    msg.textContent = (err && err.message ? err.message + ' ' : '') + 'If you have paid, message us on WhatsApp with your name and we will send your code.';
  }
}

export function admin() {
  const root = $('[data-admin]'), list = $('[data-admin-list]', root), msg = $('[data-admin-msg]', root), form = $('[data-admin-key]', root);
  const hdr = () => ({ 'x-admin-key': sessionStorage.getItem('iwc-admin') || '' });
  const load = async () => {
    const { res, body } = await api('admin/list', { headers: hdr() });
    if (!res.ok) { say(msg, 'Wrong key.', true); return; }
    say(msg, body.orders.length ? '' : 'No orders yet.');
    list.replaceChildren(...body.orders.map(row));
  };
  const row = (o) => {
    const d = document.createElement('div'); d.className = 'ord'; d.dataset.status = o.status;
    const h = document.createElement('p'); const when = new Date(o.created).toLocaleString();
    h.textContent = `${o.status.toUpperCase()}  ${o.name}  <${o.email}>  ${o.ref}  TT$${o.amount}  ${when}`;
    let why = ''; try { why = JSON.parse(o.reasons || '[]').join('; '); } catch { /* ignore */ }
    const w = document.createElement('p'); w.className = 'muted small'; w.textContent = why ? 'Held because: ' + why : (o.note === 'auto' ? 'Passed the automatic check.' : '');
    d.append(h, w);
    if (o.receipt) {
      const show = document.createElement('button'); show.className = 'btn btn-ghost'; show.type = 'button'; show.textContent = 'Show receipt';
      show.addEventListener('click', async () => { const { body } = await api('admin/image?id=' + o.receipt, { headers: hdr() }); const im = document.createElement('img'); im.src = body.image; im.alt = 'Receipt'; im.className = 'rcpt'; d.append(im); show.remove(); });
      d.append(show);
    }
    if (o.status === 'review' || o.status === 'paid') {
      const mk = (label, approve) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + (approve ? 'btn-primary' : 'btn-ghost'); b.textContent = label; b.addEventListener('click', async () => { await api('admin/decide', { method: 'POST', headers: { ...hdr(), 'content-type': 'application/json' }, body: JSON.stringify({ id: o.id, approve }) }); load(); }); return b; };
      if (o.status === 'review') d.append(mk('Money is in: confirm', true));
      d.append(mk(o.status === 'review' ? 'Not received: revoke access' : 'Revoke access', false));
    }
    return d;
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); sessionStorage.setItem('iwc-admin', $('input', form).value); load(); });
  if (sessionStorage.getItem('iwc-admin')) load();
}
