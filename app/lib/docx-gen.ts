import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
} from "docx";
import type { TailoredResume, TemplateId, SectionId } from "./types";
import { DEFAULT_SECTION_ORDER } from "./types";
import { TEMPLATES } from "./templates";

function maybeUpper(text: string, mode: "upper" | "title"): string {
  return mode === "upper" ? text.toUpperCase() : text;
}

function ensureProtocol(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:")) return url;
  if (url.includes("@") && !url.includes(" ")) return `mailto:${url}`;
  return `https://${url}`;
}

function sectionHeader(text: string, docx: typeof TEMPLATES["minimal"]["docx"]): Paragraph {
  const label = maybeUpper(text, docx.sectionTitleCase);
  const base: any = {
    children: [
      new TextRun({
        text: label,
        bold: true,
        size: 22,
        font: docx.fontFamily,
        color: docx.accentColor,
      }),
    ],
    spacing: { before: 240, after: 80 },
  };

  if (docx.headerStyle === "underlined") {
    base.border = { bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888" } };
  } else if (docx.headerStyle === "bordered") {
    base.border = { bottom: { style: BorderStyle.SINGLE, size: 12, color: docx.accentColor } };
  }

  return new Paragraph(base);
}

function bulletPara(text: string, font: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function regularPara(
  text: string,
  opts: Partial<{ bold: boolean; size: number; alignment: any; color: string; font: string }> = {}
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts.bold || false,
        size: opts.size || 20,
        font: opts.font || "Calibri",
        color: opts.color,
      }),
    ],
    alignment: opts.alignment,
    spacing: { after: 40 },
  });
}

/* Section renderers */

function renderSummary(data: TailoredResume, t: typeof TEMPLATES["minimal"]["docx"]): Paragraph[] {
  if (!data.summary?.trim()) return [];
  return [sectionHeader("Summary", t), regularPara(data.summary.trim(), { font: t.fontFamily })];
}

function renderSkills(data: TailoredResume, t: typeof TEMPLATES["minimal"]["docx"]): Paragraph[] {
  if (!data.skills?.length) return [];
  return [sectionHeader("Skills", t), regularPara(data.skills.join(" • "), { font: t.fontFamily })];
}

function renderExperience(data: TailoredResume, t: typeof TEMPLATES["minimal"]["docx"]): Paragraph[] {
  if (!data.experience?.length) return [];
  const out: Paragraph[] = [sectionHeader("Experience", t)];
  for (const job of data.experience) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${job.title}  |  ${job.company}`,
            bold: true,
            size: 22,
            font: t.fontFamily,
            color: t.headingColor,
          }),
          new TextRun({ text: `\t${job.dates}`, size: 20, font: t.fontFamily, color: "666666" }),
        ],
        spacing: { before: 120, after: 40 },
      })
    );
    if (job.location) out.push(regularPara(job.location, { size: 18, font: t.fontFamily }));
    for (const b of job.bullets || []) {
      if (b.trim()) out.push(bulletPara(b.trim(), t.fontFamily));
    }
  }
  return out;
}

function renderEducation(data: TailoredResume, t: typeof TEMPLATES["minimal"]["docx"]): Paragraph[] {
  if (!data.education?.length) return [];
  const out: Paragraph[] = [sectionHeader("Education", t)];
  for (const edu of data.education) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.degree}  |  ${edu.institution}`,
            bold: true,
            size: 22,
            font: t.fontFamily,
            color: t.headingColor,
          }),
          new TextRun({ text: `\t${edu.dates}`, size: 20, font: t.fontFamily, color: "666666" }),
        ],
        spacing: { before: 80, after: 40 },
      })
    );
    if (edu.location) out.push(regularPara(edu.location, { size: 18, font: t.fontFamily }));
  }
  return out;
}

