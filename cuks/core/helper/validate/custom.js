'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  return (body = {}, schema = {}, captureError = false) => {
    const { validation, CukModelValidationError } = cuk.pkg.model.lib

    let result = validation.validate(body, schema)
    if (result) {
      let err = new CukModelValidationError(result)
      if (result) return err
      throw err
    }
    return true
  }
}