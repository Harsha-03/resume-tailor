import { NextRequest, NextResponse } from "next/server";
import { buildResumeDocx } from "@/app/lib/docx-gen";
import { buildResumePdf } from "@/app/lib/pdf-gen";
import type { TailoredResume, TemplateId } from "@/app/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tailored: TailoredResume = body.tailored;
    const format: string = body.format || "docx";
    const template: TemplateId = body.template || "minimal";

    if (!tailored || !tailored.name) {
      return NextResponse.json(
        { error: "Missing tailored resume data." },
        { status: 400 }
      );
    }
    if (format !== "docx" && format !== "pdf") {
      return NextResponse.json({ error: "format must be 'docx' or 'pdf'" }, { status: 400 });
    }
    if (!["minimal", "modern", "classic"].includes(template)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === "pdf") {
      buffer = await buildResumePdf(tailored, template);
      contentType = "application/pdf";
      filename = `tailored-resume-${template}.pdf`;
    } else {
      buffer = await buildResumeDocx(tailored, template);
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filename = `tailored-resume-${template}.docx`;
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("[download/resume] error:", err);
    return NextResponse.json(
      { error: err?.message || "Download failed" },
      { status: 500 }
    );
  }
}
