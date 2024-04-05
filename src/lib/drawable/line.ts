import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Line extends Drawable {
  public type = "line";
  public length: number;
  constructor(
    public points: [Point, Point],
    color: Color[],
    program: ApplicationProgram
  ) {
    super(color, program);
    this.length = Math.sqrt(
      (points[0].x - points[1].x) ** 2 + (points[0].y - points[1].y) ** 2
    );
    this.initializeVertexColor();
  }

  public proximityThickness = 5;

  _getPoints(): Point[] {
    return this.points;
  }

  getRotationPoint(): Point {
    return {
      x: (this.points[0].x + this.points[1].x) / 2,
      y: (this.points[0].y + this.points[1].y) / 2,
    };
  }

  public calculateLength() {
    this.length = Math.sqrt(
      (this.points[0].x - this.points[1].x) ** 2 +
        (this.points[0].y - this.points[1].y) ** 2
    );
  }

  initializeVertexColor(): void {
    this.vertexesColorOuter = this.points
      .map(() => this.vertexColorYellow)
      .flat()
      .map((color) => color / 255);

    this.vertexesColorInner = this.points
      .map(() => this.vertexColorBlack)
      .flat()
      .map((color) => color / 255);
  }

  translate({ x, y }: Point): void {
    this.points[0].x += x;
    this.points[0].y += y;
    this.points[1].x += x;
    this.points[1].y += y;
    this.resetPointsCache();
  }

  isSelected(mousePosition: Point): boolean {
    // This code block prevents line distance calculation being ftra as if the line extends infinitely long by calculating the angles of the triangle made by the line's point 0, the line's point 1, and the position of the mouse
    {
      const distanceToPoint0 = Math.sqrt(
        (mousePosition.x - this.points[0].x) ** 2 +
          (mousePosition.y - this.points[0].y) ** 2
      );

      const distanceToPoint1 = Math.sqrt(
        (mousePosition.x - this.points[1].x) ** 2 +
          (mousePosition.y - this.points[1].y) ** 2
      );

      const cosAtPoint0 =
        (this.length ** 2 + distanceToPoint0 ** 2 - distanceToPoint1 ** 2) /
        (2 * this.length * distanceToPoint0);

      const cosAtPoint1 =
        (distanceToPoint0 ** 2 + distanceToPoint1 ** 2 - this.length ** 2) /
        (2 * this.length * distanceToPoint1);

      // The mouse is located outside the infinitely long rectangular shape perpendicular to the line
      if (
        !(cosAtPoint0 < 0 || cosAtPoint1 < 0) ||
        cosAtPoint0 > 1 ||
        cosAtPoint1 > 1
      ) {
        return false;
      }
    }

    // Normal line-point distance calculation
    const dx = this.points[0].x - this.points[1].x;
    const dy = this.points[0].y - this.points[1].y;

    const dxo = this.points[1].x - mousePosition.x;
    const dyo = this.points[1].y - mousePosition.y;

    const distance =
      Math.abs(dx * dyo - dy * dxo) / Math.sqrt(dx ** 2 + dy ** 2);

    return distance <= this.proximityThickness;
  }

  draw(): void {
    this.program.gl.bindBuffer(
      this.program.gl.ARRAY_BUFFER,
      this.program.a.position.buffer
    );
    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array([
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y,
      ]),
      this.program.gl.STATIC_DRAW
    );

    this.program.gl.bindBuffer(
      this.program.gl.ARRAY_BUFFER,
      this.program.a.color.buffer
    );

    this.program.gl.bufferData(
      this.program.gl.ARRAY_BUFFER,
      new Float32Array(this.getColorProcessed()),
      this.program.gl.STATIC_DRAW
    );

    this.prepare();
    this.program.gl.drawArrays(this.program.gl.LINES, 0, 2);
  }

  getColorProcessed() {
    return this.getColorCache();
  }

  translateVertex(translation: Point, beforeLoc: Point): void {
    if (this.draggedVertexIdx === -1) {
      return;
    }
    this.points[this.draggedVertexIdx].x = beforeLoc.x + translation.x;
    this.points[this.draggedVertexIdx].y = beforeLoc.y + translation.y;
    this.resetPointsCache();
    this.calculateLength();
  }

  moveDrawing(point: Point): void {
    this.points[1] = point;
    this.calculateLength();
    this.resetPointsCache();
  }

  finishDrawingMove(point: Point): boolean {
    this.moveDrawing(point);
    return true;
  }

  runLocalRotation(): void {
    this.rotatePoints(this.points);
  }
}
