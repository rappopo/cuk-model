'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, params) => {
    try {
      const schema = helper('model:getSchema')(name)
      return cuk.pkg.site && _.has(schema.attributes, 'site_id') && params.site
    } catch (e) {
      return false
    }
  }
}
