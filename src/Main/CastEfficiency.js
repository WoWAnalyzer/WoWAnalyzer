import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

const CastEfficiency = ({ categories, abilities }) => {
  if (!abilities) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ marginTop: -10, marginBottom: -10 }}>
      {Object.keys(categories).map((key) => (
        <table className="data-table" key={key} style={{ marginTop: 10, marginBottom: 10 }}>
          <thead>
          <tr>
            <th>{categories[key]}</th>
            <th className="text-center"><dfn data-tip="Casts Per Minute">CPM</dfn></th>
            <th colSpan="3"><dfn data-tip="The max possible casts is a super simplified calculation based on the Haste you get from your gear alone. Any Haste increasers such as from talents, Bloodlust and boss abilities are not taken into consideration, so this is <b>always</b> lower than actually possible for abilities affected by Haste.">Cast efficiency</dfn></th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {abilities
            .filter(item => item.ability.category === categories[key])
            .map(({ ability, cpm, maxCpm, casts, maxCasts, castEfficiency, canBeImproved }) => {
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
      ))}
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
