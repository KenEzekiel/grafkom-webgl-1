import { saveAs } from "file-saver";
import { BaseAppState } from "./app-states/base";
import { IdleState } from "./app-states/idle";
import { SelectShapeState } from "./app-states/select-shape";
import { ColorPicker } from "./lib/colorpicker";
import { Drawable } from "./lib/drawable/base";
import { FileInput } from "./lib/fileinput";
import { Loader } from "./lib/loader";
import { Point } from "./lib/primitives";
import { Program } from "./lib/program";
import { Toolbars } from "./lib/toolbar";
import fragmentShaderSource from "./shaders/fragment-shader-2d.glsl";
import vertexShaderSource from "./shaders/vector-shader-2d.glsl";

export type ApplicationProgram = Application["program"];

export class Application {
  public gl;
  public program;
  public objects: Array<Drawable> = [];
  public toolbars = new Toolbars(
    [
      "line",
      "square",
      "rectangle",
      "polygon",
      "select-shape",
      "erase",
      "fill",
      "color-picker",
    ],
    ["l", "s", "r", "p", "v", "d", "f", "c"]
  );
  public colorPicker = new ColorPicker("color-picker");
  private fileInput = new FileInput("model-input");

  private state: BaseAppState;
  private loader: Loader = new Loader();

  constructor(public canvas: HTMLCanvasElement) {
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
        pointSize: {
          type: "uniform1f",
          args: [10.0],
        },
      },
    });
    this.program.setUniforms({ resolution: [canvas.width, canvas.height] });

    this.state = new IdleState(this);

    // Implement clear button
    document.querySelector("#clear-button")!.addEventListener("click", () => {
      this.objects = [];
      this.changeState(new IdleState(this));
    });

    // Implement export button
    document
      .querySelector("#export-button")!
      .addEventListener("click", () => this.downloadImage(this.canvas));

    // Accepting model files
    this.fileInput.onFileInput(async (files) => {
      const modelFile = files.item(0);
      if (!modelFile) {
        return;
      }
      const result = await this.loader.readJSON(modelFile, this.program);
      this.objects = result;
      this.draw();
    });

    // Downloading model files
    document
      .querySelector("#download-button")!
      .addEventListener("click", (e) => {
        this.loader.saveJSON(this.objects, "model");
      });

    document.querySelector("#animate-button")!.addEventListener("click", () => {
      this.animate(100);
    });

    document.addEventListener("keydown", (e) => {
      this.state.onKeyDown(e);
    });

    this.colorPicker.onValueChange(() => {
      if (!(this.state instanceof SelectShapeState)) {
        return;
      }
      this.state.onColorPickerChange(this.colorPicker.getColor());
    });

    canvas.addEventListener("click", (e) => {
      this.state.onClick(this.getMousePosition(e));
    });

    canvas.addEventListener("mousemove", (e) => {
      this.state.onMouseMove(this.getMousePosition(e));
    });

    canvas.addEventListener("mousedown", (e) => {
      this.state.onMouseDown(this.getMousePosition(e));
    });

    canvas.addEventListener("mouseup", (e) => {
      this.state.onMouseUp(this.getMousePosition(e));
    });

    canvas.addEventListener("dblclick", (e) => {
      this.state.onDoubleClick(this.getMousePosition(e));
    });

    this.toolbars.setOnActive((tool) => {
      if (this.state instanceof SelectShapeState && tool !== "select-shape") {
        this.changeState(new IdleState(this));
      }
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

    if (this.state instanceof SelectShapeState) {
      this.state.selectObj.drawPoints();
    }
  }

  public getLastObject() {
    if (this.objects.length === 0) {
      return undefined;
    }
    return this.objects[this.objects.length - 1];
  }

  public getFirstSelected(mousePosition: Point) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const position = { ...mousePosition };
      this.objects[i].rotatePoint(position);
      if (this.objects[i].isSelected(mousePosition)) {
        return { selected: this.objects[i], index: i };
      }
    }
    return { selected: undefined, index: -1 };
  }

  public addObject(obj: Drawable) {
    this.objects.push(obj);
  }

  public changeState(newState: BaseAppState) {
    this.state.onBeforeChange();
    this.state = newState;
    this.state.onAfterChange();
    this.draw();
  }

  public manageSliderVisibility(visible: boolean) {
    document
      .querySelector("#slider-container")!
      .classList.toggle("hidden", !visible);
    document
      .querySelector("#slider-container")!
      .classList.toggle("flex", visible);
  }

  public getCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  public removeObjectAt(index: number) {
    if (index !== -1) {
      this.objects.splice(index, 1);
      this.draw();
    }
  }

  private downloadImage(canvas: HTMLCanvasElement) {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      let file = new File([blob], "exportedImage.jpg", { type: "image/jpeg" });
      saveAs(file);
    }, "image/jpeg");
  }

  private animate(n: number) {
    let i = 0;
    let intervalID = setInterval(() => {
      console.log("Animation");
      let rand = Math.random();
      let neg = i % 2 == 0 ? -1 : 1;
      this.objects.forEach((object) => {
        object.translate({ x: 10 * rand * neg, y: 10 * neg });
        this.draw();
      });
      if (++i === n) {
        window.clearInterval(intervalID);
      }
    }, 10);
  }
}
