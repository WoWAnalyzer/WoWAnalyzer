import Analyzer from 'parser/core/Analyzer';
import Echo from './Echo';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { SPELL_COLORS } from '../../constants';
import DonutChart from 'parser/ui/DonutChart';
import { formatNumber } from 'common/format';

class EchoBreakdown extends Analyzer {
  static dependencies = {
    echo: Echo,
  };
  protected echo!: Echo;
  echoItems: TalentAggregateBarSpec[] = [];

  getEchoDataItems() {
    this.echoItems = [
      {
        spell: TALENTS_EVOKER.REVERSION_TALENT,
        amount:
          this.echo.hardcastEchoHealingForSpell(SPELLS.GOLDEN_HOUR_HEAL.id) +
          this.echo.hardcastEchoHealingForSpell(SPELLS.REVERSION_ECHO.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.reversionTooltip(true),
        subSpecs: [
          {
            spell: TALENTS_EVOKER.REVERSION_TALENT,
            amount:
              this.echo.taEchoHealingForSpell(SPELLS.GOLDEN_HOUR_HEAL.id) +
              this.echo.taEchoHealingForSpell(SPELLS.REVERSION_ECHO.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.reversionTooltip(false),
          },
        ],
      },
      {
        spell: TALENTS_EVOKER.DREAM_BREATH_TALENT,
        amount: this.echo.hardcastEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.genericTooltipForSpell(
          true,
          TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
          this.echo.hardcastEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id),
        ),
        subSpecs: [
          {
            spell: TALENTS_EVOKER.DREAM_BREATH_TALENT,
            amount: this.echo.taEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.genericTooltipForSpell(
              false,
              TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
              this.echo.taEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id),
            ),
          },
        ],
      },
      {
        spell: TALENTS_EVOKER.SPIRITBLOOM_TALENT,
        amount:
          this.echo.hardcastEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
          this.echo.hardcastEchoHealingForSpell(SPELLS.SPIRITBLOOM_FONT.id) +
          this.echo.hardcastEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.genericTooltipForSpell(
          true,
          TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
          this.echo.hardcastEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
            this.echo.hardcastEchoHealingForSpell(SPELLS.SPIRITBLOOM_FONT.id) +
            this.echo.hardcastEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        ),
        subSpecs: [
          {
            spell: TALENTS_EVOKER.SPIRITBLOOM_TALENT,
            amount:
              this.echo.taEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
              this.echo.taEchoHealingForSpell(SPELLS.SPIRITBLOOM_FONT.id) +
              this.echo.taEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.genericTooltipForSpell(
              false,
              TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
              this.echo.taEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
                this.echo.taEchoHealingForSpell(SPELLS.SPIRITBLOOM_FONT.id) +
                this.echo.taEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
            ),
          },
        ],
      },
      {
        spell: TALENTS_EVOKER.VERDANT_EMBRACE_TALENT,
        amount:
          this.echo.hardcastEchoHealingForSpell(SPELLS.VERDANT_EMBRACE_HEAL.id) +
          this.echo.hardcastEchoHealingForSpell(SPELLS.LIFEBIND_HEAL.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.verdantEmbraceTooltip(true),
        subSpecs: [
          {
            spell: TALENTS_EVOKER.LIFEBIND_TALENT,
            amount:
              this.echo.taEchoHealingForSpell(SPELLS.VERDANT_EMBRACE_HEAL.id) +
              this.echo.taEchoHealingForSpell(SPELLS.LIFEBIND_HEAL.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.verdantEmbraceTooltip(false),
          },
        ],
      },
      {
        spell: SPELLS.EMERALD_BLOSSOM,
        amount: this.echo.hardcastEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.genericTooltipForSpell(
          true,
          SPELLS.EMERALD_BLOSSOM.id,
          this.echo.hardcastEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
        ),
        subSpecs: [
          {
            spell: SPELLS.EMERALD_BLOSSOM,
            amount: this.echo.taEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.genericTooltipForSpell(
              false,
              SPELLS.EMERALD_BLOSSOM.id,
              this.echo.taEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
            ),
          },
        ],
      },
      {
        spell: SPELLS.LIVING_FLAME_HEAL,
        amount: this.echo.hardcastEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.genericTooltipForSpell(
          true,
          SPELLS.LIVING_FLAME_HEAL.id,
          this.echo.hardcastEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
        ),
        subSpecs: [
          {
            spell: SPELLS.LIVING_FLAME_HEAL,
            amount: this.echo.taEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.genericTooltipForSpell(
              false,
              SPELLS.LIVING_FLAME_HEAL.id,
              this.echo.taEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
            ),
          },
        ],
      },
      {
        spell: SPELLS.ENGULF_HEAL,
        amount: this.echo.hardcastEchoHealingForSpell(SPELLS.ENGULF_HEAL.id),
        color: SPELL_COLORS.ECHO,
        tooltip: this.genericTooltipForSpell(
          true,
          SPELLS.ENGULF_HEAL.id,
          this.echo.hardcastEchoHealingForSpell(SPELLS.ENGULF_HEAL.id),
        ),
        subSpecs: [
          {
            spell: SPELLS.ENGULF_HEAL,
            amount: this.echo.taEchoHealingForSpell(SPELLS.ENGULF_HEAL.id),
            color: SPELL_COLORS.TA_ECHO,
            tooltip: this.genericTooltipForSpell(
              false,
              SPELLS.ENGULF_HEAL.id,
              this.echo.taEchoHealingForSpell(SPELLS.ENGULF_HEAL.id),
            ),
          },
        ],
      },
    ].filter((info) => {
      return info.amount > 0;
    });
    return this.echoItems;
  }

  genericTooltipForSpell(isHardcast: boolean, spell: number, amount: number) {
    const linkTooltip = isHardcast ? (
      <>
        hardcasted <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
      </>
    ) : (
      <>
        <SpellLink spell={TALENTS_EVOKER.RESONATING_SPHERE_TALENT} />
      </>
    );
    return (
      <>
        <SpellLink spell={spell} /> healing from {linkTooltip}: {formatNumber(amount)}
      </>
    );
  }

  reversionTooltip(isHardcast: boolean) {
    const linkTooltip = isHardcast ? (
      <>
        hardcasted <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
      </>
    ) : (
      <>
        <SpellLink spell={TALENTS_EVOKER.RESONATING_SPHERE_TALENT} />
      </>
    );
    const items = [
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value: this.echo.getEchoHealingForSpell(isHardcast, SPELLS.REVERSION_ECHO.id),
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.DISINTEGRATE,
        label: 'Golden Hour',
        spellId: TALENTS_EVOKER.GOLDEN_HOUR_TALENT.id,
        value: this.echo.getEchoHealingForSpell(isHardcast, SPELLS.GOLDEN_HOUR_HEAL.id),
        valuePercent: false,
      },
    ];
    return (
      <>
        <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.GOLDEN_HOUR_TALENT} /> healing from {linkTooltip}:{' '}
        {formatNumber(
          this.echo.getEchoHealingForSpell(isHardcast, SPELLS.REVERSION_ECHO.id) +
            this.echo.getEchoHealingForSpell(isHardcast, SPELLS.GOLDEN_HOUR_HEAL.id),
        )}
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  verdantEmbraceTooltip(isHardcast: boolean) {
    const linkTooltip = isHardcast ? (
      <>
        hardcasted <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
      </>
    ) : (
      <>
        <SpellLink spell={TALENTS_EVOKER.RESONATING_SPHERE_TALENT} />
      </>
    );
    const items = [
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
        value: this.echo.getEchoHealingForSpell(isHardcast, SPELLS.VERDANT_EMBRACE_HEAL.id),
        valuePercent: false,
      },
      {
        color: SPELL_COLORS.LIFEBIND,
        label: 'Lifebind',
        spellId: TALENTS_EVOKER.LIFEBIND_TALENT.id,
        value: this.echo.getEchoHealingForSpell(isHardcast, SPELLS.LIFEBIND_HEAL.id),
        valuePercent: false,
      },
    ];
    return (
      <>
        <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> healing from {linkTooltip}:{' '}
        {formatNumber(
          this.echo.getEchoHealingForSpell(isHardcast, SPELLS.VERDANT_EMBRACE_HEAL.id) +
            this.echo.getEchoHealingForSpell(isHardcast, SPELLS.LIFEBIND_HEAL.id),
        )}
        <hr />
        <DonutChart items={items} />
      </>
    );
  }

  statistic() {
    const echoData = this.getEchoDataItems();
    if (!echoData.length) {
      return null;
    }
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> <small>breakdown by spell</small>
          </>
        }
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        smallTitle
        wide
      >
        <TalentAggregateBars bars={this.getEchoDataItems()}></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default EchoBreakdown;
