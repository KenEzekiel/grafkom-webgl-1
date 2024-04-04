import { Drawable } from "./drawable/base";
import FileSaver from "file-saver";
import { Program } from "./program";
import { ApplicationProgram } from "../application";
import { Line } from "./drawable/line";
import { Square } from "./drawable/square";
import { Rectangle } from "./drawable/rectangle";
import { Polygon } from "./drawable/polygon";

export class Loader {
  getJSON(drawables: Array<Drawable>) {
    return JSON.stringify(drawables);
  }

  saveJSON(drawables: Array<Drawable>, name: String) {
    const file = new File([JSON.stringify(drawables)], `${name}.json`, {
      type: "application/JSON;charset=utf-8",
    });
    FileSaver.saveAs(file);
  }

  readJSON(file: File, program: ApplicationProgram) {
    const reader = new FileReader();

    return new Promise<Drawable[]>((resolve) => {
      reader.onload = function (e) {
        const contents = e.target!.result as string;
        // Assuming the file content is JSON

        const parsedDrawables: Drawable[] = JSON.parse(contents).map(
          (drawableJSON: any) => createDrawableFromJson(drawableJSON, program)
        );

        resolve(parsedDrawables);
      };
      reader.readAsText(file);
    });
  }
}

function createDrawableFromJson(json: any, program: ApplicationProgram) {
  switch (json.type) {
    case "line":
      const line = new Line(json.points, json.color, program);
      line.finishDrawing();
      return line;
    case "square":
      const square = new Square(json.point, json.length, json.color, program);
      square.finishDrawing();
      return square;
    case "rectangle":
      const rectangle = new Rectangle(
        json.point,
        json.width,
        json.height,
        json.color,
        program
      );
      rectangle.finishDrawing();
      return rectangle;
    case "polygon":
      const polygon = new Polygon(json.points, json.color, program);
      polygon.finishDrawing();
      return polygon;
  }
}
