export class Slider {
  private slider: HTMLInputElement;
  private minimum: number;
  private maximum: number;
  private default: number;
  private cleanupFunctions: (() => void)[] = [];

  constructor(id: string) {
    this.slider = document.querySelector(`#${id}`)!;
    this.minimum = Number(this.slider.getAttribute("min"));
    this.maximum = Number(this.slider.getAttribute("max"));
    this.default = Number(this.slider.value);
  }

  public onValueChange(callback: (value: number) => void) {
    const callbackWrapper = () => {
      callback(Number(this.slider.value));
    };
    this.slider.addEventListener("input", callbackWrapper);

    this.cleanupFunctions.push(() => {
      this.slider.removeEventListener("input", callbackWrapper);
    });
  }

  public cleanup() {
    this.slider.value = String(this.default);
    this.cleanupFunctions.forEach((cf) => {
      cf();
    });
  }

  getValue() {
    return this.slider.value;
  }

  setValue(value: number) {
    this.slider.value = String(
      Math.max(Math.min(value, this.maximum), this.minimum)
    );
  }
}
