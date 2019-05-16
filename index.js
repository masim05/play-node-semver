const Octokit = require('@octokit/rest')
const semver = require('semver')

const {OCTOKIT_GITHUB_TOKEN} = process.env
if (!OCTOKIT_GITHUB_TOKEN) {
  exitWithMessage('No OCTOKIT_GITHUB_TOKEN env variable set, exiting.')
}

const argv = require('minimist')(process.argv.slice(2));
let owner = argv.owner
const {repo} = argv

if (!owner) {
  owner = 'plyo'
}
if (!repo) {
  exitWithMessage('No --repo option given, exiting.')
}

const octokit = new Octokit({
 auth: process.env.OCTOKIT_GITHUB_TOKEN
})

getReleasesToDiff(octokit, owner, repo).
then(function({from, to}) {
  console.log(`${from}..${to}`);
})

async function getReleasesToDiff(octokit, owner, repo) {
  try {
    const {latest, prelatest} = await getTwoLatestReleases(octokit, owner, repo)
    const from = calculateReleaseToDiffWith(latest, prelatest)
    const to = latest
    return {from, to}
  } catch(e) {
    exitWithMessage(e)
  }
}

function calculateReleaseToDiffWith(latest, prelatest) {
  const latestVer = semver.coerce(latest)
  if (!latestVer) {
    throw new Error('semver failed to parse the latest release tag, exiting.')
  }
  const prelatestVer = semver.coerce(prelatest)
  if (!prelatestVer) {
    throw new Error('semver failed to parse the latest but one release tag, exiting.')
  }
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
    exitWithMessage('Found less than 2 releases.')
  }
  semver.rsort(rs)
  const latest = rs[0]
  const prelatest = rs[1]
  return {latest, prelatest}
}

function exitWithMessage(msg, code) {
  console.error(msg)
  process.exit(code || 1)
}