function renderProjects(data: TailoredResume, t: typeof TEMPLATES["minimal"]["docx"]): Paragraph[] {
  if (!data.projects?.length) return [];
  const out: Paragraph[] = [sectionHeader("Projects", t)];
  for (const proj of data.projects) {
    const projChildren: any[] = [
      new TextRun({
        text: proj.name,
        bold: true,
        size: 22,
        font: t.fontFamily,
        color: t.headingColor,
      }),
    ];
    if (proj.link) {
      projChildren.push(
        new TextRun({ text: "   |   ", size: 20, font: t.fontFamily, color: "888888" }),
        new ExternalHyperlink({
          link: ensureProtocol(proj.link),
          children: [
            new TextRun({
              text: proj.link.replace(/^https?:\/\//, ""),
              size: 18,
              font: t.fontFamily,
              color: t.accentColor,
              underline: {},
            }),
          ],
        }) as any
      );
    }
    out.push(new Paragraph({ children: projChildren, spacing: { before: 80, after: 40 } }));
    if (proj.description) out.push(regularPara(proj.description, { font: t.fontFamily }));
    for (const b of proj.bullets || []) {
      if (b.trim()) out.push(bulletPara(b.trim(), t.fontFamily));
    }
  }
  return out;
}

const SECTION_RENDERERS: Record<
  SectionId,
  (data: TailoredResume, t: typeof TEMPLATES["minimal"]["docx"]) => Paragraph[]
> = {
  summary: renderSummary,
  skills: renderSkills,
  experience: renderExperience,
  education: renderEducation,
  projects: renderProjects,
};

export async function buildResumeDocx(
  data: TailoredResume,
  templateId: TemplateId = "minimal"
): Promise<Buffer> {
  const t = TEMPLATES[templateId].docx;
  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.name || "",
          bold: true,
          size: 36,
          font: t.fontFamily,
          color: t.headingColor,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  );

  // Contact line
  const contactRuns: any[] = [];
  const sep = "  •  ";
  const pushSep = () => {
    if (contactRuns.length > 0) {
      contactRuns.push(new TextRun({ text: sep, size: 18, font: t.fontFamily, color: "555555" }));
    }
  };

  if (data.contact.location) {
    pushSep();
    contactRuns.push(new TextRun({ text: data.contact.location, size: 18, font: t.fontFamily, color: "555555" }));
  }
  if (data.contact.phone) {
    pushSep();
    contactRuns.push(new TextRun({ text: data.contact.phone, size: 18, font: t.fontFamily, color: "555555" }));
  }
  if (data.contact.email) {
    pushSep();
    contactRuns.push(
      new ExternalHyperlink({
        link: ensureProtocol(data.contact.email),
        children: [
          new TextRun({
            text: data.contact.email,
            size: 18,
            font: t.fontFamily,
            color: t.accentColor,
            underline: {},
          }),
        ],
      }) as any
    );
  }
  if (data.contact.linkedin) {
    pushSep();
    contactRuns.push(
      new ExternalHyperlink({
        link: ensureProtocol(data.contact.linkedin),
        children: [
          new TextRun({
            text: "LinkedIn",
            size: 18,
            font: t.fontFamily,
            color: t.accentColor,
            underline: {},
          }),
        ],
      }) as any
    );
  }
  if (data.contact.website) {
    pushSep();
    contactRuns.push(
      new ExternalHyperlink({
        link: ensureProtocol(data.contact.website),
        children: [
          new TextRun({
            text: data.contact.website.replace(/^https?:\/\//, ""),
            size: 18,
            font: t.fontFamily,
            color: t.accentColor,
            underline: {},
          }),
        ],
      }) as any
    );
  }

  if (contactRuns.length > 0) {
    children.push(
      new Paragraph({
        children: contactRuns,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  const order = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_SECTION_ORDER;
  for (const id of order) {
    const renderer = SECTION_RENDERERS[id];
    if (renderer) children.push(...renderer(data, t));
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function buildCoverLetterDocx(
  text: string,
  candidateName: string,
  templateId: TemplateId = "minimal"
): Promise<Buffer> {
  const t = TEMPLATES[templateId].docx;
  const children: Paragraph[] = [];

  if (candidateName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: candidateName,
            bold: true,
            size: 28,
            font: t.fontFamily,
            color: t.headingColor,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  const paragraphs = text.split(/\n\n+/);
  for (const p of paragraphs) {
    if (p.trim()) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p.trim(), size: 22, font: t.fontFamily })],
          spacing: { after: 200 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
