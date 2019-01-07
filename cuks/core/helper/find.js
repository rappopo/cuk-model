'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const isMultisite = require('./_is_multisite')(cuk)

  return (name, params = {}) => {
    return new Promise((resolve, reject) => {
      let options = helper('core:merge')(params, { collection: _.snakeCase(name) })
      options.query = options.query || {}
      if (isMultisite(name, options)) options.query.site = options.site
      helper('model:getDab')(name)
        .find(options)
        .then(result => {
          resolve(result)
        })
        .catch(reject)
    })
  }
}
