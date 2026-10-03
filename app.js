const $ = s => document.querySelector(s);
const KEY = 'rxProfile.v1';
const PF = ['name', 'prc', 'ptr', 's2', 'clinic', 'addr', 'contact', 'hours'];
const GENERICS = ['Acetylcysteine', 'Amlodipine', 'Amoxicillin', 'Amoxicillin + Clavulanic Acid', 'Atorvastatin', 'Azithromycin', 'Betahistine', 'Bisoprolol', 'Budesonide', 'Cefalexin', 'Cefixime', 'Cefuroxime', 'Cetirizine', 'Ciprofloxacin', 'Clarithromycin', 'Clindamycin', 'Co-trimoxazole', 'Dexamethasone', 'Diclofenac', 'Domperidone', 'Doxycycline', 'Esomeprazole', 'Fluconazole', 'Gliclazide', 'Hydrocortisone', 'Hyoscine N-butylbromide', 'Ibuprofen', 'Ketorolac', 'Levocetirizine', 'Levofloxacin', 'Loperamide', 'Loratadine', 'Losartan', 'Mefenamic Acid', 'Metformin', 'Metoprolol', 'Metronidazole', 'Montelukast', 'Naproxen', 'Omeprazole', 'Ondansetron', 'Oral Rehydration Salts', 'Paracetamol', 'Pantoprazole', 'Prednisone', 'Salbutamol', 'Simvastatin', 'Tramadol', 'Tranexamic Acid', 'Vitamin B Complex', 'Vitamin C', 'Zinc Sulfate'];
$('#gl').innerHTML = GENERICS.map(g => `<option value="${g}">`).join('');

/* ---------- tabs ---------- */
function tab(t) {
  ['Rx', 'Sv', 'Pr'].forEach(k => { $('#v' + k).hidden = k !== t; $('#t' + k).classList.toggle('on', k === t); });
  if (t === 'Sv') renderSaved(); scrollTo(0, 0);
}
['Rx', 'Sv', 'Pr'].forEach(k => $('#t' + k).onclick = () => tab(k));

/* ---------- medications ---------- */
function addMed(m) {
  const n = $('#medT').content.cloneNode(true), f = n.querySelector('.med');
  f.querySelector('.del').onclick = () => { f.remove(); renum(); };
  f.querySelector('.tpl').onclick = () => saveTpl(readMed(f));
  if (m) fillMed(f, m);
  $('#meds').appendChild(n); renum(); return f;
}
function renum() {
  const m = document.querySelectorAll('.med');
  m.forEach((f, i) => {
    f.querySelector('legend').textContent = `Medication ${i + 1}`;
    f.querySelector('.del').style.display = m.length > 1 ? '' : 'none';
  });
}
$('#addMed').onclick = () => addMed();

/* ---------- signature pads ---------- */
function pad(cv) {
  const cx = cv.getContext('2d'), s = { cv, ink: false }; let on = false;
  const set = () => { cx.lineWidth = 4; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#000'; };
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.addEventListener('pointerdown', e => { set(); on = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + .1, y + .1); cx.stroke(); s.ink = true; });
  cv.addEventListener('pointermove', e => { if (!on) return; const [x, y] = pos(e); cx.lineTo(x, y); cx.stroke(); });
  ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => on = false));
  s.clear = () => { cx.clearRect(0, 0, cv.width, cv.height); s.ink = false; };
  s.load = src => { if (!src) return; const im = new Image(); im.onload = () => { cx.drawImage(im, 0, 0, cv.width, cv.height); s.ink = true; }; im.src = src; };
  s.data = () => s.ink ? cv.toDataURL('image/png') : '';
  return s;
}
const P1 = pad($('#sig')), P2 = pad($('#sig2'));
$('#sigClr').onclick = () => P1.clear();
$('#sig2Clr').onclick = () => P2.clear();

