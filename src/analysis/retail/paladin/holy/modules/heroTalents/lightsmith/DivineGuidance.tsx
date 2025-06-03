import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class DivineGuidance extends Analyzer {
  healingDone = 0;
  overhealing = 0;
  damageDone = 0;
  wastedStacks = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_GUIDANCE_TALENT);

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_GUIDANCE_BUFF),
      this.onRefresh,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_GUIDANCE_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_GUIDANCE_HEAL),
      this.onHeal,
    );
  }

  onRefresh(event: RefreshBuffEvent) {
    this.wastedStacks += 1;
  }

  onDamage(event: DamageEvent) {
    this.damageDone += event.amount + (event.absorbed || 0);
  }

  onHeal(event: HealEvent) {
    this.healingDone += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.healingDone)} <br />
            Overhealing: {formatNumber(this.overhealing)} <br />
            Damage Done: {formatNumber(this.damageDone)} <br />
            Wasted Stacks: {formatNumber(this.wastedStacks)}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.DIVINE_GUIDANCE_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDone} />
          </div>
          <div>
            <ItemDamageDone amount={this.damageDone} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DivineGuidance;
