import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class JadeSerpentStatue extends Analyzer {
  healing: number = 0;
  overHealing: number = 0;
  casts: number = 0;
  soothingMistUptime: number = 0;
  lastBuffApplyTimestamp: number = -1;
  jssCasting: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE),
      this.jssHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE),
      this.jssApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE),
      this.jssRemoveBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_MIST_STATUE),
      this.jssRefreshBuff,
    );
    this.addEventListener(Events.fightend, this.endFight);
  }

  get jadeSerpentStatueUptime() {
    return this.soothingMistUptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.jadeSerpentStatueUptime,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  jssHeal(event: HealEvent) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
    this.casts += 1;
  }

  jssApplyBuff(event: ApplyBuffEvent) {
    this.lastBuffApplyTimestamp = event.timestamp;
    this.jssCasting = true;
  }

  jssRemoveBuff(event: RemoveBuffEvent) {
    // Care for buff application before fight.
    if (this.lastBuffApplyTimestamp === null) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
      return;
    }

    this.soothingMistUptime += event.timestamp - this.lastBuffApplyTimestamp;
    this.jssCasting = false;
  }

  jssRefreshBuff(event: RefreshBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOOTHING_MIST_STATUE.id) {
      return;
    }

    // Care for buff application before fight.
    if (this.lastBuffApplyTimestamp === -1) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
    } else {
      this.soothingMistUptime += event.timestamp - this.lastBuffApplyTimestamp;
    }

    this.lastBuffApplyTimestamp = event.timestamp;
    this.jssCasting = true;
  }

  endFight() {
    if (this.jssCasting) {
      this.soothingMistUptime += this.owner.fight.end_time - this.lastBuffApplyTimestamp;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You selected <SpellLink id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> as your
          talent. To gain the most value out of this talent you should have it casting on someone as
          often as possible. The priority should be tanks or any raid member taking heavy damage,
          such as from a specific DOT or boss mechanic.
        </>,
      )
        .icon(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.icon)
        .actual(
          `${formatPercentage(actual)}${t({
            id: 'monk.mistweaver.jadeSerpentStatue.uptime',
            message: `% uptime`,
          })}`,
        )
        .recommended(`${formatPercentage(recommended)}% uptime is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> % Uptime
            </>
          }
        >
          <>{formatPercentage(this.jadeSerpentStatueUptime)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default JadeSerpentStatue;
