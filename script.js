setInterval(() => {
  if (window.location == 'xhvsh.github.io/challenge-comparer/' || 'https://xhvsh.github.io/challenge-comparer/' || 'xhvsh.github.io/challenge-comparer' || 'https://xhvsh.github.io/challenge-comparer') {
    window.location == `https://xhvsh.github.io/challenge-comparer/index.html`
  }
}, 100)

let popupOpen = false
function toast(str) {
  if (!popupOpen) {
    popupOpen = true
    document.querySelector('.toast').classList.remove('hidden')
    document.querySelector('.msg').innerHTML = str
    setTimeout(() => {
      document.querySelector('.toast').classList.add('hidden')
      popupOpen = false
    }, 5000)
  } else {
    return
  }
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
    toast('Enter two valid codes please.')
    return
  }
  if (inputs[0].value.length == 7) inputs[0].value = inputs[0].value.toUpperCase()
  if (inputs[1].value.length == 7) inputs[1].value = inputs[1].value.toUpperCase()

  const [ch1, ch2] = await Promise.all([getChallenge(inputs[0].value), getChallenge(inputs[1].value)])

  if (!ch1 || !ch2) {
    toast('Enter two valid codes please.')
    return
  }

  const cleanedCh1 = clean(ch1)
  const cleanedCh2 = clean(ch2)

  if (JSON.stringify(cleanedCh1) === JSON.stringify(cleanedCh2)) {
    toast('There are no differences in this challenges.')
    return
  }
  let link = window.location.href.replace(/index.html/g, 'challenge.html')
  let newlink = `${link}?ch1=${inputs[0].value.trim()}&ch2=${inputs[1].value.trim()}`
  window.location = newlink
}
