import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  ApplyDebuffEvent,
  ApplyDebuffStackEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import ActiveDruidForm, { DruidForm } from '../core/ActiveDruidForm';

const SPELLS_WITH_TRAVEL_TIME = [
  SPELLS.STARSURGE_AFFINITY.id,
  SPELLS.STARSURGE_MOONKIN.id,
  SPELLS.FULL_MOON.id,
  SPELLS.WRATH.id,
  SPELLS.WRATH_MOONKIN.id,
];

const SPELLS_CAST = 16;
const SPELLS_CAST_RESTO = 12;

const AOE_BUFFER_MS = 100;

/**
 * **Convoke the Spirits**
 * Covenant - Night Fae
 *
 * Call upon the Night Fae for an eruption of energy,
 * channeling a rapid flurry of 16 (12 for Resto) Druid spells and abilities over 4 sec.
 */
class ConvokeSpirits extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    activeDruidForm: ActiveDruidForm,
  };

  protected abilities!: Abilities;
  protected activeDruidForm!: ActiveDruidForm;

  isChannelingConvoke: boolean = false;
  spellsToTrack: number;
  /** The number of times Convoke has been cast */
  cast: number = 0;

  /** Timestamp of the most recent AoE spell registered during Convoke - used to avoid double counts*/
  flexTimeStampForMultiApplySpells = 0;

  extraRejuvsFromOtherSources = 0;
  /** Mapping from convoke cast number to a tracker for that cast - note that index zero will always be empty */
  whatHappendIneachConvoke: ConvokeCast[] = [];

  /**
   * A mapping from spellId of spell with travel time to the number of casts we're waiting to land.
   * For example a Wrath cast will increment this while a Wrath damage event will decrement.
   * If a damage event happens just after a Convoke with no matching cast, it could be attributed to the Convoke.
   */
  travelingSpellTracker: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    //populate
    SPELLS_WITH_TRAVEL_TIME.forEach((e) => {
      this.travelingSpellTracker[e] = 0;
    });

    this.spellsToTrack = (this.selectedCombatant.spec === SPECS.RESTORATION_DRUID)
      ? SPELLS_CAST_RESTO : SPELLS_CAST;

    //start tracker
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
      this.startTracking,
    );

    //I'm dividing these out so you can see where each is and then if anything changes you're not changing one string in a long ass listener
    //this is also done in such a way to make sure we don't count the wrong event like whitenoise rejuv healing or moonfire damage etc

    //wouldn't it be lovely if blizzard just gave me cast events : ^)
    //generic stuff
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION),
      this.newRejuv,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION),
      this.newRejuv,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.newRegrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.newRegrowth,
    );

    //I'm not getting paid enough to check a billion logs to figure out which moonfire does this so deal with it
    //half the reason is because its random on which spells get fired and the fact its based on form so zzz
    this.addEventListener(
      Events.applydebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.MOONFIRE, SPELLS.MOONFIRE_BEAR, SPELLS.MOONFIRE_FERAL]),
      this.newMoonfire,
    );
    this.addEventListener(
      Events.refreshdebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.MOONFIRE, SPELLS.MOONFIRE_BEAR, SPELLS.MOONFIRE_FERAL]),
      this.newMoonfire,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WRATH, SPELLS.WRATH_MOONKIN]),
      this.newWrath,
    );

    //Balance stuff deal with it. idk which one it will be (it should be solar wrath moonkin but like edge cases)
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.STARSURGE_AFFINITY, SPELLS.STARSURGE_MOONKIN]),
      this.newStarSurge,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
      this.newStarFall,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
      this.newStarFall,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FULL_MOON),
      this.newFullMoon,
    );

    //Feral Stuff
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.newFerociousBite,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.newRake,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.newRake,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHRED), this.newShred);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.newTigersFury,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.newTigersFury,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_DEBUFF),
      this.newFeralFrenzy,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_DEBUFF),
      this.newFeralFrenzy,
    );

    //Bear stuff
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MANGLE_BEAR),
      this.newMangle,
    );

    //from what bear druids say this ability caps at 20 but who knows what blizzard will do *cough* corruption 2.0 *cough*
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR),
      this.newIronFur,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR),
      this.newIronFur,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR),
      this.newIronFur,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR_DOT),
      this.newThrash,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR_DOT),
      this.newThrash,
    );
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR_DOT),
      this.newThrash,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PULVERIZE_TALENT),
      this.newPulverize,
    );

    //Resto stuff
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.newSwiftMend,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.newWildGrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.newWildGrowth,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT),
      this.newFlourish,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT),
      this.newFlourish,
    );

    //stop tracker
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
      this.stopTracking,
    );

    //for travel time bs
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.WRATH, SPELLS.WRATH_MOONKIN]),
      this.wrathCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.STARSURGE_AFFINITY, SPELLS.STARSURGE_MOONKIN]),
      this.starsurgeCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FULL_MOON),
      this.fullMoonCast,
    );
  }

  startTracking(event: ApplyBuffEvent) {
    this.isChannelingConvoke = true;
    this.cast += 1;
    this.whatHappendIneachConvoke[this.cast] = { spellIdToCasts: [], form: 'No Form' };
  }

  newRejuv(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event);
  }

  newRegrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event);
  }

  newMoonfire(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.addemUp(event);
    this.multiSpellSafety(event.timestamp);
  }

  newWrath(event: DamageEvent) {
    this.addemUp(event);
  }

  newStarSurge(event: DamageEvent) {
    this.addemUp(event);
  }

  newStarFall(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event);
  }

  newFullMoon(event: DamageEvent) {
    this.addemUp(event);
    this.multiSpellSafety(event.timestamp);
  }

  newFerociousBite(event: DamageEvent) {
    this.addemUp(event);
  }

  newRake(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.addemUp(event);
  }

  newShred(event: DamageEvent) {
    this.addemUp(event);
  }

  newTigersFury(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event);
  }

  newFeralFrenzy(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.addemUp(event);
  }

  newMangle(event: DamageEvent) {
    this.addemUp(event);
  }

  newIronFur(event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent) {
    this.addemUp(event);
  }

  newThrash(event: ApplyDebuffEvent | RefreshDebuffEvent | ApplyDebuffStackEvent) {
    this.addemUp(event);
    this.multiSpellSafety(event.timestamp);
  }

  newPulverize(event: DamageEvent) {
    this.addemUp(event);
  }

  newSwiftMend(event: HealEvent) {
    this.addemUp(event);
  }

  newWildGrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event);
    this.multiSpellSafety(event.timestamp);
  }

  newFlourish(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.addemUp(event);
  }

  stopTracking(event: RemoveBuffEvent) {
    this.isChannelingConvoke = false;
    this.whatHappendIneachConvoke[this.cast].form = this.activeDruidForm.form;
    this.houseKeeping();
  }

  /*
   * TODO TODO TODO
   * The handling of travel time spells is incorrect in two ways:
   * 1) Casts that happen before the first convoke casue a tracker increment, but damage events before the first convoke DON'T decrement
   * 2) Travel time spells that hit during a Convoke decrement the tracker but still get counted in the Convoke
   *
   * In practice these two issues typically cancel one another out and the overall reading is correct,
   * but in rare can cause wrong results. This is too complicated for me to want to deal with it right now,
   * but I'm documenting the issue here.
   *
   * - Sref
   */

  wrathCast(event: CastEvent) {
    this.travelingSpellTracker[event.ability.guid] += 1;
  }

  starsurgeCast(event: CastEvent) {
    this.travelingSpellTracker[event.ability.guid] += 1;
  }

  fullMoonCast(event: CastEvent) {
    this.travelingSpellTracker[event.ability.guid] += 1;
  }

  /** Registers the given event as a evidence of a possible Convoke cast */
  addemUp(event: AbilityEvent<any>) {
    const spellId = event.ability.guid;
    const timestamp = event.timestamp;
    // if Convoke hasn't been casted in this fight, there is nothing to analyze here.
    // This also fixes crashes resulting from precasting spells, as they don't have a cast Event associated with them
    if (this.cast === 0) {
      return;
    }

    // spells with travel times will damage at different times from when they cast
    // a spell hardcast before convoke could hit during convoke
    // or a spell procced by convoke could hit afterwards
    let fromConvokeButWeNoticeAfterwards = false;
    if (SPELLS_WITH_TRAVEL_TIME.includes(spellId)) {
      //check if its from convoke or not (if 0 then it is)
      if (this.travelingSpellTracker[spellId] === 0) {
        fromConvokeButWeNoticeAfterwards = true;
      } else {
        this.travelingSpellTracker[spellId] -= 1;
      }
    }

    if (!this.isChannelingConvoke && !fromConvokeButWeNoticeAfterwards) {
      return;
    }

    //check for weird multiapplication spells
    if (this.flexTimeStampForMultiApplySpells + AOE_BUFFER_MS > timestamp) {
      return;
    }

    //we know it exists
    const oneCast = this.whatHappendIneachConvoke[this.cast];
    if (!oneCast.spellIdToCasts[spellId]) {
      oneCast.spellIdToCasts[spellId] = 0;
    }
    oneCast.spellIdToCasts[spellId] += 1;

    //Might seem weird but we gotta do this if we get extra events.
    if (fromConvokeButWeNoticeAfterwards) {
      this.houseKeeping();
    }
  }

  /**
   * Possibly sets the 'first hit' timestamp for an AoE ability,
   * avoiding double counting for any subsequent hits
   */
  multiSpellSafety(timestamp: number) {
    if (this.flexTimeStampForMultiApplySpells + AOE_BUFFER_MS < timestamp) {
      this.flexTimeStampForMultiApplySpells = timestamp;
    }
  }

  /**
   * If we counted too many abilities, subtract due to possible procs from other effects
   */
  houseKeeping() {
    //gotta have our safety : ^)
    if (this.isChannelingConvoke) {
      return;
    }

    const howManyDidWeCount = this.whatHappendIneachConvoke[this.cast].spellIdToCasts.reduce(
      (previousValue: number, currentValue: number) => previousValue + currentValue,
      0,
    );

    //this can happen due to a resto druid lego that just randomly adds rejuvs (with no cast event)
    //so lets remove those if possible. if not then ??? sorry fam
    if (howManyDidWeCount > this.spellsToTrack) {
      const diff = howManyDidWeCount - this.spellsToTrack;
      const rejuvs = this.whatHappendIneachConvoke[this.cast].spellIdToCasts[
        SPELLS.REJUVENATION.id
      ];
      if (rejuvs - diff > 0) {
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
        tooltip={
          <>
            Abilities cast by Convoke do not create cast events; this listing is created by
            tracking related events during the channel. Occasionally a Convoke will cast an ability
            that hits nothing (like Thrash when only immune targets are in range). In these cases
            we won't be able to track it and so the number of spells listed may not add up to
            {' '}{this.spellsToTrack}.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast #</th>
                  <th>Form</th>
                  <th>Spells In Cast</th>
                </tr>
              </thead>
              <tbody>
                {this.whatHappendIneachConvoke.map((spellIdToCasts, index) => (
                  <tr key={index}>
                    <th scope="row">{index}</th>
                    <td>{spellIdToCasts.form}</td>
                    <td>
                      {spellIdToCasts.spellIdToCasts.map((casts, spellId) => (
                        <>
                          <SpellLink id={spellId} /> {casts} <br />
                        </>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>-</BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpirits;

/** A tracker for things that happen in a single Convoke cast */
export interface ConvokeCast {
  /** A mapping from spellId to the number of times that spell was cast during the Convoke */
  spellIdToCasts: number[];
  /** The form the Druid was in during the cast */
  form: DruidForm;
}
