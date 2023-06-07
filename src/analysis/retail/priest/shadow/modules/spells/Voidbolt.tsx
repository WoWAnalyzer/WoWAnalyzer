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
  getVB() {
    //console.log("VoidformArray", this.VB)
    //convert raw timestamps of spellusables to time between them
    const diff = [];

    // start at 2, so first calc is [2]-[1]
    //because [0] = 0, [1] = enterVF timestamp, [2] is first VB timestamp.
    for (let i = 2; i < this.VB.length; i += 1) {
      diff[i - 2] = this.VB[i] - this.VB[i - 1];
    }

    let waste = 0;
    const cd = [];
    let total = 0;

    //even diff is time between available and cast
    //odd diff is time waiting on cooldown.

    //the last timestamp occurs when VF ends, and VB updates to no longer be usable
    //If VB is off cooldown at this time, we want to add this time to the waste time
    //if VB is on cooldown at this time, we do not want to add this time into the average recharge time.
    for (let i = 0; i < diff.length; i += 1) {
      if (i % 2 === 0) {
        //even
        waste = waste + diff[i];
      }
      if (i % 2 !== 0 && i !== diff.length - 1) {
        //odd and not include final if it is odd.
        cd.push(diff[i]);
      }
    }

    //find the average CD during this voidform
    for (let i = 0; i < cd.length; i += 1) {
      total = total + cd[i];
    }
    const averagecd = total / cd.length;

    this.miss = this.miss + Math.floor(waste / averagecd); //Any remainder is not a possible cast, so it is floored.
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
    this.getVB();
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
