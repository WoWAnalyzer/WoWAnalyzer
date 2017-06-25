import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'common/SPECS';
import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
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

class Item extends React.PureComponent {
  static propTypes = {
    item: PropTypes.object,
    slotNo: PropTypes.number,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
      itemData: null,
    };
  }

  viewItem(id) {
    this.setState({
      expanded: !this.state.expanded,
    });

    if (this.state.itemData) {
      return;
    }

    return fetch(`https://us.api.battle.net/wow/item/${id}?locale=en_US&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then(data => {
        this.setState({
          itemData: data,
        });
      });
  }

  renderCode() {
    const item = this.state.itemData;
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
        <div className="row" onClick={() => this.viewItem(item.id)}>
          <div className="col-md-3">
            {slotNo} {slot}
          </div>
          <div className="col-md-6">
            <ItemLink id={item.id} quality={item.quality} details={item}>
              <Icon icon={item.icon} alt={item.icon} style={{ height: '1.6em' }} /> itemID: {item.id}
            </ItemLink>
          </div>
          <div className="col-md-3">
            itemLevel: {item.itemLevel}
          </div>
        </div>

        {this.state.expanded && (
          <div>
            {this.state.itemData && this.state.itemData.id === item.id ? (
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

    return (
      <div>
        <div className="panel-heading">
          <h2>Development Tools</h2>
        </div>
        <div>
          <div className="row">
            <div className="col-md-6">
              Pre-combat buffs:
              <ul className="list">
                {combatant._combatantInfo.auras.map((aura, i) => {
                  const source = parser.combatants.players[aura.source];
                  const spec = source && SPECS[source.specId];
                  const specClassName = spec && spec.className.replace(' ', '');

                  return (
                    <li key={`${i}-${aura.ability}`}>
                      <a href={`//www.wowhead.com/spell=${aura.ability}`} target="_blank" rel="noopener noreferrer">
                        <Icon icon={aura.icon} alt={aura.icon} style={{ height: '1.6em' }} /> spellID: {aura.ability}
                      </a>{' '}
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
                    <a href={`http://www.wowhead.com/spell=${trait.spellID}`} target="_blank" rel="noopener noreferrer">
                      <Icon icon={trait.icon} alt={trait.icon} style={{ height: '1.6em' }} /> spellID: {trait.spellID}
                    </a>{' '}
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
