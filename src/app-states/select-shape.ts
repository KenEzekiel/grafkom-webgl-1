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

    this.selectObj = this.app.objects[this.selectIdx];
    this.updateSlider();

    this.rotationSlider.onValueChange((value) => {
      this.selectObj.setRotation(value);
      this.app.draw();
    });
  }

  onBeforeChange(): void {
    this.app.manageSliderVisibility(false);
    this.rotationSlider.cleanup();
    this.selectObj.releaseDraggedVertex();
    this.selectObj.deselectVertex();
  }

  onAfterChange(): void {
    this.app.manageSliderVisibility(true);
  }

  onColorPickerChange(color: Color) {
    console.table({
      selectObj: this.selectObj,
      selectedVertex: this.selectObj?.selectedVertexIdx,
    });
    if (!this.selectObj) {
      return;
    }

    if (this.selectObj && !this.selectObj.selectedVertex) {
      this.selectObj.colorPoint(color);
    } else if (this.selectObj && this.selectObj.selectedVertex) {
      this.selectObj.colorPoint(color, this.selectObj.selectedVertexIdx);
    }
    this.app.draw();
  }

  onMouseMove(point: Point): void {
    if (this.selectObj.draggedVertex) {
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
    if (!this.selectObj.draggedVertex) {
      const { index: indexVertex, selected: selectedVertex } =
        this.selectObj.getSelectedPoint(point);
      if (indexVertex !== -1 && selectedVertex) {
        this.selectObj.selectVertex(selectedVertex, indexVertex);
      } else {
        const { selected: selectedObject, index: indexObject } =
          this.app.getFirstSelected(point);
        if (!selectedObject) {
          this.app.changeState(new IdleState(this.app));
          return;
        }
        if (
          !this.isMoved &&
          selectedObject &&
          this.selectObj !== selectedObject
        ) {
          this.app.changeState(new SelectShapeState(this.app, indexObject));
        }
      }
    } else {
      this.selectObj.doneTranslateVertex();
      this.selectObj.releaseDraggedVertex();
      this.app.toolbars.setEnableChange(true);
      this.app.draw();
    }
    this.isMoved = false;
    this.isMouseDown = false;
  }

  onMouseDown(point: Point) {
    const { selected, index } = this.selectObj.getSelectedPoint(point);
    const reclickedOnSelectedVertex =
      this.selectObj.selectedVertexIdx !== -1 &&
      this.selectObj.selectedVertexIdx === index;
    if (reclickedOnSelectedVertex || index === -1) {
      this.selectObj.deselectVertex();
    }
    this.beforeSelectedLoc = { ...point };
    this.selectedMouseLoc = { ...point };
    this.isMouseDown = true;
    this.isMoved = false;
    if (!reclickedOnSelectedVertex && selected) {
      this.selectObj.dragVertex(selected, index);
      this.app.colorPicker.setColor(this.selectObj.color[index]);
      this.app.toolbars.setEnableChange(false);
    }
    console.table({
      index,
      reclickedOnSelectedVertex,
    });
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
