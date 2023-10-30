import { TALENTS_MONK } from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getSheilunsGiftHits } from '../../normalizers/CastLinkNormalizer';
import WarningIcon from 'interface/icons/Warning';
import CheckmarkIcon from 'interface/icons/Checkmark';
import Uptime from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { LEGACY_OF_WISDOM_TARGETS, SHEILUNS_GIFT_TARGETS } from '../../constants';

/** The tooltip says 'Cast time is reduced by 0.5s'  but the reduction scales with haste to remain .33 gcds
 *  so what this is truly doing is making the spell only cost a gcd instead of 1.33 (Env cast time -> Viv cast time)
 */
const CAST_TIME_REDUCTION = 0.33;

class LegacyOfWisdom extends Analyzer {
  static dependencies = {};

  healing: number = 0;
  extraGcds: number = 0;
  missedHits: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.LEGACY_OF_WISDOM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onCast,
    );
  }

  get buffIcon() {
    return this.missedHits > 0 ? <WarningIcon /> : <CheckmarkIcon />;
  }

  onCast(event: CastEvent) {
    this.extraGcds += CAST_TIME_REDUCTION;
    const sgHealEvents = getSheilunsGiftHits(event);
    if (!sgHealEvents || sgHealEvents!.length <= SHEILUNS_GIFT_TARGETS) {
      this.missedHits += LEGACY_OF_WISDOM_TARGETS;
      return;
    }
    const extraTargets = sgHealEvents.length - SHEILUNS_GIFT_TARGETS;
    if (LEGACY_OF_WISDOM_TARGETS - extraTargets > 0) {
      this.missedHits += LEGACY_OF_WISDOM_TARGETS - extraTargets;
    }
    const extraHits = sgHealEvents.splice(
      SHEILUNS_GIFT_TARGETS,
      SHEILUNS_GIFT_TARGETS + sgHealEvents.length,
    );
    if (!extraHits) {
      return;
    }
    this.healing += extraHits.reduce((sum, heal) => sum + heal.amount + (heal.absorbed || 0), 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.LEGACY_OF_WISDOM_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(30)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.LEGACY_OF_WISDOM_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <br />
          {this.buffIcon} {this.missedHits.toFixed(2)} <small> missed hits</small> <br />
          <Uptime /> {this.extraGcds.toFixed(2)} <small>saved GCDs</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LegacyOfWisdom;
