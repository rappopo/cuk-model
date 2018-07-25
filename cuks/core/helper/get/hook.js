'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, hook) => {
    const names = helper('core:pkgTokenSplit')(name)
    let fn = _.get(cuk.pkg[names[0]], `cuks.model.hook.${names[1]}.${hook}`)
    if (fn) return fn
    return (...args) => Promise.resolve(true)
  }
}