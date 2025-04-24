import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, {
  DamageEvent,
  RemoveBuffEvent,
  CastEvent,
  RemoveBuffStackEvent,
  RemoveDebuffEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  TITANIC_WRATH_MULTIPLIER,
  GetDisintegrateTicks,
} from 'analysis/retail/evoker/devastation/constants';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ESSENCE_BURST_CONSUME } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';

const { DISINTEGRATE, PYRE, ESSENCE_BURST_DEV_BUFF } = SPELLS;

/** Essence Burst increases the damage of affected spells by 15.0%. */

class TitanicWrath extends Analyzer {
  ticksToCount = 0;

  titanicWrathDisintegrateDamage = 0;
  titanicWrathPyreDamage = 0;

  lastDamEvent = 0;

  trackDamage = false;
  trackedSpells = [DISINTEGRATE, PYRE];

  ticksPerDisintegrate = 0;
  ticksPerChainedDisintegrate = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TITANIC_WRATH_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onHit);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DISINTEGRATE), this.onCast);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(ESSENCE_BURST_DEV_BUFF),
      this.onBuffRemove,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(ESSENCE_BURST_DEV_BUFF),
      this.onBuffStackRemove,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.removeDebuff,
    );

    this.ticksPerDisintegrate = GetDisintegrateTicks(this.selectedCombatant).disintegrateTicks;
    this.ticksPerChainedDisintegrate = GetDisintegrateTicks(
      this.selectedCombatant,
    ).disintegrateChainedTicks;
  }

  onBuffRemove(event: RemoveBuffEvent) {
    if (HasRelatedEvent(event, ESSENCE_BURST_CONSUME)) {
      this.trackDamage = true;
      if (this.ticksToCount > 0) {
        this.ticksToCount = this.ticksPerChainedDisintegrate;
      } else {
        this.ticksToCount = this.ticksPerDisintegrate;
      }
    }
  }

  onBuffStackRemove(event: RemoveBuffStackEvent) {
    if (HasRelatedEvent(event, ESSENCE_BURST_CONSUME)) {
      this.trackDamage = true;
      if (this.ticksToCount > 0) {
        this.ticksToCount = this.ticksPerChainedDisintegrate;
      } else {
        this.ticksToCount = this.ticksPerDisintegrate;
      }
    }
  }

  onCast(event: CastEvent) {
    // Chained disintegrate will carry over a buffed tick to the non buffed cast
    if (this.ticksToCount > 0 && !this.trackDamage) {
      this.ticksToCount = 1;
    }
  }

  removeDebuff(event: RemoveDebuffEvent) {
    this.ticksToCount = 0;
  }

  onHit(event: DamageEvent) {
    if (event.ability.name === DISINTEGRATE.name) {
      if (this.ticksToCount > 0) {
        this.ticksToCount -= 1;
        this.trackDamage = false;
        this.titanicWrathDisintegrateDamage += calculateEffectiveDamage(
          event,
          TITANIC_WRATH_MULTIPLIER,
        );
      }
    } else if (event.ability.name === PYRE.name) {
      if (this.trackDamage || event.timestamp === this.lastDamEvent) {
        this.lastDamEvent = event.timestamp;
        this.trackDamage = false;
        this.titanicWrathPyreDamage += calculateEffectiveDamage(event, TITANIC_WRATH_MULTIPLIER);
        this.ticksToCount = 0;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>
              <SpellLink spell={DISINTEGRATE} /> Damage:{' '}
              {formatNumber(this.titanicWrathDisintegrateDamage)}
            </li>
            <li>
              <SpellLink spell={PYRE} /> Damage: {formatNumber(this.titanicWrathPyreDamage)}
            </li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TITANIC_WRATH_TALENT}>
          <ItemDamageDone
            amount={this.titanicWrathDisintegrateDamage + this.titanicWrathPyreDamage}
          />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TitanicWrath;
