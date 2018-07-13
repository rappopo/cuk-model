'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, body, optparamsions = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(params, { collection: _.snakeCase(name) }),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)
      helper('model:getHook')(name, 'beforeBulkUpdate')(body, options)
      .then(result => {
        let newBody = _.isPlainObject(result) ? (result.body || body) : body
        /*
        _.forOwn(schema.behavior, (v, k) => {
          if (['updatedAt'].indexOf(k) > -1)
            newBody[v] = new Date()
        })
        */
        return dab.bulkUpdate(newBody, options)
      })
      .then(result => {
        finalResult = result
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