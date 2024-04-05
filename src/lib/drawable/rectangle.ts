import { ApplicationProgram } from "../../application";
import {
  Color,
  Point,
  isPointInsideVertexes,
  translatePoint,
} from "../primitives";
import { Drawable } from "./base";

export class Rectangle extends Drawable {
  public type = "rectangle";
  constructor(
    public point: Point,
    public width: number,
    public height: number,
    color: Color[],
    application: ApplicationProgram
  ) {
    super(color, application);
    this.initializeVertexColor();
  }
  public tempRect: Rectangle | undefined = undefined;

  // 0 for left top, 1 for right top, 2 for left bottom, 3 for right bottom
  // public selectedVertexIdx = -1;
  _getPoints(): Point[] {
    const points = [
      { ...this.point },
      { x: this.point.x + this.width, y: this.point.y },
      { x: this.point.x + this.width, y: this.point.y + this.height },
      { x: this.point.x, y: this.point.y + this.height },
    ];
    this.rotatePoints(points, this.localRotatedDegree);

    return points;
  }

  public getPoints(): Point[] {
    if (this.tempRect) {
      return this.tempRect.getPoints();
    }
    return super.getPoints();
  }

  getRotationPoint(): Point {
    return {
      x: this.point.x + this.width / 2,
      y: this.point.y + this.height / 2,
    };
  }

  setWidth(newWidth: number) {
    this.width = newWidth;
  }

  setHeight(newHeight: number) {
    this.width = newHeight;
  }

  translate(translation: Point): void {
    translatePoint(this.point, translation);
    this.resetPointsCache();
  }

  draw(): void {
    console.log("Drawing");
    if (this.tempRect) {
      return this.tempRect.draw();
    }
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(this.calculateRectangle()),
      this.program.gl.STATIC_DRAW
    );

    this.program.gl.bindBuffer(this.program.gl.ARRAY_BUFFER, null);

    console.log(this.getColorCache());
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(this.getColorProcessed()),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.TRIANGLES, 0, 6);
  }

  isSelected(mousePosition: Point): boolean {
    return isPointInsideVertexes(mousePosition, this.getPoints());
  }

  getColorProcessed() {
    const flattenedColor = this.getColorCache();
    return [
      flattenedColor[0],
      flattenedColor[1],
      flattenedColor[2],
      flattenedColor[3],
      flattenedColor[4],
      flattenedColor[5],
      flattenedColor[9],
      flattenedColor[10],
      flattenedColor[11],
      flattenedColor[9],
      flattenedColor[10],
      flattenedColor[11],
      flattenedColor[3],
      flattenedColor[4],
      flattenedColor[5],
      flattenedColor[6],
      flattenedColor[7],
      flattenedColor[8],
    ];
  }

  calculateRectangle() {
    const points = this.getPoints();
    return [
      points[0].x,
      points[0].y,
      points[1].x,
      points[1].y,
      points[3].x,
      points[3].y,
      points[3].x,
      points[3].y,
      points[1].x,
      points[1].y,
      points[2].x,
      points[2].y,
    ];
  }

  initializeVertexColor(): void {
    this.vertexesColorOuter = [1, 2, 3, 4]
      .map(() => this.vertexColorYellow)
      .flat()
      .map((color) => color / 255);

    this.vertexesColorOuter = [1, 2, 3, 4]
      .map(() => this.vertexColorBlack)
      .flat()
      .map((color) => color / 255);
  }

  translateVertex(translation: Point, _beforeLoc: Point) {
    if (this.draggedVertexIdx === -1) {
      return;
    }

    let point: Point = { x: 0, y: 0 };
    let width = this.width;
    let height = this.height;

    switch (this.draggedVertexIdx) {
      case 0:
        point.x = this.point.x + translation.x;
        point.y = this.point.y + translation.y;
        width = this.width - translation.x;
        height = this.height - translation.y;
        break;
      case 1:
        point.x = this.point.x;
        point.y = this.point.y + translation.y;
        width = this.width + translation.x;
        height = this.height - translation.y;
        break;
      case 3:
        point.x = this.point.x + translation.x;
        point.y = this.point.y;
        width = this.width - translation.x;
        height = this.height + translation.y;
        break;
      case 2:
        point.x = this.point.x;
        point.y = this.point.y;
        width = this.width + translation.x;
        height = this.height + translation.y;
        break;
      default:
        return null;
    }

    this.tempRect = new Rectangle(
      point,
      width,
      height,
      this.color,
      this.program
    );
    this.tempRect.localRotatedDegree = this.localRotatedDegree;
  }

  adjustNegativeDimension() {
    if (this.width < 0) {
      this.point.x += this.width;
      this.width *= -1;
    }
    if (this.height < 0) {
      this.point.y += this.height;
      this.height *= -1;
    }
    this.resetPointsCache();
  }

  doneTranslateVertex() {
    if (!this.tempRect) {
      return;
    }
    this.point = this.tempRect.point;
    this.width = this.tempRect.width;
    this.height = this.tempRect.height;
    this.tempRect = undefined;
    this.adjustNegativeDimension();
  }

  moveDrawing(point: Point): void {
    let dx = this.point.x;
    let dy = this.point.y;

    let width = point.x - dx;
    let height = point.y - dy;

    this.width = width;
    this.height = height;
    this.resetPointsCache();
  }

  finishDrawingMove(point: Point): boolean {
    this.moveDrawing(point);
    this.adjustNegativeDimension();
    return true;
  }

  runLocalRotation(): void {}
}
