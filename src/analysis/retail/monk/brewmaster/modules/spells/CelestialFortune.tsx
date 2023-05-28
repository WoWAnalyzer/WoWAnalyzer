import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS, { maybeGetSpell } from 'common/SPELLS';
import { ItemIcon } from 'interface';
import { SpellIcon } from 'interface';
import { SpecIcon } from 'interface';
import { SpellLink } from 'interface';
import { Icon } from 'interface';
import { Panel } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

type TrackedHealing = {
  [spellId: number]: {
    amount: number;
    absorb: boolean;
  };
};

const totalTrackedHealing = (value: TrackedHealing) =>
  Object.values(value).reduce((a, b) => a + b.amount, 0);

/**
 * Celestial Fortune
 *
 * CF has two effects:
 *
 * 1. Any non-absorb heal has a chance equal to your crit% to trigger
 * CF, healing you for an additional 65%
 *
 * 2. Any absorb is increased by a factor of (1 + crit%)
 *
 * This module tracks both and breaks down the healing done by source
 * player.
 */
class CelestialFortune extends Analyzer {
  _totalHealing = 0;

  get totalHealing() {
    return this._totalHealing;
  }

  get hps() {
    return this._totalHealing / (this.owner.fightDuration / 1000);
  }

  get bonusCritRatio() {
    return 1 - this.stats.baseCritPercentage / this.stats.currentCritPercentage;
  }

  static dependencies = {
    stats: StatTracker,
    combatants: Combatants,
  };
  protected stats!: StatTracker;
  protected combatants!: Combatants;

