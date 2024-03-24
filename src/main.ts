import { Application } from "./application";
import "./style.css";

const canvasContainer =
  document.querySelector<HTMLDivElement>(".canvas-container")!;
const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas")!;
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;

const app = new Application(canvas);
app.draw();
