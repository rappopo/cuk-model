'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return name => {
    const names = helper('core:pkgSplitToken')(name)
    return _.get(cuk.pkg[names[0]], 'cuks.model.schema.' + names[1], {})
  }
}