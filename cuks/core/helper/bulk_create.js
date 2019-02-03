'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']
  // TODO: multisite & ownership awareness

  return (name, body, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) })
      const optionsSkip = _.pick(params, skips)
      const schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)
      Promise.resolve()
        .then(() => {
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeBulkCreate')) return
          return helper('model:getHook')(name, 'beforeBulkCreate')(body, options)
        })
        .then(result => {
          let newBody = _.isPlainObject(result) ? (result.body || body) : body
          _.each(newBody, (b, i) => {
            _.forOwn(schema.behavior, (v, k) => {
              if (['createdAt', 'updatedAt'].indexOf(k) > -1) newBody[i][v] = new Date()
            })
          })
          return dab.bulkCreate(newBody, options)
        })
        .then(result => {
          finalResult = result
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterBulkCreate')) return
          return helper('model:getHook')(name, 'afterBulkCreate')(body, _.cloneDeep(result), options)
        })
        .then(result => {
          finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
          resolve(finalResult)
        })
        .catch(reject)
    })
  }
}
