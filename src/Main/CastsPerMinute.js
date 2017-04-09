import React from 'react';

import {
  HOLY_SHOCK_HEAL_SPELL_ID, LIGHT_OF_DAWN_CAST_SPELL_ID, JUDGMENT_CAST_SPELL_ID, BESTOW_FAITH_SPELL_ID, LIGHT_OF_THE_MARTYR_SPELL_ID, TYRS_DELIVERANCE_CAST_SPELL_ID, AVENGING_WRATH_SPELL_ID, HOLY_AVENGER_SPELL_ID, AURA_MASTERY_SPELL_ID, CRUSADER_STRIKE_SPELL_ID, HOLY_PRISM_CAST_SPELL_ID, LIGHTS_HAMMER_CAST_SPELL_ID, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID,
  JUDGMENT_OF_LIGHT_SPELL_ID, CRUSADERS_MIGHT_SPELL_ID,
} from './Parser/Constants';

const CPM_ABILITIES = [
  {
    spellId: HOLY_SHOCK_HEAL_SPELL_ID,
    icon: 'spell_holy_searinglight',
    name: 'Holy Shock',
    getCasts: castCount => castCount.hits,
    getCooldown: haste => 9 / (1 + haste),
  },
  {
    spellId: LIGHT_OF_DAWN_CAST_SPELL_ID,
    icon: 'spell_paladin_lightofdawn',
    name: 'Light of Dawn',
    getCooldown: haste => 12 / (1 + haste),
  },
  {
    spellId: JUDGMENT_CAST_SPELL_ID,
    icon: 'spell_holy_righteousfury',
    name: 'Judgment',
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.lv90Talent === JUDGMENT_OF_LIGHT_SPELL_ID,
  },
  {
    spellId: BESTOW_FAITH_SPELL_ID,
    icon: 'ability_paladin_blessedmending',
    name: 'Bestow Faith',
    getCooldown: haste => 12,
    isActive: combatant => combatant.lv15Talent === BESTOW_FAITH_SPELL_ID,
    recommendedCastEfficiency: 0.65,
  },
  {
    spellId: LIGHTS_HAMMER_CAST_SPELL_ID,
    icon: 'spell_paladin_lightshammer',
    name: 'Light\'s Hammer',
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv15Talent === LIGHTS_HAMMER_CAST_SPELL_ID,
  },
  {
    spellId: CRUSADER_STRIKE_SPELL_ID,
    icon: 'spell_holy_crusaderstrike',
    name: 'Crusader Strike',
    getCooldown: haste => 4.5 / (1 + haste) / 2,
    isActive: combatant => combatant.lv15Talent === CRUSADERS_MIGHT_SPELL_ID,
  },
  {
    spellId: HOLY_PRISM_CAST_SPELL_ID,
    icon: 'spell_paladin_holyprism',
    name: 'Holy Prism',
    getCooldown: haste => 20,
    isActive: combatant => combatant.lv75Talent === HOLY_PRISM_CAST_SPELL_ID,
  },
  {
    spellId: TYRS_DELIVERANCE_CAST_SPELL_ID,
    icon: 'inv_mace_2h_artifactsilverhand_d_01',
    name: 'Tyr\'s Deliverance',
    getCooldown: haste => 90,
  },
  {
    spellId: AVENGING_WRATH_SPELL_ID,
    icon: 'spell_holy_avenginewrath',
    name: 'Avenging Wrath',
    getCooldown: haste => 120,
  },
  {
    spellId: HOLY_AVENGER_SPELL_ID,
    icon: 'ability_paladin_holyavenger',
    name: 'Holy Avenger',
    getCooldown: haste => 90,
    isActive: combatant => combatant.lv75Talent === HOLY_AVENGER_SPELL_ID,
  },
  {
    spellId: AURA_MASTERY_SPELL_ID,
    icon: 'spell_holy_auramastery',
    name: 'Aura Mastery',
    getCooldown: haste => 180,
  },
  {
    spellId: LIGHT_OF_THE_MARTYR_SPELL_ID,
    icon: 'ability_paladin_lightofthemartyr',
    name: 'Light of the Martyr',
    getCooldown: haste => null,
  },
  {
    spellId: FLASH_OF_LIGHT_SPELL_ID,
    icon: 'spell_holy_flashheal',
    name: 'Filler Flash of Light',
    getCasts: castCount => (castCount.casts || 0) - (castCount.withIol || 0),
    getCooldown: haste => null,
  },
  {
    spellId: FLASH_OF_LIGHT_SPELL_ID,
    icon: 'spell_holy_flashheal',
    name: 'Infusion of Light Flash of Light',
    getCasts: castCount => castCount.withIol || 0,
    getCooldown: haste => null,
  },
  {
    spellId: HOLY_LIGHT_SPELL_ID,
    icon: 'spell_holy_surgeoflight',
    name: 'Filler Holy Light',
    getCasts: castCount => (castCount.casts || 0) - (castCount.withIol || 0),
    getCooldown: haste => null,
  },
  {
    spellId: HOLY_LIGHT_SPELL_ID,
    icon: 'spell_holy_surgeoflight',
    name: 'Infusion of Light Holy Light',
    getCasts: castCount => castCount.withIol || 0,
    getCooldown: haste => null,
  },
];

