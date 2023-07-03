import Analyzer, { Options } from 'parser/core/Analyzer';
import RisingMist from '../spells/RisingMist';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import SPELLS from 'common/SPELLS';
import { SPELL_COLORS } from '../../constants';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import DonutChart from 'parser/ui/DonutChart';

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

  getRisingMistDataItems() {
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
    return this.risingMistItems;
  }

  envelopingMistTooltip() {
    const items = [
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Hardcast',
        spellId: talents.ENVELOPING_MIST_TALENT.id,
        value: this.risingMist.envHardcastExtensionHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.MISTY_PEAKS,
        label: 'Misty Peaks',
        spellId: talents.MISTY_PEAKS_TALENT.id,
        value: this.risingMist.envMistyPeaksExtensionHealing,
        valuePercent: false,
      },
    ];
    return (
      <>
        <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> extension healing by source:
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  envelopingMistBonusHealingTooltip() {
    const items = [
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Hardcast',
        spellId: talents.ENVELOPING_MIST_TALENT.id,
        value: this.risingMist.extraEnvBonusHardcast,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.MISTY_PEAKS,
        label: 'Misty Peaks',
        spellId: talents.MISTY_PEAKS_TALENT.id,
        value: this.risingMist.extraEnvBonusMistyPeaks,
        valuePercent: false,
      },
    ];
    return (
      <>
        Additional bonus healing from the extra
        <br />
        <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> buff uptime by source:
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  renewingMistTooltip() {
    const items = [
      {
        color: SPELL_COLORS.DANCING_MISTS,
        label: 'Dancing Mists',
        spellId: talents.DANCING_MISTS_TALENT.id,
        value: this.risingMist.renewingMistDancingMistExtensionHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: 'Rapid Diffusion',
        spellId: talents.RAPID_DIFFUSION_TALENT.id,
        value: this.risingMist.renewingMistRapidDiffusionExtensionHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hardcast',
        spellId: SPELLS.RENEWING_MIST_HEAL.id,
        value: this.risingMist.renewingMistHardcastExtensionHealing,
        valuePercent: false,
      },
    ];
    return (
      <>
        <SpellLink spell={talents.RENEWING_MIST_TALENT} /> extension healing by source:
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  risingMistDirectTooltip() {
    return (
      <>
        <SpellLink spell={talents.RISING_MIST_TALENT} /> direct healing from{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> casts
        <ul>
          <li>
            {formatNumber(this.risingMist.averageHealing)} average healing per{' '}
            <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />
          </li>
          <li>
            {this.risingMist.averageTargetsPerRSKCast()} average hits per{' '}
            <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />
          </li>
        </ul>
      </>
    );
  }

  vivifyTooltip() {
    const items = [
      {
        color: SPELL_COLORS.DANCING_MISTS,
        label: 'Dancing Mists',
        spellId: talents.DANCING_MISTS_TALENT.id,
        value: this.risingMist.extraVivhealingFromDancingMistRems,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: 'Rapid Diffusion',
        spellId: talents.RAPID_DIFFUSION_TALENT.id,
        value: this.risingMist.extraVivHealingFromRapidDiffusionRems,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hardcast',
        spellId: SPELLS.RENEWING_MIST_HEAL.id,
        value: this.risingMist.extraVivHealingFromHardcastRems,
        valuePercent: false,
      },
    ];
    return (
      <>
        <strong>{this.risingMist.extraVivCleaves}</strong> total extra cleaves via{' '}
        <SpellLink spell={talents.INVIGORATING_MISTS_TALENT} />
        <br />
        <SpellLink spell={SPELLS.VIVIFY} /> healing via extended{' '}
        <SpellLink spell={talents.RENEWING_MIST_TALENT} />
        <br />
        by source:
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  essenceFontTooltip() {
    return (
      <>
        {formatNumber(this.risingMist.essenceFontExtensionHealing)}{' '}
        <SpellLink spell={SPELLS.ESSENCE_FONT_BUFF} /> extension healing
      </>
    );
  }

  gustsOfMistsTooltip() {
    return (
      <>
        Additional <SpellLink spell={SPELLS.GUSTS_OF_MISTS} /> healing from extended{' '}
        <SpellLink spell={talents.ESSENCE_FONT_TALENT} />
        <ul>
          {this.selectedCombatant.hasTalent(talents.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) && (
            <li>
              {formatNumber(this.risingMist.extraChijiGomHealing)}{' '}
              <SpellLink spell={SPELLS.GUST_OF_MISTS_CHIJI} /> healing
            </li>
          )}
          <li>
            {formatNumber(this.risingMist.extraGomHealing)}{' '}
            <SpellLink spell={SPELLS.GUSTS_OF_MISTS} /> healing
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
            <SpellLink spell={talents.RISING_MIST_TALENT} /> -{' '}
            <ItemHealingDone amount={this.risingMist.totalHealing} />
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        footer={<>See the Rising Mist tab for HoT extension details</>}
        smallFooter
        tooltip={this.risingMist.toolTip()}
        wide
      >
        <TalentAggregateBars bars={this.getRisingMistDataItems()} wide></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default RisingMistBreakdown;
