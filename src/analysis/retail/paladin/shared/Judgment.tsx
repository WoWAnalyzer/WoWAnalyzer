import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EnemyInstance from 'parser/core/EnemyInstance';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

import { HOLY_POWER_FINISHERS } from '../retribution/constants';

/**
 * Analyzer to track the extra damage caused by Holy Power abilities after
 * a Judgment cast.
 */
class Judgment extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  private enemies!: Enemies;

  DAMAGE_MODIFIER: number = 0.25;

  retHolyPowerAbilities: Spell[] = HOLY_POWER_FINISHERS;

  protHolyPowerAbilities: Spell[] = [SPELLS.SHIELD_OF_THE_RIGHTEOUS];

  judgmentSpells: Spell[] = [SPELLS.JUDGMENT_CAST, SPELLS.JUDGMENT_CAST_PROTECTION];

  allHolyPowerAbilities: Spell[] = [...this.retHolyPowerAbilities, ...this.protHolyPowerAbilities];

  supportedSpecIds: number[] = [SPECS.PROTECTION_PALADIN.id, SPECS.RETRIBUTION_PALADIN.id];

  spellCastMap: Map<Spell, number> = new Map<Spell, number>();
  spellDamageMap: Map<Spell, number> = new Map<Spell, number>();
  totalJudgmentConsumptions: number = 0;
  totalJudgmentCasts: number = 0;

  suggest: boolean = true;

  constructor(options: Options) {
    super(options);
    this.suggest = this.selectedCombatant.specId === SPECS.RETRIBUTION_PALADIN.id;
    this.active = this.supportedSpecIds.includes(this.selectedCombatant.specId);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(this.allHolyPowerAbilities),
      this.trackDamageEvent,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.judgmentSpells),
      this.trackJudgmentCasts,
    );
  }

  getSupportedSpellWithId(spellId: number): Spell | undefined {
    return this.allHolyPowerAbilities.find((spell) => spell.id === spellId);
  }

  trackDamageEvent(event: DamageEvent): void {
    const enemy: null | EnemyInstance = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    const holyPowerDamageSpell: Spell | undefined = this.getSupportedSpellWithId(
      event.ability.guid,
    );
    if (holyPowerDamageSpell === undefined) {
      return;
    }
    this.totalJudgmentConsumptions += 1;
    const oldCastNumber: number | undefined = this.spellCastMap.get(holyPowerDamageSpell);
    this.spellCastMap.set(holyPowerDamageSpell, !oldCastNumber ? 1 : oldCastNumber + 1);
    const extraJudgmentDamage: number =
      event.amount - event.amount * (1 / (1 + this.DAMAGE_MODIFIER));
    const oldDamageNumber: number | undefined = this.spellDamageMap.get(holyPowerDamageSpell);
    this.spellDamageMap.set(
      holyPowerDamageSpell,
      !oldDamageNumber ? extraJudgmentDamage : oldDamageNumber + extraJudgmentDamage,
    );
  }

  trackJudgmentCasts(event: CastEvent): void {
    this.totalJudgmentCasts += 1;
  }

  getStatisticTooltip(): React.ReactNode {
    const tooltipRows: React.ReactNode[] = [];
    this.spellCastMap.forEach((castNum: number, spell: Spell) => {
      tooltipRows.push(
        <>
          {spell.name} Judgment Consumptions: {castNum} (
          {formatNumber(this.spellDamageMap.get(spell) || 0)} total extra damage)
          <br />
        </>,
      );
    });
    return (
      <>
        Total Judgments Consumed: {this.totalJudgmentConsumptions} <br />
        {tooltipRows}
      </>
    );
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
    if (this.suggest) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            You're not consuming all your <SpellLink spell={SPELLS.JUDGMENT_CAST} icon /> debuffs.
          </>,
        )
          .icon(SPELLS.JUDGMENT_DEBUFF.icon)
          .actual(
            t({
              id: 'paladin.retribution.suggestions.judgement.consumed',
              message: `${formatPercentage(this.percentageJudgmentsConsumed)}% Judgments consumed`,
            }),
          )
          .recommended(`>${formatPercentage(recommended)}% is recommended`),
      );
    }
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={this.getStatisticTooltip()}
      >
        <BoringSpellValue
          spellId={SPELLS.JUDGMENT_DEBUFF.id}
          value={`${formatNumber(this.totalJudgmentConsumptions)}`}
          label="Judgment Debuffs Consumed"
        />
      </Statistic>
    );
  }
}

export default Judgment;
