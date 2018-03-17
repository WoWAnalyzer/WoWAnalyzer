import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer, Column, defaultTableRowRenderer, Table } from 'react-virtualized';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import Wrapper from 'common/Wrapper';
import { formatDuration, formatThousands } from 'common/format';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import 'react-virtualized/styles.css';
import './EventsTab.css';

const FILTERABLE_TYPES = {
  damage: 'Damage',
  heal: 'Heal',
  healabsorbed: 'Heal Absorbed',
  absorbed: 'Absorb',
  begincast: 'Begin Cast',
  cast: 'Cast Success',
  applybuff: 'Buff Apply',
  removebuff: 'Buff Remove',
  applybuffstack: 'Buff Stack Gained',
  removebuffstack: 'Buff Stack Lost',
  refreshbuff: 'Buff Refresh',
  applydebuff: 'Debuff Apply',
  removedebuff: 'Debuff Remove',
  applydebuffstack: 'Debuff Stack Gained',
  removedebuffstack: 'Debuff Stack Lost',
  refreshdebuff: 'Debuff Refresh',
  summon: 'Summon',
  combatantinfo: 'Player Info',
  energize: 'Energize',
  interrupt: 'Interrupt',
  death: 'Death',
  resurrect: 'Resurrect',
};

class EventsTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    // results: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      ...Object.keys(FILTERABLE_TYPES).reduce((obj, type) => {
        obj[type] = true;
        return obj;
      }, {}),
      rawNames: false,
    };
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  findEntity(id) {
    const friendly = this.props.parser.report.friendlies.find(friendly => friendly.id === id);
    if (friendly) {
      return friendly;
    }
    const enemy = this.props.parser.report.enemies.find(enemy => enemy.id === id);
    if (enemy) {
      return enemy;
    }
    return null;
  }
  renderEntity(entity) {
    if (!entity) {
      return null;
    }
    return <span className={entity.type}>{entity.name}</span>;
  }
  renderAbility(ability) {
    if (!ability) {
      return null;
    }
    const spellId = ability.guid;
    const exists = !!SPELLS[spellId];

    return (
      <a href={`http://www.wowhead.com/spell=${spellId}`} target="_blank" rel="noopener noreferrer" className={exists ? 'exists' : 'missing'}>
        <Icon icon={ability.abilityIcon} /> {ability.name}
      </a>
    );
  }
  eventTypeName(type) {
    return this.state.rawNames ? type : FILTERABLE_TYPES[type] || type;
  }

  renderToggle(id, name) {
    return (
      <div className="flex">
        <label className="flex-main" htmlFor={`${id}-toggle`}>
          {name}
        </label>
        <Toggle
          defaultChecked={this.state[id]}
          icons={false}
          onChange={event => this.setState({ [id]: event.target.checked })}
          id={`${id}-toggle`}
          className="flex-sub"
        />
      </div>
    );
  }
  renderRow(props) {
    const event = props.rowData;
    return defaultTableRowRenderer({
      ...props,
      className: `${props.className} ${(event.__fabricated || event.__modified) ? 'modified' : ''}`,
    });
  }
  handleRowClick({ rowData }) {
    console.log(rowData);
  }

  render() {
    const { parser } = this.props;

    const events = parser._debugEventHistory
      .filter(event => this.state[event.type] !== false);

    // TODO: Show active buffs like WCL
    // TODO: Allow searching for players by name
    // TODO: Pollish so this can be turned on for everyone

    return (
      <div className="events-tab flex">
        <div className="flex-sub config" style={{ padding: '10px 15px' }}>
          {Object.keys(FILTERABLE_TYPES).map(type => this.renderToggle(type, this.eventTypeName(type)))}
          <br />
          <div className="flex">
            <label className="flex-main" htmlFor="rawNames-toggle">
              Raw names
            </label>
            <Toggle
              defaultChecked={this.state.rawNames}
              icons={false}
              onChange={event => this.setState({ rawNames: event.target.checked })}
              id="rawNames-toggle"
              className="flex-sub"
            />
          </div>
        </div>
        <div className="flex-main" style={{ background: 'rgba(200, 200, 200, 0.05)', paddingTop: 10 }}>
          <AutoSizer disableHeight>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                height={700}
                rowCount={events.length}
                rowGetter={({ index }) => events[index]}
                rowHeight={25}
                rowRenderer={this.renderRow}
                onRowClick={this.handleRowClick}
                width={width}
              >
                <Column
                  dataKey="timestamp"
                  label="Time"
                  cellRenderer={({ cellData }) => formatDuration((cellData - parser.fight.start_time) / 1000, 3)}
                  disableSort
                  width={30}
                  flexGrow={1}
                />
                <Column
                  dataKey="type"
                  label="Event"
                  cellRenderer={({ cellData }) => <div className={cellData}>{this.eventTypeName(cellData)}</div>}
                  disableSort
                  width={50}
                  flexGrow={1}
                />
                <Column
                  dataKey="sourceID"
                  label="Source"
                  cellRenderer={({ cellData }) => this.renderEntity(this.findEntity(cellData))}
                  disableSort
                  width={50}
                  flexGrow={1}
                />
                <Column
                  dataKey="targetID"
                  label="Target"
                  cellRenderer={({ cellData }) => this.renderEntity(this.findEntity(cellData))}
                  disableSort
                  width={50}
                  flexGrow={1}
                />
                <Column
                  dataKey="ability"
                  label="Ability"
                  cellRenderer={({ cellData }) => this.renderAbility(cellData)}
                  disableSort
                  width={90}
                  flexGrow={1}
                />
                <Column
                  dataKey="effective"
                  label="Effective"
                  className="effect"
                  cellRenderer={({ rowData }) => {
                    if (rowData.type === 'damage') {
                      return (
                        <Wrapper>
                          <span className={`${rowData.type} ${rowData.hitType === HIT_TYPES.CRIT || rowData.hitType === HIT_TYPES.BLOCKED_CRIT ? 'crit' : ''}`}>
                            {formatThousands(rowData.amount)}
                          </span>{' '}
                          {rowData.absorbed ? <span className="absorbed">A: {formatThousands(rowData.absorbed)}</span> : null}{' '}
                          <img
                            src="/img/sword.png"
                            alt="Damage"
                            className="icon"
                          />
                        </Wrapper>
                      );
                    }
                    if (rowData.type === 'heal') {
                      return (
                        <Wrapper>
                          <span className={`${rowData.type} ${rowData.hitType === HIT_TYPES.CRIT || rowData.hitType === HIT_TYPES.BLOCKED_CRIT ? 'crit' : ''}`}>
                            {formatThousands(rowData.amount)}
                          </span>{' '}
                          {rowData.absorbed ? <span className="absorbed">A: {formatThousands(rowData.absorbed)}</span> : null}{' '}
                          <img
                            src="/img/healing.png"
                            alt="Healing"
                            className="icon"
                          />
                        </Wrapper>
                      );
                    }
                    if (rowData.type === 'absorbed') {
                      return (
                        <Wrapper>
                          <span className={rowData.type}>
                            {formatThousands(rowData.amount)}
                          </span>{' '}
                          <img
                            src="/img/absorbed.png"
                            alt="Absorbed"
                            className="icon"
                          />
                        </Wrapper>
                      );
                    }
                    if (rowData.type === 'energize') {
                      const resource = RESOURCE_TYPES[rowData.resourceChangeType];
                      if (resource) {
                        return (
                          <Wrapper>
                            <span className={resource.url}>
                              {formatThousands(rowData.resourceChange)} {resource.name}
                            </span>{' '}
                            <Icon icon={resource.icon} alt={resource.name} />
                          </Wrapper>
                        );
                      }
                    }
                    return null;
                  }}
                  disableSort
                  width={60}
                  flexGrow={1}
                />
                <Column
                  dataKey="rest"
                  label="Rest"
                  className="effect"
                  cellRenderer={({ rowData }) => {
                    if (rowData.type === 'damage') {
                      return (
                        <span className={rowData.type}>
                          {rowData.blocked ? <span className="overheal">B: {formatThousands(rowData.blocked)}</span> : null}
                        </span>
                      );
                    }
                    if (rowData.type === 'heal') {
                      return (
                        <span className={rowData.type}>
                          {rowData.overheal ? <span className="overheal">O: {formatThousands(rowData.overheal)}</span> : null}
                        </span>
                      );
                    }
                    return null;
                  }}
                  disableSort
                  width={35}
                  flexGrow={1}
                />
              </Table>
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

export default EventsTab;
