import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RemoveBuffEvent,
  DamageEvent,
  HealEvent,
  SummonEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

export default class BlessingOfTheForge extends Analyzer {
  damageDone = 0;
  healingDone = 0;
  extraSacredWeaponActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_THE_FORGE_TALENT);

    if (!this.active) return;

    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SACRED_WEAPON_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SACRED_WEAPON_BUFF),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_THE_FORGE_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_THE_FORGE_DAMAGE),
      this.onHeal,
    );
  }

  private onSummon(event: SummonEvent) {}

  private onApplyBuff(event: ApplyBuffEvent) {
    if (
      this.selectedCombatant.hasBuff(TALENTS.AVENGING_WRATH_TALENT.id) ||
      this.selectedCombatant.hasBuff(TALENTS.SENTINEL_TALENT.id)
    ) {
      this.extraSacredWeaponActive = true;
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.extraSacredWeaponActive = false;
  }

  private onDamage(event: DamageEvent) {
    if (this.extraSacredWeaponActive) {
      this.damageDone += event.amount + (event.absorbed || 0);
    }
  }

  private onHeal(event: HealEvent) {
    if (this.extraSacredWeaponActive) {
      this.healingDone += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.BLESSING_OF_THE_FORGE_TALENT}>
          <div>
            <ItemDamageDone amount={this.damageDone} />
          </div>
          <div>
            <ItemHealingDone amount={this.healingDone} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
