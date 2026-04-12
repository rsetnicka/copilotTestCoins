"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Display square side (CSS px). */
const PREVIEW_SIZE = 280;
/** Output matches server MAX_EDGE-friendly square. */
export const FRAMED_EXPORT_SIZE = 640;

export type CoinPhotoFramerHandle = {
  exportFramedJpeg: () => Promise<File | null>;
};

type CoinPhotoFramerProps = {
  imageUrl: string;
  /** Bump when the source file changes so transforms reset. */
  sourceKey: string;
  disabled?: boolean;
  className?: string;
};

function coverScale(iw: number, ih: number, box: number): number {
  return Math.max(box / iw, box / ih);
}

/** Pan is applied after `rotate(angle)` around canvas center; clamp using AABB of rotated scaled image. */
function clampPanRotated(
  panX: number,
  panY: number,
  angleRad: number,
  s: number,
  iw: number,
  ih: number,
  circleR: number
): { tx: number; ty: number } {
  const c = Math.cos(angleRad);
  const si = Math.sin(angleRad);
  const halfW = s * (Math.abs(c) * (iw / 2) + Math.abs(si) * (ih / 2));
  const halfH = s * (Math.abs(si) * (iw / 2) + Math.abs(c) * (ih / 2));
  let vx = c * panX - si * panY;
  let vy = si * panX + c * panY;
  const maxX = halfW - circleR;
  const maxY = halfH - circleR;
  if (maxX <= 0 || maxY <= 0) {
    return { tx: 0, ty: 0 };
  }
  vx = Math.min(maxX, Math.max(-maxX, vx));
  vy = Math.min(maxY, Math.max(-maxY, vy));
  return {
    tx: c * vx + si * vy,
    ty: -si * vx + c * vy,
  };
}

function drawFramed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasSize: number,
  zoom: number,
  panX: number,
  panY: number,
  rotationRad: number,
  fillOutside: string | null
): void {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;

  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const R = canvasSize / 2;
  const base = coverScale(iw, ih, canvasSize);
  const s = base * zoom;

  ctx.save();
  ctx.fillStyle = fillOutside ?? "#ffffff";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.translate(cx, cy);
  ctx.rotate(rotationRad);
  ctx.translate(panX, panY);
  ctx.scale(s, s);
  ctx.drawImage(img, -iw / 2, -ih / 2);
  ctx.restore();
}

