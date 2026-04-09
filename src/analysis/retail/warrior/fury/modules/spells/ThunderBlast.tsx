import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import TALENTS from 'common/TALENTS/warrior';
import Spell from 'common/SPELLS/Spell';
import Events from 'parser/core/Events';

export default class ThunderBlast extends ExecuteHelper.withDependencies({
  abilities: Abilities,
}) {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [SPELLS.THUNDER_BLAST_BUFF];

  static executeSpells = [SPELLS.THUNDER_BLAST];
  static countCooldownAsExecuteTime = true;

  private maxCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.THUNDER_BLAST_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastBuff,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastBuff,
    );

    this.deps.abilities.add({
      spell: SPELLS.THUNDER_BLAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: {
        base: 1500,
      },
      cooldown: (haste) => 6 / (1 + haste),
      castEfficiency: {
        maxCasts: () => this.maxCasts,
      },
    });
  }

  private onThunderBlastBuff() {
    this.maxCasts += 1;
  }
}
