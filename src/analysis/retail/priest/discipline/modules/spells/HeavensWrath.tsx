import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { DamageEvent } from 'parser/core/Events';
import { IsPenanceDamageEvent } from 'analysis/retail/priest/discipline/modules/spells/Helper';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatPercentage } from 'common/format';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

/** Heaven’s Wrath
 *  Each Penance bolt you fire reduces the cooldown of Ultimate Penitence by 2 seconds.
 */

class HeavensWrath extends Analyzer {
  wastedBolts = 0;
  totalBolts = 0;
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_PRIEST.ULTIMATE_PENITENCE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_PRIEST.HEAVENS_WRATH_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (!IsPenanceDamageEvent(event)) {
      return;
    }

    if (!this.spellUsable.isOnCooldown(SPELLS.ULTIMATE_PENITENCE_DAMAGE.id)) {
      this.wastedBolts += 1;
    }
    this.totalBolts += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Each <SpellLink spell={SPELLS.PENANCE} /> or{' '}
            <SpellLink spell={SPELLS.DARK_REPRIMAND_CAST} /> will reduce the remaining cooldown on{' '}
            <SpellLink spell={SPELLS.ULTIMATE_PENITENCE_DAMAGE} /> by 2 seconds. <br />
            You wasted {this.wastedBolts} out of {this.totalBolts} bolts. (
            {formatPercentage(this.wastedBolts / this.totalBolts)}%)
          </>
        }
      >
        <BoringSpellValue
          spell={SPELLS.ULTIMATE_PENITENCE_DAMAGE.id}
          value={this.wastedBolts}
          label={
            <>
              Wasted <SpellLink spell={SPELLS.PENANCE} /> or{' '}
              <SpellLink spell={SPELLS.DARK_REPRIMAND_CAST} /> bolts.
            </>
          }
        />
      </Statistic>
    );
  }
}

export default HeavensWrath;
