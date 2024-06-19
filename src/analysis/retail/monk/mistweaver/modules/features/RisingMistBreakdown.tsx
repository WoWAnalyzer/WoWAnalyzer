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
            amount: this.risingMist.envBonusHealing,
            color: SPELL_COLORS.BLACKOUT_KICK_TOTM,
            tooltip: this.envelopingMistBonusHealingTooltip(),
          },
        ],
      },
      {
        spell: SPELLS.VIVIFY,
        amount: this.risingMist.vivHealing,
        color: SPELL_COLORS.VIVIFY,
        tooltip: this.vivifyTooltip(),
        subSpecs: [
          {
            //additional zen pulse healing from extended rems
            spell: talents.ZEN_PULSE_TALENT,
            amount: this.risingMist.zpHealing,
            color: SPELL_COLORS.ZEN_PULSE,
            tooltip: this.zenPulseTooltip(),
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
        label: talents.MISTY_PEAKS_TALENT.name,
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
        value: this.risingMist.envBonusHardcast,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.MISTY_PEAKS,
        label: talents.MISTY_PEAKS_TALENT.name,
        spellId: talents.MISTY_PEAKS_TALENT.id,
        value: this.risingMist.envBonusMistyPeaks,
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
        label: talents.DANCING_MISTS_TALENT.name,
        spellId: talents.DANCING_MISTS_TALENT.id,
        value: this.risingMist.renewingMistDancingMistExtensionHealing,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: talents.RAPID_DIFFUSION_TALENT.name,
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
        label: talents.DANCING_MISTS_TALENT.name,
        spellId: talents.DANCING_MISTS_TALENT.id,
        value: this.risingMist.vivhealingFromDancingMistRems,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: talents.RAPID_DIFFUSION_TALENT.name,
        spellId: talents.RAPID_DIFFUSION_TALENT.id,
        value: this.risingMist.vivHealingFromRapidDiffusionRems,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hardcast',
        spellId: SPELLS.RENEWING_MIST_HEAL.id,
        value: this.risingMist.vivHealingFromHardcastRems,
        valuePercent: false,
      },
    ];
    return (
      <>
        <strong>{this.risingMist.vivCleaves}</strong> total extra{' '}
        <SpellLink spell={talents.INVIGORATING_MISTS_TALENT} /> hits from extended <br />
        <SpellLink spell={talents.RENEWING_MIST_TALENT} /> by source:
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  zenPulseTooltip() {
    const items = [
      {
        color: SPELL_COLORS.DANCING_MISTS,
        label: talents.DANCING_MISTS_TALENT.name,
        spellId: talents.DANCING_MISTS_TALENT.id,
        value: this.risingMist.zphealingFromDancingMistRems,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RAPID_DIFFUSION,
        label: talents.RAPID_DIFFUSION_TALENT.name,
        spellId: talents.RAPID_DIFFUSION_TALENT.id,
        value: this.risingMist.zpHealingFromRapidDiffusionRems,
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Hardcast',
        spellId: SPELLS.RENEWING_MIST_HEAL.id,
        value: this.risingMist.zpHealingFromHardcastRems,
        valuePercent: false,
      },
    ];
    return (
      <>
        <strong>{this.risingMist.zpHits}</strong> total extra{' '}
        <SpellLink spell={talents.ZEN_PULSE_TALENT} /> hits from extended <br />
        <SpellLink spell={talents.RENEWING_MIST_TALENT} /> by source:
        <hr />
        <DonutChart items={items} />
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
