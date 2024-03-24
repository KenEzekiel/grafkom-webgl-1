import { Toolbars } from "./lib/toolbar";
import fragmentShaderSource from "./shaders/fragment-shader-2d.glsl";
import vectorShaderSource from "./shaders/vector-shader-2d.glsl";

import "./style.css";

function main() {
  // Setup toolbar
  const toolbars = new Toolbars(["line", "square", "rectangle", "polygon"]);
  // Setup canvas on html
  const canvasContainer =
    document.querySelector<HTMLDivElement>(".canvas-container")!;
  const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas")!;
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;

  // Get WebGL
  const gl = canvas.getContext("webgl");
  if (!gl) {
    throw new Error("WebGL not supported");
  }

  // Create shader function (abstraction)
  function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    // If compile success, then return the shader
    if (success) {
      return shader;
    }
    // If not, delete the shader
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  // Create the vertex and fragment shader
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vectorShaderSource)!;
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )!;

  // Create program function (abstraction)
  function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    // If success, return the GL Program
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    // If not, delete the GL program
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  // Create the program, and set the locations of attributes
  const program = createProgram(gl, vertexShader, fragmentShader)!;
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // Create and bind buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Create viewport
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Use the program with the attribute array and uniform 
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // Setup the rectangles
  const rectangles: Array<
    [number, number, number, number, number, number, number]
  > = [];

  const points: Array<[number, number, number, number]> = [];

  // Generate random rectangles
  // setInterval(() => {
  //   rectangles.push([
  //     randomRange(0, gl.canvas.width),
  //     randomRange(0, gl.canvas.height),
  //     randomRange(10, 100),
  //     randomRange(10, 100),
  //     Math.random(),
  //     Math.random(),
  //     Math.random(),
  //   ]);
  //   draw(gl, rectangles, colorUniformLocation);
  //   if (rectangles.length > 100) {
  //     rectangles.shift();
  //   }
  // }, 200);
  let pos: { x: any; y: any; }, clicked = false;
  canvas.addEventListener("click", (e) => {
    let {x, y} = getMousePosition(canvas, e);
    
    pos = getMousePosition(canvas, e);
    clicked = true;
    rectangles.push([
          x,
          canvas.height - y,
          randomRange(10, 100),
          randomRange(10, 100),
          Math.random(),
          Math.random(),
          Math.random(),
        ]);
    drawLines(gl, points);
    draw(gl, rectangles, colorUniformLocation);
    
    if (rectangles.length > 100) {
      rectangles.shift();
    }
    
    
  })

  

  canvas.addEventListener("mousemove", (e) => {
    let {x, y} = getMousePosition(canvas, e);

    drawLines(gl, points);
    draw(gl, rectangles, colorUniformLocation)
    drawLine(gl, [pos.x,canvas.height - pos.y, x, canvas.height - y])
    
  })
}

function getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  return { x, y };
}



function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Function to set buffer to a rectangle
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
      Math.random()
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
}

function drawLine(
  gl: WebGLRenderingContext,
  points: [number, number, number, number]
) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([points[0], points[1], points[2], points[3]]),
    gl.STATIC_DRAW
  );
  gl.drawArrays(gl.LINES, 0, 2);
}

function drawLines(
  gl: WebGLRenderingContext,
  lines: Array<[number, number, number, number]>,
) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  lines.forEach((line) => {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([line[0], line[1], line[2], line[3]]),
      gl.STATIC_DRAW
    );
    gl.drawArrays(gl.LINES, 0, 2);
  });
}

main();
