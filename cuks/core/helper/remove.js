'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']
  // TODO: multisite & ownership awareness

  return (name, id, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) })
      const optionsSkip = _.pick(params, skips)
      let finalResult
      const dab = helper('model:getDab')(name)
      if (params.bulkRemove === true) params.bulkRemove = { idSeparator: ',' }
      let bulk = params.bulkRemove ? (id + '').split(params.bulkRemove.idSeparator) : false
      if (bulk && bulk.length === 1 && params.bulkRemove.forceSingle) bulk = false
      Promise.resolve()
        .then(() => {
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeRemove')) return
          return helper('model:getHook')(name, 'beforeRemove')(id, options)
        })
        .then(result => {
          if (_.isPlainObject(result) && result.id) id = result.id
          if (bulk) return true
          return helper('model:findOne')(name, id, options)
        })
        .then(result => {
          if (bulk) return dab.bulkRemove(bulk, options)
          return dab.remove(id, options)
        })
        .then(result => {
          finalResult = result
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterRemove')) return
          return helper('model:getHook')(name, 'afterRemove')(id, _.cloneDeep(result), options)
        })
        .then(result => {
          finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
          resolve(finalResult)
        })
        .catch(reject)
    })
  }
}
