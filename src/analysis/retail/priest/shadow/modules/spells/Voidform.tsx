import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RemoveBuffEvent,
  DamageEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';
//import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

//const rate = 0.0001;

class Voidform extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  casts = 0; //casts of voidform
  mindblast = 0; //number of mindblasts gained by entering voidform

  oncestart = 0;
  maxCastsVB = 0; //Max casts of Voidbolt

  castVB = 0; //casts of Voidbolt
  miss = 0; //missed potential casts of Void Bolt

  VB = [0]; //timestamps of voidbolt spellusable updates

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT);

    //this is to add an event listner for the start of the fight,
    this.addEventListener(Events.damage, this.onFightstart);

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

    this.addEventListener(Events.fightend, this.onFightend);
    /*
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
        maxCasts: () => this.maxCastsVB,
      },
    });
    */
  }

  onFightstart(event: DamageEvent) {
    if (this.oncestart === 0) {
      const startevent = event;
      startevent.timestamp = this.owner.fight.start_time;
      //At the start of the fight, VB is not available.
      //Set VB to be on cooldown, and slow the cooldown rate so it remains unusable.
      ////this.spellUsable.applyCooldownRateChange(SPELLS.VOID_BOLT.id, rate);
      ////this.spellUsable.beginCooldown(startevent, SPELLS.VOID_BOLT.id);
    }
    this.oncestart += 1; //only do this once
  }

  enterVoidform(event: ApplyBuffEvent) {
    //reset the tracker of VB update timestamps.
    this.VB = [0];

    //Voidform restores all charges of mindblast.
    this.casts += 1;
    this.mindblast += 2 - this.spellUsable.chargesAvailable(SPELLS.MIND_BLAST.id);
    this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, true, true);

    //Voidbolt becomes usable.
    //It is off CD instantly and its cooldown rate is normal.
    ////this.spellUsable.endCooldown(SPELLS.VOID_BOLT.id, event.timestamp, true, true);
    ////this.spellUsable.removeCooldownRateChange(SPELLS.VOID_BOLT.id, rate);
  }

  leaveVoidform(event: RemoveBuffEvent) {
    //Voidbolt becomes unavailable while not in voidform
    //Set void bolt to be on cooldown, and slow the cooldown rate so it remains unusable.
    ////this.spellUsable.applyCooldownRateChange(SPELLS.VOID_BOLT.id, rate);
    ////this.spellUsable.beginCooldown(event, SPELLS.VOID_BOLT.id);

    //for some reason, beginCooldown of voidbolt doesn't cause a spelluable update until later
    //so to find the time between the last voidbolt update and end of voidform we need to add it in here.
    this.VB.push(event.timestamp);

    //Calculate missed potential casts of Void Bolt during this voidform.
    this.getVB();
  }

  onVBUpdate(event: UpdateSpellUsableEvent) {
    //console.log("VB Event", this.spellUsable.chargesAvailable(SPELLS.VOID_BOLT.id), this.owner.formatTimestamp(event.timestamp, 1))
    this.VB.push(event.timestamp);
  }

  onVBCast() {
    this.castVB += 1;
  }

  //VB is an unusal spell. It is likely that using ExecuteHelper would be better than looking here.
  getVB() {
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
    //console.log("average CD", averagecd)

    this.miss = this.miss + Math.floor(waste / averagecd); //Any remainder is not a possible cast, so it is floored.
  }

  onFightend() {
    this.maxCastsVB = this.miss + this.castVB;
  }

  get guideSubsection(): JSX.Element {
    const mbGained = {
      count: this.mindblast,
      label: 'Mind Blast Reset',
    };

    const mbWasted = {
      count: this.casts * 2 - this.mindblast,
      label: 'Missed Resets',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.VOID_ERUPTION_TALENT.id} />
        </b>{' '}
        is a powerful cooldown.
        <br />
        Try to have all charges of <SpellLink id={SPELLS.MIND_BLAST.id} /> on cooldown before
        entering <SpellLink id={SPELLS.VOIDFORM_BUFF.id} />, since it will cause you to regain all
        charges.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Blast Resets</strong>
        <GradiatedPerformanceBar good={mbGained} bad={mbWasted} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default Voidform;
