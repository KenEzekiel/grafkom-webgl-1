export class SavedIndicator {
  savedIndicatorIcon: HTMLElement;

  constructor(id: string) {
    this.savedIndicatorIcon = document.querySelector(`#${id}`)!;
    this.savedIndicatorIcon.classList.toggle("fa-check");
  }

  toggle(isSaved: boolean) {
    this.savedIndicatorIcon.classList.toggle("fa-check", isSaved);
    this.savedIndicatorIcon.classList.toggle("fa-spinner", !isSaved);
    this.savedIndicatorIcon.classList.toggle("animate-spin", !isSaved);
  }
}
