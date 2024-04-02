export interface Point {
  x: number;
  y: number;
}

export type Color = [number, number, number];

export interface Size {
  width: number;
  height: number;
}

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export function translatePoint(point: Point, translation: Point) {
  point.x += translation.x;
  point.y += translation.y;
}

export function rotatePoint(point: Point, rotation: Vec2, center: Point) {
  point.x -= center.x;
  point.y -= center.y;

  const oldPoint = { ...point };
  point.x = oldPoint.x * rotation[1] + oldPoint.y * rotation[0];
  point.y = oldPoint.y * rotation[1] - oldPoint.x * rotation[0];

  point.x += center.x;
  point.y += center.y;
}

export function isPointInsideVertexes(
  point: Point,
  vertexes: Point[],
  toLength = vertexes.length
): boolean {
  if (toLength < 3) {
    return false;
  }
  let inside = false;
  const { x, y } = point;
  let { x: p1x, y: p1y } = vertexes[0];
  for (let i = 0; i <= toLength; i++) {
    const { x: p2x, y: p2y } = vertexes[i % toLength];
    if (
      y > Math.min(p1y, p2y) &&
      y <= Math.max(p1y, p2y) &&
      x <= Math.max(p1x, p2x)
    ) {
      if (p1y !== p2y) {
        const xinters = ((y - p1y) * (p2x - p1x)) / (p2y - p1y) + p1x;
        if (p1x === p2x || x <= xinters) {
          inside = !inside;
        }
      }
    }
    [p1x, p1y] = [p2x, p2y];
  }
  return inside;
}
