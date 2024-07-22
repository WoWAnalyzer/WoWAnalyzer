import SPELLS from 'common/SPELLS/classic/hunter';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { KILL_SHOT_EXECUTE_RANGE } from './constants';
import { KILL_SHOT_DAMAGE } from './KillShotNormalizer';

const KILL_SHOT_COOLDOWN = 10;
// Glyph of Kill Command resets the cooldown if the damage does not kill a target with a 6s ICD.
const GLYPH_RESET_COOLDOWN = 6000;

class KillShot extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = KILL_SHOT_EXECUTE_RANGE;
  static modifiesDamage = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts: number = 1;

  activeKillShotSpell = SPELLS.KILL_SHOT;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = true;

    this.addEventListener(Events.fightend, this.adjustMaxCasts);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KILL_SHOT),
      this._handleKillShotReset,
    );
    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(this.activeKillShotSpell);

    (options.abilities as Abilities).add({
      spell: SPELLS.KILL_SHOT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      charges: 1,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  private lastResetTime = 0;
  private _handleKillShotReset(event: CastEvent) {
    const damageEvent = GetRelatedEvent<DamageEvent>(event, KILL_SHOT_DAMAGE);
    if (
      damageEvent &&
      (damageEvent.overkill === undefined || damageEvent.overkill === 0) &&
      damageEvent.timestamp - this.lastResetTime > GLYPH_RESET_COOLDOWN
    ) {
      this.spellUsable.endCooldown(this.activeKillShotSpell.id);
      // note that we use the *current timestamp* as the reset time.
      // the cooldown reset resolves before the damage is logged (e.g. we can get cast -> cast -> damage -> damage)
      // so this plays better with the logged data.
      this.lastResetTime = event.timestamp;
    }
  }

  adjustMaxCasts() {
    // the glyph basically lets you shoot twice every time the normal cooldown recovers
    this.maxCasts += Math.ceil((this.totalExecuteDuration / (KILL_SHOT_COOLDOWN * 1000)) * 2);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={this.activeKillShotSpell}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillShot;
