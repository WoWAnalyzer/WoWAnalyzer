import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  SummonEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/HelpfulFormulas';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const WITHERING_PLAGUE_BASE_INCREASE = 0.135;
const WITHERING_PLAGUE_PER_RANK = 0.015;
const debug = false;

class WitheringPlague extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;
  missedDamage: number = 0;
  increase!: number;
  pets: Array<{ sourceID: number; sourceInstance: number }> = [];
  debuffedEnemies: { [targetIDInstance: string]: { [sourceID: number]: boolean } } = {};

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.WITHERING_PLAGUE.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.increase = WITHERING_PLAGUE_BASE_INCREASE + this.conduitRank * WITHERING_PLAGUE_PER_RANK;

    // Can't filter this .by(SELECTED_PLAYER_PET) since that only includes pets present
    // in the combatant info, not temporary ones tracked during combat as they are summoned.
    this.addEventListener(
      Events.damage.spell([SPELLS.HEART_STRIKE, SPELLS.HEART_STRIKE_PROC, SPELLS.BLOOD_STRIKE]),
      this.onDamage,
    );
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
    this.addEventListener(Events.applydebuff.spell(SPELLS.BLOOD_PLAGUE), this.applyDebuff);
    this.addEventListener(Events.removedebuff.spell(SPELLS.BLOOD_PLAGUE), this.removeDebuff);
  }

  enemyKey(event: { targetID: number; targetInstance?: number }) {
    return `${event.targetID}-${event.targetInstance}`;
  }

  applyDebuff(event: ApplyDebuffEvent) {
    if (!(event.targetID && event.sourceID)) {
      debug && this.error('ApplyDebuff without targetID or sourceID', event);
      return;
    }

    const debuffs = this.debuffedEnemies[this.enemyKey(event)] || {};
    debuffs[event.sourceID] = true;
    this.debuffedEnemies[this.enemyKey(event)] = debuffs;
  }

  removeDebuff(event: RemoveDebuffEvent) {
    if (!(event.targetID && event.sourceID)) {
      debug && this.error('RemoveDebuff without targetID or sourceID', event);
      return;
    }
    const debuffs = this.debuffedEnemies[this.enemyKey(event)] || {};
    debuffs[event.sourceID] = true;
    this.debuffedEnemies[this.enemyKey(event)] = debuffs;
  }

  isPet(event: DamageEvent) {
    return (
      event.sourceID != null &&
      event.sourceInstance != null &&
      this.pets.some(
        (pet) => event.sourceID === pet.sourceID && event.sourceInstance === pet.sourceInstance,
      )
    );
  }

  onSummon(event: SummonEvent) {
    this.pets.push({ sourceID: event.targetID, sourceInstance: event.targetInstance });
  }

  onDamage(event: DamageEvent) {
    if (!(event.targetID && event.sourceID)) {
      debug && this.error('Damage without targetID or sourceID', event);
      return;
    }

    if (this.owner.byPlayer(event) || this.isPet(event)) {
      const targetDebuff = Boolean(
        (this.debuffedEnemies[this.enemyKey(event)] || {})[event.sourceID],
      );
      if (targetDebuff) {
        this.addedDamage += calculateEffectiveDamage(event, this.increase);
      } else {
        this.missedDamage += (event.amount + (event.absorbed || 0)) * this.increase;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            {formatNumber((this.missedDamage / this.owner.fightDuration) * 1000)} potential DPS
            missed when casting <br /> <SpellLink id={SPELLS.HEART_STRIKE.id} /> on targets without{' '}
            <SpellLink id={SPELLS.BLOOD_PLAGUE.id} />.
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.WITHERING_PLAGUE.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default WitheringPlague;
