import React from 'react';
import { Options } from 'parser/core/Analyzer';
import { RuneForgeChecker } from 'parser/deathknight/shared/runeforges/RuneForgeChecker'

import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

class BloodRuneForgeChecker extends RuneForgeChecker {

  constructor(options: Options) {
    super(options);

    // Hysteria & FC need no suggestions for blood
    this.runeForges = [{
      forge: SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE,
      importance: SUGGESTION_IMPORTANCE.MAJOR,
      suggestion: <>
        <SpellLink id={SPELLS.RUNE_OF_THE_STONESKIN_GARGOYLE.id} /> is a survivability runeforge at the cost of damage and healing. Use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> as there is no need for SSGs EHP increase right now.
      </>
    }, {
      forge: SPELLS.RUNE_OF_RAZORICE,
      importance: SUGGESTION_IMPORTANCE.MAJOR,
      suggestion: <>
        Don't use <SpellLink id={SPELLS.RUNE_OF_RAZORICE.id} /> as Blood Death Knight, use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
      </>
    }, {
      forge: SPELLS.RUNE_OF_SANGUINATION,
      importance: SUGGESTION_IMPORTANCE.MAJOR,
      suggestion: <>
        Don't use <SpellLink id={SPELLS.RUNE_OF_SANGUINATION.id} /> as Blood Death Knight, use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
      </>
    }, {
      forge: SPELLS.RUNE_OF_APOCALYPSE,
      importance: SUGGESTION_IMPORTANCE.MAJOR,
      suggestion: <>
        Don't use <SpellLink id={SPELLS.RUNE_OF_APOCALYPSE.id} /> as Blood Death Knight, use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
      </>
    }, {
      forge: SPELLS.RUNE_OF_UNENDING_THIRST,
      importance: SUGGESTION_IMPORTANCE.MAJOR,
      suggestion: <>
        Don't use <SpellLink id={SPELLS.RUNE_OF_UNENDING_THIRST.id} /> as Blood Death Knight, use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
      </>
    }, {
      forge: SPELLS.RUNE_OF_SPELLWARDING,
      importance: SUGGESTION_IMPORTANCE.MAJOR,
      suggestion: <>
        Don't use <SpellLink id={SPELLS.RUNE_OF_SPELLWARDING.id} /> as Blood Death Knight, use <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> instead.
      </>
    }]
  }
}

export default BloodRuneForgeChecker