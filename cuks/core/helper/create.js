'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, body = {}, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(params, { collection: _.snakeCase(name) }),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getConnectorByModel')(name)
      helper('model:getHook')(name, 'beforeValidate')(body, param)
      .then(result => {
        const e = dab.validateDoc(body, params)
        if (e) return reject(e)
        return helper('model:getHook')(name, 'afterValidate')(body, param)
      })
      .then(result => {
        return helper('model:getHook')(name, 'beforeCreate')(body, param)
      })
      .then(result => {
        let newBody = _.isPlainObject(result) ? (result.body || body) : body
        _.forOwn(schema.behavior, (v, k) => {
          if (['createdAt', 'updatedAt'].indexOf(k) > -1)
            newBody[v] = new Date()
        })
        return dab.create(newBody, params)
      })
      .then(result => {
        finalResult = result
        return helper('model:getHook')(name, 'afterCreate')(body, _.cloneDeep(result), param)
      })
      .then(result => {
        finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
        resolve(result)
      })
      .catch(reject)
    })
  }
}