async function getChallenge(challenge) {
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

function clean(challenge) {
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
    alert('Enter two valid codes please.')
    return
  }

  const ch1 = clean(await getChallenge(document.querySelectorAll('input')[0].value))
  const ch2 = clean(await getChallenge(document.querySelectorAll('input')[1].value))

  if (!ch1 || !ch2) {
    alert('Enter two valid codes please.')
    return
  }

  if (JSON.stringify(ch1) === JSON.stringify(ch2)) {
    alert('There are no differences in this challenges.')
  } else {
    document.querySelector('table').innerHTML = `
    <tr>
      <th>Difference</th>
      <th>First Challenge</th>
      <th>Second Challenge</th>
    </tr>
    `
    document.querySelector('.content').classList.add('hidden')
    document.querySelector('.differences').classList.remove('hidden')
    const ch1keys = Object.keys(ch1)
    const ch2keys = Object.keys(ch2)
    const allkeys = new Set([...ch1keys, ...ch2keys])

    for (const key of allkeys) {
      if (ch1[key] !== ch2[key]) {
        document.querySelector('table').innerHTML += `
          <tr>
            <td>${key}</td>
            <td>${ch1[key]}</td>
            <td>${ch2[key]}</td>
          </tr>
        `
      }
    }
  }
}

document.querySelector('.goback').addEventListener('click', () => {
  document.querySelector('.content').classList.remove('hidden')
  document.querySelector('.differences').classList.add('hidden')
  document.querySelectorAll('tr').forEach((e) => {
    e.remove
  })
  document.querySelectorAll('input').forEach((e) => {
    e.value = ''
  })
})
