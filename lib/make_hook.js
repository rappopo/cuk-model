'use strict'

module.exports = function(cuk) {
  const { _, helper, globby, path } = cuk.pkg.core.lib

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating hook...')
    _.each(helper('core:pkgs')(), p => {
      const schema = _.get(p, 'cuks.model.schema')
      if (_.isEmpty(schema)) return
      _.forOwn(schema, (s, k) => {
        const dir = path.join(path.dirname(s.file), '..', 'hook')
        const baseName = path.basename(s.file, path.extname(s.file))
        const files = globby.sync([
          `${dir}/before/${baseName}_*.js`,
          `${dir}/after/${baseName}_*.js`
        ], {
          ignore: [
            dir + '/before/_*',
            dir + '/after/_*'
          ]
        })
        _.each(files, f => {
          const bhook = _.last(path.dirname(f).split(path.sep)),
            ahook = path.basename(f, '.js').replace(baseName + '_', ''),
            hook = _.camelCase(`${bhook} ${ahook}`)
          if (['create', 'update', 'remove', 'bulk_create', 'bulk_update', 'bulk_remove'].indexOf(ahook) === -1) return
          let key = _.camelCase(baseName) + '.' + hook
          helper('core:trace')('|  |  |- %s:%s', p.id, key.replace('.', ' ⇒ '))
          _.set(p, 'cuks.model.hook.' + key, require(f)(cuk))
        })
      })
    })
    resolve(true)
  })

}