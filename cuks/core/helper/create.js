'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']

  return (name, body = {}, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) }),
        optionsSkip = _.pick(params, skips),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)
      Promise.resolve()
      .then(()=> {
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeValidate')) return
        return helper('model:getHook')(name, 'beforeValidate')(body, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.body)
          body = result.body
        if (optionsSkip.skipValidation) return
        const e = dab.validateDoc(body, options)
        if (e) return reject(e)
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterValidate')) return
        return helper('model:getHook')(name, 'afterValidate')(body, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.body)
          body = result.body
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeCreate')) return
        return helper('model:getHook')(name, 'beforeCreate')(body, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.body)
          body = result.body
        _.forOwn(schema.behavior, (v, k) => {
          if (['createdAt', 'updatedAt'].indexOf(k) > -1)
            body[v] = new Date()
        })
        return dab.create(body, options)
      })
      .then(result => {
        finalResult = result
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterCreate')) return
        return helper('model:getHook')(name, 'afterCreate')(body, _.cloneDeep(result), options)
      })
      .then(result => {
        finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
        resolve(finalResult)
      })
      .catch(reject)
    })
  }
}