'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const skips = ['skipHook', 'skipValidation']
  const findForUniq = require('./_find_for_uniq')(cuk)

  return (name, body = {}, params = {}) => {
    return new Promise((resolve, reject) => {
      const options = helper('core:merge')(_.omit(params, skips), { collection: _.snakeCase(name) }),
        optionsSkip = _.pick(params, skips),
        schema = helper('model:getSchema')(name)
      let finalResult
      const dab = helper('model:getDab')(name)

      let uniques = [], uniquesName = []
      _.forOwn(dab.collection[options.collection].indexes, (idx, idxName) => {
        if (!idx.unique) return
        uniques.push(idx)
        uniquesName.push(idxName)
      })

      Promise.resolve()
      .then(()=> {
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeValidate')) return
        return helper('model:getHook')(name, 'beforeValidate')(body, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.body)
          body = result.body
        if (optionsSkip.skipValidation) return
        const e = dab.validateDoc(body, options)
        if (e) throw helper('core:makeError')(e)
        return Promise.map(uniques, u => {
          return findForUniq(dab, options.collection, body, u)
        })
      })
      .then(result => {
        if (result.length > 0) {
          let err = []
          _.each(result, (r, i) => {
            if (r !== 0) err.push(uniquesName[i])
          })
          if (err.length > 0) throw helper('core:makeError')({
            msg: 'Unique constraint failed: ' + err.join(','),
            status: 406
          })
        }
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.afterValidate')) return
        return helper('model:getHook')(name, 'afterValidate')(body, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.body)
          body = result.body
        if (_.get(optionsSkip, 'skipHook.all') || _.get(optionsSkip, 'skipHook.beforeCreate')) return
        return helper('model:getHook')(name, 'beforeCreate')(body, options)
      })
      .then(result => {
        if (_.isPlainObject(result) && result.body)
          body = result.body
        _.forOwn(schema.behavior, (v, k) => {
          if (['createdAt', 'updatedAt'].indexOf(k) > -1)
            body[v] = new Date()
        })
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