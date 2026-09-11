import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Combatants from 'parser/shared/modules/Combatants';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import SpellLink from 'interface/SpellLink';

const BASE_BLOOM_DURATION_MS = 6_000;
const RESILIENT_FLOURISHING_EXTRA_MS = 2_000;

interface BloomInstance {
  targetId: number;
  start: number;
  end: number;
}

/**
 * **Resilient Flourishing**
 * Hero Talent - Wildstalker
 *
 * Bloodseeker Vines and Symbiotic Blooms last 2 additional sec.
 *
 * Choice node with Root Network — has its own statistic card, but is omitted from the
 * hero-tree total (that healing is already counted under Symbiotic Bloom sources).
 *
 * Symbiotic Blooms can stack/overlap, so HotTracker is a poor fit. Instead we track each
 * bloom instance and attribute ticks that occur after the base 6s (in the extra 2s window),
 * the same "healing after original end" idea HotTracker uses for base extensions.
 */
export default class ResilientFlourishing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  private readonly bloomDurationMs = BASE_BLOOM_DURATION_MS + RESILIENT_FLOURISHING_EXTRA_MS;

  private blooms: BloomInstance[] = [];

  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RESILIENT_FLOURISHING_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onBloomApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onBloomApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onBloomHeal,
    );
  }

  private onBloomApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.blooms.push({
      targetId: event.targetID,
      start: event.timestamp,
      end: event.timestamp + this.bloomDurationMs,
    });
  }

  private onBloomHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    const active = this.blooms.filter(
      (bloom) =>
        bloom.targetId === target.id &&
        bloom.start <= event.timestamp &&
        event.timestamp < bloom.end,
    );
    if (active.length === 0) {
      return;
    }

    const inExtension = active.filter(
      (bloom) => event.timestamp - bloom.start > BASE_BLOOM_DURATION_MS,
    );
    if (inExtension.length === 0) {
      return;
    }

    const portion = inExtension.length / active.length;
    const effective = event.amount + (event.absorbed || 0);
    this.healing += effective * portion;
    this.overhealing += (event.overheal || 0) * portion;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            Symbiotic Blooms last 6s baseline and 8s with this talent. Attributes ticks that occur
            during the final 2s of each bloom (after the base duration), proportional when multiple
            stacks overlap.
            <br />
            Not included in the Wildstalker hero-tree total. That healing is already counted under{' '}
            <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} /> sources (Thriving Growth /
            Implant / Twin Sprouts).
            <br />
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.RESILIENT_FLOURISHING_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
