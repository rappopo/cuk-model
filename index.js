'use strict'

module.exports = function (cuk) {
  return Promise.resolve({
    id: 'model',
    level: 6,
    lib: {
      validation: require('@rappopo/dab/validation'),
      dabMemory: require('@rappopo/dab-memory')
    }
  })
}
