import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { SpellInfo } from 'parser/core/EventFilter';
import Events, { CastEvent } from 'parser/core/Events';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import { Build } from '../../CONFIG';
import lowRankSpells, { whitelist } from '../../lowRankSpells';
import * as SPELLS from '../../SPELLS';

class SealOfCommand extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  isHighRankUsed = false;

  constructor(options: Options) {
    super(options);

    this.active = this.owner.build === Build.RET;

    const highRankSpells: SpellInfo[] = [
      SPELLS.SEAL_OF_COMMAND,
      ...lowRankSpells[SPELLS.SEAL_OF_COMMAND],
    ]
      .filter((spell) => !whitelist[SPELLS.SEAL_OF_COMMAND].includes(spell))
      .map((spell) => ({ id: spell }));

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(highRankSpells),
      this.onHighRankCasts,
    );
  }

  onHighRankCasts(event: CastEvent) {
    this.isHighRankUsed = true;
  }

  suggestions(when: When) {
    when(this.isHighRankUsed)
      .isTrue()
      .addSuggestion((suggest, _actual, _recommended) =>
        suggest(
          <>
            You should only use rank 1 <SpellLink id={whitelist[SPELLS.SEAL_OF_COMMAND][0]} /> for
            mana efficiency. As you always want to SealTwist out from this seal, the{' '}
            <SpellLink id={SPELLS.JUDGEMENT} /> damage effect from higher rank (
            <SpellLink id={SPELLS.SEAL_OF_COMMAND} />) is not used.
          </>,
        )
          .icon('ability_warrior_innerrage')
          .staticImportance(ISSUE_IMPORTANCE.MAJOR),
      );
  }
}

export default SealOfCommand;