  critBonusHealing = 0;
  _overhealing = 0;
  _healingByEntityBySpell: Record<number, TrackedHealing> = {};
  _currentAbsorbs: Record<number, Record<number, number | undefined>> = {};
  _lastMaxHp = 0;
  _nextCFHeal: HealEvent | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER), this.onRemoveBuff);
  }

  onHeal(event: HealEvent) {
    this._lastMaxHp = event.maxHitPoints ? event.maxHitPoints : this._lastMaxHp;
    if (event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id) {
      const amount = event.amount + (event.absorbed || 0);
      const overheal = event.overheal || 0;
      this._totalHealing += amount;
      this.critBonusHealing += Math.max(0, amount * this.bonusCritRatio);
      this._overhealing += overheal;
      this._queueHealing(event);
      return;
    } else {
      // only adds if a CF heal is queued
      this._addHealing(event);
    }
  }

  // track damage being absorbed
  onAbsorb(event: AbsorbedEvent) {
    if (event.ability.guid === SPELLS.STAGGER.id) {
      return;
    }

    if (!this._currentAbsorbs[event.sourceID]) {
      this._currentAbsorbs[event.sourceID] = {};
    }

    const sourceAbsorbs = this._currentAbsorbs[event.sourceID];
    sourceAbsorbs[event.ability.guid] = sourceAbsorbs[event.ability.guid] ?? 0 + event.amount;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (!this._currentAbsorbs[event.sourceID]) {
      return; // no absorbs from this source
    }

    const sourceAbsorbs = this._currentAbsorbs[event.sourceID];

    if (!sourceAbsorbs[event.ability.guid]) {
      return; // no absorbs from this (source, ability) pair
    }

    this._addAbsorb(sourceAbsorbs[event.ability.guid] ?? 0, event);

    sourceAbsorbs[event.ability.guid] = undefined;
  }

  _queueHealing(event: HealEvent) {
    if (this._nextCFHeal !== null) {
      console.warn('Resetting CF healing', event);
    }
    this._nextCFHeal = event;
  }

  _initHealing(sourceId: number, id: number, absorb: boolean) {
    if (!this._healingByEntityBySpell[sourceId]) {
      this._healingByEntityBySpell[sourceId] = {};
    }
    if (!this._healingByEntityBySpell[sourceId][id]) {
      this._healingByEntityBySpell[sourceId][id] = {
        amount: 0,
        absorb,
      };
    }
  }

  _addHealing(event: HealEvent) {
    if (this._nextCFHeal === null) {
      return;
    }
    const totalCFAmount = this._nextCFHeal.amount + (this._nextCFHeal.overheal || 0);
    const totalAmount = event.amount + (event.overheal || 0);
    if (Math.abs(totalCFAmount - 0.65 * totalAmount) > 0.1 * totalAmount && totalAmount > 100) {
      console.warn('Potential CF misalignment', event, this._nextCFHeal);
    }

    const spellId = event.ability.guid;
    const sourceId = event.sourceID;
    this._initHealing(sourceId, spellId, false);
    this._healingByEntityBySpell[sourceId][spellId].amount += this._nextCFHeal.amount;
    this._nextCFHeal = null;
  }

  _addAbsorb(amountAbsorbed: number, event: RemoveBuffEvent) {
    const crit = this.stats.currentCritPercentage;
    const sourceId = event.sourceID;
    const spellId = event.ability.guid;
    this._initHealing(sourceId, spellId, true);
    const totalAbsorb = amountAbsorbed + (event.absorb ?? 0);
    const cfBonus = (totalAbsorb * crit) / (1 + crit);
    // any absorb overhealing is taken from the cf bonus *first*
    const amount = Math.max(0, cfBonus - (event.absorb ?? 0));

    this._healingByEntityBySpell[sourceId][spellId].amount += amount;
    this._totalHealing += amount;
    this.critBonusHealing += amount * this.bonusCritRatio;
  }

  statistic() {
    return (
      <Statistic size="flexible" position={STATISTIC_ORDER.OPTIONAL()}>
        <BoringValue
          label={
            <>
              <SpellIcon id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} /> Celestial Fortune Healing
            </>
          }
        >
          <>{formatNumber(this.hps)} HPS</>
        </BoringValue>
      </Statistic>
    );
  }

  entries() {
    const playerSpan = (id: string, style: React.CSSProperties = { float: 'left' }) => {
      const combatant = this.combatants.players[Number(id)];
      if (!combatant) {
        return '';
      }
      const specClassName = combatant.player.type.replace(' ', '');
      return (
        <span style={style} className={specClassName}>
          <SpecIcon icon={combatant.player.icon} />
          {` ${combatant.name}`}
        </span>
      );
    };

    const playerTable = ([sourceId, obj]: [string, TrackedHealing]) => {
      const tableEntries = Object.entries(obj)
        .filter(([id, { amount }]) => amount > this._lastMaxHp * 0.01)
        .sort(([idA, objA], [idB, objB]) => objB.amount - objA.amount);

      if (tableEntries.length === 0) {
        return null; // a few small healing sources, skipping
      }
      return (
        <tbody key={sourceId}>
          <tr>
            <th style={{ width: '20%' }}>{playerSpan.call(this, sourceId)}</th>
            <th style={{ width: '20%' }}>Spell</th>
            <th style={{ width: '10%' }}>HPS</th>
            <th>Fraction of CF Healing</th>
            <th />
          </tr>
          {tableEntries
            .map(([id, datum]) => ({ id: Number(id), datum }))
            .map(({ id, datum: { absorb, amount } }) => (
              <tr key={id}>
                <td />
                <td>
                  <SpellLink id={Number(id)} icon={false}>
                    {maybeGetSpell(id) ? (
                      <>
                        <Icon icon={SPELLS[id].icon} /> {SPELLS[id].name}
                      </>
                    ) : ITEMS[id] ? (
                      <>
                        <ItemIcon id={id} /> {ITEMS[id].name}
                      </>
                    ) : (
                      id
                    )}
                  </SpellLink>
                </td>
                <td>
                  {absorb ? '≈' : ''}
                  {`${formatNumber(amount / (this.owner.fightDuration / 1000))} HPS`}
                </td>
                <td style={{ width: '20%' }}>
                  <div className="flex performance-bar-container">
                    <div
                      className="flex-sub performance-bar"
                      style={{
                        width: `${(amount / this._totalHealing) * 100}%`,
                        backgroundColor: '#70b570',
                      }}
                    />
                  </div>
                </td>
                <td className="text-left">
                  {`${((amount / this._totalHealing) * 100).toFixed(2)}%`}
                </td>
              </tr>
            ))}
          <tr>
            <td />
            <td>Total from {playerSpan.call(this, sourceId, {})}</td>
            <td>{`${formatNumber(
              Object.values(obj).reduce((a, b) => a + b.amount, 0) /
                (this.owner.fightDuration / 1000),
            )} HPS`}</td>
            <td style={{ width: '20%' }}>
              <div className="flex performance-bar-container">
                <div
                  className="flex-sub performance-bar"
                  style={{
                    width: `${(totalTrackedHealing(obj) / this._totalHealing) * 100}%`,
                    backgroundColor: '#ff8000',
                  }}
                />
              </div>
            </td>
            <td className="text-left">
              {`${((totalTrackedHealing(obj) / this._totalHealing) * 100).toFixed(2)}%`}
            </td>
          </tr>
        </tbody>
      );
    };

    const entries = Object.entries(this._healingByEntityBySpell)
      .sort(([idA, objA], [idB, objB]) => totalTrackedHealing(objB) - totalTrackedHealing(objA))
      .map(playerTable);
    return entries;
  }

  tab() {
    return {
      title: 'Celestial Fortune',
      url: 'celestial-fortune',
      render: () => (
        <Panel>
          <div style={{ marginTop: -10, marginBottom: -10 }}>
            <div style={{ padding: '1em' }}>
              Bonus healing provided by <SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} />, broken
              down by triggering spell and which player cast that spell.
            </div>
            <table className="data-table" style={{ marginTop: 10, marginBottom: 10 }}>
              {this.entries()}
            </table>
          </div>
        </Panel>
      ),
    };
  }
}

export default CelestialFortune;
