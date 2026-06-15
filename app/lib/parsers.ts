/* Client-side file parsing.
 * Extracts URL annotations from PDFs and hyperlinks from DOCX.
 * Uses overlap detection (not just point-in-rect) to catch URL annotations
 * that don't align exactly with text baselines.
 */

import mammoth from "mammoth";

interface LinkAnnot {
  rect: number[]; // [x1, y1, x2, y2]
  url: string;
}

/* Expand a rect by a margin (helps catch text whose baseline sits just outside the annotation) */
function expandRect(rect: number[], margin: number = 4): number[] {
  return [rect[0] - margin, rect[1] - margin, rect[2] + margin, rect[3] + margin];
}

/* Check if a text item OVERLAPS with a link rect.
 * Uses both center-point and bounding-box checks for robustness.
 */
function textInLinkRect(item: any, rect: number[]): boolean {
  const expanded = expandRect(rect, 4);
  const [rx1, ry1, rx2, ry2] = expanded;

  const x = item.transform[4];
  const y = item.transform[5];

  // Text item width (approximate if not provided)
  const w = item.width || (item.str?.length || 0) * (item.transform[0] || 6);
  const h = item.height || 10;

  // Check center point first (fast path)
  const cx = x + w / 2;
  const cy = y + h / 2;
  if (cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2) return true;

  // Check baseline point
  if (x >= rx1 && x <= rx2 && y >= ry1 && y <= ry2) return true;

  // Check if any corner of the text bbox falls in the rect
  const corners = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ];
  for (const [px, py] of corners) {
    if (px >= rx1 && px <= rx2 && py >= ry1 && py <= ry2) return true;
  }

  return false;
}

/* Parse PDF using PDF.js + extract link annotations */
export async function parsePdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allPageTexts: string[] = [];
  // Display text -> URL map (deduped globally by display text)
  const linkMap = new Map<string, string>();
  // Also track all unique URLs found, for verification
  const allUrls = new Set<string>();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const [content, annotations] = await Promise.all([
      page.getTextContent(),
      page.getAnnotations(),
    ]);

    const linkAnnots: LinkAnnot[] = (annotations as any[])
      .filter((a) => a.subtype === "Link" && (a.url || a.unsafeUrl))
      .map((a) => ({
        rect: a.rect as number[],
        url: (a.url || a.unsafeUrl) as string,
      }));

    for (const link of linkAnnots) allUrls.add(link.url);

    const items = (content.items as any[]).filter((it) => "str" in it);

    // Group consecutive linked text items so "View it here" stays together
    const pageWords: string[] = [];
    let bufferedText = "";
    let bufferedUrl: string | null = null;

    const flushBuffer = () => {
      if (bufferedText.trim() && bufferedUrl) {
        const cleaned = bufferedText.trim();
        if (!linkMap.has(cleaned)) {
          linkMap.set(cleaned, bufferedUrl);
        }
        pageWords.push(`${bufferedText} <${bufferedUrl}>`);
      } else if (bufferedText) {
        pageWords.push(bufferedText);
      }
      bufferedText = "";
      bufferedUrl = null;
    };

    for (const item of items) {
      const text = (item.str || "").toString();
      if (!text) continue;

      // Match against link annotations
      let matchedUrl: string | null = null;
      for (const link of linkAnnots) {
        if (textInLinkRect(item, link.rect)) {
          matchedUrl = link.url;
          break;
        }
      }

      if (matchedUrl) {
        if (bufferedUrl === matchedUrl) {
          // Same link, accumulate
          bufferedText += (text.startsWith(" ") ? "" : " ") + text;
        } else {
          flushBuffer();
          bufferedText = text;
          bufferedUrl = matchedUrl;
        }
      } else {
        flushBuffer();
        pageWords.push(text);
      }
    }
    flushBuffer();

    allPageTexts.push(pageWords.join(" "));
  }

  let result = allPageTexts.join("\n").trim();

  if (linkMap.size > 0 || allUrls.size > 0) {
    result += "\n\n[LINKS FOUND IN RESUME]\n";
    for (const [text, url] of linkMap.entries()) {
      result += `"${text}" -> ${url}\n`;
    }
    // Also list any URLs that weren't tied to specific text
    for (const url of allUrls) {
      if (![...linkMap.values()].includes(url)) {
        result += `(unattached) -> ${url}\n`;
      }
    }
  }

  return result;
}

/* Parse DOCX with hyperlink extraction */
export async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ arrayBuffer }),
    mammoth.convertToHtml({ arrayBuffer }),
  ]);

  const text = textResult.value.trim();
  const html = htmlResult.value;

  const linkMap = new Map<string, string>();
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const displayText = match[2].trim();
    if (displayText && url && !linkMap.has(displayText)) {
      linkMap.set(displayText, url);
    }
  }

  let result = text;
  if (linkMap.size > 0) {
    result += "\n\n[LINKS FOUND IN RESUME]\n";
    for (const [t, url] of linkMap.entries()) {
      result += `"${t}" -> ${url}\n`;
    }
  }

  return result;
}

export async function parseTxt(file: File): Promise<string> {
  const text = await file.text();
  return text.trim();
}

export async function parseFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parsePdf(file);
  if (name.endsWith(".docx")) return parseDocx(file);
  if (name.endsWith(".txt")) return parseTxt(file);
  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
}
