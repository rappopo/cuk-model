'use strict'

module.exports = function (cuk) {
  const pkg = cuk.pkg.model

  pkg.lib.CukModelValidationError = require('./lib/class_validation_error')(cuk)

  return new Promise((resolve, reject) => {
    require('./lib/init/connector')(cuk)
      .then(() => {
        return require('./lib/init/schema')(cuk)
      })
      .then(() => {
        return require('./lib/init/hook')(cuk)
      })
      .then(() => {
        return require('./lib/init/fixture')(cuk)
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}
