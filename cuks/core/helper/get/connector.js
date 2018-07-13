'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return function(name, follow = true) {
    let names = helper('core:utilSplitPkgToken')(name, 'Invalid model connector (%s)')
    let conn = _.get(cuk.pkg[names[0]], `cuks.model.connector.${names[1]}`)
    if (!conn) return
    if (follow && _.isString(conn))
      conn = helper('model:getConnector')(conn, follow)
    return conn
  }

}