import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent } from 'parser/core/Events';

const COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT = [
  SPELLS.DEMORALIZING_SHOUT.id,
  SPELLS.AVATAR_TALENT.id,
  SPELLS.LAST_STAND.id,
  SPELLS.SHIELD_WALL.id,
];
const RAGE_NEEDED_FOR_A_PROC = 10;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  totalRageSpend = 0;
  wastedReduction: { [spellId: number]: number } = { };
  effectiveReduction: { [spellId: number]: number } = { };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach(e => {
      this.wastedReduction[e] = 0;
      this.effectiveReduction[e] = 0;
    });
  }

  onCast(event: CastEvent) {
    const classResources = event.classResources?.find(e => e.type === RESOURCE_TYPES.RAGE.id);
    if (!classResources) {
      return;
    }
    const rageSpend = classResources.cost / RAGE_NEEDED_FOR_A_PROC;
    const reduction = rageSpend / RAGE_NEEDED_FOR_A_PROC * CDR_PER_PROC;
    COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach(e => {
      if (!this.spellUsable.isOnCooldown(e)) {
        this.wastedReduction[e] += reduction;
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(e, reduction);
        this.effectiveReduction[e] += effectiveReduction;
        this.wastedReduction[e] += reduction - effectiveReduction;
      }
    });
    this.totalRageSpend += rageSpend;
  }

  get tooltip() {
    return COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.map(id => (
      <>{SPELLS[id].name}: {formatDuration(this.effectiveReduction[id] / 1000)} reduction ({formatDuration(this.wastedReduction[id] / 1000)} wasted)<br /></>
    ));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ANGER_MANAGEMENT_TALENT.id} />}
        value={`${formatDuration((this.effectiveReduction[SPELLS.DEMORALIZING_SHOUT.id] + this.wastedReduction[SPELLS.DEMORALIZING_SHOUT.id]) / 1000)} min`}
        label="Possible cooldown reduction"
        tooltip={this.tooltip}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AngerManagement;
