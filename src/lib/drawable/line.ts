import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Line extends Drawable {
  constructor(
    public points: [Point, Point],
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }

  getRotationPoint(): Point {
    return {
      x: this.points[0].x + (this.points[1].x - this.points[0].x) / 2,
      y: this.points[0].y + (this.points[0].y - this.points[0].y) / 2,
    };
  }

  draw(): void {
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array([
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y,
      ]),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.LINES, 0, 2);
  }
}
