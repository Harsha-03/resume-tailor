"use client";

import { motion } from "framer-motion";
import type { TailoredResume, TemplateId, SectionId } from "@/app/lib/types";
import { DEFAULT_SECTION_ORDER } from "@/app/lib/types";

interface ResumePreviewProps {
  data: TailoredResume;
  template?: TemplateId;
}

interface PreviewStyle {
  bodyFont: string;
  headingFont: string;
  accentColor: string;
  borderColor: string;
  sectionTitleTransform: "uppercase" | "none";
  sectionTitleLetterSpacing: string;
  sectionBorderWidth: number;
}

const PREVIEW_STYLES: Record<TemplateId, PreviewStyle> = {
  minimal: {
    bodyFont: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    headingFont: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    accentColor: "#1a1a1a",
    borderColor: "#bbb",
    sectionTitleTransform: "uppercase",
    sectionTitleLetterSpacing: "0.08em",
    sectionBorderWidth: 1,
  },
  modern: {
    bodyFont: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    headingFont: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    accentColor: "#c4623f",
    borderColor: "#c4623f",
    sectionTitleTransform: "uppercase",
    sectionTitleLetterSpacing: "0.08em",
    sectionBorderWidth: 2,
  },
  classic: {
    bodyFont: "Georgia, 'Times New Roman', Times, serif",
    headingFont: "Georgia, 'Times New Roman', Times, serif",
    accentColor: "#1a1a1a",
    borderColor: "#999",
    sectionTitleTransform: "none",
    sectionTitleLetterSpacing: "0.02em",
    sectionBorderWidth: 1,
  },
};

const LINK_STYLE = {
  color: "#c4623f",
  textDecoration: "underline",
  textDecorationColor: "rgba(196, 98, 63, 0.4)",
};

const SECTION_TITLES: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
};

function ContactLink({ value, type }: { value: string; type: "email" | "url" | "text" }) {
  if (type === "text") return <>{value}</>;
  const href = type === "email" ? `mailto:${value}` : value.startsWith("http") ? value : `https://${value}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
      {value}
    </a>
  );
}

function Section({
  title,
  children,
  styleConfig,
}: {
  title: string;
  children: React.ReactNode;
  styleConfig: PreviewStyle;
}) {
  return (
    <div className="mt-4">
      <p
        className="text-[11px] font-bold pb-1 mb-2"
        style={{
          fontFamily: styleConfig.headingFont,
          color: styleConfig.accentColor,
          textTransform: styleConfig.sectionTitleTransform,
          letterSpacing: styleConfig.sectionTitleLetterSpacing,
          borderBottom: `${styleConfig.sectionBorderWidth}px solid ${styleConfig.borderColor}`,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function renderSection(id: SectionId, data: TailoredResume, s: PreviewStyle) {
  const title = SECTION_TITLES[id];

  switch (id) {
    case "summary":
      if (!data.summary) return null;
      return (
        <Section key={id} title={title} styleConfig={s}>
          <p className="text-[12px] leading-relaxed">{data.summary}</p>
        </Section>
      );

    case "skills":
      if (!data.skills?.length) return null;
      return (
        <Section key={id} title={title} styleConfig={s}>
          <p className="text-[12px] leading-relaxed">{data.skills.join("  •  ")}</p>
        </Section>
      );

    case "experience":
      if (!data.experience?.length) return null;
      return (
        <Section key={id} title={title} styleConfig={s}>
          {data.experience.map((job, i) => (
            <div key={i} className={i > 0 ? "mt-3" : ""}>
              <div className="flex justify-between items-baseline">
                <p
                  className="text-[12.5px] font-bold"
                  style={{ fontFamily: s.headingFont, color: s.accentColor }}
                >
                  {job.title} <span className="text-zinc-400 font-normal">|</span> {job.company}
                </p>
                <p className="text-[11px] text-zinc-600 shrink-0 ml-2">{job.dates}</p>
              </div>
              {job.location && <p className="text-[11px] text-zinc-500 mb-1">{job.location}</p>}
              <ul className="space-y-1 mt-1">
                {(job.bullets || []).map((b, j) => (
                  <li key={j} className="text-[12px] leading-relaxed flex gap-1.5">
                    <span className="text-zinc-500 shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      );

    case "education":
      if (!data.education?.length) return null;
      return (
        <Section key={id} title={title} styleConfig={s}>
          {data.education.map((edu, i) => (
            <div key={i} className={i > 0 ? "mt-2" : ""}>
              <div className="flex justify-between items-baseline">
                <p
                  className="text-[12.5px] font-bold"
                  style={{ fontFamily: s.headingFont, color: s.accentColor }}
                >
                  {edu.degree} <span className="text-zinc-400 font-normal">|</span> {edu.institution}
                </p>
                <p className="text-[11px] text-zinc-600 shrink-0 ml-2">{edu.dates}</p>
              </div>
              {edu.location && <p className="text-[11px] text-zinc-500">{edu.location}</p>}
            </div>
          ))}
        </Section>
      );

    case "projects":
      if (!data.projects?.length) return null;
      return (
        <Section key={id} title={title} styleConfig={s}>
          {data.projects.map((p, i) => (
            <div key={i} className={i > 0 ? "mt-2" : ""}>
              <div className="flex items-baseline gap-2">
                <p
                  className="text-[12.5px] font-bold"
                  style={{ fontFamily: s.headingFont, color: s.accentColor }}
                >
                  {p.name}
                </p>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={LINK_STYLE}
                    className="text-[11px]"
                  >
                    ↗ link
                  </a>
                )}
              </div>
              {p.description && <p className="text-[12px] leading-relaxed">{p.description}</p>}
              <ul className="space-y-1 mt-1">
                {(p.bullets || []).map((b, j) => (
                  <li key={j} className="text-[12px] leading-relaxed flex gap-1.5">
                    <span className="text-zinc-500 shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      );

    default:
      return null;
  }
}

export default function ResumePreview({ data, template = "minimal" }: ResumePreviewProps) {
  const s = PREVIEW_STYLES[template];
  const order = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_SECTION_ORDER;

  const contactItems: Array<{ value: string; type: "email" | "url" | "text" }> = [];
  if (data.contact.location) contactItems.push({ value: data.contact.location, type: "text" });
  if (data.contact.phone) contactItems.push({ value: data.contact.phone, type: "text" });
  if (data.contact.email) contactItems.push({ value: data.contact.email, type: "email" });
  if (data.contact.linkedin) contactItems.push({ value: data.contact.linkedin, type: "url" });
  if (data.contact.website) contactItems.push({ value: data.contact.website, type: "url" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      key={template}
      className="bg-bone text-ink-base rounded-lg p-6 md:p-8 max-h-[600px] overflow-y-auto"
      style={{ fontFamily: s.bodyFont }}
    >
      <h2
        className="text-2xl font-bold text-center mb-1"
        style={{ fontFamily: s.headingFont, color: s.accentColor }}
      >
        {data.name}
      </h2>
      {contactItems.length > 0 && (
        <p className="text-[11px] text-center text-zinc-600 mb-5 flex flex-wrap justify-center gap-x-2 gap-y-1">
          {contactItems.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <ContactLink value={item.value} type={item.type} />
              {i < contactItems.length - 1 && <span className="text-zinc-400">•</span>}
            </span>
          ))}
        </p>
      )}

      {order.map((id) => renderSection(id, data, s))}
    </motion.div>
  );
}
