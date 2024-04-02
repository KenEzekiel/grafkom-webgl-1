import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Line extends Drawable {
  public type = "line";
  constructor(
    public points: [Point, Point],
    color: Color,
    program: ApplicationProgram
  ) {
    super(color, program);
  }

  public proximityThickness = 5;

  _getPoints(): Point[] {
    return this.points;
  }

  getRotationPoint(): Point {
    return {
      x: (this.points[0].x + this.points[1].x) / 2,
      y: (this.points[0].y + this.points[1].y) / 2,
    };
  }

  translate({ x, y }: Point): void {
    this.points[0].x += x;
    this.points[0].y += y;
    this.points[1].x += x;
    this.points[1].y += y;
    this.resetPointsCache();
  }

  isSelected(mousePosition: Point): boolean {
    const dx = this.points[0].x - this.points[1].x;
    const dy = this.points[0].y - this.points[1].y;

    const dxo = this.points[0].x - mousePosition.x;
    const dyo = this.points[0].y - mousePosition.y;

    const distance =
      Math.abs(dx * dyo - dy * dxo) / Math.sqrt(dx ** 2 + dy ** 2);

    return distance <= this.proximityThickness;
  }

  draw(): void {
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array([
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y,
      ]),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.LINES, 0, 2);
  }
}
