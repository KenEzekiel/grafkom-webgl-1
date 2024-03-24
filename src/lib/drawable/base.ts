import type { ApplicationProgram } from "../../application";
import { Color, Point, Vec2 } from "../primitives";
export abstract class Drawable {
  protected rotation: Vec2 = [0, 1];
  public scale: number = 1;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  setRotation(degree: number) {
    this.rotation = [
      Math.sin((degree * 2 * Math.PI) / 360),
      Math.cos((degree * 2 * Math.PI) / 360),
    ];
  }

  getRotation() {
    return this.rotation;
  }

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
