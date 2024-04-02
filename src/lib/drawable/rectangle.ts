import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Rectangle extends Drawable {
  public type = "rectangle";
  constructor(
    public point: Point,
    public width: number,
    public height: number,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }

  _getPoints(): Point[] {
    return [
      this.point,
      { x: this.point.x + this.width, y: this.point.y },
      { x: this.point.x, y: this.point.y + this.height },
      { x: this.point.x + this.width, y: this.point.y + this.height },
    ];
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

  translate({ x, y }: Point): void {
    this.point.x += x;
    this.point.y += y;
    if (this.pointsCache) {
      this.pointsCache = this._getPoints();
    }
  }

  draw(): void {
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(
        this.calculateRectangle(
          this.point.x,
          this.point.y,
          this.width,
          this.height
        )
      ),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.TRIANGLES, 0, 6);
  }

  isSelected(mousePosition: Point): boolean {
    const { x: mouseX, y: mouseY } = mousePosition;
    const withinX =
      mouseX >= this.point.x && mouseX <= this.point.x + this.width;
    const withinY =
      mouseY >= this.point.y && mouseY <= this.point.y + this.height;

    return withinX && withinY;
  }

  calculateRectangle(x: number, y: number, width: number, height: number) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    return [x1, y1, x1, y2, x2, y1, x1, y2, x2, y2, x2, y1];
  }
}
