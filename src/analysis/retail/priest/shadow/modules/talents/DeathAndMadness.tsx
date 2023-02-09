import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DeathAndMadness extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;

  kills = 0;
  insanityGained = 0;
  resets = 0;
  lastCastTime: number = 0;
  executeThreshold = 0.2;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF),
      this.onEnergize,
    );
  }

  isTargetInExecuteRange(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return event.hitPoints / event.maxHitPoints < this.executeThreshold;
  }

  // Since the actual buff only applies/refreshes as a reward for getting a kill within 7s of using SW: Death, don't have to do much to check
  onBuff() {
    this.kills += 1;
  }

  onDamage(event: DamageEvent) {
    //If you cast Shadow Word: Death on a target in execute the cooldown is reset once.  If you wait 20 seconds, you miss the reset.
    if (this.isTargetInExecuteRange(event)) {
      const fromLastCast = event.timestamp - this.lastCastTime;
      if (fromLastCast >= 1990) {
        this.spellUsable.endCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id);
        this.resets += 1;
      }
      this.lastCastTime = event.timestamp;
    }
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Number of casts where the target was killed and insanity generated from it."
      >
        <BoringSpellValueText spellId={TALENTS.DEATH_AND_MADNESS_TALENT.id}>
          <>
            {formatNumber(this.resets)} Resets
            <br />
            {formatNumber(this.kills)} Kills
            <br />
            <Insanity /> {formatNumber(this.insanityGained)} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathAndMadness;
