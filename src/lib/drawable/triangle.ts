import { ApplicationProgram } from "../../application";
import { Color, Point } from "../primitives";
import { Drawable } from "./base";

export class Triangle extends Drawable {
    
  constructor(public points: [Point, Point, Point], color: Color, application: ApplicationProgram) {
    super(color, application);
  }
  getRotationPoint(): Point {
    throw new Error("Method not implemented.");
}

  draw(): void {
    this.program.gl.bufferData(
        this.program.gl.ARRAY_BUFFER,
      new Float32Array([this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y]),
      this.program.gl.STATIC_DRAW
    );  
    this.prepare();
    this.program.gl.drawArrays(this.program.gl.TRIANGLES, 0, 3);
  }
}

