'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']
  const findForUniq = require('./_find_for_uniq')(cuk)

  return (name, id, body = {}, params = {}) => {
    const { CukModelValidationError } = cuk.pkg.model.lib
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) })
      const optionsSkip = _.pick(params, skips)
      const schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)

      let uniques = []
      let uniquesName = []
      let excludeUpdate = _.get(schema, 'exclude.update', [])
      body = _.omit(body, excludeUpdate)
      _.forOwn(dab.collection[options.collection].indexes, (idx, idxName) => {
        if (!idx.unique) return
        const isec = _.intersection(_.keys(body), idx.column)
        if (!_.isEqual(isec.sort(), idx.column.sort())) return
        uniques.push(idx)
        uniquesName.push(idxName)
      })

      Promise.resolve()
        .then(() => {
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeValidate')) return
          return helper('model:getHook')(name, 'beforeValidate')(body, options)
        })
        .then(result => {
          if (_.isPlainObject(result) && result.body) body = _.omit(result.body, excludeUpdate)
          if (optionsSkip.skipValidation) return
          let keys = _.keys(schema.attributes)
          let bodyKeys = _.keys(body)
          let ignoreColumn = _.without(keys, ...bodyKeys)
          const e = dab.validateDoc(body, _.merge(options, { ignoreColumn: ignoreColumn }))

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
          if (_.isPlainObject(result) && result.body) body = _.omit(result.body, excludeUpdate)
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeUpdate')) return
          return helper('model:getHook')(name, 'beforeUpdate')(id, body, options)
        })
        .then(result => {
          let excludeFullReplace = _.get(schema, 'exclude.fullReplace', [])
          if (_.isPlainObject(result) && result.body) body = _.omit(result.body, excludeUpdate)
          _.forOwn(schema.behavior, (v, k) => {
            if (['updatedAt'].indexOf(k) > -1) {
              body[v] = new Date()
              excludeFullReplace.push(v)
            }
            if (['createdAt'].indexOf(k) > -1) {
              excludeFullReplace.push(v)
            }
          })
          excludeFullReplace = _.uniq(excludeFullReplace)
          return dab.update(id, body, helper('core:merge')(options, { fullReplaceExclude: excludeFullReplace }))
        })
        .then(result => {
          finalResult = result
          if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterUpdate')) return
          return helper('model:getHook')(name, 'afterUpdate')(id, body, _.cloneDeep(result), options)
        })
        .then(result => {
          finalResult = _.isPlainObject(result) ? (result.result || finalResult) : finalResult
          resolve(finalResult)
        })
        .catch(reject)
    })
  }
}
