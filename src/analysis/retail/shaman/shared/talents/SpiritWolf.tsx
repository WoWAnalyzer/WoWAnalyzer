import { Trans } from '@lingui/macro';
import { formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK = 0.05;

class SpiritWolf extends Analyzer {
  damageReduced = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.SPIRIT_WOLF_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  damageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_WOLF_BUFF.id)) {
      return;
    }
    const stacks = this.selectedCombatant.getBuff(SPELLS.SPIRIT_WOLF_BUFF.id)?.stacks;
    if (!stacks) {
      return;
    }
    const damageTaken = event.amount + (event.absorbed || 0);
    this.damageReduced +=
      (damageTaken / (1 - SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK * stacks)) *
      (SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK * stacks);
  }

  get totalDrps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(45)}
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={TALENTS_SHAMAN.SPIRIT_WOLF_TALENT.id} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label={<Trans id="shaman.shared.damageReduced.label">Estimated damage reduced</Trans>}
        tooltip={
          <Trans id="shaman.shared.damageReduced.tooltip">
            The total estimated damage reduced was {formatThousands(this.damageReduced)}.<br />
            <br />
            This is the lowest possible value. This value is pretty accurate for this log if you are
            looking at the actual gain over not having{' '}
            <SpellLink id={TALENTS_SHAMAN.SPIRIT_WOLF_TALENT.id} /> bonus at all, but the gain may
            end up higher when taking interactions with other damage reductions into account.
          </Trans>
        }
      />
    );
  }
}

export default SpiritWolf;
