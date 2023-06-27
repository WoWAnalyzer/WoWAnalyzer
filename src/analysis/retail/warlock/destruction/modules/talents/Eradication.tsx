import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { When, NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const MAX_TRAVEL_TIME = 3000; // Chaos Bolt being the slowest, takes around 2 seconds to land from max range, added a second to account for maybe target movement?
const ERADICATION_DAMAGE_BONUS_BASE = 0.05;
const debug = false;

type Spell = {
  timestamp: number;
  spellId: CastEvent['ability']['guid'];
  targetID: CastEvent['targetID'];
  targetInstance: CastEvent['targetInstance'];
};

/*
  Eradication - Chaos Bolt increases the damage you deal to the target by 10% for 7 sec
 */
class Eradication extends Analyzer {
  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.ERADICATION_DEBUFF.id) / this.owner.fightDuration;
  }

  get CBpercentage() {
    return this._buffedCB / this._totalCB || 0;
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.55,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  ERADICATION_DAMAGE_BONUS: number =
    ERADICATION_DAMAGE_BONUS_BASE *
    this.selectedCombatant.getTalentRank(TALENTS.ERADICATION_TALENT);

  _buffedCB = 0;
  _totalCB = 0;
  bonusDmg = 0;
  // queues spells CAST with target having Eradication (except DoTs)
  queue: Spell[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ERADICATION_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.INCINERATE, SPELLS.CHAOS_BOLT]),
      this.onTravelSpellCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onTravelSpellCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.ERADICATION_DEBUFF.id, event.timestamp)) {
      return;
    }
    this.queue.push({
      timestamp: event.timestamp,
      spellId: spellId,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
    debug && console.log('Pushed a buffed cast into queue', JSON.parse(JSON.stringify(this.queue)));
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCINERATE.id || spellId === SPELLS.CHAOS_BOLT.id) {
      this._handleTravelSpellDamage(event);
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.ERADICATION_DEBUFF.id, event.timestamp)) {
      return;
    }

    this.bonusDmg += calculateEffectiveDamage(event, this.ERADICATION_DAMAGE_BONUS);
  }

  _handleTravelSpellDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this._totalCB += 1;
    }
    // first filter out old casts (could happen if player would cast something on a target and BEFORE it hits, it would die - then it couldn't be paired)
    this.queue = this.queue.filter((cast) => cast.timestamp > event.timestamp - MAX_TRAVEL_TIME);
    // try pairing damage event with casts in this.queue
    const castIndex = this.queue.findIndex(
      (queuedCast) =>
        queuedCast.targetID === event.targetID &&
        queuedCast.targetInstance === event.targetInstance &&
        queuedCast.spellId === event.ability.guid,
    );
    if (castIndex === -1) {
      debug &&
        console.log(
          `(${this.owner.formatTimestamp(
            event.timestamp,
            3,
          )}) Encountered damage event with no buffed cast associated, queue:`,
          JSON.parse(JSON.stringify(this.queue)),
          'event',
          event,
        );
      return;
    }

    debug &&
      console.log(
        'Paired damage event',
        event,
        'with queued cast',
        JSON.parse(JSON.stringify(this.queue[castIndex])),
      );
    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this._buffedCB += 1;
    }
    this.bonusDmg += calculateEffectiveDamage(event, this.ERADICATION_DAMAGE_BONUS);
    this.queue.splice(castIndex, 1);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your uptime on the <SpellLink id={SPELLS.ERADICATION_DEBUFF.id} /> debuff could be
          improved. You should try to spread out your <SpellLink id={SPELLS.CHAOS_BOLT.id} /> casts
          more for higher uptime.
          <br />
          <small>
            <em>NOTE:</em> Uptime may vary based on the encounter.
          </small>
        </>,
      )
        .icon(TALENTS.ERADICATION_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Eradication uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Bonus damage: ${formatThousands(this.bonusDmg)}`}
      >
        <TalentSpellText talent={TALENTS.ERADICATION_TALENT}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total
          </small>{' '}
          <br />
          <UptimeIcon /> {formatPercentage(this.uptime, 0)} % <small>uptime</small> <br />
          {formatPercentage(this.CBpercentage, 0)} %{' '}
          <TooltipElement content={`${this._buffedCB} / ${this._totalCB} Chaos Bolts`}>
            <small>
              buffed Chaos Bolts <sup>*</sup>
            </small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Eradication;
