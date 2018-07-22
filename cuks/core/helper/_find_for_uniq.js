'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (dab, collection, body, index, limit = 2) => { // set for more than 1
    return new Promise((resolve, reject) => {
      let query = {}
      _.each(index.column, c => {
        query[c] = body[c]
      })
      dab.find({ query: query, limit: limit, collection: collection })
      .then(result => {
        resolve(result.data.length)
      })
      .catch(e => {
        resolve(-1)
      })
    })
  }

}


