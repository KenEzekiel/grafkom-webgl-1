import { Drawable } from "./lib/drawable/base";
import { Line } from "./lib/drawable/line";
import { Program } from "./lib/program";
import { Toolbars } from "./lib/toolbar";
import fragmentShaderSource from "./shaders/fragment-shader-2d.glsl";
import vertexShaderSource from "./shaders/vector-shader-2d.glsl";

export type ApplicationProgram = Application["program"];

const drawableShapes = ["line", "square", "rectangle", "polygon"];
type DrawableShape = (typeof drawableShapes)[number];

export class Application {
  private gl;
  private program;
  private objects: Array<Drawable> = [];
  private toolbars = new Toolbars(drawableShapes);
  private selectedShape: undefined | DrawableShape = undefined;

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
        rotationPoint: {
          type: "uniform2f",
        },
        rotation: {
          type: "uniform2f",
        },
        scale: {
          type: "uniform1f",
        },
      },
    });
    this.program.setUniforms({ resolution: [canvas.width, canvas.height] });

    this.toolbars.setOnActive((name: string) => {
      // If the toolbar is changed in the middle of drawing a shape, remove the unfinished shape
      if (this.getLastObject() && this.getLastObject()?.finishDrawn) {
        this.objects.pop();
        this.draw();
      }

      this.selectedShape = name;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!this.selectedShape) {
        return;
      }

      const boundingRect = (e.currentTarget as any).getBoundingClientRect();
      const x = e.clientX - boundingRect.x;
      const y = e.clientY - boundingRect.y;
      console.log(x, y);
      // Modify last object (the one that isn't yet final) in accordance to mouse movement and the selected object

      // Redraw canvas
      this.draw();
    });
  }

  public draw() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.program.a.position.buffer);
    this.objects.forEach((obj) => {
      obj.draw();
    });
  }

  public getLastObject() {
    if (this.objects.length === 0) {
      return undefined;
    }
    return this.objects[this.objects.length - 1];
  }
}
