import { formatPercentage, formatThousands, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

/*Purpose of this module is to track the sigil of flame debuff and see when 2 of them overlap for a damage increase.
 * This is important for damage and also squeezing extra fire damage during Fiery Brand because of the
 * Fiery Demise talent that increases your fire damage during that CD. Also due to trait charred blades that heals
 * us for 15% of the fire damage we do it also increases our self healing.*/
class SigilOfFlame extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  successfulStack = 0;
  lastApplicationTimestamp = 0;
  currentApplicationTimestamp = 0;

  constructor(options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SIGIL_OF_FLAME_DEBUFF),
      this.onApplyDebuff,
    );
  }

  onApplyDebuff(event) {
    let timeStampDifference = null;
    if (this.lastApplicationTimestamp === 0) {
      this.lastApplicationTimestamp = event.timestamp;
      return;
    }
    this.currentApplicationTimestamp = event.timestamp;
    timeStampDifference = this.currentApplicationTimestamp - this.lastApplicationTimestamp;

    /*3 sec is the cut off because we want most of the 2 buffs to stack. So if the second
    buff application isnt within 3 seconds of the first its effectiveness is reduced quiet a bit*/
    if (timeStampDifference / 1000 < 3) {
      this.successfulStack += 1;
    }
    this.lastApplicationTimestamp = this.currentApplicationTimestamp;
  }

  statistic() {
    const sigilOfFlameUptime = this.enemies.getBuffUptime(SPELLS.SIGIL_OF_FLAME_DEBUFF.id);
    const sigilOfFlameUptimePercentage = sigilOfFlameUptime / this.owner.fightDuration;
    const sigilOfFlameDamage = this.abilityTracker.getAbility(
      SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
    ).damageEffective;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={
          <>
            Having two stacks of Sigil Of Flames on the boss is a damage increase.
            <br />
            <br />
            Sigil of Flame uptime: {formatPercentage(sigilOfFlameUptimePercentage)}% / (
            {formatDuration(sigilOfFlameUptime)})<br />
            Sigil of Flame total damage: {formatThousands(sigilOfFlameDamage)}.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id}>
          <>
            {this.successfulStack} <small>times</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SigilOfFlame;
