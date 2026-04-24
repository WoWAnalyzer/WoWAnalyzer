import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { HOWL_BUFFS, PACK_MENTALITY_CDR_MS } from '../../constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';

/**
 * Howl of the Pack Leader increases the damage of your Kill Command by 25%.
 *
 * Summoning a Beast reduces the cooldown of Barbed Shot by 4.0 sec.
 */
class PackMentality extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReductionMs = 0;
  readonly cdrMs = PACK_MENTALITY_CDR_MS;

  protected spellUsable!: SpellUsable;
  lastKillCommand?: number;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PACK_MENTALITY_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.onKillCommand,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HOWL_BUFFS),
      this.onHowlRemoval,
    );
  }

  onHowlRemoval(event: RemoveBuffEvent) {
    // this removal wasn't triggered by kill command
    if (!this.lastKillCommand || event.timestamp - this.lastKillCommand > MS_BUFFER_100) {
      return;
    }

    this.lastKillCommand = undefined;

    if (!this.spellUsable.isOnCooldown(TALENTS.BARBED_SHOT_TALENT.id)) {
      return;
    }

    this.effectiveReductionMs += this.spellUsable.reduceCooldown(
      TALENTS.BARBED_SHOT_TALENT.id,
      this.cdrMs,
    );
  }

  onKillCommand(event: CastEvent) {
    this.lastKillCommand = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.PACK_MENTALITY_TALENT}>
          {formatNumber(this.effectiveReductionMs / 1000)}s <small>effective CDR</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PackMentality;
