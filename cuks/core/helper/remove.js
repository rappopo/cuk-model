'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']

  return (name, id, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) }),
        optionsSkip = _.pick(params, skips)
      let finalResult
      const dab = helper('model:getDab')(name)
      Promise.resolve()
      .then(() => {
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeRemove')) return
        return helper('model:getHook')(name, 'beforeRemove')(id, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.id)
          id = result.id
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