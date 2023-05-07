export default class DoubleSlider {

  constructor() {
    this.minPrice = 0;
    this.maxPrice = 100;
    this.render();
    this.initSubElements();
    this.initEventListeners();
    this.mouseDown = false;
    this.leftPercent = 0;
    this.rightPercent = 0;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="range-slider">
    <span>$${this.minPrice}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"></span>
      <span class="range-slider__thumb-left"></span>
      <span class="range-slider__thumb-right"></span>
    </div>
    <span>$${this.maxPrice}</span>
  </div>`;
    this.element = wrapper.firstElementChild;
    return this.element;
  }

  mouseDown = event => {
    this.currentArrow = event.target.className;
    this.startX = event.clientX;
    this.mouseDown = true;
    console.log("Mousedown: " + event.clientX + " , " + event.target.className);
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
    spanArray[0].innerText = this.formatDollars(fromPercent);
    spanArray[spanArray.length - 1].innerText = this.formatDollars(
      this.maxPrice - this.maxPrice * (toPercent / 100));
  }

  initSubElements() {
    this.sliderLeft = this.element.getElementsByClassName("range-slider__thumb-left").item(0);
    this.sliderRight = this.element.getElementsByClassName("range-slider__thumb-right").item(0);
    this.sliderProgress = this.element.getElementsByClassName("range-slider__progress").item(0);
    this.sliderInner = this.element.getElementsByClassName("range-slider__inner").item(0);
  }

  initEventListeners() {
    document.addEventListener('mousedown', this.mouseDown, true);

    document.addEventListener('mouseup', this.mouseUp, true);

    document.addEventListener('mousemove', this.mouseMove, true);
  }

  remove() {

  }

  destroy() {

  }

  formatDollars(number = 0) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
    return formatter.format(number);
  }

}
