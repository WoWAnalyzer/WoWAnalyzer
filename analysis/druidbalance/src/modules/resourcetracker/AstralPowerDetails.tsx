import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink, Panel } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { cooldownAbility } from '../../constants';
import AstralPowerTracker from './AstralPowerTracker';

const MINOR_THRESHOLD = 0.05;
const AVERAGE_THRESHOLD = 0.1;
const MAJOR_THRESHOLD = 0.2;

// When using the Balance Of All Things (BOAT) Legendary,
// it is expected to overcap a bit of Astral Power to have 90 AP available on entering an Eclipse
const MINOR_THRESHOLD_BOAT = 0.1;
const AVERAGE_THRESHOLD_BOAT = 0.15;
const MAJOR_THRESHOLD_BOAT = 0.25;

// overcapping during Eclipse (or CDs) is extra bad
const MINOR_THRESHOLD_ECLIPSE = 0;
const AVERAGE_THRESHOLD_ECLIPSE = 0.02;
const MAJOR_THRESHOLD_ECLIPSE = 0.05;

/**
 * Deals with displaying Astral Power overcap issues.
 *
 * The badness of Astral Power waste varies with when it happens.
 * With the Balance of All Things legendary, some overcap while setting up Eclipse is fine,
 * and even without it it's not a big deal.
 * During Eclipse/CA/Incarn Astral Power waste is always very bad.
 */
class AstralPowerDetails extends Analyzer {
  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };
  protected astralPowerTracker!: AstralPowerTracker;

  eclipseTotal: number = 0;
  eclipseWaste: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.ASTRAL_POWER.id) {
      return;
    }
    if (
      this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id) ||
      this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id) ||
      this.selectedCombatant.hasBuff(SPELLS.CELESTIAL_ALIGNMENT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id)
    ) {
      this.eclipseTotal += event.resourceChange;
      this.eclipseWaste += event.waste;
    }
  }

  get wasted() {
    return this.astralPowerTracker.wasted || 0;
  }

  get total() {
    return this.astralPowerTracker.wasted + this.astralPowerTracker.generated || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get eclipseWastedPercent() {
    return this.eclipseWaste / this.eclipseTotal || 0;
  }

  get usingBoat() {
    return this.selectedCombatant.hasLegendaryByBonusID(SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.bonusID);
  }

  get suggestionThresholdsWasted() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: this.usingBoat ? MINOR_THRESHOLD_BOAT : MINOR_THRESHOLD,
        average: this.usingBoat ? AVERAGE_THRESHOLD_BOAT : AVERAGE_THRESHOLD,
        major: this.usingBoat ? MAJOR_THRESHOLD_BOAT : MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsEclipseWasted() {
    return {
      actual: this.eclipseWastedPercent,
      isGreaterThan: {
        minor: MINOR_THRESHOLD_ECLIPSE,
        average: AVERAGE_THRESHOLD_ECLIPSE,
        major: MAJOR_THRESHOLD_ECLIPSE,
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

  get suggestionThresholdsEclipse() {
    return {
      actual: 1 - this.eclipseWastedPercent,
      isGreaterThan: {
        minor: 1 - MINOR_THRESHOLD_ECLIPSE,
        average: 1 - AVERAGE_THRESHOLD_ECLIPSE,
        major: 1 - MAJOR_THRESHOLD_ECLIPSE,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsWasted).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${this.wasted} Astral Power. While some Astral Power waste is acceptable
        while setting up Eclipse or due to movement, you should always try and set yourself up to be
        able to spend it during Eclipse.`)
        .icon('ability_druid_cresentburn')
        .actual(
          t({
            id: 'druid.balance.suggestions.astralPower.overcapped',
            message: `${formatPercentage(actual)}% overcapped Astral Power`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    when(this.suggestionThresholdsEclipseWasted).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted {this.wasted} Astral Power during <SpellLink id={SPELLS.ECLIPSE.id} /> or{' '}
          <SpellLink id={cooldownAbility(this.selectedCombatant).id} />. Wasting Astral Power during
          Eclipse is very bad and should never happen. Always spend on
          <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> or{' '}
          <SpellLink id={SPELLS.STARFALL_CAST.id} /> before you overcap.
        </>,
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

  // TODO alter stat to show specifically wasted during Eclipse?
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
