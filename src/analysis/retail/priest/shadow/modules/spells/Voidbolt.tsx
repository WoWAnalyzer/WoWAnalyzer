import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/priest';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Voidbolt extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [SPELLS.VOIDFORM_BUFF];
  static modifiesDamage = false;
  static executeSpells: Spell[] = [SPELLS.VOID_BOLT];
  static countCooldownAsExecuteTime = true;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts: number = 0;
  castVB = 0; //casts of Voidbolt
  miss = 0; //missed potential casts of Void Bolt
  VB = [0]; //timestamps of voidbolt spellusable updates

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT),
      this.onVBUpdate,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onVBCast);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.enterVoidform,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.leaveVoidform,
    );

    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.VOID_BOLT);

    (options.abilities as Abilities).add({
      spell: SPELLS.VOID_BOLT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 6 / (1 + haste),
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  onVBUpdate(event: UpdateSpellUsableEvent) {
    //this adds timestamps of voidbolt spellusable updates
    this.VB.push(event.timestamp);
  }

  onVBCast() {
    this.castVB += 1;
  }

  //VB is an unusal spell. It is likely that using ExecuteHelper would be better than this for most spells.
  calculateMissedVB() {
    //console.log("VoidformArray", this.VB)

    let waiting = 0; //time voidbolt spent on cooldown
    let castCount = 0; // casts of voidbolt
    let totalCD = 0; //time it took to come off cooldown

    //start at 2, so first calc is [2]-[1]. because [0] = 0, [1] = enterVF timestamp, [2] is first VB timestamp.
    //Every even is a VB cast, and every odd is it coming off cooldown
    //Except the last timestamp is voidform ending, and is not a cast or a cooldown.
    //If the last event is odd, then voidform ends while VB is on cooldown, so we do not want to add this time to the average recharge time.

    for (let i = 2; i < this.VB.length; i += 2) {
      //even - odd; cast - recharge
      waiting += this.VB[i] - this.VB[i - 1];
    }

    for (let i = 3; i < this.VB.length - 1; i += 2) {
      //odd - even. recharge - cast
      totalCD += this.VB[i] - this.VB[i - 1];
      castCount += 1;
    }

    const averagecd = totalCD / castCount;

    this.miss = this.miss + Math.floor(waiting / averagecd); //Any remainder is not a possible cast, so it is floored.
    this.VB = [0]; //After calcuating the missed VB, removed them so they cannot be added again.
  }

  enterVoidform(event: ApplyBuffEvent) {
    //reset the tracker of VB update timestamps.
    this.VB = [0];
    //to find the time between the first voidbolt update and start of voidform we need to add it in here.
    this.VB.push(event.timestamp);
  }

  leaveVoidform(event: RemoveBuffEvent) {
    //to find the time between the last voidbolt update and end of voidform we need to add it in here.
    this.VB.push(event.timestamp);
    //Calculate missed potential casts of Void Bolt during this voidform.
    this.calculateMissedVB();
  }

  adjustMaxCasts() {
    this.maxCasts = this.miss + this.castVB;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={SPELLS.VOID_BOLT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Voidbolt;
