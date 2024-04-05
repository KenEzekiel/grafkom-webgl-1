import { Application } from "../application";
import { Line } from "../lib/drawable/line";
import { Polygon } from "../lib/drawable/polygon";
import { Rectangle } from "../lib/drawable/rectangle";
import { Square } from "../lib/drawable/square";
import { Color, Point } from "../lib/primitives";
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
    } else if (this.app.toolbars.activeToolbar === "fill") {
      const { selected } = this.app.getFirstSelected(point);
      if (!selected) {
        return;
      }
      const color = this.app.colorPicker.getColor();
      // selected.color = color;
      this.app.draw();
      return;
    } else if (this.app.toolbars.activeToolbar === "color-picker") {
      const { selected } = this.app.getFirstSelected(point);
      if (!selected) {
        return;
      }
      // this.app.colorPicker.setColor(selected.color);
      return;
    }

    switch (this.app.toolbars.activeToolbar) {
      case "line":
        const color = this.app.colorPicker.getColor();
        const { x, y } = point;
        this.app.changeState(
          new DrawingState(
            this.app,
            new Line(
              [
                { x, y },
                { x, y },
              ],
              [
                this.app.colorPicker.getColor(),
                this.app.colorPicker.getColor(),
              ],
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
              [1, 2, 3, 4].map(() => this.app.colorPicker.getColor()),
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
              Array.from([1, 2, 3, 4], () => this.app.colorPicker.getColor()),
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
              [
                this.app.colorPicker.getColor(),
                this.app.colorPicker.getColor(),
              ],
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
