import { t, Trans } from '@lingui/macro';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  ResourceChangeEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Abilities from 'parser/core/modules/Abilities';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MAX_RUNES = 6;
const RUNE_REGEN_BUFFS = {
  [SPELLS.RUNIC_CORRUPTION.id]: 1,
};
const RUNE_IDS = [
  SPELLS.RUNE_1, //-101
  SPELLS.RUNE_2, //-102
  SPELLS.RUNE_3, //-103
];

/*
 * Runes are tracked as 3 fake spells with 2 charges to simulate 3 runes charging at the same time.
 * aslong as spells always use the rune pair with the shortest cooldown remaining it should match
 * its in game functionality.
 */
class RuneTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
    castEfficiency: CastEfficiency,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected castEfficiency!: CastEfficiency;
  protected abilities!: Abilities;

  runesReady: Array<{ x: number; y: number }> = []; //{x, y} points of {time, runeCount} for the chart
  _runesReadySum; //time spent at each rune. _runesReadySum[1] is time spent at one rune available.
  _lastTimestamp; //used to find time since last rune change for the _runesReadySum
  _fightend = false; //fightend, avoid wierd graph by not adding later runes

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNES;
    this._lastTimestamp = this.owner.fight.start_time;
    this._runesReadySum = Array.from({ length: MAX_RUNES + 1 }, (_) => 0);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.RUNIC_CORRUPTION),
      this.onApplybuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RUNIC_CORRUPTION),
      this.onRemovebuff,
    );
    this.addEventListener(Events.UpdateSpellUsable.spell(RUNE_IDS), this.onUpdateSpellUsable);
  }

  onFightEnd() {
    //add a last event for calculating uptimes and make the chart not end early.
    const runesAvailable = this.runesAvailable;
    this._fightend = true;

    this.runesReady.push({ x: this.owner.fightDuration / 1000, y: runesAvailable });
    this._runesReadySum[runesAvailable] += this.owner.fight.end_time - this._lastTimestamp;
    this.addPassiveRuneRegeneration();
  }

  onCast(event: CastEvent) {
    if (!event.classResources || event.prepull) {
      return;
    }
    super.onCast(event);

    event.classResources
      .filter((resource) => resource.type === this.resource.id)
      .forEach(({ amount, cost }) => {
        const runeCost = cost || 0;
        if (runeCost <= 0) {
          return;
        }
        for (let i = 0; i < runeCost; i += 1) {
          //start rune cooldown
          this.startCooldown(event);
        }
      });
  }

  onEnergize(event: ResourceChangeEvent) {
    //add a charge to the rune with the longest remaining cooldown when a rune is refunded.
    super.onEnergize(event);
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const amount = event.resourceChange;
    for (let i = 0; i < amount; i += 1) {
      this.addCharge();
    }
  }

  onApplybuff(event: ApplyBuffEvent) {
    //decrease cooldown when a buff that increases rune regeneration rate is applied.
    const increase = RUNE_REGEN_BUFFS[event.ability.guid];
    if (increase) {
      const multiplier = 1 / (1 + increase);
      RUNE_IDS.forEach((spell) => {
        this.changeCooldown(spell.id, multiplier);
      });
    }
  }

  onRemovebuff(event: RemoveBuffEvent) {
    //increase cooldown when a buff that increases rune regeneration rate fades.
    const increase = RUNE_REGEN_BUFFS[event.ability.guid];
    if (increase) {
      const multiplier = 1 + increase;
      RUNE_IDS.forEach((spell) => {
        this.changeCooldown(spell.id, multiplier);
      });
    }
  }

  onUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    //track when a rune comes off cooldown
    let change = 0;
    if (
      event.updateType === UpdateSpellUsableType.EndCooldown ||
      event.updateType === UpdateSpellUsableType.RestoreCharge
    ) {
      //gained a rune
      change += 1;
    } else if (
      event.updateType === UpdateSpellUsableType.BeginCooldown ||
      event.updateType === UpdateSpellUsableType.UseCharge
    ) {
      //spent a rune
      change -= 1;
    } else {
      //no change
      return;
    }

    //time since last rune change was spent at current runes minus the change.
    this._runesReadySum[this.runesAvailable - change] += event.timestamp - this._lastTimestamp;
    this._lastTimestamp = event.timestamp;
    //Adding two points to the rune chart, one at {time, lastRuneCount} and one at {time, newRuneCount} so the chart does not have diagonal lines.

    if (this._fightend) {
      return;
    }

    this.runesReady.push({
      x: this.timeFromStart(event.timestamp),
      y: this.runesAvailable - change,
    });
    this.runesReady.push({ x: this.timeFromStart(event.timestamp), y: this.runesAvailable });
  }

  // add passive rune regeneration and RC/4p21blood
  addPassiveRuneRegeneration() {
    let passiveRunesGained = this.runesMaxCasts;
    let passiveRunesWasted = this.runesWasted;
    //add runic corruption gained (and subtract it from passive regn)
    const runicCorruptionContribution = this.addPassiveAccelerator(
      SPELLS.RUNIC_CORRUPTION.id,
      passiveRunesGained,
      passiveRunesWasted,
      RUNE_REGEN_BUFFS[SPELLS.RUNIC_CORRUPTION.id],
    );
    passiveRunesGained *= 1 - runicCorruptionContribution;
    passiveRunesWasted *= 1 - runicCorruptionContribution;
    //add passive rune regn
    this.initBuilderAbility(SPELLS.RUNE_1.id);
    this.buildersObj[SPELLS.RUNE_1.id].generated += Math.round(passiveRunesGained);
    this.buildersObj[SPELLS.RUNE_1.id].wasted += Math.round(passiveRunesWasted);
  }

  addPassiveAccelerator(spellId: number, gained: number, wasted: number, increase: number): number {
    //used to add passive rune gain accelerators like Runic Corruption
    //use uptime to get approximate contribution to passive regeneration
    const uptime = this.selectedCombatant.getBuffUptime(spellId) / this.owner.fightDuration;
    if (uptime <= 0) {
      return 0;
    }
    this.initBuilderAbility(spellId);
    const contribution = (uptime * increase) / (1 + increase);
    const acceleratorGained = Math.round(gained * contribution);
    this.buildersObj[spellId].generated += acceleratorGained;
    const acceleratorWasted = Math.round(wasted * contribution);
    this.buildersObj[spellId].wasted += acceleratorWasted;
    return contribution;
  }

  changeCooldown(spellId: number, multiplier: number) {
    //increases or decreases rune cooldown
    if (!this.spellUsable.isOnCooldown(spellId)) {
      return;
    }
    const remainingCooldown = this.spellUsable.cooldownRemaining(spellId);
    const newCooldown = remainingCooldown * multiplier;
    const reduction = remainingCooldown - newCooldown;
    this.spellUsable.reduceCooldown(spellId, reduction);
  }

  addCharge() {
    const runeId = this.longestCooldown;
    if (!this.spellUsable.isOnCooldown(runeId)) {
      return;
    }
    const expectedCooldown = this.abilities.getExpectedCooldownDuration(runeId);
    this.spellUsable.reduceCooldown(runeId, expectedCooldown || 0);
  }

  startCooldown(event: CastEvent) {
    const runeId = this.shortestCooldown;
    this.spellUsable.beginCooldown(event, runeId);
  }

  get shortestCooldown(): number {
    const runeOneCooldown = this.getCooldown(SPELLS.RUNE_1.id) || 0;
    const runeTwoCooldown = this.getCooldown(SPELLS.RUNE_2.id) || 0;
    const runeThreeCooldown = this.getCooldown(SPELLS.RUNE_3.id) || 0;
    if (runeOneCooldown <= runeTwoCooldown && runeOneCooldown <= runeThreeCooldown) {
      return SPELLS.RUNE_1.id;
    } else if (runeTwoCooldown <= runeThreeCooldown) {
      return SPELLS.RUNE_2.id;
    } else {
      return SPELLS.RUNE_3.id;
    }
  }

  get longestCooldown(): number {
    const runeOneCooldown = this.getCooldown(SPELLS.RUNE_1.id) || 0;
    const runeTwoCooldown = this.getCooldown(SPELLS.RUNE_2.id) || 0;
    const runeThreeCooldown = this.getCooldown(SPELLS.RUNE_3.id) || 0;
    if (runeOneCooldown >= runeTwoCooldown && runeOneCooldown >= runeThreeCooldown) {
      return SPELLS.RUNE_1.id;
    } else if (runeTwoCooldown >= runeThreeCooldown) {
      return SPELLS.RUNE_2.id;
    } else {
      return SPELLS.RUNE_3.id;
    }
  }

  get runesAvailable(): number {
    let chargesAvailable = 0;
    RUNE_IDS.forEach((spell) => {
      chargesAvailable += this.spellUsable.chargesAvailable(spell.id);
    });
    return chargesAvailable;
  }

  getCooldown(spellId: number) {
    if (!this.spellUsable.isOnCooldown(spellId)) {
      return null;
    }
    const chargesOnCooldown = 2 - this.spellUsable.chargesAvailable(spellId);
    const cooldownRemaining = this.spellUsable.cooldownRemaining(spellId);
    const fullChargeCooldown = this.abilities.getExpectedCooldownDuration(spellId);
    return (chargesOnCooldown - 1) * fullChargeCooldown! + cooldownRemaining;
  }

  get runeEfficiency() {
    const runeCastEfficiencies = RUNE_IDS.map(
      ({ id }: { id: number }) => this.castEfficiency.getCastEfficiencyForSpellId(id)!.efficiency!,
    );

    return (
      runeCastEfficiencies.reduce((accumulator, currentValue) => accumulator + currentValue) /
      runeCastEfficiencies.length
    );
  }

  // total runes generated with passive regeneration
  get runesMaxCasts() {
    const totalCasts = Object.values(this.spendersObj).reduce((a, b) => a + b.spent, 0);
    const runesReadyCount = this.runesReady[this.runesReady.length - 1]?.y ?? 0;
    // subtract starting runes and add end runes
    return totalCasts - MAX_RUNES + runesReadyCount;
  }

  // total runes wasted with passive regeneration
  get runesWasted() {
    return this.runesMaxCasts * (1 - this.runeEfficiency);
  }

  get timeSpentAtRuneCount() {
    return this._runesReadySum.map((time) => time / this.owner.fightDuration);
  }

  timeFromStart(timestamp: number) {
    return (timestamp - this.owner.fight.start_time) / 1000;
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.shared.runeTracker.suggestion.suggestion">
          You overcapped {formatPercentage(actual)}% of your runes. Try to always have at least 3
          runes on cooldown.
        </Trans>,
      )
        .icon(SPELLS.RUNE_1.icon)
        .actual(
          <Trans id="deathknight.shared.runeTracker.suggestion.actual">
            {formatPercentage(actual)}% runes overcapped
          </Trans>,
        )
        .recommended(
          <Trans id="deathknight.shared.runeTracker.suggestion.recommended">
            &lt;{formatPercentage(recommended)}% is recommended
          </Trans>,
        ),
    );
  }

  statistic() {
    const timeSpentAtRuneCount = this.timeSpentAtRuneCount;
    const badThreshold = 4;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        tooltip={
          <Trans id="deathknight.shared.runeTracker.statistic.tooltip">
            Number of runes wasted: {formatNumber(this.runesWasted)} <br />
            These numbers only include runes wasted from passive regeneration. <br />
            The table below shows the time spent at any given number of runes available.
          </Trans>
        }
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>
                  <Trans id="deathknight.shared.runeTracker.statistic.header.runes">Runes</Trans>
                </th>
                <th>
                  <Trans id="deathknight.shared.runeTracker.statistic.header.timeAbs">
                    Time (s)
                  </Trans>
                </th>
                <th>
                  <Trans id="deathknight.shared.runeTracker.statistic.header.timePct">
                    Time (%)
                  </Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {
                //split into good and bad number of runes available
                this._runesReadySum
                  .filter((_value, index) => index < badThreshold)
                  .map((_value, index) => (
                    <tr key={index}>
                      <th>{index}</th>
                      <td>{formatDuration(this._runesReadySum[index])}</td>
                      <td>{formatPercentage(timeSpentAtRuneCount[index])}%</td>
                    </tr>
                  ))
              }
              {this._runesReadySum
                .filter((_value, index) => index >= badThreshold)
                .map((_value, index) => (
                  <tr key={index + badThreshold}>
                    <th style={{ color: 'red' }}>{index + badThreshold}</th>
                    <td>{formatDuration(this._runesReadySum[index + badThreshold])}</td>
                    <td>{formatPercentage(timeSpentAtRuneCount[index + badThreshold])}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        }
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.RUNES}
          value={`${formatPercentage(1 - this.runeEfficiency)} %`}
          label={t({
            id: 'deathknight.shared.runeTracker.statistic.value',
            message: 'Runes overcapped',
          })}
        />
      </Statistic>
    );
  }
}

export default RuneTracker;
