'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  // TODO: multisite & ownership awareness

  return (name, dest, params = {}) => {
    return new Promise((resolve, reject) => {
      let options = helper('core:merge')(params, { collection: _.snakeCase(name) })
      helper('model:getDab')(name)
        .copyTo(dest, options)
        .then(result => {
          resolve(result)
        })
        .catch(reject)
    })
  }
}
