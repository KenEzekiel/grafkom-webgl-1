import { Color } from "./primitives";

export class ColorPicker {
  private colorpicker: HTMLInputElement;
  public color: string;

  constructor(id: string) {
    this.colorpicker = document.querySelector(`#${id}`)!;
    this.color = this.colorpicker.value;
    this.colorpicker.addEventListener("input", () => {
      this.color = this.colorpicker.value;
    });
  }

  public onValueChange(callback: (value: string) => void) {
    this.colorpicker.addEventListener("input", () => {
      callback(this.colorpicker.value);
    });
  }

  setColor(color: Color) {
    this.color = this.rgbToHex(color[0], color[1], color[2]);
    this.colorpicker.value = this.color;
    console.log(this.color);
  }

  private componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  private rgbToHex(r: number, g: number, b: number) {
    return (
      "#" +
      this.componentToHex(r) +
      this.componentToHex(g) +
      this.componentToHex(b)
    );
  }

  private hexToRgb(): Color {
    const aRgbHex = this.color.slice(1).match(/.{1,2}/g)!;
    return [
      parseInt(aRgbHex[0], 16),
      parseInt(aRgbHex[1], 16),
      parseInt(aRgbHex[2], 16),
    ];
  }

  public getColor(): Color {
    return JSON.parse(JSON.stringify(this.hexToRgb()));
  }
}
