import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { Fragment } from 'react';

/**
 * Every 20 Rage you spend reduces the remaining cooldown on Colossus Smash and Bladestorm by 1 sec.
 */

const RAGE_NEEDED_FOR_A_PROC = 20;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  cooldownsAffected = [
    this.selectedCombatant.hasTalent(TALENTS.WARBREAKER_TALENT)
      ? TALENTS.WARBREAKER_TALENT.id
      : SPELLS.COLOSSUS_SMASH.id,
    SPELLS.BLADESTORM.id,
  ];
  totalRageSpend = 0;
  wastedReduction: Map<number, number> = new Map<number, number>();
  effectiveReduction: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANGER_MANAGEMENT_TALENT);
    this.cooldownsAffected.forEach((e) => {
      this.wastedReduction.set(e, 0);
      this.effectiveReduction.set(e, 0);
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._onCast);
  }

  get tooltip() {
    return this.cooldownsAffected.map((id) => (
      <Fragment key={id}>
        {SPELLS[id].name}: {formatDuration(this.effectiveReduction.get(id) || 0)} reduction (
        {formatDuration(this.wastedReduction.get(id) || 0)} wasted)
        <br />
      </Fragment>
    ));
  }

  _onCast(event: CastEvent) {
    if (!event.classResources) {
      return;
    }
    const rage = event.classResources.find((e) => e.type === RESOURCE_TYPES.RAGE.id);
    if (!rage || !rage.cost) {
      return;
    }

    const rageSpend = rage.cost / 10;
    const reduction = (rageSpend / RAGE_NEEDED_FOR_A_PROC) * CDR_PER_PROC;
    this.cooldownsAffected.forEach((e) => {
      if (!this.spellUsable.isOnCooldown(e)) {
        this.wastedReduction.set(e, (this.wastedReduction.get(e) || 0) + reduction);
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(e, reduction);
        this.effectiveReduction.set(e, (this.effectiveReduction.get(e) || 0) + effectiveReduction);
        this.wastedReduction.set(
          e,
          (this.wastedReduction.get(e) || 0) + reduction - effectiveReduction,
        );
      }
    });
    this.totalRageSpend += rageSpend;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink spell={TALENTS.ANGER_MANAGEMENT_TALENT} /> CDR
          </>
        }
        value={`${formatDuration(
          (this.effectiveReduction.get(TALENTS.BLADESTORM_TALENT.id) || 0) +
            (this.wastedReduction.get(TALENTS.BLADESTORM_TALENT.id) || 0),
        )} min`}
        valueTooltip={<>{this.tooltip}</>}
      />
    );
  }
}

export default AngerManagement;
