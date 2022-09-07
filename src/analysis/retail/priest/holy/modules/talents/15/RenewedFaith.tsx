import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const RENEWED_FAITH_MULTIPLIER = 1.1;

class RenewedFaith extends Analyzer {
  renewTracker: { [combatantId: number]: boolean } = {};
  rawAdditionalHealing: number = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RENEWED_FAITH_TALENT.id);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW),
      this.onRenewApplication,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW),
      this.onRenewRemoval,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get percentOverhealing() {
    if (this.rawAdditionalHealing === 0) {
      return 0;
    }
    return this.overhealing / this.rawAdditionalHealing;
  }

  onRenewApplication(event: ApplyBuffEvent) {
    this.renewTracker[event.targetID] = true;
  }

  onRenewRemoval(event: RemoveBuffEvent) {
    this.renewTracker[event.targetID] = false;
  }

  onHeal(event: HealEvent) {
    // If the character that you are healing has renew on them...
    if (this.renewTracker[event.targetID]) {
      // Calculate the amount of healing that we can attribute to this talent.
      const rawHealAmount = event.amount - event.amount / RENEWED_FAITH_MULTIPLIER;
      let effectiveHealAmount = rawHealAmount - (event.overheal || 0);
      // If we overhealed more than 100% of the contribution of RF, the effective heal is 0.
      if (effectiveHealAmount < 0) {
        effectiveHealAmount = 0;
      }
      const overhealAmount = rawHealAmount - effectiveHealAmount;

      this.rawAdditionalHealing += rawHealAmount;
      this.effectiveAdditionalHealing += effectiveHealAmount;
      this.overhealing += overhealAmount;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Total Healing: {formatNumber(this.rawAdditionalHealing)} (
            {formatPercentage(this.percentOverhealing)}% OH)
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spellId={SPELLS.RENEWED_FAITH_TALENT.id}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RenewedFaith;
