import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Polygon } from "../lib/drawable/polygon";
import { Color, Point } from "../lib/primitives";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class SelectShapeState extends BaseAppState {
  public selectObj: Drawable;
  public selectedPoint: Point | undefined;

  constructor(app: Application, private selectIdx: number) {
    super(app);
    this.selectObj = this.app.objects[this.selectIdx];
    this.app.colorPicker.setColor(this.selectObj.color);
  }

  onColorPickerChange(color: Color) {
    this.selectObj.color = color;
    this.app.draw();
  }

  onMouseMove(point: Point): void {
    if (this.selectedPoint && this.selectObj instanceof Polygon) {
      this.selectObj.changePoint(this.selectedPoint, point);
      this.app.draw();
    }
  }

  onMouseUp(point: Point) {
    if (!this.selectedPoint) {
      const { selected, index } = this.app.getFirstSelected(point);
      if (!selected) {
        this.app.changeState(new IdleState(this.app));
        return;
      }
      if (selected) {
        this.selectIdx = index;
        this.selectObj = selected;
        this.app.draw();
      }
    }
    this.selectedPoint = undefined;
  }

  onMouseDown(point: Point) {
    const { selected } = this.selectObj.getSelectedPoint(point);
    if (selected) {
      this.selectedPoint = selected;
    }
  }
}
