export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}, sortLocally = true) {

    this.data = data;
    this.sortedData = data;
    this.sorted = sorted;
    this.headersConfig = headersConfig;
    this.isSortLocally = sortLocally;
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

  sortOnClient() {

  }

  sortOnServer() {

  }

  onClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    console.log(this.sortedColumn);

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
      this.sort(id, newOrder);

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
    let addSpan;
    if (id === this.sortedColumn) {
      this.arrow = document.createElement('div');
      this.arrow.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
      addSpan = this.arrow.innerHTML;
    }
    else {
      addSpan = '';
    }
    return addSpan;
  }

  constructRow(item = {}) {
    let hyperlink = document.createElement('a');
    hyperlink.href = "/products/" + item.id;
    hyperlink.className = "sortable-table__row";
    this.headersConfig.map(config => {
      if (config.template && config.template instanceof Function) {
        hyperlink.insertAdjacentHTML("beforeend", config.template(item.images));
      }
      else {
        hyperlink.insertAdjacentHTML("beforeend", `<div className="sortable-table__cell">${item[config.id]}</div>`);
      }});
    return hyperlink.outerHTML;
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
    let sortingHeader = this.headersConfig.filter(header => header.id === fieldValue)[0];
    if (sortingHeader.sortType === 'string') {
      this.sortedData.sort((a, b) => a[fieldValue].localeCompare(b[fieldValue], 'ru', {sensitivity: 'variant', caseFirst: "upper"}));
    }
    else {
      this.sortedData.sort((a, b) => {return a[fieldValue] - b[fieldValue];});
    }
    if (orderValue === 'desc') {
      this.sortedData.reverse();
    }
    this.sortOrder = orderValue;
    document.getElementsByClassName("sortable-table__body").item(0).innerHTML = this.sortedData.map(item => this.constructRow(item)).join("");
  }

}
