import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import * as SPELLS from 'analysis/classic/priest/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { BeginChannelEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { PenanceBeginChannelEvent, PenanceLog } from 'analysis/classic/priest/modules/normalizers/PenanceNormalizer';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';

const NEW_PENANCE_TIMEOUT = 5000;

const PenanceTable = ({ penanceLogs, combatants, enemies }: { penanceLogs: PenanceLog[], combatants: Combatants, enemies: Enemies }) => {
  const isHealing = (log: PenanceLog) => log.penanceHealEvents.length > 0;

  const penanceTarget = (log: PenanceLog) => {
    if (isHealing(log)) {
      return combatants.getEntity(log.penanceHealEvents[0])?.name;
    } else {
      return enemies.getEntity(log.penanceDamageEvents[0])?.name;
    }
  };

  const penanceAmount = (log: PenanceLog) => {
    let amount = 0;
    if (isHealing(log)) {
      log.penanceHealEvents.forEach(evt => {
        amount += evt.amount || 0;
      });
    } else {
      log.penanceDamageEvents.forEach(evt => {
        amount += evt.amount || 0;
      });
    }
    return amount;
  };

  return <table className="table table-condensed" style={{ backgroundColor: '#161513' }}>
    <thead>
      <tr>
        <th>
          Penance #
        </th>
        <th>
          Target
        </th>
        <th>
          Amount
        </th>
      </tr>
    </thead>
    <tbody>
      {penanceLogs.map((log, index) => {
        return <tr key={index} style={{ color: isHealing(log) ? 'green' : 'red' }}>
          <td>{index}</td>
          <td>{penanceTarget(log)}</td>
          <td>{penanceAmount(log)}</td>
        </tr>;
      })}
    </tbody>
  </table>;
};

class Penance extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    enemies: Enemies,
  };

  protected abilityTracker!: AbilityTracker;
  protected combatants!: Combatants;
  protected enemies!: Enemies;

  private lastPenanceTimestamp: number = 0;
  private penanceLogs: PenanceLog[] = [];

  get penanceEnabled() {
    return this.selectedCombatant.talentPoints[0] >= 51;
  }

  get healingDone() {
    return this.abilityTracker.getAbility(SPELLS.PENANCE_HEALING).healingEffective || 0;
  }

  get rawHealing() {
    const ability = this.abilityTracker.getAbility(SPELLS.PENANCE_HEALING);
    if (!ability) {
      return 0;
    }
    return ability.healingEffective || 0 + ability.healingOverheal || 0 + ability.healingAbsorbed || 0;
  }

  get damgeDone() {
    const ability = this.abilityTracker.getAbility(SPELLS.PENANCE_DAMAGE);
    if (!ability) {
      return 0;
    }
    return ability.damageEffective || 0 + ability.damageAbsorbed || 0;
  }

  get castCount() {
    return this.abilityTracker.getAbility(SPELLS.PENANCE_HEALING).casts + this.abilityTracker.getAbility(SPELLS.PENANCE_DAMAGE).casts;
  }

  get healCount() {
    return this.abilityTracker.getAbility(SPELLS.PENANCE_HEALING).healingHits;
  }

  get damageCount() {
    return this.abilityTracker.getAbility(SPELLS.PENANCE_DAMAGE).damageHits;
  }

  isNewPenance(event: CastEvent) {
    return event.timestamp - NEW_PENANCE_TIMEOUT > this.lastPenanceTimestamp;
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell([{ id: SPELLS.PENANCE_HEALING }, { id: SPELLS.PENANCE_DAMAGE }]),
      this.penanceChannel,
    );
  }

  penanceChannel(event: BeginChannelEvent) {
    this.penanceLogs.push(event as PenanceBeginChannelEvent);
  }

  statistic() {
    if (this.castCount === 0) {
      return null;
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={<PenanceTable penanceLogs={this.penanceLogs} combatants={this.combatants} enemies={this.enemies} />}
      >
        <BoringSpellValueText spellId={SPELLS.PENANCE_HEALING}>
          <ItemHealingDone amount={this.healingDone} />
          <br />
          <ItemDamageDone amount={this.damgeDone} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Penance;

