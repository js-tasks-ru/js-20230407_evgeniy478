export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

    this.data = data;
    this.sortedData = data;
    this.sorted = sorted;
    this.headersConfig = headersConfig;
    this.sortedColumn = headersConfig.filter(config => config['sortable'] === true)[0].id;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");


    wrapper.innerHTML = `
<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table">
  <div data-element="header" class="sortable-table__header sortable-table__row">
     ${this.headersConfig.map(item => this.getHeaderElem(item)).join('')}
  </div>
  </div>
</div>

<div data-element="body" class="sortable-table__body">

${this.sortedData.map(item => this.constructRow(item)).join("")}

</div>

<div data-element="loading" class="loading-line sortable-table__loading-line"></div>

<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
  <div>
    <p>No products satisfies your filter criteria</p>
    <button type="button" class="button-primary-outline">Reset all filters</button>
  </div>
</div>
`;
    this.element = wrapper;
    this.initSubElements();
    this.initListeners();
  }

  onClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      this.sortedColumn = id;
      const newOrder = toggleOrder(order);
      //this.sort(id, newOrder);
      this.element.getElementsByClassName("sortable-table__body").item(0).innerHTML = this
        .sort(id, newOrder)
        .map(item => this.constructRow(item))
        .join("");

      column.dataset.order = newOrder;
      document.getElementsByClassName('sortable-table__sort-arrow').item(0).remove();
      column.insertAdjacentHTML("beforeend", this.getSpan(id));
    }

  }

  initSubElements() {
    const result = {} ;
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    this.subElements = result;
  }

  initListeners() {
    const headerCells = this.subElements.header;
    headerCells.addEventListener('pointerdown', this.onClick);
  }

  getHeaderElem({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-order="${this.sortedColumn === id ? this.sorted.order : 'asc'}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.getSpan(id)}
      </div>`;
  }

  getSpan(id) {
    let addSpan = '';
    if (id === this.sortedColumn) {
      this.arrow = document.createElement('div');
      this.arrow.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
      addSpan = this.arrow.innerHTML;
    }
    return addSpan;
  }

  constructRow(item = {}) {
    const hyperlink = document.createElement('div');
    hyperlink.innerHTML = `<a href="/products/${item.id}" class="sortable-table__row"></a>`;
    this.headersConfig.map(config => {
      if (config.template && config.template instanceof Function) {
        hyperlink.firstElementChild.insertAdjacentHTML("beforeend", config.template(item.images));
      }
      else {
        hyperlink.firstElementChild.insertAdjacentHTML("beforeend",
          `<div className="sortable-table__cell">${item[config.id]}</div>`);
      }});
    return hyperlink.innerHTML;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  sort(fieldValue, orderValue) {
    const sortingHeader = this.headersConfig.filter(header => header.id === fieldValue)[0];
    const direction = orderValue === 'asc' ? 1 : -1;
    this.sortOrder = orderValue;
    if (sortingHeader.sortType === 'string') {
      this.sortedData.sort((a, b) => direction * a[fieldValue].localeCompare(b[fieldValue], 'ru', {sensitivity: 'variant', caseFirst: "upper"}));
    }
    else {
      this.sortedData.sort((a, b) => {return direction * (a[fieldValue] - b[fieldValue]);});
    }
    return this.sortedData;
  }

}
