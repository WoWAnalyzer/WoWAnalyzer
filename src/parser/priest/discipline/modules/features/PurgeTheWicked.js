import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SuggestionThresholds from '../../SuggestionThresholds';

class PurgeTheWicked extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };

  dotSpell;
  ptwCasts = 0;
  ptwApplications = 0;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id)) {
      this.dotSpell = SPELLS.PURGE_THE_WICKED_BUFF;
    } else {
      this.dotSpell = SPELLS.SHADOW_WORD_PAIN;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PURGE_THE_WICKED_TALENT]), this.onDotCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF), this.onDotApply);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF), this.onDotApply);
  }

  get uptime() {
    return this.enemies.getBuffUptime(this.dotSpell.id) / this.owner.fightDuration;
  }

  get extraPTWs() {
    return this.ptwApplications - this.ptwCasts;
  }

  get ptwDamage() {
    return this.abilityTracker.getAbility(SPELLS.PURGE_THE_WICKED_BUFF.id).damageEffective;
  }

  get bonusDamage() {
    // This is just a rough guess of how much extra damage you get from the extra PTW's
    if (this.ptwApplications === 0) {
      return 0;
    }
    const percentExtraPtw = this.extraPTWs / this.ptwApplications;
    return percentExtraPtw * this.ptwDamage;
  }

  onDotCast(event) {
    this.ptwCasts++;
  }

  onDotApply(event) {
    this.ptwApplications++;
  }

  suggestions(when) {
    const uptime = this.uptime || 0;

    when(uptime).isLessThan(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={this.dotSpell.id} /> uptime can be improved.</span>)
          .icon(this.dotSpell.icon)
          .actual(`${formatPercentage(uptime)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.regular).major(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.major);
      });
  }

  statistic() {
    const uptime = this.uptime || 0;

    if (this.dotSpell === SPELLS.PURGE_THE_WICKED_BUFF) {
      return (
        <StatisticBox
          icon={<SpellIcon id={this.dotSpell.id} />}
          value={(<>
            {formatPercentage(uptime)}% Uptime <br />
            {this.extraPTWs} Extra DOTs<br />
            <ItemDamageDone amount={this.bonusDamage} />
          </>)}
          tooltip={'The damage listed here only counts the bonus damage you get from additional PTW applications.'}
          label={`${this.dotSpell.name}`}
        />
      );
    } else {
      return (
        <StatisticBox
          icon={<SpellIcon id={this.dotSpell.id} />}
          value={`${formatPercentage(uptime)} %`}
          label={`${this.dotSpell.name} Uptime`}
        />
      );
    }

  }
  statisticOrder = STATISTIC_ORDER.CORE(10);

}

export default PurgeTheWicked;
