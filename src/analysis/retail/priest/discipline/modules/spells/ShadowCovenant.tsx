import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { DamageEvent, HealEvent, Ability } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SPELLS from 'common/SPELLS';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import ScovSourceDonut from './ShadowCovenant/ShadowCovSourceDonut';
import { SpellLink } from 'interface';

const SHADOW_BUFFED_HEALS = [
  SPELLS.DARK_REPRIMAND_HEAL.id,
  SPELLS.SHADOW_HALO_HEAL.id,
  SPELLS.SHADOW_DIVINE_STAR_HEAL.id,
  TALENTS_PRIEST.VAMPIRIC_EMBRACE_TALENT.id,
];

class ShadowCovenant extends Analyzer {
  bonus = 0;

  damage = 0;
  healing = 0;
  healingMap: Map<number, number> = new Map();
  abilityMap: Map<number, Ability> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.SHADOW_COVENANT_TALENT);

    this.bonus = this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWILIGHT_CORRUPTION_TALENT)
      ? 0.35
      : 0.25;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.SHADOW_COVENANT_TALENT),
      this.onHeal,
    );
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }
    const damageEvent = getDamageEvent(event);

    if (
      !this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id) ||
      // Shadow spells only
      damageEvent.ability.type !== 32 ||
      // no pets here
      damageEvent.ability.guid === -32
    ) {
      return;
    }

    this.attributeToMap(event.amount, damageEvent);
    this.healing += calculateEffectiveHealing(event, this.bonus);
  }

  private attributeToMap(amount: number, sourceEvent?: DamageEvent) {
    if (!sourceEvent) {
      return;
    }
    const { ability } = sourceEvent;

    // Set ability in map
    this.abilityMap.set(ability.guid, ability);

    // Attribute healing
    const currentValue = this.healingMap.get(ability.guid) || 0;
    this.healingMap.set(ability.guid, currentValue + amount);
  }

  onHeal(event: HealEvent) {
    if (event.ability.guid === TALENTS_PRIEST.SHADOW_COVENANT_TALENT.id) {
      this.healing += event.amount;
      return;
    }

    if (!SHADOW_BUFFED_HEALS.includes(event.ability.guid)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, this.bonus);
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id) ||
      // Shadow spells only
      event.ability.type !== 32 ||
      // no pets here
      event.ability.guid === -32
    ) {
      return;
    }

    this.damage += calculateEffectiveDamage(event, this.bonus);
  }

  statistic() {
    console.log(this.healingMap);
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={
          <>
            This value includes the base healing from{' '}
            <SpellLink id={TALENTS_PRIEST.SHADOW_COVENANT_TALENT.id} />, its healing amp on non
            atonement spells, and the bonus atonement healing caused by the damage amped. This
            number represents the 25% from{' '}
            <SpellLink id={TALENTS_PRIEST.SHADOW_COVENANT_TALENT.id} />, and the extra 10% amp from{' '}
            <SpellLink id={TALENTS_PRIEST.TWILIGHT_CORRUPTION_TALENT.id} /> if it is talented.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.SHADOW_COVENANT_TALENT.id}>
          <ItemHealingDone amount={this.healing} /> <br />
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
        <ScovSourceDonut abilityMap={this.abilityMap} healingMap={this.healingMap} />
      </Statistic>
    );
  }
}

export default ShadowCovenant;
