'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, src, params = {}) => {
    return new Promise((resolve, reject) => {
      let options = helper('core:merge')(params, { collection: _.snakeCase(name) })
      helper('model:getDab')(name)
      .copyFrom(src, options)
      .then(result => {
        resolve(result)
      })
      .catch(reject)
    })
  }
}