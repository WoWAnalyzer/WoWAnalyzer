import { Trans } from '@lingui/macro';
import { RuneForgeChecker } from 'analysis/retail/deathknight/shared';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { Options } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

class BloodRuneForgeChecker extends RuneForgeChecker {
  constructor(options: Options) {
    super(options);

    // Hysteria & FC need no suggestions for blood
    this.runeForges = [
      {
        forge: SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.stoneskinGargoyle">
            <SpellLink id={SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE.id} /> is a survivability runeforge
            at the cost of damage and healing. Use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> as there is no need for SSGs
            EHP increase right now.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_RAZORICE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.razorice">
            Don't use <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> as Blood Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SANGUINATION,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.sanguination">
            Don't use <SpellLink id={SPELLS.RUNE_OF_SANGUINATION.id} /> as Blood Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_APOCALYPSE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.apocalypse">
            Don't use <SpellLink id={SPELLS.RUNE_OF_APOCALYPSE.id} /> as Blood Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_UNENDING_THIRST,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.unendingThirst">
            Don't use <SpellLink id={SPELLS.RUNE_OF_UNENDING_THIRST.id} /> as Blood Death Knight,
            use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SPELLWARDING,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.spellwarding">
            Don't use <SpellLink id={SPELLS.RUNE_OF_SPELLWARDING.id} /> as Blood Death Knight, use{' '}
            <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
          </Trans>
        ),
      },
    ];
  }
}

export default BloodRuneForgeChecker;
