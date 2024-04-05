// import hull from "hull.js";
import { ApplicationProgram } from "../../application";
import { Color, Point, translatePoint } from "../primitives";
import { Drawable } from "./base";
import { Line } from "./line";

export class Polygon extends Drawable {
  private localPoints: Array<number> = [];
  public nextPoint: Point | undefined;
  public type = "polygon";

  constructor(
    public points: Array<Point>,
    color: Color[],
    application: ApplicationProgram
  ) {
    super(color, application);
    this.updateLocalPoints();
    this.initializeVertexColor();
  }
  getRotationPoint(): Point {
    return this.points[0];
  }

  _getPoints(): Point[] {
    return this.points;
  }

  isSelected(mousePosition: Point, toLength = this.points.length): boolean {
    if (toLength < 3) {
      return false;
    }
    let inside = false;
    const { x, y } = mousePosition;
    const point1 = { ...this.points[0] };
    this.rotatePoint(point1);
    let { x: p1x, y: p1y } = point1;
    for (let i = 0; i <= toLength; i++) {
      const point2 = { ...this.points[i % toLength] };
      this.rotatePoint(point2);
      const { x: p2x, y: p2y } = point2;
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

  deletePoint(index: number) {
    if (this.points.length < 4) {
      return;
    }
    if (index > this.points.length - 1) {
      throw new Error("Out of bound!");
    }

    this.points.splice(index, 1);
    this.color.splice(index, 1);
    this.updateConvexHull();
  }

  changePoint(point: Point, toPoint: Point) {
    const idx = this.points.findIndex((p) => p === point);
    if (idx === -1) {
      return;
    }
    point.x = toPoint.x;
    point.y = toPoint.y;
    this.updateConvexHull();
  }

  translate(translation: Point): void {
    for (let i = 0; i < this.points.length; i++) {
      translatePoint(this.points[i], translation);
    }

    this.resetPointsCache();

    this.updateLocalPoints();
  }

  getLastColor() {
    return this.color[this.color.length - 1];
  }

  addPoint(point: Point) {
    this.points.push(point);
    const lastColor = this.getLastColor();
    this.color.push([lastColor[0], lastColor[1], lastColor[2]]);
    this.updateLocalPoints();
  }

  updateLastPoint(point: Point) {
    this.points[this.points.length - 1] = point;
    this.updateLocalPoints();
  }

  updateConvexHull() {
    let temp: Point[] = [];
    this.points.forEach((point) => {
      temp.push(point);
    });
    if (this.points.length > 3) this.points = convexHull(temp, temp.length);
    this.updateLocalPoints();
  }

  // private updateConvexHullLib() {
  //   this.points = hull(this.points, 50, [".x", ".y"]) as Point[];
  //   this.points.pop();
  //   this.points.reverse();
  //   this.updateLocalPoints();
  // }

  updateLocalPoints() {
    this.localPoints = [];
    this.points.forEach((point) => {
      this.localPoints.push(point.x, point.y);
    });
    this.updateColorCache();
    this.resetPointsCache();
  }

  finishDrawingMove(point: Point): boolean {
    if (this.isSelected(point)) {
      this.nextPoint = undefined;
      return true;
    } else {
      this.addPoint(point);
      if (this.points.length > 3) {
        this.updateConvexHull();
      }
      return false;
    }
  }

  moveDrawing(point: Point): void {
    this.nextPoint = point;
  }

  finishDrawing(): void {
    super.finishDrawing();
    this.updateConvexHull();
  }

  draw(): void {
    if (this.points.length === 1) {
      this.drawPoints();
    } else if (this.points.length === 2) {
      this.asLine().draw();
    } else {
      this.bufferPositionAndColor(this.localPoints, this.getColorProcessed());

      this.prepare();
      this.program.gl.drawArrays(
        this.program.gl.TRIANGLE_FAN,
        0,
        this.points.length
      );

      if (this.isDrawing) {
        this.program.gl.lineWidth(5);
        this.drawOutline([62, 208, 17]);
      }
    }

    if (this.nextPoint) {
      this.drawPoints([this.nextPoint]);
    }
  }

  initializeVertexColor(): void {
    this.vertexesColorOuter = this.points
      .map(() => this.vertexColorYellow)
      .flat()
      .map((color) => color / 255);

    this.vertexesColorInner = this.points
      .map(() => this.vertexColorBlack)
      .flat()
      .map((color) => color / 255);
  }

  drawOutline(color = this.color[0]) {
    const lines: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < this.points.length; i++) {
      lines.push(this.points[i].x, this.points[i].y);
      lines.push(
        this.points[(i + 1) % this.points.length].x,
        this.points[(i + 1) % this.points.length].y
      );
      colors.push(color[0], color[1], color[2]);
    }

    this.bufferPositionAndColor(lines, color);

    this.prepare();
    this.program.gl.drawArrays(
      this.program.gl.LINES,
      0,
      this.points.length * 2
    );
  }

  private asLine(): Line {
    return new Line([this.points[0], this.points[1]], this.color, this.program);
  }

  translateVertex(translation: Point, beforeLoc: Point): void {
    if (!this.draggedVertex) {
      return;
    }
    this.draggedVertex.x = beforeLoc.x + translation.x;
    this.draggedVertex.y = beforeLoc.y + translation.y;
    this.updateLocalPoints();
  }

  doneTranslateVertex(): void {
    this.updateConvexHull();
  }

  runLocalRotation(): void {
    this.rotatePoints(this.points);
    this.updateLocalPoints();
  }
}

// Helper functions for the convex hull

/**
 * Get next to top in a stack
 * @param S
 * @returns Point
 */
function nextToTop(S: Point[]): Point {
  return S[S.length - 2];
}

/**
 * Get the lowest point from a set of points, reduce will iterate all the points and return a single result
 * @param points
 * @returns
 */
//function getLowestPoint(points: Point[]): Point {
//  return points.reduce((lowest, point) =>
//    point.y < lowest.y || (point.y === lowest.y && point.x < lowest.x)
//      ? point
//      : lowest
//  );
//}

/**
 * Sort all the points by the atan2 function, angle between positive x-axis and line segment from the lowest point
 * @param points
 * @param lowest
 * @returns
 */
//function sortPointsByAngle(points: Point[], lowest: Point): Point[] {
//  return points.sort(compare);
//}

/**
 * Get the square distance between two points
 * @param p1
 * @param p2
 * @returns number
 */
function distSq(p1: Point, p2: Point): number {
  return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}

/**
 * To find orientation of ordered triplet (p, q, r).
 * The function returns following values
 * 0 --> p, q and r are collinear
 * 1 --> Clockwise
 * 2 --> Counterclockwise
 * @param p1 Point 1
 * @param p2 Point 2
 * @param p3 Point 2
 * @returns number
 */
function getOrientation(p1: Point, p2: Point, p3: Point): number {
  let val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
  if (val == 0) return 0; // collinear
  else if (val > 0) return 1; // clock wise
  else return 2; // counterclock wise
}

let p0: Point = { x: 0, y: 0 };

/**
 * Used by cmp_to_key function to sort an array of points with respect to the first point
 * @param p1
 * @param p2
 * @returns number
 */
function compare(p1: Point, p2: Point): number {
  // Find orientation
  let o = getOrientation(p0, p1, p2);
  if (o == 0) {
    if (distSq(p0, p2) >= distSq(p0, p1)) return -1;
    else return 1;
  } else {
    if (o == 2) return -1;
    else return 1;
  }
}

/**
 * Graham Scan Algorithm
 * @param points
 * @param n
 * @returns Points array
 */
function convexHull(points: Point[], n: number): Point[] {
  // Find the bottommost point
  let ymin = points[0].y;
  let min = 0;
  for (var i = 1; i < n; i++) {
    let y = points[i].y;

    // Pick the bottom-most or choose the left
    // most point in case of tie
    if (y < ymin || (ymin == y && points[i].x < points[min].x)) {
      ymin = points[i].y;
      min = i;
    }
  }

  // Place the bottom-most point at first position
  points[0], (points[min] = points[min]), points[0];

  // Sort n-1 points with respect to the first point.
  // A point p1 comes before p2 in sorted output if p2
  // has larger polar angle (in counterclockwise
  // direction) than p1
  // ascending polar angle
  p0 = points[0];
  points.sort(compare);

  // If two or more points make same angle with p0,
  // Remove all but the one that is farthest from p0
  // Remember that, in above sorting, our criteria was
  // to keep the farthest point at the end when more than
  // one points have same angle.
  let m = 1; // Initialize size of modified array
  for (var i = 1; i < n; i++) {
    // Keep removing i while angle of i and i+1 is same
    // with respect to p0
    while (i < n - 1 && getOrientation(p0, points[i], points[i + 1]) == 0)
      i += 1;

    points[m] = points[i];
    m += 1; // Update size of modified array
  }

  // If modified array of points has less than 3 points, convex hull is not possible
  if (m < 3) return [];

  // Create an empty stack and push first three points to it.
  let S = [];
  S.push(points[0]);
  S.push(points[1]);
  S.push(points[2]);

  // Process remaining n-3 points
  for (var i = 3; i < m; i++) {
    // Keep removing top while the angle formed by
    // points next-to-top, top, and points[i] makes
    // a non-left turn
    while (true) {
      if (S.length < 2) break;
      if (getOrientation(nextToTop(S), S[S.length - 1], points[i]) >= 2) break;
      S.pop();
    }

    S.push(points[i]);
  }

  // Now stack has the output points,
  // print contents of stack
  let ret: Point[] = [];
  while (S.length > 0) {
    let p = S[S.length - 1];
    ret.push(S.pop()!);
  }
  return ret;
}

//let a = {x: 607, y: 92};
//let b = {x: 279, y: 34};
//let c = {x: 433, y: 203};
//let d = {x: 563, y: 188};

//let arr = [a, b, c, d];

// let e = { x: 311, y: 62 };
// let f = { x: 393, y: 203 };
// let g = { x: 311, y: 179 };
// let h = { x: 283, y: 255 };
// let i = { x: 177, y: 219 };
// let j = { x: 192, y: 94 };

// let arr = [e, f, g, h, i, j];

// //(177, 219)
// //(283, 255)
// //(393, 203)
// //(192, 94)
// //(311, 62)

// let result = convexHull(arr, arr.length);

// console.log(result);
