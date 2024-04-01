import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";
import { Line } from "./line";

export class Polygon extends Drawable {
  private localPoints: Array<number> = [];
  public type = "polygon";

  constructor(
    public points: Array<Point>,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
    this.updateLocalPoints();
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
    let { x: p1x, y: p1y } = this.points[0];
    for (let i = 0; i <= toLength; i++) {
      const { x: p2x, y: p2y } = this.points[i % toLength];
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
    if (index > this.points.length - 1) {
      throw new Error("Out of bound!");
    }

    this.points.splice(index, 1);
    this.updateLocalPoints();
  }

  changePoint(point: Point, toPoint: Point) {
    const idx = this.points.findIndex((p) => p === point);
    if (idx === -1) {
      return;
    }
    point.x = toPoint.x;
    point.y = toPoint.y;
    this.updateLocalPoints();
  }

  addPoint(point: Point) {
    this.points.push(point);
    this.updateLocalPoints();
  }

  updateLastPoint(point: Point) {
    this.points[this.points.length - 1] = point;
    this.updateLocalPoints();
  }

  private updateLocalPoints() {
    this.localPoints = [];
    this.points.forEach((point) => {
      this.localPoints.push(point.x, point.y);
    });
    this.resetPoints();
  }

  draw(): void {
    if (this.points.length == 2) {
      this.asLine().draw();
      return;
    }
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(this.localPoints),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(
      this.program.gl.TRIANGLE_FAN,
      0,
      this.points.length
    );
  }

  private asLine(): Line {
    return new Line([this.points[0], this.points[1]], this.color, this.program);
  }
}
