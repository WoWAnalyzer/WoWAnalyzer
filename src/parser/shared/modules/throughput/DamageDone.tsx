import { formatThousands, formatPercentage, formatDuration } from 'common/format';
import rankingColor from 'common/getRankingColor';
import makeWclUrl from 'common/makeWclUrl';
import { Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import FlushLineChart from 'parser/ui/FlushLineChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBar from 'parser/ui/StatisticBar';
import ThroughputPerformance, { UNAVAILABLE } from 'parser/ui/ThroughputPerformance';
import AutoSizer from 'react-virtualized-auto-sizer';

import DamageValue from '../DamageValue';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS/evoker';
import {
  EBON_MIGHT_PERSONAL_DAMAGE_AMP,
  BREATH_OF_EONS_MULTIPLIER,
  GOLDEN_OPPORTUNITY_PRESCIENCE_MULTIPLIER,
  SHIFTING_SANDS_MASTERY_COEFFICIENT,
} from 'analysis/retail/evoker/augmentation/constants';
import { i18n } from '@lingui/core';
import Enemies from '../Enemies';

class DamageDone extends Analyzer.withDependencies({ enemies: Enemies }) {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onByPlayerDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onByPlayerPetDamage);
  }

  _total = DamageValue.empty();
  private _totalBoss = DamageValue.empty();
  _augmentedExtra = 0;

  _augmentationDamageTotal = 0;
  _augmentationBreakdown: Record<number, number> = {};

  get total() {
    return this._total;
  }
  get totalBoss() {
    return this._totalBoss;
  }

  _byPet: Record<number, DamageValue> = {};
  byPet(petId: number) {
    if (!this._byPet[petId]) {
      return DamageValue.empty();
    }
    return this._byPet[petId];
  }
  get totalByPets() {
    return Object.keys(this._byPet)
      .map((petId) => this._byPet[parseInt(petId)])
      .reduce((total, damageValue) => total.add(damageValue), DamageValue.empty());
  }

  bySecond: Record<number, DamageValue> = {};

  onByPlayerDamage(event: DamageEvent) {
    if (!event.targetIsFriendly) {
      this._total = this._total.addEvent(event);

      if (this.deps.enemies.getById(event.targetID)?.subType === 'Boss') {
        this._totalBoss = this._totalBoss.addEvent(event);
      }

      const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
      if (!this.bySecond[secondsIntoFight]) {
        this.bySecond[secondsIntoFight] = DamageValue.empty();
      }
      this.bySecond[secondsIntoFight] = this.bySecond[secondsIntoFight].addEvent(event);

      // Track damage done while any augmentation buff is active, and attribute extra damage
      try {
        const augmentationBuffs: Array<{ id: number | undefined; multiplier?: number }> = [
          { id: SPELLS.EBON_MIGHT_BUFF_EXTERNAL?.id, multiplier: EBON_MIGHT_PERSONAL_DAMAGE_AMP },
          { id: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF?.id, multiplier: BREATH_OF_EONS_MULTIPLIER },
          { id: SPELLS.PRESCIENCE_BUFF?.id, multiplier: GOLDEN_OPPORTUNITY_PRESCIENCE_MULTIPLIER },
          { id: SPELLS.SHIFTING_SANDS_BUFF?.id, multiplier: SHIFTING_SANDS_MASTERY_COEFFICIENT },
        ];

        let anyAug = false;
        augmentationBuffs.forEach((b) => {
          if (!b.id) return;
          if (this.selectedCombatant.hasBuff(b.id, event.timestamp)) {
            anyAug = true;
            this._augmentationBreakdown[b.id] =
              (this._augmentationBreakdown[b.id] || 0) + event.amount + (event.absorbed || 0);
            if (b.multiplier) {
              this._augmentedExtra += calculateEffectiveDamage(event, b.multiplier as number);
            }
          }
        });
        if (anyAug) {
          this._augmentationDamageTotal += event.amount + (event.absorbed || 0);
        }
      } catch (error) {
        console.warn('Failed to track augmentation buffs:', error);
      }
    }
  }
  onByPlayerPetDamage(event: DamageEvent) {
    if (!event.targetIsFriendly) {
      this._total = this._total.addEvent(event);

      if (this.deps.enemies.getById(event.targetID)?.subType === 'Boss') {
        this._totalBoss = this._totalBoss.addEvent(event);
      }

      const petId = event.sourceID;
      if (petId) {
        this._byPet[petId] = this.byPet(petId).addEvent(event);
      }

      // Track augmentation damage for pets similarly
      try {
        const augmentationBuffs: Array<{ id: number | undefined; multiplier?: number }> = [
          { id: SPELLS.EBON_MIGHT_BUFF_EXTERNAL?.id, multiplier: EBON_MIGHT_PERSONAL_DAMAGE_AMP },
          { id: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF?.id, multiplier: BREATH_OF_EONS_MULTIPLIER },
          { id: SPELLS.PRESCIENCE_BUFF?.id, multiplier: GOLDEN_OPPORTUNITY_PRESCIENCE_MULTIPLIER },
          { id: SPELLS.SHIFTING_SANDS_BUFF?.id, multiplier: SHIFTING_SANDS_MASTERY_COEFFICIENT },
        ];

        let anyAug = false;
        augmentationBuffs.forEach((b) => {
          if (!b.id) return;
          if (this.selectedCombatant.hasBuff(b.id, event.timestamp)) {
            anyAug = true;
            this._augmentationBreakdown[b.id] =
              (this._augmentationBreakdown[b.id] || 0) + event.amount + (event.absorbed || 0);
            if (b.multiplier) {
              this._augmentedExtra += calculateEffectiveDamage(event, b.multiplier as number);
            }
          }
        });
        if (anyAug) {
          this._augmentationDamageTotal += event.amount + (event.absorbed || 0);
        }
      } catch (error) {
        console.warn('Failed to track augmentation buffs:', error);
      }
    }
  }

  showStatistic = true;
  subStatistic() {
    // rendered by ThroughputStatisticGroup
    if (!this.showStatistic) {
      return null;
    }

    const data = Object.entries(this.bySecond).map(([sec, val]) => ({
      time: sec,
      val: val.effective,
    }));

    const perSecond = (this.total.effective / this.owner.fightDuration) * 1000;
    // Normalized DPS attempts to remove damage attributable to augmentation buffs so we can compare
    // a player's baseline performance without augmentation. We currently attribute Ebon Might as a 20% buff.
    const normalizedDamage = Math.max(0, this.total.effective - this._augmentedExtra);
    const normalizedPerSecond = (normalizedDamage / this.owner.fightDuration) * 1000;
    const wclUrl = makeWclUrl(this.owner.report.code, {
      fight: this.owner.fightId,
      source: this.owner.playerId,
      type: 'damage-done',
    });

    return (
      <StatisticBar
        position={STATISTIC_ORDER.CORE(1)}
        ultrawide
        large={false}
        wide={false}
        style={{ marginBottom: 20, overflow: 'hidden' }} // since this is in a group, reducing margin should be fine
      >
        <div className="flex">
          <div className="flex-sub icon">
            <img src="/img/sword.png" alt="Damage" />
          </div>
          <Tooltip
            content={
              <>
                Total damage done: <strong>{formatThousands(this.total.effective)}</strong>
              </>
            }
          >
            <div className="flex-sub value" style={{ width: 190 }}>
              {this._augmentedExtra > 0 ? (
                <div>
                  <div style={{ fontWeight: 600 }}>{formatThousands(perSecond)} DPS</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                    <Tooltip
                      content={
                        <>
                          Due to Evoker augmentation buffs you were boosted by{' '}
                          <strong>
                            {formatPercentage(
                              // boost relative to baseline
                              this.total.effective - this._augmentedExtra > 0
                                ? this._augmentedExtra /
                                    (this.total.effective - this._augmentedExtra)
                                : 0,
                              1,
                            )}
                          </strong>
                          . This amounts to roughly{' '}
                          <strong>
                            {formatThousands(
                              (this._augmentedExtra / this.owner.fightDuration) * 1000,
                            )}
                          </strong>{' '}
                          DPS added. Without augmentation your DPS would be{' '}
                          <strong>{formatThousands(normalizedPerSecond)}</strong>.
                        </>
                      }
                    >
                      <span style={{ textDecoration: 'underline', cursor: 'help' }}>
                        Augmented DPS
                      </span>
                    </Tooltip>
                    : <strong>{formatThousands(perSecond)}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>
                    <span>Normalized DPS: </span>
                    <strong>{formatThousands(normalizedPerSecond)}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ fontWeight: 600 }}>{formatThousands(perSecond)} DPS</div>
              )}
            </div>
          </Tooltip>
          <div
            className="flex-sub"
            style={{ width: 110, textAlign: 'center', padding: '10px 5px' }}
          >
            <ThroughputPerformance throughput={perSecond} metric="dps">
              {({ performance, topThroughput, medianDuration }) =>
                performance &&
                performance !== UNAVAILABLE &&
                medianDuration && (
                  <Tooltip
                    content={
                      <>
                        Your DPS compared to the DPS of a top 100 player. To become a top 100{' '}
                        <span className={this.selectedCombatant.player.type.replace(' ', '')}>
                          {this.selectedCombatant.spec?.specName
                            ? i18n._(this.selectedCombatant.spec.specName)
                            : null}{' '}
                          {this.selectedCombatant.player.type}
                        </span>{' '}
                        on this fight you need to do at least{' '}
                        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
                        <strong>{formatThousands(topThroughput || 0)} DPS</strong>.<br />
                        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
                        <br />
                        Your fight lasted {formatDuration(this.owner.fightDuration)}. The median
                        duration of the fights in the top 100 was {formatDuration(medianDuration)}.
                      </>
                    }
                  >
                    <div className={rankingColor(performance)} style={{ cursor: 'help' }}>
                      {performance >= 1 ? 'TOP 100' : `${formatPercentage(performance, 0)}%`}
                    </div>
                  </Tooltip>
                )
              }
            </ThroughputPerformance>
          </div>
          <div className="flex-main chart">
            <a href={wclUrl}>
              {perSecond > 0 && (
                <AutoSizer disableWidth>
                  {({ height }) => (
                    <FlushLineChart
                      data={data}
                      duration={this.owner.fightDuration / 1000}
                      height={height}
                    />
                  )}
                </AutoSizer>
              )}
            </a>
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default DamageDone;
