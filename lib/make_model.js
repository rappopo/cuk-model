'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  const action = (opt) => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(opt.file)
      const ext = path.extname(opt.file)
      const base = path.basename(opt.file, ext)
      let schema
      let result
      let conn
      let createDefConnector = false
      helper('core:configLoad')(dir, base)
        .then(src => {
          if (_.isEmpty(src)) return {}
          result = src
          return helper('core:configExtend')(opt.pkg.id, 'model', base, 'schema')
        })
        .then(merge => {
          if (!_.isEmpty(result)) result = _.merge(result, merge)
          if (!result.connector) result.connector = `${opt.pkg.id}:default`

          conn = helper('model:getConnector')(result.connector)
          if (!conn) {
            if (result.connector !== `${opt.pkg.id}:default`) {
              throw helper('core:makeError')(`Unknown/invalid connector (${result.connector})`)
            }
            conn = _.get(opt.pkg, 'cuks.model.connector.default')
            if (!conn) {
              createDefConnector = true
              conn = helper('model:createConnector')({
                dab: '@rappopo/dab-memory'
              })
              conn.connector = result.connector
              _.set(opt.pkg, 'cuks.model.connector.default', conn)
            }
          }
          result.name = `${_.snakeCase(opt.pkg.id)}_${_.snakeCase(opt.key)}`
          result.modelName = `${opt.pkg.id}:${opt.key}`
          result.file = opt.file
          _.each(['createdAt', 'updatedAt'], at => {
            const col = _.snakeCase(at)
            if (_.get(result, 'behavior.' + at) === true && !_.has(result.attributes, col)) {
              result.attributes[col] = 'datetime'
              _.set(result, 'behavior.' + at, col)
              _.set(result, 'indexes.' + col, true)
            }
            if (_.isString(_.get(result, 'behavior.' + at)) && _.keys(result.attributes).indexOf(result.behavior[at]) === -1) {
              result.attributes[result.behavior[at]] = 'datetime'
              _.set(result, 'indexes.' + result.behavior[at], true)
            }
          })
          const params = process.env.REBUILD ? { rebuild: true, skipHook: 'all' } : {}
          const picks = ['name', 'attributes', 'indexes', 'order', 'srcAttribId', 'srcAttribIdType', 'srcAttribName']
          schema = result
          return conn.createCollection(_.pick(result, picks), params)
        })
        .then(() => {
          _.each(['attributes', 'order', 'indexes'], item => {
            schema[item] = conn.collection[schema.name][item]
          })
          helper('core:trace')('|  |  |- %s:%s => %s', opt.pkg.id, opt.key, conn.connector)
          if (createDefConnector) {
            helper('core:trace')('|  |  |  |- Auto create default connector => %s', conn.connector)
          }
          _.set(opt.pkg, 'cuks.model.schema.' + opt.key, schema)
          resolve(true)
        })
        .catch(reject)
    })
  }

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating model...')
    helper('core:bootFlatAsync')({
      pkgId: 'model',
      ext: helper('core:configFileExt')(),
      name: 'schema',
      action: action
    })
      .then(result => {
        resolve(true)
      })
  })
}
