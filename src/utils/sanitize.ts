// Minimal SVG sanitizer to avoid CSP/script issues when injecting Mermaid output.
// Removes <script> tags, inline event handlers (on*), and javascript: URLs.

export function sanitizeSvg(svg: string): string {
  if (!svg) return svg;

  try {
    // Remove all <script>...</script> blocks
    let out = svg.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

    // Remove on* event handler attributes (e.g., onclick="..." or onload='...')
    out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
             .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
             .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');

    // Neutralize javascript: URLs in href/xlink:href
    out = out.replace(/(href|xlink:href)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
             .replace(/(href|xlink:href)\s*=\s*'javascript:[^']*'/gi, "$1='#'");

    return out;
  } catch {
    return svg;
  }
}

