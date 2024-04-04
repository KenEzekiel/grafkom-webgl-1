import { Drawable } from "./drawable/base";
import FileSaver from "file-saver";
import { Program } from "./program";
import { ApplicationProgram } from "../application";
import { Line } from "./drawable/line";
import { Square } from "./drawable/square";
import { Rectangle } from "./drawable/rectangle";
import { Polygon } from "./drawable/polygon";

export class Loader {
  constructor(private program: ApplicationProgram) {}

  getJSON(drawables: Array<Drawable>) {
    return JSON.stringify(drawables);
  }

  saveJSON(drawables: Array<Drawable>, name: String) {
    const file = new File([JSON.stringify(drawables)], `${name}.json`, {
      type: "application/JSON;charset=utf-8",
    });
    FileSaver.saveAs(file);
  }

  readJSON(contents: string) {
    return JSON.parse(contents).map((drawableJSON: any) =>
      createDrawableFromJson(drawableJSON, this.program)
    );
  }

  readJSONFile(file: File, program: ApplicationProgram) {
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
      line.rotationDegree = json.rotationDegree;
      line.localRotatedDegree = json.localRotatedDegree;
      line.rotation = json.rotation;
      line.finishDrawing();
      return line;
    case "square":
      const square = new Square(json.point, json.length, json.color, program);
      square.finishDrawing();
      square.rotationDegree = json.rotationDegree;
      square.localRotatedDegree = json.localRotatedDegree;
      square.rotation = json.rotation;
      return square;
    case "rectangle":
      const rectangle = new Rectangle(
        json.point,
        json.width,
        json.height,
        json.color,
        program
      );
      rectangle.rotationDegree = json.rotationDegree;
      rectangle.localRotatedDegree = json.localRotatedDegree;
      rectangle.rotation = json.rotation;
      rectangle.finishDrawing();
      return rectangle;
    case "polygon":
      const polygon = new Polygon(json.points, json.color, program);
      polygon.rotationDegree = json.rotationDegree;
      polygon.localRotatedDegree = json.localRotatedDegree;
      polygon.rotation = json.rotation;
      polygon.finishDrawing();
      return polygon;
  }
}
