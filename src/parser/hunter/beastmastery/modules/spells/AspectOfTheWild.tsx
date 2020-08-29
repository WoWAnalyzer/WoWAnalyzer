import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/hunter/beastmastery/modules/core/SpellUsable';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Grants you and your pet 5 Focus per sec and 10% increased critical strike
 * chance for 20 sec. Reduces GCD by 200ms before haste.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/39yhq8VLFrm7J4wR#fight=17&type=auras&source=8&ability=193530
 */

class AspectOfTheWild extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_THE_WILD), this.markCastAsInefficient);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ASPECT_OF_THE_WILD.id) / this.owner.fightDuration;
  }

  markCastAsInefficient(event: CastEvent) {
    if (event.meta === undefined) {
      event.meta = {
        isInefficientCast: false,
        inefficientCastReason: '',
      };
    }
    const hasPrimalInstincts = this.selectedCombatant.hasTrait(SPELLS.PRIMAL_INSTINCTS.id);
    const hasTwoBarbedStacks = this.spellUsable.chargesAvailable(SPELLS.BARBED_SHOT.id) === 2;

    if (hasPrimalInstincts && hasTwoBarbedStacks) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Aspect of the Wild was cast while having two charges of Barbed Shot and using Primal Instincts.';
      return;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ASPECT_OF_THE_WILD}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default AspectOfTheWild;
