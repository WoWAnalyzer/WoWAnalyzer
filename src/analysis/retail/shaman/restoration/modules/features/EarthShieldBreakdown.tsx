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
import type { ReactNode } from 'react';
import { splitEarthShieldHeal } from 'analysis/retail/shaman/shared/talents/earthShieldHealSplit';

interface TooltipConfig {
  sourceSpell?: number;
  triggerSpell?: number;
  uptime?: number;
  directHealing?: number;
  bonusHealing?: number;
  damageMitigated?: ReactNode;
  customText?: string;
}

class EarthShieldBreakdown extends Analyzer.withDependencies({
  earthShield: EarthShield,
  earthenHarmony: EarthenHarmony,
  elementalOrbit: ElementalOrbit,
  combatants: Combatants,
}) {
  wide = false;
  earthShieldItems: TalentAggregateBarSpec[] = [];

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
    this.wide = this.selectedCombatant.hasTalent(TALENTS.EARTHEN_HARMONY_TALENT);

    if (!this.active) {
      return;
    }

    if (
      this.selectedCombatant.hasTalent(TALENTS.EARTHWEAVER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.THERAZANES_RESILIENCE_TALENT)
    ) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
        this.onEarthShieldTalentHeal,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
        this.onReactiveWardingHeal,
      );
    }
  }
  /** Attributes each Earth Shield heal to the talents that increased it (see earthShieldHealSplit). */
  onEarthShieldTalentHeal(event: HealEvent) {
    const target = this.deps.combatants.getEntity(event);
    if (!target) return;

    const split = splitEarthShieldHeal(event, this.selectedCombatant, target);
    if (!split) return;

    if (split.bucket === 'elementalOrbit') {
      this.earthweaverOrbitBonus += split.earthweaver;
      this.earthenCommunionOrbitBonus += split.earthenCommunion;
      this.therazanesResilienceOrbitBonus += split.therazanesResilience;
    } else {
      this.earthweaverBaseBonus += split.earthweaver;
      this.earthenCommunionBaseBonus += split.earthenCommunion;
      this.therazanesResilienceBaseBonus += split.therazanesResilience;
    }
  }

  onReactiveWardingHeal(event: HealEvent) {
    this.reactiveWardingHealing += event.amount + (event.absorbed || 0);
  }

  get totalHealing() {
    return (
      this.deps.earthShield.healing +
      this.deps.earthShield.buffHealing +
      this.deps.elementalOrbit.healing +
      this.deps.elementalOrbit.buffHealing +
      (this.deps.earthenHarmony?.earthShieldHealing || 0) +
      (this.deps.earthenHarmony?.elementalOrbitEarthShieldHealing || 0) +
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
        amount: this.deps.earthShield.healing + this.deps.earthShield.buffHealing,
        color: RESTORATION_COLORS.EARTHSHIELD_BASE,
        tooltip: this.buildTooltip({
          uptime: this.deps.earthShield.uptimePercent,
          directHealing: this.deps.earthShield.healing,
          bonusHealing: this.deps.earthShield.buffHealing,
          customText: 'This is the Earth Shield you cast on others.',
        }),
      },
      {
        spell: TALENTS.ELEMENTAL_ORBIT_TALENT,
        amount: this.deps.elementalOrbit.healing + this.deps.elementalOrbit.buffHealing,
        color: RESTORATION_COLORS.EARTHSHIELD_ELEMENTAL_ORBIT,
        tooltip: this.buildTooltip({
          uptime: this.deps.elementalOrbit.uptimePercent,
          directHealing: this.deps.elementalOrbit.healing,
          bonusHealing: this.deps.elementalOrbit.buffHealing,
          customText: 'This is the Earth Shield you cast on yourself.',
        }),
      },
      {
        spell: TALENTS.EARTHEN_HARMONY_TALENT,
        amount:
          this.deps.earthenHarmony.earthShieldHealing +
          this.deps.earthenHarmony.elementalOrbitEarthShieldHealing,
        color: RESTORATION_COLORS.EARTHSHIELD_EARTHEN_HARMONY,
        tooltip: this.buildTooltip({
          sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
          damageMitigated: this.deps.earthenHarmony.renderDamageReduced(
            () =>
              this.deps.earthenHarmony.earthShielddamageReduced +
              this.deps.earthenHarmony.elementalOrbitDamageReduced,
          ),
          directHealing:
            this.deps.earthenHarmony.earthShieldHealing +
            this.deps.earthenHarmony.elementalOrbitEarthShieldHealing,
        }),
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS.EARTHWEAVER_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.EARTHWEAVER_TALENT,
        amount: this.earthweaverBaseBonus + this.earthweaverOrbitBonus,
        color: RESTORATION_COLORS.EARTHSHIELD_EARTHWEAVER,
        tooltip: this.buildTooltip({
          sourceSpell: TALENTS.EARTH_SHIELD_TALENT.id,
          directHealing: this.earthweaverBaseBonus + this.earthweaverOrbitBonus,
          customText: 'This is the extra 40% provided to the direct healing of Earth Shield.',
        }),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.EARTHEN_COMMUNION_TALENT,
        amount: this.earthenCommunionBaseBonus + this.earthenCommunionOrbitBonus,
        color: RESTORATION_COLORS.EARTHSHIELD_EARTHERN_COMMUNION,
        tooltip: this.buildTooltip({
          directHealing: this.earthenCommunionBaseBonus + this.earthenCommunionOrbitBonus,
          customText:
            'This is the extra 25% provided to the direct healing of the Earth Shield on yourself.',
        }),
      });
    }

    if (this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.REACTIVE_WARDING_TALENT,
        amount: this.reactiveWardingHealing,
        color: RESTORATION_COLORS.EARTHSHIELD_REACTIVE_WARDING,
        tooltip: this.buildTooltip({
          directHealing: this.reactiveWardingHealing,
          customText:
            "The internal cooldown reduction of Reactive Warding's direct healing is only applied to your own Earth Shield. This is a known and reported bug.",
        }),
      });
    } else if (this.selectedCombatant.hasTalent(TALENTS.THERAZANES_RESILIENCE_TALENT)) {
      this.earthShieldItems.push({
        spell: TALENTS.THERAZANES_RESILIENCE_TALENT,
        amount: this.therazanesResilienceBaseBonus + this.therazanesResilienceOrbitBonus,
        color: RESTORATION_COLORS.EARTHSHIELD_THERAZANES_RESILIENCE,
        tooltip: this.buildTooltip({
          directHealing: this.therazanesResilienceBaseBonus + this.therazanesResilienceOrbitBonus,
          customText: 'This is the extra 15% provided to the direct healing of Earth Shield.',
        }),
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
            {this.shieldIcon()} <strong>{config.damageMitigated}</strong> damage mitigated
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
