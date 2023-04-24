/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {

  let properties = path.split(".");
  let propIterator = properties[Symbol.iterator]();

  return function parseObject(object) {
    let next = propIterator.next();
    if (object === undefined || object.isEmpty || next.done) {
      return object;
    }
    let key = next.value;
    for (const oKey of Object.keys(object)) {
      if (oKey === key) {
        return parseObject(object[key]);
      }
    }
  };

}
