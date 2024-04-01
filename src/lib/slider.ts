export class Slider {
  private slider: HTMLInputElement;
  private minimum: number;
  private maximum: number;

  constructor(id: string) {
    this.slider = document.querySelector(`#${id}`)!;
    this.minimum = Number(this.slider.getAttribute("min"));
    this.maximum = Number(this.slider.getAttribute("max"));
  }

  public onValueChange(callback: (value: number) => void) {
    this.slider.addEventListener("input", () => {
      callback(Number(this.slider.value));
    });
  }
}
