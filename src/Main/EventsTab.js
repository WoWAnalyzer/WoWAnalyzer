import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer, Column, defaultTableRowRenderer, Table } from 'react-virtualized';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import InformationIcon from 'Icons/Information';

import Wrapper from 'common/Wrapper';
import { formatDuration, formatThousands } from 'common/format';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import 'react-virtualized/styles.css';
import './EventsTab.css';

const FILTERABLE_TYPES = {
  damage: {
    name: 'Damage',
  },
  heal: {
    name: 'Heal',
  },
  healabsorbed: {
    name: 'Heal Absorbed',
    explanation: 'Triggered in addition to the regular heal event whenever a heal is absorbed. Can be used to determine what buff or debuff was absorbing the healing. This should only be used if you need to know which ability soaked the healing.',
  },
  absorbed: {
    name: 'Absorb',
    explanation: 'Triggered whenever an absorb effect absorbs damage. These are friendly shields to avoid damage and NOT healing absorption shields.',
  },
  begincast: {
    name: 'Begin Cast',
  },
  cast: {
    name: 'Cast Success',
    explanation: 'Triggered whenever a cast was successful. Blizzard also sometimes uses this event type for mechanics and spell ticks or bolts.',
  },
  applybuff: {
    name: 'Buff Apply',
  },
  removebuff: {
    name: 'Buff Remove',
  },
  applybuffstack: {
    name: 'Buff Stack Gained',
  },
  removebuffstack: {
    name: 'Buff Stack Lost',
  },
  refreshbuff: {
    name: 'Buff Refresh',
  },
  applydebuff: {
    name: 'Debuff Apply',
  },
  removedebuff: {
    name: 'Debuff Remove',
  },
  applydebuffstack: {
    name: 'Debuff Stack Gained',
  },
  removedebuffstack: {
    name: 'Debuff Stack Lost',
  },
  refreshdebuff: {
    name: 'Debuff Refresh',
  },
  summon: {
    name: 'Summon',
  },
  combatantinfo: {
    name: 'Player Info',
    explanation: 'Triggered at the start of the fight with advanced combat logging on. This includes gear, talents, etc.',
  },
  energize: {
    name: 'Energize',
  },
  interrupt: {
    name: 'Interrupt',
  },
  death: {
    name: 'Death',
  },
  resurrect: {
    name: 'Resurrect',
  },
};

class EventsTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
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
    return this.state.rawNames ? type : (FILTERABLE_TYPES[type] ? FILTERABLE_TYPES[type].name : type);
  }

  renderToggle(type) {
    const name = this.eventTypeName(type);
    const explanation = FILTERABLE_TYPES[type] ? FILTERABLE_TYPES[type].explanation : undefined;
    return (
      <div className="flex toggle-control">
        <label className="flex-main" htmlFor={`${type}-toggle`}>
          {name}
        </label>
        {explanation && (
          <div className="flex-sub" style={{ padding: '0 10px' }}>
            <div data-tip={explanation}>
              <InformationIcon style={{ fontSize: '1.4em' }} />
            </div>
          </div>
        )}
        <div className="flex-sub">
          <Toggle
            defaultChecked={this.state[type]}
            icons={false}
            onChange={event => this.setState({ [type]: event.target.checked })}
            id={`${type}-toggle`}
          />
        </div>
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
          {Object.keys(FILTERABLE_TYPES).map(type => this.renderToggle(type))}
          <br />
          <div className="flex toggle-control">
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
          <br />
          <div className="modified-legend" style={{ width: 240, padding: 10 }}>
            Events with an orange background were <dfn data-tip="This generally means their order was changed from the original combatlog to fix inconsistencies or bugs, but it may include other modifications.">modified</dfn>.
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
