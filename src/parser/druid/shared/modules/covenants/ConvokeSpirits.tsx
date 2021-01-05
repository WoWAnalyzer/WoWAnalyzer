import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, ApplyDebuffEvent, ApplyDebuffStackEvent, CastEvent, DamageEvent, HealEvent, RefreshBuffEvent, RefreshDebuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import SpellLink from 'common/SpellLink';

const SPELLS_WITH_TRAVEL_TIME = [
  SPELLS.STARSURGE_AFFINITY.id,
  SPELLS.STARSURGE_MOONKIN.id,
  SPELLS.FULL_MOON.id,
  SPELLS.SOLAR_WRATH.id,
  SPELLS.SOLAR_WRATH_AFFINITY.id,
  SPELLS.SOLAR_WRATH_MOONKIN.id,
];

class ConvokeSpirits extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  tracking = false;
  spellsToTrack = 16;
  cast = 0;

  flexTimeStampForMultiApplySpells = 0;
  
  extraRejuvsFromOtherSources = 0;

  whatHappendIneachConvoke: ConvokeCast[] = [];
  
  travelTimeSpellsCastToDamageRatio: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    if (!this.active) {
      return;
    }

    //populate
    SPELLS_WITH_TRAVEL_TIME.forEach(e => {
      this.travelTimeSpellsCastToDamageRatio[e] = 0;
    });

    if(this.selectedCombatant.spec === SPECS.RESTORATION_DRUID) {
      this.spellsToTrack = 12;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.CONVOKE_SPIRITS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 120,
      gcd: {
        base: this.selectedCombatant.spec === SPECS.FERAL_DRUID ? 1000 : 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    //start tracker
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS), this.startTracking);

    //I'm dividing these out so you can see where each is and then if anything changes you're not changing one string in a long ass listener
    //this is also done in such a way to make sure we don't count the wrong event like whitenoise rejuv healing or moonfire damage etc

    //wouldn't it be lovely if blizzard just gave me cast events : ^)
    //generic stuff
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.newRejuv);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION), this.newRejuv);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.newRegrowth);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.newRegrowth);

    //I'm not getting paid enough to check a billion logs to figure out which moonfire does this so deal with it
    //half the reason is because its random on which spells get fired and the fact its based on form so zzz
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell([SPELLS.MOONFIRE, SPELLS.MOONFIRE_BEAR, SPELLS.MOONFIRE_FERAL]), this.newMoonfire);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell([SPELLS.MOONFIRE, SPELLS.MOONFIRE_BEAR, SPELLS.MOONFIRE_FERAL]), this.newMoonfire);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SOLAR_WRATH, SPELLS.SOLAR_WRATH_AFFINITY, SPELLS.SOLAR_WRATH_MOONKIN]), this.newWrath);
    
    //Balance stuff deal with it. idk which one it will be (it should be solar wrath moonkin but like edge cases)
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.STARSURGE_AFFINITY, SPELLS.STARSURGE_MOONKIN]), this.newStarSurge);
    
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST), this.newStarFall);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST), this.newStarFall);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FULL_MOON), this.newFullMoon);

    //Feral Stuff
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE), this.newFerociousBite);

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED), this.newRake);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED), this.newRake);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHRED), this.newShred);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY), this.newTigersFury);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY), this.newTigersFury);

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_DEBUFF), this.newFeralFrenzy);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_DEBUFF), this.newFeralFrenzy);

    //Bear stuff
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MANGLE_BEAR), this.newMangle);

    //from what bear druids say this ability caps at 20 but who knows what blizzard will do *cough* corruption 2.0 *cough*
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR), this.newIronFur);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR), this.newIronFur);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR), this.newIronFur);

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR_DOT), this.newThrash);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR_DOT), this.newThrash);
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR_DOT), this.newThrash);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PULVERIZE_TALENT), this.newPulverize);

    //Resto stuff
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND), this.newSwiftMend);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.newWildGrowth);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.newWildGrowth);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT), this.newFlourish);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT), this.newFlourish);


    //stop tracker
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS), this.stopTracking);

    //for travel time bs
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SOLAR_WRATH, SPELLS.SOLAR_WRATH_AFFINITY, SPELLS.SOLAR_WRATH_MOONKIN]), this.wrathCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.STARSURGE_AFFINITY, SPELLS.STARSURGE_MOONKIN]), this.starsurgeCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FULL_MOON), this.fullMoonCast);
  }

  startTracking(event: ApplyBuffEvent) {
    this.tracking = true;
    this.cast += 1;
  }

  newRejuv(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newRegrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newMoonfire(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
    this.multiSpellSafety(event.timestamp);
  }

  newWrath(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newStarSurge(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newStarFall(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newFullMoon(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
    this.multiSpellSafety(event.timestamp);
  }

  newFerociousBite(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newRake(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newShred(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newTigersFury(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newFeralFrenzy(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newMangle(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newIronFur(event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newThrash(event: ApplyDebuffEvent | RefreshDebuffEvent | ApplyDebuffStackEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
    this.multiSpellSafety(event.timestamp);
  }

  newPulverize(event: DamageEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newSwiftMend(event: HealEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }

  newWildGrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
    this.multiSpellSafety(event.timestamp);
  }

  newFlourish(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event.ability.guid, event.timestamp);
  }
  
  stopTracking(event: RemoveBuffEvent) {
    this.tracking = false;
    this.houseKeeping();
  }

  wrathCast(event: CastEvent) {
    this.travelTimeSpellsCastToDamageRatio[event.ability.guid] += 1;
  }

  starsurgeCast(event: CastEvent) {
    this.travelTimeSpellsCastToDamageRatio[event.ability.guid] += 1;
  }

  fullMoonCast(event: CastEvent) {
    this.travelTimeSpellsCastToDamageRatio[event.ability.guid] += 1;
  }

  //just adds to spell to a tracker... yeah i know i could feed them all down to addemUp my default but i don't want something like (event: DamageEvent | ApplyBuffEvent | RefreshBuffEvent... ) deal with it
  addemUp(spellId: number, timestamp: number) {

    let fromConvokeButWeNoticeAfterwards = false;
    //since travel time is the stupidiest thing in the world we have a weird af check
    if(SPELLS_WITH_TRAVEL_TIME.includes(spellId)) {
      //check if its from convoke or not (if 0 then it is)
      if(this.travelTimeSpellsCastToDamageRatio[spellId] === 0) {
        fromConvokeButWeNoticeAfterwards = true;
      } else {
        this.travelTimeSpellsCastToDamageRatio[spellId] -= 1;
      }
    }

    if(!this.tracking) {
      if(!fromConvokeButWeNoticeAfterwards){
        return;
      }
    }

    //check for weird multiapplication spells
    if(this.flexTimeStampForMultiApplySpells + 100 > timestamp) {
      return;
    }

    //make sure we got this object if not make a new one (cry a little too)
    if(!this.whatHappendIneachConvoke[this.cast]) {
      this.whatHappendIneachConvoke[this.cast] = {spellIdToCasts: []};
    }

    //we know it exists
    const oneCast = this.whatHappendIneachConvoke[this.cast];
    if(!oneCast.spellIdToCasts[spellId]) {
      oneCast.spellIdToCasts[spellId] = 0;
    }
    oneCast.spellIdToCasts[spellId] += 1;

    //Might seem weird but we gotta do this if we get extra events.
    if(fromConvokeButWeNoticeAfterwards){
      this.houseKeeping();
    }
  }

  multiSpellSafety(timestamp: number) {
      //add a tenth of a second for safety this actually might be riskey but YOLO
      if(this.flexTimeStampForMultiApplySpells + 100 < timestamp) {
        this.flexTimeStampForMultiApplySpells = timestamp;
      }
  }

  houseKeeping() {
    //gotta have our safety : ^)
    if(this.tracking) {
      return;
    }

    const howManyDidWeCount = this.whatHappendIneachConvoke[this.cast].spellIdToCasts.reduce((previousValue: number, currentValue: number) => previousValue + currentValue);

    //this can happen due to a resto druid lego that just randomly adds rejuvs (with no cast event)
    //so lets remove those if possible. if not then ??? sorry fam
    if(howManyDidWeCount > this.spellsToTrack) {
      const diff = howManyDidWeCount - this.spellsToTrack;
      const rejuvs = this.whatHappendIneachConvoke[this.cast].spellIdToCasts[SPELLS.REJUVENATION.id];
      if(rejuvs - diff > 0) {
        this.whatHappendIneachConvoke[this.cast].spellIdToCasts[SPELLS.REJUVENATION.id] -= diff;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>
        Normally when a cast of an ability happens in wow there is a CastEvent with it. 
        During convoke there isn't. 
        This means we have to track damage events, heal events, and buff/debuff events meaning if you thrash and hit nothing you don't create any events meaning we can't track it. 
        This means if your number don't add up to the expected amount then that is the cause of it.
        </>}
        dropdown={
        <>
          <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast #</th>
                  <th>Spells In Cast</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.whatHappendIneachConvoke.map((spellIdToCasts, index) => (
                    <tr key={index}>
                      <th scope="row">{index}</th>
                      <td>
                        {spellIdToCasts.spellIdToCasts.map((casts, spellId) => (
                          <>
                            <SpellLink id={spellId} /> {casts} <br />
                          </>
                      ))
                      }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
        </>}
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpirits;


export interface ConvokeCast {
  spellIdToCasts: number[];
}