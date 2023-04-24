/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let charSet = new Set(string);
  for (let char of charSet) {
    let re = new RegExp(`(${char}{${size}})(${char}*)`, "g");
    string = string.replaceAll(re, "$1");
  }
  return string;
}
