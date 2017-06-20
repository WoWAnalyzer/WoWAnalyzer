import React from 'react';

import SPELLS from 'common/SPELLS';
// import SpellLink from 'common/SpellLink';

export default {
  descriptions: {
    // lv15
    [SPELLS.FINAL_VERDICT_TALENT.id]: <span>Increases the damage done by Templar's Verdict by 20%, and the damage done by Divine Storm by 10%.</span>,
    [SPELLS.EXECUTION_SENTENCE_TALENT.id]: <span>A hammer slowly falls from the sky, dealing (1450% of Attack power) Holy damage after 7 sec.</span>,
    [SPELLS.CONSECRATION_TALENT.id]: <span>Consecrates the land beneath you, causing [(30% of Attack power) * 12] Holy damage over 12 sec to enemies who enter the area.</span>,
    // lv30
    [SPELLS.THE_FIRES_OF_JUSTICE_TALENT.id]: <span>Reduces the cooldown of Crusader Strike by 1.0 sec and gives it a 15% chance to reduce the cost of your next damaging or healing Holy Power ability by 1.</span>,
    [SPELLS.ZEAL_TALENT.id]: <span>Strike the target for 320% Physical damage. Maximum 2 charges. Grants Zeal, causing Zeal attacks to chain to an additional nearby target per stack. Maximum 3 stacks. Each jump deals 40% less damage.</span>,
    [SPELLS.GREATER_JUDGMENT_TALENT.id]: <span>Your Judgment ability hits 2 additional nearby enemies, and always deals a critical strike against targets above 50% health.</span>,
    // lv45
    [SPELLS.FIST_OF_JUSTICE_TALENT_RETRI.id]: <span>Each Holy Power spent reduces the remaining cooldown on Hammer of Justice by 2.5 sec.</span>,
    [SPELLS.REPENTANCE_TALENT.id]: <span>The talent selected in this tier usually has no impact in raids.</span>,
    [SPELLS.BLINDING_LIGHT_TALENT.id]: <span>The talent selected in this tier usually has no impact in raids.</span>,
    // lv60
    [SPELLS.VIRTUES_BLADE_TALENT.id]: <span>Blade of Justice critical strikes now deal 3 times normal damage.</span>,
    [SPELLS.BLADE_OF_WRATH_TALENT.id]: <span>Your auto attacks have a chance to reset the cooldown of Blade of Justice.</span>,
    [SPELLS.DIVINE_HAMMER_TALENT.id]: <span>Divine Hammers spin around you, damaging enemies within 8 yds for 90% Holy damage instantly and every 2 sec for 12 sec.</span>,
    // lv75
    [SPELLS.JUSTICARS_VENGEANCE_TALENT.id]: <span>A weapon strike that deals (800% of Attack power) Holy damage and restores health equal to the damage done. Deals 100% additional damage and healing when used against a stunned target.</span>,
    [SPELLS.EYE_FOR_AN_EYE_TALENT.id]: <span>Reduces Physical damage you take by 35%, and instantly counterattacks any enemy that strikes you in melee combat for 170% Physical damage.  Lasts 10 sec.</span>,
    [SPELLS.WORD_OF_GLORY_TALENT.id]: <span>Heal yourself and up to 5 friendly targets within 15 yards for (1200% of Spell power). Maximum 2 charges.</span>,
    // lv90
    [SPELLS.DIVINE_INTERVENTION_TALENT.id]: <span>Reduces your Divine Shield cooldown by 20%.  In addition, any attack which would kill you instead reduces you to 20% of your maximum health and triggers Divine Shield. Cannot occur while Divine Shield is on cooldown or Forbearance is active.</span>,
    [SPELLS.CAVALIER_TALENT.id]: <span>Divine Steed now has 2 charges.</span>,
    [SPELLS.JUDGMENT_OF_LIGHT_TALENT.id]: <span>Judgment now applies Judgment of Light to the target, causing the next 40 successful attacks against the target to heal the attacker for (20% of Spell power).</span>,
    // lv100
    [SPELLS.DIVINE_PURPOSE_TALENT_RETRI.id]: <span>Your Holy Power spending abilities have a 20% chance to make your next Holy Power spending ability free.</span>,
    [SPELLS.CRUSADE_TALENT.id]: <span>Increases your damage and haste by 3.0% for 20 sec. Each Holy Power spent during Crusade increases damage and haste by an additional 3.0%. Maximum 15 stacks.</span>,
    [SPELLS.HOLY_WRATH.id]: <span>Deals 200% of your missing health in Holy damage to 4 nearby enemies, up to 120% of your maximum health. Deals 35% of missing health against enemy players.</span>,
  },
  // attribution: <span>Parts of the descriptions for talents came from the <a href="http://www.wowhead.com/holy-paladin-talent-guide" target="_blank" rel="noopener noreferrer">Holy Paladin Wowhead guide</a> by Pelinal.</span>,
};
