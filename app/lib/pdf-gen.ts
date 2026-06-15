import { jsPDF } from "jspdf";
import type { TailoredResume, TemplateId, SectionId } from "./types";
import { DEFAULT_SECTION_ORDER } from "./types";

const COLORS = {
  ink: "#111111",
  body: "#222222",
  muted: "#555555",
  dim: "#888888",
  accent: "#c4623f",
  border: "#bbbbbb",
};

const MARGIN_LEFT = 44;
const MARGIN_RIGHT = 44;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 40;

function ensureProtocol(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:")
  ) {
    return url;
  }
  if (url.includes("@") && !url.includes(" ")) return `mailto:${url}`;
  return `https://${url}`;
}

function makeDoc() {
  return new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
}

function pageWidth(doc: jsPDF) {
  return doc.internal.pageSize.getWidth();
}

function pageHeight(doc: jsPDF) {
  return doc.internal.pageSize.getHeight();
}

function usableWidth(doc: jsPDF) {
  return pageWidth(doc) - MARGIN_LEFT - MARGIN_RIGHT;
}

function addPageIfNeeded(doc: jsPDF, y: number, needed = 40) {
  if (y + needed > pageHeight(doc) - MARGIN_BOTTOM) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return y;
}

function setFont(doc: jsPDF, style: "normal" | "bold" | "italic", size: number) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  options?: {
    size?: number;
    color?: string;
    style?: "normal" | "bold" | "italic";
    lineHeight?: number;
  }
) {
  const size = options?.size ?? 10;
  const lineHeight = options?.lineHeight ?? size + 3;

  setFont(doc, options?.style ?? "normal", size);
  doc.setTextColor(options?.color ?? COLORS.body);

  const lines = doc.splitTextToSize(text, width) as string[];

  for (const line of lines) {
    y = addPageIfNeeded(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }

  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number) {
  y += 10;
  y = addPageIfNeeded(doc, y, 30);

  setFont(doc, "bold", 10.5);
  doc.setTextColor(COLORS.ink);
  doc.text(title.toUpperCase(), MARGIN_LEFT, y);

  y += 6;

  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, pageWidth(doc) - MARGIN_RIGHT, y);

  return y + 12;
}

function drawBodyText(doc: jsPDF, text: string, y: number) {
  return drawWrappedText(doc, text, MARGIN_LEFT, y, usableWidth(doc), {
    size: 10,
    color: COLORS.body,
    style: "normal",
    lineHeight: 13,
  });
}

function drawMutedText(doc: jsPDF, text: string, y: number) {
  return drawWrappedText(doc, text, MARGIN_LEFT, y, usableWidth(doc), {
    size: 9.5,
    color: COLORS.dim,
    style: "normal",
    lineHeight: 12,
  });
}

function drawBullet(doc: jsPDF, text: string, y: number) {
  y = addPageIfNeeded(doc, y, 24);

  const bulletX = MARGIN_LEFT + 4;
  const textX = MARGIN_LEFT + 16;
  const width = usableWidth(doc) - 16;

  setFont(doc, "normal", 10);
  doc.setTextColor(COLORS.body);

  const lines = doc.splitTextToSize(text, width) as string[];

  doc.text("•", bulletX, y);

  for (const line of lines) {
    y = addPageIfNeeded(doc, y, 13);
    doc.text(line, textX, y);
    y += 13;
  }

  return y + 1;
}

function drawHeaderRow(
  doc: jsPDF,
  leftText: string,
  rightText: string,
  y: number
) {
  y = addPageIfNeeded(doc, y, 30);

  const width = usableWidth(doc);

  setFont(doc, "normal", 9.5);
  const rightWidth = rightText ? doc.getTextWidth(rightText) : 0;
  const leftWidth = width - rightWidth - 12;

  setFont(doc, "bold", 11);
  doc.setTextColor(COLORS.ink);

  const leftLines = doc.splitTextToSize(leftText, leftWidth) as string[];
  const startY = y;

  for (const line of leftLines) {
    doc.text(line, MARGIN_LEFT, y);
    y += 13;
  }

  if (rightText) {
    setFont(doc, "normal", 9.5);
    doc.setTextColor(COLORS.muted);
    doc.text(rightText, pageWidth(doc) - MARGIN_RIGHT - rightWidth, startY);
  }

  return y;
}

function drawProjectLink(doc: jsPDF, url: string, y: number) {
  y = addPageIfNeeded(doc, y, 18);

  const display = url.replace(/^https?:\/\//, "");

  setFont(doc, "normal", 9.5);
  doc.setTextColor(COLORS.accent);

  doc.textWithLink(display, MARGIN_LEFT, y, {
    url: ensureProtocol(url),
  });

  const textWidth = doc.getTextWidth(display);
  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_LEFT, y + 1.5, MARGIN_LEFT + textWidth, y + 1.5);

  return y + 13;
}

