import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const RANGE_WHERE_YOU_SHOULDNT_DC = 12; // yrd

interface DeathsCaressCast {
  timestamp: number;
  hadAnotherRangedSpell: boolean;
  playerPosition: {
    x?: number;
    y?: number;
  };
  enemyPosition: {
    x?: number;
    y?: number;
  };
}

class DeathsCaress extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  dcCasts = 0;
  cast: DeathsCaressCast[] = [];

  DD_ABILITY: Spell = SPELLS.DEATH_AND_DECAY;

  spellsThatShouldBeUsedFirst = [this.DD_ABILITY.id];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATHS_CARESS), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATHS_CARESS),
      this.onDamage,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.BLOODDRINKER_TALENT)) {
      this.spellsThatShouldBeUsedFirst.push(TALENTS.BLOODDRINKER_TALENT.id);
    }
  }

  onCast(event: CastEvent) {
    const hadAnotherRangedSpell = this.spellsThatShouldBeUsedFirst.some((spellId) =>
      this.spellUsable.isAvailable(spellId),
    );
    this.dcCasts += 1;

    this.cast.push({
      timestamp: event.timestamp,
      hadAnotherRangedSpell: hadAnotherRangedSpell,
      playerPosition: {
        x: event.x,
        y: event.y,
      },
      enemyPosition: {
        x: 0,
        y: 0,
      },
    });
  }

  onDamage(event: DamageEvent) {
    if (this.cast.length === 0) {
      return;
    }

    this.cast[this.cast.length - 1].enemyPosition = {
      x: event.x,
      y: event.y,
    };
  }

  calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  get badDcCasts() {
    let badCasts = 0;

    this.cast.forEach(({ enemyPosition, playerPosition, hadAnotherRangedSpell }) => {
      //only happens when the target died before the damage event occurs
      // if we don't have enemy/player position, can't even determine if it was a bad cast or no
      if (!enemyPosition.x || !enemyPosition.y || !playerPosition.x || !playerPosition.y) {
        return;
      }

      const distance = this.calculateDistance(
        enemyPosition.x,
        enemyPosition.y,
        playerPosition.x,
        playerPosition.y,
      );
      if (distance <= RANGE_WHERE_YOU_SHOULDNT_DC || hadAnotherRangedSpell) {
        // close to melee-range => bad || when another ranged spell was available
        badCasts += 1;
      }
    });

    return badCasts;
  }
}

export default DeathsCaress;
