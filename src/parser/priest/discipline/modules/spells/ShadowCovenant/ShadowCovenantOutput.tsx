import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';

import AtonementDamageSource from '../../features/AtonementDamageSource';

type ShadowCovenantPasslist = Set<number>;

const SHADOW_COVENANT_DAMAGE_PASSLIST: ShadowCovenantPasslist = new Set([
  SPELLS.SHADOW_WORD_PAIN.id,
  SPELLS.SHADOW_WORD_DEATH.id,
  SPELLS.SCHISM_TALENT.id,
  SPELLS.MIND_SEAR.id,
  SPELLS.MINDGAMES.id,
  SPELLS.UNHOLY_TRANSFUSION.id,
]);

const SHADOW_COVENANT_HEALING_PASSLIST: ShadowCovenantPasslist = new Set([SPELLS.SHADOW_MEND.id]);

class ShadowCovenantOutput extends Analyzer {
  protected atonementDamageSource!: AtonementDamageSource;

  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };

  public bonusDamage = 0;
  public bonusAtonementHealing = 0;
  public bonusShadowHealing = 0;
  public abilityHealing = 0;

  /**
   * The bonus damage and healing from Shadow Covenant
   */
  static bonus = 0.25;

  constructor(options: Options) {
    super(options);

    // Bonus damage
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.handleDamage);

    // Bonus Atonement healing via 25% extra damage
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_NON_CRIT, SPELLS.ATONEMENT_HEAL_CRIT]),
      this.handleBonusAtonementHealing,
    );

    // Bonus healing via 25% healing buff (e.g. Shadowmend)
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_MEND),
      this.handleBonusShadowHealing,
    );

    // Healing done in global
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_COVENANT_TALENT),
      this.handleShadowCovenantHealing,
    );
  }

  // Handles the bonus damage from the damage buff
  handleDamage(e: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id)) {
      return;
    }

    if (SHADOW_COVENANT_DAMAGE_PASSLIST.has(e.ability.guid)) {
      this.bonusDamage += calculateEffectiveDamage(e, ShadowCovenantOutput.bonus);
    }
  }

  // Handles the bonus Atonement healing provided via the damage buff
  handleBonusAtonementHealing(e: HealEvent) {
    const damageSource = this.atonementDamageSource.event;
    if (!damageSource) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id)) {
      return;
    }

    if (SHADOW_COVENANT_DAMAGE_PASSLIST.has(damageSource.ability.guid)) {
      this.bonusAtonementHealing += calculateEffectiveHealing(e, ShadowCovenantOutput.bonus);
      console.log(this.bonusAtonementHealing, 'atonementHealing');
    }
  }

  // Handles the bonus Shadow healing done via the healing buff
  handleBonusShadowHealing(e: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SHADOW_COVENANT_BUFF.id)) {
      return;
    }
    if (!SHADOW_COVENANT_HEALING_PASSLIST.has(e.ability.guid)) {
      return;
    }

    this.bonusShadowHealing += calculateEffectiveHealing(e, ShadowCovenantOutput.bonus);
    console.log(this.bonusShadowHealing, 'from shadow healing');
  }

  handleShadowCovenantHealing(e: HealEvent) {
    this.abilityHealing += e.amount;
    console.log(this.abilityHealing, 'scov healing');
  }
}

export default ShadowCovenantOutput;
