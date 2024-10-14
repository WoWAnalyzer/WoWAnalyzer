import { formatDuration, formatThousands } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Icon from 'interface/Icon';
import InformationIcon from 'interface/icons/Information';
import SpellLink from 'interface/SpellLink';
import Tooltip, { TooltipElement } from 'interface/Tooltip';
import { Ability, EventType, HasAbility, HasSource, HasTarget } from 'parser/core/Events';
import { useReducer } from 'react';
import Toggle from 'react-toggle';
import AutoSizer from 'react-virtualized-auto-sizer';
import Table, {
  Column,
  defaultRowRenderer as defaultTableRowRenderer,
} from 'react-virtualized/dist/commonjs/Table';

import 'react-toggle/style.css';
import 'react-virtualized/styles.css';
import './EventsTab.css';
import CombatLogParser from 'parser/core/CombatLogParser';
import { PetInfo } from 'parser/core/Pet';
import { EnemyInfo } from 'parser/core/Enemy';
import { PlayerInfo } from 'parser/core/Player';

interface FilterableType {
  name: string;
  explanation?: string;
  isFabricated?: boolean;
}

const FILTERABLE_TYPES: Record<string, FilterableType> = {
  damage: {
    name: 'Damage',
  },
  heal: {
    name: 'Heal',
  },
  healabsorbed: {
    name: 'Heal Absorbed',
    explanation:
      'Triggered in addition to the regular heal event whenever a heal is absorbed. Can be used to determine what buff or debuff was absorbing the healing. This should only be used if you need to know which ability soaked the healing.',
  },
  absorbed: {
    name: 'Absorb',
    explanation:
      'Triggered whenever an absorb effect absorbs damage. These are friendly shields to avoid damage and NOT healing absorption shields.',
  },
  begincast: {
    name: 'Begin Cast',
  },
  cast: {
    name: 'Cast Success',
    explanation:
      'Triggered whenever a cast was successful. Blizzard also sometimes uses this event type for mechanics and spell ticks or bolts.',
  },
  freecast: {
    name: 'Free Cast',
    explanation: 'Casts that we have detected might have been cast "for free."',
  },
  empowerstart: {
    name: 'Empower Start',
  },
  empowerend: {
    name: 'Empower End',
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
    explanation:
      'Triggered at the start of the fight with advanced combat logging on. This includes gear, talents, etc.',
  },
  resourcechange: {
    name: 'Resource Change',
  },
  drain: {
    name: 'Drain',
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
  dispel: {
    name: 'Dispel',
  },
  aurabroken: {
    name: 'Aura Broken',
  },
  leech: {
    name: 'Leech',
  },
  create: {
    name: 'Create',
  },
  extraattacks: {
    name: 'Extra Attacks',
    explanation: 'Typically triggered by Windfury Totem.',
  },
  updatespellusable: {
    name: 'Spell Usable',
    explanation:
      "Triggered when the ability's remaining cooldown is modified by an external effect",
    isFabricated: true,
  },
  changebuffstack: {
    name: 'Stacks Changed',
    isFabricated: true,
  },
} as const;
type FilterableEventType = keyof typeof FILTERABLE_TYPES;
const filterableEventTypes = Object.keys(FILTERABLE_TYPES);
const isFilterableEventType = (str: string): str is FilterableEventType =>
  filterableEventTypes.includes(str);

const allFiltersOn = Object.entries(FILTERABLE_TYPES).reduce(
  (acc, [k]) => ({ ...acc, [k]: true }),
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as Record<FilterableEventType, boolean>,
);
const allFiltersOff = Object.entries(FILTERABLE_TYPES).reduce(
  (acc, [k]) => ({ ...acc, [k]: false }),
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as Record<FilterableEventType, boolean>,
);

const findEntity = (parser: CombatLogParser, id: number) => {
  const friendly = parser.report.friendlies.find((friendly) => friendly.id === id);
  if (friendly) {
    return friendly;
  }
  const enemy = parser.report.enemies.find((enemy) => enemy.id === id);
  if (enemy) {
    return enemy;
  }
  const enemyPet = parser.report.enemyPets.find((enemyPet) => enemyPet.id === id);
  if (enemyPet) {
    return enemyPet;
  }
  const pet = parser.playerPets.find((pet) => pet.id === id);
  if (pet) {
    return pet;
  }
  return null;
};

const getEventTypeName = (name: string, isRawNames: boolean) => {
  if (!isFilterableEventType(name)) {
    return name;
  }
  return isRawNames ? name : FILTERABLE_TYPES[name].name;
};

const getEventTypeExplanation = (name: string) => {
  if (!isFilterableEventType(name)) {
    return undefined;
  }
  const eventType = FILTERABLE_TYPES[name];
  return 'explanation' in eventType ? eventType.explanation : undefined;
};

const getEventTypeIsFabricated = (name: string) => {
  return FILTERABLE_TYPES[name]?.isFabricated ?? false;
};

const EntityCell = ({ entity }: { entity: PlayerInfo | PetInfo | EnemyInfo | null }) => {
  if (!entity) {
    return null;
  }
  return <span className={entity.subType || entity.type}>{entity.name}</span>;
};

const AbilityCell = ({ ability }: { ability: Ability | null }) => {
  if (!ability) {
    return null;
  }
  const spellId = ability.guid;

  return (
    <>
      <SpellLink spell={spellId} icon={false}>
        {ability.abilityIcon && <Icon icon={ability.abilityIcon} />} {ability.name}
      </SpellLink>{' '}
      <small>ID: {spellId}</small>
    </>
  );
};

const EventTabsToggle = ({
  checked,
  id,
  label,
  onChange,
  explanation,
}: {
  checked: boolean;
  id: string;
  label: string;
  onChange: () => void;
  explanation?: string;
}) => {
  return (
    <div className="flex toggle-control">
      <label className="flex-main" htmlFor={`${id}-toggle`}>
        {label}
      </label>
      {explanation && (
        <div className="flex-sub" style={{ padding: '0 10px' }}>
          <Tooltip content={explanation}>
            <div>
              <InformationIcon style={{ fontSize: '1.4em' }} />
            </div>
          </Tooltip>
        </div>
      )}
      <Toggle
        checked={checked}
        icons={false}
        onChange={onChange}
        id={`${id}-toggle`}
        className="flex-sub"
      />
    </div>
  );
};

type Action =
  | { type: 'turnAllOff' }
  | { type: 'updateSearch'; search: string }
  | { type: 'toggleShowFabricated' }
  | { type: 'toggleRawNames' }
  | { type: 'toggleEventType'; eventType: FilterableEventType };

interface State {
  rawNames: boolean;
  showFabricated: boolean;
  search: string;
  types: Record<FilterableEventType, boolean>;
}

const defaultState: State = {
  rawNames: false,
  showFabricated: false,
  search: '',
  types: allFiltersOn,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'turnAllOff':
      return { ...state, types: allFiltersOff };
    case 'updateSearch':
      return { ...state, search: action.search };
    case 'toggleShowFabricated':
      return { ...state, showFabricated: !state.showFabricated };
    case 'toggleRawNames':
      return { ...state, rawNames: !state.rawNames };
    case 'toggleEventType':
      return {
        ...state,
        types: { ...state.types, [action.eventType]: !state.types[action.eventType] },
      };
    default:
      return { ...state };
  }
};

