import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  BASELINE_TURTLE_CHEETAH_CD,
  BORN_TO_BE_WILD_AFFECTED_SPELLS,
  SURVIVAL_OF_THE_FITTEST_BASE_CD,
} from '../constants';

/**
 * Reduces the cooldowns of Aspect of the Cheetah and Aspect of the Turtle by 20%.
 * For Survival it also reduces the cooldown of Aspect of the Eagle.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/1YZkWvbFGNgTA7L4#fight=3&type=summary&source=97
 */

const debug = false;

class BornToBeWild extends Analyzer {
  hasEagle = false;
  _spells = {
    [SPELLS.ASPECT_OF_THE_CHEETAH.id]: {
      effectiveCDR: 0,
      lastCast: 0,
      baseCD: BASELINE_TURTLE_CHEETAH_CD,
    },
    [SPELLS.ASPECT_OF_THE_TURTLE.id]: {
      effectiveCDR: 0,
      lastCast: 0,
      baseCD: BASELINE_TURTLE_CHEETAH_CD,
    },
    [TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT.id]: {
      effectiveCDR: 0,
      lastCast: 0,
      baseCD: SURVIVAL_OF_THE_FITTEST_BASE_CD,
    },
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BORN_TO_BE_WILD_TALENT);
    this.hasEagle = this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(BORN_TO_BE_WILD_AFFECTED_SPELLS),
      this.onCast,
    );
  }

  get effectiveTotalCDR() {
    return Object.values(this._spells)
      .map((spell) => spell.effectiveCDR)
      .reduce((total, current) => total + current, 0);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const spell = this._spells[spellId];
    debug &&
      console.log(
        event.timestamp,
        `${SPELLS[spellId].name} cast - time since last cast: `,
        spell.lastCast !== 0 ? (event.timestamp - spell.lastCast) / 1000 : 'no previous cast',
      );
    if (spell.lastCast && event.timestamp < spell.lastCast + spell.baseCD) {
      spell.effectiveCDR += spell.baseCD - (event.timestamp - spell.lastCast);
    }
    spell.lastCast = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective CDR constitutes the time that was left of the original CD (before reduction
            from Born To Be Wild) when you cast it again as that is the effective cooldown reduction
            it provided for you.
            <ul>
              <li>
                Survival of the Fittest:{' '}
                {formatNumber(
                  this._spells[TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT.id].effectiveCDR / 1000,
                )}
                s
              </li>
              <li>
                Aspect of the Cheetah:{' '}
                {formatNumber(this._spells[SPELLS.ASPECT_OF_THE_CHEETAH.id].effectiveCDR / 1000)}s
              </li>
              <li>
                Aspect of the Turtle:{' '}
                {formatNumber(this._spells[SPELLS.ASPECT_OF_THE_TURTLE.id].effectiveCDR / 1000)}s
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.BORN_TO_BE_WILD_TALENT}>
          <>
            {formatNumber(this.effectiveTotalCDR / 1000)}s <small>total effective CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BornToBeWild;
