import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Combatants from 'parser/shared/modules/Combatants';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';
import { formatNumber } from 'common/format';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import SpellLink from 'interface/SpellLink';
import SymbioticBloomDirectClaim from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/SymbioticBloomDirectClaim';
import Implant from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/Implant';
import TwinSprouts from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/TwinSprouts';

const VIGOROUS_CREEPERS_HEALING_INCREASE = 0.2;

/**
 * **Thriving Growth**
 * Hero Talent - Wildstalker (keystone)
 *
 * Wild Growth, Regrowth, and Efflorescence have a chance to grow Symbiotic Blooms.
 *
 * Credits leftover SymBloom ticks (not Implant/Twin), plus mastery while this talent
 * owns the oldest stack. Tree total is direct + mastery (VC sits on Vigorous Creepers).
 */
export default class ThrivingGrowth extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    lifebloom: Lifebloom,
    mastery: Mastery,
    symbioticBloomDirectClaim: SymbioticBloomDirectClaim,
    implant: Implant,
    twinSprouts: TwinSprouts,
  };

  protected combatants!: Combatants;
  protected lifebloom!: Lifebloom;
  protected mastery!: Mastery;
  protected symbioticBloomDirectClaim!: SymbioticBloomDirectClaim;
  protected implant!: Implant;
  protected twinSprouts!: TwinSprouts;

  private hasVigorousCreepers: boolean;

  directHealing = 0;
  directOverhealing = 0;
  masteryHealing = 0;
  vigorousCreepersHealing = 0;
  vigorousCreepersOverhealing = 0;
  everbloomHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.THRIVING_GROWTH_TALENT);
    this.hasVigorousCreepers = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (event.ability.guid === SPELLS.EVERBLOOM_SPLASH_HEAL.id) {
      this.handleEverbloomSplash(event);
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    if (event.ability.guid === SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id) {
      const implantPortion = this.implant.getDirectClaimPortion(event);
      const twinPortion = this.twinSprouts.getDirectClaimPortion(event);
      const portion = 1 - Math.min(1, implantPortion + twinPortion);
      if (portion <= 0) {
        return;
      }
      const effective = event.amount + (event.absorbed || 0);
      this.directHealing += effective * portion;
      this.directOverhealing += (event.overheal || 0) * portion;
      return;
    }

    if (!this.symbioticBloomDirectClaim.isMasteryOwner('thriving', target.id, event.timestamp)) {
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    const decomposed = this.mastery.decomposeHeal(event);
    if (decomposed) {
      this.masteryHealing += decomposed.oneStack;
    }

    if (this.hasVigorousCreepers) {
      this.vigorousCreepersHealing += calculateEffectiveHealing(
        event,
        VIGOROUS_CREEPERS_HEALING_INCREASE,
      );
      this.vigorousCreepersOverhealing += calculateOverhealing(
        event,
        VIGOROUS_CREEPERS_HEALING_INCREASE,
      );
    }
  }

  private handleEverbloomSplash(event: HealEvent) {
    if (!this.hasVigorousCreepers) {
      return;
    }

    const lbTargetId = this.lifebloom.activeLifebloomTarget;
    if (
      lbTargetId === undefined ||
      !this.symbioticBloomDirectClaim.isMasteryOwner('thriving', lbTargetId, event.timestamp)
    ) {
      return;
    }

    const amount = calculateEffectiveHealing(event, VIGOROUS_CREEPERS_HEALING_INCREASE);
    this.vigorousCreepersHealing += amount;
    this.vigorousCreepersOverhealing += calculateOverhealing(
      event,
      VIGOROUS_CREEPERS_HEALING_INCREASE,
    );
    this.everbloomHealing += amount;
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing + this.vigorousCreepersHealing;
  }

  /** Direct SymBloom + mastery only (VC is counted on Vigorous Creepers). */
  get treeTotalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  get reportedOverhealing() {
    return this.directOverhealing + this.vigorousCreepersOverhealing;
  }

  get reportedOverhealingEffectiveBase() {
    return this.directHealing + this.vigorousCreepersHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            Healing from <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} /> not already
            attributed to <SpellLink spell={TALENTS_DRUID.IMPLANT_TALENT} /> /{' '}
            <SpellLink spell={TALENTS_DRUID.TWIN_SPROUTS_TALENT} />:
            <ul>
              <li>
                Direct HoT healing: <strong>{formatNumber(this.directHealing)}</strong>
              </li>
              <li>
                Mastery benefit: <strong>{formatNumber(this.masteryHealing)}</strong> (while
                Thriving Growth owns the oldest active Symbiotic Bloom stack on the target)
              </li>
              {this.hasVigorousCreepers && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT} /> amp:{' '}
                  <strong>{formatNumber(this.vigorousCreepersHealing)}</strong>
                  {this.everbloomHealing > 0 && (
                    <>
                      {' '}
                      (includes <strong>{formatNumber(this.everbloomHealing)}</strong> from
                      Everbloom splash)
                    </>
                  )}
                </li>
              )}
            </ul>
            <strong>
              Overhealing:{' '}
              {formatOverhealing(this.reportedOverhealing, this.reportedOverhealingEffectiveBase)}
            </strong>{' '}
            (direct + Vigorous Creepers only)
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.THRIVING_GROWTH_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
