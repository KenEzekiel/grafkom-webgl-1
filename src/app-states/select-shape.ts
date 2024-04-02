import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Color, Point } from "../lib/primitives";
import { Slider } from "../lib/slider";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class SelectShapeState extends BaseAppState {
  public selectObj: Drawable;
  public beforeSelectedLoc = { x: 0, y: 0 };
  public selectedMouseLoc = { x: 0, y: 0 };
  private rotationSlider = new Slider("rotation-slider");
  private isMouseDown = false;

  constructor(app: Application, private selectIdx: number) {
    super(app);
    app.manageSliderVisibility(true);
    this.selectObj = this.app.objects[this.selectIdx];
    this.app.colorPicker.setColor(this.selectObj.color);
    this.updateSlider();

    this.rotationSlider.onValueChange((value) => {
      this.selectObj.setRotation(value);
      this.app.draw();
    });
  }

  onBeforeChange(): void {
    this.app.manageSliderVisibility(false);
    this.rotationSlider.cleanup();
  }

  onColorPickerChange(color: Color) {
    this.selectObj.color = color;
    this.app.draw();
  }

  onMouseMove(point: Point): void {
    if (this.selectObj.selectedVertex) {
      const translation = {
        x: point.x - this.selectedMouseLoc.x,
        y: point.y - this.selectedMouseLoc.y,
      };
      this.selectObj.translateVertex(translation, this.beforeSelectedLoc);
      this.app.draw();
    } else if (this.isMouseDown) {
      const translation = {
        x: point.x - this.beforeSelectedLoc.x,
        y: point.y - this.beforeSelectedLoc.y,
      };
      this.beforeSelectedLoc = { ...point };
      this.selectObj.translate(translation);
      this.app.draw();
    }
  }

  onMouseUp(point: Point) {
    if (!this.selectObj.selectedVertex) {
      const { selected, index } = this.app.getFirstSelected(point);
      if (!selected) {
        this.app.changeState(new IdleState(this.app));
        return;
      }
      if (selected && this.selectObj !== selected) {
        this.app.changeState(new SelectShapeState(this.app, index));
      }
    } else {
      this.selectObj.deselectVertex();
    }
    this.isMouseDown = false;
  }

  onMouseDown(point: Point) {
    const { selected, index } = this.selectObj.getSelectedPoint(point);
    this.beforeSelectedLoc = { ...point };
    this.selectedMouseLoc = { ...point };
    this.isMouseDown = true;
    if (selected) {
      this.selectObj.selectVertex(selected, index);
      this.selectObj.selectedVertex = selected;
    }
  }

  updateSlider() {
    this.rotationSlider.setValue(this.selectObj.getRotationDegree());
  }
}
