import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  static imageHost = 'https://api.imgur.com';

  constructor (productId = "") {
    this.productId = productId;
    this.defaultFormData = {};
    this.defaultFormData.title = '';
    this.defaultFormData.description = '';
    this.defaultFormData.quantity = 1;
    this.defaultFormData.subcategory = '';
    this.defaultFormData.status = 1;
    this.defaultFormData.images = [];
    this.defaultFormData.price = 100;
    this.defaultFormData.discount = 0;
  }

  async render () {
    const categoriesPromise = this.loadCategories();

    const productsPromise = this.productId
      ? await this.loadProductData(this.productId)
      : await Promise.resolve(this.defaultFormData);

    const [categoriesData, productResponse] = await Promise.all([
      categoriesPromise,
      productsPromise,
    ]);

    this.formData = Array.isArray(productResponse)
      ? productResponse.at(0)
      : productResponse;

    this.categories = categoriesData;

    this.buildBody();
    return this.element;
  }

  loadProductData(productId) {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }
  loadCategories() {
    return fetchJson(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`
    );
  }

  buildBody() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.initSubElements(this.element);
    this.initEventListeners();
  }

  get template() {
    return `
    <div class="product-form">

    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title" class="form-control" value='' placeholder="Название товара">
        </fieldset>
      </div>

      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description" data-element="productDescription"  placeholder="Описание товара"></textarea>
      </div>

      <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>

          <ul class="sortable-list" data-element="imageListContainer">
            ${this.createImagesList()}
          </ul>

          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>

      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        ${this.createCategoriesSelect()}
      </div>

      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" value='${this.defaultFormData.price}'>
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" value='${this.defaultFormData.discount}'>
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity"  value='${this.defaultFormData.quantity}' placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" id="save" class="button-primary-outline">
          ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>

    `;
  }

  initSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }
    subElements.uploadImage = element.getElementsByClassName("button-primary-outline")[0];
    subElements.submitButton = element.getElementsByClassName("button-primary-outline")[1];
    return subElements;
  }

  initEventListeners() {
    const { submitButton, imageListContainer} = this.subElements;

    submitButton.addEventListener('click', event => {
      event.preventDefault();
      this.save().then(r => console.log(r));
    });

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product),
        referer: ""
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('Не удалось сохранить свойства продукта', error);
    }
  }

  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id }) // new CustomEvent('click')
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  createImagesList () {
    return this.formData.images.map(item => {
      return this.getImageItem(item.url, item.source).outerHTML;
    }).join('');
  }

  getImageItem (imageName, imageUrl) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${imageName}" src="${escapeHtml(imageUrl)}">
          <span>${imageName}</span>
        </span>

        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  createCategoriesSelect () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;


    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }

    return select.outerHTML;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

}
