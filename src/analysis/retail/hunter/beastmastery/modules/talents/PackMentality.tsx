import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { PACK_MENTALITY_CDR_MS } from '../../constants';
import { MS_BUFFER_100 } from '../../../shared/constants';

const HOWL_READY_BUFFS = [
  SPELLS.HOWL_OF_THE_PACKLEADER_WYVERN,
  SPELLS.HOWL_OF_THE_PACKLEADER_BEAR,
  SPELLS.HOWL_OF_THE_PACKLEADER_BOAR,
];

/**
 * Each time Howl of the Pack Leader summons a beast (activated by casting Kill Command while a
 * beast is ready), Barbed Shot's cooldown is reduced by 4 sec - once per activation, regardless
 * of how many beasts that activation actually summons (e.g. the Bear form summoning 2 Dire
 * Beasts via Dire Command still only counts as a single Pack Mentality proc).
 */
class PackMentality extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  effectiveReductionMs = 0;
  wastedReductionMs = 0;
  procs = 0;
  lastKillCommandCast = -Infinity;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.PACK_MENTALITY_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT, TALENTS.KILL_COMMAND_SURVIVAL_TALENT]),
      this.onKillCommandCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HOWL_READY_BUFFS),
      this.onHowlBeastReadyRemoved,
    );
  }

  get totalPossibleCDR() {
    return Math.max(this.procs * PACK_MENTALITY_CDR_MS, 1);
  }

  onKillCommandCast(event: CastEvent) {
    this.lastKillCommandCast = event.timestamp;
  }

  onHowlBeastReadyRemoved(event: RemoveBuffEvent) {
    // Only count this as a real Howl of the Pack Leader activation if it was actually
    // consumed by a Kill Command cast, not the buff simply expiring unused.
    if (event.timestamp - this.lastKillCommandCast > MS_BUFFER_100) {
      return;
    }
    this.procs += 1;
    if (!this.spellUsable.isOnCooldown(TALENTS.BARBED_SHOT_TALENT.id)) {
      this.wastedReductionMs += PACK_MENTALITY_CDR_MS;
      return;
    }
    const effectiveReductionMs = this.spellUsable.reduceCooldown(
      TALENTS.BARBED_SHOT_TALENT.id,
      PACK_MENTALITY_CDR_MS,
    );
    this.effectiveReductionMs += effectiveReductionMs;
    this.wastedReductionMs += PACK_MENTALITY_CDR_MS - effectiveReductionMs;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.PACK_MENTALITY_TALENT}>
          <>
            {formatNumber(this.effectiveReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s{' '}
            <small>effective CDR</small>
            <p />
            {formatPercentage(this.effectiveReductionMs / this.totalPossibleCDR)}%{' '}
            <small>effectiveness</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PackMentality;
