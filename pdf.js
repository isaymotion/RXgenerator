/* Minimal PDF writer: text, lines, JPEG images. No dependencies. */
const PDFLite = (() => {
  const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
  const esc = s => String(s).replace(/[^\x20-\x7e\xa0-\xff]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const FONTS = { R: 'F1', B: 'F2', I: 'F3', BI: 'F4' };

  class Doc {
    constructor(w, h) { this.w = w; this.h = h; this.pages = [[]]; this.img = null; }
    get ops() { return this.pages[this.pages.length - 1]; }
    addPage() { this.pages.push([]); }
    tw(s, size, f = 'R') { return String(s).length * size * (f.includes('B') ? 0.56 : 0.52); }
    text(x, y, s, size = 10, f = 'R') {
      this.ops.push(`BT /${FONTS[f]} ${size} Tf ${x.toFixed(1)} ${(this.h - y).toFixed(1)} Td (${esc(s)}) Tj ET`);
    }
    line(x1, y1, x2, y2, wd = 0.7) {
      this.ops.push(`${wd} w ${x1} ${this.h - y1} m ${x2} ${this.h - y2} l S`);
    }
    wrap(s, maxW, size, f = 'R') {
      const out = []; let cur = '';
      for (const word of String(s).split(/\s+/)) {
        const t = cur ? cur + ' ' + word : word;
        if (this.tw(t, size, f) > maxW && cur) { out.push(cur); cur = word; } else cur = t;
      }
      if (cur) out.push(cur);
      return out;
    }
    image(jpegDataUrl, iw, ih, x, y, w, h) {
      const bin = atob(jpegDataUrl.split(',')[1]);
      this.img = { bytes: enc(bin), w: iw, h: ih };
      this.ops.push(`q ${w} 0 0 ${h} ${x} ${this.h - y - h} cm /Im1 Do Q`);
      this.imgPages = (this.imgPages || new Set()).add(this.pages.length - 1);
    }
    output() {
      const parts = [], offs = []; let off = 0;
      const add = s => { const b = typeof s === 'string' ? enc(s) : s; parts.push(b); off += b.length; };
      const obj = (n, body) => { offs[n] = off; add(`${n} 0 obj\n${body}\nendobj\n`); };
      add('%PDF-1.4\n');
      const n = this.pages.length, kids = [];
      for (let i = 0; i < n; i++) kids.push(`${7 + 2 * i} 0 R`);
      obj(1, '<</Type/Catalog/Pages 2 0 R>>');
      obj(2, `<</Type/Pages/Kids[${kids.join(' ')}]/Count ${n}>>`);
      ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique'].forEach((f, i) =>
        obj(3 + i, `<</Type/Font/Subtype/Type1/BaseFont/${f}/Encoding/WinAnsiEncoding>>`));
      // object 6 reserved: image (or empty placeholder)
      if (this.img) {
        offs[6] = off;
        add(`6 0 obj\n<</Type/XObject/Subtype/Image/Width ${this.img.w}/Height ${this.img.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${this.img.bytes.length}>>\nstream\n`);
        add(this.img.bytes); add('\nendstream\nendobj\n');
      } else obj(6, '<<>>');
      for (let i = 0; i < n; i++) {
        const c = this.pages[i].join('\n');
        obj(7 + 2 * i, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${this.w} ${this.h}]/Contents ${8 + 2 * i} 0 R/Resources<</Font<</F1 3 0 R/F2 4 0 R/F3 5 0 R/F4 6 0 R>>${this.img ? '/XObject<</Im1 6 0 R>>' : ''}>>>>`.replace('/F4 6 0 R', ''));
        obj(8 + 2 * i, `<</Length ${enc(c).length}>>\nstream\n${c}\nendstream`);
      }
      const total = 7 + 2 * n, xr = off;
      let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
      for (let i = 1; i < total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
      add(x + `trailer\n<</Size ${total}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);
      const out = new Uint8Array(off); let p = 0;
      parts.forEach(b => { out.set(b, p); p += b.length; });
      return out;
    }
  }
  return { Doc };
})();
