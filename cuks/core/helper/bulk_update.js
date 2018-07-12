'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, body, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(params, { collection: _.snakeCase(name) }),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getConnectorByModel')(name)
      helper('model:getHook')(name, 'beforeBulkUpdate')(body, param)
      .then(result => {
        let newBody = _.isPlainObject(result) ? (result.body || body) : body
        /*
        _.forOwn(schema.behavior, (v, k) => {
          if (['updatedAt'].indexOf(k) > -1)
            newBody[v] = new Date()
        })
        */
        return dab.bulkUpdate(newBody, params)
      })
      .then(result => {
        finalResult = result
        return helper('model:getHook')(name, 'afterBulkUpdate')(body, _.cloneDeep(result), param)
      })
      .then(result => {
        finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
        resolve(result)
      })
      .catch(reject)


    })
  }
}