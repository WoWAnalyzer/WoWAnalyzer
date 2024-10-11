import spells from 'common/SPELLS/priest';
import talents from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import SpellUsable from '../core/SpellUsable';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

// TODO: Ask Priest guide maker about these numbers
const CAST_THRESHOLD_OK = 5;
const CAST_THRESHOLD_GOOD = 9;

class VoidSummonerBetweenCasts extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  _castsSinceSquid: number = 0;
  _castsPerCD: {
    timestamp: number;
    casts: number;
  }[] = [];
  _totalSquidCasts: number = 0;

  _currentSquid:
    | typeof talents.MINDBENDER_DISCIPLINE_TALENT
    | typeof talents.SHADOWFIEND_TALENT
    | typeof spells.VOIDWRAITH_CAST;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.VOID_SUMMONER_TALENT);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          spells.SMITE,
          spells.SHADOW_SMITE,
          spells.MIND_BLAST,
          spells.PENANCE_CAST,
          spells.DARK_REPRIMAND_CAST,
        ]),
      this.onCDReductionCast,
    );

    if (this.selectedCombatant.hasTalent(talents.VOIDWRAITH_TALENT)) {
      this._currentSquid = spells.VOIDWRAITH_CAST;
    } else if (this.selectedCombatant.hasTalent(talents.SHADOWFIEND_TALENT)) {
      this._currentSquid = talents.MINDBENDER_DISCIPLINE_TALENT;
    } else {
      this._currentSquid = talents.SHADOWFIEND_TALENT;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this._currentSquid),
      this.onSquidCast,
    );
  }

  onCDReductionCast() {
    if (this.spellUsable.isOnCooldown(this._currentSquid.id)) {
      this._castsSinceSquid += 1;
    }
  }

  onSquidCast(event: CastEvent) {
    this._totalSquidCasts += 1;
    this._castsPerCD.push({
      timestamp: event.timestamp,
      casts: this._castsSinceSquid,
    });
    this._castsSinceSquid = 0;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={talents.VOID_SUMMONER_TALENT} />
        </strong>{' '}
        reduces the cooldown of your <SpellLink spell={this._currentSquid} />, you should cast{' '}
        <SpellLink spell={spells.SMITE} />,
        <SpellLink spell={spells.PENANCE} />,
        <SpellLink spell={spells.MIND_BLAST} /> as often as possible while{' '}
        <SpellLink spell={this._currentSquid} /> is on cooldown.
      </p>
    );

    const castPerfBoxes = this._castsPerCD.map((betweenCDs) => {
      let value: QualitativePerformance;
      if (betweenCDs.casts < CAST_THRESHOLD_OK) {
        value = QualitativePerformance.Fail;
      } else if (betweenCDs.casts < CAST_THRESHOLD_GOOD) {
        value = QualitativePerformance.Ok;
      } else {
        value = QualitativePerformance.Good;
      }
      return {
        value,
        tooltip: `@ ${this.owner.formatTimestamp(betweenCDs.timestamp)} - ${betweenCDs.casts} casts`,
      };
    });

    const data = (
      <div>
        <strong>
          <SpellLink spell={talents.VOID_SUMMONER_TALENT} />
        </strong>
        <PerformanceBoxRow values={castPerfBoxes} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default VoidSummonerBetweenCasts;
