import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  static chartHeight = 50;

  constructor({url = "", range = {from: "2023-04-05", to: "2023-05-05"},
    label = "", link = "#", formatHeading = data => `$${data}`} = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.data = [];
    this.from = new Date(Date.parse(range.from));
    this.to = new Date(Date.parse(range.to));
    this.format = formatHeading;
    this.render();
    //setTimeout(this.simulateClick, "1000");
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template();
    this.element = wrapper.firstElementChild;
    this.update(this.from, this.to);
  }

  template() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${ColumnChart.chartHeight}">
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
  }

  update (from = new Date(), to = new Date()) {
    for (const elementsByClassNameElement of document.getElementsByClassName("column-chart")) {
      elementsByClassNameElement.classList.remove("column-chart_loading");
      this
        .loadValues(BACKEND_URL + "/" + this.url.replace("orders", elementsByClassNameElement.parentNode.id)
          + `?from=${from.toISOString()}&to=${to.toISOString()}`)
        .then(data => this.showValues(data, elementsByClassNameElement));
    }
  }

  showValues (data, elementsByClassNameElement) {
    const max = Object.values(data).reduce(
      (accumulator, currentValue) => accumulator > currentValue ? accumulator : currentValue);
    const sum = Object.values(data).reduce((accumulator, currentValue) => accumulator + currentValue);
    const string = Object.values(data).map(value => {
      const percent = (value / max) * 100;
      return `<div style="--value: ${value * (ColumnChart.chartHeight / max)}" data-tooltip="${percent + "%"}"></div>`;
    }).join("");
    elementsByClassNameElement.innerHTML = `<div class="column-chart__title">
        Total ${elementsByClassNameElement.parentNode.id}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${elementsByClassNameElement.parentNode.id === "sales" ? this.format(sum) : sum}</div>
        <div data-element="body" class="column-chart__chart">
          ${string}
        </div>
      </div>`;
  }

  loadValues(url) {
    return fetchJson(url);
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
