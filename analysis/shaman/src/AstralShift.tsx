import { Trans } from '@lingui/macro';
import { formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';

const ASTRAL_SHIFT_DR = 0.4;

class AstralShift extends Analyzer {
  damageReduced = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  damageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ASTRAL_SHIFT.id)) {
      return;
    }
    const damageTaken = event.amount + (event.absorbed || 0);
    this.damageReduced += (damageTaken / (1 - ASTRAL_SHIFT_DR)) * ASTRAL_SHIFT_DR;
  }

  get totalDrps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.ASTRAL_SHIFT.id} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label={<Trans id="shaman.shared.damageReduced.label">Estimated damage reduced</Trans>}
        tooltip={
          <Trans id="shaman.shared.damageReduced.tooltip">
            The total estimated damage reduced was {formatThousands(this.damageReduced)}.<br />
            <br />
            This is the lowest possible value. This value is pretty accurate for this log if you are
            looking at the actual gain over not having <SpellLink
              id={SPELLS.ASTRAL_SHIFT.id}
            />{' '}
            bonus at all, but the gain may end up higher when taking interactions with other damage
            reductions into account.
          </Trans>
        }
      />
    );
  }
}

export default AstralShift;
