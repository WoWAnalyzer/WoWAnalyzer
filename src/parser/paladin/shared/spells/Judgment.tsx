import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import EnemyInstance from 'parser/core/EnemyInstance';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import { formatNumber, formatPercentage } from 'common/format';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import SpellLink from 'common/SpellLink';

/**
 * Analyzer to track the extra damage caused by Holy Power abilities after
 * a Judgment cast.
 */
class Judgment extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  private enemies!: EnemyInstances;

  DAMAGE_MODIFIER: number = 0.25;

  retHolyPowerAbilities: Spell[] = [
    SPELLS.DIVINE_STORM,
    SPELLS.TEMPLARS_VERDICT_DAMAGE,
    SPELLS.EXECUTION_SENTENCE_TALENT,
    SPELLS.JUSTICARS_VENGEANCE_TALENT
  ];

  protHolyPowerAbilities: Spell[] = [
    SPELLS.SHIELD_OF_THE_RIGHTEOUS
  ];

  judgmentSpells: Spell[] = [
    SPELLS.JUDGMENT_CAST,
    SPELLS.JUDGMENT_CAST_PROTECTION
  ];

  allHolyPowerAbilities: Spell[] = [...this.retHolyPowerAbilities, ...this.protHolyPowerAbilities];

  supportedSpecIds: number[] = [SPECS.PROTECTION_PALADIN.id, SPECS.RETRIBUTION_PALADIN.id];

  spellCastMap: Map<Spell, number> = new Map<Spell, number>();
  spellDamageMap: Map<Spell, number> = new Map<Spell, number>();
  totalJudgmentConsumptions: number = 0;
  totalJudgmentCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.supportedSpecIds.includes(this.selectedCombatant.specId);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.allHolyPowerAbilities), this.trackDamageEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.judgmentSpells), this.trackJudgmentCasts);
  }

  getSupportedSpellWithId(spellId: number): Spell | undefined {
    return this.allHolyPowerAbilities.find((spell) => spell.id === spellId);
  }

  trackDamageEvent(event: DamageEvent): void {
    const enemy: null | EnemyInstance = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    const holyPowerDamageSpell: Spell | undefined = this.getSupportedSpellWithId(event.ability.guid);
    if (holyPowerDamageSpell === undefined) {
      return;
    }
    this.totalJudgmentConsumptions += 1;
    const oldCastNumber: number | undefined = this.spellCastMap.get(holyPowerDamageSpell);
    this.spellCastMap.set(holyPowerDamageSpell, !oldCastNumber ? 1 : oldCastNumber + 1);
    const extraJudgmentDamage: number = event.amount - (event.amount * (1 / (1+ this.DAMAGE_MODIFIER)));
    const oldDamageNumber: number | undefined = this.spellDamageMap.get(holyPowerDamageSpell);
    this.spellDamageMap.set(holyPowerDamageSpell, !oldDamageNumber ? extraJudgmentDamage : oldDamageNumber + extraJudgmentDamage);
  }

  trackJudgmentCasts(event: CastEvent): void {
    this.totalJudgmentCasts += 1;
  }

  getStatisticTooltip(): React.ReactNode {
    const tooltipRows: React.ReactNode[] = [];
    this.spellCastMap.forEach((castNum: number, spell: Spell) => {
      tooltipRows.push(<>{spell.name} Judgment Consumptions: {castNum} ({formatNumber(this.spellDamageMap.get(spell) || 0)} total extra damage)<br /></>);
    });
    return (
      <>
        Total Judgments Consumed: {this.totalJudgmentConsumptions} <br />
        {tooltipRows}
      </>
    )
  }

  get percentageJudgmentsConsumed(): number {
    return this.totalJudgmentConsumptions / this.totalJudgmentCasts;
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.percentageJudgmentsConsumed,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You're not consuming all your <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs.</>)
      .icon(SPELLS.JUDGMENT_DEBUFF.icon)
      .actual(t({
      id: "paladin.retribution.suggestions.judgement.consumed",
      message: `${formatPercentage(this.percentageJudgmentsConsumed)}% Judgments consumed`
    }))
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={this.getStatisticTooltip()}
      >
        <BoringSpellValue
          spell={SPELLS.JUDGMENT_DEBUFF}
          value={`${formatNumber(this.totalJudgmentConsumptions)}`}
          label="Judgment Debuffs Consumed"
        />
      </Statistic>
    );
  }
}

export default Judgment;
