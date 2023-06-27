
import { formatThousands, formatNumber } from 'common/format';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_SHAMAN } from 'common/TALENTS';

const ASTRAL_SHIFT_DR = 0.4;
const ASTRAL_BULWARK_ADDED_DR = 0.15;

class AstralShift extends Analyzer {
  damageReduced = 0;

  damageReductionPct: number = ASTRAL_SHIFT_DR;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT);

    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASTRAL_BULWARK_TALENT)) {
      this.damageReductionPct += ASTRAL_BULWARK_ADDED_DR;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  damageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT.id)) {
      return;
    }
    const damageTaken = event.amount + (event.absorbed || 0);
    this.damageReduced += (damageTaken / (1 - this.damageReductionPct)) * this.damageReductionPct;
  }

  get totalDrps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT.id} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label={<>Estimated damage reduced</>}
        tooltip={
          <>
            The total estimated damage reduced was {formatThousands(this.damageReduced)}.<br />
            <br />
            This is the lowest possible value. This value is pretty accurate for this log if you are
            looking at the actual gain over not having{' '}
            <SpellLink id={TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT.id} /> bonus at all, but the gain may
            end up higher when taking interactions with other damage reductions into account.
          </>
        }
      />
    );
  }
}

export default AstralShift;
