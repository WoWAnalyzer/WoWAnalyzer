import React from 'react';

import {
  HOLY_SHOCK_HEAL_SPELL_ID, LIGHT_OF_DAWN_CAST_SPELL_ID, JUDGMENT_CAST_SPELL_ID, BESTOW_FAITH_SPELL_ID, LIGHT_OF_THE_MARTYR_SPELL_ID, TYRS_DELIVERANCE_CAST_SPELL_ID, AVENGING_WRATH_SPELL_ID, HOLY_AVENGER_SPELL_ID, AURA_MASTERY_SPELL_ID, CRUSADER_STRIKE_SPELL_ID, HOLY_PRISM_CAST_SPELL_ID, LIGHTS_HAMMER_CAST_SPELL_ID, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, ARCANE_TORRENT_SPELL_ID, RULE_OF_LAW_SPELL_ID,
  JUDGMENT_OF_LIGHT_SPELL_ID, CRUSADERS_MIGHT_SPELL_ID,
} from './Parser/Constants';

const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  {
    spellId: HOLY_SHOCK_HEAL_SPELL_ID,
    icon: 'spell_holy_searinglight',
    name: 'Holy Shock',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCasts: castCount => castCount.hits,
    getCooldown: haste => 9 / (1 + haste),
  },
  {
    spellId: LIGHT_OF_DAWN_CAST_SPELL_ID,
    icon: 'spell_paladin_lightofdawn',
    name: 'Light of Dawn',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
  },
  {
    spellId: JUDGMENT_CAST_SPELL_ID,
    icon: 'spell_holy_righteousfury',
    name: 'Judgment',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.lv90Talent === JUDGMENT_OF_LIGHT_SPELL_ID,
    recommendedCastEfficiency: 0.85, // this rarely overheals, so keeping this on cooldown is pretty much always best
  },
  {
    spellId: BESTOW_FAITH_SPELL_ID,
    icon: 'ability_paladin_blessedmending',
    name: 'Bestow Faith',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12,
    isActive: combatant => combatant.lv15Talent === BESTOW_FAITH_SPELL_ID,
    recommendedCastEfficiency: 0.65,
  },
  {
    spellId: LIGHTS_HAMMER_CAST_SPELL_ID,
    icon: 'spell_paladin_lightshammer',
    name: 'Light\'s Hammer',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv15Talent === LIGHTS_HAMMER_CAST_SPELL_ID,
  },
  {
    spellId: CRUSADER_STRIKE_SPELL_ID,
    icon: 'spell_holy_crusaderstrike',
    name: 'Crusader Strike',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 4.5 / (1 + haste) / 2,
    isActive: combatant => combatant.lv15Talent === CRUSADERS_MIGHT_SPELL_ID,
  },
  {
    spellId: HOLY_PRISM_CAST_SPELL_ID,
    icon: 'spell_paladin_holyprism',
    name: 'Holy Prism',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 20,
    isActive: combatant => combatant.lv75Talent === HOLY_PRISM_CAST_SPELL_ID,
  },
  {
    spellId: TYRS_DELIVERANCE_CAST_SPELL_ID,
    icon: 'inv_mace_2h_artifactsilverhand_d_01',
    name: 'Tyr\'s Deliverance',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
  },
  {
    spellId: AVENGING_WRATH_SPELL_ID,
    icon: 'spell_holy_avenginewrath',
    name: 'Avenging Wrath',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
  },
  {
    spellId: HOLY_AVENGER_SPELL_ID,
    icon: 'ability_paladin_holyavenger',
    name: 'Holy Avenger',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.lv75Talent === HOLY_AVENGER_SPELL_ID,
  },
  {
    spellId: AURA_MASTERY_SPELL_ID,
    icon: 'spell_holy_auramastery',
    name: 'Aura Mastery',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spellId: ARCANE_TORRENT_SPELL_ID,
    icon: 'spell_shadow_teleport',
    name: 'Arcane Torrent',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spellId: RULE_OF_LAW_SPELL_ID,
    icon: 'ability_paladin_longarmofthelaw',
    name: 'Rule of Law',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    charges: 2,
    isActive: combatant => combatant.lv30Talent === RULE_OF_LAW_SPELL_ID,
  },
  {
    spellId: LIGHT_OF_THE_MARTYR_SPELL_ID,
    icon: 'ability_paladin_lightofthemartyr',
    name: 'Light of the Martyr',
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spellId: FLASH_OF_LIGHT_SPELL_ID,
    icon: 'spell_holy_flashheal',
    name: 'Filler Flash of Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.withIol || 0),
    getCooldown: haste => null,
  },
  {
    spellId: FLASH_OF_LIGHT_SPELL_ID,
    icon: 'spell_holy_flashheal',
    name: 'Infusion of Light Flash of Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.withIol || 0,
    getCooldown: haste => null,
  },
  {
    spellId: HOLY_LIGHT_SPELL_ID,
    icon: 'spell_holy_surgeoflight',
    name: 'Filler Holy Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.withIol || 0),
    getCooldown: haste => null,
  },
  {
    spellId: HOLY_LIGHT_SPELL_ID,
    icon: 'spell_holy_surgeoflight',
    name: 'Infusion of Light Holy Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.withIol || 0,
    getCooldown: haste => null,
  },
];

