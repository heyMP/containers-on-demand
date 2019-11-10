// @ts-check
/**
 * Checks if an image is valid
 * @param {String} image 
 * @param {String} whitelist Raw environment string of REGISTRY_WHITELIST 
 */
module.exports = (image, whitelist) => {
  const _whitelist = whitelist.split(',').map(i => i.trim())
  const valid = _whitelist.find(i => (image.match(i) !== null))
  return valid ? true : false
}
