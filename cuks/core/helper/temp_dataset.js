'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const { dabMemory } = cuk.pkg.model.lib

  // TODO: query should NOT be bound by ctx/rest-way
  return (schema = {}, data = [], ctx) => {
    return new Promise((resolve, reject) => {
      let finalResult
      dabMemory.createCollection(schema).then(() => {
        return dabMemory.bulkCreate(data, { collection: schema.name })
      }).then(() => {
        return dabMemory.find(_.merge(helper('rest:prepQuery')(ctx), { collection: schema.name }))
      }).then(result => {
        finalResult = result
        return dabMemory.removeCollection(schema.name)
      }).then(() => {
        resolve(finalResult)
      }).catch(reject)
    })
  }
}
