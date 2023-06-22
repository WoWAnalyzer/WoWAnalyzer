import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, {
  DamageEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  HasRelatedEvent,
  CastEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  IRIDESCENCE_MULTIPLIER,
  DISINTEGRATE_CHAINED_TICKS,
  DISINTEGRATE_TICKS,
} from 'analysis/retail/evoker/devastation/constants';
import { SpellLink } from 'interface';
import {
  IRIDESCENCE_BLUE_CONSUME,
  IRIDESCENCE_RED_CONSUME,
} from '../normalizers/CastLinkNormalizer';
import TalentSpellText from 'parser/ui/TalentSpellText';

const {
  DISINTEGRATE,
  PYRE,
  LIVING_FLAME_DAMAGE,
  SHATTERING_STAR,
  AZURE_STRIKE,
  FIRESTORM_DAMAGE,
  UNRAVEL,
  IRIDESCENCE_BLUE,
  IRIDESCENCE_RED,
} = SPELLS;

const FIRESTORM_DURATION = 12000;

class Iridescence extends Analyzer {
  // Blue spell stuff
  ticksToCount: number = 0;

  iridescenceDisintegrateDamage: number = 0;
  iridescenceAzureStrikeDamage: number = 0;
  iridescenceShatteringStarDamage: number = 0;
  iridescenceUnravelDamage: number = 0;

  // Red spell stuff
  iridescencePyreDamage: number = 0;
  iridescenceLivingFlameDamage: number = 0;
  iridescenceFirestormDamage: number = 0;

  lastPyreDamEvent: number = 0;
  firestormCastEvent: number = 0;

  trackBlueDamage: boolean = false;
  trackRedDamage: boolean = false;
  trackFirestorm: boolean = false;
  trackedSpells = [DISINTEGRATE, PYRE, LIVING_FLAME_DAMAGE, SHATTERING_STAR, AZURE_STRIKE, UNRAVEL];