export const CoinPhotoFramer = forwardRef<CoinPhotoFramerHandle, CoinPhotoFramerProps>(
  function CoinPhotoFramer({ imageUrl, sourceKey, disabled, className }, ref) {
    const t = useTranslations("addCoin");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotationDeg, setRotationDeg] = useState(0);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const rotationRad = (rotationDeg * Math.PI) / 180;
    const dragRef = useRef<{
      active: boolean;
      startX: number;
      startY: number;
      pan0X: number;
      pan0Y: number;
      rotationRad0: number;
    } | null>(null);
    const panRef = useRef({ x: 0, y: 0 });
    panRef.current = { x: panX, y: panY };

    const R = PREVIEW_SIZE / 2;

    const paint = useCallback(() => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !img.naturalWidth) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawFramed(ctx, img, PREVIEW_SIZE, zoom, panX, panY, rotationRad, "#e5e7eb");
    }, [zoom, panX, panY, rotationRad]);

    useEffect(() => {
      setLoaded(false);
      setZoom(1);
      setRotationDeg(0);
      setPanX(0);
      setPanY(0);
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        imgRef.current = img;
        setLoaded(true);
      };
      img.onerror = () => {
        imgRef.current = null;
        setLoaded(false);
      };
      img.src = imageUrl;
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [imageUrl, sourceKey]);

    useEffect(() => {
      if (!loaded) return;
      paint();
    }, [loaded, paint]);

    const commitPan = useCallback(
      (nx: number, ny: number) => {
        const img = imgRef.current;
        if (!img?.naturalWidth) return;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const base = coverScale(iw, ih, PREVIEW_SIZE);
        const s = base * zoom;
        const c = clampPanRotated(nx, ny, rotationRad, s, iw, ih, R);
        setPanX(c.tx);
        setPanY(c.ty);
      },
      [zoom, rotationRad, R]
    );

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled || !loaded) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        pan0X: panX,
        pan0Y: panY,
        rotationRad0: rotationRad,
      };
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const d = dragRef.current;
      if (!d?.active || disabled) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const c = Math.cos(d.rotationRad0);
      const si = Math.sin(d.rotationRad0);
      const dPanX = c * dx + si * dy;
      const dPanY = -si * dx + c * dy;
      commitPan(d.pan0X + dPanX, d.pan0Y + dPanY);
    };

    const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (dragRef.current?.active) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      dragRef.current = null;
    };

    const wheelAreaRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = wheelAreaRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        if (disabled || !loaded) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.06 : 0.06;
        setZoom((z) => Math.min(4, Math.max(1, Math.round((z + delta) * 100) / 100)));
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }, [disabled, loaded]);

    useEffect(() => {
      const img = imgRef.current;
      if (!loaded || !img?.naturalWidth) return;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const base = coverScale(iw, ih, PREVIEW_SIZE);
      const s = base * zoom;
      const { x, y } = panRef.current;
      const c = clampPanRotated(x, y, rotationRad, s, iw, ih, R);
      setPanX(c.tx);
      setPanY(c.ty);
    }, [zoom, loaded, R, rotationRad]);

    const resetFraming = useCallback(() => {
      setZoom(1);
      setRotationDeg(0);
      setPanX(0);
      setPanY(0);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        exportFramedJpeg: async () => {
          const img = imgRef.current;
          if (!img?.naturalWidth) return null;
          const canvas = document.createElement("canvas");
          canvas.width = FRAMED_EXPORT_SIZE;
          canvas.height = FRAMED_EXPORT_SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          const scale = FRAMED_EXPORT_SIZE / PREVIEW_SIZE;
          drawFramed(ctx, img, FRAMED_EXPORT_SIZE, zoom, panX * scale, panY * scale, rotationRad, "#ffffff");
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
          );
          if (!blob) return null;
          const nameBase = "coin-framed.jpg";
          return new File([blob], nameBase, { type: "image/jpeg" });
        },
      }),
      [zoom, panX, panY, rotationRad]
    );

    return (
      <div className={cn("space-y-3", className)} onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-muted-foreground">{t("framingHint")}</p>
        <div
          ref={wheelAreaRef}
          className="relative mx-auto w-fit rounded-xl border bg-muted/30 p-3 shadow-inner"
        >
          <div className="relative" style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}>
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className={cn(
                "block touch-none rounded-full ring-2 ring-violet-300 dark:ring-violet-500/50",
                disabled ? "cursor-not-allowed opacity-60" : loaded ? "cursor-grab active:cursor-grabbing" : "opacity-50"
              )}
              aria-label={t("framingCanvasAria")}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-muted/80 text-xs text-muted-foreground">
                {t("framingLoading")}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="coin-framer-zoom" className="text-xs font-medium text-foreground">
                {t("framingZoom")}
              </label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={resetFraming} disabled={disabled}>
                {t("framingReset")}
              </Button>
            </div>
            <input
              id="coin-framer-zoom"
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              disabled={disabled || !loaded}
              onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
              className="w-full accent-violet-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="coin-framer-rotation" className="text-xs font-medium text-foreground">
              {t("framingRotation")}{" "}
              <span className="tabular-nums text-muted-foreground">({Math.round(rotationDeg)}°)</span>
            </label>
            <input
              id="coin-framer-rotation"
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotationDeg}
              disabled={disabled || !loaded}
              onChange={(e) => setRotationDeg(Number.parseInt(e.target.value, 10))}
              className="w-full accent-violet-600"
            />
          </div>
        </div>
      </div>
    );
  }
);