const CastEfficiency = ({ parser }) => {
  const fightDuration = (parser.finished ? parser.fight.end_time : parser.currentTimestamp) - parser.fight.start_time;
  const minutes = fightDuration / 1000 / 60;

  const castCounter = parser.modules.castCounter;
  const getCastCount = spellId => castCounter.casts[spellId] || {};

  const selectedCombatant = parser.selectedCombatant;

  if (!selectedCombatant) {
    return null;
  }

  const hastePercentage = selectedCombatant ? selectedCombatant.hastePercentage : 0;

  return (
    <div style={{ marginTop: -10, marginBottom: -10 }}>
      {Object.keys(SPELL_CATEGORY).map((key) => {
        return (
          <table className="data-table" key={key} style={{ marginTop: 10, marginBottom: 10 }}>
            <thead>
            <tr>
              <th>{SPELL_CATEGORY[key]}</th>
              <th className="text-center"><dfn data-tip="Casts Per Minute">CPM</dfn></th>
              <th colSpan="3"><dfn data-tip="The max possible casts is a super simplified calculation based on the Haste you get from your gear alone. Haste increasers like Holy Avenger, Bloodlust and from boss abilities are not taken into consideration, so this is <b>always</b> lower than actually possible for abilities affected by Haste.">Cast efficiency</dfn></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {CPM_ABILITIES
              .filter(ability => ability.category === SPELL_CATEGORY[key])
              .filter(ability => !ability.isActive || ability.isActive(selectedCombatant))
              .map((ability) => {
                const castCount = getCastCount(ability.spellId);
                const casts = (ability.getCasts ? ability.getCasts(castCount) : castCount.casts) || 0;
                if (ability.hideWithZeroCasts && casts === 0) {
                  return null;
                }
                const cpm = casts/minutes;

                const cooldown = ability.getCooldown(hastePercentage);
                // By dividing the fight duration by the cooldown we get the max amount of casts during this particular fight, we round this up because you would be able to cast once at the start of the fight and once at the end since abilities always start off cooldown (e.g. fight is 100 seconds long, you could cast 2 Holy Avengers with a 90 sec cooldown). Good players should be able to reasonably predict this and maximize their casts.
                const maxCasts = Math.ceil(fightDuration / 1000 / cooldown) + (ability.charges ? ability.charges - 1 : 0);
                const maxCpm = cooldown === null ? null : maxCasts / minutes;
                const castEfficiency = cpm / maxCpm;

                const canBeImproved = castEfficiency < (ability.recommendedCastEfficiency || 0.8);

                return (
                  <tr key={ability.name}>
                    <td style={{ width: '35%' }}>
                      <img src={`./img/icons/${ability.icon}.jpg`} alt={ability.name} /> {ability.name}
                    </td>
                    <td className="text-center" style={{ width: 80 }}>
                      {cpm.toFixed(2)}
                    </td>
                    <td className="text-right" style={{ width: 100 }}>
                      {casts}{maxCasts === Infinity ? '' : `/${Math.floor(maxCasts)}`} casts
                    </td>
                    <td style={{ width: '20%' }}>
                      {maxCpm === null ? '' : (
                          <div
                            className="performance-bar"
                            style={{ width: `${castEfficiency * 100}%`, backgroundColor: canBeImproved ? '#ff8000' : '#70b570' }}
                          ></div>
                        )}
                    </td>
                    <td className="text-right" style={{ width: 50, paddingRight: 5 }}>
                      {maxCpm === null ? '' : `${(castEfficiency * 100).toFixed(2)}%`}
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
      })}
    </div>
  );
};
CastEfficiency.propTypes = {
  parser: React.PropTypes.object.isRequired,
};

export default CastEfficiency;
