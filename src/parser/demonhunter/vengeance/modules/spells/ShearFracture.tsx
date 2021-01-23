import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options} from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import Events, { CastEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import SpellLink from 'common/SpellLink';


/*WCL: https://www.warcraftlogs.com/reports/Y7BWyCx3mHVZzPrk#fight=last&type=summary&view=events&pins=2%24Off%24%23244F4B%24casts%7Cauras%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24258920%7C204255%7C203981%7C263642
Default spell is Shear (generates 1 soul). Fracture (generates 2 souls) talent replaces it. 
Vengence can have a maxium of 5 souls. Log has 4 fracture casts. Meaning 5 gained souls and 3 wasted. 2 of the 4 casts are bad.
Souls are generated on a slight delay. Souls should be casted with in 1.3 seconds. 
If a soul is casted and then a buff is removed within 50 ms that means it was a wasted soul generation.
*/

const WASTED_SOUL_MS_BUFFER = 50;
const FRACTURE_SOUL_GENERATE_BUFFER = 1300;

class ShearFracture extends Analyzer {

  castTimeStamp = 0;
  badCasts = 0;
  onSoulFragmentCastTimeStamp = 0;
  wastedSoulsPerCast = 0;
  soulFragmentBuffFadeTimeStamp = 0;
  lastCastEvent?: CastEvent;
  cast = SPELLS.SHEAR;

  constructor(options: Options) {
    super(options);

    if(this.selectedCombatant.hasTalent(SPELLS.FRACTURE_TALENT.id)){
      this.cast = SPELLS.FRACTURE_TALENT;
    };
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cast), this.onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT), this.onSoulFragmentCast);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK), this.onSoulFragmentBuffFade);
  }

  onCast(event: CastEvent)  {
    this.castTimeStamp = event.timestamp;
    this.lastCastEvent = event;
  }

  onSoulFragmentCast(event: CastEvent) {
    this.onSoulFragmentCastTimeStamp = event.timestamp;
  }

  onSoulFragmentBuffFade(event: RemoveBuffStackEvent) {
    if (!this.lastCastEvent) {
      return;
    }
    this.soulFragmentBuffFadeTimeStamp = event.timestamp;
    if(this.soulFragmentBuffFadeTimeStamp - this.castTimeStamp > FRACTURE_SOUL_GENERATE_BUFFER){
      return; 
    }

    if(this.soulFragmentBuffFadeTimeStamp - this.onSoulFragmentCastTimeStamp < WASTED_SOUL_MS_BUFFER){
      this.wastedSoulsPerCast +=1;
      
      //Exit early if the wasted soul is from the same fracture cast
      if(this.wastedSoulsPerCast > 1){
        this.wastedSoulsPerCast = 0;
        return;      
      }
      
      this.badCasts += 1;
      this.lastCastEvent.meta = this.lastCastEvent.meta || {};
      this.lastCastEvent.meta.isInefficientCast = true;
      this.lastCastEvent.meta.inefficientCastReason = 'Fracture cast that over capped souls';

    }
  }

  get wastedCasts() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
  suggestions(when: When) {
    when(this.wastedCasts).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        You cast of <SpellLink id={this.cast.id} /> generated souls beyond the cap of 5.
      </>,
    )
      .icon(this.cast.icon)
      .actual(t({
      id: "demonhunter.vengence.suggestions.shearfracture.wastedCasts",
      message: `${actual} bad casts`
    }))
      .recommended(`${recommended} bad casts are recommended`));
  }

}

export default ShearFracture;
