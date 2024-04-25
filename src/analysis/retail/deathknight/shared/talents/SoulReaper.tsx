import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { FightEndEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const SOUL_REAPER_EXECUTE_RANGE = 0.35;

class SoulReaper extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SOUL_REAPER_EXECUTE_RANGE;
  static countCooldownAsExecuteTime = true;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts: number = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_REAPER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.fightend, this.adjustMaxCasts);
    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(TALENTS.SOUL_REAPER_TALENT);
    ctor.executeSpells.push(SPELLS.SOUL_REAPER_TALENT_SECOND_HIT);

    (options.abilities as Abilities).add({
      spell: TALENTS.SOUL_REAPER_TALENT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: 6,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
        extraSuggestion:
          ' (This module only starts tracking possible casts once you damage a target with 35% or less health)',
      },
    });
  }

  adjustMaxCasts(event: FightEndEvent) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 6000);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.SOUL_REAPER_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulReaper;
