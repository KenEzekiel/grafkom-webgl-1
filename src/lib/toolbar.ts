const toolbarContainer = document.querySelector(".toolbars")!;

class Toolbar<T extends string> {
  private button: HTMLButtonElement;
  public active: boolean = false;
  public onActive?: () => void;

  static enableChange = true;

  constructor(public name: T, shortcut?: string) {
    this.button = toolbarContainer.querySelector("." + name)!;
    const onSelect = () => {
      if (!Toolbar.enableChange) {
        return;
      }
      this.toggle(true);
      if (this.onActive && this.active) {
        this.onActive();
      }
    };
    this.button.addEventListener("click", onSelect);
    if (shortcut) {
      this.button.parentElement?.setAttribute(
        "data-tip",
        `Shift + ${shortcut.toUpperCase()}`
      );
    }

    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && e.key.toLowerCase() === shortcut) {
        onSelect();
      }
    });
  }

  public toggle(active?: boolean) {
    const newActive = active === undefined ? !this.active : active;
    this.active = newActive;

    this.button.classList.toggle("btn-primary", !newActive);
    this.button.classList.toggle("text-black", !newActive);

    this.button.classList.toggle("btn-secondary", newActive);
    this.button.classList.toggle("text-white", newActive);
  }

  public setEnableChange(enableChange: boolean) {
    this.button.classList.toggle("cursor-not-allowed", !enableChange);
  }

  public setOnActive(callback: () => void) {
    this.onActive = callback;
  }
}

export class Toolbars<T extends string> {
  public items: Record<T, Toolbar<T>>;
  public activeToolbar: T | null = null;

  constructor(private names: T[], shortcuts: (string | undefined)[]) {
    this.items = {} as Record<T, Toolbar<T>>;
    this.names.forEach((name, idx) => {
      this.items[name] = new Toolbar(name, shortcuts[idx]);
    });

    Object.entries<Toolbar<T>>(this.items).forEach(([_, item]) => {
      item.setOnActive(() => {
        this.onActive(item.name);
      });
    });
  }

  public setOnActive(callback: (name: T) => void) {
    Object.entries<Toolbar<T>>(this.items).forEach(([_, item]) => {
      item.setOnActive(() => {
        this.onActive(item.name);
        callback(item.name);
      });
    });
  }

  public setEnableChange(enableChange: boolean) {
    Toolbar.enableChange = enableChange;
    Object.values<Toolbar<T>>(this.items).forEach((item) => {
      item.setEnableChange(enableChange || item.name === this.activeToolbar);
    });
  }

  private onActive(name: T) {
    if (this.activeToolbar && this.activeToolbar !== name) {
      this.items[this.activeToolbar].toggle(false);
    }
    this.activeToolbar = name;
  }
}
