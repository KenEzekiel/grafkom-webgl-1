import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Point } from "../lib/primitives";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class DrawingState extends BaseAppState {
  constructor(app: Application, private object: Drawable) {
    super(app);
    this.app.addObject(object);
    this.app.toolbars.setEnableChange(false);
  }

  onClick(point: Point): void {
    if (this.object.finishDrawingMove(point)) {
      this.object.finishDrawing();
      this.app.changeState(new IdleState(this.app));
      return;
    }
    this.app.draw();
  }
  onMouseMove(point: Point): void {
    this.object.moveDrawing(point);
    this.app.draw();
  }
}
