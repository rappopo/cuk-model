'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, params) => {
    try {
      const schema = helper('model:getSchema')(name)
      return _.has(schema.attributes, 'owner_id') && params.owner
    } catch (e) {
      return false
    }
  }
}
