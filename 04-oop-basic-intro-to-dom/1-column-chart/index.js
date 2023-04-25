export default class ColumnChart {

  chartHeight = 50;

  constructor(obj) {
    if (obj !== undefined) {
      for (const [key, value] of Object.entries(obj)) {
        this[key] = value;
      }
    }
    if (this.data === undefined) {
      this.data = [];
    }
    this.maxValue = Math.max(...this.data);
    this.element = this.getColumnChart();
  }

  getColumnChart() {
    let columnChart = document.createElement('div');
    columnChart.style.cssText = "--chart-height: " + this.chartHeight;

    columnChart.appendChild(this.getColumnChartTitle());
    if (this.data.length === 0) {
      columnChart.className = "column-chart column-chart_loading";
      columnChart.appendChild(this.getColumnChartContainer(true));
    }
    else {
      columnChart.className = "column-chart";
      columnChart.appendChild(this.getColumnChartContainer(false));
    }

    return columnChart;
  }

  getColumnChartTitle() {
    let title = document.createElement('div');
    title.className = "column-chart__title";
    title.innerText = " Total " + this.label + " ";
    if (this.link !== undefined) {
      title.insertAdjacentHTML("beforeend", '<a class="column-chart__link" href="' + this.link +
        '">View all</a>');
    }
    return title;
  }

  getColumnChartContainer() {
    let container = document.createElement('div');
    container.className = "column-chart__container";
    let header = document.createElement('div');
    header.className = "column-chart__header";
    header.dataset.element = "header";
    if (this.formatHeading !== undefined) {
      header.innerText = this.formatHeading(this.value.toLocaleString("en-US"));
    }
    else {
      header.innerText = this.value;
    }
    let body = document.createElement('div');
    body.className = "column-chart__chart";
    body.dataset.element = "body";
    for (let value of this.data) {
      let element = document.createElement('div');
      element.className = "--value: " + value;
      element.style.cssText = "--value: " + value;
      element.dataset.tooltip = Math.round(100 * (value / this.maxValue)) + "%";
      body.appendChild(element);
    }
    container.appendChild(header);
    container.appendChild(body);
    return container;
  }

  update(data) {
    this.data = data;
    this.maxValue = Math.max(...this.data);
  }

  destroy() {
    console.log("Уничтожаем объект");
  }
}
