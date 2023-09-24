/**
 * @param {string} str 
 */
export function toCamelCase(str) {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, camelCaseReplacer);
}

function camelCaseReplacer(m, p1, p2, offset) {
  if (p2) {
    return p2.toUpperCase();
  } else {
    return p1.toLowerCase();
  }
}

/**
 * @param {string} str 
 */
export function toPascalCase(str) {
  let result = toCamelCase(str);
  return result.charAt(0).toUpperCase() + result.slice(1);
}
