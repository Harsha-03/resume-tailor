import type { TemplateId } from "./types";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  /* Visual cue colors for the picker */
  swatchPrimary: string;
  swatchSecondary: string;
  /* Style tokens used by generators */
  pdf: {
    fontFamily: string;
    headingColor: string;
    accentColor: string;
    headerStyle: "plain" | "underlined" | "bordered";
    sectionTitleCase: "upper" | "title";
  };
  docx: {
    fontFamily: string;
    headingColor: string;
    accentColor: string;
    headerStyle: "plain" | "underlined" | "bordered";
    sectionTitleCase: "upper" | "title";
  };
}

export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Maximum ATS compatibility. No color, no flourishes.",
    swatchPrimary: "#f5f1e8",
    swatchSecondary: "#888888",
    pdf: {
      fontFamily: "Helvetica",
      headingColor: "#111111",
      accentColor: "#666666",
      headerStyle: "underlined",
      sectionTitleCase: "upper",
    },
    docx: {
      fontFamily: "Calibri",
      headingColor: "111111",
      accentColor: "666666",
      headerStyle: "underlined",
      sectionTitleCase: "upper",
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Subtle accent on section headers. Still single-column, still ATS-friendly.",
    swatchPrimary: "#d97757",
    swatchSecondary: "#111111",
    pdf: {
      fontFamily: "Helvetica",
      headingColor: "#0a0a0a",
      accentColor: "#c4623f",
      headerStyle: "bordered",
      sectionTitleCase: "upper",
    },
    docx: {
      fontFamily: "Calibri",
      headingColor: "0a0a0a",
      accentColor: "C4623F",
      headerStyle: "bordered",
      sectionTitleCase: "upper",
    },
  },
  classic: {
    id: "classic",
    name: "Classic",
    description: "Serif headers, traditional spacing. Conservative industries.",
    swatchPrimary: "#1a1a1a",
    swatchSecondary: "#666666",
    pdf: {
      fontFamily: "Times-Roman",
      headingColor: "#1a1a1a",
      accentColor: "#4a4a4a",
      headerStyle: "underlined",
      sectionTitleCase: "title",
    },
    docx: {
      fontFamily: "Cambria",
      headingColor: "1a1a1a",
      accentColor: "4A4A4A",
      headerStyle: "underlined",
      sectionTitleCase: "title",
    },
  },
};
