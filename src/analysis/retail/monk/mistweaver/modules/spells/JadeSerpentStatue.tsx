import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class JadeSerpentStatue extends Analyzer {
  healing: number = 0;
  overHealing: number = 0;
  casts: number = 0;
  soothingMistUptime: number = 0;
  lastBuffApplyTimestamp: number = -1;
  jssCasting: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT);
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
    if (this.lastBuffApplyTimestamp === -1) {
      this.soothingMistUptime += event.timestamp - this.owner.fight.start_time;
      this.jssCasting = false;
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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT}>
          {formatPercentage(this.jadeSerpentStatueUptime)}% Uptime
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default JadeSerpentStatue;
