import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Polygon } from "../lib/drawable/polygon";
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
  private isMoved = false;

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
    this.isMoved = true;
  }

  onMouseUp(point: Point) {
    if (!this.selectObj.selectedVertex) {
      const { selected, index } = this.app.getFirstSelected(point);
      if (!selected) {
        this.app.changeState(new IdleState(this.app));
        return;
      }
      if (!this.isMoved && selected && this.selectObj !== selected) {
        this.app.changeState(new SelectShapeState(this.app, index));
      }
    } else {
      this.selectObj.doneTranslateVertex();
      this.selectObj.deselectVertex();
      this.app.toolbars.setEnableChange(true);
      this.app.draw();
    }
    this.isMoved = false;
    this.isMouseDown = false;
  }

  onMouseDown(point: Point) {
    const { selected, index } = this.selectObj.getSelectedPoint(point);
    this.beforeSelectedLoc = { ...point };
    this.selectedMouseLoc = { ...point };
    this.isMouseDown = true;
    this.isMoved = false;
    if (selected) {
      this.selectObj.selectVertex(selected, index);
      this.app.toolbars.setEnableChange(false);
    }
  }

  updateSlider() {
    this.rotationSlider.setValue(this.selectObj.localRotatedDegree);
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Delete" || e.key === "Backspace") {
      this.app.removeObjectAt(this.selectIdx);
      this.app.changeState(new IdleState(this.app));
    }
  }

  onDoubleClick(point: Point): void {
    const { selected, index } = this.selectObj.getSelectedPoint(point);
    if (this.selectObj instanceof Polygon) {
      if (selected) {
        this.selectObj.deletePoint(index);
      } else {
        if (this.selectObj.isSelected(point)) {
          this.selectObj.addPoint(point);
          this.onMouseDown({ ...point });
        }
      }
      this.app.draw();
    }
  }
}
