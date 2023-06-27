import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';

import { BLACKOUT_KICK_COOLDOWN_REDUCTION_MS } from '../../constants';

function oxfordCommaJoin(list: JSX.Element[], joiner = 'and'): JSX.Element {
  switch (list.length) {
    case 1:
      return list[0];
    case 2:
      return (
        <>
          {list[0]} and {list[1]}
        </>
      );
    default:
      return (
        <>
          {list.slice(0, -1).reduce((acc, item) => (
            <>
              {acc}, {item}
            </>
          ))}
          , {joiner} {list[list.length - 1]}
        </>
      );
  }
}

/**
 *  Inspired by filler modules in Holy Paladin Analyzer
 */

class BlackoutKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  IMPORTANT_SPELLS: number[] = [
    TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
    SPELLS.FISTS_OF_FURY_CAST.id,
  ];
  effectiveRisingSunKickReductionMs = 0;
  wastedRisingSunKickReductionMs = 0;
  effectiveFistsOfFuryReductionMs = 0;
  wastedFistsOfFuryReductionMs = 0;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT)) {
      this.IMPORTANT_SPELLS.push(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id);
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.onCast);
  }

  applyCdr(spellId: number, modRate: number): [number, number] {
    let effective = 0;
    let wasted = 0;
    const scaledCdr = BLACKOUT_KICK_COOLDOWN_REDUCTION_MS / modRate;
    if (!this.spellUsable.isOnCooldown(spellId)) {
      wasted += scaledCdr;
    } else {
      const reductionMs = this.spellUsable.reduceCooldown(
        spellId,
        BLACKOUT_KICK_COOLDOWN_REDUCTION_MS,
      );
      const scaledEffectiveMs = reductionMs / modRate;
      effective = scaledEffectiveMs;
      wasted = scaledCdr - scaledEffectiveMs;
    }
    return [effective, wasted];
  }

  onCast(event: CastEvent) {
    const availableImportantCast = this.IMPORTANT_SPELLS.filter((spellId) =>
      this.spellUsable.isAvailable(spellId),
    );
    /**
     * currentCooldownReductionMs is adjusted for the modRate effect of Serenity. We can use this
     * value for direct analysis, however for calling reduceCooldown we should use the base
     * reduction value since reduceCooldown factors in modRate on its own already.
     */
    const modRate = this.selectedCombatant.hasBuff(TALENTS_MONK.SERENITY_TALENT.id) ? 2 : 1;
    if (availableImportantCast.length > 0) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      const linkList = availableImportantCast.map((spellId) => (
        <SpellLink key={spellId} id={spellId} />
      ));
      event.meta.inefficientCastReason = (
        <>
          You cast this <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> while {oxfordCommaJoin(linkList)}{' '}
          was available.
        </>
      );
    }

    const [effectiveRsk, wastedRsk] = this.applyCdr(
      TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
      modRate,
    );
    this.effectiveRisingSunKickReductionMs += effectiveRsk;
    this.wastedRisingSunKickReductionMs += wastedRsk;

    const [effectiveFoF, wastedFoF] = this.applyCdr(SPELLS.FISTS_OF_FURY_CAST.id, modRate);
    this.effectiveFistsOfFuryReductionMs += effectiveFoF;
    this.wastedFistsOfFuryReductionMs += wastedFoF;
  }

  get totalWastedReductionPerMinute() {
    return (
      ((this.wastedFistsOfFuryReductionMs + this.wastedRisingSunKickReductionMs) /
        this.owner.fightDuration) *
      60
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.totalWastedReductionPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    const linkList = this.IMPORTANT_SPELLS.map((spellId) => (
      <SpellLink key={spellId} id={spellId} />
    ));

    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are wasting cooldown reduction by casting {<SpellLink id={SPELLS.BLACKOUT_KICK.id} />}{' '}
          while having important casts, such as {oxfordCommaJoin(linkList, 'or')} available
        </>,
      )
        .icon(SPELLS.BLACKOUT_KICK.icon)
        .actual(`${actual.toFixed(2)} seconds of wasted cooldown reduction per minute`)
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(3)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.BLACKOUT_KICK.id}>
          <span>
            <SpellIcon
              id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectiveRisingSunKickReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
            <br />
            <SpellIcon
              id={SPELLS.FISTS_OF_FURY_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectiveFistsOfFuryReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlackoutKick;