/* ---------- storage + physician profiles ---------- */
const he = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('Could not save on this device.'); return false; } };
let PR = jget('rxProfiles.v2', null);
if (!PR) { const id = uid(); PR = { list: [Object.assign({}, jget(KEY, {}), { id })], active: id }; }
const loadProfile = () => PR.list.find(p => p.id === PR.active) || PR.list[0];
const saveProfiles = () => jset('rxProfiles.v2', PR);
function renderProfiles() {
  const o = PR.list.map(p => `<option value="${p.id}">${he(p.name || '(unnamed profile)')}</option>`).join('');
  ['#profSel', '#profSel2'].forEach(s => { $(s).innerHTML = o; $(s).value = PR.active; });
}
function fillProfile() {
  const p = loadProfile();
  PF.forEach(k => $('#p_' + k).value = p[k] || '');
  P1.clear(); P2.clear(); P1.load(p.sig); P2.load(p.sig);
  return p;
}
function switchProfile(id) { PR.active = id; saveProfiles(); renderProfiles(); fillProfile(); }
['#profSel', '#profSel2'].forEach(s => $(s).onchange = e => switchProfile(e.target.value));
$('#newProf').onclick = () => { const p = { id: uid() }; PR.list.push(p); switchProfile(p.id); };
$('#delProf').onclick = () => {
  if (PR.list.length < 2) { alert('You need at least one profile.'); return; }
  if (!confirm('Delete this profile and its signature?')) return;
  PR.list = PR.list.filter(p => p.id !== PR.active); switchProfile(PR.list[0].id);
};
$('#saveP').onclick = () => {
  const p = loadProfile(); PF.forEach(k => p[k] = $('#p_' + k).value.trim()); p.sig = P1.data();
  if (!saveProfiles()) return;
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  renderProfiles(); P2.clear(); P2.load(p.sig);
  const m = $('#saved'); m.style.display = 'block'; setTimeout(() => m.style.display = 'none', 2500);
};

/* ---------- helpers ---------- */
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '');
  return String(n);
}
const val = (root, c) => (root.querySelector(c).value || '').trim();
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => new Date(d + 'T00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

function jpegFromSig(src) {
  return new Promise(res => {
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0);
      res({ url: c.toDataURL('image/jpeg', .92), w: c.width, h: c.height });
    };
    im.onerror = () => res(null); im.src = src;
  });
}

/* ---------- PDF layout (A5) ---------- */
function buildPdf(P, R, sig) {
  const d = new PDFLite.Doc(420, 595), M = 30, RW = 360;
  let y = 42;
  const para = (txt, x, size, f, lh, maxW = RW - (x - M)) => d.wrap(txt, maxW, size, f).forEach(l => { d.text(x, y, l, size, f); y += lh; });
  const room = h => { if (y + h > 535) { d.addPage(); y = 42; } };

  d.text(M, y, P.name, 15, 'B'); y += 15;
  const ids = [P.prc && 'PRC Lic. No. ' + P.prc, P.ptr && 'PTR No. ' + P.ptr, P.s2 && 'S2 Lic. No. ' + P.s2].filter(Boolean).join('   |   ');
  if (ids) para(ids, M, 8.5, 'R', 11);
  y += 3;
  if (P.clinic) para(P.clinic, M, 10.5, 'B', 13);
  if (P.addr) para(P.addr, M, 8.5, 'R', 11);
  const ct = [P.contact && 'Tel/Mobile: ' + P.contact, P.hours && 'Hours: ' + P.hours].filter(Boolean).join('   |   ');
  if (ct) para(ct, M, 8.5, 'R', 11);
  y += 2; d.line(M, y, M + RW, y, 1.4); y += 16;

  const kv = (x, k, v) => { d.text(x, y, k, 9.5, 'B'); d.text(x + d.tw(k, 9.5, 'B') + 4, y, v, 9.5); };
  kv(M, 'Name:', R.name); kv(270, 'Date:', fmtDate(R.date)); y += 15;
  kv(M, 'Age / Sex:', [R.age, R.sex].filter(Boolean).join(' / ')); if (R.wt) kv(270, 'Weight:', R.wt + ' kg'); y += 15;
  if (R.addr) { d.text(M, y, 'Address:', 9.5, 'B'); const x0 = M + d.tw('Address:', 9.5, 'B') + 4; para(R.addr, x0, 9.5, 'R', 12, RW - (x0 - M)); y += 3; }
  if (R.all) { d.text(M, y, 'Allergies:', 9.5, 'B'); const x0 = M + d.tw('Allergies:', 9.5, 'B') + 4; para(R.all, x0, 9.5, 'R', 12, RW - (x0 - M)); y += 3; }
  y += 2; d.line(M, y, M + RW, y, 0.6); y += 34;
  d.text(M, y, 'Rx', 30, 'B'); y += 22;

  R.meds.forEach((m, i) => {
    room(75);
    const title = `${i + 1}.  ${m.gen}${m.brand ? ' (' + m.brand + ')' : ''}${m.dose ? '  ' + m.dose : ''}`;
    para(title, M, 11.5, 'B', 14);
    const q = parseInt(m.qty, 10);
    const qty = q ? `#${q} (${words(q)}) ${m.unit}` : `${m.qty} ${m.unit}`;
    d.text(M + 16, y, 'Disp.: ' + qty, 10.5); y += 14;
    const sg = `Sig.: ${m.route}, ${m.freq}${m.dur ? ' for ' + m.dur : ''}${m.note ? '. ' + m.note : ''}`;
    para(sg, M + 16, 10.5, 'R', 13, RW - 16);
    if (m.ind) para('Indication: ' + m.ind, M + 16, 9, 'I', 12, RW - 16);
    y += 10;
  });
  if (R.fu) { room(40); y += 4; d.text(M, y, 'Follow-up / notes:', 9.5, 'B'); y += 12; para(R.fu, M, 9.5, 'R', 12); }

  if (y > 470) { d.addPage(); y = 42; }
  y = Math.max(y + 10, 468);
  const sx = 240, sw = 150;
  if (sig) { const h = Math.min(46, sw * sig.h / sig.w), w = h * sig.w / sig.h; d.image(sig.url, sig.w, sig.h, sx + (sw - w) / 2, y, w, h); }
  y += 48; d.line(sx, y, sx + sw + 30, y, 0.8); y += 12;
  d.text(sx, y, P.name, 9.5, 'B'); y += 11;
  if (P.prc) { d.text(sx, y, 'PRC Lic. No. ' + P.prc, 8.5); y += 10.5; }
  if (P.ptr) { d.text(sx, y, 'PTR No. ' + P.ptr, 8.5); y += 10.5; }
  if (P.s2) { d.text(sx, y, 'S2 Lic. No. ' + P.s2, 8.5); }
  return d.output();
}

