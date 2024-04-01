import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Polygon } from "../lib/drawable/polygon";
import { Color, Point } from "../lib/primitives";
import { Slider } from "../lib/slider";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class SelectShapeState extends BaseAppState {
  public selectObj: Drawable;
  public selectedPoint: Point | undefined;
  private rotationSlider = new Slider("rotation-slider");
  private horizontalSlider = new Slider("horizontal-slider");
  private verticalSlider = new Slider("vertical-slider");

  constructor(app: Application, private selectIdx: number) {
    super(app);
    app.manageSliderVisibility(true);
    this.selectObj = this.app.objects[this.selectIdx];
    this.app.colorPicker.setColor(this.selectObj.color);

    this.rotationSlider.setValue(this.selectObj.getRotationDegree());

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
        this.selectObj = selected;
        if (index !== this.selectIdx) {
          this.rotationSlider.setValue(this.selectObj.getRotationDegree());
        }

        this.selectIdx = index;
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
