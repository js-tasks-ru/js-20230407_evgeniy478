export default class ColumnChart {

  chartHeight = 50;

  constructor({data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading =
    (value) => `${value}`} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.maxValue = Math.max(...this.data);
    this.element = this.getColumnChart();
  }

  getColumnChart() {
    let columnChart = document.createElement('div');
    columnChart.style.cssText = "--chart-height: " + this.chartHeight;

    columnChart.appendChild(this.getColumnChartTitle());
    if (this.data.length === 0) {
      columnChart.className = "column-chart column-chart_loading";
    }
    else {
      columnChart.className = "column-chart";
    }

    columnChart.appendChild(this.getColumnChartContainer());
    return columnChart;
  }

  getColumnChartTitle() {
    let title = document.createElement('div');
    title.className = "column-chart__title";
    title.innerText = " Total " + this.label + " ";
    if (this.link !== '') {
      title.insertAdjacentHTML("beforeend", `<a class="column-chart__link" href="${this.link}">View all</a>`);
    }
    else {
      title.insertAdjacentHTML("beforeend",
        `<a class="column-chart__link" href="${this.link}" hidden>${this.label}</a>`);
    }
    return title;
  }

  getColumnChartContainer() {
    let container = document.createElement('div');
    container.className = "column-chart__container";
    let header = document.createElement('div');
    header.className = "column-chart__header";
    header.dataset.element = "header";
    header.innerText = this.formatHeading(this.value.toLocaleString("en-US"));
    let body = document.createElement('div');
    body.className = "column-chart__chart";
    body.dataset.element = "body";
    container.appendChild(header);
    container.appendChild(body);
    for (let value of this.data) {
      let element = document.createElement('div');
      element.className = "--value: " + value;
      element.style.cssText = "--value: " + value;
      element.dataset.tooltip = Math.round(100 * (value / this.maxValue)) + "%";
      body.appendChild(element);
    }
    return container;
  }

  update(data) {
    this.destroy();
    this.data = data;
    this.maxValue = Math.max(...this.data);
    this.element = this.getColumnChart();
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

}
