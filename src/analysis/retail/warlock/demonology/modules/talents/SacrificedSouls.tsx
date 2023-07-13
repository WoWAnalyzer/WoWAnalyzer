import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DemoPets from '../pets/DemoPets';

const BONUS_DAMAGE_PER_PET = 0.04;
const MAX_TRAVEL_TIME = 3000; // Shadow Bolt is the slowest, takes around 2 seconds to land from max distance, add a little more to account for target movement
const debug = false;
type QueueItem = {
  timestamp: number;
  spellId: number;
  targetID: number | undefined;
  targetInstance: number | undefined;
  bonus: number;
};

class SacrificedSouls extends Analyzer {
  get totalBonusDamage() {
    return this._shadowBoltDamage + this._demonboltDamage;
  }

  static dependencies = {
    demoPets: DemoPets,
  };
  demoPets!: DemoPets;
  _shadowBoltDamage = 0;
  _demonboltDamage = 0;
  _queue: QueueItem[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SACRIFICED_SOULS_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SHADOW_BOLT_DEMO, SPELLS.DEMONBOLT]),
      this.handleCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SHADOW_BOLT_DEMO, SPELLS.DEMONBOLT]),
      this.handleDamage,
    );
  }

  // essentially same snapshotting mechanic as in Destruction's Eradication
  handleCast(event: CastEvent) {
    const bonus = this.demoPets.getPetCount() * BONUS_DAMAGE_PER_PET;
    this._queue.push({
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      bonus,
    });
    debug && this.log('Pushed a cast into queue', JSON.parse(JSON.stringify(this._queue)));
  }

  handleDamage(event: DamageEvent) {
    // filter out old casts if there are any
    this._queue = this._queue.filter((cast) => cast.timestamp > event.timestamp - MAX_TRAVEL_TIME);
    const castIndex = this._queue.findIndex(
      (cast) =>
        cast.targetID === event.targetID &&
        cast.targetInstance === event.targetInstance &&
        cast.spellId === event.ability.guid,
    );
    if (castIndex === -1) {
      debug &&
        this.error(
          'Encountered damage event with no cast associated. Queue',
          JSON.parse(JSON.stringify(this._queue)),
          'event',
          event,
        );
      return;
    }
    debug &&
      this.log(
        'Paired damage event',
        event,
        'with queued cast',
        JSON.parse(JSON.stringify(this._queue[castIndex])),
      );
    const bonusDamage = calculateEffectiveDamage(event, this._queue[castIndex].bonus);
    this._queue.splice(castIndex, 1);
    if (event.ability.guid === SPELLS.SHADOW_BOLT_DEMO.id) {
      this._shadowBoltDamage += bonusDamage;
    } else {
      this._demonboltDamage += bonusDamage;
    }
  }

  statistic() {
    const hasPS = this.selectedCombatant.hasTalent(TALENTS.POWER_SIPHON_TALENT);
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.totalBonusDamage)} bonus damage
            <br />
            Bonus Shadow Bolt damage: {formatThousands(this._shadowBoltDamage)} (
            {this.owner.formatItemDamageDone(this._shadowBoltDamage)})<br />
            Bonus Demonbolt damage: {formatThousands(this._demonboltDamage)} (
            {this.owner.formatItemDamageDone(this._demonboltDamage)})
            {hasPS && (
              <>
                <br />
                <br />* Since you have Power Siphon talent, it's highly likely that it messes up
                getting current pets at certain time because sometimes the number of Imps we
                sacrifice in code doesn't agree with what happens in logs. Therefore, this value is
                most likely a little wrong.
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.SACRIFICED_SOULS_TALENT}>
          <ItemDamageDone amount={this.totalBonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SacrificedSouls;
