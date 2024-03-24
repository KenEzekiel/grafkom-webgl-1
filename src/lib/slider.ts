export class Slider {
  private onInput?: (value: number) => void;
  private slider: HTMLInputElement;
  private minimum: number;
  private maximum: number;

  constructor(id: string, onInput?: (value: number) => void) {
    this.slider = document.querySelector(`#${id}`)!;
    this.onInput = onInput;
    this.minimum = Number(this.slider.getAttribute("min"));
    this.maximum = Number(this.slider.getAttribute("max"));

    console.log(this.minimum, this.maximum);

    this.slider.addEventListener("input", () => {
      if (!this.onInput) {
        return;
      }
      this.onInput(Number(this.slider.value));
    });
  }
}
