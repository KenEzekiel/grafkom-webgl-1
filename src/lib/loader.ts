import { Drawable } from "./drawable/base";
import FileSaver from "file-saver";

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

  readJSON(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const contents = e.target!.result as string;
        // Assuming the file content is JSON
        const parsedDrawables: Drawable[] = JSON.parse(contents).map(
          createDrawableFromJson
        );
        return parsedDrawables;
      };
      reader.readAsText(file);
    }
  }
}

function createDrawableFromJson(json: any) {
  switch (json.type) {
    case "line":
      return null;
  }
}
