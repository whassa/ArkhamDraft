// card data:
// pack_code
// pack_name
// type_code
        // treachery
        // investigator
        // asset
        // event
        // skill
        // enemy
        // story
        // location
// type_name
// subtype_code
// faction_code
// faction_name
// position
// exceptional
// myriad
// code
// name
// real_name
// subname
// text
// real_text
// quantity
// skill_willpower
// skill_intellect
// skill_combat
// skill_agility
// clues_fixed
// health
// health_per_investigator
// sanity
// deck_limit
// traits
// real_traits
// deck_requirements
// deck_options
// flavor
// illustrator
// is_unique
// exile
// hidden
// permanent
// double_sided
// back_text
// back_flavor
// octgn_id
// url
// imagesrc
// backimagesrc

// slot
    // Hand
    // Accessory
    // Ally
    // Hand x2
    // Arcane
    // Body
    // Tarot
// restrictions
// cost
// xp

function FilterCards(props) {
    const { investigator, cardData, cardList, upgrade } = props

    const legalSets = { 'core': 1
        ,'dwl': 1, 'tmm': 1, 'tece': 1, 'bota': 1, 'uau': 1, 'wda': 1, 'litas': 1
        ,'ptc': 1, 'eotp': 1, 'tuo': 1, 'apot': 1, 'tpm': 1, 'bsr': 1, 'dca': 1
        ,'tfa': 1, 'tof': 1, 'tbb': 1, 'hote': 1, 'tcoa': 1, 'tdoy': 1, 'sha': 1
        ,'tcu': 1, 'tsn': 1, 'wos': 1, 'fgg': 1, 'uad': 1, 'icc': 1, 'bbt': 1
        ,'tde': 1, 'sfk': 1, 'tsh': 1, 'dsm': 1, 'pnr': 1, 'wgd': 1, 'woc': 1
        ,'rtnotz': 1, 'rtdwl': 1, 'rtptc': 1 }

    const investigatorID = Object.keys(cardData)
    .filter(key => {
        return cardData[key].name === investigator
    })[0]

    const deckOptions = cardData[investigatorID].deck_options

    const filteredDeck = filterDeckForLimited(cardList, deckOptions)

    let minLevel = 0
    let maxLevel = 0

    if (upgrade) {
        minLevel = 1
        maxLevel = 5
    }
//console.log('Filter : ' + props.draftXP)
    const filteredData = cardData.filter(card => {
        if (card.type_code === 'investigator') return false
        if (card.type_code === 'story') return false
        if (card.type_code === 'location') return false
        if (card.type_code === 'enemy') return false
        if (card.type_code === 'treachery') return false
        if (card.bonded_to) return false
        // currently means weakness
        if (card.subtype_code) return false

        let xp = 0
        if (card.xp) xp = card.xp
        if (card.exceptional) xp *= 2

        if (xp < minLevel) return false
        if (xp > maxLevel) return false

//        arcane research!!!! oh no!!
//        green man medallion as well

        if (card.restrictions && card.restrictions.investigator) return false
        if (!legalSets[card.pack_code]) return false

        // this isn't right for upgrades yet
        let legal = false
        for (let i = 0; i < deckOptions.length; i++) {
            let optionLegal = false

            if (testDeckOption(card, deckOptions[i])) {
                optionLegal = true

                if (deckOptions[i].not) {
                    optionLegal = false
                }
                else if (deckOptions[i].limit) {
                    const inDeck = countDeckLimited(filteredDeck, deckOptions[i])

                    if (inDeck >= deckOptions[i].limit) optionLegal = false
                }
            }

            if (optionLegal) legal = true
        }

        if (!legal) return false

        // check to see if there's already max in the deck
        let limited = false
        
        cardList.forEach(item => {
            if (item.name === card.name) {
                if (item.count >= card.deck_limit) {
//                    console.log(card.name + ' : Over the limit')
                    limited = true
                }
            }
        })

        if (limited) return false

        return true
    })

    function filterDeckForLimited(list, options) {
        if (!list) return []

        let filteredDeck = []

        list.forEach(item => {
            let legal = false

            for (let i = 0; i < options.length; i++) {
                if (options[i].limit) continue;

                const optionLegal = testDeckOption(item, options[i])

                if (optionLegal) legal = true
            }

            if (!legal) filteredDeck.push(item)
        })

        return filteredDeck
    }

    function countDeckLimited(list, option) {
        let count = 0

        if (list) {
            list.forEach(item => {
                if (testDeckOption(item, option)) count += item.count
            })
        }

        return count
    }

    function testDeckOption(card, option) {
        let level = true
        let faction = true
        let trait = true

        if (option.faction) {
            faction = false

            for (let f = 0; f < option.faction.length; f++) {
                if (card.faction_code === option.faction[f]) {
                    faction = true
                }
                if (card.faction2_code === option.faction[f]) {
                    faction = true
                }
            }
        } 

        if (option.level) {
            level = false

            const min = option.level.min
            const max = option.level.max

            const ixp = card.xp === undefined ? 0 : card.xp

            if (ixp >= min && ixp <= max) level = true;
        }

        if (option.trait) {
            trait = false

            const cardTraits = card.traits
            
            if (cardTraits && cardTraits.search(new RegExp(option.trait, "i")) >= 0)
                trait = true
        }

        return faction && level && trait
    }

    return filteredData
}

