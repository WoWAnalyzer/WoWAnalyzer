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
            <SpellLink spell={SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE} /> is a survivability runeforge
            at the cost of damage and healing. Use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> as there is no need for SSGs
            EHP increase right now.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_RAZORICE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.razorice">
            Don't use <SpellLink spell={SPELLS.RUNE_OF_RAZORICE} /> as Blood Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SANGUINATION,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.sanguination">
            Don't use <SpellLink spell={SPELLS.RUNE_OF_SANGUINATION} /> as Blood Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_APOCALYPSE,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.apocalypse">
            Don't use <SpellLink spell={SPELLS.RUNE_OF_APOCALYPSE} /> as Blood Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_UNENDING_THIRST,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.unendingThirst">
            Don't use <SpellLink spell={SPELLS.RUNE_OF_UNENDING_THIRST} /> as Blood Death Knight,
            use <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> instead.
          </Trans>
        ),
      },
      {
        forge: SPELLS.RUNE_OF_SPELLWARDING,
        importance: SUGGESTION_IMPORTANCE.MAJOR,
        suggestion: (
          <Trans id="deathknight.blood.runeforgeSuggestion.spellwarding">
            Don't use <SpellLink spell={SPELLS.RUNE_OF_SPELLWARDING} /> as Blood Death Knight, use{' '}
            <SpellLink spell={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER} /> instead.
          </Trans>
        ),
      },
    ];
  }
}

export default BloodRuneForgeChecker;
