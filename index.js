const Octokit = require('@octokit/rest')
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
//console.log(sorted);

const octokit = new Octokit({
 auth: process.env.GREN_GITHUB_TOKEN
})
const owner = 'plyo'
const repo = 'plyo.web'

getReleasesToDiff(octokit, owner, repo).
then(function({from, to}) {
  console.log({from, to});
})

async function getReleasesToDiff(octokit, owner, repo) {
  const res = await getTwoLatestReleases(octokit, owner, repo)
  const latest = res[0]
  const prelatest = res[1]
  const from = calculateReleaseToDiffWith(latest, prelatest)
  const to = latest
  return {from, to}
}

function calculateReleaseToDiffWith(latest, prelatest) {
  const latestVer = semver.coerce(latest)
  const prelatestVer = semver.coerce(prelatest)
  if (latestVer.major != prelatestVer.major) {
    // major release
    return `v${prelatestVer.major}.${prelatestVer.minor}.0`
  } else if (latestVer.minor != prelatestVer.minor) {
    // minor release
    return `v${prelatestVer.major}.${prelatestVer.minor}.0`
  } else if (latestVer.patch != prelatestVer.patch) {
    // patch release or prerelease
    return `v${prelatestVer.major}.${prelatestVer.minor}.${prelatestVer.patch}`
  }
}

async function getTwoLatestReleases(octokit, owner, repo) {
  const res = await octokit.repos.listReleases({
    owner,
    repo
  })
  const rs = res.data.map(function (r) {return r.name})
  if (rs.length < 2) {
    console.log('Found less than 2 releases.')
    process.exit(1);
  }
  semver.rsort(rs)
  const latest = rs[0]
  const prelatest = rs[1]
  return [latest, prelatest]
}
