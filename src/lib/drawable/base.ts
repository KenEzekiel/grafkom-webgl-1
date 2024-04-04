import type { ApplicationProgram } from "../../application";
import { Color, Point, Size, Vec2, rotatePoint } from "../primitives";
export abstract class Drawable {
  protected rotation: Vec2 = [0, 1];
  protected rotationDegree: number = 0;
  public localRotatedDegree: number = 0;
  public selectedVertex: Point | undefined;
  public selectedVertexIdx = -1;
  public isDrawing = true;

  public scale: number = 1;
  protected pointsCache: Point[] | undefined;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  abstract isSelected(mousePosition: Point): boolean;

  abstract translate(translation: Point): void;

  abstract runLocalRotation(): void;

  abstract finishDrawingMove(point: Point): boolean;

  abstract moveDrawing(point: Point): void;

  protected abstract _getPoints(): Point[];

  abstract translateVertex(translation: Point, beforeLoc: Point): void;

  doneTranslateVertex() {}

  public getPoints(): Point[] {
    if (!this.pointsCache) {
      this.pointsCache = this._getPoints();
    }
    return this.pointsCache;
  }

  public resetPointsCache() {
    this.pointsCache = undefined;
  }

  setRotation(degree: number) {
    const degreeDiff = degree - this.localRotatedDegree;
    this.rotationDegree = degreeDiff;
    this.rotation = [
      Math.sin((degreeDiff * 2 * Math.PI) / 360),
      Math.cos((degreeDiff * 2 * Math.PI) / 360),
    ];
    this.runLocalRotation();
    this.resetPointsCache();
    this.localRotatedDegree = degree;
    this.rotation = [0, 1];
  }

  getRelativePosition(canvasSize: Size): Point {
    const centralPoint = this.getRotationPoint();
    return {
      x: centralPoint.x / canvasSize.width,
      y: centralPoint.y / canvasSize.height,
    };
  }

  setIsDrawing(newIsDrawing: boolean) {
    this.isDrawing = newIsDrawing;
  }

  getRotation() {
    return this.rotation;
  }

  getRotationDegree() {
    return this.rotationDegree;
  }

  rotatePoint(point: Point) {
    rotatePoint(point, this.rotation, this.getRotationPoint());
  }

  rotatePoints(points: Point[], degree?: number) {
    if (degree === undefined) {
      const rotationPoint = { ...this.getRotationPoint() };
      points.forEach((point) => {
        rotatePoint(point, this.rotation, rotationPoint);
      });
    } else {
      const rotationPoint = { ...this.getRotationPoint() };
      points.forEach((point) => {
        rotatePoint(
          point,
          [
            Math.sin((degree * 2 * Math.PI) / 360),
            Math.cos((degree * 2 * Math.PI) / 360),
          ],
          rotationPoint
        );
      });
    }
  }

  prepare(color = this.color) {
    const rotationPoint = this.getRotationPoint();
    this.program.setUniforms({
      color: [...color.map((num) => num / 255), 1],
      rotationPoint: [rotationPoint.x, rotationPoint.y],
      rotation: this.rotation,
      scale: [this.scale],
    });
  }

  drawPoints(pointsSource = this.getPoints()) {
    const rotationPoint = this.getRotationPoint();
    const points: Array<number> = [];

    for (const point of pointsSource) {
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
      const point = { ...points[i] };
      this.rotatePoint(point);
      if (
        position.x >= point.x - 5 &&
        position.x <= point.x + 5 &&
        position.y >= point.y - 5 &&
        position.y <= point.y + 5
      ) {
        return { index: i, selected: points[i] };
      }
    }
    return { index: -1, selected: undefined };
  }

  selectVertex(vertex: Point, idx: number) {
    this.selectedVertex = vertex;
    this.selectedVertexIdx = idx;
  }

  deselectVertex() {
    this.selectedVertex = undefined;
    this.selectedVertexIdx = -1;
  }

  finishDrawing() {
    this.isDrawing = false;
  }
}
