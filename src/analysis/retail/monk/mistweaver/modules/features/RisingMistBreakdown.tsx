import Analyzer, { Options } from 'parser/core/Analyzer';
import RisingMist from '../spells/RisingMist';
import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import talentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import SPELLS from 'common/SPELLS';
import { SPELL_COLORS } from '../../constants';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';

class RisingMistBreakdown extends Analyzer {
  static dependencies = {
    risingMist: RisingMist,
  };
  risingMistItems: TalentAggregateBarSpec[] = [];
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RISING_MIST_TALENT);
  }
  protected risingMist!: RisingMist;

  sortedRisingMistItems() {
    this.risingMistItems = [
      {
        spell: SPELLS.RISING_MIST_HEAL,
        amount: this.risingMist.directHealing,
        color: SPELL_COLORS.DANCING_MIST,
        tooltip: this.risingMistDirectTooltip(),
      },
      {
        spell: SPELLS.RENEWING_MIST_HEAL,
        amount: this.risingMist.renewingMistExtensionHealing,
        color: SPELL_COLORS.RENEWING_MIST,
        tooltip: this.renewingMistTooltip(),
      },
      {
        //enveloping mist extension healing
        spell: talents.ENVELOPING_MIST_TALENT,
        amount:
          this.risingMist.envMistyPeaksExtensionHealing +
          this.risingMist.envHardcastExtensionHealing,
        color: SPELL_COLORS.ENVELOPING_MIST,
        tooltip: this.envelopingMistTooltip(),
        subSpecs: [
          {
            //bonus healing from healing bonus
            spell: talents.ENVELOPING_MIST_TALENT,
            amount: this.risingMist.extraEnvBonusHealing,
            color: SPELL_COLORS.BLACKOUT_KICK_TOTM,
            tooltip: this.envelopingMistBonusHealingTooltip(),
          },
        ],
      },
      {
        spell: SPELLS.VIVIFY,
        amount: this.risingMist.extraVivHealing,
        color: SPELL_COLORS.VIVIFY,
        tooltip: this.vivifyTooltip(),
      },
      {
        //essence font extension healing
        spell: talents.ESSENCE_FONT_TALENT,
        amount: this.risingMist.essenceFontExtensionHealing,
        color: SPELL_COLORS.ESSENCE_FONT,
        tooltip: this.essenceFontTooltip(),
        subSpecs: [
          {
            //additional mastery hits from extended EF hots
            spell: SPELLS.GUSTS_OF_MISTS,
            amount: this.risingMist.extraMasteryhealing,
            color: SPELL_COLORS.GUSTS_OF_MISTS,
            tooltip: this.gustsOfMistsTooltip(),
          },
        ],
      },
    ];
    const sortedRisingMistItems = this.risingMistItems.sort(
      (a, b) =>
        b.amount +
        (b.subSpecs ? b.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0) : 0) -
        a.amount +
        (a.subSpecs ? a.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0) : 0),
    );

    //determine scale factor for chart based on data items - calculate the inverse of each items percentage of total and take the lowest
    //i.e if 50% of healing done is the highest then the scale factor should be 2
    const scaleFactor = sortedRisingMistItems.reduce(
      (factor, item) =>
        factor <
        this.risingMist.totalHealing /
          (item.amount +
            (item.subSpecs
              ? item.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0)
              : 0))
          ? factor
          : this.risingMist.totalHealing /
            (item.amount +
              (item.subSpecs
                ? item.subSpecs?.reduce((sum, subSpec) => sum + (subSpec?.amount || 0), 0)
                : 0)),
      100,
    );

    return { sortedRisingMistItems, scaleFactor };
  }

  envelopingMistTooltip() {
    return (
      <>
        <SpellLink id={talents.ENVELOPING_MIST_TALENT} /> extension healing (
        {formatPercentage(
          (this.risingMist.envHardcastExtensionHealing +
            this.risingMist.envMistyPeaksExtensionHealing) /
            this.risingMist.totalHealing,
        )}
        % of Total)
        <ul>
          <li>
            {formatNumber(this.risingMist.envMistyPeaksExtensionHealing)} from extended{' '}
            <SpellLink id={talents.MISTY_PEAKS_TALENT} /> procs
          </li>
          <li>
            {formatNumber(this.risingMist.envHardcastExtensionHealing)} from extended hardcasts
          </li>
        </ul>
      </>
    );
  }

  envelopingMistBonusHealingTooltip() {
    return (
      <>
        Additional bonus healing from the extra <SpellLink id={talents.ENVELOPING_MIST_TALENT} />{' '}
        buff uptime (
        {formatPercentage(this.risingMist.extraEnvBonusHealing / this.risingMist.totalHealing)}% of
        Total)
        <ul>
          <li>
            {formatNumber(this.risingMist.extraEnvBonusMistyPeaks)} from extended{' '}
            <SpellLink id={talents.MISTY_PEAKS_TALENT} /> procs
          </li>
          <li>{formatNumber(this.risingMist.extraEnvBonusHardcast)} from extended hardcasts</li>
        </ul>
      </>
    );
  }

  renewingMistTooltip() {
    return (
      <>
        <SpellLink id={talents.RENEWING_MIST_TALENT} /> extension healing (
        {formatPercentage(
          this.risingMist.renewingMistExtensionHealing / this.risingMist.totalHealing,
        )}
        % of Total)
        <ul>
          <li>
            {formatNumber(this.risingMist.renewingMistDancingMistExtensionHealing)} from extended{' '}
            <SpellLink id={talents.DANCING_MISTS_TALENT} />{' '}
            <SpellLink id={talents.RENEWING_MIST_TALENT} />
          </li>
          <li>
            {formatNumber(this.risingMist.renewingMistHardcastExtensionHealing)} from extended
            hardcast <SpellLink id={talents.RENEWING_MIST_TALENT} />
          </li>
          <li>
            {formatNumber(this.risingMist.renewingMistRapidDiffusionExtensionHealing)} from extended{' '}
            <SpellLink id={talents.RAPID_DIFFUSION_TALENT} />{' '}
            <SpellLink id={talents.RENEWING_MIST_TALENT} />
          </li>
        </ul>
      </>
    );
  }

  risingMistDirectTooltip() {
    return (
      <>
        <SpellLink id={talents.RISING_MIST_TALENT} /> direct healing from{' '}
        <SpellLink id={talents.RISING_SUN_KICK_TALENT} /> casts (
        {formatPercentage(this.risingMist.directHealing / this.risingMist.totalHealing)}% of Total)
        <ul>
          <li>
            {formatNumber(this.risingMist.averageHealing)} average healing per{' '}
            <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT} />
          </li>
          <li>
            {this.risingMist.averageTargetsPerRSKCast()} average hits per{' '}
            <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT} />
          </li>
        </ul>
      </>
    );
  }

  vivifyTooltip() {
    return (
      <>
        <SpellLink id={SPELLS.VIVIFY} /> healing from extended{' '}
        <SpellLink id={talents.RENEWING_MIST_TALENT} /> (
        {formatPercentage(this.risingMist.extraVivHealing / this.risingMist.totalHealing)}% of
        Total)
        <ul>
          <li>
            {this.risingMist.extraVivCleaves} extra cleave hits via{' '}
            <SpellLink id={talents.INVIGORATING_MISTS_TALENT} />
          </li>
          <li>
            {formatNumber(this.risingMist.extraVivhealingFromDancingMistRems)} from extended{' '}
            <SpellLink id={talents.DANCING_MISTS_TALENT} />{' '}
            <SpellLink id={talents.RENEWING_MIST_TALENT} />
          </li>
          <li>
            {formatNumber(this.risingMist.extraVivHealingFromHardcastRems)} from extended hardcast{' '}
            <SpellLink id={talents.RENEWING_MIST_TALENT} />
          </li>
          <li>
            {formatNumber(this.risingMist.extraVivHealingFromRapidDiffusionRems)} from extended{' '}
            <SpellLink id={talents.RAPID_DIFFUSION_TALENT} />{' '}
            <SpellLink id={talents.RENEWING_MIST_TALENT} />
          </li>
        </ul>
      </>
    );
  }

  essenceFontTooltip() {
    return (
      <>
        Additional <SpellLink id={SPELLS.ESSENCE_FONT_BUFF} /> healing from extensions (
        {formatPercentage(
          this.risingMist.essenceFontExtensionHealing / this.risingMist.totalHealing,
        )}
        % of Total)
      </>
    );
  }

  gustsOfMistsTooltip() {
    return (
      <>
        Additional <SpellLink id={SPELLS.GUSTS_OF_MISTS} /> healing from extended{' '}
        <SpellLink id={talents.ESSENCE_FONT_TALENT} /> (
        {formatPercentage(this.risingMist.extraMasteryhealing / this.risingMist.totalHealing)}% of
        Total)
        <ul>
          {this.selectedCombatant.hasTalent(talents.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) && (
            <li>
              {formatNumber(this.risingMist.extraChijiGomHealing)}{' '}
              <SpellLink id={SPELLS.GUST_OF_MISTS_CHIJI} /> healing from extended{' '}
              <SpellLink id={talents.ESSENCE_FONT_TALENT} />
            </li>
          )}
          <li>
            {formatNumber(this.risingMist.extraGomHealing)} <SpellLink id={SPELLS.GUSTS_OF_MISTS} />{' '}
            healing from extended <SpellLink id={talents.ESSENCE_FONT_TALENT} />
          </li>
        </ul>
      </>
    );
  }

  statistic() {
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink id={talents.RISING_MIST_TALENT.id} /> -{' '}
            <ItemHealingDone amount={this.risingMist.totalHealing} />
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        footer={<>*Mouseover for a detailed breakdown of each spell's contribution</>}
        smallFooter
        tooltip={this.risingMist.toolTip()}
      >
        {talentAggregateBars(
          this.sortedRisingMistItems().sortedRisingMistItems,
          this.sortedRisingMistItems().scaleFactor,
        )}
      </TalentAggregateStatisticContainer>
    );
  }
}

export default RisingMistBreakdown;
