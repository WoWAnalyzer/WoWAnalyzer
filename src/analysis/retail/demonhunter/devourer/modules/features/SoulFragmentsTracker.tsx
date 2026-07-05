import SPELLS from 'common/SPELLS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ChangeBuffStackEvent } from 'parser/core/Events';

export const MAX_SOUL_FRAGMENTS = 6;

class SoulFragmentsTracker extends Analyzer {
  soulsGenerated = 0;
  overcap = 0;
  soulsSpent = 0;
  currentSouls = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_DEVOUR),
      this.onChangeBuffStack,
    );
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    this.currentSouls = event.newStacks;

    if (event.oldStacks > MAX_SOUL_FRAGMENTS) {
      return;
    }

    if (event.oldStacks > event.newStacks) {
      this.soulsSpent += event.oldStacks - event.newStacks;
      return;
    }

    const gained = event.newStacks - event.oldStacks;
    this.soulsGenerated += gained;

    if (event.newStacks > MAX_SOUL_FRAGMENTS) {
      this.overcap += event.newStacks - MAX_SOUL_FRAGMENTS;
    }
  }
}

export default SoulFragmentsTracker;
