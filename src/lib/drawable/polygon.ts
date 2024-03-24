import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Polygon extends Drawable {
  constructor(
    public points: Array<Point>,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }
  getRotationPoint(): Point {
    throw new Error("Method not implemented.");
  }

  draw(): void {
    const localPoint: Array<number> = [];
    this.points.forEach((point) => {
      localPoint.push(point.x, point.y);
    });
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(localPoint),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(
      this.program.gl.TRIANGLES,
      0,
      3 * (this.points.length - 2)
    );
  }
}
