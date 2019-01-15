'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, params, autoCreateConnector, verbose) => {
    let names = helper('core:splitName')(name)
    let createDefConnector = false
    if (_.get(names[2], 'cuks.model.schema.' + names[1])) throw helper('core:makeError')('Name used already')
    if (!params.connector) params.connector = `model:default`
    let conn = helper('model:getConnector')(params.connector)
    if (!conn) {
      if (!autoCreateConnector) {
        throw helper('core:makeError')(`Unknown/invalid connector (${params.connector})`)
      } else if (params.connector !== `model:default`) {
        throw helper('core:makeError')(`Unknown/invalid connector (${params.connector})`)
      } else {
        conn = _.get(cuk.pkg.model, 'cuks.model.connector.default')
        if (!conn) {
          createDefConnector = true
          conn = helper('model:buildConnector')(params.connector, {
            dab: '@rappopo/dab-memory'
          })
          _.set(cuk.pkg.model, 'cuks.model.connector.default', conn)
        }
      }
    }
    params.name = `${_.snakeCase(names[0])}_${_.snakeCase(names[1])}`
    params.modelName = name
    _.each(['createdAt', 'updatedAt'], at => {
      const col = _.snakeCase(at)
      if (_.get(params, 'behavior.' + at) === true && !_.has(params.attributes, col)) {
        params.attributes[col] = 'datetime'
        _.set(params, 'behavior.' + at, col)
        _.set(params, 'indexes.' + col, true)
      }
      if (_.isString(_.get(params, 'behavior.' + at)) && _.keys(params.attributes).indexOf(params.behavior[at]) === -1) {
        params.attributes[params.behavior[at]] = 'datetime'
        _.set(params, 'indexes.' + params.behavior[at], true)
      }
    })
    const opts = process.env.REBUILD ? { rebuild: true, skipHook: 'all' } : {}
    const picks = ['name', 'attributes', 'indexes', 'order', 'srcAttribId', 'srcAttribIdType', 'srcAttribName']
    const schema = params

    return new Promise((resolve, reject) => {
      conn.createCollection(_.pick(params, picks), opts).then(result => {
        _.each(['attributes', 'order', 'indexes'], item => {
          schema[item] = conn.collection[schema.name][item]
        })
        if (verbose) names[2].trace(`Adding model ${name} dynamically`)
        _.set(names[2], 'cuks.model.schema.' + names[1], schema)
        resolve({
          schema: schema,
          createDefConnector: createDefConnector
        })
      }).catch(reject)
    })
  }
}
