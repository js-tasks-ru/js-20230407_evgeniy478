export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    //this.data = data;
    this.sortedData = data;
    this.element = this.render();
    this.sortOrder = 'asc';
  }

  render() {
    return this.constructTable();
  }

  sort(fieldValue, orderValue) {
    let sortingHeader = this.headerConfig.filter(header => header.id === fieldValue)[0];
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
    this.element.innerHTML = this.render().innerHTML;
  }

  constructTable() {
    let root = document.createElement('div');
    let sortableTable = document.createElement('div');
    root.dataset.element = "productsContainer";
    root.className = "products-list__container";
    sortableTable.className = "sortable-table";
    sortableTable.append(this.constructHeaders(this.sortOrder));
    sortableTable.append(this.constructRows(this.sortedData));
    sortableTable.insertAdjacentHTML("beforeend", `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>`);
    root.appendChild(sortableTable);
    return root;
  }

  constructRows(sortedData) {
    let body = document.createElement('div');
    body.className = "sortable-table__body";
    body.dataset.element = "body";
    for (const element of sortedData) {
      let hyperlink = document.createElement('a');
      hyperlink.href = "/products/" + element.id;
      hyperlink.className = "sortable-table__row";
      for (const header of this.headerConfig) {
        if ('template' in header && header.template instanceof Function) {
          hyperlink.insertAdjacentHTML("beforeend", header.template(header.images));
        }
        else {
          hyperlink.insertAdjacentHTML("beforeend", `<div className="sortable-table__cell">${element[header.id]}</div>`);
        }
        body.append(hyperlink);
      }
    }
    return body;
  }

  constructHeaders(dataOrder) {
    let headers = document.createElement('div');
    headers.className = "sortable-table__header sortable-table__row";
    headers.dataset.element = "header";
    for (const header of this.headerConfig) {
      if (header.title !== "Name") {
        headers.insertAdjacentHTML("beforeend", `<div className="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" data-order="${dataOrder}">
            <span>${header.title}</span>
          </div>`);
      }
      else {
        headers.insertAdjacentHTML("beforeend", `<div className="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" data-order="${dataOrder}">
            <span>${header.title}</span>
            <span data-element="arrow" className="sortable-table__sort-arrow">
          <span className="sort-arrow"></span>
        </span>
          </div>`);
      }
    }
    return headers;
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

}

