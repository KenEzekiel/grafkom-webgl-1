import { Application } from "../application";
import { Point } from "../lib/primitives";

export abstract class BaseAppState {
  constructor(protected app: Application) {}

  onClick(_point: Point) {}

  onMouseMove(_point: Point) {}

  onMouseDown(_point: Point) {}

  onMouseUp(_point: Point) {}

  onBeforeChange() {}

  onAfterChange() {}

  onKeyDown(_e: KeyboardEvent) {}

  onDoubleClick(_point: Point) {}
}
