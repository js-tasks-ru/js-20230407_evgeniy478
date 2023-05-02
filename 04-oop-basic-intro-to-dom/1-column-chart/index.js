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
    this.value = formatHeading(value);
    this.link = link;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getColumnChart();
    this.element = wrapper.firstElementChild;
  }

  getColumnChart() {

    return `<div class="column-chart ${this.data.length === 0 ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.link ? '<a href=${this.link} class="column-chart__link">View all</a>' : ''}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getColumnsChart()}
        </div>
      </div>
    </div>`;
  }

  getColumnsChart() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    let columnChart = "";

    for (const item of this.data) {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value = String(Math.floor(item * scale));
      columnChart += `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }
    return columnChart;

  }

  update(data) {
    this.destroy();
    this.data = data;
    this.render();
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove() {
    if (this.element && this.element.firstElementChild) {
      this.element.firstElementChild.remove();
    }
    if (this.element) {
      this.element.remove();
      if (this.element.firstElementChild) {
        this.element.firstElementChild.remove();
      }
    }
  }

}
