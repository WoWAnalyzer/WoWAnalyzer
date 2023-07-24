import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Abilities from 'parser/core/modules/Abilities';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import GlobalCooldown from 'analysis/classic/shaman/enhancement/modules/core/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';

class Windstrike extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT];
  static modifiesDamage = false;
  static executeSpells: Spell[] = [SPELLS.WINDSTRIKE_CAST];
  static countCooldownAsExecuteTime = true;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
    haste: Haste,
  };

  maxCasts: number = 0;
  casts = 0;
  missedCasts = 0;
  timestamps = [0];

  protected abilities!: Abilities;
  protected haste!: Haste;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.onUpdateSpellUsableEvent,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.onCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
      this.enterEnabler,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
      this.leaveEnabler,
    );

    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.WINDSTRIKE_CAST);

    (options.abilities as Abilities).add({
      spell: SPELLS.WINDSTRIKE_CAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 3 / (1 + haste),
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 1,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  onUpdateSpellUsableEvent(event: UpdateSpellUsableEvent) {
    this.timestamps.push(event.timestamp);
  }

  onCast() {
    this.casts += 1;
  }

  calculateMissedCasts() {
    let waiting = 0;
    let castCount = 0;
    let totalCD = 0;

    //start at 2, so first calc is [2]-[1]. because [0] = 0, [1] = enter event timestamp, [2] is first spell timestamp.
    //Every even is a cast, and every odd is it coming off cooldown
    //Except the last timestamp is the enabling buff ending, and is not a cast or a cooldown.
    //If the last event is odd, then the enabling buff ends while spell is on cooldown, so we do not want to add this time to the average recharge time.

    for (let i = 2; i < this.timestamps.length; i += 2) {
      //even - odd; cast - recharge
      waiting += this.timestamps[i] - this.timestamps[i - 1];
    }

    for (let i = 3; i < this.timestamps.length - 1; i += 2) {
      //odd - even. recharge - cast
      totalCD += this.timestamps[i] - this.timestamps[i - 1];
      castCount += 1;
    }

    const averagecd = totalCD / castCount;

    this.missedCasts = this.missedCasts + Math.floor(waiting / averagecd);
    this.timestamps = [0];
  }

  enterEnabler(event: ApplyBuffEvent) {
    //reset the tracker of update timestamps.
    this.timestamps = [0];
    //to find the time between the first spell update and start of voidform we need to add it in here.
    this.timestamps.push(
      event.timestamp + GlobalCooldown.calculateGlobalCooldown(this.haste.current),
    );
  }

  leaveEnabler(event: RemoveBuffEvent) {
    //to find the time between the last spell update and end of event we need to add it in here.
    this.timestamps.push(event.timestamp);
    //Calculate missed potential casts during this event.
    this.calculateMissedCasts();
  }

  adjustMaxCasts() {
    this.maxCasts = this.missedCasts + this.casts;
  }
}

export default Windstrike;
