"use client";

import { useCallback } from "react";

export default function ExportPdf({
  targetId,
  fileName,
}: { targetId: string; fileName: string }) {
  const onClick = useCallback(async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .set({
        margin: 10,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(el)
      .save();
  }, [targetId, fileName]);

  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm md:text-base hover:bg-zinc-50 transition"
    >
      Als PDF speichern
    </button>
  );
}
