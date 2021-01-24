import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import SPECS from 'game/SPECS';
import Abilities from 'parser/core/modules/Abilities';

const APPLICATION_THRESHOLD = 5000;

// Holy: https://www.warcraftlogs.com/reports/MtraPqxwdB4hRG7j#fight=2
// Shadow: https://www.warcraftlogs.com/reports/KVDfG2wnb8pABJhj#fight=45
// Disc: https://www.warcraftlogs.com/reports/GWPC9kQ41yg6z8Xx#fight=47
class UnholyNova extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  protected abilities!: Abilities;

  totalDamage = 0;
  totalHealing = 0;
  totalOverHealing = 0;

  castEvents: CastEvent[] = [];
  applicationEvents: ApplyDebuffEvent[] = [];

  get totalCasts(): number {
    return this.castEvents.length;
  }

  get totalApplications(): number {
    return this.applicationEvents.length;
  }

  get totalMisses(): number {
    let totalMisses = 0;
    for (const castEvent of this.castEvents) {
      let didHit = false;
      for (const applicationEvent of this.applicationEvents) {
        if (Math.abs(applicationEvent.timestamp - castEvent.timestamp) < APPLICATION_THRESHOLD) {
          didHit = true;
          break;
        }
      }
      if (!didHit) {
        totalMisses += 1;
      }
    }
    return totalMisses;
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);
    if (!this.active) {
      return;
    }

    const castEfficiency = this.selectedCombatant.spec === SPECS.SHADOW_PRIEST ? {
      suggestion: true,
      recommendedEfficiency: 0.9,
      averageIssueEfficiency: 0.8,
      majorIssueEfficiency: 0.7,
    } : {
      suggestion: true,
      recommendedEfficiency: 0.8,
      averageIssueEfficiency: 0.6,
      majorIssueEfficiency: 0.4,
    };
    (options.abilities as Abilities).add({
      spell: SPELLS.UNHOLY_NOVA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 60,
      enabled: true,
      gcd: {
        base: 1500,
      },
      castEfficiency: castEfficiency,
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNHOLY_NOVA), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNHOLY_TRANSFUSION_DAMAGE), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.UNHOLY_NOVA_BUFF), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.UNHOLY_TRANSFUSION), this.onHeal);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.UNHOLY_TRANSFUSION_DAMAGE), this.onApplyDebuff);
  }

  onCast(event: CastEvent) {
    this.castEvents.push(event);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.applicationEvents.push(event);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorb || 0);
  }

  onHeal(event: HealEvent) {
    this.totalHealing += event.amount;
    this.totalOverHealing += (event.overheal || 0);
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: this.totalMisses,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.efficiencySuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>
        <span>Try not to miss with <SpellLink id={SPELLS.UNHOLY_NOVA.id} />.</span><br />
        <span><SpellLink id={SPELLS.UNHOLY_NOVA.id} /> is a projectile that targets the ground where your target is currently standing.
            If your target moves or becomes untargetable, Unholy Nova can completely miss.
            Try and avoid casting Unholy Nova when the target is about to move.
          </span></>)
        .icon(SPELLS.UNHOLY_NOVA.icon)
        .actual(`${this.totalMisses} misses out of ${this.totalCasts} total casts.`)
        .recommended(`0 misses is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
        tooltip={(<>
          <>Enemies hit per cast: {(this.totalApplications / this.totalCasts).toFixed(2)}</>
          <br />
          <>Complete misses: {this.totalMisses}</>
          <br />
          <>Total Healing: {formatNumber(this.totalHealing)} ({formatPercentage(this.totalOverHealing / (this.totalHealing + this.totalOverHealing))}% OH)</>
        </>)}
      >
        <BoringSpellValueText spell={SPELLS.UNHOLY_NOVA}>
          <>
            <ItemDamageDone amount={this.totalDamage} /><br />
            <ItemHealingDone amount={this.totalHealing} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default UnholyNova;
