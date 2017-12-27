import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';

const CastEfficiency = ({ categories, abilities }) => {
  if (!abilities) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ marginTop: -10, marginBottom: -10 }}>
      <table className="data-table" style={{ marginTop: 10, marginBottom: 10 }}>
        {Object.keys(categories)
          .filter(key => abilities.some(item => item.ability.category === categories[key])) // filters out categories without any abilities in it
          .map(key => (
            <tbody key={key}>
              <tr>
                <th><b>{categories[key]}</b></th>
                <th className="text-center"><dfn data-tip="Casts Per Minute">CPM</dfn></th>
                <th className="text-right"><dfn data-tip="Maximum possible casts are based on the ability's cooldown and the fight duration. For abilities that can have their cooldowns dynamically reduced or reset, it's based on the average actual time it took the ability to cooldown over the course of this encounter.">Cast efficiency</dfn></th>
                <th className="text-center"><dfn data-tip="The percentage of time the spell was kept on cooldown. Spells with multiple charges count as on cooldown as long as you have fewer than maximum charges. For spells with long cooldowns, it's possible to have well below 100% on cooldown and still achieve maximum casts.">Time on Cooldown</dfn></th>
                <th />
              </tr>
              {abilities
                .filter(item => item.ability.category === categories[key])
                .map(({ ability, cpm, maxCpm, casts, maxCasts, efficiency, canBeImproved }) => {
                  const name = ability.castEfficiency.name || ability.name;
                  return (
                    <tr key={name}>
                      <td style={{ width: '35%' }}>
                        <SpellLink id={ability.primarySpell.id} style={{ color: '#fff' }} icon>
                          {name}
                        </SpellLink>
                      </td>
                      <td className="text-center" style={{ minWidth: 80 }}>
                        {cpm.toFixed(2)}
                      </td>
                      <td className="text-right" style={{ minWidth: 110 }}>
                        {casts}{maxCasts === Infinity ? '' : `/${Math.floor(maxCasts)}`} casts
                      </td>
                      <td style={{ width: '20%' }}>
                        {maxCasts === Infinity ? '' : (
                          <div className="flex performance-bar-container">
                            <div
                              className="flex-sub performance-bar"
                              style={{ width: `${efficiency * 100}%`, backgroundColor: canBeImproved ? '#ff8000' : '#70b570' }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="text-left" style={{ minWidth: 50, paddingRight: 5 }}>
                        {maxCpm !== null ? `${(efficiency * 100).toFixed(2)}%` : ''}
                      </td>
                      <td style={{ width: '25%', color: 'orange' }}>
                        {canBeImproved && !ability.noCanBeImproved && 'Can be improved.'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          ))}
      </table>
    </div>
  );
};
CastEfficiency.propTypes = {
  abilities: PropTypes.arrayOf(PropTypes.shape({
    ability: PropTypes.shape({
      name: PropTypes.string,
      category: PropTypes.string.isRequired,
      spell: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
    }),
    cpm: PropTypes.number.isRequired,
    maxCpm: PropTypes.number,
    casts: PropTypes.number.isRequired,
    maxCasts: PropTypes.number.isRequired,
    castEfficiency: PropTypes.number,
    canBeImproved: PropTypes.bool.isRequired,
  })).isRequired,
  categories: PropTypes.object,
};

export default CastEfficiency;
