'use strict'

module.exports = function (cuk) {
  const { util, CukError } = cuk.pkg.core.lib

  const CukModelValidationError = function (extra, status = 406) {
    CukError.call(this, 'Validation error', { details: extra }, status)
  }
  util.inherits(CukModelValidationError, CukError)

  return CukModelValidationError

}

