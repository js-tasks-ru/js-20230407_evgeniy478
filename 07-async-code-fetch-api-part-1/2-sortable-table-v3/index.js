import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  scrollStep = 30;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url = ""
  } = {}) {
    this.data = data;
    this.sortedColumn = headersConfig.filter(config => config['sortable'] === true)[0].id;
    this.urlPrefix = url;
    this.url = this.getUrl();
    this.sorted = sorted;
    this.order = "asc";
    this.headersConfig = headersConfig;
    this.sortedData = [];
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
    this.sortOnServer(this.sortedColumn, this.order)
      .then(result => result.forEach(item => {
        this.sortedData.push(item);
        this.subElements.body.insertAdjacentHTML("afterbegin", this.constructRow(item));
      }));
  }

  getUrl(sort = this.sortedColumn, order = this.order, start = 0, end = this.scrollStep) {
    this.url = new URL(BACKEND_URL + "/" + this.urlPrefix);
    this.sortedColumn = sort;
    this.order = order;
    this.currentStart = start;
    this.currentEnd = end;
    this.url.searchParams.set("_sort", sort);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start.toString());
    this.url.searchParams.set("_end", end.toString());
    return this.url;
  }

  onScroll = () => {
    if (window.scrollY + window.innerHeight > this.subElements.body.scrollHeight) {
      this.currentEnd += this.scrollStep;
      this.currentStart += this.scrollStep;
      this.fetchMore();
    }
  }

  onKeyDown = event => {
    if (this.lock) {
      event.preventDefault();
    }
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
      this.subElements.body.innerHTML = "";
      this.sortOnServer(this.sortedColumn, newOrder)
        .then(result => result.forEach(item => {
          this.sortedData.push(item);
          this.subElements.body.insertAdjacentHTML("afterbegin", this.constructRow(item));
        }));
      column.dataset.order = newOrder;
      if (this.subElements.arrow) {
        this.subElements.arrow.remove();
      }
      column.insertAdjacentHTML("beforeend", this.getSpan(id));
      this.initSubElements();
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
    window.addEventListener('scroll', this.onScroll);
    this.subElements.body.addEventListener('keydown', this.onKeyDown);
  }

  getHeaderElem({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-order="asc" data-sortable="${sortable}">
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
    this.subElements.header.removeEventListener('pointerdown', this.onClick);
    this.element = null;
  }

  sortOnClient (id, order) {
    const sortingHeader = this.headersConfig.filter(header => header.id === id)[0];
    const direction = order === 'asc' ? 1 : -1;
    this.sortOrder = order;
    if (sortingHeader.sortType === 'string') {
      this.sortedData.sort((a, b) => direction * a[id].localeCompare(b[id], 'ru', {sensitivity: 'variant', caseFirst: "upper"}));
    }
    else {
      this.sortedData.sort((a, b) => {return direction * (a[id] - b[id]);});
    }
    this.subElements.body.innerHTML = "";
    this.sortedData
      .forEach(item => this.subElements.body.insertAdjacentHTML("beforeend", this.constructRow(item)));
    return this.sortedData;
  }

  sortOnServer(id, order, start = 0, end = this.scrollStep) {
    this.lock = true;
    return fetchJson(this.getUrl(id, order, start, end))
      .finally(this.lock = false);
  }

  fetchMore() {
    this.lock = true;
    fetchJson(this.getUrl(this.sortedColumn, this.order, this.currentStart, this.currentEnd))
      .then(result => result.forEach(item => {
        this.sortedData.push(item);
        this.subElements.body.insertAdjacentHTML("beforeend", this.constructRow(item));
      }))
      .finally(this.lock = false);
  }

}
