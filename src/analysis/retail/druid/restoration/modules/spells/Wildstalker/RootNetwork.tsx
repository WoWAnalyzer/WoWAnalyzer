import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import SymbioticBloomDirectClaim from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/SymbioticBloomDirectClaim';

const BONUS_PER_STACK = 0.02;

/**
 * **Root Network**
 * Hero Talent - Wildstalker
 *
 * Each active Bloodseeker Vine increases the damage your abilities deal by 2%.
 * Each active Symbiotic Bloom increases the healing of your spells by 2%.
 *
 * Solo card uses full {@link healing}. Hero-tree {@link treeHealing} excludes amp on
 * Symbiotic Bloom ticks (those ticks are fully claimed by Thriving Growth / Implant / Twin).
 */
export default class RootNetwork extends Analyzer {
  static dependencies = {
    symbioticBloomDirectClaim: SymbioticBloomDirectClaim,
  };

  protected symbioticBloomDirectClaim!: SymbioticBloomDirectClaim;

  healing = 0;
  overhealing = 0;
  /** Hero-tree total; skips amp on SymBloom ticks. */
  treeHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.ROOT_NETWORK_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.ROOT_NETWORK_BUFF);
    const mult = BONUS_PER_STACK * stacks;
    if (mult <= 0) {
      return;
    }

    const amount = calculateEffectiveHealing(event, mult);
    this.healing += amount;
    this.overhealing += calculateOverhealing(event, mult);

    const claimed = this.symbioticBloomDirectClaim.getDirectClaimPortion(event);
    this.treeHealing += amount * (1 - claimed);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.ROOT_NETWORK_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
