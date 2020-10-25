import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';

import { formatPercentage } from 'common/format';
import Events, { CastEvent } from 'parser/core/Events';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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
    this.active = this.selectedCombatant.hasTalent(SPELLS.HEAVY_REPERCUSSIONS_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onSlamCast);
  }

  get shieldBlockuptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SHIELD_BLOCK_BUFF.id);
  }

  onSlamCast(event: CastEvent) {
    this.sbCasts += 1;
    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }
    this.sbExtended += 1;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.sbExtended / this.sbCasts,
      isLessThan: {
        minor: .9,
        average: .85,
        major: .80,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>Try and cast <SpellLink id={SPELLS.SHIELD_SLAM.id} />'s during <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> to increase the uptime of <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> and the damage of <SpellLink id={SPELLS.SHIELD_SLAM.id} />.</>)
            .icon(SPELLS.HEAVY_REPERCUSSIONS_TALENT.icon)
            .actual(i18n._(t('warrior.protection.suggestions.heavyRepercussions.shieldBlockCasts')`${formatPercentage(actual)}% cast during Shield Block`))
            .recommended(`${formatPercentage(recommended)}% is recommended`));
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
        tooltip={(
          <>
            You casted Shield Slam {this.sbExtended} times during Shield Block, resulting in additional {sbExtendedMS / 1000} sec uptime.<br />
          </>
        )}
      >
      <BoringValueText label={<><SpellLink id={SPELLS.HEAVY_REPERCUSSIONS_TALENT.id} /> Extra Shield Block and Rage</>}>
          <>
            {formatPercentage(sbExtendedMS / (this.shieldBlockuptime - sbExtendedMS))}% <br/>
            {rageFromTalent} <small>rage</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default HeavyRepercussions;
