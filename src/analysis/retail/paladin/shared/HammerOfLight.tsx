import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/paladin';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

export default class HammerOfLight extends ExecuteHelper.withDependencies({
  abilities: Abilities,
}) {
  static executeSources = SELECTED_PLAYER;
  static executeSpells: Spell[] = [SPELLS.HAMMER_OF_LIGHT];
  static singleExecuteEnablers: Spell[] = [SPELLS.LIGHTS_DELIVERANCE_FREE_CAST_BUFF];

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(talents.LIGHTS_GUIDANCE_TALENT)) {
      this.active = false;
      return;
    }
    this.deps.abilities.add({
      spell: SPELLS.HAMMER_OF_LIGHT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: { base: 1500 },
      castEfficiency: {
        suggestion: true,
        maxCasts: () => this.totalCasts,
      },
    });

    // the action bar replacement from casting Eye of Tyr / Wake of Ashes doesn't log. have to do it manually
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([talents.EYE_OF_TYR_TALENT, talents.WAKE_OF_ASHES_TALENT]),
      this.activateHoL,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_LIGHT),
      this.deactivateHoL,
    );
  }

  private manualActivation: CastEvent | undefined = undefined;
  private activateHoL(event: CastEvent) {
    if (this.manualActivation) {
      this.refreshSingleExecuteEnablerBuff(event);
    } else {
      this.applySingleExecuteEnablerBuff(event);
    }
    this.manualActivation = event;
  }

  private deactivateHoL(event: CastEvent) {
    if (this.manualActivation) {
      // Light's Deliverance cannot trigger while HoL is available from Eye/Wake, so a manual activation followed by a cast
      // is ALWAYS a regular HoL cast
      const fakeEvent = {
        ...event,
        // overriding the ability makes tracking work
        ability: this.manualActivation.ability,
      };

      this.removeSingleExecuteEnablerBuff(fakeEvent);
      this.manualActivation = undefined;
    }
  }
}
