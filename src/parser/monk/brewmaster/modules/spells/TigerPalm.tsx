import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Combatant from 'parser/core/Combatant';
import { SpellInfo } from 'parser/core/EventFilter';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';

import BlackoutCombo from './BlackoutCombo';
import SharedBrews from '../core/SharedBrews';

const TIGER_PALM_REDUCTION = 1000;

interface ConditionalSpell {
  spell: SpellInfo,
  when: (c: Combatant) => boolean,
}

function isConditional(spell: ConditionalSpell | SpellInfo): spell is ConditionalSpell {
  return Object.prototype.hasOwnProperty.call(spell, 'when');
}

const BETTER_SPELLS: Array<SpellInfo | ConditionalSpell> = [
  SPELLS.KEG_SMASH,
  SPELLS.BLACKOUT_KICK_BRM,
  SPELLS.BREATH_OF_FIRE,
  {
    spell: SPELLS.RUSHING_JADE_WIND,
    when: (combatant: Combatant) => combatant.hasTalent(SPELLS.RUSHING_JADE_WIND.id) && !combatant.hasBuff(SPELLS.RUSHING_JADE_WIND.id),
  },
  {
    spell: SPELLS.CHI_BURST_TALENT,
    when: (combatant: Combatant) => combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
  },
  {
    spell: SPELLS.CHI_WAVE_TALENT,
    when: (combatant: Combatant) => combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
  },
];

class TigerPalm extends Analyzer {
  static dependencies = {
    boc: BlackoutCombo,
    brews: SharedBrews,
    statTracker: StatTracker,
    spellUsable: SpellUsable,
  };
  totalCasts = 0;
  badCasts = 0;
  normalHits = 0;
  bocHits = 0;
  cdr = 0;
  wastedCDR = 0;
  bocBuffActive = false;
  bocApplyToTP = false;
  protected boc!: BlackoutCombo;
  protected brews!: SharedBrews;
  protected statTracker!: StatTracker;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onGainBOC);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onGainBOC);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onLoseBOC);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.checkBadTP);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.onDamage);
  }

  get totalBocHits() {
    return this.bocHits;
  }

  get bocEmpoweredThreshold() {
    return {
      actual: this.totalBocHits / this.totalCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get badCastSuggestion() {
    const actual = this.badCasts / this.totalCasts;
    return {
      actual,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onGainBOC(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.bocBuffActive = true;
  }

  onLoseBOC(event: RemoveBuffEvent) {
    this.bocBuffActive = false;
  }

  onCast(event: CastEvent) {
    this.totalCasts += 1;
    this.bocApplyToTP = this.bocBuffActive;
  }

  // a Tiger Palm cast is bad if it is cast while one of the `BETTER_SPELLS` is

  onDamage(event: DamageEvent) {
    // OK SO we have a hit, lets reduce the CD by the base amount...
    const actualReduction = this.brews.reduceCooldown(TIGER_PALM_REDUCTION);
    this.cdr += actualReduction;
    this.wastedCDR += TIGER_PALM_REDUCTION - actualReduction;

    if (this.bocApplyToTP) {
      this.bocHits += 1;
    } else {
      this.normalHits += 1;
    }
  }

  // off cooldown, or if casting it delayed Keg Smash due to energy starvation.
  checkBadTP(event: CastEvent) {
    if (this.bocBuffActive) {
      return; // TP+BoC is highest prio
    }

    const availableSpells: SpellInfo[] = BETTER_SPELLS.filter(entry => {
      if (isConditional(entry)) {
        return entry.when(this.selectedCombatant) && this.spellUsable.isAvailable(entry.spell.id);
      } else {
        return this.spellUsable.isAvailable(entry.id);
      }
    }).map(entry => isConditional(entry) ? entry.spell : entry);

    if (availableSpells.length === 0) {
      return; // nothing better to cast, so this is OK
    }

    // this clobbers the timeline metadata, but at this time nothing sets it
    // outside of individual analyzers.
    event.meta = {
      isInefficientCast: true,
      inefficientCastReason: (
        <>
          The following better spells were available during this GCD:
          <ul>
            {availableSpells.map(({ id }) => <li key={id}><SpellLink id={id} /></li>)}
          </ul>
        </>
      ),
    };

    this.badCasts += 1;
  }

  suggestions(when: When) {
    when(this.badCastSuggestion)
      .addSuggestion((suggest, actual, recommended) => suggest(<><SpellLink id={SPELLS.TIGER_PALM.id} /> is your lowest priority ability. You should avoid casting it when you have other damaging abilities like <SpellLink id={SPELLS.KEG_SMASH.id} /> or <SpellLink id={SPELLS.BLACKOUT_KICK_BRM.id} /> available.</>)
        .icon(SPELLS.TIGER_PALM.icon)
        .actual(`${formatPercentage(actual)}% of casts while better spells were available`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`));
  }
}

export default TigerPalm;
