import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TotemElements, TOTEMS_BY_ELEMENT } from './totemConstants';
import TotemTracker from '../TotemTracker';

export default class BaseTotem extends Analyzer {
  static dependencies = {
    totemTracker: TotemTracker,
  };

  protected totemTracker!: TotemTracker;

  myTotemElement: TotemElements;

  constructor(options: Options, element: TotemElements) {
    super(options);
    this.myTotemElement = element;
  }

  totemTableRow = (spellId: number) => {
    if (!this.totemTracker.totemEvents(spellId)) {
      return null;
    }
    if (this.totemTracker.totemEvents(spellId).length === 0) {
      return null;
    }

    return (
      <tr key={spellId}>
        <td>
          <SpellLink spell={spellId} />
        </td>
        <td>{formatPercentage(this.totemTracker.totemUptimePercentage(spellId))}</td>
      </tr>
    );
  };

  TotemTableBody = () => (
    <tbody>
      {TOTEMS_BY_ELEMENT[this.myTotemElement].map(this.totemTableRow).filter((row) => Boolean(row))}
    </tbody>
  );

  TotemIcon = () => <SpellIcon spell={this.totemTracker.primaryTotemUsed(this.myTotemElement)} />;

  get suggestionThreshold() {
    return {
      actual: this.totemTracker.totemUptimePercentage(this.myTotemElement),
      isLessThan: {
        minor: 0.9, //Missed 1 target
        average: 0.8, //Missed 2 targets
        major: 0.7, //Missed more than 3 targets
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        position={STATISTIC_ORDER.UNIMPORTANT(89)}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>
                  <Trans id="classic.shaman.TotemTracker.TotemElement">Totem</Trans>
                </th>
                <th>
                  <Trans id="classic.shaman.TotemTracker.TotemElementUptime">Uptime</Trans>
                </th>
              </tr>
            </thead>

            {this.TotemTableBody()}
          </table>
        }
      >
        <BoringValue
          label={
            <>
              <this.TotemIcon /> {`${this.myTotemElement} Totem Uptime`}
            </>
          }
        >
          <UptimeIcon />{' '}
          {formatPercentage(this.totemTracker.totemUptimePercentage(this.myTotemElement))}%{' '}
          <small>uptime</small>
        </BoringValue>
      </Statistic>
    );
  }
}
