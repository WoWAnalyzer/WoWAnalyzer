import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ApplyBuffStackEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import Events from 'parser/core/Events';
import { TrackedBuffEvent } from 'parser/core/Entity';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';

import { DARK_EVANGELISM_DAMAGE_PER_RANK } from '../../constants';

const BAR_COLOR = '#6600CC';

class DarkEvangelism extends Analyzer {
  damage = 0;
  buffStacks = 0;

  multiplierDarkEvangelism =
    this.selectedCombatant.getTalentRank(TALENTS.DARK_EVANGELISM_TALENT) *
    DARK_EVANGELISM_DAMAGE_PER_RANK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DARK_EVANGELISM_TALENT_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DARK_EVANGELISM_TALENT_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DARK_EVANGELISM_TALENT_BUFF),
      this.onBuffRemoved,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VAMPIRIC_TOUCH),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
  }

  onBuffApplied() {
    this.buffStacks = 1;
  }
  onBuffStack(event: ApplyBuffStackEvent) {
    this.buffStacks = event.stack;
  }
  onBuffRemoved() {
    this.buffStacks = 0;
  }

  //Dark Evangelism buffs the perodic damage of Vampiric Touch, Shadow Word: Pain, Devouring Plague, Void Torrent, Mind Flay, and Mind Flay Insanity.
  onDamage(event: DamageEvent) {
    if (event.tick) {
      this.damage += calculateEffectiveDamage(
        event,
        this.multiplierDarkEvangelism * this.buffStacks,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="This talent buffs the periodic damage from Vampiric Touch, Shadow Word: Pain, Devouring Plague, Mind Flay, Mind Flay: Insanity and Void Torrent"
      >
        <BoringSpellValueText spell={TALENTS.DARK_EVANGELISM_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
          <div>
            <UptimeIcon /> {formatPercentage(this.uptime, 0)} % <small>uptime</small>{' '}
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DARK_EVANGELISM_TALENT_BUFF.id) /
      this.owner.fightDuration
    );
  }

  // This gets an uptime history for a buff on the player in the same way enemies.getDebuffHistory does for a debuff on an enemy.
  // By doing so, I can pass this into the same uptime bar that I do for my debuffs.
  // This seems like it would be very useful for many specs, but I couldn't find a function that does exactly this.
  get uptimeHistory() {
    type TempBuffInfo = {
      timestamp: number;
      type: 'apply' | 'remove';
      buff: TrackedBuffEvent;
    };
    const events: TempBuffInfo[] = [];

    const buffHistory = this.selectedCombatant.getBuffHistory(
      SPELLS.DARK_EVANGELISM_TALENT_BUFF.id,
    );
    buffHistory.forEach((buff) => {
      events.push({
        timestamp: buff.start,
        type: 'apply',
        buff,
      });
      events.push({
        timestamp: buff.end !== null ? buff.end : this.owner.currentTimestamp, // buff end is null if it's still active, it can also be 0 if buff ended at pull
        type: 'remove',
        buff,
      });
    });

    type PlayerBuffHistory = {
      start: number;
      end: number;
    };

    const history: PlayerBuffHistory[] = [];
    let current: PlayerBuffHistory | null = null;
    let active = 0;

    events
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => {
        if (event.type === 'apply') {
          if (current === null) {
            current = { start: event.timestamp, end: this.owner.currentTimestamp };
          }
          active += 1;
        }
        if (event.type === 'remove') {
          active -= 1;
          if (active === 0) {
            // We know for a fact that there will be a temp 'apply' before a temp 'remove'
            // because of the previous forEach, so its safe to non-null assert these
            current!.end = event.timestamp;
            history.push(current!);
            current = null;
          }
        }
      });
    // if buff lasted till end of combat, maybe doesn't ever happen due to some normalizing
    if (current !== null) {
      history.push(current);
    }
    return history;
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.DARK_EVANGELISM_TALENT_BUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }

  //this is unused for now, but remains in case DE uptime is important
  get guideSubsectionDE() {
    const explanation = (
      <p>
        This is the uptime of <SpellLink spell={SPELLS.DARK_EVANGELISM_TALENT_BUFF} />. You should
        not adjust your rotation to maintain this buff.
      </p>
    );

    const data = <RoundedPanel>{this.subStatistic()}</RoundedPanel>;

    return explanationAndDataSubsection(explanation, data);
  }
}

export default DarkEvangelism;
