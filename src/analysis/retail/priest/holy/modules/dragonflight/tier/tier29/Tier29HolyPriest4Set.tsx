import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import Crit from 'parser/shared/modules/helpers/CritEffectBonus';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';

const TIER_CRIT_BONUS = 0.1;

//Example log: /reports/w9BXrzFApPbj6LnG#fight=10&type=healing&source=19
class HolyPriestTier4Set extends Analyzer {
  static dependencies = {
    crit: Crit,
  };
  protected crit!: Crit;

  uptime4Set = 0; //Buff uptime in milliseconds
  is4SetActive = false;
  timestampOfLast4SetActivation = 0; //Used to calculate uptime in case the fight ends with the buff active
  healingContributionOf4Set = 0;
  overallHealing = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.has4PieceByTier(TIERS.DF1)) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRIEST_TIER_29_4_SET_BUFF),
      this.on4SetBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRIEST_TIER_29_4_SET_BUFF),
      this.on4SetNoBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onHeal(Event: HealEvent) {
    if (this.is4SetActive) {
      this.healingContributionOf4Set += this.crit.getHealingContribution(
        Event,
        TIER_CRIT_BONUS,
      ).effectiveHealing;
    }
  }

  on4SetBuff(Event: ApplyBuffEvent) {
    this.is4SetActive = true;
    this.timestampOfLast4SetActivation = Event.timestamp;
  }
  on4SetNoBuff(Event: RemoveBuffEvent) {
    this.uptime4Set += Event.timestamp - this.timestampOfLast4SetActivation;
    this.is4SetActive = false;
  }

  onFightEnd(Event: FightEndEvent) {
    if (this.is4SetActive) {
      this.uptime4Set += Event.timestamp - this.timestampOfLast4SetActivation;
    }
  }

  statistic() {
    const uptimePercent = formatPercentage(this.uptime4Set / this.owner.fightDuration);
    return (
      <Statistic
        tooltip={<>You had {uptimePercent}% uptime on the buff.</>}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={SPELLS.HOLY_PRIEST_TIER_29_4_SET_BUFF}>
          <ItemHealingDone amount={this.healingContributionOf4Set} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default HolyPriestTier4Set;
