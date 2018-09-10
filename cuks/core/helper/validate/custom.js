'use strict'

module.exports = function (cuk) {
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
