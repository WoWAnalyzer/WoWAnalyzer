import { EarthShield, EarthenHarmony } from 'analysis/retail/shaman/shared';
import ElementalOrbit from 'analysis/retail/shaman/shared/talents/ElementalOrbit';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import { RESTORATION_COLORS } from '../../constants';
import { SpellLink } from 'interface';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import UptimeIcon from 'interface/icons/Uptime';
import { formatNumber, formatPercentage } from 'common/format';
import Combatants from 'parser/shared/modules/Combatants';
import Events, { HealEvent } from 'parser/core/Events';

interface TooltipConfig {
  sourceSpell?: number;
  triggerSpell?: number;
  uptime?: number;
  directHealing?: number;
  bonusHealing?: number;
  damageMitigated?: number;
  customText?: string;
}

class EarthShieldBreakdown extends Analyzer {
  static dependencies = {
    earthShield: EarthShield,
    earthenHarmony: EarthenHarmony,
    elementalOrbit: ElementalOrbit,
    combatants: Combatants,
  };

  wide = false;
  earthShieldItems: TalentAggregateBarSpec[] = [];

  protected earthShield!: EarthShield;
  protected earthenHarmony!: EarthenHarmony;
  protected elementalOrbit!: ElementalOrbit;
  protected combatants!: Combatants;

  earthweaverBaseBonus = 0;
  earthweaverOrbitBonus = 0;

  earthenCommunionBaseBonus = 0;
  earthenCommunionOrbitBonus = 0;

  reactiveWardingHealing = 0;

