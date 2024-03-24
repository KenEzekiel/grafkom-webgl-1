import { Drawable } from "./lib/drawable/base";
import { Program } from "./lib/program";
import fragmentShaderSource from "./shaders/fragment-shader-2d.glsl";
import vertexShaderSource from "./shaders/vector-shader-2d.glsl";

export class Application {
  private gl;
  private program;
  private objects: Array<Drawable> = [];

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
      throw new Error("WebGL not supported");
    }
    this.gl = gl;
    this.program = new Program({
      gl,
      fragmentShaderSource,
      vertexShaderSource,
      attributes: {
        position: {
          size: 2,
        },
      },
      uniforms: {
        resolution: {
          type: "uniform2f",
          args: [gl.canvas.width, gl.canvas.height],
        },
        color: {
          type: "uniform4f",
        },
      },
    });
  }

  public draw() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.objects.forEach((obj) => {
      obj.draw(this.gl, this.program.u.color.location);
    });
  }
}
