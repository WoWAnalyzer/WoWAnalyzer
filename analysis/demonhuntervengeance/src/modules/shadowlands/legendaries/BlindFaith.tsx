import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { ConsumeSoulFragmentsEvent } from '../../statistics/SoulFragmentsConsume';

/**
 * Blind Faith
 * Shadowlands legendary that buffs the player after casting Elysian Decree
 * for 20 seconds
 */
export default class BlindFaith extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  blindFaithActive = false;
  currentStacks = 0;
  stacksGained: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id) &&
      this.selectedCombatant.hasLegendary(SPELLS.BLIND_FAITH);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLIND_FAITH_BUFF),
      this.onBlindFaithGain,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLIND_FAITH_BUFF),
      this.onBlindFaithLoss,
    );
    this.addEventListener(EventType.ConsumeSoulFragments, this.onSoulFragmentsConsumed);
  }

  onBlindFaithGain() {
    this.blindFaithActive = true;
    // e.g. when recasting Decree while Urh is up, you lose internal stacks
    this.currentStacks = 0;
  }

  onBlindFaithLoss() {
    this.blindFaithActive = false;
    this.stacksGained.push(this.currentStacks);
    this.currentStacks = 0;
  }

  onSoulFragmentsConsumed(event: ConsumeSoulFragmentsEvent) {
    if (!this.blindFaithActive || this.currentStacks === 20) {
      return;
    }

    const nextStacks = event.numberofSoulFragmentsConsumed + this.currentStacks;
    this.currentStacks = nextStacks > 20 ? 20 : nextStacks;
  }

  statistic() {
    const avg = Math.round(
      this.stacksGained.reduce((acc, stacks) => acc + stacks, 0) / this.stacksGained.length,
    );

    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={SPELLS.BLIND_FAITH.id}>
          <>
            Ø {avg}% Versatility increase <small>per Elysian Decree.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
