import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { getHitCount } from '../../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import { TooltipElement } from 'interface';
import { SpellIcon, SpellLink } from 'interface';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';
import Spell from 'common/SPELLS/Spell';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/**
 * Tracks the number of targets hit by Feral's AoE abilities.
 * Relies on CastLinkNormalizer linking casts to hits.
 */
class HitCountAoE extends Analyzer {
  aoeSpells: Spell[] = [];
  spellAoeTrackers: SpellAoeTracker[] = [];

  constructor(options: Options) {
    super(options);

    // populate with spells that apply to this encounter, depending on talents
    this.aoeSpells.push(SPELLS.THRASH_FERAL);
    this.aoeSpells.push(
      this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id)
        ? SPELLS.BRUTAL_SLASH_TALENT
        : SPELLS.SWIPE_CAT,
    );
    if (this.selectedCombatant.hasTalent(SPELLS.PRIMAL_WRATH_TALENT.id)) {
      this.aoeSpells.push(SPELLS.PRIMAL_WRATH_TALENT);
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.aoeSpells), this.onAoeCast);
    this.aoeSpells.forEach((spell) => {
      this.spellAoeTrackers[spell.id] = {
        casts: 0,
        hits: 0,
        zeroHitCasts: 0,
        oneHitCasts: 0,
        multiHitCasts: 0,
      };
    });
  }

  onAoeCast(event: CastEvent) {
    const tracker = this.spellAoeTrackers[event.ability.guid];
    const hits = getHitCount(event);

    tracker.casts += 1;
    tracker.hits += hits;
    if (hits === 0) {
      tracker.zeroHitCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This cast hit nothing!';
    } else if (hits === 1) {
      tracker.oneHitCasts += 1;
    } else {
      tracker.multiHitCasts += 1;
    }
  }

  _getCasts(spellId: number) {
    return this.spellAoeTrackers[spellId].casts;
  }

  _getHits(spellId: number) {
    return this.spellAoeTrackers[spellId].hits;
  }

  _getAverageHits(spellId: number) {
    return this.spellAoeTrackers[spellId].hits / this.spellAoeTrackers[spellId].casts || 0;
  }

  _getZeroHits(spellId: number) {
    return this.spellAoeTrackers[spellId].zeroHitCasts;
  }

  _getOneHits(spellId: number) {
    return this.spellAoeTrackers[spellId].oneHitCasts;
  }

  _getMultiHits(spellId: number) {
    return this.spellAoeTrackers[spellId].multiHitCasts;
  }

  // zero hit suggestion stuff

  get thrashZeroHits() {
    return this.spellAoeTrackers[SPELLS.THRASH_FERAL.id].zeroHitCasts;
  }

  get swipeOrBrs() {
    return this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id)
      ? SPELLS.BRUTAL_SLASH_TALENT
      : SPELLS.SWIPE_CAT;
  }

  get swipeOrBrsZeroHits() {
    return this.spellAoeTrackers[this.swipeOrBrs.id].zeroHitCasts;
  }

  get zeroHitsPerMinute() {
    return this.owner.getPerMinute(this.thrashZeroHits + this.swipeOrBrsZeroHits);
  }

  get hitNoneThresholds() {
    return {
      actual: this.zeroHitsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  // one hit with primal wrath stuff TODO

  suggestions(when: When) {
    when(this.hitNoneThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are using AoE abilities while out of range of any targets. Try to
          get familiar with the range of your area of effect abilities so you can avoid wasting
          energy when they'll not hit anything. You missed with{' '}
          {this.thrashZeroHits > 0 && <>{this.thrashZeroHits} <SpellLink id={SPELLS.THRASH_FERAL.id} /></>}
          {this.thrashZeroHits > 0 && this.swipeOrBrsZeroHits > 0 && ` and `}
          {this.swipeOrBrsZeroHits > 0 && <>{this.swipeOrBrsZeroHits} <SpellLink id={this.swipeOrBrs.id} /></>}.
        </>,
      )
        .icon(SPELLS.SWIPE_CAT.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.swipe.hitcount.outOfRange',
            message: `${actual.toFixed(1)} uses per minute that hit nothing.`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            These counts consider hardcasts only - numbers from Convoke the Spirits are not
            included.
          </>
        }
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
      >
        <div className={`pad boring-text`}>
          <label>AoE Ability Usage</label>
          <div className="value">
            {this.aoeSpells.map((spell) => (
              <>
                <TooltipElement key={spell.id} content={
                  <>
                    This statistic does not include casts from Convoke the Spirits.
                    You cast {spell.name} <strong>{this._getCasts(spell.id)}</strong> times.
                    <ul>
                      <li><strong>{this._getZeroHits(spell.id)}</strong> hit nothing</li>
                      <li><strong>{this._getOneHits(spell.id)}</strong> hit one target</li>
                      <li><strong>{this._getMultiHits(spell.id)}</strong> hit multiple targets</li>
                    </ul>
                  </>
                }>
                  <SpellIcon id={spell.id} /> {this._getAverageHits(spell.id).toFixed(1)}{' '}
                </TooltipElement>
                <small>avg targets hit</small>
                <br />
              </>
            ))}
          </div>
        </div>
      </Statistic>
    );
  }
}

type SpellAoeTracker = {
  casts: number;
  hits: number;
  zeroHitCasts: number;
  oneHitCasts: number;
  multiHitCasts: number;
};

export default HitCountAoE;
