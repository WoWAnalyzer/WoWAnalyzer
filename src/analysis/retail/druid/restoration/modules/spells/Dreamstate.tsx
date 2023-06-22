import { TALENTS_DRUID } from 'common/TALENTS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { formatNumber } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { DRUID_COOLDOWNS } from 'analysis/retail/druid/restoration/constants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const CDR_PER_TICK = 4000;

class Dreamstate extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  tickCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.DREAMSTATE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.tickCount += 1;
    DRUID_COOLDOWNS.forEach((id) => this.spellUsable.reduceCooldown(id, CDR_PER_TICK));
  }

  get totalCDR() {
    return CDR_PER_TICK * this.tickCount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Cooldown Reduction from all Tranquility casts:{' '}
            <strong>{(this.totalCDR / 1000).toFixed(0)} seconds</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.DREAMSTATE_TALENT}>
          <>
            {formatNumber(this.owner.getPerMinute(this.totalCDR) / 1000)} s{' '}
            <small>CDR per minute</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Dreamstate;
