// Based on Main/CastEfficiency.js
import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

const CastEfficiency = ({ categories, abilities }) => {
  if (!abilities) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ marginTop: -10, marginBottom: -10 }}>
      <table className="data-table" style={{ marginTop: 10, marginBottom: 10 }}>
        {Object.keys(categories).map((key) => (
          <tbody key={key}>
            <tr>
              <th>{categories[key]}</th>
              <th className="text-center">Casts</th>
              <th className="text-center">{key === 'spend' ? <dfn data-tip="Approxomatly.">Spend</dfn> : ''}</th>
              <th className="text-center">{key === 'generated' ? <dfn data-tip="Approxomatly.">Generated</dfn> : ''}</th>
              <th className="text-center"><dfn data-tip="Approxomatly.">Wasted</dfn></th>
              <th></th>
            </tr>
            {abilities
              .filter(item => item.ability.category === categories[key])
            .map(({ ability, casts, spend, created, wasted, canBeImproved }) => {
              const name = ability.name;
              return (
                <tr key={name}>
                  <td style={{ width: '35%' }}>
                    <SpellLink id={ability.spellId} style={{ color: '#fff' }}>
                      <SpellIcon id={ability.spellId} noLink /> {name}
                    </SpellLink>
                  </td>
                  <td className="text-center" style={{ minWidth: 80 }}>
                    {casts}
                  </td>
                  <td className="text-center" style={{ minWidth: 80 }}>
                    {spend ? spend : ''}
                  </td>
                  <td className="text-center" style={{ minWidth: 80 }}>
                    {created ? created : ''}
                  </td>
                  <td className="text-center" style={{ minWidth: 80 }}>
                    {wasted ? wasted : ''}
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
  abilities: React.PropTypes.arrayOf(React.PropTypes.shape({
    ability: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      category: React.PropTypes.string.isRequired,
      spellId: React.PropTypes.number.isRequired,
    }).isRequired,
  })).isRequired,
};

export default CastEfficiency;
