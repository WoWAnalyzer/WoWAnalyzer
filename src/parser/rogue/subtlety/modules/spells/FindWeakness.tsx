import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import Enemies from 'parser/shared/modules/Enemies';
import { t } from '@lingui/macro';
import Events, { CastEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/**
 * Find Weakness
 * Your Shadowstrike and Cheap Shot abilities reveal a flaw in your target's defenses, causing all your attacks to bypass 30%  of that enemy's armor for 18 sec.
 */
class FindWeakness extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  badVanishCasts = 0;
  latestTs = 0;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VANISH), this.handleVanish);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.FIND_WEAKNESS), this.onRefreshDebuff);
  }

  get vanishThresholds() {
    return {
      actual: this.badVanishCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onRefreshDebuff(event: RefreshDebuffEvent) {
    this.latestTs = event.timestamp;
  }

  handleVanish(event: CastEvent) {
    const entities = this.enemies.getEntities();
    const hasDebuff = Object.values(entities)
      .filter(enemy => enemy.hasBuff(SPELLS.FIND_WEAKNESS.id))
      .map(enemy => enemy.getBuff(SPELLS.FIND_WEAKNESS.id)?.timestamp || 0);

    //For now does not support target switching, just makes sure that enough time has passed since the last application
    if (Math.max(...hasDebuff, this.latestTs) > event.timestamp - 8000) {
      this.badVanishCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `Use Vanish only when Find Weakness is not up or is about to run out.`;
    }
  }

  suggestions(when: When) {
    when(this.vanishThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Use <SpellLink id={SPELLS.VANISH.id} /> only when you do not have <SpellLink id={SPELLS.FIND_WEAKNESS.id} /> applied to your target </>)
        .icon(SPELLS.VANISH.icon)
        .actual(t({
      id: "rogue.subtlety.suggestions.findWeakness.alreadyApplied",
      message: `You used Vanish ${this.badVanishCasts} times when Find Weakness was already applied`
    }))
        .recommended(`${recommended} is recommended`));
  }

  statistic() {
    const uptime = this.enemies.getBuffUptime(SPELLS.FIND_WEAKNESS.id) / this.owner.fightDuration;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText label={<><SpellIcon id={SPELLS.FIND_WEAKNESS.id} /> Find Weakness Uptime</>}>
          {formatPercentage(uptime)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FindWeakness;
