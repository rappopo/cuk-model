'use strict'

module.exports = function(cuk) {
  const { path } = cuk.pkg.core.lib
  return Promise.resolve({
    id: 'model',
    level: 6,
    lib: {
      validation: require('@rappopo/dab/validation'),
      dabMemory: require('@rappopo/dab-memory')
    }
  })
}