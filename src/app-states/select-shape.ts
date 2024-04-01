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
    this.updateSlider();

    this.rotationSlider.onValueChange((value) => {
      this.selectObj.setRotation(value);
      this.app.draw();
    });

    this.horizontalSlider.onValueChange(() => {
      const canvasSize = this.app.getCanvasSize();
      const relativePosition = this.selectObj.getRelativePosition(canvasSize);
      const newX =
        (this.horizontalSlider.getRelativeValue() - relativePosition.x) *
        canvasSize.width;
      this.selectObj.translate({ x: newX, y: 0 });
      this.app.draw();
    });

    this.verticalSlider.onValueChange(() => {
      const canvasSize = this.app.getCanvasSize();
      const relativePosition = this.selectObj.getRelativePosition(canvasSize);
      const newY =
        (this.verticalSlider.getRelativeValue() - relativePosition.y) *
        canvasSize.height;
      this.selectObj.translate({ x: 0, y: newY });
      this.app.draw();
    });
  }

  onBeforeChange(): void {
    this.app.manageSliderVisibility(false);
    this.rotationSlider.cleanup();
    this.horizontalSlider.cleanup();
    this.verticalSlider.cleanup();
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
          this.updateSlider();
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

  updateSlider() {
    const relativePosition = this.selectObj.getRelativePosition(
      this.app.getCanvasSize()
    );

    this.rotationSlider.setValue(this.selectObj.getRotationDegree());
    this.horizontalSlider.setValue(
      relativePosition.x * this.horizontalSlider.getRange()
    );
    this.verticalSlider.setValue(
      relativePosition.y * this.verticalSlider.getRange()
    );
  }
}