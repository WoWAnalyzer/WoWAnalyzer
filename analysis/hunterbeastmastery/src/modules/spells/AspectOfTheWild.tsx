import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { NESINGWARY_FOCUS_GAIN_MULTIPLIER } from '@wowanalyzer/hunter';
import { ASPECT_OF_THE_WILD_FOCUS } from '@wowanalyzer/hunter-beastmastery/src/constants';
import SpellUsable from '@wowanalyzer/hunter-beastmastery/src/modules/core/SpellUsable';

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

  additionalFocusFromNesingwary = 0;
  possibleAdditionalFocusFromNesingwary = 0;

  constructor(options: Options) {
    super(options);
    this.selectedCombatant.hasLegendary(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT) &&
      this.addEventListener(
        Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.ASPECT_OF_THE_WILD),
        this.checkNesingwaryFocusGain,
      );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ASPECT_OF_THE_WILD.id) / this.owner.fightDuration
    );
  }

  checkNesingwaryFocusGain(event: ResourceChangeEvent) {
    const waste = ASPECT_OF_THE_WILD_FOCUS - event.resourceChange;
    if (this.selectedCombatant.hasBuff(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE.id)) {
      this.additionalFocusFromNesingwary +=
        event.resourceChange * (1 - 1 / NESINGWARY_FOCUS_GAIN_MULTIPLIER) - waste;
      this.possibleAdditionalFocusFromNesingwary += ASPECT_OF_THE_WILD_FOCUS;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(5)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.ASPECT_OF_THE_WILD.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AspectOfTheWild;
