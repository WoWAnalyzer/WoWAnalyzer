import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import {
  calculateEffectiveDamage,
  calculateEffectiveHealing,
  calculateOverhealing,
} from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import SPELLS from 'common/SPELLS';
import SymbioticBloomDirectClaim from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/SymbioticBloomDirectClaim';

const CAT_FORM_BUFF = 0.03;
const MOONFIRE_SUNFIRE_BUFF = 0.1;

/**
 * **Hunt Beneath the Open Skies**
 * Hero Talent - Wildstalker
 *
 * Damage and healing while in Cat Form increased by 3%.
 * Moonfire and Sunfire damage increased by 10%.
 *
 * Solo card uses full {@link healing}. Hero-tree {@link treeHealing} excludes amp on
 * Symbiotic Bloom ticks (those ticks are fully claimed by Thriving Growth / Implant / Twin).
 */
export default class HuntBeneathTheOpenSkies extends Analyzer {
  static dependencies = {
    symbioticBloomDirectClaim: SymbioticBloomDirectClaim,
  };

  protected symbioticBloomDirectClaim!: SymbioticBloomDirectClaim;

  healing = 0;
  overhealing = 0;
  /** Hero-tree total; skips amp on SymBloom ticks. */
  treeHealing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.HUNT_BENEATH_THE_OPEN_SKIES_TALENT,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  private onHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.CAT_FORM.id, event.timestamp)) {
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    const amount = calculateEffectiveHealing(event, CAT_FORM_BUFF);
    this.healing += amount;
    this.overhealing += calculateOverhealing(event, CAT_FORM_BUFF);

    const claimed = this.symbioticBloomDirectClaim.getDirectClaimPortion(event);
    this.treeHealing += amount * (1 - claimed);
  }

  private onDamage(event: DamageEvent) {
    let damageIncrease = 0;

    if (this.selectedCombatant.hasBuff(SPELLS.CAT_FORM.id, event.timestamp)) {
      damageIncrease += CAT_FORM_BUFF;
    }

    if (
      event.ability.guid === SPELLS.MOONFIRE_DEBUFF.id ||
      event.ability.guid === SPELLS.SUNFIRE.id
    ) {
      damageIncrease += MOONFIRE_SUNFIRE_BUFF;
    }

    if (damageIncrease > 0) {
      this.damage += calculateEffectiveDamage(event, damageIncrease);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.HUNT_BENEATH_THE_OPEN_SKIES_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
          <ItemPercentDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
