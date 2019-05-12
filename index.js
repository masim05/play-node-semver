const semver = require('semver')

const list  = [
  'v1.0.0',
  'v1.0.1-beta.0',
  'v1.0.1-alpha.1',
  'v1.0.1',
  'v1.0.1-alpha.0',
  'v1.0.2',
  'v1.1.1',
  'v1.0.1-rc.0',
  'v2.0.0',
  'v1.1.0',
]
const sorted = semver.sort(list)
/*
 * should print
  [ 'v1.0.0',
  'v1.0.1-alpha.0',
  'v1.0.1-alpha.1',
  'v1.0.1-beta.0',
  'v1.0.1-rc.0',
  'v1.0.1',
  'v1.0.2',
  'v1.1.0',
  'v1.1.1',
  'v2.0.0' ]
  */
console.log(sorted);
