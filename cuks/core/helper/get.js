'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return name => {
    return {
      dab: helper('model:getDab')(name),
      schema: helper('model:getSchema')(name),
      hook: hook => helper('model:getHook')(name, hook),
      find: params => helper('model:find')(name, params),
      findOne: (id, params) => helper('model:findOne')(name, id, params),
      create: (body, params) => helper('model:create')(name, body, params),
      update: (id, body, params) => helper('model:update')(name, id, body, params),
      remove: (id, params) => helper('model:remove')(name, id, params),
      bulkCreate: (body, params) => helper('model:bulkCreate')(name, body, params),
      bulkUpdate: (body, params) => helper('model:bulkUpdate')(name, body, params),
      bulkRemove: (body, params) => helper('model:bulkRemove')(name, body, params),
      copyFrom: (src, params) => helper('model:copyFrom')(name, src, params),
      copyTo: (dest, params) => helper('model:copyTo')(name, dest, params)
    }
  }
}