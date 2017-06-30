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
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
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
      return;
    }

    return fetch(`https://us.api.battle.net/wow/item/${id}?locale=en_US&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then(data => {
        this.setState({
          data: data,
        });
      });
  }

  renderCode() {
    const item = this.state.data;
    return `
${item.name.toUpperCase().replace(/[^A-Z ]/g, '').replace(/ /g, '_')}: {
  id: ${item.id},
  name: '${item.name.replace("'", "\\'")}',
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
            <ItemLink id={item.id} quality={item.quality} details={item}>
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

    const combatant = parser.selectedCombatant;

    console.log(parser.modules.abilityTracker.abilities);

    return (
      <div>
        <div className="panel-heading">
          <h2>Development Tools</h2>
        </div>
        <div>
          <div className="row">
            {parser.modules.abilityTracker && (
              <div className="col-md-6">
                All casts:
                <ul className="list">
                  {Object.keys(parser.modules.abilityTracker.abilities)
                    .map(key => parser.modules.abilityTracker.abilities[key])
                    .sort((a, b) => (b.casts || 0) - (a.casts || 0))
                    .map((cast) => (
                      <li key={cast.ability.guid}>
                        <SpellLink id={cast.ability.guid}>
                          <Icon icon={cast.ability.abilityIcon} alt={cast.ability.abilityIcon} style={{ height: '1.6em' }} /> {cast.ability.name}
                        </SpellLink>{' '}
                        casts: {cast.casts}{' '}
                        {cast.healingHits && (
                          <div>
                            regular healing: #: {cast.healingHits} effective: {formatThousands(cast.healingEffective)} absorbed: {formatThousands(cast.healingAbsorbed)} overhealing: {formatThousands(cast.healingOverheal)}
                          </div>
                        )}
                        {cast.healingCriticalHits && (
                          <div>
                            critical healing: #: {cast.healingCriticalHits} effective: {formatThousands(cast.healingCriticalEffective)} absorbed: {formatThousands(cast.healingCriticalAbsorbed)} overhealing: {formatThousands(cast.healingCriticalOverheal)}
                          </div>
                        )}
                        {cast.damangeHits && (
                          <div>
                            regular damage: #: {cast.damangeHits} effective: {formatThousands(cast.damangeEffective)} absorbed: {formatThousands(cast.damangeAbsorbed)}
                          </div>
                        )}
                        {cast.damangeCriticalHits && (
                          <div>
                            critical damage: #: {cast.damangeCriticalHits} effective: {formatThousands(cast.damangeCriticalEffective)} absorbed: {formatThousands(cast.damangeCriticalAbsorbed)}
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            <div className="col-md-6">
              Pre-combat buffs:
              <ul className="list">
                {combatant._combatantInfo.auras.map((aura, i) => {
                  const source = parser.combatants.players[aura.source];
                  const spec = source && SPECS[source.specId];
                  const specClassName = spec && spec.className.replace(' ', '');

                  return (
                    <li key={`${i}-${aura.ability}`}>
                      <SpellLink id={aura.ability}>
                        <Icon icon={aura.icon} alt={aura.icon} style={{ height: '1.6em' }} /> {SPELLS[aura.ability] ? SPELLS[aura.ability].name : `spellID: ${aura.ability}`}
                      </SpellLink>{' '}
                      source: <span className={specClassName}>{source ? source.name : aura.source}</span>{' '}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="col-md-6">
              Items:
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
                    <SpellLink id={trait.spellID}>
                      <Icon icon={trait.icon} alt={trait.icon} style={{ height: '1.6em' }} /> {SPELLS[trait.id] ? SPELLS[trait.id].name : `spellID: ${trait.spellID}`}
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
