function getUrl() {
  let ch1 = new URLSearchParams(window.location.search).get('ch1')
  let ch2 = new URLSearchParams(window.location.search).get('ch2')

  const inputs = document.querySelectorAll('input')
  inputs[0].value = ch1
  inputs[1].value = ch2
}

async function getChallenge(challenge) {
  const response = await fetch(`https://data.ninjakiwi.com/btd6/challenges/challenge/${challenge}`)
  const data = await response.json()
  if (!data.success) {
    return
  }
  const body = data.body

  if (body.removeableCostMultiplier === -1) body.removeableCostMultiplier = 1
  body._towers = body?._towers?.filter((x) => x?.max !== 0)
  body?._towers?.sort((a, b) => a?.tower?.toUpperCase().localeCompare(b?.tower?.toUpperCase()))

  body.allCamo = body?._bloonModifiers.allCamo
  body.allRegen = body?._bloonModifiers.allRegen
  body.bloonHealth = body?._bloonModifiers.healthMultipliers.bloons
  body.moabHealth = body?._bloonModifiers.healthMultipliers.moabs
  body.moabSpeedMultiplier = body?._bloonModifiers.moabSpeedMultiplier
  body.regrowRateMultiplier = body?._bloonModifiers.regrowRateMultiplier
  body.speedMultiplier = body?._bloonModifiers.speedMultiplier

  for (const tower of body?._towers) {
    body[tower.tower] = `${fixMax(tower.max)}(${fixTiers(tower.path1NumBlockedTiers)}-${fixTiers(tower.path2NumBlockedTiers)}-${fixTiers(tower.path3NumBlockedTiers)})`
  }

  return body
}

function clean(challenge) {
  const body = challenge

  const keysToDelete = ['name', 'createdAt', 'id', 'creator', 'gameVersion', 'mapURL', 'disableDoubleCash', 'disableInstas', 'disablePowers', 'noContinues', 'plays', 'wins', 'restarts', 'losses', 'upvotes', 'playsUnique', 'winsUnique', 'lossesUnique', '_powers', '_bloonModifiers', '_towers']

  keysToDelete.forEach((key) => delete body?.[key])

  if (body?.roundSets.length === 1 && body?.roundSets[0] === 'default') delete body?.roundSets
  if (body?._bloonModifiers) {
    delete body._bloonModifiers.bossSpeedMultiplier
    delete body._bloonModifiers.healthMultipliers?.boss
  }

  return body
}

function fixTiers(tier) {
  if (tier === -1) return 0
  return 5 - tier
}

function fixMax(max) {
  if (max === -1) return ''
  return `${max}x `
}

async function main() {
  const inputs = document.querySelectorAll('input')
  if (inputs[0].value.length < 7 || inputs[1].value.length < 7) {
    window.location = 'https://xhvsh.github.io/challenge-comparer/index.html'
    return
  }
  if (inputs[0].value.length == 7) inputs[0].value = inputs[0].value.toUpperCase()
  if (inputs[1].value.length == 7) inputs[1].value = inputs[1].value.toUpperCase()

  const [ch1, ch2] = await Promise.all([getChallenge(inputs[0].value), getChallenge(inputs[1].value)])

  if (!ch1 || !ch2) {
    window.location = 'https://xhvsh.github.io/challenge-comparer/index.html'
    return
  }

  const cleanedCh1 = clean(ch1)
  const cleanedCh2 = clean(ch2)

  if (JSON.stringify(cleanedCh1) === JSON.stringify(cleanedCh2)) {
    window.location = 'https://xhvsh.github.io/challenge-comparer/index.html'
    return
  }

  const table = document.querySelector('table')
  table.innerHTML = `
    <tr>
      <th>Difference</th>
      <th>First Challenge<br>(${inputs[0].value})</th>
      <th>Second Challenge<br>(${inputs[1].value})</th>
    </tr>
  `

  const fragment = document.createDocumentFragment()
  const ch1keys = Object.keys(cleanedCh1)
  const ch2keys = Object.keys(cleanedCh2)
  const allkeys = new Set([...ch1keys, ...ch2keys])

  for (const key of allkeys) {
    if (cleanedCh1[key] !== cleanedCh2[key]) {
      const row = document.createElement('tr')

      row.innerHTML = `
        <td>${key.replace(/([A-Z])/g, ' $1').replace('M K', 'MK')}</td>
        <td>${String(cleanedCh1[key]).replace(/([A-Z])/g, ' $1')}</td>
        <td>${String(cleanedCh2[key]).replace(/([A-Z])/g, ' $1')}</td>
      `
      fragment.appendChild(row)
    }
  }

  table.appendChild(fragment)
}

getUrl()
main()

function copy() {
  navigator.clipboard.writeText(window.location)
}
