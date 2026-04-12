import sharp from "sharp";

const MAX_EDGE = 640;
const WEBP_QUALITY = 82;

/** Resize and encode as WebP to keep storage and bandwidth small. */
export async function compressCoinPhoto(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}
