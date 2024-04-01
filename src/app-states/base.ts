import { Application } from "../application";
import { Point } from "../lib/primitives";

export abstract class BaseAppState {
  constructor(protected app: Application) {
    this.app.draw();
  }

  abstract onClick(point: Point): void;

  abstract onMouseMove(point: Point): void;
}
