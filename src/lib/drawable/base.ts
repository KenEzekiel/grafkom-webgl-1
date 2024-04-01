import type { ApplicationProgram } from "../../application";
import { Color, Point, Vec2 } from "../primitives";
export abstract class Drawable {
  protected rotation: Vec2 = [0, 1];
  public scale: number = 1;
  public finishDrawn: boolean = false;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  abstract isSelected(mousePosition: Point): boolean;

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
      color: [...this.color.map((num) => num / 255), 1],
      rotationPoint: [rotationPoint.x, rotationPoint.y],
      rotation: this.rotation,
      scale: [this.scale],
    });
  }

  finalize() {
    this.finishDrawn = true;
  }
}
