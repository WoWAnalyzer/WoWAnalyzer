import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

import { RuneForgeChecker } from '@wowanalyzer/deathknight';

class FrostRuneForgeChecker extends RuneForgeChecker {
  constructor(options: Options) {
    super(options);

    // Hysteria & FC need no suggestions for blood
    this.runeForges = [
      {
        forge: SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.frost.runeforgeSuggestion.stoneskinGargoyle">
            <SpellLink id={SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE.id} /> is a survivability runeforge
            at the cost of damage and healing. Use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and/or{' '}
            <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SANGUINATION,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.frost.runeforgeSuggestion.sanguination">
            Don't use <SpellLink id={SPELLS.RUNE_OF_SANGUINATION.id} /> as Frost Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and/or{' '}
            <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_APOCALYPSE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.frost.runeforgeSuggestion.apocalypse">
            Don't use <SpellLink id={SPELLS.RUNE_OF_APOCALYPSE.id} /> as Frost Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and/or{' '}
            <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_UNENDING_THIRST,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.frost.runeforgeSuggestion.unendingThirst">
            Don't use <SpellLink id={SPELLS.RUNE_OF_UNENDING_THIRST.id} /> as Frost Death Knight,
            use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and/or{' '}
            <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SPELLWARDING,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.frost.runeforgeSuggestion.spellwarding">
            Don't use <SpellLink id={SPELLS.RUNE_OF_SPELLWARDING.id} /> as Frost Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and/or{' '}
            <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> instead.
          </Trans>
        ),
      },
    ];
  }
}

export default FrostRuneForgeChecker;