const backgroundClass = (rowData: any) => {
  const classes = [];
  if (rowData.__modified) {
    classes.push('modified');
  }
  if (rowData.__fabricated) {
    classes.push('fabricated');
  }
  if (rowData.__reordered) {
    classes.push('reordered');
  }
  return classes.join('-');
};

interface EventsTabFnProps {
  parser: CombatLogParser;
}
export default function EventsTabFn({ parser }: EventsTabFnProps) {
  const [{ rawNames, showFabricated, search, types }, dispatch] = useReducer(reducer, defaultState);

  const regex = /"([^"]*)"|(\S+)/g;
  const searchTerms = (search.match(regex) || []).map((m) => m.replace(regex, '$1$2'));

  const events = parser.eventHistory.filter((event) => {
    if (isFilterableEventType(event.type) && !types[event.type]) {
      return false;
    }
    if (!showFabricated && event.__fabricated === true) {
      return false;
    }

    // Search Logic
    if (searchTerms.length === 0) {
      return true;
    }

    const source = HasSource(event) ? findEntity(parser, event.sourceID) : null;
    const target = HasTarget(event) ? findEntity(parser, event.targetID) : null;

    return searchTerms.some((searchTerm) => {
      if (HasAbility(event)) {
        if (String(event.ability.guid) === searchTerm) {
          return true;
        } else if (event.ability.name && event.ability.name.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
      if (source !== null && source.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (target !== null && target.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (event.type !== null && event.type.toLowerCase().includes(searchTerm)) {
        return true;
      }
      return false;
    });
  });

  return (
    <div className="panel">
      <div className="panel-heading">
        <h1>Events</h1>
        <small>This only includes events involving the selected player.</small>
      </div>
      <div className="panel-body events-tab flex">
        <div className="flex-sub config" style={{ padding: '0 15px' }}>
          <input
            type="text"
            name="search"
            className="form-control"
            onChange={(event) =>
              dispatch({ type: 'updateSearch', search: event.target.value.trim().toLowerCase() })
            }
            placeholder="Search events"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <br />
          {filterableEventTypes.filter(isFilterableEventType).map((type) => {
            if (!getEventTypeIsFabricated(type) || showFabricated) {
              return (
                <EventTabsToggle
                  key={type}
                  checked={types[type]}
                  id={type}
                  label={getEventTypeName(type, rawNames)}
                  explanation={getEventTypeExplanation(type)}
                  onChange={() => dispatch({ type: 'toggleEventType', eventType: type })}
                />
              );
            }
            return null;
          })}
          <br />
          <div className="flex" style={{ paddingLeft: 5 }}>
            <button className="btn btn-link" onClick={() => dispatch({ type: 'turnAllOff' })}>
              Toggle off all filters
            </button>
          </div>
          <br />
          <EventTabsToggle
            checked={showFabricated}
            id="showFabricated"
            label="Fabricated events"
            explanation="These events were not originally found in the combatlog. They were created by us to fix bugs, inconsistencies, or to provide new functionality. You can recognize these events by their green background."
            onChange={() => dispatch({ type: 'toggleShowFabricated' })}
          />
          <EventTabsToggle
            checked={rawNames}
            id="rawNames"
            label="Raw names"
            onChange={() => dispatch({ type: 'toggleRawNames' })}
          />
          <br />
          <div className="modified-legend" style={{ width: 240, padding: 10 }}>
            Events with an orange background were{' '}
            <TooltipElement content="This means some fields were added to provide additional context or changed to fix inconsistencies.">
              modified
            </TooltipElement>
            .
          </div>
          <div className="reordered-legend" style={{ width: 240, padding: 10 }}>
            Events with a blue background were{' '}
            <TooltipElement content="This means their order was changed from the original combatlog, typically to normalize the ordering of event sequences.">
              reordered
            </TooltipElement>
            .
          </div>
        </div>
        <div className="flex-main" style={{ background: 'hsla(44, 1%, 8%, 0.5)', paddingTop: 10 }}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <Table
                headerHeight={30}
                height={780}
                rowCount={events.length}
                rowGetter={({ index }) => events[index]}
                rowHeight={25}
                rowRenderer={(props) =>
                  defaultTableRowRenderer({
                    ...props,
                    className: `${props.className} ${backgroundClass(props.rowData)}`,
                  })
                }
                onRowClick={({ rowData }) => console.log(rowData)}
                width={width}
              >
                <Column
                  dataKey="timestamp"
                  label="Time"
                  cellRenderer={({ cellData }) =>
                    formatDuration(cellData - parser.fight.start_time + parser.fight.offset_time, 3)
                  }
                  disableSort
                  width={25}
                  flexGrow={1}
                />
                <Column
                  dataKey="type"
                  label="Event"
                  cellRenderer={({ cellData }) => (
                    <div className={cellData}>{getEventTypeName(cellData, rawNames)}</div>
                  )}
                  disableSort
                  width={50}
                  flexGrow={1}
                />
                <Column
                  dataKey="sourceID"
                  label="Source"
                  cellRenderer={({ cellData }) => (
                    <EntityCell entity={findEntity(parser, cellData)} />
                  )}
                  disableSort
                  width={50}
                  flexGrow={1}
                />
                <Column
                  dataKey="targetID"
                  label="Target"
                  cellRenderer={({ cellData }) => (
                    <EntityCell entity={findEntity(parser, cellData)} />
                  )}
                  disableSort
                  width={50}
                  flexGrow={1}
                />
                <Column
                  dataKey="ability"
                  label="Ability"
                  cellRenderer={({ cellData }) => <AbilityCell ability={cellData} />}
                  disableSort
                  width={160}
                  flexGrow={1}
                />
                <Column
                  dataKey="effective"
                  label="Amount"
                  className="effect"
                  cellRenderer={({ rowData }) => {
                    if (rowData.type === EventType.Damage) {
                      return (
                        <>
                          <span
                            className={`${rowData.type} ${
                              rowData.hitType === HIT_TYPES.CRIT ||
                              rowData.hitType === HIT_TYPES.BLOCKED_CRIT
                                ? 'crit'
                                : ''
                            }`}
                          >
                            {formatThousands(rowData.amount)}
                          </span>{' '}
                          {rowData.absorbed ? (
                            <span className="absorbed">A: {formatThousands(rowData.absorbed)}</span>
                          ) : null}{' '}
                          <img src="/img/sword.png" alt="Damage" className="icon" />
                        </>
                      );
                    }
                    if (rowData.type === EventType.Heal) {
                      return (
                        <>
                          <span
                            className={`${rowData.type} ${
                              rowData.hitType === HIT_TYPES.CRIT ||
                              rowData.hitType === HIT_TYPES.BLOCKED_CRIT
                                ? 'crit'
                                : ''
                            }`}
                          >
                            {formatThousands(rowData.amount)}
                          </span>{' '}
                          {rowData.absorbed ? (
                            <span className="absorbed">A: {formatThousands(rowData.absorbed)}</span>
                          ) : null}{' '}
                          <img src="/img/healing.png" alt="Healing" className="icon" />
                        </>
                      );
                    }
                    if (rowData.type === EventType.Absorbed) {
                      return (
                        <>
                          <span className={rowData.type}>{formatThousands(rowData.amount)}</span>{' '}
                          <img src="/img/absorbed.png" alt="Absorbed" className="icon" />
                        </>
                      );
                    }
                    if (rowData.type === EventType.ApplyBuff && rowData.absorb !== undefined) {
                      return (
                        <>
                          Applied an absorb of{' '}
                          <span className="absorbed">{formatThousands(rowData.absorb)}</span>{' '}
                          <img src="/img/absorbed.png" alt="Absorbed" className="icon" />
                        </>
                      );
                    }
                    if (
                      rowData.type === EventType.ResourceChange ||
                      rowData.type === EventType.Drain
                    ) {
                      const resource = RESOURCE_TYPES[rowData.resourceChangeType];
                      const change = rowData.resourceChange - (rowData.waste || 0);
                      if (resource) {
                        return (
                          <>
                            <span className={change < 0 ? 'negative' : undefined}>
                              {formatThousands(change)} {resource.name}
                            </span>{' '}
                            {resource.icon && <Icon icon={resource.icon} alt={resource.name} />}
                          </>
                        );
                      }
                    }
                    if (
                      rowData.type === EventType.ApplyBuffStack ||
                      rowData.type === EventType.ApplyDebuffStack ||
                      rowData.type === EventType.RemoveBuffStack ||
                      rowData.type === EventType.RemoveDebuffStack
                    ) {
                      const remove =
                        rowData.type === EventType.RemoveBuffStack ||
                        rowData.type === EventType.RemoveDebuffStack;
                      return (
                        <>
                          <span className={remove ? 'negative' : undefined}>
                            {`\u2794 ${rowData.stack} stack${rowData.stack === 1 ? '' : 's'}`}
                          </span>
                        </>
                      );
                    }
                    return null;
                  }}
                  disableSort
                  width={60}
                  flexGrow={1}
                />
                <Column
                  dataKey="rest"
                  label=""
                  className="effect"
                  cellRenderer={({ rowData }) => {
                    if (rowData.type === EventType.Damage) {
                      return (
                        <span className={rowData.type}>
                          {rowData.blocked ? (
                            <span className="overheal">B: {formatThousands(rowData.blocked)}</span>
                          ) : null}
                        </span>
                      );
                    }
                    if (rowData.type === EventType.Heal) {
                      return (
                        <span className={rowData.type}>
                          {rowData.overheal ? (
                            <span className="overheal">O: {formatThousands(rowData.overheal)}</span>
                          ) : null}
                        </span>
                      );
                    }
                    if (rowData.type === EventType.ResourceChange) {
                      const resource = RESOURCE_TYPES[rowData.resourceChangeType];
                      if (resource) {
                        return (
                          <>
                            <span className={resource.url}>
                              {rowData.waste > 0 ? `${formatThousands(rowData.waste)} wasted` : ''}
                            </span>
                          </>
                        );
                      }
                    }
                    return null;
                  }}
                  disableSort
                  width={25}
                  flexGrow={1}
                />
              </Table>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}
