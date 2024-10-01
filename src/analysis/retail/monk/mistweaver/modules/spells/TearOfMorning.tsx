import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import spells from 'common/SPELLS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink, TooltipElement } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import HotTrackerMW from '../core/HotTrackerMW';
import { ATTRIBUTION_STRINGS, TEAR_OF_MORNING_INVIG_INCREASE } from '../../constants';
import { TFT_ENV_TOM } from '../../normalizers/EventLinks/EventLinkConstants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class TearOfMorning extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };

  protected hotTracker!: HotTrackerMW;

  duplicatedRems: number = 0;
  invigoratingMistHealing: number = 0;
  envelopingMisthealing: number = 0;
  envelopCasts: number = 0;
  tftCleaveHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.TEAR_OF_MORNING_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(spells.INVIGORATING_MISTS_HEAL),
      this.handleVivify,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.ENVELOPING_MIST_TALENT),
      this.handleEnv,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.ENVELOPING_MIST_TALENT),
      this.onCast,
    );
  }

  get totalHealing() {
    return this.invigoratingMistHealing + this.envelopingMisthealing + this.tftCleaveHealing;
  }

  get avgHealingPerCast() {
    return (
      this.hotTracker.getAverageHealingForAttribution(
        TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        ATTRIBUTION_STRINGS.HARDCAST_ENVELOPING_MIST,
      ) +
      (this.envelopingMisthealing + this.tftCleaveHealing) / this.envelopCasts
    );
  }

  onCast(event: CastEvent) {
    this.envelopCasts += 1;
    const tftEnvHits = GetRelatedEvents(event, TFT_ENV_TOM);

    if (tftEnvHits.length === 0) {
      return;
    }

    //cleave hits are the same spell id as the primary cast hit
    //so we need to check for more than 1 heal instance on the same target and
    //filter out the larger hit (it will always be larger) if necessary
    const empty: HealEvent[] = []; //eslint....
    const filteredCleaves = Object.values(
      tftEnvHits.reduce((tftCleaves, cleave) => {
        cleave = cleave as HealEvent;
        if (
          !tftCleaves[cleave.targetID] ||
          this._getraw(tftCleaves[cleave.targetID]) > this._getraw(cleave)
        ) {
          tftCleaves[cleave.targetID] = cleave;
        }
        return tftCleaves;
      }, empty),
    );

    this.tftCleaveHealing += filteredCleaves.reduce(
      (sum, heal) => (sum += heal.amount + (heal.absorbed || 0)),
      0,
    );
  }

  _getraw(event: HealEvent) {
    return event.amount + (event.overheal || 0) + (event.absorbed || 0);
  }

  handleVivify(event: HealEvent) {
    this.invigoratingMistHealing += calculateEffectiveHealing(
      event,
      TEAR_OF_MORNING_INVIG_INCREASE,
    );
  }

  handleEnv(event: HealEvent) {
    if (event.tick) {
      return;
    }
    this.envelopingMisthealing += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink spell={spells.INVIGORATING_MISTS_HEAL} /> additional healing:{' '}
              {formatNumber(this.invigoratingMistHealing)}
            </li>
            <li>
              <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> cleave healing:{' '}
              {formatNumber(this.envelopingMisthealing)} (
              {formatNumber(this.envelopingMisthealing / this.envelopCasts)} per cast)
            </li>
            {this.tftCleaveHealing > 0 && (
              <li>
                <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />{' '}
                <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> cleave healing:{' '}
                {formatNumber(this.tftCleaveHealing)}
              </li>
            )}
          </ul>
        }
      >
        <TalentSpellText talent={talents.TEAR_OF_MORNING_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <>
                This is the average effective healing done per cast of{' '}
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />, excluding any healing
                contributed by <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />, if talented.
              </>
            }
          >
            {formatNumber(this.avgHealingPerCast)}{' '}
            <small>
              healing per <SpellLink spell={talents.ENVELOPING_MIST_TALENT} />
            </small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TearOfMorning;
