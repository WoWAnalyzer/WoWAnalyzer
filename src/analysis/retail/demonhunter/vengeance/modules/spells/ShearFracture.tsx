import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS/demonhunter';
import Spell from 'common/SPELLS/Spell';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { Talent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';

import {
  getGeneratingCast,
  getWastedSoulFragment,
} from '../../normalizers/ShearFractureNormalizer';

/*WCL: https://www.warcraftlogs.com/reports/Y7BWyCx3mHVZzPrk#fight=last&type=summary&view=events&pins=2%24Off%24%23244F4B%24casts%7Cauras%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24258920%7C204255%7C203981%7C263642
Default spell is Shear (generates 1 soul). Fracture (generates 2 souls) talent replaces it.
Vengence can have a maxium of 5 souls. Log has 4 fracture casts. Meaning 5 gained souls and 3 wasted. 2 of the 4 casts are bad.
Souls are generated on a slight delay. Souls should be cast within 1.3 seconds.
If a soul is cast and then a buff is removed within 100 ms that means it was a wasted soul generation.
*/

export default class ShearFracture extends Analyzer {
  badCasts = 0;
  cast: Spell | Talent = SPELLS.SHEAR;
  lastCast: CastEvent | undefined;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT)) {
      this.cast = TALENTS_DEMON_HUNTER.FRACTURE_TALENT;
    }
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK),
      this.onSoulFragmentBuffFade,
    );
  }

  get wastedCasts(): NumberThreshold {
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

  onSoulFragmentBuffFade(event: RemoveBuffStackEvent) {
    const wastedSoulFragment = getWastedSoulFragment(event);
    if (!wastedSoulFragment) {
      return;
    }
    const generatingCast = getGeneratingCast(wastedSoulFragment);
    if (!generatingCast) {
      return;
    }

    // Exit early if the wasted soul is from the same fracture cast
    if (this.lastCast?.timestamp === generatingCast.timestamp) {
      return;
    }

    this.lastCast = generatingCast;
    this.badCasts += 1;
    this.lastCast.meta = this.lastCast.meta || {};
    this.lastCast.meta.isInefficientCast = true;
    this.lastCast.meta.inefficientCastReason = 'Fracture cast that over capped souls';
  }

  suggestions(when: When) {
    when(this.wastedCasts).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your cast of <SpellLink spell={this.cast.id} /> generated souls beyond the cap of 5.
        </>,
      )
        .icon(this.cast.icon)
        .actual(
          t({
            id: 'demonhunter.vengence.suggestions.shearfracture.wastedCasts',
            message: `${actual} bad casts`,
          }),
        )
        .recommended(`${recommended} bad casts are recommended`),
    );
  }
}
