import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { isLivelyTotemsChainHealCast } from '../../../normalizers/LivelyTotemsNormalizer';
import ChainHealAnalyzer from '../../../normalizers/ChainHealNormalizer';
import { formatNumber } from 'common/format';

export default class LivelyTotemsAnalyzer extends Analyzer.withDependencies({
  chainHealAnalyzer: ChainHealAnalyzer,
}) {
  protected chainHealAnalyzer!: ChainHealAnalyzer;

  manaSavedFromTalent = 0;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  chainHealCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIVELY_TOTEMS_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHealCast,
    );
  }

  private onChainHealCast(event: CastEvent) {
    // Only chain heals that are linked back to a totem summon count for this talent
    if (!isLivelyTotemsChainHealCast(event)) {
      return;
    }

    this.chainHealCasts += 1;

    const healEvents = this.chainHealAnalyzer.normalizeChainHealOrder(event);
    healEvents.forEach((heal) => {
      this.healingDoneFromTalent += heal.amount + (heal.absorbed ?? 0);
      this.overhealingDoneFromTalent += heal.overheal ?? 0;
    });
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <p>
              <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
              {formatNumber(this.overhealingDoneFromTalent)} overhealing)
            </p>
            <p>{this.chainHealCasts} free chain heals.</p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.LIVELY_TOTEMS_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
