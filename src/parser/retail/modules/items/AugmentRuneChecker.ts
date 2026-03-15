import SPELLS from 'common/SPELLS/midnight/others';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

const AUGMENT_RUNE_IDS: number[] = [SPELLS.VOID_TOUCHED.id];

class AugmentRuneChecker extends Analyzer {
  startFightWithAugmentRuneUp = false;
  augmentRuneSpellId = 0;

  constructor(options: Options) {
    super(options);
    this.active = AUGMENT_RUNE_IDS.length > 0;
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent): void {
    const spellId = event.ability.guid;
    if (event.prepull && AUGMENT_RUNE_IDS.includes(spellId)) {
      this.startFightWithAugmentRuneUp = true;
      this.augmentRuneSpellId = spellId;
    }
  }

  get augmentRuneUptimePercentage(): number {
    return this.selectedCombatant.getBuffUptime(this.augmentRuneSpellId) / this.owner.fightDuration;
  }
}

export default AugmentRuneChecker;
