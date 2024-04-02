import { ApplicationProgram } from "../../application";
import { Color, Point, translatePoint } from "../primitives";
import { Drawable } from "./base";

export class Square extends Drawable {
  public type = "square";
  public negX = false;
  public negY = false;
  constructor(
    public point: Point,
    public length: number,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }

  _getPoints(): Point[] {
    let dx = this.length * (this.negX ? -1 : 1);
    let dy = this.length * (this.negY ? -1 : 1);
    return [
      this.point,
      { x: this.point.x + dx, y: this.point.y },
      { x: this.point.x, y: this.point.y + dy },
      { x: this.point.x + dx, y: this.point.y + dy },
    ];
  }

  isSelected(mousePosition: Point): boolean {
    const { x: mouseX, y: mouseY } = mousePosition;
    const withinX =
      mouseX >= this.point.x && mouseX <= this.point.x + this.length;
    const withinY =
      mouseY >= this.point.y && mouseY <= this.point.y + this.length;

    return withinX && withinY;
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
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(
        this.calculateSquare(this.point.x, this.point.y, this.length)
      ),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.TRIANGLES, 0, 6);
  }

  calculateSquare(x: number, y: number, length: number) {
    var x1 = x;
    var x2 = x + length * (this.negX ? -1 : 1);
    var y1 = y;
    var y2 = y + length * (this.negY ? -1 : 1);

    if (this.negX && !this.negY) {
      return [x2, y1, x2, y2, x1, y1, x1, y1, x2, y2, x1, y2];
    }
    if (this.negX && this.negY) {
      return [x2, y2, x2, y1, x1, y2, x1, y2, x2, y1, x1, y1];
    }
    if (!this.negX && this.negY) {
      return [x1, y2, x1, y1, x2, y2, x2, y2, x1, y1, x2, y1];
    }
    return [x1, y1, x1, y2, x2, y1, x1, y2, x2, y2, x2, y1];
  }

  translateVertex(translation: Point, beforeLoc: Point): void {
    switch (this.selectedVertexIdx) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      default:
        return;
    }
    this.resetPointsCache();
  }
}
