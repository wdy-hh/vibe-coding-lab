export interface DisplayRect { x: number; y: number; width: number; height: number }

/** Exactly matches centred CSS object-fit: contain; shared by video and overlay. */
export function containRect(sourceWidth: number, sourceHeight: number, width: number, height: number): DisplayRect {
  if (sourceWidth <= 0 || sourceHeight <= 0 || width <= 0 || height <= 0) return { x: 0, y: 0, width: 0, height: 0 };
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  return { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight };
}

export function displayPoint(x: number, y: number, rect: DisplayRect, mirrored: boolean): { x: number; y: number } {
  return { x: rect.x + (mirrored ? 1 - x : x) * rect.width, y: rect.y + y * rect.height };
}
