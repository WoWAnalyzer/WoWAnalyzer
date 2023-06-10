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
} from 'parser/core/Events';

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
  disintegrateDamage: number = 0;
  azureStrikeDamage: number = 0;
  shatteringStarDamage: number = 0;
  unravelDamage: number = 0;

  iridescenceDisintegrateDamage: number = 0;
  iridescenceAzureStrikeDamage: number = 0;
  iridescenceShatteringStarDamage: number = 0;
  iridescenceUnravelDamage: number = 0;

  // Red spell stuff
  pyreDamage: number = 0;
  livingFlameDamage: number = 0;
  firestormDamage: number = 0;

  iridescencePyreDamage: number = 0;
  iridescenceLivingFlameDamage: number = 0;
  iridescenceFirestormDamage: number = 0;

  lastDamEvent: number = 0;
  lastFirestormEvent: number = 0;

  trackBlueDamage: boolean = false;
  trackRedDamage: boolean = false;
  trackedSpells = [DISINTEGRATE, PYRE, LIVING_FLAME_DAMAGE, SHATTERING_STAR, AZURE_STRIKE, UNRAVEL];

  iridescenceSpells = [IRIDESCENCE_BLUE, IRIDESCENCE_RED];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IRIDESCENCE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onHit);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DISINTEGRATE), this.onCast);

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

  onCast() {
    // Chanined disintegrate will carry over a buffed tick to the non buffed cast
    if (this.ticksToCount > 0 && !this.trackBlueDamage) {
      this.ticksToCount = 1;
    }
  }

  removeDebuff() {
    this.ticksToCount = 0;
  }

  onHit(event: DamageEvent) {
    // Blue spells
    if (event.ability.name === DISINTEGRATE.name) {
      if (this.ticksToCount > 0) {
        this.ticksToCount -= 1;
        this.disintegrateDamage += event.amount;
        if (event.absorbed !== undefined) {
          this.disintegrateDamage += event.absorbed;
        }
        this.trackBlueDamage = false;
      }
    } else if (event.ability.name === AZURE_STRIKE.name && this.trackBlueDamage) {
      this.azureStrikeDamage += event.amount;
      if (event.absorbed !== undefined) {
        this.disintegrateDamage += event.absorbed;
      }
      this.trackBlueDamage = false;
    } else if (event.ability.name === SHATTERING_STAR.name && this.trackBlueDamage) {
      this.shatteringStarDamage += event.amount;
      if (event.absorbed !== undefined) {
        this.disintegrateDamage += event.absorbed;
      }
      this.trackBlueDamage = false;
    } else if (event.ability.name === UNRAVEL.name && this.trackBlueDamage) {
      this.unravelDamage += event.amount;
      if (event.absorbed !== undefined) {
        this.disintegrateDamage += event.absorbed;
      }
      this.trackBlueDamage = false;
    }
    // Red spells
    else if (event.ability.name === PYRE.name) {
      if (this.trackRedDamage || event.timestamp === this.lastDamEvent) {
        this.lastDamEvent = event.timestamp;
        this.trackRedDamage = false;
        this.pyreDamage += event.amount;
        this.ticksToCount = 0;
        if (event.absorbed !== undefined) {
          this.pyreDamage += event.absorbed;
        }
      }
    } else if (event.ability.name === LIVING_FLAME_DAMAGE.name && this.trackRedDamage) {
      if (this.trackRedDamage) {
        this.livingFlameDamage += event.amount;
        this.trackRedDamage = false;
        if (event.absorbed !== undefined) {
          this.livingFlameDamage += event.absorbed;
        }
      }
    }
    // FIXME:
    // This is kinda jank, since *technically* two Firestorms can be down at the same time, and this would then combine the values of both
    // But for now it's fine, since it's extremely rare to run Firestorm along with Iridescence in the first place, not including the unicorn cases of running the talents
    // That allows multiple Firestorms AND Iridescence at the same time.
    else if (
      event.ability.name === FIRESTORM_DAMAGE.name &&
      (this.trackRedDamage || event.timestamp > this.lastFirestormEvent + FIRESTORM_DURATION)
    ) {
      if (this.trackRedDamage) {
        this.firestormDamage += event.amount;
        if (this.trackRedDamage) {
          this.lastFirestormEvent = event.timestamp;
        }
        this.trackRedDamage = false;
        if (event.absorbed !== undefined) {
          this.firestormDamage += event.absorbed;
        }
      }
    }
  }

  statistic() {
    // Blue spells
    this.iridescenceDisintegrateDamage =
      this.disintegrateDamage - this.disintegrateDamage / (1 + IRIDESCENCE_MULTIPLIER);
    this.iridescenceAzureStrikeDamage =
      this.azureStrikeDamage - this.azureStrikeDamage / (1 + IRIDESCENCE_MULTIPLIER);
    this.iridescenceShatteringStarDamage =
      this.shatteringStarDamage - this.shatteringStarDamage / (1 + IRIDESCENCE_MULTIPLIER);
    this.iridescenceUnravelDamage =
      this.unravelDamage - this.unravelDamage / (1 + IRIDESCENCE_MULTIPLIER);
    // Red spells
    this.iridescencePyreDamage = this.pyreDamage - this.pyreDamage / (1 + IRIDESCENCE_MULTIPLIER);
    this.iridescenceLivingFlameDamage =
      this.livingFlameDamage - this.livingFlameDamage / (1 + IRIDESCENCE_MULTIPLIER);
    this.iridescenceFirestormDamage =
      this.firestormDamage - this.firestormDamage / (1 + IRIDESCENCE_MULTIPLIER);

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
