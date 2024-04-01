import type { ApplicationProgram } from "../../application";
import { Color, Point, Size, Vec2 } from "../primitives";
export abstract class Drawable {
  protected rotation: Vec2 = [0, 1];
  protected rotationDegree: number = 0;

  public scale: number = 1;
  protected pointsCache: Point[] | undefined;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  abstract isSelected(mousePosition: Point): boolean;

  abstract translate(translation: Point): void;

  protected abstract _getPoints(): Point[];

  public getPoints(): Point[] {
    if (!this.pointsCache) {
      this.pointsCache = this._getPoints();
    }
    return this.pointsCache;
  }

  public resetPoints() {
    this.pointsCache = undefined;
  }

  setRotation(degree: number) {
    this.rotationDegree = degree;
    this.rotation = [
      Math.sin((degree * 2 * Math.PI) / 360),
      Math.cos((degree * 2 * Math.PI) / 360),
    ];
  }

  getRelativePosition(canvasSize: Size): Point {
    const centralPoint = this.getRotationPoint();
    return {
      x: centralPoint.x / canvasSize.width,
      y: centralPoint.y / canvasSize.height,
    };
  }

  getRotation() {
    return this.rotation;
  }

  getRotationDegree() {
    return this.rotationDegree;
  }

  prepare() {
    const rotationPoint = this.getRotationPoint();
    this.program.setUniforms({
      color: [...this.color.map((num) => num / 255), 1],
      rotationPoint: [rotationPoint.x, rotationPoint.y],
      rotation: this.rotation,
      scale: [this.scale],
    });
  }

  drawPoints() {
    const rotationPoint = this.getRotationPoint();
    const points: Array<number> = [];

    for (const point of this.getPoints()) {
      points.push(point.x, point.y);
    }

    this.program.setUniforms({
      color: [1, 1, 0.5, 1],
      rotation: this.rotation,
      rotationPoint: [rotationPoint.x, rotationPoint.y],
      scale: [1],
      pointSize: [10],
    });

    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(points),
      this.program.gl.STATIC_DRAW
    );

    this.program.gl.drawArrays(this.program.gl.POINTS, 0, points.length / 2);

    this.program.setUniforms({
      color: [0, 0, 0, 1],
      pointSize: [4],
    });

    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(points),
      this.program.gl.STATIC_DRAW
    );

    this.program.gl.drawArrays(this.program.gl.POINTS, 0, points.length / 2);
  }

  getSelectedPoint(position: Point) {
    const points = this.getPoints();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (
        position.x >= point.x - 5 &&
        position.x <= point.x + 5 &&
        position.y >= point.y - 5 &&
        position.y <= point.y + 5
      ) {
        return { index: i, selected: point };
      }
    }
    return { index: -1, selected: undefined };
  }
}
