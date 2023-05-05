const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  constructor({url = "", range = {from: "2023-04-05", to: "2023-05-05"}, label = "", link = "#"} = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.data = [];
    this.from = new Date(Date.parse(range.from));
    this.to = new Date(Date.parse(range.to));
    this.render();
    setTimeout(this.simulateClick, "1000");
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="column-chart column-chart_loading" style="--chart-height: 50">
      <div class="column-chart__title">
        Total ${this.label}
        <a class="column-chart__link" href="#">${this.label === "orders" ? "View all" : ""}</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          344
        </div>
        <div data-element="body" class="column-chart__chart">

        </div>
      </div>
    </div>`;
    this.element = wrapper.firstElementChild;
    this.update(this.from, this.to);
  }

  formatDollars(number = 0) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
    return formatter.format(number);
  }

  update (from = new Date(), to = new Date()) {
    for (let elementsByClassNameElement of document.getElementsByClassName("column-chart")) {
      elementsByClassNameElement.classList.remove("column-chart_loading");
      this
        .loadValues(BACKEND_URL + "/" + this.url.replace("orders", elementsByClassNameElement.parentNode.id)
          + `?from=${from.toISOString()}&to=${to.toISOString()}`)
        .then(data => this.showValues(data, elementsByClassNameElement));
    }
  }

  showValues (data, elementsByClassNameElement) {
    let max = Object.values(data).reduce(
      (accumulator, currentValue) => accumulator > currentValue ? accumulator : currentValue);
    let sum = Object.values(data).reduce((accumulator, currentValue) => accumulator + currentValue);
    let string = Object.values(data).map(value => {
      let percent = (value / max) * 100;
      return `<div style="--value: ${value * (50 / max)}" data-tooltip="${percent + "%"}"></div>`;
    }).join("");
    elementsByClassNameElement.innerHTML = `<div class="column-chart__title">
        Total ${elementsByClassNameElement.parentNode.id}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${elementsByClassNameElement.parentNode.id === "sales" ? this.formatDollars(sum) : sum}</div>
        <div data-element="body" class="column-chart__chart">
          ${string}
        </div>
      </div>`;
  }

  loadValues(url) {
    return fetch(url).then(response => response.json());
  }

  simulateClick() {
    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    const cb = document.getElementById("loadOrders");
    cb.dispatchEvent(event);
  }

  destroy () {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

}
