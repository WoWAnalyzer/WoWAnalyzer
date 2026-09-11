import { Trans } from '@lingui/react/macro';
import { formatThousands, formatNumber } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticBox from 'parser/ui/StatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import {
  MajorDefensiveBuff,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import type { ReactNode } from 'react';

const ASTRAL_SHIFT_DR = 0.4;
const ASTRAL_BULWARK_ADDED_DR = 0.15;

class AstralShift extends MajorDefensiveBuff {
  damageReduced = 0;

  damageReductionPct: number = ASTRAL_SHIFT_DR;

  constructor(options: Options) {
    super(TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT, buff(TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT);

    if (!this.active) {
      return;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASTRAL_BULWARK_TALENT)) {
      this.damageReductionPct += ASTRAL_BULWARK_ADDED_DR;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive(event) || event.sourceIsFriendly) {
      return;
    }

    const mitigatedAmount = absoluteMitigation(event, this.damageReductionPct);

    this.recordMitigation({
      event,
      mitigatedAmount,
    });

    this.damageReduced += mitigatedAmount;
  }

  get totalDrps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT} /> reduces damage taken by{' '}
        {this.damageReductionPct * 100}% while active.
      </p>
    );
  }

  statistic(): ReactNode {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon spell={TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label={<Trans id="shaman.shared.damageReduced.label">Estimated damage reduced</Trans>}
        tooltip={
          <Trans id="shaman.shared.damageReduced.tooltip">
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            The total estimated damage reduced was {formatThousands(this.damageReduced)}.<br />
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            This is the lowest possible value. This value is pretty accurate for this log if you are
            looking at the actual gain over not having{' '}
            <SpellLink spell={TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT} /> bonus at all, but the gain may
            end up higher when taking interactions with other damage reductions into account.
          </Trans>
        }
      />
    );
  }
}

export default AstralShift;
