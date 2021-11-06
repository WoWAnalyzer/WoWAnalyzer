import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import DispelTracker from 'parser/shared/modules/DispelTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

/**
 * Removes 1 Enrage and 1 Magic effect from an enemy target.
 *
 * TODO Revisit this module when we have more information
 */
class TranquilizingShot extends DispelTracker {
  static dependencies = {
    abilities: Abilities,
  };

  totalDispels: number = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.dispel.by(SELECTED_PLAYER), this.onDispel);

    (options.abilities as Abilities).add({
      spell: SPELLS.TRANQUILIZING_SHOT.id,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      cooldown: 10,
      gcd: {
        static: 1000,
      },
    });
  }

  onDispel() {
    this.totalDispels += 1;
  }

  statistic() {
    if (this.totalDispels > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(13)}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
        >
          <BoringSpellValueText spellId={SPELLS.TRANQUILIZING_SHOT.id}>
            <>{this.totalDispels}</>
          </BoringSpellValueText>
        </Statistic>
      );
    } else {
      return null;
    }
  }
}

export default TranquilizingShot;
