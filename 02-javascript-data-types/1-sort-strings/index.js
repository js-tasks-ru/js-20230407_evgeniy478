/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  if (param === 'desc') {
    return sortArr(arr).reverse();
  }
  else {
    return sortArr(arr);
  }
  function sortArr(array) {
    const newArr = [...array];
    return newArr.sort((a, b) => a.localeCompare(b, 'ru', {sensitivity: 'variant', caseFirst: "upper"}));
  }
}
