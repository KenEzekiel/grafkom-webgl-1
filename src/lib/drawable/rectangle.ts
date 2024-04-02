import { ApplicationProgram } from "../../application";
import { Color, Point, translatePoint } from "../primitives";
import { Drawable } from "./base";

export class Rectangle extends Drawable {
  public type = "rectangle";
  constructor(
    public point: Point,
    public width: number,
    public height: number,
    color: Color,
    application: ApplicationProgram
  ) {
    super(color, application);
  }
  public tempRect: Rectangle | undefined = undefined;

  // 0 for left top, 1 for right top, 2 for left bottom, 3 for right bottom
  // public selectedVertexIdx = -1;

  _getPoints(): Point[] {
    return [
      this.point,
      { x: this.point.x + this.width, y: this.point.y },
      { x: this.point.x, y: this.point.y + this.height },
      { x: this.point.x + this.width, y: this.point.y + this.height },
    ];
  }

  public getPoints(): Point[] {
    if (this.tempRect) {
      return this.tempRect.getPoints();
    }
    return super.getPoints();
  }

  getRotationPoint(): Point {
    return {
      x: this.point.x + this.width / 2,
      y: this.point.y + this.height / 2,
    };
  }

  setWidth(newWidth: number) {
    this.width = newWidth;
  }

  setHeight(newHeight: number) {
    this.width = newHeight;
  }

  translate(translation: Point): void {
    translatePoint(this.point, translation);
    this.resetPointsCache();
  }

  draw(): void {
    if (this.tempRect) {
      return this.tempRect.draw();
    }
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(
        this.calculateRectangle(
          this.point.x,
          this.point.y,
          this.width,
          this.height
        )
      ),
      this.program.gl.STATIC_DRAW
    );
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.TRIANGLES, 0, 6);
  }

  isSelected(mousePosition: Point): boolean {
    const { x: mouseX, y: mouseY } = mousePosition;
    const withinX =
      mouseX >= this.point.x && mouseX <= this.point.x + this.width;
    const withinY =
      mouseY >= this.point.y && mouseY <= this.point.y + this.height;

    return withinX && withinY;
  }

  calculateRectangle(x: number, y: number, width: number, height: number) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    return [x1, y1, x1, y2, x2, y1, x1, y2, x2, y2, x2, y1];
  }

  translateVertex(translation: Point) {
    if (this.selectedVertexIdx === -1) {
      return;
    }

    let point: Point = { x: 0, y: 0 };
    let width = this.width;
    let height = this.height;

    switch (this.selectedVertexIdx) {
      case 0:
        point.x = this.point.x + translation.x;
        point.y = this.point.y + translation.y;
        width = this.width - translation.x;
        height = this.height - translation.y;
        break;
      case 1:
        point.x = this.point.x;
        point.y = this.point.y + translation.y;
        width = this.width + translation.x;
        height = this.height - translation.y;
        break;
      case 2:
        point.x = this.point.x + translation.x;
        point.y = this.point.y;
        width = this.width - translation.x;
        height = this.height + translation.y;
        break;
      case 3:
        point.x = this.point.x;
        point.y = this.point.y;
        width = this.width + translation.x;
        height = this.height + translation.y;
        break;
      default:
        return null;
    }

    this.tempRect = new Rectangle(
      point,
      width,
      height,
      this.color,
      this.program
    );
  }

  adjustNegativeDimension() {
    if (this.width < 0) {
      this.point.x += this.width;
      this.width *= -1;
    }
    if (this.height < 0) {
      this.point.y += this.height;
      this.height *= -1;
    }
    this.resetPointsCache();
  }

  deselectVertex() {
    if (!this.tempRect) {
      super.deselectVertex();
      return;
    }
    this.point = this.tempRect.point;
    this.width = this.tempRect.width;
    this.height = this.tempRect.height;
    this.tempRect = undefined;
    this.adjustNegativeDimension();
    super.deselectVertex();
  }
}
