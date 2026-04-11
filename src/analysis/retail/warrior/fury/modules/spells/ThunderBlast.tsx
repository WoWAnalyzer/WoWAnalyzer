import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import TALENTS from 'common/TALENTS/warrior';
import Spell from 'common/SPELLS/Spell';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';

const MS_BUFFER_100 = 100;

export default class ThunderBlast extends ExecuteHelper.withDependencies({
  abilities: Abilities,
}) {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [SPELLS.THUNDER_BLAST_BUFF];

  static executeSpells = [SPELLS.THUNDER_BLAST];
  static countCooldownAsExecuteTime = true;

  private lastAvatarCast = 0;
  private hasAvatarOfTheStorm = false;

  private maxCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.THUNDER_BLAST_TALENT);

    if (!this.active) {
      return;
    }

    this.hasAvatarOfTheStorm = this.selectedCombatant.hasTalent(TALENTS.AVATAR_OF_THE_STORM_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AVATAR_TALENT),
      this.onAvatarCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastApply,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastApplyStack,
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

  private onAvatarCast(event: CastEvent) {
    this.lastAvatarCast = event.timestamp;
  }

  private onThunderBlastApply(event: ApplyBuffEvent) {
    // if you cast avatar you gain 2 stacks of the buff with avatar of the storm talent
    if (this.hasAvatarOfTheStorm && event.timestamp - this.lastAvatarCast < MS_BUFFER_100) {
      this.maxCasts += 2;
    } else {
      this.maxCasts += 1;
    }
  }

  private onThunderBlastApplyStack() {
    this.maxCasts += 1;
  }
}
