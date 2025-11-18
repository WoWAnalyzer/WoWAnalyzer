import type { JSX } from 'react';
import { defineMessage } from '@lingui/core/macro';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const BUFFER = 100;

class TwinsOfTheSunPriestess extends Analyzer {
  // More could probably be done with this to analyze what the person you used it on did.
  // this is at least a base of making sure they're using PI on other players and not wasting it on themself.
  static dependencies = {
    abilities: Abilities,
  };
  protected abilities!: Abilities;

  maxCasts = 0;
  goodCasts = 0;
  badCasts = 0;
  lastCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.TWINS_OF_THE_SUN_PRIESTESS_TALENT,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_INFUSION_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    (options.abilities as Abilities).add({
      spell: TALENTS.POWER_INFUSION_TALENT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.95,
        maxCasts: () => this.maxCasts,
        casts: () => this.totalCasts,
      },
    });
  }

  get totalCasts() {
    return this.badCasts + this.goodCasts;
  }

  onCast(event: CastEvent) {
    //It seems that their are two casts of PI for every cast of PI.
    //If cast on an ally, that occurs first, followed shortly by a cast on yourself.

    //console.log('PI CAST', this.owner.formatTimestamp(event.timestamp), event.timestamp);

    if (event.timestamp - this.lastCast >= BUFFER) {
      if (event.targetID === event.sourceID) {
        this.badCasts += 1;
        //console.log('bad');
      } else {
        this.goodCasts += 1;
        //console.log('good');
      }
    }

    this.lastCast = event.timestamp;
  }

  adjustMaxCasts() {
    //PI casts twice when cast
    //To fix this, we calcuate the number of casts of SW:D

    const cooldown = this.abilities.getAbility(TALENTS.POWER_INFUSION_TALENT.id)!.cooldown * 1000;
    this.maxCasts = Math.ceil(this.owner.fightDuration / cooldown);
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT}>
          {formatNumber(this.goodCasts)}/{formatNumber(this.totalCasts)} Uses
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const allyPI = {
      count: this.goodCasts,
      label: 'Ally Casts',
    };

    const selfPI = {
      count: this.badCasts,
      label: 'Self Casts',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT} />
        </b>{' '}
        gives you <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> when used on an ally.
        <br />
        When taking this talent, make sure to always use it on an ally. By using it on yourself, you
        lose out on a free <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} /> for a raid member.
      </p>
    );

    const data = (
      <div>
        <strong>Power Infusion Casts</strong>
        <GradiatedPerformanceBar good={allyPI} bad={selfPI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default TwinsOfTheSunPriestess;
