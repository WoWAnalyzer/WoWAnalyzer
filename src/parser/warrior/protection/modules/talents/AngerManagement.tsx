import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent } from 'parser/core/Events';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

const COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT = [
  SPELLS.AVATAR_TALENT.id,
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
    if (!classResources || !classResources.cost) {
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
    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Spell</th>
            <th>Effective</th>
            <th>Wasted</th>
          </tr>
        </thead>
        <tbody>
          {COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.map(value => (
          <tr key={value}>
            <td>{SPELLS[value].name}</td>
            <td>{formatDuration(this.effectiveReduction[value] / 1000)}</td>
            <td>{formatDuration(this.wastedReduction[value] / 1000)}</td>
          </tr>
        ))}
        </tbody>
      </table>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={this.tooltip}
      >
      <BoringValueText label={<><SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> Possible cooldown reduction</>}>
        </BoringValueText>
      </Statistic>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AngerManagement;
