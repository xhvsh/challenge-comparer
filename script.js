async function fetchChallenge(challenge) {
  const response = await fetch(`https://data.ninjakiwi.com/btd6/challenges/challenge/${challenge}`)
  const data = await response.json()
  if (!data.success) {
    return
  }
  const body = data.body
  if (body.removeableCostMultiplier === -1) body.removeableCostMultiplier = 1
  body._towers = body?._towers?.filter((x) => x?.max !== 0)
  body?._towers?.sort((a, b) => (a?.tower?.toUpperCase() < b?.tower?.toUpperCase() ? -1 : a?.tower?.toUpperCase() > b?.tower?.toUpperCase() ? 1 : 0))

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

function cleanChallenge(challenge) {
  const body = challenge
  delete body?.name
  delete body?.createdAt
  delete body?.id
  delete body?.creator
  delete body?.gameVersion
  delete body?.mapURL
  delete body?.disableDoubleCash
  delete body?.disableInstas
  delete body?.disablePowers
  if (body?.roundSets.length === 1 && body?.roundSets[0] === 'default') delete body?.roundSets
  delete body?.noContinues
  delete body?.plays
  delete body?.wins
  delete body?.restarts
  delete body?.losses
  delete body?.upvotes
  delete body?.playsUnique
  delete body?.winsUnique
  delete body?.lossesUnique
  delete body?._powers
  delete body?._bloonModifiers?.bossSpeedMultiplier
  delete body?._bloonModifiers?.healthMultipliers?.boss
  delete body?._bloonModifiers
  delete body?._towers
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
  if (document.querySelectorAll('input')[0].value.length < 7 || document.querySelectorAll('input')[1].value.length < 7) {
    document.querySelector('.changes').classList.add('hidden')
    document.querySelector('.error').classList.remove('hidden')
    document.querySelector('.error').innerHTML = 'You need to enter two valid codes!'
    return
  }
  const challenge1 = cleanChallenge(await fetchChallenge(document.querySelectorAll('input')[0].value))
  const challenge2 = cleanChallenge(await fetchChallenge(document.querySelectorAll('input')[1].value))
  if (!challenge1 || !challenge2) {
    document.querySelector('.changes').classList.add('hidden')
    document.querySelector('.error').classList.remove('hidden')
    document.querySelector('.error').innerHTML = 'You need to enter two valid codes!'
    return
  }
  if (JSON.stringify(challenge1) === JSON.stringify(challenge2)) {
    document.querySelector('.changes').classList.add('hidden')
    document.querySelector('.error').classList.remove('hidden')
    document.querySelector('.error').innerHTML = 'No difference found!'
  } else {
    const challenge1Keys = Object.keys(challenge1)
    const challenge2Keys = Object.keys(challenge2)
    const keys = new Set([...challenge1Keys, ...challenge2Keys])
    for (const key of keys) {
      if (challenge1[key] !== challenge2[key]) {
        document.querySelector('.error').classList.add('hidden')
        document.querySelector('.changes').classList.remove('hidden')
        const p = document.createElement('p')
        const node = document.createTextNode(`${key}: ${challenge1[key]} vs ${challenge2[key]}\n`)
        p.appendChild(node)
        document.querySelector('.changes').appendChild(p)
      }
    }
  }
}
