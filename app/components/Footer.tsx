"use client";

export default function Footer() {
  return (
    <footer className="mt-20 py-7 border-t border-white/[0.06]">
      <div className="px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-bone-dim">
        <p>
          Built by{" "}
          <a
            href="https://harshaasapu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone-muted hover:text-clay transition-colors"
          >
            Harsha Asapu
          </a>
          . Free. No signup. Your resume stays in your browser.
        </p>
        <p>v0.4 · Reno, NV</p>
      </div>
    </footer>
  );
}
