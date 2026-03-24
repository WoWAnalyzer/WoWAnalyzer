import type { JSX } from 'react';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BUFFER = 100; // ms between the two cast events

class TwinsOfTheSunPriestess extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  goodCasts = 0; // casts on allies
  badCasts = 0;  // casts on self
  lastCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.TWINS_OF_THE_SUN_PRIESTESS_TALENT,
    );
    if (!this.active) return;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_INFUSION_TALENT),
      this.onCast,
    );
  }

  get totalCasts() {
    return this.badCasts + this.goodCasts;
  }

  onCast(event: CastEvent) {
    // Deduplicate the two casts that happen for each usage
    if (event.timestamp - this.lastCast < BUFFER) {
      return; // ignore the second cast
    }

    // This is the first cast of the pair – classify it
    if (event.targetID === event.sourceID) {
      this.badCasts += 1;
    } else {
      this.goodCasts += 1;
    }

    // Manually start the 120-second cooldown for the real cast
    this.spellUsable.beginCooldown(event, TALENTS_PRIEST.POWER_INFUSION_TALENT.id);

    this.lastCast = event.timestamp;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT}>
          {formatNumber(this.goodCasts)}/{formatNumber(this.totalCasts)} Uses
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const allyPI = {
      count: this.goodCasts,
      label: 'Ally Casts',
    };

    const selfPI = {
      count: this.badCasts,
      label: 'Self Casts',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT} />
        </b>{' '}
        gives you <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> when used on an ally.
        <br />
        When taking this talent, make sure to always use it on an ally. By using it on yourself, you
        lose out on a free <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> for a raid member.
      </p>
    );

    const data = (
      <div>
        <strong>Power Infusion Casts</strong>
        <GradiatedPerformanceBar good={allyPI} bad={selfPI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default TwinsOfTheSunPriestess;