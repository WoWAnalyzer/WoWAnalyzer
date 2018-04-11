import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'common/SPECS';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import getItemQualityLabel from 'common/getItemQualityLabel';

import { GEAR_SLOTS } from 'Parser/Core/Combatant';

// Source: https://stackoverflow.com/a/20079910/684353
function selectText(node) {
  if (!node) {
    return;
  }
  if (document.selection) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const range = document.createRange();
    range.selectNodeContents(node);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}
function formatThousands(number) {
  return (`${Math.round(number || 0)}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

class Item extends React.PureComponent {
  static propTypes = {
    item: PropTypes.object,
    slotNo: PropTypes.number,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
      data: null,
    };
  }

  view(id) {
    this.setState({
      expanded: !this.state.expanded,
    });

    if (this.state.data) {
      return null;
    }

    return fetch(`https://eu.api.battle.net/wow/item/${id}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then((data) => {
        this.setState({
          data,
        });
      });
  }

  renderCode() {
    const item = this.state.data;
    return `
${item.name.toUpperCase().replace(/[^A-Z ]/g, '').replace(/ /g, '_')}: {
  id: ${item.id},
  name: '${item.name.replace('\'', '\\\'')}',
  icon: '${item.icon}',
  quality: ITEM_QUALITIES.${getItemQualityLabel(item.quality).toUpperCase()},
},`;
  }

  render() {
    const { item, slotNo } = this.props;
    const slot = Object.keys(GEAR_SLOTS).find(slot => GEAR_SLOTS[slot] === slotNo);

    return (
      <div>
        <div className="row" onClick={() => this.view(item.id)}>
          <div className="col-md-3">
            {slotNo} {slot}
          </div>
          <div className="col-md-6">
            <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
              <Icon icon={item.icon} alt={item.icon} style={{ height: '1.6em' }} /> {ITEMS[item.id] ? ITEMS[item.id].name : `itemID: ${item.id}`}
            </ItemLink>
          </div>
          <div className="col-md-3">
            itemLevel: {item.itemLevel}
          </div>
        </div>

        {this.state.expanded && (
          <div>
            {this.state.data ? (
              <pre ref={elem => selectText(elem)}>
                <code>
                  {this.renderCode()}
                </code>
              </pre>
            ) : 'Loading...'}
          </div>
        )}
      </div>
    );
  }
}
class Cast extends React.PureComponent {
  static propTypes = {
    cast: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
      data: null,
    };
  }

  view(id) {
    this.setState({
      expanded: !this.state.expanded,
    });

    if (this.state.data) {
      return null;
    }

    return fetch(`https://eu.api.battle.net/wow/spell/${id}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then((data) => {
        this.setState({
          data,
        });
      });
  }

  renderCode() {
    const data = this.state.data;
    const properties = [
      `id: ${data.id}`,
      `name: '${data.name.replace('\'', '\\\'')}'`,
      `icon: '${data.icon}'`,
    ];
    if (data.powerCost) {
      const mana = data.powerCost.match(/^([0-9.]+)% of base mana$/);
      if (mana) {
        properties.push(`baseMana: ${Math.round(mana[1] / 100 * 10000) / 10000}`);
      }
      // TODO: As desired add other powers
    }
    return `
${data.name.toUpperCase().replace(/[^A-Z ]/g, '').replace(/ /g, '_')}: {
${properties.map(prop => `  ${prop},`).join('\n')}
},`;
  }

  render() {
    const { cast } = this.props;

    return (
      <li onClick={() => this.view(cast.ability.guid)}>
        <div style={{ float: 'right', color: SPELLS[cast.ability.guid] ? 'green' : 'red', fontWeight: 600 }}>
          {SPELLS[cast.ability.guid] ? 'Known' : 'Unknown'}
        </div>

        <SpellLink id={cast.ability.guid} icon={false}>
          <Icon icon={cast.ability.abilityIcon} alt={cast.ability.abilityIcon} style={{ height: '1.6em' }} /> {cast.ability.name}
        </SpellLink>{' '}
        casts: {cast.casts || 'N/A'}{' '}
        {cast.manaUsed && (
          <span>
            Mana used: {formatThousands(cast.manaUsed)}
          </span>
        )}
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>type</th>
              <th>Hits</th>
              <th>Effective</th>
              <th>Absorbed</th>
              <th>Overheal</th>
            </tr>
          </thead>
          <tbody>
            {cast.healingHits && (
              <tr>
                <td>regular healing</td>
                <td>{cast.healingHits}</td>
                <td>{formatThousands(cast.healingEffective)}</td>
                <td>{formatThousands(cast.healingAbsorbed)}</td>
                <td>{formatThousands(cast.healingOverheal)}</td>
              </tr>
            )}
            {cast.healingCriticalHits && (
              <tr>
                <td>critical healing</td>
                <td>{cast.healingCriticalHits}</td>
                <td>{formatThousands(cast.healingCriticalEffective)}</td>
                <td>{formatThousands(cast.healingCriticalAbsorbed)}</td>
                <td>{formatThousands(cast.healingCriticalOverheal)}</td>
              </tr>
            )}
            {cast.damageHits && (
              <tr>
                <td>regular damage</td>
                <td>{cast.damageHits}</td>
                <td>{formatThousands(cast.damageEffective)}</td>
                <td>{formatThousands(cast.damageAbsorbed)}</td>
              </tr>
            )}
            {cast.damageCriticalHits && (
              <tr>
                <td>critical damage</td>
                <td>{cast.damageCriticalHits}</td>
                <td>{formatThousands(cast.damageCriticalEffective)}</td>
                <td>{formatThousands(cast.damageCriticalAbsorbed)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {this.state.expanded && (
          <div>
            {this.state.data ? (
              <pre ref={elem => selectText(elem)}>
                <code>
                  {this.renderCode()}
                </code>
              </pre>
            ) : 'Loading...'}
          </div>
        )}
      </li>
    );
  }
}

const Code = ({ children, dump, className, ...others }) => (
  <a
    href={`javascript:console.log(${children})`}
    onClick={(e) => {
      e.preventDefault();
      console.log(dump);
    }}
  >
    <code className={`clickable ${className || ''}`} {...others}>{children}</code>
  </a>
);
Code.propTypes = {
  children: PropTypes.node.isRequired,
  dump: PropTypes.any.isRequired,
  className: PropTypes.string,
};

class DevelopmentTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    // results: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      expandedItem: null,
      expandedItemData: null,
    };
  }

  render() {
    const { parser } = this.props;

    window.parser = parser;

    const combatant = parser.modules.combatants.selected;

    return (
      <div>
        <div className="panel-heading">
          <h2>Development Tools</h2>
        </div>
        <div className="panel-body">
          <div className="alert alert-success">
            The parser is now available under <Code dump={parser}>window.parser</Code>.
          </div>
          <div className="row">
            <div className="col-md-6">
              Modules:
              <ul className="list">
                {Object.keys(parser.modules)
                  .map(moduleName => (
                    <li key={moduleName} className="flex">
                      <div className="flex-main">
                        <Code dump={parser.modules[moduleName]}>{moduleName}</Code>
                      </div>
                      <div className="flex-main" style={{ color: parser.modules[moduleName].active ? 'green' : 'red' }}>
                        {parser.modules[moduleName].active ? 'Active' : 'Inactive'}
                      </div>
                    </li>
                  ))}
              </ul>
              Access them in the console with: <code>parser.modules.*moduleName*</code> or by clicking on the names.
            </div>
            <div className="col-md-6">
              Parsing time spenders:
              <p className="text-muted">This is the amount of time each module took running event listeners. Render time (e.g. of statistics) is not included.</p>
              <ul className="list">
                {Object.keys(parser._moduleTime)
                  .sort((a, b) => parser._moduleTime[b] - parser._moduleTime[a])
                  .filter((_, index) => index < 10)
                  .map(moduleName => (
                    <li key={moduleName} className="flex">
                      <div className="flex-main">
                        <Code dump={parser.modules[moduleName]}>{moduleName}</Code>
                      </div>
                      <div className="flex-main">
                        {parser._moduleTime[moduleName]}ms
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="col-md-6">
              Pre-combat buffs:
              <ul className="list">
                {combatant._combatantInfo.auras.map((aura, i) => {
                  const source = parser.modules.combatants.players[aura.source];
                  const spec = source && SPECS[source.specId];
                  const specClassName = spec && spec.className.replace(' ', '');

                  return (
                    <li key={`${i}-${aura.ability}`}>
                      <SpellLink id={aura.ability} icon={false}>
                        <Icon icon={aura.icon} alt={aura.icon} style={{ height: '1.6em' }} /> {SPELLS[aura.ability] ? SPELLS[aura.ability].name : `spellID: ${aura.ability}`}
                      </SpellLink>{' '}
                      source: <span className={specClassName}>{source ? source.name : aura.source}</span>{' '}
                    </li>
                  );
                })}
              </ul>
            </div>
            {parser.modules.abilityTracker && (
              <div className="col-md-6">
                All casts: (hint: click on an item to generate the required <code>SPELLS.js</code> entry)
                <ul className="list">
                  {Object.keys(parser.modules.abilityTracker.abilities)
                    .map(key => parser.modules.abilityTracker.abilities[key])
                    .sort((a, b) => (b.casts || 0) - (a.casts || 0))
                    .map(cast => cast.ability && <Cast key={cast.ability.guid} cast={cast} />)}
                </ul>
              </div>
            )}
            <div className="col-md-6">
              Items: (hint: click on an item to generate the required <code>ITEMS.js</code> entry)
              <ul className="list">
                {combatant._combatantInfo.gear.map((item, i) => (
                  <li key={`${i}-${item.id}`}>
                    <Item item={item} slotNo={i} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              Traits:
              <ul className="list">
                {combatant._combatantInfo.artifact.map(trait => (
                  <li key={trait.traitID}>
                    <div style={{ float: 'right', color: SPELLS[trait.spellID] ? 'green' : 'red', fontWeight: 600 }}>
                      {SPELLS[trait.spellID] ? 'Known' : 'Unknown'}
                    </div>
                    <SpellLink id={trait.spellID} icon={false}>
                      <Icon icon={trait.icon} alt={trait.icon} style={{ height: '1.6em' }} /> {SPELLS[trait.spellID] ? SPELLS[trait.spellID].name : `spellID: ${trait.spellID}`}
                    </SpellLink>{' '}
                    traitID: {trait.traitID}{' '}
                    rank: {trait.rank}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DevelopmentTab;
