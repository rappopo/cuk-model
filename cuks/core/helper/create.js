'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']
  const findForUniq = require('./_find_for_uniq')(cuk)
  const isMultisite = require('./_is_multisite')(cuk)
  const isOwnershipAware = require('./_is_ownership_aware')(cuk)

  return (name, body = {}, params = {}) => {
    const { CukModelValidationError } = cuk.pkg.model.lib

    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) })
      const optionsSkip = _.pick(params, skips)
      const schema = helper('model:getSchema')(name)
      _.forOwn(schema.behavior, (v, k) => {
        delete body[v]
      })
      body.site_id = isMultisite(name, options) ? options.site : 'default'
      if (isOwnershipAware(name, options)) body.owner_id = options.owner
      let finalResult
      const dab = helper('model:getDab')(name)

      let uniques = []
      let uniquesName = []
      _.forOwn(dab.collection[options.collection].indexes, (idx, idxName) => {
        if (!idx.unique) return
        uniques.push(idx)
        uniquesName.push(idxName)
      })
      Promise.resolve()
        .then(() => {
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeValidate')) return
          return helper('model:getHook')(name, 'beforeValidate')(body, options)
        })
        .then(result => {
          if (_.isPlainObject(result) && result.body) body = result.body
          if (optionsSkip.skipValidation === 'all') return
          if (_.isArray(optionsSkip.skipValidation)) options.ignoreColumn = optionsSkip.skipValidation
          const e = dab.validateDoc(body, options)
          if (e) throw new CukModelValidationError(e.details)
          return Promise.map(uniques, u => {
            return findForUniq(dab, options.collection, body, u)
          })
        })
        .then(result => {
          if (result.length > 0) {
            let err = {}
            _.each(result, (r, i) => {
              if (r !== 0) err[uniques[i].column.join(',')] = ['uniqueContraint']
            })
            if (!_.isEmpty(err)) throw new CukModelValidationError(err)
          }
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterValidate')) return
          return helper('model:getHook')(name, 'afterValidate')(body, options)
        })
        .then(result => {
          if (_.isPlainObject(result) && result.body) body = result.body
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeCreate')) return
          return helper('model:getHook')(name, 'beforeCreate')(body, options)
        })
        .then(result => {
          if (_.isPlainObject(result) && result.body) body = result.body
          _.forOwn(schema.behavior, (v, k) => {
            if (['createdAt', 'updatedAt'].indexOf(k) > -1) body[v] = new Date()
          })
          if (isMultisite(name, options)) body.site_id = options.site
          return dab.create(body, options)
        })
        .then(result => {
          finalResult = result
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterCreate')) return
          return helper('model:getHook')(name, 'afterCreate')(body, _.cloneDeep(result), options)
        })
        .then(result => {
          finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
          resolve(finalResult)
        })
        .catch(reject)
    })
  }
}
