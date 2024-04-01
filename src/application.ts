import { Drawable } from "./lib/drawable/base";
import { Line } from "./lib/drawable/line";
import { Rectangle } from "./lib/drawable/rectangle";
import { Square } from "./lib/drawable/square";
import { Program } from "./lib/program";
import { Toolbars } from "./lib/toolbar";
import fragmentShaderSource from "./shaders/fragment-shader-2d.glsl";
import vertexShaderSource from "./shaders/vector-shader-2d.glsl";

export type ApplicationProgram = Application["program"];

export class Application {
  private gl;
  private program;
  private objects: Array<Drawable> = [];
  private toolbars = new Toolbars(["line", "square", "rectangle", "polygon"]);
  private selectedShape: undefined | string = undefined;

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
    this.draw();

    this.toolbars.setOnActive((name: string) => {
      // If the toolbar is changed in the middle of drawing a shape, remove the unfinished shape
      if (this.getLastObject() && !this.getLastObject()?.finishDrawn) {
        this.objects.pop();
        this.draw();
      }

      this.selectedShape = name;
    });

    canvas.addEventListener("click", (e) => {
      // Logic for selecting a shape
      if (this.selectedShape === "select") {
        const position = this.getMousePosition(e);
      }

      if (this.getLastObject() && !this.getLastObject()?.finishDrawn) {
        this.getLastObject()?.finalize();
        return;
      }
      if (this.selectedShape === "line") {
        const point = this.getMousePosition(e);
        // Put one point of the line the mouse position
        this.objects.push(
          new Line([point, point], [255, 255, 255], this.program)
        );
      }

      if (this.selectedShape === "square") {
        const point = this.getMousePosition(e);
        this.objects.push(
          new Rectangle(point, 0, 0, [255, 255, 255], this.program)
        );
        return;
      }

      if (this.selectedShape === "rectangle") {
        const point = this.getMousePosition(e);
        this.objects.push(
          new Rectangle(point, 0, 0, [255, 255, 255], this.program)
        );
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!this.selectedShape) {
        return;
      }

      if (this.getLastObject()?.finishDrawn) {
        return;
      }

      const { x, y } = this.getMousePosition(e);
      // console.log(x, y);

      // Modify last object (the one that isn't yet final) in accordance to mouse movement and the selected object
      const lastObject = this.getLastObject();

      if (!lastObject) {
        return;
      }

      this.objects.pop();

      if (lastObject instanceof Line) {
        lastObject.points[1].x = x;
        lastObject.points[1].y = y;
      }

      if (lastObject instanceof Rectangle && this.selectedShape === "square") {
        let dx = lastObject.point.x;
        let dy = lastObject.point.y;
        // console.log(cornerX, cornerY);
        const lengthY = y - dy;
        const lengthX = x - dx;
        const resultingLength =
          Math.min(Math.abs(lengthY), Math.abs(lengthX)) === Math.abs(lengthY)
            ? lengthY
            : lengthX;

        lastObject.width = resultingLength * (lengthX > 0 ? 1 : -1);
        lastObject.height = resultingLength * (lengthY > 0 ? 1 : -1);
      }

      if (
        lastObject instanceof Rectangle &&
        this.selectedShape === "rectangle"
      ) {
        let dx = lastObject.point.x;
        let dy = lastObject.point.y;

        let width = x - dx;
        let height = y - dy;

        lastObject.width = width;
        lastObject.height = height;
      }

      // Redraw canvas
      this.objects.push(lastObject);
      this.draw();
    });
  }

  public getMousePosition(e: MouseEvent) {
    const boundingRect = (e.currentTarget as any).getBoundingClientRect();
    const x = e.clientX - boundingRect.x;
    const y = e.clientY - boundingRect.y;
    return { x, y };
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
