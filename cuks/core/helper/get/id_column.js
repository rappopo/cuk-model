'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return name => {
    const collName = _.snakeCase(name)
    return helper('model:getDab')(name).collection[collName].srcAttribId
  }
}
