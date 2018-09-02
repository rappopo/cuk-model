'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const pkg = cuk.pkg.model

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
          dir = helper('core:pkgInstallDir')(c.dab, __dirname + '/..')
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
        if (! _.get(cuk.pkg[values[0]], 'cuks.model.connector.' + values[1]))
          throw helper('core:makeError')(`Unknown connector ("${c}")`)
        _.set(p, 'cuks.model.connector.' + name, c)
      })
    })
    resolve(true)
  })
}