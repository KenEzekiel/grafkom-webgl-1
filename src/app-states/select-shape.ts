import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Color, Point } from "../lib/primitives";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class SelectShapeState extends BaseAppState {
  public selectObj: Drawable;

  constructor(app: Application, private selectIdx: number) {
    super(app);
    this.selectObj = this.app.objects[this.selectIdx];
    this.app.colorPicker.setColor(this.selectObj.color);
    this.app.draw();
  }

  onClick(point: Point): void {
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

  onColorPickerChange(color: Color) {
    this.selectObj.color = color;
    this.app.draw();
  }

  onMouseMove(): void {}
}
