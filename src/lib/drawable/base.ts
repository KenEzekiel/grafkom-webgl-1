import type { ApplicationProgram } from "../../application";
import { Color, Point, Vec2 } from "../primitives";
export abstract class Drawable {
  public rotation: Vec2 = [0, 1];
  public scale: number = 1;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  prepare() {
    const rotationPoint = this.getRotationPoint();
    this.program.setUniforms({
      color: [...this.color, 1],
      rotationPoint: [rotationPoint.x, rotationPoint.y],
      rotation: this.rotation,
      scale: [this.scale],
    });
  }
}
