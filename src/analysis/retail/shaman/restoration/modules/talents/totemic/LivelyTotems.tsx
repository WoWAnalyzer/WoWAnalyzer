import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent, CastEvent, SummonEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { isLivelyTotemsChainHealCast, getChainHeals, } from '../../../normalizers/EventLinkNormalizer';
import { formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { EVENT_LINKS } from '../../../../restoration/constants'

export default class LivelyTotemsAnalyzer extends Analyzer {
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
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT), this.onChainHealSummon);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT), this.onChainHealSummon);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(TALENTS.STORMSTREAM_TOTEM_1_RESTORATION_TALENT), this.onChainHealSummon);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(TALENTS.SPIRIT_LINK_TOTEM_TALENT), this.onChainHealSummon);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(TALENTS.HEALING_TIDE_TOTEM_TALENT), this.onChainHealSummon);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT), this.onChainHealCast);
  }

  onChainHealSummon(event: SummonEvent) {
    if (!isLivelyTotemsChainHealCast(event)) {
      return;
    }
    //next chain heal is 100% a Lively Totems Cast
    this.chainHealCasts += 1;
  }

  onChainHealCast(event: CastEvent) {
    if (!isLivelyTotemsChainHealCast(event)) {
      return;
    }
    this.chainHealCasts += 1;
    const healEvents = getChainHeals(event);
    healEvents.forEach((heal) => {
      this.healingDoneFromTalent += heal.amount + (heal.absorbed ?? 0);
      this.overhealingDoneFromTalent += heal.overheal ?? 0;
      }
    );

  if (event.resourceCost) {
    this.manaSavedFromTalent += event.resourceCost[RESOURCE_TYPES.MANA.id] ?? 0;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            {this.chainHealCasts} free chain heals, saving {formatNumber(this.manaSavedFromTalent)}{' '}
            mana.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.LIVELY_TOTEMS_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
          <div>
            <ItemManaGained amount={this.manaSavedFromTalent} useAbbrev />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
