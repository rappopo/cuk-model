'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  const action = (opt) => {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(opt.file)
      const ext = path.extname(opt.file)
      const base = path.basename(opt.file, ext)
      const defConnector = helper('core:config')('model', 'default.connector')
      let result
      helper('core:configLoad')(dir, base)
        .then(src => {
          if (_.isEmpty(src)) return {}
          result = src
          return helper('core:configExtend')(opt.pkg.id, 'model', base, 'connector')
        })
        .then(merge => {
          if (!_.isEmpty(result)) result = _.merge(result, merge)
          const name = `${opt.pkg.id}:${base}`
          const conn = helper('model:buildConnector')(name, result)
          if (result.default) {
            if (defConnector) throw helper.makeError('Default connector already assigned')
            _.set(cuk.pkg.model, 'cfg.default.connector', name)
            helper('core:trace')('|  |  |- %s:%s (%s) => Default Connector', opt.pkg.id, base, result.dab)
          } else {
            helper('core:trace')('|  |  |- %s:%s (%s)', opt.pkg.id, base, result.dab)
          }
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
}
