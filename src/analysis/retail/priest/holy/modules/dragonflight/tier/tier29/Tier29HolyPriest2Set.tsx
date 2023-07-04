import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';

const TIER_CAST_TIME_REDUCTION = 1;
const TIER_HOLY_WORD_REDUCTION = 2;

const LIGHT_OF_THE_NAARU_MULTIPLIER_PER_RANK = 0.1;
const APOTHEOSIS_MULTIPLIER = 4;

//Example log: /reports/w9BXrzFApPbj6LnG#fight=10&type=healing&source=19
class HolyPriestTier2Set extends Analyzer {
  lightOfTheNaaruMultiplier = 1;
  apotheosisActive = false;

  holyWordReduction = 0;
  naaruReduction = 0;
  apotheosisReduction = 0;
  timeSaved = 0;
  has2SetBuff = false;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.has2PieceByTier(TIERS.T29)) {
      this.active = false;
      return;
    }

    this.lightOfTheNaaruMultiplier +=
      this.selectedCombatant.getTalentRank(TALENTS.LIGHT_OF_THE_NAARU_TALENT) *
      LIGHT_OF_THE_NAARU_MULTIPLIER_PER_RANK;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onApotheosis,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onNoApotheosis,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRIEST_TIER_29_2_SET_BUFF),
      this.on2SetBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRIEST_TIER_29_2_SET_BUFF),
      this.on2SetNoBuff,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onApotheosis() {
    this.apotheosisActive = true;
  }

  onNoApotheosis() {
    this.apotheosisActive = false;
  }

  onHeal(Event: HealEvent) {
    if (
      this.has2SetBuff &&
      (Event.ability.guid === SPELLS.GREATER_HEAL.id ||
        Event.ability.guid === TALENTS.PRAYER_OF_HEALING_TALENT.id)
    ) {
      this.timeSaved += TIER_CAST_TIME_REDUCTION;
      this.has2SetBuff = false;

      //All Holy Word reduction is tracked as one because showing them individually would
      //Take a lot of space and provide little value
      this.holyWordReduction += this.apotheosisActive
        ? TIER_HOLY_WORD_REDUCTION * APOTHEOSIS_MULTIPLIER * this.lightOfTheNaaruMultiplier
        : TIER_HOLY_WORD_REDUCTION * this.lightOfTheNaaruMultiplier;
    }
  }
  on2SetBuff() {
    this.has2SetBuff = true;
  }

  on2SetNoBuff() {
    this.has2SetBuff = false;
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            The reduction from tier is including the bonus from Light of the Naaru and Apotheosis.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={SPELLS.HOLY_PRIEST_TIER_29_2_SET_BUFF}>
          {this.timeSaved} seconds of casting saved
          <br />
          {Math.floor(this.holyWordReduction)} seconds reduction of Holy Words
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default HolyPriestTier2Set;
