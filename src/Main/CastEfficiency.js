import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

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
                <th>{categories[key]}</th>
                <th className="text-center"><dfn data-tip="Casts Per Minute">CPM</dfn></th>
                <th colSpan="3"><dfn data-tip="The max possible casts is a super simplified calculation based on the Haste you get from your gear alone. Any Haste increasers such as from talents, Bloodlust and boss abilities are not taken into consideration, so this is <b>always</b> lower than actually possible for abilities affected by Haste.">Cast efficiency</dfn></th>
                <th>Overhealing</th>
                <th />
              </tr>
              {abilities
                .filter(item => item.ability.category === categories[key])
                .map(({ ability, cpm, maxCpm, casts, maxCasts, castEfficiency, overhealing, canBeImproved }) => {
                  const name = ability.name || ability.spell.name;
                  return (
                    <tr key={name}>
                      <td style={{ width: '35%' }}>
                        <SpellLink id={ability.spell.id} style={{ color: '#fff' }}>
                          <SpellIcon id={ability.spell.id} noLink /> {name}
                        </SpellLink>
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
                        {maxCpm !== null ? `${(castEfficiency * 100).toFixed(2)}%` : ''}
                      </td>
                      <td className="text-center" style={{ minWidth: 80 }}>
                        {overhealing !== null ? `${(overhealing * 100).toFixed(2)}%` : '-'}
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
