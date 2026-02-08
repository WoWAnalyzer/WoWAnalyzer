import SPELLS from 'common/SPELLS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  CastEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const LESSER_GHOUL_DURATION_MS = 6000;

interface GhoulInstance {
  summonTime: number;
  expirationTime: number;
}

class LesserGhoulTracker extends Analyzer {
  private lesserGhoulStacks = 0;
  private totalGhoulsSummoned = 0;
  private ghoulsFromArmy = 0;
  private ghoulsFromScourgeStrike = 0;
  private ghoulsPutrefied = 0;
  private activeGhouls: GhoulInstance[] = [];
  private maxSimultaneousGhouls = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SCOURGE_STRIKE),
      this.onScourgeStrikeCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARMY_OF_THE_DEAD),
      this.onArmyCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PUTREFY),
      this.onPutrefyCast,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.lesserGhoulStacks = 1;
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.lesserGhoulStacks = event.stack;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.lesserGhoulStacks = 0;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.lesserGhoulStacks = event.stack;
  }

  onScourgeStrikeCast(event: CastEvent) {
    if (this.lesserGhoulStacks > 0) {
      this.summonGhoul(event.timestamp, 'scourgeStrike');
    }
    this.cleanupExpiredGhouls(event.timestamp);
  }

  onArmyCast(event: CastEvent) {
    for (let i = 0; i < 6; i++) {
      this.summonGhoul(event.timestamp, 'army');
    }
    this.cleanupExpiredGhouls(event.timestamp);
  }

  onPutrefyCast(event: CastEvent) {
    this.ghoulsPutrefied += 1;
    if (this.activeGhouls.length > 0) {
      this.activeGhouls.shift();
    }
    this.cleanupExpiredGhouls(event.timestamp);
  }

  private summonGhoul(timestamp: number, source: 'army' | 'scourgeStrike') {
    this.totalGhoulsSummoned += 1;
    if (source === 'army') {
      this.ghoulsFromArmy += 1;
    } else {
      this.ghoulsFromScourgeStrike += 1;
    }

    this.activeGhouls.push({
      summonTime: timestamp,
      expirationTime: timestamp + LESSER_GHOUL_DURATION_MS,
    });

    if (this.activeGhouls.length > this.maxSimultaneousGhouls) {
      this.maxSimultaneousGhouls = this.activeGhouls.length;
    }
  }

  private cleanupExpiredGhouls(currentTime: number) {
    this.activeGhouls = this.activeGhouls.filter((ghoul) => ghoul.expirationTime > currentTime);
  }

  get ghoulsPerMinute(): number {
    return this.totalGhoulsSummoned / (this.owner.fightDuration / 1000 / 60);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={
          <>
            Lesser Ghouls are summoned by Scourge Strike (when buffed) and Army of the Dead. They
            last 6 seconds and can be exploded with Putrefy for burst damage.
            <br />
            <br />
            <strong>Sources:</strong>
            <ul>
              <li>From Scourge Strike: {this.ghoulsFromScourgeStrike}</li>
              <li>From Army of the Dead: {this.ghoulsFromArmy}</li>
            </ul>
            <strong>Max simultaneous:</strong> {this.maxSimultaneousGhouls}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.LESSER_GHOUL_BUFF}>
          <>
            {this.totalGhoulsSummoned} <small>ghouls summoned</small>
            <br />
            {this.ghoulsPerMinute.toFixed(1)} <small>per minute</small>
            <br />
            {this.ghoulsPutrefied} <small>putrefied</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LesserGhoulTracker;
