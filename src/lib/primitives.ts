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
