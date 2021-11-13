import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

class RisingSunKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  lastBOK: number = Number.MIN_SAFE_INTEGER;
  lastRSK: number = Number.MIN_SAFE_INTEGER;
  rskResets: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK),
      this.risingSunKickCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.blackoutKickCast,
    );
  }

  risingSunKickCast(event: CastEvent) {
    // we are fine. Regular cast
    if (!this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
      this.lastRSK = event.timestamp;
      return;
    }

    if (this.lastBOK > this.lastRSK) {
      this.rskResets += 1;

      this.spellUsable.endCooldown(SPELLS.RISING_SUN_KICK.id);
    }

    this.lastRSK = event.timestamp;
  }

  blackoutKickCast(event: CastEvent) {
    this.lastBOK = event.timestamp;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(20)} size="flexible">
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.RISING_SUN_KICK.id} /> Resets
            </>
          }
        >
          <>{this.rskResets}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default RisingSunKick;
