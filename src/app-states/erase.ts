import { Application } from "../application";
import { Point } from "../lib/primitives";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class EraseState extends BaseAppState {
  constructor(app: Application, index: number) {
    super(app);
    this.app.removeObjectAt(index);
  }

  onBeforeChange(): void {}

  onMouseMove(point: Point): void {
    return;
  }

  onClick(point: Point): void {
    const { index } = this.app.getFirstSelected(point);
    this.app.removeObjectAt(index);
  }

  onMouseUp(point: Point) {
    if (this.app.toolbars.activeToolbar !== "erase") {
      this.app.changeState(new IdleState(this.app));
      return;
    }
  }

  onMouseDown(point: Point) {
    return;
  }
}
