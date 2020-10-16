import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent, RefreshDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { SuggestionFactory, When } from 'parser/core/ParseResults';
import { Options } from 'parser/core/Module';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import SuggestionThresholds from '../../SuggestionThresholds';

class PurgeTheWicked extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };

  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  dotSpell: any;
  ptwCasts = 0;
  ptwApplications = 0;
  lastCastTarget: number = 0;
  ptwCleaveTracker: any = {};
  ptwCleaveDamage = 0;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id)) {
      this.dotSpell = SPELLS.PURGE_THE_WICKED_BUFF;
    } else {
      this.dotSpell = SPELLS.SHADOW_WORD_PAIN;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PURGE_THE_WICKED_TALENT]), this.onDotCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF), this.onDotApply);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF), this.onDotApply);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF), this.onDotRemove);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF), this.onDotDamage);
  }

  get uptime() {
    return this.enemies.getBuffUptime(this.dotSpell.id) / this.owner.fightDuration;
  }

  get extraPTWs() {
    return this.ptwApplications - this.ptwCasts;
  }

  onDotCast(event: CastEvent) {
    this.ptwCasts += 1;
    if (event.targetID) {
      this.lastCastTarget = event.targetID;
    }
  }

  onDotApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.ptwApplications += 1;

    if (event.targetID !== this.lastCastTarget) {
      this.ptwCleaveTracker[event.targetID] = 1;
    }
  }

  onDotRemove(event: RemoveDebuffEvent) {
    delete (this.ptwCleaveTracker[event.targetID]);
  }

  onDotDamage(event: DamageEvent) {
    if (this.ptwCleaveTracker[event.targetID]) {
      this.ptwCleaveDamage += event.amount + (event.absorbed || 0);
    }
  }

  suggestions(when: When) {
    const uptime = this.uptime || 0;

    when(uptime).isLessThan(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.minor)
      .addSuggestion((suggest: SuggestionFactory, actual: number, recommended: number) => suggest(<span>Your <SpellLink id={this.dotSpell.id} /> uptime can be improved.</span>)
          .icon(this.dotSpell.icon)
          .actual(i18n._(t('priest.discipline.suggestions.purgeTheWicked.uptime')`${formatPercentage(uptime)}% uptime`))
          .recommended(`>${formatPercentage(recommended, 0)}% is recommended`)
          .regular(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.regular).major(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.major));
  }

  statistic() {
    const uptime = this.uptime || 0;

    if (this.dotSpell === SPELLS.PURGE_THE_WICKED_BUFF) {
      return (
        <StatisticBox
          icon={<SpellIcon id={this.dotSpell.id} />}
          value={(
            <>
              {formatPercentage(uptime)}% Uptime <br />
              {this.extraPTWs} Extra DOTs<br />
            </>
          )}
          tooltip={`The additional dots contributed ${formatThousands(this.ptwCleaveDamage)} damage.`}
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
