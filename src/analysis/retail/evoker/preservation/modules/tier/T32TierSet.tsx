import { EVOKER_TWW1_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  HealEvent,
  CastEvent,
  GetRelatedEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { getDreamBreathCast } from '../../normalizers/EventLinking/helpers';
import {
  DREAM_BREATH,
  DREAM_BREATH_FROM_STASIS,
  ENGULF_CONSUME_FLAME,
  ENGULF_DREAM_BREATH,
  LIFEBIND_HEAL_EMPOWER,
  SPIRITBLOOM_CAST,
  SPIRITBLOOM_FROM_STASIS,
  TEMPORAL_COMPRESSION_REVERSION,
} from '../../normalizers/EventLinking/constants';
import SpellLink from 'interface/SpellLink';

const REV_INC = 0.1;
const BONUS_4P = 0.1;

class T32Prevoker extends Analyzer {
  has4Piece: boolean = false;
  addedTcStacks: number = 0;
  addedReversionHealing: number = 0;
  addedEmpowerHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.REVERSION_TALENT, SPELLS.REVERSION_ECHO]),
      this.onRevHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.REVERSION_TALENT),
      this.onRevCast,
    );

    if (this.has4Piece) {
      this.addEventListener(
        Events.heal
          .by(SELECTED_PLAYER)
          .spell([
            SPELLS.DREAM_BREATH,
            SPELLS.DREAM_BREATH_FONT,
            SPELLS.SPIRITBLOOM,
            SPELLS.SPIRITBLOOM_HOT,
            SPELLS.SPIRITBLOOM_FONT,
            SPELLS.CONSUME_FLAME_HEAL,
            SPELLS.LIFEBIND_HEAL,
          ]),
        this.onBuffedHeal,
      );
    }
  }

  onRevHeal(event: HealEvent) {
    this.addedReversionHealing += calculateEffectiveHealing(event, REV_INC);
  }

  onRevCast(event: CastEvent) {
    const applyTc = GetRelatedEvents(event, TEMPORAL_COMPRESSION_REVERSION);
    if (applyTc.length === 2) {
      this.addedTcStacks += 1;
    }
  }

  onBuffedHeal(event: HealEvent) {
    let tcStacks = 0;
    // Dream Breath
    if (event.ability.name === TALENTS_EVOKER.DREAM_BREATH_TALENT.name) {
      const dbCast = getDreamBreathCast(event, false);
      if (dbCast) {
        tcStacks = this.selectedCombatant.getBuffStacks(
          SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
          dbCast.timestamp,
        );
        // If cast can't be found check for Stasis
      } else {
        const buffApplication = GetRelatedEvent(event, DREAM_BREATH);
        if (buffApplication) {
          const stasisRelease = GetRelatedEvent(buffApplication, DREAM_BREATH_FROM_STASIS);
          if (stasisRelease) {
            tcStacks = this.selectedCombatant.getBuffStacks(
              SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
              stasisRelease.timestamp,
            );
          }
        }
      }
      // Spiritbloom
    } else if (event.ability.name === TALENTS_EVOKER.SPIRITBLOOM_TALENT.name) {
      const sbCast = GetRelatedEvent(event, SPIRITBLOOM_CAST);
      if (sbCast) {
        tcStacks = this.selectedCombatant.getBuffStacks(
          SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
          sbCast.timestamp,
        );
        // If cast can't be found check for Stasis
      } else {
        const stasisRelease = GetRelatedEvent(event, SPIRITBLOOM_FROM_STASIS);
        if (stasisRelease) {
          tcStacks = this.selectedCombatant.getBuffStacks(
            SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
            stasisRelease.timestamp,
          );
        }
      }
      // Consume Flame
    } else if (event.ability.name === TALENTS_EVOKER.CONSUME_FLAME_TALENT.name) {
      const engulfCast = GetRelatedEvent(event, ENGULF_CONSUME_FLAME);
      if (engulfCast) {
        const dbApplication = GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent>(
          engulfCast,
          ENGULF_DREAM_BREATH,
        );
        if (dbApplication) {
          const dbCast = getDreamBreathCast(dbApplication);
          if (dbCast) {
            tcStacks = this.selectedCombatant.getBuffStacks(
              SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
              dbCast.timestamp,
            );
          }
        }
      }
      // Lifebind
    } else if (event.ability.name === TALENTS_EVOKER.LIFEBIND_TALENT.name) {
      const empowerCast = GetRelatedEvent<HealEvent>(event, LIFEBIND_HEAL_EMPOWER);
      if (empowerCast) {
        if (
          empowerCast.ability.name === TALENTS_EVOKER.SPIRITBLOOM_TALENT.name &&
          empowerCast.sourceID === empowerCast.targetID
        ) {
          const sbCast = GetRelatedEvent(empowerCast, SPIRITBLOOM_CAST);
          if (sbCast) {
            tcStacks = this.selectedCombatant.getBuffStacks(
              SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
              sbCast.timestamp,
            );
          }
        }
      }
    }
    if (tcStacks !== 0) {
      this.addedEmpowerHealing += calculateEffectiveHealing(event, tcStacks * BONUS_4P);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <ItemSetLink id={EVOKER_TWW1_ID} /> (T32 tier set){' '}
        <div className="pad">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.addedReversionHealing} />
          <br />
          {this.addedTcStacks}{' '}
          <small>
            extra <SpellLink spell={TALENTS_EVOKER.TEMPORAL_COMPRESSION_TALENT} /> stacks
          </small>
        </div>
        <div className="pad">
          <h4>4 piece</h4>
          <div>
            <ItemHealingDone amount={this.addedEmpowerHealing} />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default T32Prevoker;
