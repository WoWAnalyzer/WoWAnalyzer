import {
  DIRE_BEAST_BASE_DURATION,
  DIRE_BEAST_HASTE_PERCENT,
  DIRE_COMMAND_PROC_CHANCE,
  DIRE_FRENZY_INCREASE_DB_TIME,
} from 'analysis/retail/hunter/beastmastery/constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
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
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Kill Command has a 10% (per rank) chance to also summon a Dire Beast to attack your target.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/NBMbz2Dcq43k17tJ#fight=90&type=damage-done&source=11
 */
class DireCommand extends Analyzer {
  damage: number = 0;
  activeDireBeasts: string[] = [];
  direCommandProcs: number = 0;
  killCommandCasts: number = 0;
  lastKillCommandCast: number = 0;
  resetChance: number = 0;
  isDireCommandSummon: boolean = false;
  buffApplicationTimestamp: number = 0;
  direbeastDuration = DIRE_BEAST_BASE_DURATION;
  direBeastUptime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIRE_COMMAND_TALENT);
    if (!this.active) {
      return;
    }
    this.resetChance =
      DIRE_COMMAND_PROC_CHANCE[this.selectedCombatant.getTalentRank(TALENTS.DIRE_COMMAND_TALENT)];
    this.direbeastDuration +=
      DIRE_FRENZY_INCREASE_DB_TIME[
        this.selectedCombatant.getTalentRank(TALENTS.DIRE_FRENZY_TALENT)
      ];
    this.addEventListener(
      Events.summon
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DIRE_BEAST_SUMMON, SPELLS.DIRE_BEAST_GLYPHED]),
      this.direBeastSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.killCommandCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
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

  direBeastSummon(event: SummonEvent) {
    if (this.lastKillCommandCast + MS_BUFFER_100 > event.timestamp) {
      this.isDireCommandSummon = true;
      this.direCommandProcs += 1;
      const targetId = encodeEventTargetString(event);
      if (targetId) {
        this.activeDireBeasts.push(targetId);
      }
    } else {
      this.isDireCommandSummon = false;
    }
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

  killCommandCast(event: CastEvent) {
    this.killCommandCasts += 1;
    this.lastKillCommandCast = event.timestamp;
  }

  applyDireBeast(event: ApplyBuffEvent) {
    if (this.isDireCommandSummon) {
      this.buffApplicationTimestamp = event.timestamp;
    } else {
      this.buffApplicationTimestamp = 0;
    }
  }

  refreshDireBeast(event: RefreshBuffEvent) {
    if (this.buffApplicationTimestamp > event.timestamp - this.direbeastDuration) {
      this.direBeastUptime += event.timestamp - this.buffApplicationTimestamp;
    }
    if (this.isDireCommandSummon) {
      this.buffApplicationTimestamp = event.timestamp;
    } else {
      this.buffApplicationTimestamp = 0;
    }
  }

  removeDireBeast(event: RemoveBuffEvent) {
    if (this.isDireCommandSummon) {
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
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You had {formatPercentage(this.uptime)}% uptime on the Dire Beast haste buff that could
            be attributed to this talent.
          </>
        }
        dropdown={
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(
                this.direCommandProcs,
                this.killCommandCasts,
                this.resetChance,
              )}
              <p>
                Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given
                your number of <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />{' '}
                casts.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.DIRE_COMMAND_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <Haste /> {formatPercentage(DIRE_BEAST_HASTE_PERCENT * this.uptime)}% <small>Haste</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DireCommand;
