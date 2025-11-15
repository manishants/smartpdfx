export function sanitizeHtml(html: string): string {
  try {
    if (typeof window === 'undefined') return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, style').forEach(el => el.remove());
    doc.querySelectorAll('*').forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
        if (attr.name === 'href') {
          const val = attr.value || '';
          if (!/^(https?:|mailto:|tel:|\/)/i.test(val)) el.removeAttribute(attr.name);
        }
        if (attr.name === 'target' || attr.name === 'rel') {
          el.removeAttribute(attr.name);
        }
      }
    });
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}