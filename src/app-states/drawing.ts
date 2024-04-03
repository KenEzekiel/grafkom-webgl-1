import { Application } from "../application";
import { Drawable } from "../lib/drawable/base";
import { Line } from "../lib/drawable/line";
import { Polygon } from "../lib/drawable/polygon";
import { Rectangle } from "../lib/drawable/rectangle";
import { Square } from "../lib/drawable/square";
import { Point } from "../lib/primitives";
import { BaseAppState } from "./base";
import { IdleState } from "./idle";

export class DrawingState extends BaseAppState {
  constructor(app: Application, private object: Drawable) {
    super(app);
    this.app.addObject(object);
    this.app.toolbars.setEnableChange(false);
  }

  onClick(point: Point): void {
    if (
      this.object instanceof Line ||
      this.object instanceof Rectangle ||
      this.object instanceof Square
    ) {
      if (this.object instanceof Rectangle) {
        this.object.adjustNegativeDimension();
      }
      this.app.changeState(new IdleState(this.app));
      return;
    }

    if (this.object instanceof Polygon) {
      if (this.object.isSelected(point, this.object.points.length - 1)) {
        this.object.deletePoint(this.object.points.length - 1);
        this.object.updateConvexHull();
        this.app.changeState(new IdleState(this.app));
      } else {
        this.object.addPoint(point);
        this.app.draw();
      }
      return;
    }
  }
  onMouseMove({ x, y }: Point): void {
    if (this.object instanceof Line) {
      this.object.points[1].x = x;
      this.object.points[1].y = y;
    } else if (this.object instanceof Square) {
      let dx = this.object.point.x;
      let dy = this.object.point.y;

      let lengthY = y - dy;
      let lengthX = x - dx;
      let resultingLength =
        Math.max(Math.abs(lengthY), Math.abs(lengthX)) === Math.abs(lengthY)
          ? lengthY
          : lengthX;

      // If lengthX < 0, then in Quadran 2 and 3
      // If lengthY < 0, then in Quadran 3 and 4
      if (lengthX < 0) {
        this.object.negX = true;
        lengthX = Math.abs(lengthX);
      } else {
        this.object.negX = false;
      }
      if (lengthY < 0) {
        this.object.negY = true;
        lengthY = Math.abs(lengthY);
      } else {
        this.object.negY = false;
      }
      this.object.length = resultingLength;
      // this.object.height = resultingLength * (lengthY > 0 ? 1 : -1);
      this.object.resetPointsCache();
    } else if (this.object instanceof Rectangle) {
      let dx = this.object.point.x;
      let dy = this.object.point.y;

      let width = x - dx;
      let height = y - dy;

      this.object.width = width;
      this.object.height = height;
      this.object.resetPointsCache();
    } else if (this.object instanceof Polygon) {
      this.object.updateLastPoint({ x, y });
    }

    this.app.draw();
  }
}
