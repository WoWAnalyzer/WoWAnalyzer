import { BASELINE_AOTE_CD } from 'analysis/retail/hunter/survival/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
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
  CALL_OF_THE_WILD_CD_REDUCTION,
  HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK,
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
      baseCD: BASELINE_TURTLE_CHEETAH_CD * this.callOfTheWildReduction,
    },
    [SPELLS.ASPECT_OF_THE_TURTLE.id]: {
      effectiveCDR: 0,
      lastCast: 0,
      baseCD:
        (BASELINE_TURTLE_CHEETAH_CD - this.harmonyOfTheTortollanReduction) *
        this.callOfTheWildReduction,
    },
    [SPELLS.ASPECT_OF_THE_EAGLE.id]: {
      effectiveCDR: 0,
      lastCast: 0,
      baseCD: BASELINE_AOTE_CD * this.callOfTheWildReduction,
    },
  };

  get callOfTheWildReduction() {
    return (
      1 -
      (this.selectedCombatant.hasLegendary(SPELLS.CALL_OF_THE_WILD_EFFECT)
        ? CALL_OF_THE_WILD_CD_REDUCTION
        : 0)
    );
  }

  get harmonyOfTheTortollanReduction() {
    return this.selectedCombatant.hasConduitBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id)
      ? HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK[
          this.selectedCombatant.conduitRankBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id)
        ]
      : 0;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id);
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
              {this.hasEagle && (
                <li>
                  Aspect of the Eagle:{' '}
                  {formatNumber(this._spells[SPELLS.ASPECT_OF_THE_EAGLE.id].effectiveCDR / 1000)}s
                </li>
              )}
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
        <BoringSpellValueText spellId={SPELLS.BORN_TO_BE_WILD_TALENT.id}>
          <>
            {formatNumber(this.effectiveTotalCDR / 1000)}s <small>total effective CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BornToBeWild;
