'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']

  return (name, body, optparamsions = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) }),
        optionsSkip = _.pick(params, skips),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)
      Promise.resolve()
      .then(() =>{
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeBulkUpdate')) return
        return helper('model:getHook')(name, 'beforeBulkUpdate')(body, options)
      })
      .then(result => {
        let newBody = _.isPlainObject(result) ? (result.body || body) : body
        _.each(newBody, (b,i) => {
          _.forOwn(schema.behavior, (v, k) => {
            if (['updatedAt'].indexOf(k) > -1)
              newBody[i][v] = new Date()
          })
        })
        return dab.bulkUpdate(newBody, options)
      })
      .then(result => {
        finalResult = result
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterBulkUpdate')) return
        return helper('model:getHook')(name, 'afterBulkUpdate')(body, _.cloneDeep(result), options)
      })
      .then(result => {
        finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
        resolve(finalResult)
      })
      .catch(reject)


    })
  }
}