import React from 'react';

import {
  AVENGING_WRATH_SPELL_ID,
  DIVINE_PROTECTION_SPELL_ID, BLESSING_OF_SACRIFICE_SPELL_ID,
} from './Parser/Constants';
import ABILITY_INFO from 'Main/ABILITY_INFO';
import { VELENS_ITEM_ID, LEGENDARY_VELENS_BUFF_SPELL_ID } from './Parser/Modules/Legendaries/Velens';

import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

export const CPM_ABILITIES = [
  {
    spellId: ABILITY_INFO.HOLY_SHOCK_HEAL.id,
    icon: ABILITY_INFO.HOLY_SHOCK_HEAL.icon,
    name: ABILITY_INFO.HOLY_SHOCK_HEAL.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCasts: castCount => castCount.healingHits,
    getCooldown: haste => 9 / (1 + haste),
  },
  {
    spellId: ABILITY_INFO.LIGHT_OF_DAWN_CAST.id,
    icon: ABILITY_INFO.LIGHT_OF_DAWN_CAST.icon,
    name: ABILITY_INFO.LIGHT_OF_DAWN_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
  },
  {
    spellId: ABILITY_INFO.JUDGMENT_CAST.id,
    icon: ABILITY_INFO.JUDGMENT_CAST.icon,
    name: ABILITY_INFO.JUDGMENT_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.lv90Talent === ABILITY_INFO.JUDGMENT_OF_LIGHT_TALENT.id,
    recommendedCastEfficiency: 0.85, // this rarely overheals, so keeping this on cooldown is pretty much always best
  },
  {
    spellId: ABILITY_INFO.BESTOW_FAITH_TALENT.id,
    icon: ABILITY_INFO.BESTOW_FAITH_TALENT.icon,
    name: ABILITY_INFO.BESTOW_FAITH_TALENT.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12,
    isActive: combatant => combatant.lv15Talent === ABILITY_INFO.BESTOW_FAITH_TALENT.id,
    recommendedCastEfficiency: 0.65,
  },
  {
    spellId: ABILITY_INFO.LIGHTS_HAMMER_CAST.id,
    icon: ABILITY_INFO.LIGHTS_HAMMER_CAST.icon,
    name: ABILITY_INFO.LIGHTS_HAMMER_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv15Talent === ABILITY_INFO.LIGHTS_HAMMER_CAST.id,
  },
  {
    spellId: ABILITY_INFO.CRUSADER_STRIKE.id,
    icon: ABILITY_INFO.CRUSADER_STRIKE.icon,
    name: ABILITY_INFO.CRUSADER_STRIKE.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 4.5 / (1 + haste),
    isActive: combatant => combatant.lv15Talent === ABILITY_INFO.CRUSADERS_MIGHT_TALENT.id,
    recommendedCastEfficiency: 0.60,
  },
  {
    spellId: ABILITY_INFO.HOLY_PRISM_CAST.id,
    icon: ABILITY_INFO.HOLY_PRISM_CAST.icon,
    name: ABILITY_INFO.HOLY_PRISM_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 20,
    isActive: combatant => combatant.lv75Talent === ABILITY_INFO.HOLY_PRISM_TALENT.id,
  },
  {
    spellId: ABILITY_INFO.RULE_OF_LAW_TALENT.id,
    icon: ABILITY_INFO.RULE_OF_LAW_TALENT.icon,
    name: ABILITY_INFO.RULE_OF_LAW_TALENT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    charges: 2,
    isActive: combatant => combatant.lv30Talent === ABILITY_INFO.RULE_OF_LAW_TALENT.id,
    noSuggestion: true,
  },
  {
    spellId: DIVINE_PROTECTION_SPELL_ID,
    icon: 'spell_holy_divineprotection',
    name: 'Divine Protection',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    recommendedCastEfficiency: 0.6,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spellId: ABILITY_INFO.ARCANE_TORRENT.id,
    icon: ABILITY_INFO.ARCANE_TORRENT.icon,
    name: ABILITY_INFO.ARCANE_TORRENT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spellId: ABILITY_INFO.TYRS_DELIVERANCE_CAST.id,
    icon: ABILITY_INFO.TYRS_DELIVERANCE_CAST.icon,
    name: ABILITY_INFO.TYRS_DELIVERANCE_CAST.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    extraSuggestion: '',
  },
  {
    spellId: LEGENDARY_VELENS_BUFF_SPELL_ID,
    icon: 'spell_holy_healingfocus',
    name: 'Velen\'s Future Sight',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(VELENS_ITEM_ID),
  },
  {
    spellId: ABILITY_INFO.HOLY_AVENGER_TALENT.id,
    icon: ABILITY_INFO.HOLY_AVENGER_TALENT.icon,
    name: ABILITY_INFO.HOLY_AVENGER_TALENT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.lv75Talent === ABILITY_INFO.HOLY_AVENGER_TALENT.id,
  },
  {
    spellId: AVENGING_WRATH_SPELL_ID,
    icon: 'spell_holy_avenginewrath',
    name: 'Avenging Wrath',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
  },
  {
    spellId: BLESSING_OF_SACRIFICE_SPELL_ID,
    icon: 'spell_holy_sealofsacrifice',
    name: 'Blessing of Sacrifice',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 150,
    recommendedCastEfficiency: 0.5,
    noSuggestion: true,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spellId: ABILITY_INFO.AURA_MASTERY.id,
    icon: ABILITY_INFO.AURA_MASTERY.icon,
    name: ABILITY_INFO.AURA_MASTERY.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spellId: ABILITY_INFO.LIGHT_OF_THE_MARTYR.id,
    icon: ABILITY_INFO.LIGHT_OF_THE_MARTYR.icon,
    name: ABILITY_INFO.LIGHT_OF_THE_MARTYR.name,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spellId: ABILITY_INFO.FLASH_OF_LIGHT.id,
    icon: ABILITY_INFO.FLASH_OF_LIGHT.icon,
    name: `Filler ${ABILITY_INFO.FLASH_OF_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
    getCooldown: haste => null,
  },
  {
    spellId: ABILITY_INFO.FLASH_OF_LIGHT.id,
    icon: ABILITY_INFO.FLASH_OF_LIGHT.icon,
    name: `Infusion of Light ${ABILITY_INFO.FLASH_OF_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingIolHits || 0,
    getCooldown: haste => null,
  },
  {
    spellId: ABILITY_INFO.HOLY_LIGHT.id,
    icon: ABILITY_INFO.HOLY_LIGHT.icon,
    name: `Filler ${ABILITY_INFO.HOLY_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
    getCooldown: haste => null,
  },
  {
    spellId: ABILITY_INFO.HOLY_LIGHT.id,
    icon: ABILITY_INFO.HOLY_LIGHT.icon,
    name: `Infusion of Light ${ABILITY_INFO.HOLY_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingIolHits || 0,
    getCooldown: haste => null,
  },
];

const CastEfficiency = ({ abilities }) => {
  if (!abilities) {
    return <div>Loading...</div>;
  }

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
            {abilities
              .filter(item => item.ability.category === SPELL_CATEGORY[key])
              .map(({ ability, cpm, maxCpm, casts, maxCasts, castEfficiency, canBeImproved }) => (
                <tr key={ability.name}>
                  <td style={{ width: '35%' }}>
                    <a href={`http://www.wowhead.com/spell=${ability.spellId}`} target="_blank" style={{ color: '#fff' }}>
                      <img src={`./img/icons/${ability.icon}.jpg`} alt={ability.name} /> {ability.name}
                    </a>
                  </td>
                  <td className="text-center" style={{ minWidth: 80 }}>
                    {cpm.toFixed(2)}
                  </td>
                  <td className="text-right" style={{ minWidth: 100 }}>
                    {casts}{maxCasts === Infinity ? '' : `/${Math.floor(maxCasts)}`} casts
                  </td>
                  <td style={{ width: '20%' }}>
                    {maxCasts === Infinity ? '' : (
                      <div
                        className="performance-bar"
                        style={{ width: `${castEfficiency * 100}%`, backgroundColor: canBeImproved ? '#ff8000' : '#70b570' }}
                      />
                    )}
                  </td>
                  <td className="text-right" style={{ minWidth: 50, paddingRight: 5 }}>
                    {maxCpm === null ? '' : `${(castEfficiency * 100).toFixed(2)}%`}
                  </td>
                  <td style={{ width: '25%', color: 'orange' }}>
                    {canBeImproved && 'Can be improved.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </div>
  );
};
CastEfficiency.propTypes = {
  abilities: React.PropTypes.arrayOf(React.PropTypes.shape({
    ability: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      spellId: React.PropTypes.number.isRequired,
      icon: React.PropTypes.string.isRequired,
    }),
    cpm: React.PropTypes.number.isRequired,
    maxCpm: React.PropTypes.number,
    casts: React.PropTypes.number.isRequired,
    maxCasts: React.PropTypes.number.isRequired,
    castEfficiency: React.PropTypes.number.isRequired,
    canBeImproved: React.PropTypes.bool.isRequired,
  })).isRequired,
};

export default CastEfficiency;
