const MAX_EDGE = 640;
const WEBP_QUALITY = 0.82;

/** Resize (max edge) and encode framed JPEG as WebP in the browser for Storage upload. */
export async function framedJpegToWebpBlob(jpegFile: File): Promise<Blob> {
  const bitmap = await createImageBitmap(jpegFile);
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    const scale = Math.min(MAX_EDGE / w, MAX_EDGE / h, 1);
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY)
    );
    if (!blob) {
      throw new Error("WEBP_EXPORT_UNSUPPORTED");
    }
    return blob;
  } finally {
    bitmap.close();
  }
}
