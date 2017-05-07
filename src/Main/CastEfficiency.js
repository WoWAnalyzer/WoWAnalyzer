import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

export const CPM_ABILITIES = [
  {
    spellId: SPELLS.HOLY_SHOCK_HEAL.id,
    icon: SPELLS.HOLY_SHOCK_HEAL.icon,
    name: SPELLS.HOLY_SHOCK_HEAL.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCasts: castCount => castCount.healingHits,
    getCooldown: haste => 9 / (1 + haste),
  },
  {
    spellId: SPELLS.LIGHT_OF_DAWN_CAST.id,
    icon: SPELLS.LIGHT_OF_DAWN_CAST.icon,
    name: SPELLS.LIGHT_OF_DAWN_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
  },
  {
    spellId: SPELLS.JUDGMENT_CAST.id,
    icon: SPELLS.JUDGMENT_CAST.icon,
    name: SPELLS.JUDGMENT_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.lv90Talent === SPELLS.JUDGMENT_OF_LIGHT_TALENT.id,
    recommendedCastEfficiency: 0.85, // this rarely overheals, so keeping this on cooldown is pretty much always best
  },
  {
    spellId: SPELLS.BESTOW_FAITH_TALENT.id,
    icon: SPELLS.BESTOW_FAITH_TALENT.icon,
    name: SPELLS.BESTOW_FAITH_TALENT.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12,
    isActive: combatant => combatant.lv15Talent === SPELLS.BESTOW_FAITH_TALENT.id,
    recommendedCastEfficiency: 0.65,
  },
  {
    spellId: SPELLS.LIGHTS_HAMMER_TALENT.id,
    icon: SPELLS.LIGHTS_HAMMER_TALENT.icon,
    name: SPELLS.LIGHTS_HAMMER_TALENT.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv15Talent === SPELLS.LIGHTS_HAMMER_TALENT.id,
  },
  {
    spellId: SPELLS.CRUSADER_STRIKE.id,
    icon: SPELLS.CRUSADER_STRIKE.icon,
    name: SPELLS.CRUSADER_STRIKE.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 4.5 / (1 + haste),
    isActive: combatant => combatant.lv15Talent === SPELLS.CRUSADERS_MIGHT_TALENT.id,
    recommendedCastEfficiency: 0.60,
  },
  {
    spellId: SPELLS.HOLY_PRISM_CAST.id,
    icon: SPELLS.HOLY_PRISM_CAST.icon,
    name: SPELLS.HOLY_PRISM_CAST.name,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 20,
    isActive: combatant => combatant.lv75Talent === SPELLS.HOLY_PRISM_TALENT.id,
  },
  {
    spellId: SPELLS.RULE_OF_LAW_TALENT.id,
    icon: SPELLS.RULE_OF_LAW_TALENT.icon,
    name: SPELLS.RULE_OF_LAW_TALENT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    charges: 2,
    isActive: combatant => combatant.lv30Talent === SPELLS.RULE_OF_LAW_TALENT.id,
    noSuggestion: true,
  },
  {
    spellId: SPELLS.DIVINE_PROTECTION.id,
    icon: SPELLS.DIVINE_PROTECTION.icon,
    name: SPELLS.DIVINE_PROTECTION.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    recommendedCastEfficiency: 0.6,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spellId: SPELLS.ARCANE_TORRENT.id,
    icon: SPELLS.ARCANE_TORRENT.icon,
    name: SPELLS.ARCANE_TORRENT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spellId: SPELLS.TYRS_DELIVERANCE_CAST.id,
    icon: SPELLS.TYRS_DELIVERANCE_CAST.icon,
    name: SPELLS.TYRS_DELIVERANCE_CAST.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    extraSuggestion: '',
  },
  {
    spellId: SPELLS.VELENS_FUTURE_SIGHT.id,
    icon: SPELLS.VELENS_FUTURE_SIGHT.icon,
    name: SPELLS.VELENS_FUTURE_SIGHT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },
  {
    spellId: SPELLS.HOLY_AVENGER_TALENT.id,
    icon: SPELLS.HOLY_AVENGER_TALENT.icon,
    name: SPELLS.HOLY_AVENGER_TALENT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.lv75Talent === SPELLS.HOLY_AVENGER_TALENT.id,
  },
  {
    spellId: SPELLS.AVENGING_WRATH.id,
    icon: SPELLS.AVENGING_WRATH.icon,
    name: SPELLS.AVENGING_WRATH.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
  },
  {
    spellId: SPELLS.BLESSING_OF_SACRIFICE.id,
    icon: SPELLS.BLESSING_OF_SACRIFICE.icon,
    name: SPELLS.BLESSING_OF_SACRIFICE.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 150,
    recommendedCastEfficiency: 0.5,
    noSuggestion: true,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spellId: SPELLS.AURA_MASTERY.id,
    icon: SPELLS.AURA_MASTERY.icon,
    name: SPELLS.AURA_MASTERY.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spellId: SPELLS.LIGHT_OF_THE_MARTYR.id,
    icon: SPELLS.LIGHT_OF_THE_MARTYR.icon,
    name: SPELLS.LIGHT_OF_THE_MARTYR.name,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spellId: SPELLS.FLASH_OF_LIGHT.id,
    icon: SPELLS.FLASH_OF_LIGHT.icon,
    name: `Filler ${SPELLS.FLASH_OF_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
    getCooldown: haste => null,
  },
  {
    spellId: SPELLS.FLASH_OF_LIGHT.id,
    icon: SPELLS.FLASH_OF_LIGHT.icon,
    name: `Infusion of Light ${SPELLS.FLASH_OF_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingIolHits || 0,
    getCooldown: haste => null,
  },
  {
    spellId: SPELLS.HOLY_LIGHT.id,
    icon: SPELLS.HOLY_LIGHT.icon,
    name: `Filler ${SPELLS.HOLY_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
    getCooldown: haste => null,
  },
  {
    spellId: SPELLS.HOLY_LIGHT.id,
    icon: SPELLS.HOLY_LIGHT.icon,
    name: `Infusion of Light ${SPELLS.HOLY_LIGHT.name}`,
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
    castEfficiency: React.PropTypes.number,
    canBeImproved: React.PropTypes.bool.isRequired,
  })).isRequired,
};

export default CastEfficiency;
