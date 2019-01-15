'use strict'

module.exports = function (cuk) {
  const { _, helper, globby, path, fs } = cuk.pkg.core.lib

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating hook...')
    const pkgs = helper('core:pkgs')()
    _.each(pkgs, p => {
      const schema = _.get(p, 'cuks.model.schema')
      if (_.isEmpty(schema)) return
      _.forOwn(schema, (s, k) => {
        const dir = path.join(path.dirname(s.file), '..', 'hook')
        const baseName = path.basename(s.file, path.extname(s.file))
        const patterns = [
          `${dir}/before/${baseName}_*.js`,
          `${dir}/after/${baseName}_*.js`
        ]
        const patternsIgn = [
          dir + '/before/_*',
          dir + '/after/_*'
        ]
        _.each(pkgs, p1 => {
          if (p1.id === p.id) return undefined
          const dirExt = path.join(p1.dir, 'cuks', p.id, 'extend', 'model', 'hook')
          if (!fs.existsSync(dirExt)) return undefined
          patterns.push(`${dirExt}/before/${baseName}_*.js`, `${dirExt}/after/${baseName}_*.js`)
          patternsIgn.push(dirExt + '/before/_*', dirExt + '/after/_*')
        })
        const files = globby.sync(patterns, {
          ignore: patternsIgn
        })
        _.each(files, f => {
          const bhook = _.last(path.dirname(f).split(path.sep))
          const ahook = path.basename(f, '.js').replace(baseName + '_', '')
          const hook = _.camelCase(`${bhook} ${ahook}`)
          if (['create', 'update', 'remove', 'bulk_create', 'bulk_update', 'bulk_remove'].indexOf(ahook) === -1) return
          const key = _.camelCase(baseName) + '.' + hook
          if (f.indexOf(path.sep + 'extend' + path.sep) > -1) {
            const parts = f.split(path.sep)
            let ext = parts.slice(0, parts.indexOf('cuks'))
            ext = _.find(pkgs, { dir: ext.join(path.sep) })
            helper('core:trace')('|  |  |- %s:%s', p.id, key.replace('.', ` ⇒ extendedBy:${ext.id} → `))
          } else {
            helper('core:trace')('|  |  |- %s:%s', p.id, key.replace('.', ' ⇒ '))
          }
          const actions = _.get(p, `cuks.model.hook.${key}`, [])
          actions.push(require(f)(cuk))
          _.set(p, `cuks.model.hook.${key}`, actions)
        })
      })
    })
    resolve(true)
  })
}