const CastsPerMinute = ({ parser }) => {
  const fightDuration = parser.currentTimestamp - parser.fight.start_time;
  const minutes = fightDuration / 1000 / 60;

  const castCounter = parser.modules.castCounter;
  const getCastCount = spellId => castCounter.casts[spellId] || {};

  const selectedCombatant = parser.selectedCombatant;

  if (!selectedCombatant) {
    return null;
  }

  const hastePercentage = selectedCombatant ? selectedCombatant.hastePercentage : 0;

  return (
    <table className="data-table">
      <thead>
      <tr>
        <th>Spell</th>
        <th><dfn data-tip="Casts Per Minute">CPM</dfn></th>
        <th><dfn data-tip="Max possible Casts Per Minute with your Haste. This is a super simplified calculation based on your Haste from your gear. Haste increasers like Holy Avenger, Bloodlust and from boss abilities are not taken into consideration, so this is <b>always</b> lower than actually possible for abilities affected by Haste.">Max CPM</dfn></th>
        <th colSpan="2">Cast efficiency</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      {CPM_ABILITIES
        .filter(ability => !ability.isActive || ability.isActive(selectedCombatant))
        .map((ability) => {
          const castCount = getCastCount(ability.spellId);
          const casts = (ability.getCasts ? ability.getCasts(castCount) : castCount.casts) || 0;
          const cpm = casts/minutes;

          const cooldown = ability.getCooldown(hastePercentage);
          // By dividing the fight duration by the cooldown we get the max amount of casts during this particular fight, we round this up because you would be able to cast once at the start of the fight and once at the end since abilities always start off cooldown (e.g. fight is 100 seconds long, you could cast 2 Holy Avengers with a 90 sec cooldown). Good players should be able to reasonably predict this and maximize their casts.
          const maxCpm = cooldown === null ? null : Math.ceil(fightDuration / 1000 / cooldown) / minutes;
          const castEfficiency = cpm / maxCpm;

          const canBeImproved = castEfficiency < (ability.recommendedCastEfficiency || 0.8);

          return (
            <tr key={ability.name}>
              <td>
                <img src={`./img/icons/${ability.icon}.jpg`} alt={ability.name} /> {ability.name}
              </td>
              <td style={{ width: 100 }}>
                {cpm.toFixed(2)}
              </td>
              <td style={{ width: 100 }}>
                {maxCpm === null ? '-' : maxCpm.toFixed(2)}
              </td>
              <td className="text-right" style={{ width: 50, paddingRight: 5 }}>
                {maxCpm === null ? '' : `${(castEfficiency * 100).toFixed(2)}%`}
              </td>
              <td style={{ width: '20%' }}>
                {maxCpm === null ? '' : (
                  <div
                    className="performance-bar"
                    style={{ width: `${castEfficiency * 100}%`, backgroundColor: canBeImproved ? '#ffbf48' : '#70b570' }}
                  ></div>
                )}
              </td>
              <td style={{ width: '25%', color: 'orange' }}>
                {canBeImproved && 'Can be improved.'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
CastsPerMinute.propTypes = {
  parser: React.PropTypes.object.isRequired,
};

export default CastsPerMinute;
