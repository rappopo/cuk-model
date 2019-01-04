'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  const action = (opt) => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(opt.file)
      const ext = path.extname(opt.file)
      const base = path.basename(opt.file, ext)
      let dabDir
      let result
      helper('core:configLoad')(dir, base)
        .then(src => {
          if (_.isEmpty(src)) return {}
          result = src
          return helper('core:configExtend')(opt.pkg.id, 'model', base, 'connector')
        })
        .then(merge => {
          if (!_.isEmpty(result)) result = _.merge(result, merge)
          helper('core:trace')('|  |  |- %s:%s (%s)', opt.pkg.id, base, result.dab)
          try {
            dabDir = helper('core:pkgInstallDir')(result.dab, path.join(__dirname, '/..'))
          } catch (e) {
            throw helper('core:makeError')(`Unknown DAB connector (${result.dab}). Not installed?`)
          }
          if (_.get(opt.pkg, 'cuks.model.connector.' + base)) return
          if (_.get(result.opts, 'client') === 'sqlite3') {
            const fname = _.get(result.opts, 'connection.filename')
            if (path.dirname(fname) === '.') {
              _.set(result.opts, 'connection.filename', path.join(cuk.dir.data, fname))
            }
          }
          const dab = new (require(dabDir))(result.opts)
          dab.connector = `${opt.pkg.id}:${base}`
          _.set(opt.pkg, 'cuks.model.connector.' + base, dab)
          resolve(true)
        })
        .catch(reject)
    })
  }

  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating connector...')
    helper('core:bootFlatAsync')({
      pkgId: 'model',
      ext: helper('core:configFileExt')(),
      name: 'connector',
      action: action
    }).then(result => {
      resolve(true)
    })
  })

  /*
  return new Promise((resolve, reject) => {
    helper('core:trace')('|  |- Creating connector...')
    _.each(helper('core:pkgs')(), p => {
      let cfg = _.get(p.cfg, 'cuks.model.connector', {})
      if (_.isEmpty(cfg)) return
      _.forOwn(cfg, (c, name) => {
        if (!c || _.isString(c)) return
        let dir
        helper('core:trace')('|  |  |- %s:%s (%s)', p.id, name, c.dab)
        try {
          dir = helper('core:pkgInstallDir')(c.dab, path.join(__dirname, '/..'))
        } catch (e) {
          throw helper('core:makeError')(`Unknown DAB connector (${c.dab}). Not installed?`)
        }
        if (_.get(p, 'cuks.model.connector.' + name)) return
        const dab = new (require(dir))(c.opts)
        dab.connector = `${p.id}:${name}`
        _.set(p, 'cuks.model.connector.' + name, dab)
      })
      _.forOwn(cfg, (c, name) => {
        if (!_.isString(c)) return
        let values = helper('core:pkgTokenSplit')(c)
        if (!_.get(cuk.pkg[values[0]], 'cuks.model.connector.' + values[1])) {
          throw helper('core:makeError')(`Unknown connector ("${c}")`)
        }
        _.set(p, 'cuks.model.connector.' + name, c)
      })
    })
    resolve(true)
  })
  */
}
