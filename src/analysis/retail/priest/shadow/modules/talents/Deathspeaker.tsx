import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

const DEBUG = false;

class Deathspeaker extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;

  procsGained: number = 0;
  procsWasted: number = 0;
  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHSPEAKER_TALENT_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHSPEAKER_TALENT_BUFF),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHSPEAKER_TALENT_BUFF),
      this.onBuffRefresh,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    //for debuging. Sometimes chargesAvailable, and chargesOnCooldown don't correctly add up to getMaxCharges.
    DEBUG &&
      console.log(
        'Shadow Word: Death CAST',
        this.spellUsable.chargesAvailable(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        '/',
        this.spellUsable.chargesOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        'max:',
        this.abilities.getMaxCharges(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        this.owner.formatTimestamp(event.timestamp, 1),
      );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.procsGained += 1; // Add a proc to the counter

    this.abilities.increaseMaxCharges(event, TALENTS.SHADOW_WORD_DEATH_TALENT.id, 1);
    this.spellUsable.endCooldown(
      TALENTS.SHADOW_WORD_DEATH_TALENT.id,
      event.timestamp,
      false,
      false,
    );
    this.lastProcTime = event.timestamp;
    DEBUG &&
      console.log(
        'Shadow Word: Death buff applied',
        this.spellUsable.chargesAvailable(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        '/',
        this.spellUsable.chargesOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        'max:',
        this.abilities.getMaxCharges(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        this.owner.formatTimestamp(event.timestamp, 1),
      );
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    DEBUG &&
      console.log(
        'Shadow Word: Death buff remove Before',
        this.spellUsable.chargesAvailable(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        '/',
        this.spellUsable.chargesOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        'max:',
        this.abilities.getMaxCharges(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        this.owner.formatTimestamp(event.timestamp, 1),
      );

    this.abilities.decreaseMaxCharges(event, TALENTS.SHADOW_WORD_DEATH_TALENT.id, 1);

    DEBUG &&
      console.log(
        'Shadow Word: Death buff remove After Charge Decrease',
        this.spellUsable.chargesAvailable(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        '/',
        this.spellUsable.chargesOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        'max:',
        this.abilities.getMaxCharges(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        this.owner.formatTimestamp(event.timestamp, 1),
      );

    if (this.spellUsable.chargesOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id) < 0) {
      // In certain circumstances, if you have 1 charge available after the buff, you can end up having negative charges spellUsable.onCooldown
      // Resting the cooldown entirely fixes the issue.
      this.spellUsable.endCooldown(
        TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        event.timestamp,
        true,
        true,
      );
    }
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld >= 14990) {
      this.procsWasted += 1;
    }
    DEBUG &&
      console.log(
        'Shadow Word: Death buff After negative check',
        this.spellUsable.chargesAvailable(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        '/',
        this.spellUsable.chargesOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        'max:',
        this.abilities.getMaxCharges(TALENTS.SHADOW_WORD_DEATH_TALENT.id),
        this.owner.formatTimestamp(event.timestamp, 1),
      );
  }

  onBuffRefresh() {
    this.procsWasted += 1;
  }

  getProcsUsed() {
    return this.procsGained - this.procsWasted;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={SPELLS.DEATHSPEAKER_TALENT_BUFF}>
          <>
            {this.getProcsUsed()}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodDS = {
      count: this.getProcsUsed(),
      label: 'Deathspeaker procs used',
    };

    const badDS = {
      count: this.procsWasted,
      label: 'Deathspeaker procs wasted',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.DEATHSPEAKER_TALENT} />
        </b>{' '}
        is gained randomly from <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> damage. <br />
        Cast <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} /> while the buff is active to
        avoid wasting procs.
      </p>
    );

    const data = (
      <div>
        <strong>Death Speaker breakdown</strong>
        <GradiatedPerformanceBar good={goodDS} bad={badDS} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default Deathspeaker;
