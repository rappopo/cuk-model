'use strict'

module.exports = function(cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  const action = (opt) => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(opt.file),
        ext = path.extname(opt.file),
        base = path.basename(opt.file, ext)
      let schema, conn
      helper('core:configLoad')(dir, base)
      .then(result => {
        if (!result.connector) result.connector = `${opt.pkg.id}:default`
        conn = helper('model:getConnector')(result.connector)
        if (!conn) throw helper('core:makeError')(`Unknown/invalid connector (${result.connector})`)
//        let name = _.camelCase(result.name || opt.key)
        let name = _.camelCase(opt.key)
        result.name = `${_.snakeCase(opt.pkg.id)}_${_.snakeCase(opt.key)}`
        result.modelName = `${opt.pkg.id}:${opt.key}`
        result.file = opt.file
        _.each(['createdAt', 'updatedAt'], at => {
          if (_.get(result, 'behavior.' + at) === true && !_.has(result.attributes, _.snakeCase(at))) {
            result.attributes[_.snakeCase(at)] = 'datetime'
            _.set(result, 'behavior.' + at, _.snakeCase(at))
          }
          if (_.isString(_.get(result, 'behavior.' + at)) && _.keys(result.attributes).indexOf(_.snakeCase(at)) === -1) {
            result.attributes[result.behavior[at]] = 'datetime'
          }
        })
        const params = process.env.REBUILD ? { skipHook: 'all' } : {}
        const picks = ['name', 'attributes', 'indexes', 'order', 'srcAttribId', 'srcAttribIdType', 'srcAttribName']
        schema = result
        return conn.createCollection(_.pick(result, picks), params)
      })
      .then(() => {
        _.each(['attributes', 'order', 'indexes'], item => {
          schema[item] = conn.collection[schema.name][item]
        })
//        helper('core:dump')(schema)
        helper('core:trace')('|  |  |- %s:%s => %s', opt.pkg.id, opt.key, conn.connector)
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