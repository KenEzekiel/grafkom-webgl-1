import { Color } from "../primitives";

export abstract class Drawable {
  constructor(public color: Color) {}
  abstract draw(
    gl: WebGLRenderingContext,
    colorUniformLocation: WebGLUniformLocation | null
  ): void;

  prepareColor(
    gl: WebGLRenderingContext,
    colorUniformLocation: WebGLUniformLocation | null
  ) {
    gl.uniform4f(colorUniformLocation, ...this.color, 1);
  }
}
