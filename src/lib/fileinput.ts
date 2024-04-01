export class FileInput {
  private fileInput: HTMLInputElement;
  public files: FileList | null;

  constructor(id: string) {
    this.fileInput = document.querySelector(`#${id}`)!;
    this.files = this.fileInput.files;
    this.fileInput.addEventListener("input", () => {
      this.files = this.fileInput.files;
    });
  }

  public onFileInput(callback: (files: FileList) => void) {
    this.fileInput.addEventListener("input", () => {
      if (!this.fileInput.files) {
        return;
      }
      callback(this.fileInput.files);
    });
  }
}
