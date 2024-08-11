import { formatNumber, formatPercentage } from 'common/format';
import rankingColor from 'common/getRankingColor';
import { getLabel as getDifficultyLabel } from 'game/DIFFICULTIES';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import { ItemLink, SpellLink } from 'interface';
import Icon from 'interface/Icon';
import { makePlainUrl } from 'interface/makeAnalyzerUrl';
import SpellIcon from 'interface/SpellIcon';
import { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Item } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import getTalentFromEntry from 'common/TALENTS/getTalentFromEntry';

const TRINKET_SLOTS = [GEAR_SLOTS.TRINKET1, GEAR_SLOTS.TRINKET2];

const styles = {
  icon: {
    width: '1.8em',
    height: '1.8em',
    marginRight: 2,
  },
};

interface ParseTalentEntry {
  entryID: number;
  rank: number;
}

export interface Parse {
  encounterId: number;
  name: string;
  spec: string;
  difficulty: number;
  size: number;
  report_code: string;
  report_fight: number;
  historical_percent: number;
  persecondamount: number;
  start_time: number;
  character_name: string;
  talents: (Spell | ParseTalentEntry)[];
  gear: Item[];
  advanced: boolean;
}

interface CharacterParsesListProps {
  parses: Parse[];
  class: string;
  metric: string;
  isClassic: boolean;
}

class CharacterParsesList extends PureComponent<CharacterParsesListProps> {
  iconPath(specName: string) {
    return `/specs/${this.props.class.replace(' ', '')}-${specName.replace(' ', '')}.jpg`;
  }

  itemFilter(item: Item, index: number) {
    return TRINKET_SLOTS.includes(index);
  }

  renderLegendaryEffect({ id, icon }: { name: string; id: number; icon: string }) {
    return (
      <SpellLink key={id} spell={id} icon={false}>
        <Icon
          icon={icon}
          style={{
            ...styles.icon,
            border: '1px solid',
          }}
        ></Icon>
      </SpellLink>
    );
  }
  renderItem(item: Item) {
    return (
      <ItemLink key={item.id} id={item.id} className={item.quality.toString()} icon={false}>
        <Icon
          icon={item.icon}
          style={{
            ...styles.icon,
            border: '1px solid',
          }}
        />
      </ItemLink>
    );
  }

  formatPerformance(elem: Parse) {
    const { metric } = this.props;
    return `${formatNumber(elem.persecondamount)} ${metric.toLocaleUpperCase()} (${formatPercentage(
      elem.historical_percent / 100,
      0,
    )}%)`;
  }

  render() {
    const { parses } = this.props;
    let detailIcons: (elem: Parse) => JSX.Element;

    if (this.props.isClassic) {
      detailIcons = (elem: Parse) => (
        <div className="col-md-2 text-center">
          {elem.advanced && elem.gear.filter(this.itemFilter).map(this.renderItem)}
        </div>
      );
    } else {
      detailIcons = (elem: Parse) => (
        <div className="col-md-4 flex wrapable">
          {elem.advanced &&
            Array.isArray(elem.talents) &&
            elem.talents.slice(0, 8).map((talent) => (
              <div key={'id' in talent ? talent.id : talent.entryID} className="flex-sub">
                <RetailTalentIcon {...talent} />
              </div>
            ))}
        </div>
      );
    }
    return (
      <ul className="list parses-list">
        {parses.map((elem) => {
          const url = makePlainUrl(
            elem.report_code,
            elem.report_fight.toString(),
            elem.difficulty + ' ' + elem.name,
            elem.advanced ? elem.character_name : '',
          );
          return (
            <li key={url}>
              <Link to={url}>
                <div className="row">
                  <div className="col-md-4" style={{ color: 'white' }}>
                    <div>
                      <img className="spec-icon" src={this.iconPath(elem.spec)} alt={elem.spec} />
                      <span className="difficulty">{getDifficultyLabel(elem.difficulty)}</span>
                      <span className="boss">{elem.name}</span>
                    </div>
                  </div>
                  {this.props.isClassic && (
                    <div className="col-md-2 text-center" style={{ color: 'white' }}>
                      {elem.advanced && elem.size} Player
                    </div>
                  )}
                  <div className="col-md-2 text-right">
                    <div className={rankingColor(elem.historical_percent / 100)}>
                      {this.formatPerformance(elem)}
                    </div>
                  </div>
                  {detailIcons(elem)}
                  <div className="col-md-2" style={{ color: 'white', textAlign: 'right' }}>
                    {new Date(elem.start_time).toLocaleDateString()}
                    {elem.advanced && (
                      <span
                        className="glyphicon glyphicon-chevron-right"
                        aria-hidden="true"
                        style={{ marginLeft: 10 }}
                      />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
}

function RetailTalentIcon(value: ParseTalentEntry | Spell): JSX.Element | null {
  if ('id' in value) {
    return <SpellIcon spell={value} />;
  }

  const spell = getTalentFromEntry({ id: value.entryID });
  return spell ? <SpellIcon spell={spell} /> : null;
}

export default CharacterParsesList;
