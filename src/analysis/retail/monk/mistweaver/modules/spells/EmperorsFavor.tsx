import { TALENTS_MONK } from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getSheilunsGiftHits } from '../../normalizers/CastLinkNormalizer';
import Uptime from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { EMPERORS_FAVOR_INCREASE } from '../../constants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Haste from 'parser/shared/modules/Haste';
import GlobalCooldown from '../core/GlobalCooldown';

const SG_BASE_CAST_TIME = 2000;

class EmperorsFavor extends Analyzer.withDependencies({
  haste: Haste,
  globalCooldown: GlobalCooldown,
}) {
  healing = 0;
  timeSaved = 0; // ms

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.EMPERORS_FAVOR_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const sgHealEvents = getSheilunsGiftHits(event);
    if (!sgHealEvents || sgHealEvents.length === 0) return;

    this.healing += calculateEffectiveHealing(sgHealEvents[0], EMPERORS_FAVOR_INCREASE);

    const currentHaste = this.deps.haste.current;
    const hastedCastTime = SG_BASE_CAST_TIME / (1 + currentHaste);
    const gcdDuration = this.deps.globalCooldown.getGlobalCooldownDuration(
      TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
    );
    this.timeSaved += hastedCastTime - gcdDuration;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.EMPERORS_FAVOR_TALENT} />}
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
        <TalentSpellText talent={TALENTS_MONK.EMPERORS_FAVOR_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <Uptime /> {(this.timeSaved / 1000).toFixed(2)}s <small>time saved</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EmperorsFavor;
