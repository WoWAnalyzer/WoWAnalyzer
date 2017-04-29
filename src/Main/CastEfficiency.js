import React from 'react';

import {
  HOLY_SHOCK_HEAL_SPELL_ID, LIGHT_OF_DAWN_CAST_SPELL_ID, JUDGMENT_CAST_SPELL_ID, BESTOW_FAITH_SPELL_ID, LIGHT_OF_THE_MARTYR_SPELL_ID, TYRS_DELIVERANCE_CAST_SPELL_ID, AVENGING_WRATH_SPELL_ID, HOLY_AVENGER_SPELL_ID, AURA_MASTERY_SPELL_ID, CRUSADER_STRIKE_SPELL_ID, HOLY_PRISM_CAST_SPELL_ID, LIGHTS_HAMMER_CAST_SPELL_ID, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, ARCANE_TORRENT_SPELL_ID, RULE_OF_LAW_SPELL_ID,
  JUDGMENT_OF_LIGHT_SPELL_ID, CRUSADERS_MIGHT_SPELL_ID, DIVINE_PROTECTION_SPELL_ID, BLESSING_OF_SACRIFICE_SPELL_ID,
} from './Parser/Constants';
import { VELENS_ITEM_ID, LEGENDARY_VELENS_BUFF_SPELL_ID } from './Parser/Modules/Legendaries/Velens';

import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

export const CPM_ABILITIES = [
  {
    spellId: HOLY_SHOCK_HEAL_SPELL_ID,
    icon: 'spell_holy_searinglight',
    name: 'Holy Shock',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCasts: castCount => castCount.healingHits,
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
    recommendedCastEfficiency: 0.3,
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
    spellId: RULE_OF_LAW_SPELL_ID,
    icon: 'ability_paladin_longarmofthelaw',
    name: 'Rule of Law',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    charges: 2,
    isActive: combatant => combatant.lv30Talent === RULE_OF_LAW_SPELL_ID,
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
    spellId: ARCANE_TORRENT_SPELL_ID,
    icon: 'spell_shadow_teleport',
    name: 'Arcane Torrent',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spellId: TYRS_DELIVERANCE_CAST_SPELL_ID,
    icon: 'inv_mace_2h_artifactsilverhand_d_01',
    name: 'Tyr\'s Deliverance',
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
    spellId: HOLY_AVENGER_SPELL_ID,
    icon: 'ability_paladin_holyavenger',
    name: 'Holy Avenger',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.lv75Talent === HOLY_AVENGER_SPELL_ID,
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
    spellId: AURA_MASTERY_SPELL_ID,
    icon: 'spell_holy_auramastery',
    name: 'Aura Mastery',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
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
    getCasts: castCount => (castCount.casts || 0) - (castCount.iolHits || 0),
    getCooldown: haste => null,
  },
  {
    spellId: FLASH_OF_LIGHT_SPELL_ID,
    icon: 'spell_holy_flashheal',
    name: 'Infusion of Light Flash of Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.iolHits || 0,
    getCooldown: haste => null,
  },
  {
    spellId: HOLY_LIGHT_SPELL_ID,
    icon: 'spell_holy_surgeoflight',
    name: 'Filler Holy Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.iolHits || 0),
    getCooldown: haste => null,
  },
  {
    spellId: HOLY_LIGHT_SPELL_ID,
    icon: 'spell_holy_surgeoflight',
    name: 'Infusion of Light Holy Light',
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.iolHits || 0,
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
