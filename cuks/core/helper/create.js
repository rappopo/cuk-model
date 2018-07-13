'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, body = {}, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(params, { collection: _.snakeCase(name) }),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)
      helper('model:getHook')(name, 'beforeValidate')(body, options)
      .then(result => {
        const e = dab.validateDoc(body, options)
        if (e) return reject(e)
        return helper('model:getHook')(name, 'afterValidate')(body, options)
      })
      .then(result => {
        return helper('model:getHook')(name, 'beforeCreate')(body, options)
      })
      .then(result => {
        let newBody = _.isPlainObject(result) ? (result.body || body) : body
        _.forOwn(schema.behavior, (v, k) => {
          if (['createdAt', 'updatedAt'].indexOf(k) > -1)
            newBody[v] = new Date()
        })
        return dab.create(newBody, options)
      })
      .then(result => {
        finalResult = result
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