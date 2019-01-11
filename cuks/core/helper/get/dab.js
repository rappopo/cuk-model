'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return name => {
    const names = helper('core:splitName')(name, false, 'Invalid model connector (%s)')
    const schema = _.get(cuk.pkg[names[0]], 'cuks.model.schema.' + names[1])
    if (!schema) throw helper('core:makeError')(`Invalid model (${name})`)
    return helper('model:getConnector')(schema.connector)
  }
}