export default FilterCards

/* odds research
            // stat test
            const setArray = [ 'core'
                ,'dwl', 'tmm', 'tece', 'bota', 'uau', 'wda', 'litas'
                ,'ptc', 'eotp', 'tuo', 'apot', 'tpm', 'bsr', 'dca'
                ,'tfa', 'tof', 'tbb', 'hote', 'tcoa', 'tdoy', 'sha'
                ,'tcu', 'tsn', 'wos', 'fgg', 'uad', 'icc', 'bbt'
                ,'tde', 'sfk', 'tsh', 'dsm', 'pnr', 'wgd', 'woc'
                ,'rtnotz', 'rtdwl', 'rtptc'
            ]

//            const assets = countCards('asset', setArray)
//            const events = countCards('event', setArray)
//            const skills = countCards('skill', setArray)

            const hand = countCards('asset', 'Hand', setArray)
            const hands2 = countCards('asset', 'Hand x2', setArray)
            const ally = countCards('asset', 'Ally', setArray)
            const accessory = countCards('asset', 'Accessory', setArray)
            const arcane = countCards('asset', 'Arcane', setArray)
            const body = countCards('asset', 'Body', setArray)
            const tarot = countCards('asset', 'Tarot', setArray)

//            console.log('Assets: ' + assets)
//            console.log('Events: ' + events)
//            console.log('Skills: ' + skills)

            console.log('Hand: ' + hand)
            console.log('Ally: ' + ally)
            console.log('Arcane: ' + arcane)
            console.log('2xHands: ' + hands2)
            console.log('Accessory: ' + accessory)
            console.log('Body: ' + body)
            conso le.log('Tarot: ' + tarot)
*/
/* odds research
    function countCards(cardType, cardSlot, sets) {
        const filteredData = cardData.filter(card => {
            // currently means weakness
            if (card.type_code !== cardType) return false
            if (card.subtype_code) return false
            if (card.slot && card.slot !== cardSlot) return false
            if (!card.slot) return false
//            if (card.xp && card.xp > 0) return false            
            if (card.restrictions && card.restrictions.investigator) return false
    //        console.log(card.slot + ' <=> ' + cardSlot + ' (' + card.name + ')')
    
            let foundSet = false
            for (let i = 0; i < sets.length; i++) {
                if (card.pack_code === sets[i]) foundSet = true
            }

            return foundSet
        })

        return filteredData.length
    }
*/