  iridescenceSpells = [IRIDESCENCE_BLUE, IRIDESCENCE_RED];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IRIDESCENCE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.onDisintegrateCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FIRESTORM_TALENT),
      this.onFirestormCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(this.iridescenceSpells),
      this.onBuffRemove,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(this.iridescenceSpells),
      this.onBuffStackRemove,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(DISINTEGRATE),
      this.removeDebuff,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onHit);
  }

  onBuffRemove(event: RemoveBuffEvent) {
    if (HasRelatedEvent(event, IRIDESCENCE_BLUE_CONSUME)) {
      this.trackBlueDamage = true;
      if (this.ticksToCount > 0) {
        this.ticksToCount = DISINTEGRATE_CHAINED_TICKS;
      } else {
        this.ticksToCount = DISINTEGRATE_TICKS;
      }
    } else if (HasRelatedEvent(event, IRIDESCENCE_RED_CONSUME)) {
      this.trackRedDamage = true;
    }
  }

  onBuffStackRemove(event: RemoveBuffStackEvent) {
    if (event.ability.name === IRIDESCENCE_BLUE.name) {
      this.trackBlueDamage = true;
      if (this.ticksToCount > 0) {
        this.ticksToCount = DISINTEGRATE_CHAINED_TICKS;
      } else {
        this.ticksToCount = DISINTEGRATE_TICKS;
      }
    } else if (HasRelatedEvent(event, IRIDESCENCE_RED_CONSUME)) {
      this.trackRedDamage = true;
    }
  }

  onDisintegrateCast() {
    // Chanined disintegrate will carry over a buffed tick to the non buffed cast
    if (this.ticksToCount > 0 && !this.trackBlueDamage) {
      this.ticksToCount = 1;
    }
  }

  onFirestormCast(event: CastEvent) {
    this.firestormCastEvent = event.timestamp;
    this.trackFirestorm = false;
  }

  removeDebuff() {
    this.ticksToCount = 0;
  }

  onHit(event: DamageEvent) {
    // Blue spells
    if (event.ability.name === DISINTEGRATE.name) {
      if (this.ticksToCount > 0) {
        this.ticksToCount -= 1;
        this.iridescenceDisintegrateDamage += calculateEffectiveDamage(
          event,
          IRIDESCENCE_MULTIPLIER,
        );
        if (this.trackBlueDamage) {
          this.trackBlueDamage = false;
        }
      }
    } else if (event.ability.name === AZURE_STRIKE.name && this.trackBlueDamage) {
      this.iridescenceAzureStrikeDamage += calculateEffectiveDamage(event, IRIDESCENCE_MULTIPLIER);
      this.trackBlueDamage = false;
    } else if (event.ability.name === SHATTERING_STAR.name && this.trackBlueDamage) {
      this.iridescenceShatteringStarDamage += calculateEffectiveDamage(
        event,
        IRIDESCENCE_MULTIPLIER,
      );
      this.trackBlueDamage = false;
    } else if (event.ability.name === UNRAVEL.name && this.trackBlueDamage) {
      this.iridescenceUnravelDamage += calculateEffectiveDamage(event, IRIDESCENCE_MULTIPLIER);
      if (this.trackBlueDamage) {
        this.trackBlueDamage = false;
      }
    }
    // Red spells
    else if (event.ability.name === PYRE.name) {
      if (this.trackRedDamage || event.timestamp === this.lastPyreDamEvent) {
        this.lastPyreDamEvent = event.timestamp;
        if (this.trackRedDamage) {
          this.trackRedDamage = false;
        }
        this.iridescencePyreDamage += calculateEffectiveDamage(event, IRIDESCENCE_MULTIPLIER);
        this.ticksToCount = 0;
      }
    } else if (event.ability.name === LIVING_FLAME_DAMAGE.name && this.trackRedDamage) {
      this.iridescenceLivingFlameDamage += calculateEffectiveDamage(event, IRIDESCENCE_MULTIPLIER);
      if (this.trackRedDamage) {
        this.trackRedDamage = false;
      }
    }
    // FIXME:
    // This is kinda jank, since *technically* two Firestorms can be down at the same time, and this would then combine the values of both
    // But for now it's fine, since it's extremely rare to run Firestorm along with Iridescence in the first place, not including the unicorn cases of running the talents
    // That allows multiple Firestorms AND Iridescence at the same time.
    else if (
      event.ability.name === FIRESTORM_DAMAGE.name &&
      (this.trackRedDamage ||
        (event.timestamp > this.firestormCastEvent + FIRESTORM_DURATION && this.trackFirestorm))
    ) {
      this.iridescenceFirestormDamage += calculateEffectiveDamage(event, IRIDESCENCE_MULTIPLIER);
      if (this.trackRedDamage) {
        this.trackRedDamage = false;
        this.trackFirestorm = true;
      }
    }
  }

  statistic() {
    const totalIridescenceDamage =
      this.iridescenceDisintegrateDamage +
      this.iridescenceAzureStrikeDamage +
      this.iridescenceShatteringStarDamage +
      this.iridescenceUnravelDamage +
      this.iridescencePyreDamage +
      this.iridescenceLivingFlameDamage +
      this.iridescenceFirestormDamage;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        // TODO: hide non talented abilities
        tooltip={
          <>
            <li>
              <SpellLink spell={DISINTEGRATE} /> Damage:{' '}
              {formatNumber(this.iridescenceDisintegrateDamage)}
            </li>
            <li>
              <SpellLink spell={SHATTERING_STAR} /> Damage:{' '}
              {formatNumber(this.iridescenceShatteringStarDamage)}
            </li>
            <li>
              <SpellLink spell={AZURE_STRIKE} /> Damage:{' '}
              {formatNumber(this.iridescenceAzureStrikeDamage)}
            </li>
            <li>
              <SpellLink spell={UNRAVEL} /> Damage: {formatNumber(this.iridescenceUnravelDamage)}
            </li>
            <li>
              <SpellLink spell={LIVING_FLAME_DAMAGE} /> Damage:{' '}
              {formatNumber(this.iridescenceLivingFlameDamage)}
            </li>
            <li>
              <SpellLink spell={PYRE} /> Damage: {formatNumber(this.iridescencePyreDamage)}
            </li>
            <li>
              <SpellLink spell={FIRESTORM_DAMAGE} /> Damage:{' '}
              {formatNumber(this.iridescenceFirestormDamage)}
            </li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.IRIDESCENCE_TALENT}>
          <ItemDamageDone amount={totalIridescenceDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Iridescence;
