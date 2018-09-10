'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, hook) => {
    const names = helper('core:pkgTokenSplit')(name)
    const arr = _.get(cuk.pkg[names[0]], `cuks.model.hook.${names[1]}.${hook}`)
    if (!arr) return (...args) => Promise.resolve(true)
    return (...args) => {
      let proms = []
      _.each(arr, a => {
        proms.push(a(...args))
      })
      return new Promise((resolve, reject) => {
        let result = {}
        Promise.all(proms)
          .then(results => {
            _.each(results, r => {
              if (_.isPlainObject(r)) result = _.merge(result, r)
            })
            resolve(_.isEmpty(result) ? true : result)
          })
          .catch(reject)
      })
    }
  }
}
