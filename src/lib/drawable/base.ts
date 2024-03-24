import { Color, Point } from "../primitives";
import type { ApplicationProgram } from "../../application";
export abstract class Drawable {
  public rotationPoint: Point = { x: 0, y: 0 };
  public rotationFactor: Point = { x: 0, y: 0 };
  public scale: number = 1;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  prepare() {
    this.program.setUniforms({
      color: [...this.color, 1],
      rotationPoint: [this.rotationPoint.x, this.rotationPoint.y],
      rotationFactor: [this.rotationFactor.x, this.rotationFactor.y],
      scale: [this.scale],
    });
  }
}
