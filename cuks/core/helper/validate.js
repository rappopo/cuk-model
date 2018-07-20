'use strict'

module.exports = function(cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  return (name, ...arg) => {
    try {
      const { validator } = cuk.pkg.model.lib
      if (_.isEmpty(name)) return validator
      const keys = _.keys(validator)
      return validator[name](...arg)
    } catch(e) {
      throw helper('core:makeError')(e)
    }
  }
}