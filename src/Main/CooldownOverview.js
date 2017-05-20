import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}
const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const CooldownOverview = ({ fightStart, fightEnd, cooldowns }) => (
  <div style={{ marginTop: -10, marginBottom: -10 }}>
    <ul className="list">
      {cooldowns.map((cooldown) => {
        const healingDone = cooldown.events.filter(event => event.type === 'heal' || event.type === 'absorbed').reduce((healingDone, event) => healingDone + event.amount + (event.absorbed || 0), 0);
        const mana = cooldown.events.filter(event => event.type === 'cast').reduce((mana, event) => mana + (event.manaCost || 0), 0);

        return (
          <li key={`${cooldown.ability.id}-${cooldown.start}`} className="item clearfix" style={{ padding: '1em' }}>
            <article>
              <figure>
                <SpellIcon id={cooldown.ability.id} />
              </figure>
              <div style={{ width: '100%' }}>
                <header>
                  <SpellLink id={cooldown.ability.id} /> ({formatDuration((cooldown.start - fightStart) / 1000)} -&gt; {formatDuration(((cooldown.end || fightEnd) - fightStart) / 1000)})
                </header>
                <div className="pull-right">
                  {formatNumber(healingDone)} healing<br />
                  {formatNumber(mana)} mana used<br />
                </div>
                {cooldown.events.filter(event => event.type === 'cast' && event.ability.guid !== 1).map((event) => (
                  <SpellLink key={`${event.ability.guid}-${event.timestamp}`} id={event.ability.guid}>
                    <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} />
                  </SpellLink>
                ))}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  </div>
);
CooldownOverview.propTypes = {
  fightStart: React.PropTypes.number.isRequired,
  fightEnd: React.PropTypes.number.isRequired,
  cooldowns: React.PropTypes.arrayOf(React.PropTypes.shape({
    ability: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      icon: React.PropTypes.string.isRequired,
    }),
    start: React.PropTypes.number.isRequired,
    end: React.PropTypes.number,
    events: React.PropTypes.arrayOf(React.PropTypes.shape({
      type: React.PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};

export default CooldownOverview;
