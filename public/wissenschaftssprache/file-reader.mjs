export async function extractLocalFile(file) {
  if (file.size > 20 * 1024 * 1024) throw new Error('Bitte eine Datei bis 20 MB verwenden.');
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  if (['txt', 'md'].includes(extension)) return file.text();
  if (['html', 'htm'].includes(extension)) return ScientificReview.stripHtml(await file.text());
  if (extension === 'docx') {
    const archive = new Uint8Array(await file.arrayBuffer());
    // Only extract document text, never embedded objects, macros or external resources.
    const files = fflate.unzipSync(archive, { filter: entry => entry.name === 'word/document.xml' && entry.originalSize <= 20 * 1024 * 1024 });
    const document = files['word/document.xml'];
    if (!document) throw new Error('Kein lesbarer Word-Text gefunden (max. 20 MB entpackter Text).');
    return ScientificReview.extractDocxXmlText(fflate.strFromU8(document));
  }
  if (extension === 'pdf') {
    const pdfjs = await import('./vendor/pdfjs/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', location.href).href;
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, useSystemFonts: true });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > 250) throw new Error('Bitte höchstens 250 PDF-Seiten auf einmal verwenden.');
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => item.str ? item.str + (item.hasEOL ? '\n' : ' ') : '').join(''));
        page.cleanup();
      }
      const text = pages.join('\n\n');
      if (!text.trim()) throw new Error('Dieses PDF enthält keinen auslesbaren Text. Bei Scans den Text bitte selbst einfügen.');
      return text;
    } finally { await task.destroy(); }
  }
  throw new Error('Unterstützt werden TXT, Markdown, HTML, DOCX und PDF mit Textebene.');
}

