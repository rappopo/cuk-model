'use strict'

module.exports = function(cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  const action = (opt) => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(opt.file),
        ext = path.extname(opt.file),
        base = path.basename(opt.file, ext)
      helper('core:configLoad')(dir, base)
      .then(result => {
        if (!result.connector) result.connector = `${opt.pkg.id}:default`
        let conn = helper('model:getConnector')(result.connector)
        if (!conn) return reject(helper('core:makeError')(`Unknown/invalid connector (${result.connector})`))
//        let name = _.camelCase(result.name || opt.key)
        let name = _.camelCase(opt.key)
        result.name = _.snakeCase(`${opt.pkg.id}:${name}`)
        conn.createCollection(_.omit(result, ['connector']))
        helper('core:bootTrace')('|  |  |- %s:%s => %s', opt.pkg.id, name, conn.connector)
        _.set(opt.pkg, 'cuks.model.schema.' + name, result)
        resolve(true)
      })
    })
  }

  return new Promise((resolve, reject) => {
    helper('core:bootTrace')('|  |- Creating model...')
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