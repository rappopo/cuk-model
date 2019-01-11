'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  return (params) => {
    let dabDir
    try {
      dabDir = helper('core:pkgInstallDir')(params.dab, cuk.dir.app)
    } catch (e) {
      const cwd = path.join(__dirname, '../../..')
      try {
        dabDir = helper('core:pkgInstallDir')(params.dab, cwd)
      } catch (e) {
        throw helper('core:makeError')(`Unknown DAB connector (${params.dab}). Not installed?`)
      }
    }
    if (params.dab === '@rappopo/dab-knex' && _.get(params.opts, 'client') === 'sqlite3') {
      const fname = _.get(params.opts, 'connection.filename')
      if (path.dirname(fname) === '.') {
        _.set(params.opts, 'connection.filename', path.join(cuk.dir.data, fname))
      }
    }
    return new (require(dabDir))(params.opts)
  }
}
