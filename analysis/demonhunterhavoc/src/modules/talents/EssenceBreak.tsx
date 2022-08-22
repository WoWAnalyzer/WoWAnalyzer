import { formatThousands } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/*
  example report: https://www.warcraftlogs.com/reports/LvmF6W4C3TgcZxj8/#fight=last
 */

const DAMAGE_SPELLS = [
  DH_SPELLS.CHAOS_STRIKE_MH_DAMAGE,
  DH_SPELLS.CHAOS_STRIKE_OH_DAMAGE,
  DH_SPELLS.ANNIHILATION_MH_DAMAGE,
  DH_SPELLS.ANNIHILATION_OH_DAMAGE,
];
const DAMAGE_INCREASE = 0.4;

class EssenceBreak extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  extraDamage = 0;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(DH_TALENTS.ESSENCE_BREAK_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS), this.damage);
  }

  damage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasEssenceBreakDebuff = target.hasBuff(
      DH_SPELLS.ESSENCE_BREAK_DAMAGE.id,
      event.timestamp,
    );

    if (hasEssenceBreakDebuff) {
      this.extraDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatThousands(this.extraDamage)} total damage`}
      >
        <BoringSpellValueText spellId={DH_TALENTS.ESSENCE_BREAK_TALENT.id}>
          {this.owner.formatItemDamageDone(this.extraDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EssenceBreak;
