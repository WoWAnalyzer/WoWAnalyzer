import { RuneForgeChecker } from 'analysis/retail/deathknight/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

class FrostRuneForgeChecker extends RuneForgeChecker {
  constructor(options: Options) {
    super(options);

    this.runeForges = [
      {
        forge: SPELLS.RUNE_OF_SANGUINATION,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <>
            Don't use <SpellLink spell={SPELLS.RUNE_OF_SANGUINATION} /> as Frost Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> and/or{' '}
            <SpellLink spell={SPELLS.RUNE_OF_RAZORICE} /> instead.
          </>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_APOCALYPSE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <>
            Don't use <SpellLink spell={SPELLS.RUNE_OF_APOCALYPSE} /> as Frost Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> and/or{' '}
            <SpellLink spell={SPELLS.RUNE_OF_RAZORICE} /> instead.
          </>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_UNENDING_THIRST,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <>
            Don't use <SpellLink spell={SPELLS.RUNE_OF_UNENDING_THIRST} /> as Frost Death Knight,
            use <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> and/or{' '}
            <SpellLink spell={SPELLS.RUNE_OF_RAZORICE} /> instead.
          </>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SPELLWARDING,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <>
            Don't use <SpellLink spell={SPELLS.RUNE_OF_SPELLWARDING} /> as Frost Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> and/or{' '}
            <SpellLink spell={SPELLS.RUNE_OF_RAZORICE} /> instead.
          </>
        ),
      },
    ];
  }
}

export default FrostRuneForgeChecker;
