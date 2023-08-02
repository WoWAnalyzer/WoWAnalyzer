import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

import RageTracker from '../core/RageTracker';

const HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS = 1000;

class HeavyRepercussions extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };

  protected rageTracker!: RageTracker;

  sbExtended = 0;
  sbCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HEAVY_REPERCUSSIONS_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onSlamCast,
    );
  }

  onSlamCast(event: CastEvent) {
    this.sbCasts += 1;
    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }
    this.sbExtended += 1;
  }

  get shieldBlockuptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SHIELD_BLOCK_BUFF.id);
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.sbExtended / this.sbCasts,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try and cast <SpellLink spell={SPELLS.SHIELD_SLAM} />
          's during <SpellLink spell={SPELLS.SHIELD_BLOCK} /> to increase the uptime of{' '}
          <SpellLink spell={SPELLS.SHIELD_BLOCK} /> and the damage of{' '}
          <SpellLink spell={SPELLS.SHIELD_SLAM} />.
        </>,
      )
        .icon(TALENTS.HEAVY_REPERCUSSIONS_TALENT.icon)
        .actual(
          defineMessage({
            id: 'warrior.protection.suggestions.heavyRepercussions.shieldBlockCasts',
            message: `${formatPercentage(actual)}% cast during Shield Block`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    const sbExtendedMS = this.sbExtended * HEAVY_REPERCUSSIONS_SHIELD_BLOCK_EXTEND_MS;

    const rageByShieldSlam = this.rageTracker.getGeneratedBySpell(SPELLS.SHIELD_SLAM.id);
    const rageWastedByShieldSlam = this.rageTracker.getWastedBySpell(SPELLS.SHIELD_SLAM.id);
    const rageFromTalent = ((rageByShieldSlam + rageWastedByShieldSlam) / 18) * 3;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You casted Shield Slam {this.sbExtended} times during Shield Block, resulting in
            additional {sbExtendedMS / 1000} sec uptime.
            <br />
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.HEAVY_REPERCUSSIONS_TALENT} /> Extra Shield Block and Rage
            </>
          }
        >
          <>
            {formatPercentage(sbExtendedMS / (this.shieldBlockuptime - sbExtendedMS))}% <br />
            {rageFromTalent} <small>rage</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default HeavyRepercussions;
