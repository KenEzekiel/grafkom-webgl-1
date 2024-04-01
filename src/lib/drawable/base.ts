import type { ApplicationProgram } from "../../application";
import { Color, Point, Vec2 } from "../primitives";
export abstract class Drawable {
  protected rotation: Vec2 = [0, 1];
  public scale: number = 1;

  constructor(public color: Color, protected program: ApplicationProgram) {}
  abstract draw(): void;

  abstract getRotationPoint(): Point;

  abstract isSelected(mousePosition: Point): boolean;

  abstract getPoints(): Point[];

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

  drawPoints() {
    const points: Array<number> = [];

    for (const point of this.getPoints()) {
      points.push(point.x, point.y);
    }

    this.program.setUniforms({
      color: [1, 1, 0.5, 1],
      rotation: [0, 1],
      scale: [1],
    });

    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(points),
      this.program.gl.STATIC_DRAW
    );

    this.program.gl.drawArrays(this.program.gl.POINTS, 0, points.length / 2);
  }
}
