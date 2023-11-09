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
import { SHADOW_WORD_DEATH_EXECUTE_RANGE } from '../../constants';

const DEBUG = false;

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
  executeThreshold = SHADOW_WORD_DEATH_EXECUTE_RANGE;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_TALENT_BUFF),
      this.onEnergize,
    );
  }

  isTargetInExecuteRange(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return event.hitPoints / event.maxHitPoints < this.executeThreshold;
  }

  onDamage(event: DamageEvent) {
    //If you cast Shadow Word: Death on a target in execute the cooldown is reset once.  If you wait 10 seconds, you miss the reset.
    if (
      this.isTargetInExecuteRange(event) &&
      !this.selectedCombatant.hasBuff(SPELLS.DEATHSPEAKER_TALENT_BUFF.id)
    ) {
      const fromLastCast = event.timestamp - this.lastCastTime;
      if (fromLastCast >= 9990) {
        this.spellUsable.endCooldown(
          TALENTS.SHADOW_WORD_DEATH_TALENT.id,
          event.timestamp,
          false,
          false,
        );
        DEBUG &&
          console.log('Shadow Word: Death Reset', this.owner.formatTimestamp(event.timestamp, 1));
        this.resets += 1;
      }
      this.lastCastTime = event.timestamp;
    }
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
    this.kills += 1;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Number of casts where the target was killed and insanity generated from it."
      >
        <BoringSpellValueText spell={TALENTS.DEATH_AND_MADNESS_TALENT}>
          <>
            <div>{formatNumber(this.resets)} Resets</div>
            <div>{formatNumber(this.kills)} Kills</div>
            <div>
              <Insanity /> {formatNumber(this.insanityGained)} <small>Insanity generated</small>
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathAndMadness;
