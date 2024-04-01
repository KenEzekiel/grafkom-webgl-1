import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Square extends Drawable {
  public type = "square";
  constructor(
    public points: Point,
    public length: number,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }

  _getPoints(): Point[] {
    return [
      this.points,
      { x: this.points.x + this.length, y: this.points.y },
      { x: this.points.x, y: this.points.y + this.length },
      { x: this.points.x + this.length, y: this.points.y + this.length },
    ];
  }

  isSelected(mousePosition: Point): boolean {
    const { x: mouseX, y: mouseY } = mousePosition;
    const withinX =
      mouseX >= this.points.x && mouseX <= this.points.x + this.length;
    const withinY =
      mouseY >= this.points.y && mouseY <= this.points.y + this.length;

    return withinX && withinY;
  }

  getRotationPoint(): Point {
    return {
      x: this.points.x + this.length / 2,
      y: this.points.y + this.length / 2,
    };
  }

  translate({ x, y }: Point): void {
    this.points.x += x;
    this.points.y += y;
  }

  draw(): void {
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(
        this.calculateSquare(this.points.x, this.points.y, this.length)
      ),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
  }

  calculateSquare(x: number, y: number, length: number) {
    var x1 = x;
    var x2 = x + length;
    var y1 = y;
    var y2 = y + length;
    return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
  }
}
