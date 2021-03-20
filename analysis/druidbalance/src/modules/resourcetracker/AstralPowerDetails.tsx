import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import AstralPowerTracker from './AstralPowerTracker';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.02;
const MAJOR_THRESHOLD = 0.05;

// When using the Balance Of All Things (BOAT) Legendary, it is expected to overcap a bit of Astral Power to have 90 AP available on entering an Eclipse
const MINOR_THRESHOLD_BOAT = 0.05;
const AVERAGE_THRESHOLD_BOAT = 0.07;
const MAJOR_THRESHOLD_BOAT = 0.1;

class AstralPowerDetails extends Analyzer {
  get wasted() {
    return this.astralPowerTracker.wasted || 0;
  }

  get total() {
    return this.astralPowerTracker.wasted + this.astralPowerTracker.generated || 0;
  }

  get wastedPerMinute() {
    return (this.wasted / this.owner.fightDuration) * 1000 * 60 || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get suggestionThresholdsWasted() {
    const usingBoat = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.bonusID,
    );

    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: usingBoat ? MINOR_THRESHOLD_BOAT : MINOR_THRESHOLD,
        average: usingBoat ? AVERAGE_THRESHOLD_BOAT : AVERAGE_THRESHOLD,
        major: usingBoat ? MAJOR_THRESHOLD_BOAT : MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };
  protected astralPowerTracker!: AstralPowerTracker;

  suggestions(when: When) {
    when(this.suggestionThresholdsWasted).addSuggestion((suggest, actual, recommended) =>
      suggest(
        `You overcapped ${this.wasted} Astral Power. Always prioritize spending it over avoiding the overcap of any other ability.`,
      )
        .icon('ability_druid_cresentburn')
        .actual(
          t({
            id: 'druid.balance.suggestions.astralPower.overcapped',
            message: `${formatPercentage(actual)}% overcapped Astral Power`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="small"
        tooltip={`${this.wasted} out of ${this.total} Astral Power wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.ASTRAL_POWER}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Overcapped Astral Power"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Astral Power usage',
      url: 'astral-power-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.astralPowerTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default AstralPowerDetails;
