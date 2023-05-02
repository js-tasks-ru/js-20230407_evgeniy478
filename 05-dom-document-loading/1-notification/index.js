export default class NotificationMessage {

  primeClass = "notification";

  constructor(message = "", {duration = 0, type = ""} = {}) {
    this.type = type;
    this.duration = duration;
    this.message = message;
    this.classname = `${NotificationMessage.primeClass} ${this.type}`;
    this.element = this.render();
  }

  show() {
    const elements = document.getElementsByClassName(NotificationMessage.primeClass);
    if (elements.length === 0) {
      document.body.append(this.element);
    }
    this.timer = setTimeout(() => this.remove(), this.duration);
  }

  render() {
    let element = document.createElement('div');
    element.className = this.classname;
    element.style.cssText = `--value:${this.duration / 1000}s`;
    element.innerHTML = `
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>`;
    return element;
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove() {
    clearTimeout(this.timer);

    if (this.element) {
      this.element.remove();
    }
  }

}
