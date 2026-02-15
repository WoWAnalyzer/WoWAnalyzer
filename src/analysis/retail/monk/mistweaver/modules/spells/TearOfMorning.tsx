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
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ATTRIBUTION_STRINGS,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
  TEAR_OF_MORNING_VIV_SG_INCREASE,
  getCurrentCelestialTalent,
} from '../../constants';
import { TFT_ENV_TOM } from '../../normalizers/EventLinks/EventLinkConstants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { CelestialHooks } from 'analysis/retail/monk/shared';
import { Tracker } from 'parser/shared/modules/HotTracker';

const UNAFFECTED_SPELLS: number[] = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class TearOfMorning extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    celestialHooks: CelestialHooks,
  };

  protected hotTracker!: HotTrackerMW;
  protected celestialHooks!: CelestialHooks;

  invigSheilunsHeal = spells.INVIGORATING_MISTS_HEAL;
  invigSheilunsHealing = 0;

  _envBaseDuration = 0;
  envHealingIncrease = 0;

  envelopingMistHealing = 0;
  envelopingMistHotHealing = 0;
  envExtraDurationHealing = 0;
  envExtraDurationBonusHealing = 0;
  tftCleaveHealing = 0;
  envelopCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.TEAR_OF_MORNING_TALENT);

    this.invigSheilunsHeal = this.selectedCombatant.hasTalent(talents.SHEILUNS_GIFT_TALENT)
      ? talents.SHEILUNS_GIFT_TALENT
      : spells.INVIGORATING_MISTS_HEAL;

    this.envHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE
      : ENVELOPING_MIST_INCREASE;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(this.invigSheilunsHeal),
      this.handleInvigSheiluns,
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
    return (
      this.invigSheilunsHealing +
      this.envelopingMistHealing +
      this.tftCleaveHealing +
      this.envExtraDurationHealing +
      this.envExtraDurationBonusHealing
    );
  }

  get avgHealingPerCast() {
    return (
      this.hotTracker.getAverageHealingForAttribution(
        TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        ATTRIBUTION_STRINGS.HARDCAST_ENVELOPING_MIST,
      ) +
      (this.envelopingMistHealing +
        this.tftCleaveHealing +
        this.envExtraDurationHealing +
        this.envExtraDurationBonusHealing) /
        this.envelopCasts
    );
  }

  get envBaseDuration() {
    if (this._envBaseDuration === 0) {
      this._envBaseDuration = this.hotTracker._calculateEnvDuration(this.selectedCombatant);
    }
    return this._envBaseDuration;
  }

  isExtraDurationHealing(envHoT: Tracker, eventTimestamp: number): boolean {
    if (!this.hotTracker.duringCelestial(envHoT)) {
      return false;
    }
    const timeSinceApplied = eventTimestamp - envHoT.start;
    return timeSinceApplied > this.envBaseDuration;
  }

  handleEnv(event: HealEvent) {
    const eventHealAmount = event.amount + (event.absorbed || 0);
    if (event.tick) {
      this.envelopingMistHotHealing += eventHealAmount;

      const envHoT = this.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
      if (envHoT && this.isExtraDurationHealing(envHoT, event.timestamp)) {
        this.envExtraDurationHealing += eventHealAmount;
      }
      return;
    }
    this.envelopingMistHealing += eventHealAmount;
  }

  handleHeal(event: HealEvent) {
    const envHoT = this.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (
      UNAFFECTED_SPELLS.includes(event.ability.guid) ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid) ||
      !envHoT
    ) {
      return;
    }

    if (this.isExtraDurationHealing(envHoT, event.timestamp)) {
      this.envExtraDurationBonusHealing += calculateEffectiveHealing(
        event,
        this.envHealingIncrease,
      );
    }
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

  handleInvigSheiluns(event: HealEvent) {
    this.invigSheilunsHealing += calculateEffectiveHealing(event, TEAR_OF_MORNING_VIV_SG_INCREASE);
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
              <SpellLink spell={this.invigSheilunsHeal} /> additional healing:{' '}
              {formatNumber(this.invigSheilunsHealing)}
            </li>
            <li>
              <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> cleave healing:{' '}
              {formatNumber(this.envelopingMistHealing)} (
              {formatNumber(this.envelopingMistHealing / this.envelopCasts)} per cast)
            </li>
            {this.tftCleaveHealing > 0 && (
              <li>
                <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />{' '}
                <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> cleave healing:{' '}
                {formatNumber(this.tftCleaveHealing)}
              </li>
            )}
            {(this.envExtraDurationHealing > 0 || this.envExtraDurationBonusHealing > 0) && (
              <li>
                Extra duration <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> during{' '}
                <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} />:{' '}
                {formatNumber(this.envExtraDurationHealing + this.envExtraDurationBonusHealing)}
                <ul>
                  {this.envExtraDurationHealing > 0 && (
                    <li>Direct healing: {formatNumber(this.envExtraDurationHealing)}</li>
                  )}
                  {this.envExtraDurationBonusHealing > 0 && (
                    <li>
                      Healing increase from buff: {formatNumber(this.envExtraDurationBonusHealing)}
                    </li>
                  )}
                </ul>
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
