import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Line extends Drawable {
  constructor(public points: [Point, Point], color: Color) {
    super(color);
  }

  draw(
    gl: WebGLRenderingContext,
    colorUniformLocation: WebGLUniformLocation | null
  ): void {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y,
      ]),
      gl.STATIC_DRAW
    );
    this.prepareColor(gl, colorUniformLocation);
    gl.drawArrays(gl.LINES, 0, 2);
  }
}
