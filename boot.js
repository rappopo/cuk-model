'use strict'

module.exports = function (cuk){
  let id = 'model',
    pkg = cuk.pkg[id],
    cfg = pkg.cfg.common
  const { _, debug, helper, path, fs } = cuk.pkg.core.lib

  pkg.lib.CukModelValidationError = require('./lib/class_validation_error')(cuk)

  return new Promise((resolve, reject) => {
    require('./lib/make_connector')(cuk)
    .then(() => {
      return require('./lib/make_model')(cuk)
    })
    .then(() => {
      return require('./lib/make_hook')(cuk)
    })
    .then(() => {
      return require('./lib/make_fixture')(cuk)
    })
    .then(() => {
      resolve(true)
    })
    .catch(reject)
  })
}