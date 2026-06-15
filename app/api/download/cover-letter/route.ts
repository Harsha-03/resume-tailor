import { NextRequest, NextResponse } from "next/server";
import { buildCoverLetterDocx } from "@/app/lib/docx-gen";
import { buildCoverLetterPdf } from "@/app/lib/pdf-gen";
import type { TemplateId } from "@/app/lib/types";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const letter: string = (body.letter || "").toString();
    const candidateName: string = (body.candidateName || "").toString();
    const format: string = body.format || "docx";
    const template: TemplateId = body.template || "minimal";

    if (!letter) {
      return NextResponse.json({ error: "Missing letter text." }, { status: 400 });
    }
    if (format !== "docx" && format !== "pdf") {
      return NextResponse.json({ error: "format must be 'docx' or 'pdf'" }, { status: 400 });
    }

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === "pdf") {
      buffer = await buildCoverLetterPdf(letter, candidateName);
      contentType = "application/pdf";
      filename = "cover-letter.pdf";
    } else {
      buffer = await buildCoverLetterDocx(letter, candidateName, template);
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filename = "cover-letter.docx";
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("[download/cover-letter] error:", err);
    return NextResponse.json(
      { error: err?.message || "Download failed" },
      { status: 500 }
    );
  }
}
