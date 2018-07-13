'use strict'

module.exports = function(cuk) {
  const { _, helper, globby, path } = cuk.pkg.core.lib

  return new Promise((resolve, reject) => {
    helper('core:bootTrace')('|  |- Creating hook...')
    _.each(helper('core:pkgs')(), p => {
      const schema = _.get(p, 'cuks.model.schema')
      if (_.isEmpty(schema)) return
      const dir = path.join(p.dir, 'cuks', 'model', 'hook')
      const files = globby.sync([
        dir + '/before/*.js',
        dir + '/after/*.js'
      ], {
        ignore: [
          dir + '/before/_*',
          dir + '/after/_*'
        ]
      })
      _.each(files, f => {
        const mod = require(f)(cuk)
        if (!_.isPlainObject(mod)) return
        let parts = f.replace(dir + path.sep, '').replace('.js', '').split('/')
        _.forOwn(mod, (v, k) => {
          if (['create', 'update', 'remove', 'bulkCreate', 'bulkUpdate', 'bulkRemove'].indexOf(k) === -1) return
          let key = _.camelCase(parts[1]) + '.' + _.camelCase(`${parts[0]} ${k}`)
          helper('core:bootTrace')('|  |  |- %s:%s', p.id, key.replace('.', ' ⇒ '))
          _.set(p, 'cuks.model.hook.' + key, v)
        })
      })
    })
    resolve(true)
  })

}