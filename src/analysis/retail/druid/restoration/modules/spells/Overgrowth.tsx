import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, HealEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';
import HotAttributor from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Combatants from 'parser/shared/modules/Combatants';
import { isImplantFromOvergrowth } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

const BASE_BLOOM_DURATION_MS = 6_000;
const RESILIENT_FLOURISHING_EXTRA_MS = 2_000;

interface BloomInstance {
  targetId: number;
  start: number;
  end: number;
}

/**
 * **Overgrowth**
 *
 * Nature's Swiftness causes your next Regrowth to also apply Lifebloom,
 * Rejuvenation, and Wild Growth's heal over time effect.
 *
 * With Implant, that WG effect also grows a Symbiotic Bloom. Direct ticks are included
 * here and still counted under Implant.
 */
class Overgrowth extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
    combatants: Combatants,
  };

  hotAttributor!: HotAttributor;
  combatants!: Combatants;

  private hasImplant: boolean;
  private bloomDurationMs: number;
  private overgrowthImplantBlooms: BloomInstance[] = [];
  private implantHealing = 0;
  private implantOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT);
    this.hasImplant = this.selectedCombatant.hasTalent(TALENTS_DRUID.IMPLANT_TALENT);
    this.bloomDurationMs =
      BASE_BLOOM_DURATION_MS +
      (this.selectedCombatant.hasTalent(TALENTS_DRUID.RESILIENT_FLOURISHING_TALENT)
        ? RESILIENT_FLOURISHING_EXTRA_MS
        : 0);

    if (this.hasImplant) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
        this.onSymbioticBloomApply,
      );
      this.addEventListener(
        Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
        this.onSymbioticBloomApply,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
        this.onSymbioticBloomHeal,
      );
    }
  }

  private onSymbioticBloomApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (!isImplantFromOvergrowth(event)) {
      return;
    }

    this.overgrowthImplantBlooms.push({
      targetId: event.targetID,
      start: event.timestamp,
      end: event.timestamp + this.bloomDurationMs,
    });
  }

  private getOvergrowthImplantStacks(targetId: number, timestamp: number): number {
    return this.overgrowthImplantBlooms.filter(
      (bloom) => bloom.targetId === targetId && bloom.start <= timestamp && timestamp < bloom.end,
    ).length;
  }

  private onSymbioticBloomHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    const overgrowthStacks = this.getOvergrowthImplantStacks(target.id, event.timestamp);
    if (overgrowthStacks <= 0) {
      return;
    }

    const totalStacks = target.getBuffStacks(
      SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
      event.timestamp,
      0,
      0,
      this.selectedCombatant.id,
    );
    if (totalStacks <= 0) {
      return;
    }

    const portion = Math.min(overgrowthStacks, totalStacks) / totalStacks;
    this.implantHealing += (event.amount + (event.absorbed || 0)) * portion;
    this.implantOverhealing += (event.overheal || 0) * portion;
  }

  get hotHealing() {
    return this.hotAttributor.overgrowthAttrib.healing;
  }

  get totalHealing() {
    return this.hotHealing + this.implantHealing;
  }

  get totalOverhealing() {
    return this.hotAttributor.overgrowthAttrib.overheal + this.implantOverhealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total healing from HoTs attributed to{' '}
            <SpellLink spell={TALENTS_DRUID.OVERGROWTH_TALENT} /> on{' '}
            <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />
            -empowered <SpellLink spell={SPELLS.REGROWTH} /> casts.
            {this.hasImplant && this.implantHealing > 0 && (
              <>
                {' '}
                Includes direct healing from the <SpellLink
                  spell={TALENTS_DRUID.IMPLANT_TALENT}
                />{' '}
                <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} /> grown by Overgrowth's{' '}
                <SpellLink spell={SPELLS.WILD_GROWTH} /> effect.
              </>
            )}
            <ul>
              <li>
                Overgrowth HoTs:{' '}
                <strong>{this.owner.formatItemHealingDone(this.hotHealing)}</strong>
              </li>
              {this.hasImplant && this.implantHealing > 0 && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.IMPLANT_TALENT} />{' '}
                  <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} />:{' '}
                  <strong>{this.owner.formatItemHealingDone(this.implantHealing)}</strong>
                </li>
              )}
            </ul>
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.OVERGROWTH_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Overgrowth;
