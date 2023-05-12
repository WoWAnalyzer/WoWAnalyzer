import TALENTS from 'common/TALENTS/hunter';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import DispelTracker from 'parser/shared/modules/DispelTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Removes 1 Enrage and 1 Magic effect from an enemy target.
 *
 */
class TranquilizingShot extends DispelTracker {
  static dependencies = {
    ...DispelTracker.dependencies,
    abilities: Abilities,
  };

  totalDispels: number = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TRANQUILIZING_SHOT_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.dispel.by(SELECTED_PLAYER), this.onDispel);

    (options.abilities as Abilities).add({
      spell: TALENTS.TRANQUILIZING_SHOT_TALENT.id,
      category: SPELL_CATEGORY.UTILITY,
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
          <BoringSpellValueText spellId={TALENTS.TRANQUILIZING_SHOT_TALENT.id}>
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
