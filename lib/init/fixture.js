'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  const rebuild = name => {
    const cfg = helper('core:config')('model')
    return new Promise((resolve, reject) => {
      const schema = helper('model:getSchema')(name)
      const ext = path.extname(schema.file)
      const baseName = path.basename(schema.file, ext)
      const dir = path.join(path.dirname(schema.file), '..', 'fixture')
      let src
      helper('core:configLoad')(dir, baseName)
        .then(result => {
          const pkgId = name.split(':')[0]
          src = result
          const pkgs = _.filter(helper('core:pkgs')(), p => p.id !== pkgId)
          return Promise.map(pkgs, p => {
            const dirMerge = path.join(p.dir, 'cuks', pkgId, 'extend', 'model', 'fixture')
            return helper('core:configLoad')(dirMerge, baseName)
          })
        })
        .then(merge => {
          let result = _.cloneDeep(src)
          _.each(merge, m => {
            if (_.isEmpty(m)) return
            result = _.concat(result, m)
          })
          return result
        })
        .then(result => {
          if (_.isEmpty(result)) return false
          let opts = { skipHook: { all: cfg.skipAllHooks } }
          const idCol = helper('model:getIdColumn')(name)
          _.each(result, (r, i) => {
            if (_.has(r, '_id') && (idCol !== '_id')) {
              r[idCol] = r._id
              delete r._id
            }
          })
          if (cfg.bulkOnRebuild) return helper('model:bulkCreate')(name, result, opts)
          return Promise.mapSeries(result, r => {
            return helper('model:create')(name, r, opts)
          })
        })
        .then(result => {
          if (!result) return resolve(true)
          if (cfg.bulkOnRebuild) {
            helper('core:trace')('|  |  |- %s => OK: %s, FAIL: %s', name, result.stat.ok, result.stat.fail)
          } else {
            helper('core:trace')('|  |  |- %s => %d record(s)', name, result.length)
          }
          resolve(true)
        })
        .catch(reject)
    })
  }

  return new Promise((resolve, reject) => {
    if (!process.env.REBUILD) return resolve(true)
    helper('core:trace')('|  |- Loading fixture...')
    let schemas = []
    _.each(helper('core:pkgs')(), p => {
      _.forOwn(_.get(p.cuks, 'model.schema', {}), (v, k) => {
        schemas.push(`${p.id}:${k}`)
      })
    })
    Promise.map(schemas, s => {
      return rebuild(s)
    })
      .then(() => {
        resolve(true)
      })
  })
}