  therazanesResilienceBaseBonus = 0;
  therazanesResilienceOrbitBonus = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT);
    this.wide =
      this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ORBIT_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.EARTHEN_HARMONY_TALENT);

    if (!this.active) {
      return;
    }

    if (this.selectedCombatant.hasTalent(TALENTS.EARTHWEAVER_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
        this.onEarthweaverHeal,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
        this.onEarthenCommunionHeal,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
        this.onReactiveWardingHeal,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS.THERAZANES_RESILIENCE_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
        this.onTherazanesResilienceHeal,
      );
    }
  }

  onEarthweaverHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) return;

    const totalEffective = event.amount + (event.absorbed || 0);
    const bonus = totalEffective * (0.4 / 1.4);

    if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.earthweaverOrbitBonus += bonus;
    } else if (combatant.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.earthweaverBaseBonus += bonus;
    }
  }

  onEarthenCommunionHeal(event: HealEvent) {
    if (event.targetID !== this.owner.playerId) return;

    const combatant = this.combatants.getEntity(event);
    if (!combatant) return;

    const totalEffective = event.amount + (event.absorbed || 0);
    const bonus = totalEffective * (0.25 / 1.25);

    if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.earthenCommunionOrbitBonus += bonus;
    } else if (combatant.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.earthenCommunionBaseBonus += bonus;
    }
  }

  onReactiveWardingHeal(event: HealEvent) {
    this.reactiveWardingHealing += event.amount + (event.absorbed || 0);
  }

  onTherazanesResilienceHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) return;

    const totalEffective = event.amount + (event.absorbed || 0);
    const bonus = totalEffective * (0.15 / 1.15);

    if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.therazanesResilienceOrbitBonus += bonus;
    } else if (combatant.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.therazanesResilienceBaseBonus += bonus;
    }
  }

  get totalHealing() {
    return (
      this.earthShield.healing +
      this.earthShield.buffHealing +
      this.elementalOrbit.healing +
      this.elementalOrbit.buffHealing +
      (this.earthenHarmony?.earthShieldHealing || 0) +
      (this.earthenHarmony?.elementalOrbitEarthShieldHealing || 0) +
      this.earthweaverBaseBonus +
      this.earthweaverOrbitBonus +
      this.earthenCommunionBaseBonus +
      this.earthenCommunionOrbitBonus +
      this.reactiveWardingHealing +
      this.therazanesResilienceBaseBonus +
      this.therazanesResilienceOrbitBonus
    );
  }

  getEarthShieldDataItems() {
    this.earthShieldItems = [
      {
        spell: TALENTS.EARTH_SHIELD_TALENT,
        amount: this.earthShield.healing,
        color: RESTORATION_COLORS.EARTHSHIELD_BASE,
        tooltip: this.buildTooltip({
          uptime: this.earthShield.uptimePercent,
          directHealing: this.earthShield.healing,
        }),
        subSpecs: [
          {
            spell: TALENTS.EARTH_SHIELD_TALENT,
            amount: this.earthShield.buffHealing,
            color: RESTORATION_COLORS.EARTHSHIELD_BASE,
            tooltip: this.buildTooltip({ bonusHealing: this.earthShield.buffHealing }),
          },
        ],
      },
      {
        spell: TALENTS.ELEMENTAL_ORBIT_TALENT,
        amount: this.elementalOrbit.healing,
        color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
        tooltip: this.buildTooltip({
          uptime: this.elementalOrbit.uptimePercent,
          directHealing: this.elementalOrbit.healing,
        }),
        subSpecs: [
          {
            spell: TALENTS.ELEMENTAL_ORBIT_TALENT,
            amount: this.elementalOrbit.buffHealing,
            color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
            tooltip: this.buildTooltip({ bonusHealing: this.elementalOrbit.buffHealing }),
          },
        ],
      },
      {
        spell: TALENTS.EARTHEN_HARMONY_TALENT,
        amount: this.earthenHarmony.earthShieldHealing,
        color: RESTORATION_COLORS.EARTHSHIELD_EARTHEN_HARMONY,
        tooltip: this.buildTooltip({
          sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
          damageMitigated: this.earthenHarmony.earthShielddamageReduced,
          bonusHealing: this.earthenHarmony.earthShieldHealing,
        }),
        subSpecs: [
          {
            spell: TALENTS.EARTHEN_HARMONY_TALENT,
            amount: this.earthenHarmony.elementalOrbitEarthShieldHealing,
            color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
            tooltip: this.buildTooltip({
              sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
              triggerSpell: TALENTS.ELEMENTAL_ORBIT_TALENT.id,
              damageMitigated: this.earthenHarmony.elementalOrbitDamageReduced,
              bonusHealing: this.earthenHarmony.elementalOrbitEarthShieldHealing,
            }),
          },
        ],
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS.EARTHWEAVER_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.EARTHWEAVER_TALENT,
        amount: this.earthweaverBaseBonus,
        color: RESTORATION_COLORS.EARTHSHIELD_EARTHWEAVER,
        tooltip: this.buildTooltip({
          sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
          bonusHealing: this.earthweaverBaseBonus,
        }),
        subSpecs: [
          {
            spell: TALENTS.EARTHWEAVER_TALENT,
            amount: this.earthweaverOrbitBonus,
            color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
            tooltip: this.buildTooltip({
              sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
              triggerSpell: TALENTS.ELEMENTAL_ORBIT_TALENT.id,
              bonusHealing: this.earthweaverOrbitBonus,
            }),
          },
        ],
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.EARTHEN_COMMUNION_TALENT,
        amount: this.earthenCommunionBaseBonus,
        color: RESTORATION_COLORS.EARTHSHIELD_EARTHERN_COMMUNION,
        tooltip: this.buildTooltip({
          bonusHealing: this.earthenCommunionBaseBonus,
          customText: 'Earthen Communion bonus (Base)',
        }),
        subSpecs: [
          {
            spell: TALENTS.EARTHEN_COMMUNION_TALENT,
            amount: this.earthenCommunionOrbitBonus,
            color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
            tooltip: this.buildTooltip({
              bonusHealing: this.earthenCommunionOrbitBonus,
              customText: 'Earthen Communion bonus (Orbital)',
            }),
          },
        ],
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.REACTIVE_WARDING_TALENT,
        amount: this.reactiveWardingHealing,
        color: RESTORATION_COLORS.EARTHSHIELD_REACTIVE_WARDING,
        tooltip: this.buildTooltip({
          directHealing: this.reactiveWardingHealing,
          customText: 'Reactive Warding direct healing',
        }),
      });
    } else if (this.selectedCombatant.hasTalent(TALENTS.THERAZANES_RESILIENCE_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.THERAZANES_RESILIENCE_TALENT,
        amount: this.therazanesResilienceBaseBonus,
        color: RESTORATION_COLORS.EARTHSHIELD_THERAZANES_RESILIENCE,
        tooltip: this.buildTooltip({
          bonusHealing: this.therazanesResilienceBaseBonus,
          customText: "Therazane's Resilience bonus (Base)",
        }),
        subSpecs: [
          {
            spell: TALENTS.THERAZANES_RESILIENCE_TALENT,
            amount: this.therazanesResilienceOrbitBonus,
            color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
            tooltip: this.buildTooltip({
              sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
              triggerSpell: TALENTS.ELEMENTAL_ORBIT_TALENT.id,
              bonusHealing: this.therazanesResilienceOrbitBonus,
              customText: "Therazane's Resilience bonus (Orbital)",
            }),
          },
        ],
      });
    }

    return this.earthShieldItems;
  }

  buildTooltip(config: TooltipConfig) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {config.sourceSpell && (
          <div>
            <SpellLink spell={config.sourceSpell} />
            {config.triggerSpell && (
              <>
                {' '}
                from <SpellLink spell={config.triggerSpell} />
              </>
            )}
            :
          </div>
        )}

        {config.uptime !== undefined && (
          <div>
            <UptimeIcon /> {formatPercentage(config.uptime)}% uptime
          </div>
        )}

        {config.damageMitigated !== undefined && (
          <div>
            {this.shieldIcon()} <strong>{formatNumber(config.damageMitigated)}</strong> damage
            mitigated
          </div>
        )}

        {config.directHealing !== undefined && (
          <div>
            {this.healingIcon()} <strong>{formatNumber(config.directHealing)}</strong> direct
            healing on hit
          </div>
        )}

        {config.bonusHealing !== undefined && (
          <div>
            {this.healingIcon()} <strong>{formatNumber(config.bonusHealing)}</strong> bonus healing
            from other spells
          </div>
        )}

        {config.customText && (
          <div>
            <em>{config.customText}</em>
          </div>
        )}
      </div>
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
            <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> -{' '}
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
