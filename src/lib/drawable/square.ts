import { ApplicationProgram } from "../../application";
import {
  Color,
  Point,
  isPointInsideVertexes,
  translatePoint,
} from "../primitives";
import { Drawable } from "./base";

export class Square extends Drawable {
  public type = "square";
  public negX = false;
  public negY = false;
  constructor(
    public point: Point,
    public length: number,
    color: Color[],
    application: ApplicationProgram
  ) {
    super(color, application);
  }
  public tempSquare: Square | undefined = undefined;

  _getPoints(): Point[] {
    let dx = this.length * (this.negX ? -1 : 1);
    let dy = this.length * (this.negY ? -1 : 1);
    const points = [
      { ...this.point },
      { x: this.point.x + dx, y: this.point.y },
      { x: this.point.x + dx, y: this.point.y + dy },
      { x: this.point.x, y: this.point.y + dy },
    ];

    this.rotatePoints(points, this.localRotatedDegree);
    return points;
  }

  getPoints(): Point[] {
    if (this.tempSquare) {
      return this.tempSquare.getPoints();
    }
    const points = super.getPoints();
    return [points[0]];
  }

  isSelected(mousePosition: Point): boolean {
    return isPointInsideVertexes(mousePosition, super.getPoints());
  }

  getRotationPoint(): Point {
    return {
      x: this.point.x + this.length / 2,
      y: this.point.y + this.length / 2,
    };
  }

  translate(translation: Point): void {
    translatePoint(this.point, translation);
    this.resetPointsCache();
  }

  draw(): void {
    if (this.tempSquare) {
      this.tempSquare.draw();
      return;
    }
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(this.calculateSquare()),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.TRIANGLES, 0, 6);
  }

  calculateSquare() {
    const points = super.getPoints();
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

  translateVertex(translation: Point): void {
    let point: Point = { x: 0, y: 0 };
    let length = this.length;

    point.x = this.point.x + translation.x;
    point.y = this.point.y + translation.y;
    length = this.length - translation.x;

    this.tempSquare = new Square(point, length, this.color, this.program);
    this.tempSquare.localRotatedDegree = this.localRotatedDegree;
  }

  doneTranslateVertex(): void {
    if (!this.tempSquare) {
      return;
    }

    this.point = this.tempSquare.point;
    this.length = this.tempSquare.length;
    this.tempSquare = undefined;
    this.resetPointsCache();
  }

  moveDrawing(point: Point): void {
    let dx = this.point.x;
    let dy = this.point.y;

    let lengthY = point.y - dy;
    let lengthX = point.x - dx;
    let resultingLength =
      Math.max(Math.abs(lengthY), Math.abs(lengthX)) === Math.abs(lengthY)
        ? lengthY
        : lengthX;

    // If lengthX < 0, then in Quadran 2 and 3
    // If lengthY < 0, then in Quadran 3 and 4
    if (lengthX < 0) {
      this.negX = true;
      lengthX = Math.abs(lengthX);
    } else {
      this.negX = false;
    }
    if (lengthY < 0) {
      this.negY = true;
      lengthY = Math.abs(lengthY);
    } else {
      this.negY = false;
    }
    this.length = resultingLength;
    // this.height = resultingLength * (lengthY > 0 ? 1 : -1);
    this.resetPointsCache();
  }

  finishDrawingMove(point: Point): boolean {
    this.moveDrawing(point);
    return true;
  }

  runLocalRotation(): void {}
}
