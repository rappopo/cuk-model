'use strict'

module.exports = function(cuk) {

  return (name, hook) => {
    const names = helper('core:utilSplitPkgToken')(name)
    let fn = _.get(cuk.pkg[names[0]], `cuks.model.hook.${names[1]}.${hook}`)
    if (fn) return fn
    return (...args) => Promise.resolve(true)
  }
}