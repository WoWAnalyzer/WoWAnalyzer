import { EarthShield } from 'analysis/retail/shaman/shared';
import EarthenHarmony from '../talents/EarthenHarmony';
import ElementalOrbit from 'analysis/retail/shaman/shared/talents/ElementalOrbit';
import SurgingShields from 'analysis/retail/shaman/shared/talents/SurgingShields';
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
    surgingShields: SurgingShields,
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
  protected surgingShields!: SurgingShields;

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
      //surging shields
      {
        //targeted earth shield
        spell: talents.SURGING_SHIELDS_TALENT,
        amount: this.surgingShields.earthShieldHealing,
        color: RESTORATION_COLORS.CHAIN_HEAL,
        tooltip: this.surgingShieldsTooltip(),
        subSpecs: [
          {
            //elemental orbit earth shield
            spell: talents.SURGING_SHIELDS_TALENT,
            amount: this.surgingShields.elementalOrbitEarthShieldHealing,
            color: RESTORATION_COLORS.HEALING_RAIN,
            tooltip: this.surgingShieldsEOTooltip(),
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
        <SpellLink id={talents.EARTH_SHIELD_TALENT} />:
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
        <SpellLink id={talents.EARTH_SHIELD_TALENT} /> from{' '}
        <SpellLink id={talents.ELEMENTAL_ORBIT_TALENT} />:
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

  surgingShieldsTooltip() {
    return (
      <>
        {this.healingIcon()} <strong>{formatNumber(this.surgingShields.earthShieldHealing)}</strong>{' '}
        additional <SpellLink id={talents.EARTH_SHIELD_TALENT} /> healing
      </>
    );
  }

  surgingShieldsEOTooltip() {
    return (
      <>
        {this.healingIcon()}{' '}
        <strong>{formatNumber(this.surgingShields.elementalOrbitEarthShieldHealing)}</strong>{' '}
        additional <SpellLink id={talents.EARTH_SHIELD_TALENT} /> healing from{' '}
        <SpellLink id={talents.ELEMENTAL_ORBIT_TALENT} />
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
            <SpellLink id={talents.EARTH_SHIELD_TALENT.id} /> -{' '}
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