export async function buildResumePdf(
  data: TailoredResume,
  _templateId: TemplateId = "minimal"
): Promise<Buffer> {
  const doc = makeDoc();

  const width = usableWidth(doc);
  let y = MARGIN_TOP;

  setFont(doc, "bold", 22);
  doc.setTextColor(COLORS.ink);
  doc.text(data.name || "", pageWidth(doc) / 2, y, {
    align: "center",
  });

  y += 20;

  const contactParts: string[] = [];
  if (data.contact?.location) contactParts.push(data.contact.location);
  if (data.contact?.phone) contactParts.push(data.contact.phone);
  if (data.contact?.email) contactParts.push(data.contact.email);
  if (data.contact?.linkedin) contactParts.push(data.contact.linkedin);
  if (data.contact?.website) contactParts.push(data.contact.website);

  if (contactParts.length > 0) {
    setFont(doc, "normal", 9);
    doc.setTextColor(COLORS.muted);

    const contactLines = doc.splitTextToSize(
      contactParts.join("  •  "),
      width
    ) as string[];

    for (const line of contactLines) {
      doc.text(line, pageWidth(doc) / 2, y, {
        align: "center",
      });
      y += 12;
    }
  }

  y += 8;

  const order: SectionId[] = data.sectionOrder?.length
    ? data.sectionOrder
    : DEFAULT_SECTION_ORDER;

  for (const id of order) {
    switch (id) {
      case "summary":
        if (data.summary?.trim()) {
          y = drawSectionTitle(doc, "Summary", y);
          y = drawBodyText(doc, data.summary.trim(), y);
        }
        break;

      case "skills":
        if (data.skills?.length) {
          y = drawSectionTitle(doc, "Skills", y);
          y = drawBodyText(doc, data.skills.join("  •  "), y);
        }
        break;

      case "experience":
        if (data.experience?.length) {
          y = drawSectionTitle(doc, "Experience", y);

          data.experience.forEach((job, idx) => {
            if (idx > 0) y += 6;

            y = drawHeaderRow(
              doc,
              `${job.title}  |  ${job.company}`,
              job.dates || "",
              y
            );

            if (job.location) {
              y = drawMutedText(doc, job.location, y);
            }

            y += 2;

            (job.bullets || []).forEach((bullet) => {
              y = drawBullet(doc, bullet, y);
            });
          });
        }
        break;

      case "education":
        if (data.education?.length) {
          y = drawSectionTitle(doc, "Education", y);

          data.education.forEach((edu, idx) => {
            if (idx > 0) y += 5;

            y = drawHeaderRow(
              doc,
              `${edu.degree}  |  ${edu.institution}`,
              edu.dates || "",
              y
            );

            if (edu.location) {
              y = drawMutedText(doc, edu.location, y);
            }
          });
        }
        break;

      case "projects":
        if (data.projects?.length) {
          y = drawSectionTitle(doc, "Projects", y);

          data.projects.forEach((proj, idx) => {
            if (idx > 0) y += 6;

            y = addPageIfNeeded(doc, y, 30);

            setFont(doc, "bold", 11);
            doc.setTextColor(COLORS.ink);
            doc.text(proj.name, MARGIN_LEFT, y);
            y += 14;

            if (proj.link) {
              y = drawProjectLink(doc, proj.link, y);
            }

            if (proj.description) {
              y = drawBodyText(doc, proj.description, y);
            }

            (proj.bullets || []).forEach((bullet) => {
              y = drawBullet(doc, bullet, y);
            });
          });
        }
        break;
    }
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export async function buildCoverLetterPdf(
  text: string,
  candidateName: string
): Promise<Buffer> {
  const doc = makeDoc();

  const left = 72;
  const right = 72;
  const top = 72;
  const bottom = 72;
  const width = pageWidth(doc) - left - right;

  let y = top;

  if (candidateName) {
    setFont(doc, "bold", 14);
    doc.setTextColor(COLORS.ink);
    doc.text(candidateName, left, y);
    y += 28;
  }

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph.trim(), width) as string[];

    setFont(doc, "normal", 11);
    doc.setTextColor(COLORS.body);

    for (const line of lines) {
      if (y + 16 > pageHeight(doc) - bottom) {
        doc.addPage();
        y = top;
      }

      doc.text(line, left, y);
      y += 15;
    }

    y += 8;
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}