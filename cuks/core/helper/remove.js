'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, id, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(params, { collection: _.snakeCase(name) })
      let finalResult
      const dab = helper('model:getConnectorByModel')(name)
      helper('model:getHook')(name, 'beforeRemove')(id, param)
      .then(result => {
        let newId = _.isPlainObject(result) ? (result.id || id) : id
        return dab.remove(id, params)
      })
      .then(result => {
        finalResult = result
        return helper('model:getHook')(name, 'afterRemove')(id, _.cloneDeep(result), param)
      })
      .then(result => {
        finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
        resolve(result)
      })
      .catch(reject)
    })
  }
}