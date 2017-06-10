import React from 'react';

import SPELLS from 'common/SPELLS';

export default {
  descriptions: {
    [SPELLS.THE_PENITENT_TALENT.id]: <span>Penance may be cast on a friendly target, healing them for [(300% of Spell power) * 3] over 2 sec.</span>,
    [SPELLS.CASTIGATION_TALENT.id]: <span>Penance fires one additional bolt of holy light over its duration.</span>,
    [SPELLS.SCHISM_TALENT.id]: <span>Attack the enemy's soul with a surge of Shadow energy, dealing (425% of Spell power) Shadow damage and increasing damage that you deal to the target by 30% for 6 sec.</span>,
    [SPELLS.ANGELIC_FEATHER_TALENT.id]: <span>Places a feather at the target location, granting the first ally to walk through it 40% increased movement speed for 5 sec. Only 3 feathers can be placed at one time.  Maximum 3 charges.</span>,
    [SPELLS.BODY_AND_SOUL_TALENT.id]: <span>Power Word: Shield  Shadowincreases Disciplineand Leap of Faith increase your target's movement speed by 40% for 3 sec.</span>,
    [SPELLS.MASOCHISM_TALENT.id]: <span>When you cast Shadow Mend on yourself, its damage over time effect heals you instead, and reduces all damage you take by 10%.</span>,
    [SPELLS.SHINING_FORCE_TALENT.id]: <span>Creates a burst of light around a friendly target, knocking away nearby enemies and slowing their movement speed by 70% for 3 sec.3 seconds remaining</span>,
    [SPELLS.PSYCHIC_VOICE_TALENT.id]: <span>Reduces the cooldown of Psychic Scream by 30 sec.</span>,
    [SPELLS.DOMINANT_MIND_TALENT.id]: <span>You may also control your own character while Mind Control is active, but Mind Control has a 2 min cooldown, and it may not be used against players.</span>,
    [SPELLS.POWER_WORD_SOLACE_TALENT.id]: <span>Strikes an enemy with heavenly power, dealing (300% of Spell power) Holy damage and restoring 1.00% of your maximum mana.</span>,
    [SPELLS.SHIELD_DISCIPLINE_TALENT.id]: <span>When your Power Word: Shield is completely absorbed you instantly regenerate 1% of your maximum mana.</span>,
    [SPELLS.MINDBENDER_TALENT.id]: <span>Summons a Mindbender to attack the target for 12 sec. You regenerate 0.50% of maximum mana each time the Mindbender attacks.</span>,
    [SPELLS.CONTRITION_TALENT.id]: <span>Increases Atonement duration by 3 sec.</span>,
    [SPELLS.POWER_INFUSION_TALENT.id]: <span>Infuses you with power for 20 sec, increasing haste by 25% Shadowand increasing Insanity generation by 25% Disciplineand reducing the mana cost of all spells by 20%20 seconds remaining</span>,
    [SPELLS.TWIST_OF_FATE_TALENT.id]: <span>After  Shadowdamaging Disciplinehealing a target below 35% health, you deal 20% increased damage and 20% increased healing for 10 sec.</span>,
    [SPELLS.CLARITY_OF_WILL_TALENT.id]: <span>Shields the target with a protective ward for 20 sec, absorbing [Spell power * 9 * (1 + Versatility)] damage.20 seconds remaining</span>,
    [SPELLS.DIVINE_STAR_TALENT.id]: <span>Throw a Divine Star forward 24 yds, healing allies in its path for (90% of Spell power) and dealing (145% of Spell power) Holy damage to enemies. After reaching its destination, the Divine Star returns to you, healing allies and damaging enemies in its path again.</span>,
    [SPELLS.HALO_TALENT.id]: <span>Creates a ring of Holy energy around you that quickly expands to a 30 yd radius, healing allies for (287.4% of Spell power) and dealing (431.1% of Spell power) Holy damage to enemies.</span>,
    [SPELLS.PURGE_THE_WICKED_TALENT.id]: <span>Cleanses the target with fire, causing (100% of Spell power) Fire damage and an additional (480% of Spell power) Fire damage over 20 sec. Spreads to an additional nearby enemy when you cast Penance on the target.</span>,
    [SPELLS.GRACE_TALENT.id]: <span>Increases your non-Atonement healing and absorption by 30% on targets with Atonement.</span>,
    [SPELLS.SHADOW_COVENANT_TALENT.id]: <span>Draws on the power of shadow to heal up to 5 injured allies within 30 yds of the target for (450% of Spell power), but leaves a shell on them that absorbs the next [(450% of Spell power) * 50 / 100] healing they receive within 6 sec.</span>,
  },
  // attribution: <span>Parts of the descriptions for talents came from the <a href="http://www.wowhead.com/holy-paladin-talent-guide" target="_blank" rel="noopener noreferrer">Holy Paladin Wowhead guide</a> by Pelinal.</span>,
};
