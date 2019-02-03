'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']
  // TODO: multisite & ownership awareness

  return (name, body, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) })
      const optionsSkip = _.pick(params, skips)
      let finalResult
      const dab = helper('model:getDab')(name)
      Promise.resolve()
        .then(() => {
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeBulkRemove')) return
          return helper('model:getHook')(name, 'beforeBulkRemove')(body, options)
        })
        .then(result => {
          let newBody = _.isPlainObject(result) ? (result.body || body) : body
          return dab.bulkRemove(newBody, options)
        })
        .then(result => {
          finalResult = result
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterBulkRemove')) return
          return helper('model:getHook')(name, 'afterBulkRemove')(body, _.cloneDeep(result), options)
        })
        .then(result => {
          finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
          resolve(finalResult)
        })
        .catch(reject)
    })
  }
}
