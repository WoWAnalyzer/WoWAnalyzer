import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { HOWL_BUFFS } from '../../constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';

class HowlOfThePackLeader extends Analyzer {
  casts = 0;
  lastKillCommand?: CastEvent;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT);

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
    if (!this.lastKillCommand || event.timestamp - this.lastKillCommand.timestamp > MS_BUFFER_100) {
      return;
    }

    addEnhancedCastReason(this.lastKillCommand, 'Triggered Howl of the Pack');
    this.casts += 1;

    this.lastKillCommand = undefined;
  }

  onKillCommand(event: CastEvent) {
    this.lastKillCommand = event;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT}>
          {formatNumber(this.casts)} <small>casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HowlOfThePackLeader;
