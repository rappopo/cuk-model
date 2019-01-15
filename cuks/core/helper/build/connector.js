'use strict'

module.exports = function (cuk) {
  const { _, helper, path } = cuk.pkg.core.lib

  return (name, params, verbose) => {
    let dabDir
    const names = helper('core:splitName')(name)
    if (_.get(names[2], 'cuks.model.connector.' + names[1])) throw helper('core:makeError')('Name used already')
    try {
      dabDir = helper('core:pkgInstallDir')(params.dab, cuk.dir.app)
    } catch (e) {
      const cwd = path.join(__dirname, '../../../..')
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
    const dab = new (require(dabDir))(params.opts)
    dab.connector = name
    _.set(names[2], 'cuks.model.connector.' + names[1], dab)
    if (verbose) names[2].trace(`Adding connector ${name} dynamically`)
    return dab
  }
}
