import { EarthShield } from 'analysis/retail/shaman/shared';
import EarthenHarmony from '../talents/EarthenHarmony';
import ElementalOrbit from 'analysis/retail/shaman/shared/talents/ElementalOrbit';
import Analyzer, { Options } from 'parser/core/Analyzer';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import talents from 'common/TALENTS/shaman';
import { RESTORATION_COLORS } from '../../constants';
import { SpellLink } from 'interface';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import UptimeIcon from 'interface/icons/Uptime';
import { formatNumber, formatPercentage } from 'common/format';

class EarthShieldBreakdown extends Analyzer {
  static dependencies = {
    earthShield: EarthShield,
    earthenHarmony: EarthenHarmony,
    elementalOrbit: ElementalOrbit,
  };
  wide: boolean = false;
  earthShieldItems: TalentAggregateBarSpec[] = [];
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.EARTH_SHIELD_TALENT);
    this.wide =
      this.selectedCombatant.hasTalent(talents.ELEMENTAL_ORBIT_TALENT) &&
      this.selectedCombatant.hasTalent(talents.EARTHEN_HARMONY_TALENT);
  }

  protected earthShield!: EarthShield;
  protected earthenHarmony!: EarthenHarmony;
  protected elementalOrbit!: ElementalOrbit;

  get totalHealing() {
    return (
      this.earthShield.healing +
      this.earthShield.buffHealing +
      this.elementalOrbit.healing +
      this.elementalOrbit.buffHealing
    );
  }

  getEarthShieldDataItems() {
    this.earthShieldItems = [
      //base earth shield
      {
        spell: talents.EARTH_SHIELD_TALENT,
        amount: this.earthShield.healing,
        color: RESTORATION_COLORS.CHAIN_HEAL,
        tooltip: this.baseTooltip(this.earthShield.uptimePercent, this.earthShield.healing),
        subSpecs: [
          {
            //bonus healing from heal amp
            spell: talents.EARTH_SHIELD_TALENT,
            amount: this.earthShield.buffHealing,
            color: RESTORATION_COLORS.RIPTIDE,
            tooltip: this.bonusHealingTooltip(this.earthShield.buffHealing),
          },
        ],
      },
      //elemental orbit
      {
        spell: talents.ELEMENTAL_ORBIT_TALENT,
        amount: this.elementalOrbit.healing,
        color: RESTORATION_COLORS.HEALING_RAIN,
        tooltip: this.baseTooltip(this.elementalOrbit.uptimePercent, this.elementalOrbit.healing),
        subSpecs: [
          {
            //bonus healing from heal amp
            spell: talents.ELEMENTAL_ORBIT_TALENT,
            amount: this.elementalOrbit.buffHealing,
            color: RESTORATION_COLORS.RIPTIDE,
            tooltip: this.bonusHealingTooltip(this.elementalOrbit.buffHealing),
          },
        ],
      },
      //earthen harmony
      {
        //targeted earth shield
        spell: talents.EARTHEN_HARMONY_TALENT,
        amount: this.earthenHarmony.earthShieldHealing,
        color: RESTORATION_COLORS.CHAIN_HEAL,
        tooltip: this.earthenHarmonyBaseTooltip(),
        subSpecs: [
          {
            //elemental orbit earth shield
            spell: talents.EARTHEN_HARMONY_TALENT,
            amount: this.earthenHarmony.elementalOrbitEarthShieldHealing,
            color: RESTORATION_COLORS.HEALING_RAIN,
            tooltip: this.earthenHarmonyEOTooltip(),
          },
        ],
      },
    ];
    return this.earthShieldItems;
  }

  baseTooltip(uptime: number, amount: number) {
    return (
      <>
        <UptimeIcon /> {formatPercentage(uptime)}% uptime
        <br />
        {this.healingIcon()} <strong>{formatNumber(amount)}</strong> direct healing
      </>
    );
  }

  bonusHealingTooltip(amount: number) {
    return (
      <>
        {this.healingIcon()} <strong>{formatNumber(amount)}</strong> bonus healing from the buff
      </>
    );
  }

  earthenHarmonyBaseTooltip() {
    return (
      <>
        <SpellLink spell={talents.EARTH_SHIELD_TALENT} />:
        <br />
        {this.shieldIcon()}{' '}
        <strong>{formatNumber(this.earthenHarmony.earthShielddamageReduced)}</strong> damage
        mitigated
        <br />
        {this.healingIcon()} <strong>{formatNumber(this.earthenHarmony.earthShieldHealing)}</strong>{' '}
        additional healing
      </>
    );
  }

  earthenHarmonyEOTooltip() {
    return (
      <>
        <SpellLink spell={talents.EARTH_SHIELD_TALENT} /> from{' '}
        <SpellLink spell={talents.ELEMENTAL_ORBIT_TALENT} />:
        <br />
        {this.shieldIcon()}{' '}
        <strong>{formatNumber(this.earthenHarmony.elementalOrbitDamageReduced)}</strong> damage
        mitigated
        <br />
        {this.healingIcon()}{' '}
        <strong>{formatNumber(this.earthenHarmony.elementalOrbitEarthShieldHealing)}</strong>{' '}
        additional healing
      </>
    );
  }

  healingIcon() {
    return <img alt="Healing" src="/img/healing.png" className="icon" />;
  }

  shieldIcon() {
    return <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />;
  }

  statistic() {
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={talents.EARTH_SHIELD_TALENT} /> -{' '}
            <ItemHealingDone amount={this.totalHealing} displayPercentage={this.wide} />
          </>
        }
        smallTitle={!this.wide}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        footer={this.wide && <>Mouseover each section for additional details</>}
        smallFooter
        wide={this.wide}
      >
        <TalentAggregateBars
          bars={this.getEarthShieldDataItems()}
          wide={this.wide}
        ></TalentAggregateBars>
      </TalentAggregateStatisticContainer>
    );
  }
}

export default EarthShieldBreakdown;
