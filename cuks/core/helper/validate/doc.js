'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  return (name, body = {}, ignore = []) => {
    const { CukModelValidationError } = cuk.pkg.model.lib
    const model = helper('model:get')(name)
    const params = { collection: _.snakeCase(name), ignoreColumn: ignore }
    const result = model.dab.validateDoc(body, params)
    if (result) throw CukModelValidationError(result.details)
    return true
  }
}