/* ---------- generate ---------- */
function resetForm() {
  ['pt_name', 'pt_age', 'pt_sex', 'pt_wt', 'pt_addr', 'pt_all', 'rx_fu'].forEach(i => $('#' + i).value = '');
  $('#rx_date').value = today(); $('#meds').innerHTML = ''; addMed();
  P2.clear(); P2.load(loadProfile().sig); $('#sig2Save').checked = false; scrollTo(0, 0);
}
$('#gen').onclick = async () => {
  const P = loadProfile();
  if (!P.name) { alert('Please save your physician profile first.'); tab('Pr'); return; }
  const R = {
    name: $('#pt_name').value.trim(), age: $('#pt_age').value.trim(), sex: $('#pt_sex').value, wt: $('#pt_wt').value.trim(),
    addr: $('#pt_addr').value.trim(), all: $('#pt_all').value.trim(), date: $('#rx_date').value || today(), fu: $('#rx_fu').value.trim(),
    meds: [...document.querySelectorAll('.med')].map(f => ({
      gen: val(f, '.m_gen'), brand: val(f, '.m_brand'), dose: val(f, '.m_dose'), qty: val(f, '.m_qty'), unit: val(f, '.m_unit'),
      route: val(f, '.m_route'), freq: val(f, '.m_freq'), dur: val(f, '.m_dur'), ind: val(f, '.m_ind'), note: val(f, '.m_note')
    }))
  };
  if (!R.name) { alert('Enter the patient name.'); return; }
  if (R.meds.some(m => !m.gen || !m.qty)) { alert('Each medication needs a generic name and a quantity.'); return; }
  const sigSrc = P2.data();
  if (!sigSrc && !confirm('No signature drawn. Pharmacies only accept signed prescriptions. Create the PDF anyway?')) return;
  if (sigSrc && $('#sig2Save').checked) { P.sig = sigSrc; saveProfiles(); P1.clear(); P1.load(sigSrc); }
  const sig = await jpegFromSig(sigSrc);
  const bytes = buildPdf(P, R, sig);
  if (KEEP) rememberRx(R);
  const fname = `Rx_${R.name.replace(/[^\w]+/g, '_')}_${R.date}.pdf`;
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const file = new File([blob], fname, { type: 'application/pdf' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); resetForm(); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const u = URL.createObjectURL(blob);
  if (!window.open(u, '_blank')) location.href = u;
  resetForm();
};

/* ---------- templates, patients, history ---------- */
const MF = { gen: '.m_gen', brand: '.m_brand', dose: '.m_dose', qty: '.m_qty', unit: '.m_unit', route: '.m_route', freq: '.m_freq', dur: '.m_dur', ind: '.m_ind', note: '.m_note' };
const readMed = f => { const m = {}; for (const k in MF) m[k] = val(f, MF[k]); return m; };
const fillMed = (f, m) => { for (const k in MF) f.querySelector(MF[k]).value = m[k] || ''; };
let TP = jget('rxTemplates.v1', []), PT = jget('rxPatients.v1', []), HX = jget('rxHistory.v1', []), KEEP = jget('rxKeep.v1', false);

function renderTpl() {
  $('#tplSel').innerHTML = '<option value="">+ Add medication from template...</option>' + TP.map(t => `<option value="${t.id}">${he(t.label)}</option>`).join('');
}
function saveTpl(m) {
  if (!m.gen) { alert('Enter the generic name first.'); return; }
  const label = prompt('Template name:', `${m.gen} ${m.dose}`.trim()); if (!label) return;
  TP.push({ id: uid(), label, med: m }); jset('rxTemplates.v1', TP); renderTpl();
}
$('#tplSel').onchange = e => {
  const t = TP.find(x => x.id === e.target.value); e.target.value = ''; if (!t) return;
  const ms = document.querySelectorAll('.med');
  if (ms.length === 1 && !val(ms[0], '.m_gen')) fillMed(ms[0], t.med); else addMed(t.med);
};

function renderPtl() { $('#ptl').innerHTML = KEEP ? PT.map(p => `<option value="${he(p.name)}">`).join('') : ''; }
function fillPatient(p) {
  $('#pt_name').value = p.name; $('#pt_age').value = p.age || ''; $('#pt_sex').value = p.sex || '';
  $('#pt_wt').value = p.wt || ''; $('#pt_addr').value = p.addr || ''; $('#pt_all').value = p.all || '';
}
$('#pt_name').onchange = () => {
  const n = $('#pt_name').value.trim().toLowerCase(), p = KEEP && PT.find(x => x.name.toLowerCase() === n);
  if (p && !$('#pt_age').value && !$('#pt_addr').value) fillPatient(p);
};
function rememberRx(R) {
  const p = { name: R.name, age: R.age, sex: R.sex, wt: R.wt, addr: R.addr, all: R.all };
  const i = PT.findIndex(x => x.name.toLowerCase() === p.name.toLowerCase());
  if (i >= 0) { p.id = PT[i].id; PT[i] = p; } else { p.id = uid(); PT.push(p); }
  HX.unshift({ id: uid(), date: R.date, patient: p, meds: R.meds }); HX = HX.slice(0, 200);
  jset('rxPatients.v1', PT); jset('rxHistory.v1', HX); renderPtl();
}
function renderSaved() {
  $('#keepOn').checked = KEEP;
  $('#tplList').innerHTML = TP.map(t => `<div class="it"><span>${he(t.label)}</span><button class="sec" data-x="tD" data-id="${t.id}">Delete</button></div>`).join('') || '<p class="hint">None yet. Tap "Save as template" on any medication.</p>';
  const q = $('#ptSearch').value.toLowerCase();
  $('#ptList').innerHTML = PT.filter(p => p.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name)).map(p => `<div class="it"><span>${he(p.name)}<small>${he([p.age, p.sex].filter(Boolean).join(' / '))}</small></span><span><button class="sec" data-x="pU" data-id="${p.id}">Use</button><button class="sec" data-x="pD" data-id="${p.id}">Delete</button></span></div>`).join('') || '<p class="hint">Empty.</p>';
  $('#hxList').innerHTML = HX.map(h => `<div class="it"><span>${he(h.patient.name)}<small>${he(fmtDate(h.date))}: ${he(h.meds.map(m => m.gen).join(', '))}</small></span><span><button class="sec" data-x="hU" data-id="${h.id}">Reuse</button><button class="sec" data-x="hD" data-id="${h.id}">Delete</button></span></div>`).join('') || '<p class="hint">Empty.</p>';
}
$('#ptSearch').oninput = renderSaved;
$('#keepOn').onchange = e => {
  KEEP = e.target.checked; jset('rxKeep.v1', KEEP);
  if (!KEEP && (PT.length || HX.length) && confirm('Also delete the saved patients and history now?')) { PT = []; HX = []; jset('rxPatients.v1', PT); jset('rxHistory.v1', HX); }
  renderPtl(); renderSaved();
};
$('#ptAll').onclick = () => { if (confirm('Delete ALL saved patients?')) { PT = []; jset('rxPatients.v1', PT); renderPtl(); renderSaved(); } };
$('#hxAll').onclick = () => { if (confirm('Delete ALL history?')) { HX = []; jset('rxHistory.v1', HX); renderSaved(); } };
$('#vSv').addEventListener('click', e => {
  const b = e.target.closest('button[data-x]'); if (!b) return;
  const id = b.dataset.id, x = b.dataset.x;
  if (x === 'tD' && confirm('Delete this template?')) { TP = TP.filter(t => t.id !== id); jset('rxTemplates.v1', TP); renderTpl(); }
  if (x === 'pD' && confirm('Delete this patient?')) { PT = PT.filter(p => p.id !== id); jset('rxPatients.v1', PT); renderPtl(); }
  if (x === 'hD' && confirm('Delete this entry?')) { HX = HX.filter(h => h.id !== id); jset('rxHistory.v1', HX); }
  if (x === 'pU') { fillPatient(PT.find(p => p.id === id)); tab('Rx'); return; }
  if (x === 'hU') {
    const h = HX.find(k => k.id === id); fillPatient(h.patient); $('#meds').innerHTML = '';
    h.meds.forEach(m => addMed(m)); $('#rx_date').value = today(); tab('Rx'); return;
  }
  renderSaved();
});

/* ---------- init ---------- */
renderProfiles(); renderTpl(); renderPtl();
const prof = fillProfile();
resetForm();
if (!prof.name) tab('Pr');
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
