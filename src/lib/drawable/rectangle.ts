import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Rectangle extends Drawable {
  constructor(
    public point: Point,
    public width: number,
    public height: number,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }

  getRotationPoint(): Point {
    return {
      x: this.point.x + this.width / 2,
      y: this.point.y + this.height / 2,
    };
  }

  setWidth(newWidth: number) {
    if (newWidth <= 0) {
      throw new Error("Width must be positive");
    }
    this.width = newWidth;
  }

  setHeight(newHeight: number) {
    if (newHeight <= 0) {
      throw new Error("Height must be positive");
    }
    this.width = newHeight;
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

  calculateRectangle(x: number, y: number, width: number, height: number) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
  }
}
