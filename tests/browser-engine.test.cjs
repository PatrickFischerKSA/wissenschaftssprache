const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('public/wissenschaftssprache/review-engine.js', 'utf8'), context);
const engine = context.ScientificReview;
const text = 'Ich finde, dass wissenschaftliche Sprache eigentlich schwierig ist. „Wissenschaftliche Texte brauchen nachvollziehbare Quellen.“ Man kann an vielen Dingen erkennen, dass eine klare Struktur wichtig ist.\n\nAbschliessend kann man sagen, dass eine präzise Wortwahl wichtig ist.';
test('analysis and all revision levels run without Node or network globals', () => {
  for (const style of ['apa', 'fussnoten']) {
    const result = engine.analyzeScientificStyle(text, style, {title: 'Sprache', abstract: '', workType: 'allgemein'});
    assert.equal(result.citationStyle, style);
    assert.ok(Number.isFinite(result.overallScore));
    assert.ok(result.issues.some(issue => issue.id === 'ich-form'));
    assert.equal(result.revisionWorkbench.levels.length, 3);
    assert.ok(!engine.analyzeScientificStyle(text + ' Viele Leute machen das nur halb genau.', style).revisionWorkbench.levels[2].text.includes('nur nur')); 
    const standard = result.revisionWorkbench.levels.find(level => level.id === 'standard');
    assert.ok(standard.text.includes(style === 'apa' ? 'Autor, Jahr' : 'Fussnote mit Quelle'));
    assert.ok(standard.text.includes('Wissenschaftliche Texte brauchen nachvollziehbare Quellen.'));
  }
});
test('HTML and DOCX parsing preserve paragraph boundaries and remove executable HTML', () => {
  assert.equal(engine.stripHtml('<p>Erster Absatz.</p><script>alert(1)</script><p>Zweiter &amp; dritter.</p>'), 'Erster Absatz.\n\nZweiter & dritter.');
  assert.equal(engine.extractDocxXmlText('<w:p><w:r><w:t>Erster</w:t></w:r></w:p><w:p><w:r><w:t>Zweiter</w:t></w:r></w:p>'), 'Erster\n\nZweiter');
});
test('browser app has no outgoing API calls or remote dependencies', () => {
  for (const file of ['app.js', 'review-engine.js']) {
    const source = fs.readFileSync('public/wissenschaftssprache/' + file, 'utf8');
    assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|OPENAI_API_KEY|https:\/\//);
  }
});
test('TXT, HTML and DOCX files are extracted locally', async () => {
  global.ScientificReview = engine;
  global.fflate = require('../public/wissenschaftssprache/vendor/fflate.js');
  const { extractLocalFile } = await import('../public/wissenschaftssprache/file-reader.mjs');
  assert.equal(await extractLocalFile(new File(['Text aus der Datei'], 'probe.txt')), 'Text aus der Datei');
  assert.equal(await extractLocalFile(new File(['<p>Hallo &amp; Welt</p>'], 'probe.html')), 'Hallo & Welt');
  const archive = fflate.zipSync({ 'word/document.xml': fflate.strToU8('<w:document><w:p><w:r><w:t>Word-Test</w:t></w:r></w:p></w:document>') });
  assert.equal(await extractLocalFile(new File([archive], 'probe.docx')), 'Word-Test');
  await assert.rejects(extractLocalFile(new File(['x'], 'probe.exe')), /Unterstützt/);
  await assert.rejects(extractLocalFile(new File([fflate.zipSync({})], 'leer.docx')), /Kein lesbarer/);
});
test('PDF text layer is read without a remote PDF service', async () => {
  global.location = { href: require('node:url').pathToFileURL(require('node:path').resolve('public/wissenschaftssprache/index.html')).href };
  const { extractLocalFile } = await import('../public/wissenschaftssprache/file-reader.mjs');
  const stream = 'BT /F1 12 Tf 72 720 Td (Lokaler PDF Test) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = pdf.length;
  pdf += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  assert.match(await extractLocalFile(new File([pdf], 'probe.pdf')), /Lokaler PDF Test/);
});
