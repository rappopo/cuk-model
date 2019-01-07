'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, params) => {
    const schema = helper('model:getSchema')(name)
    return cuk.pkg.site && _.has(schema.attributes, 'site') && params.site
  }
}
