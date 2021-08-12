import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class Flagellation extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  casts: number = 0;
  cooldown: number = 90;
  damage: number = 0;
  lashDamage: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION_LASH),
      this.onLashDamage,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION), this.onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDmg);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onLashDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.lashDamage += event.amount + (event.absorbed || 0);
  }

  onCast(event: CastEvent) {
    if (event.ability.name.toLowerCase().indexOf('lash') < 0) {
      return;
    }
    // console.log(event)
    // this.casts++;
  }

  onDmg(event: DamageEvent) {
    if (event.ability.name.toLowerCase().indexOf('flag') < 0) {
      return;
    }
    console.log(event);
  }

  get efficiency() {
    return this.casts / (this.cooldown / this.owner.fightDuration);
  }

  get suggestionThresholds() {
    const maxCasts = calculateMaxCasts(this.cooldown, this.owner.fightDuration);
    return {
      actual: maxCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion(
      (suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) =>
        suggest(
          <>
            Use <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> instead of{' '}
            <SpellLink id={SPELLS.MUTILATE.id} /> when the target is bellow 30% HP or when you have
            the <SpellLink id={SPELLS.BLINDSIDE_BUFF.id} /> proc.{' '}
          </>,
        )
          .icon(SPELLS.BLINDSIDE_TALENT.icon)
          .actual(
            t({
              id: 'rogue.assassination.suggestions.blindside.efficiency',
              message: `${actual}`,
            }),
          )
          .recommended(`0 is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.COVENANTS}>
        <BoringSpellValueText spellId={SPELLS.FLAGELLATION.id}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br></br>
            <ItemDamageDone amount={this.lashDamage} />
            <br></br>
            <ItemDamageDone amount={this.damage + this.lashDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Flagellation;
