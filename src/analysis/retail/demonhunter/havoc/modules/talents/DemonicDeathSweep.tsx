import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { DEMONIC_DURATION } from 'analysis/retail/demonhunter/shared';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Example Report: https://www.warcraftlogs.com/reports/23dHWCrT18qhaJbz/#fight=1&source=16
 */

const META_BUFF_DURATION_EYEBEAM = DEMONIC_DURATION;

export default class DemonicDeathSweep extends Analyzer {
  talentsCheck =
    this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.TRAIL_OF_RUIN_TALENT) ||
    this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT);
  eyeBeamCasts = 0;
  goodDeathSweep = 0;
  eyeBeamTimeStamp: number = 0;
  deathsweepsInMetaCounter: number = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT),
      this.onEyeBeamCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_SWEEP),
      this.onDeathSweepCast,
    );
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

  onEyeBeamCast(event: CastEvent) {
    const hasMetaBuff = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
      event.timestamp - 1000,
    );

    if (hasMetaBuff || !this.talentsCheck) {
      return;
    }

    this.eyeBeamCasts += 1;
    this.eyeBeamTimeStamp = event.timestamp;

    if (this.deathsweepsInMetaCounter === undefined) {
      this.deathsweepsInMetaCounter = 0;
      return;
    }

    if (this.deathsweepsInMetaCounter < 2) {
      this.badCasts += 1;
    }

    this.deathsweepsInMetaCounter = 0;
  }

  onDeathSweepCast(event: CastEvent) {
    if (event.timestamp - this.eyeBeamTimeStamp < META_BUFF_DURATION_EYEBEAM) {
      this.goodDeathSweep += 1;
      this.deathsweepsInMetaCounter += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          Try to have <SpellLink id={SPELLS.BLADE_DANCE.id} /> almost off cooldown before casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id} />. This will allow for two casts
          of <SpellLink id={SPELLS.DEATH_SWEEP.id} /> during the{' '}
          <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} /> buff you get from the{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.DEMONIC_TALENT.id} /> talent.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.DEMONIC_TALENT.icon)
        .actual(
          <>
            {actual} time(s) during <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} />{' '}
            <SpellLink id={SPELLS.DEATH_SWEEP.id} /> wasn't casted twice.
          </>,
        )
        .recommended(`No bad casts is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.GENERAL} size="flexible">
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.DEMONIC_TALENT}>
          {this.badCasts} <small>Bad casts</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
