'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const isMultisite = require('./_is_multisite')(cuk)

  return (name, id, params = {}) => {
    return new Promise((resolve, reject) => {
      const idCol = helper('model:getIdColumn')(name)
      let options = helper('core:merge')(params, { collection: _.snakeCase(name) })
      if (isMultisite(name, options)) {
        options.query = { site: options.site }
        options.query[idCol] = id
        helper('model:getDab')(name)
          .find(options)
          .then(result => {
            if (result.data.length === 0) reject(helper('core:makeError')({ status: 404, msg: 'Record not found' }))
            resolve({
              success: true,
              data: result.data[0]
            })
          })
          .catch(reject)
      } else {
        helper('model:getDab')(name)
          .findOne(id, options)
          .then(result => {
            resolve(result)
          })
          .catch(reject)
      }
    })
  }
}
