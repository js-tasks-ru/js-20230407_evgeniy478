class Tooltip {

  static instance;

  cursorOffset = 15;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
  }

  initialize () {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    this.addListeners();
    this.pointerSelector = "tooltip";
    return Tooltip.instance;
  }

  render (toolTip = "") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="${this.pointerSelector}">${toolTip}</div>`;
    this.element = wrapper.firstChild;
    document.body.append(this.element);
  }

  mouseOver = event => {
    this.element.style.left = event.clientX + this.cursorOffset + "px";
    this.element.style.top = event.clientY + this.cursorOffset + "px";
  }

  mouseOut = event => {
    const element = event.target.closest("div");

    if (element) {
      this.render(element.dataset.tooltip);
      document.body.addEventListener("pointermove", this.mouseOver);
    }
  }

  removeLabel = () => {
    this.destroy();
    document.body.removeEventListener("pointermove", this.mouseOver);
  }

  addListeners () {
    document.body.addEventListener("pointerover", this.mouseOut);
    document.body.addEventListener("pointerout", this.removeLabel);
  }

  destroy () {
    if (this.element) {
      this.remove();
    }
    document.body.removeEventListener("pointerover", this.mouseOut);
    document.body.removeEventListener("pointerout", this.removeLabel);
    document.body.removeEventListener("pointermove", this.mouseOver);
    this.element = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}



export default Tooltip;
