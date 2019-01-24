'use strict'

const DabMemory = require('@rappopo/dab-memory')
module.exports = function (cuk) {
  return Promise.resolve({
    id: 'model',
    level: 6,
    lib: {
      validation: require('@rappopo/dab/validation'),
      DabMemory: DabMemory,
      dabMemory: new DabMemory()
    }
  })
}
