import { Slider } from "./lib/slider";
import { Toolbars } from "./lib/toolbar";
import fragmentShaderSource from "./shaders/fragment-shader-2d.glsl";
import vectorShaderSource from "./shaders/vector-shader-2d.glsl";

import "./style.css";

function main() {
  new Slider("myRange", (number) => console.log(number));
  const toolbars = new Toolbars(["line", "square", "rectangle", "polygon"]);
  const canvasContainer =
    document.querySelector<HTMLDivElement>(".canvas-container")!;
  const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas")!;
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;

  const gl = canvas.getContext("webgl");
  if (!gl) {
    throw new Error("WebGL not supported");
  }

  function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vectorShaderSource)!;
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )!;

  function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  const program = createProgram(gl, vertexShader, fragmentShader)!;
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const rectangles: Array<
    [number, number, number, number, number, number, number]
  > = [];

  setInterval(() => {
    rectangles.push([
      randomRange(0, gl.canvas.width),
      randomRange(0, gl.canvas.height),
      randomRange(10, 100),
      randomRange(10, 100),
      Math.random(),
      Math.random(),
      Math.random(),
    ]);
    draw(gl, rectangles, colorUniformLocation);
    if (rectangles.length > 100) {
      rectangles.shift();
    }
  }, 200);
}
function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

function draw(
  gl: WebGLRenderingContext,
  rectangles: Array<[number, number, number, number, number, number, number]>,
  colorUniformLocation: WebGLUniformLocation | null
) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  rectangles.forEach((rectangle) => {
    setRectangle(gl, rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
    gl.uniform4f(
      colorUniformLocation,
      rectangle[4],
      rectangle[5],
      rectangle[6],
      1
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
}

main();
