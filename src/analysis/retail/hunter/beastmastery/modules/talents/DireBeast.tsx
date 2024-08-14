import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Haste from 'interface/icons/Haste';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  SummonEvent,
} from 'parser/core/Events';
import { encodeEventSourceString, encodeEventTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  DIRE_BEAST_BASE_DURATION,
  DIRE_BEAST_HASTE_PERCENT,
  DIRE_FRENZY_INCREASE_DB_TIME,
} from '../../constants';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing your Haste by 5% for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/NBMbz2Dcq43k17tJ#fight=90&type=damage-done&source=11
 */

class DireBeast extends Analyzer {
  damage = 0;
  activeDireBeasts: string[] = [];
  lastKillCommandCast: number = 0;
  isDireBeastSummon: boolean = false;
  buffApplicationTimestamp: number = 0; // Timestamp of the last Dire Beast buff application
  direBeastUptime: number = 0;
  direbeastDuration = DIRE_BEAST_BASE_DURATION;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_BEAST_TALENT);
    this.direbeastDuration +=
      DIRE_FRENZY_INCREASE_DB_TIME[
        this.selectedCombatant.getTalentRank(TALENTS.DIRE_FRENZY_TALENT)
      ];
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(
      Events.summon
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DIRE_BEAST_SUMMON, SPELLS.DIRE_BEAST_GLYPHED]),
      this.onDireSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.killCommandCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_BUFF),
      this.applyDireBeast,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_BUFF),
      this.refreshDireBeast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIRE_BEAST_BUFF),
      this.removeDireBeast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get uptime() {
    return this.direBeastUptime / this.owner.fightDuration;
  }

  onPetDamage(event: DamageEvent) {
    const sourceId = encodeEventSourceString(event);
    if (!sourceId) {
      return;
    }
    if (this.activeDireBeasts.includes(sourceId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  onDireSummon(event: SummonEvent) {
    if (
      event.timestamp - this.lastKillCommandCast < MS_BUFFER_100 &&
      this.selectedCombatant.hasTalent(TALENTS.DIRE_COMMAND_TALENT)
    ) {
      //Then the summon is caused by a Dire Command proc
      this.isDireBeastSummon = false;
      return;
    }
    const targetId = encodeEventTargetString(event);
    if (!targetId) {
      return;
    }
    this.activeDireBeasts.push(targetId);
    this.isDireBeastSummon = true;
  }

  killCommandCast(event: CastEvent) {
    this.lastKillCommandCast = event.timestamp;
  }

  applyDireBeast(event: ApplyBuffEvent) {
    if (this.isDireBeastSummon) {
      this.buffApplicationTimestamp = event.timestamp;
    } else {
      this.buffApplicationTimestamp = 0;
    }
  }

  refreshDireBeast(event: RefreshBuffEvent) {
    if (this.buffApplicationTimestamp > event.timestamp - this.direbeastDuration) {
      this.direBeastUptime += event.timestamp - this.buffApplicationTimestamp;
    }
    if (this.isDireBeastSummon) {
      this.buffApplicationTimestamp = event.timestamp;
    } else {
      this.buffApplicationTimestamp = 0;
    }
  }

  removeDireBeast(event: RemoveBuffEvent) {
    if (this.isDireBeastSummon) {
      this.direBeastUptime += event.timestamp - this.buffApplicationTimestamp;
    }
  }

  onFightEnd(event: FightEndEvent) {
    if (this.buffApplicationTimestamp > event.timestamp - this.direbeastDuration) {
      this.direBeastUptime += event.timestamp - this.buffApplicationTimestamp;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You had {formatPercentage(this.uptime)}% uptime on the Dire Beast haste buff that could
            be attributed to this talent.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.DIRE_BEAST_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <Haste /> {formatPercentage(DIRE_BEAST_HASTE_PERCENT * this.uptime)}% Haste
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireBeast;
