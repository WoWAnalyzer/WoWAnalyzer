import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';
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
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import SymbioticBloomDirectClaim from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/SymbioticBloomDirectClaim';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';

const VIGOROUS_CREEPERS_HEALING_INCREASE = 0.2;
const VIGOROUS_CREEPERS_DAMAGE_INCREASE = 0.04;

/**
 * **Vigorous Creepers**
 * Hero Talent - Wildstalker
 *
 * Bloodseeker Vines increase the damage your abilities deal to affected enemies by 4%.
 * Symbiotic Blooms increase the healing your spells do to affected targets by 20%.
 *
 * Solo card uses full {@link healing}. Tree total skips amp on SymBloom ticks
 * (already under Thriving Growth / Implant / Twin). Other heals and Everbloom splash stay.
 */
export default class VigorousCreepers extends Analyzer {
  healing = 0;
  overhealing = 0;
  /** Hero-tree total; skips amp on SymBloom ticks. */
  treeHealing = 0;
  everbloomHealing = 0;
  damage = 0;

  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    lifebloom: Lifebloom,
    symbioticBloomDirectClaim: SymbioticBloomDirectClaim,
  };
  protected combatants!: Combatants;
  protected enemies!: Enemies;
  protected lifebloom!: Lifebloom;
  protected symbioticBloomDirectClaim!: SymbioticBloomDirectClaim;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  private onHeal(event: HealEvent) {
    // Everbloom splash heals don't double-dip on healing increases.
    // Their amount is derived from the Lifebloom heal on the original target,
    // so we check if the Lifebloom target has Symbiotic Blooms instead.
    if (event.ability.guid === SPELLS.EVERBLOOM_SPLASH_HEAL.id) {
      this.handleEverbloomHeal(event);
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    const hasBuff = target.hasBuff(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER, event.timestamp, 0, 0);
    if (!hasBuff) {
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    const amount = calculateEffectiveHealing(event, VIGOROUS_CREEPERS_HEALING_INCREASE);
    this.healing += amount;
    this.overhealing += calculateOverhealing(event, VIGOROUS_CREEPERS_HEALING_INCREASE);

    const claimed = this.symbioticBloomDirectClaim.getDirectClaimPortion(event);
    this.treeHealing += amount * (1 - claimed);
  }

  /**
   * Everbloom splash healing is based on the Lifebloom target's heal amount,
   * which already includes the Vigorous Creepers bonus if the LB target has Symbiotic Blooms.
   * We attribute that bonus here by checking the LB target's buff, not the splash target's.
   */
  private handleEverbloomHeal(event: HealEvent) {
    const lbTargetId = this.lifebloom.activeLifebloomTarget;
    if (lbTargetId === undefined) {
      return;
    }

    const lbTarget = this.combatants.getEntities()[lbTargetId];
    if (!lbTarget) {
      return;
    }

    if (!lbTarget.hasBuff(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER, event.timestamp, 0, 0)) {
      return;
    }

    const amount = calculateEffectiveHealing(event, VIGOROUS_CREEPERS_HEALING_INCREASE);
    this.healing += amount;
    this.everbloomHealing += amount;
    this.overhealing += calculateOverhealing(event, VIGOROUS_CREEPERS_HEALING_INCREASE);
    // Splash is not Implant/Twin direct SymBloom healing; Implant/Twin nest their VC
    // copy out of the tree, so this stays in treeHealing.
    this.treeHealing += amount;
  }

  private onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target || !target.hasBuff(SPELLS.BLOODSEEKER_VINES, event.timestamp, 0, 0)) {
      return;
    }

    this.damage += calculateEffectiveDamage(event, VIGOROUS_CREEPERS_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            {this.everbloomHealing > 0 && (
              <>
                Includes <strong>{this.owner.formatItemHealingDone(this.everbloomHealing)}</strong>{' '}
                from Everbloom splash healing.
                <br />
              </>
            )}
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
          <ItemPercentDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
