export default class DoubleSlider {

  constructor({min = 300,
    max = 800,
    selected = {from: 400, to: 600},
    formatValue = value => '$' + value} = {}) {
    this.format = formatValue;
    this.min = selected.from ? this.format(selected.from) : this.format(min);
    this.max = selected.to ? this.format(selected.to) : this.format(max);
    this.minPrice = min;
    this.maxPrice = max;
    this.initMin = selected.from;
    this.initMax = selected.to;
    this.render();
    this.initSubElements();
    this.initEventListeners();
    this.mouseDown = false;
    this.leftPercent = 0;
    this.rightPercent = 0;
    this.setInitValues();
    //this.dispatchEvents();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="range-slider">
    <span data-element="from">${this.min}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"></span>
      <span class="range-slider__thumb-left"></span>
      <span class="range-slider__thumb-right"></span>
    </div>
    <span data-element="to">${this.max}</span>
  </div>`;
    this.element = wrapper.firstElementChild;
    return this.element;
  }

  setInitValues() {
    const spanArray = this.element.getElementsByTagName('span');
    spanArray[0].innerText = this.format(this.initMin);
    spanArray[spanArray.length - 1].innerText = this.format(this.initMax);
    const delta = this.maxPrice - this.minPrice;
    const initMaxPercent = 100 * (this.maxPrice - this.initMax) / delta + "%";
    const initMinPercent = 100 * (this.initMin - this.minPrice) / delta + "%";
    this.sliderRight.style.right = initMaxPercent + "%";
    this.sliderProgress.style.right = initMaxPercent + "%";
    this.sliderLeft.style.left = initMinPercent + "%";
    this.sliderProgress.style.left = initMinPercent + "%";
  }

  customEventF = event => {
    console.log(event.detail);
  }

  mouseDown = event => {
    this.currentArrow = event.target.className;
    this.startX = event.clientX;
    this.mouseDown = true;
  }

  mouseUp = event => {
    this.mouseDown = false;
    if (this.currentArrow === "range-slider__thumb-left" &&
      (this.leftPercent + this.deltaPercent) <= 100 && (this.leftPercent + this.deltaPercent) >= 0) {
      this.leftPercent = this.leftPercent + this.deltaPercent;
    }
    else if (this.currentArrow === "range-slider__thumb-right" &&
      (this.rightPercent + this.deltaPercent) <= 100 && (this.rightPercent + this.deltaPercent) >= 0) {
      this.rightPercent = this.rightPercent + this.deltaPercent;
    }
  }

  mouseMove = event => {
    event.preventDefault();
    if (this.mouseDown) {
      if (this.currentArrow === "range-slider__thumb-left") {
        const delta = event.clientX - this.startX;
        this.deltaPercent = 100 * ((delta) / this.sliderInner.clientWidth);
        const percentChange = this.leftPercent + this.deltaPercent;
        const percentChangeString = percentChange + "%";
        if (Math.abs(percentChange) + Math.abs(this.rightPercent) <= 100 && percentChange >= 0) {
          this.sliderLeft.style.left = percentChangeString;
          this.sliderProgress.style.left = percentChangeString;
          this.setLegend(percentChange, this.rightPercent);
        }
      }
      else if (this.currentArrow === "range-slider__thumb-right") {
        const delta = this.startX - event.clientX;
        this.deltaPercent = 100 * ((delta) / this.sliderInner.clientWidth);
        const percentChange = this.rightPercent + this.deltaPercent;
        const percentChangeString = percentChange + "%";
        if (Math.abs(percentChange) + Math.abs(this.leftPercent) <= 100 && percentChange >= 0) {
          this.sliderRight.style.right = percentChangeString;
          this.sliderProgress.style.right = percentChangeString;
          this.setLegend(this.leftPercent, percentChange);
        }
      }
    }
  }

  setLegend(fromPercent = 0, toPercent = 0) {
    const spanArray = this.element.getElementsByTagName('span');
    const from = Math.floor(this.minPrice + (this.maxPrice - this.minPrice) * fromPercent / 100);
    const to = Math.floor(this.maxPrice - (this.maxPrice - this.minPrice) * toPercent / 100);
    spanArray[0].innerText = this.format(from);
    spanArray[spanArray.length - 1].innerText = this.format(to);
    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: { "from": from, "to": to }
    }));
  }

  initSubElements() {
    this.sliderLeft = this.element.getElementsByClassName("range-slider__thumb-left").item(0);
    this.sliderRight = this.element.getElementsByClassName("range-slider__thumb-right").item(0);
    this.sliderProgress = this.element.getElementsByClassName("range-slider__progress").item(0);
    this.sliderInner = this.element.getElementsByClassName("range-slider__inner").item(0);
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.mouseDown, true);
    document.addEventListener('pointerup', this.mouseUp, true);
    document.addEventListener('pointermove', this.mouseMove, true);
    this.element.addEventListener("range-select", this.customEventF);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element.removeEventListener("range-select", this.customEventF);
    this.element = null;
  }

}
