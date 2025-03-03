import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { formatDuration, formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import SpellUsable from '../features/SpellUsable';

class HackAndSlash extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private rampageCasts = 0;
  private rampageStrikes = 0;
  private hackAndSlashCasts = 0;
  private chargesGained = 0;
  /** How much CDR from Hack and Slash proccs */
  private totalReduction = 0;
  /**
   * Simple check to keep track of Rampage strikes we've already counted. Reset on every cast, avoids counting Improved Whirlwind replications
   */
  private readonly seen = {
    [SPELLS.RAMPAGE_1.id]: false,
    [SPELLS.RAMPAGE_2.id]: false,
    [SPELLS.RAMPAGE_3.id]: false,
    [SPELLS.RAMPAGE_4.id]: false,
  };

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.HACK_AND_SLASH_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAMPAGE),
      this.onRampageCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.RAMPAGE_1, SPELLS.RAMPAGE_2, SPELLS.RAMPAGE_3, SPELLS.RAMPAGE_4]),
      this.onRampageStrike,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HACK_AND_SLASH),
      this.onHackAndSlash,
    );
  }

  private onRampageCast(event: CastEvent) {
    this.rampageCasts += 1;
    this.seen[SPELLS.RAMPAGE_1.id] = false;
    this.seen[SPELLS.RAMPAGE_2.id] = false;
    this.seen[SPELLS.RAMPAGE_3.id] = false;
    this.seen[SPELLS.RAMPAGE_4.id] = false;
  }

  private onRampageStrike(event: DamageEvent) {
    const spellId = event.ability.guid;

    if (this.seen[spellId]) {
      return;
    }

    this.seen[spellId] = true;

    this.rampageStrikes += 1;
  }

  private onHackAndSlash(event: ApplyBuffEvent) {
    this.hackAndSlashCasts += 1;

    const remainingCooldown = this.deps.spellUsable.cooldownRemaining(
      SPELLS.RAGING_BLOW.id,
      event.timestamp,
    );

    if (remainingCooldown === 0) {
      return;
    }

    this.chargesGained += 1;
    this.totalReduction += remainingCooldown;

    this.deps.spellUsable.endCooldown(SPELLS.RAGING_BLOW.id);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Casting <strong>Rampage</strong> {this.rampageCasts} times caused {this.rampageStrikes}{' '}
            strikes which triggered <strong>Hack and Slash</strong> {this.hackAndSlashCasts} times (
            {formatPercentage(this.hackAndSlashCasts / this.rampageStrikes, 0)}%) refunding a total
            of {this.chargesGained} charges.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HACK_AND_SLASH}>
          {formatDuration(this.totalReduction)} <small>cooldown reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HackAndSlash;
