import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR } from '../../constants';

const PHOTOSYNTHESIS_HOT_INCREASE = 0.2;
// Spring blossoms double dips, confirmed by Bastas
const PHOTOSYNTHESIS_SB_INCREASE = 0.44;
const BLOOM_BUFFER_MS = 100;

/**
 * Photosynthesis (Talent) :
 * While your Lifebloom is on yourself, your periodic heals heal 20% faster.
 * While your Lifebloom is on an ally, your periodic heals on them have a 5% chance to cause it to bloom.
 */
class Photosynthesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  lifebloomIncrease = 0;

  lastRealBloomTimestamp: number | null = null;

  // Counters for increased ticking rate of hots
  increasedRateRejuvenationHealing = 0;
  increasedRateWildGrowthHealing = 0;
  increasedRateCenarionWardHealing = 0;
  increasedRateCultivationHealing = 0;
  increasedRateLifebloomHealing = 0;
  increasedRateRegrowthHealing = 0;
  increasedRateTranqHealing = 0;
  increasedRateSpringBlossomsHealing = 0;
  increasedRateEffloHealing = 0;
  increasedRateGroveTendingHealing = 0;
  randomProccs = 0;
  naturalProccs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
      this.onLifebloomCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
      this.onLifebloomRemoveBuff,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.EFFLORESCENCE_HEAL,
          SPELLS.SPRING_BLOSSOMS,
          ...HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR,
        ]),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL),
      this.onLifebloomProc,
    );
  }

  onLifebloomCast(event: CastEvent) {
    this.lastRealBloomTimestamp = event.timestamp;
  }

  onLifebloomRemoveBuff(event: RemoveBuffEvent) {
    this.lastRealBloomTimestamp = event.timestamp;
  }

  onLifebloomProc(event: HealEvent) {
    // Lifebloom random bloom procc
    if (
      this.lastRealBloomTimestamp === null ||
      event.timestamp - this.lastRealBloomTimestamp > BLOOM_BUFFER_MS
    ) {
      this.lifebloomIncrease += event.amount;
      this.randomProccs += 1;
    } else {
      this.naturalProccs += 1;
    }
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    // Yes it actually buffs efflorescence, confirmed by Voulk and Bastas
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.LIFEBLOOM_HOT_HEAL.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      switch (spellId) {
        case SPELLS.REJUVENATION.id:
          this.increasedRateRejuvenationHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.REJUVENATION_GERMINATION.id:
          this.increasedRateRejuvenationHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.WILD_GROWTH.id:
          this.increasedRateWildGrowthHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.CENARION_WARD_HEAL.id:
          this.increasedRateCenarionWardHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.CULTIVATION.id:
          this.increasedRateCultivationHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.LIFEBLOOM_HOT_HEAL.id:
          this.increasedRateLifebloomHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.SPRING_BLOSSOMS.id:
          this.increasedRateSpringBlossomsHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_SB_INCREASE,
          );
          break;
        case SPELLS.EFFLORESCENCE_HEAL.id:
          this.increasedRateEffloHealing += calculateEffectiveHealing(
            event,
            PHOTOSYNTHESIS_HOT_INCREASE,
          );
          break;
        case SPELLS.REGROWTH.id:
          if (event.tick === true) {
            this.increasedRateRegrowthHealing += calculateEffectiveHealing(
              event,
              PHOTOSYNTHESIS_HOT_INCREASE,
            );
          }
          break;
        case SPELLS.TRANQUILITY_HEAL.id:
          if (event.tick === true) {
            this.increasedRateTranqHealing += calculateEffectiveHealing(
              event,
              PHOTOSYNTHESIS_HOT_INCREASE,
            );
          }
          break;
        default:
          console.error(
            'Photosynthesis: Error, could not identify this object as a HoT: %o',
            event,
          );
      }
    }
  }

  get totalHealing(): number {
    return (
      this.increasedRateRejuvenationHealing +
      this.increasedRateWildGrowthHealing +
      this.increasedRateCenarionWardHealing +
      this.increasedRateCultivationHealing +
      this.increasedRateLifebloomHealing +
      this.increasedRateRegrowthHealing +
      this.increasedRateTranqHealing +
      this.increasedRateSpringBlossomsHealing +
      this.increasedRateEffloHealing +
      this.increasedRateGroveTendingHealing +
      this.lifebloomIncrease
    );
  }

  get percentHealing(): number {
    return this.owner.getPercentageOfTotalHealingDone(this.totalHealing);
  }

  get selfLifebloomUptime(): number {
    return this.selectedCombatant.getBuffUptime(
      SPELLS.LIFEBLOOM_HOT_HEAL.id,
      this.selectedCombatant.id,
    );
  }

  get totalLifebloomUptime(): number {
    return Object.values(this.combatants.players).reduce(
      (uptime, player) => uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id),
      0,
    );
  }

  statistic() {
    const selfUptime = this.selectedCombatant.getBuffUptime(
      SPELLS.LIFEBLOOM_HOT_HEAL.id,
      this.selectedCombatant.id,
    );
    const totalUptime = Object.values(this.combatants.players).reduce(
      (uptime, player) => uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id),
      0,
    );

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        tooltip={
          <>
            Healing contribution
            <ul>
              <li>
                Rejuvenation:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.increasedRateRejuvenationHealing,
                    ),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Wild Growth:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.increasedRateWildGrowthHealing),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Cenarion Ward:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.increasedRateCenarionWardHealing,
                    ),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Cultivation:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.increasedRateCultivationHealing,
                    ),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Lifebloom HoT:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.increasedRateLifebloomHealing),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Regrowth HoT:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.increasedRateRegrowthHealing),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Tranquility HoT:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.increasedRateTranqHealing),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Spring Blossoms:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.increasedRateSpringBlossomsHealing,
                    ),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Efflorescence:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.increasedRateEffloHealing),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Grove Tending:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.increasedRateGroveTendingHealing,
                    ),
                  )}{' '}
                  %
                </strong>
              </li>
              <hr />
              <li>
                Total HoT increase part:{' '}
                <strong>
                  {formatPercentage(
                    this.percentHealing -
                      this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease),
                  )}{' '}
                  %
                </strong>
              </li>
              <li>
                Lifebloom random bloom:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease),
                  )}{' '}
                  %
                </strong>{' '}
                (Random proccs: {this.randomProccs}, Natural proccs: {this.naturalProccs})
              </li>
            </ul>
            Lifebloom uptime
            <ul>
              <li>
                On Self:{' '}
                <strong>{formatPercentage(selfUptime / this.owner.fightDuration)} %</strong>
              </li>
              <li>
                On Others:{' '}
                <strong>
                  {formatPercentage((totalUptime - selfUptime) / this.owner.fightDuration)} %
                </strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.PHOTOSYNTHESIS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Photosynthesis;
