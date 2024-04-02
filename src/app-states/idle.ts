import { Application } from "../application";
import { Line } from "../lib/drawable/line";
import { Polygon } from "../lib/drawable/polygon";
import { Rectangle } from "../lib/drawable/rectangle";
import { Square } from "../lib/drawable/square";
import { Point } from "../lib/primitives";
import { BaseAppState } from "./base";
import { DrawingState } from "./drawing";
import { SelectShapeState } from "./select-shape";

export class IdleState extends BaseAppState {
  constructor(app: Application) {
    super(app);
    this.app.toolbars.setEnableChange(true);
  }

  onClick(point: Point): void {
    if (this.app.toolbars.activeToolbar === "select-shape") {
      const { index } = this.app.getFirstSelected(point);
      if (index !== -1) {
        this.app.changeState(new SelectShapeState(this.app, index));
      }
      return;
    } else if (this.app.toolbars.activeToolbar === "erase") {
      const { index } = this.app.getFirstSelected(point);
      this.app.removeObjectAt(index);
      this.app.draw();
      return;
    }

    switch (this.app.toolbars.activeToolbar) {
      case "line":
        const { x, y } = point;
        this.app.changeState(
          new DrawingState(
            this.app,
            new Line(
              [
                { x, y },
                { x, y },
              ],
              this.app.colorPicker.getColor(),
              this.app.program
            )
          )
        );
        break;
      case "square":
        this.app.changeState(
          new DrawingState(
            this.app,
            new Square(
              point,
              0,
              this.app.colorPicker.getColor(),
              this.app.program
            )
          )
        );
        break;
      case "rectangle":
        this.app.changeState(
          new DrawingState(
            this.app,
            new Rectangle(
              point,
              0,
              0,
              this.app.colorPicker.getColor(),
              this.app.program
            )
          )
        );
        break;
      case "polygon":
        this.app.changeState(
          new DrawingState(
            this.app,
            new Polygon(
              [{ ...point }, { ...point }],
              this.app.colorPicker.getColor(),
              this.app.program
            )
          )
        );
        break;
    }
  }

  onMouseMove(): void {
    return;
  }
}
