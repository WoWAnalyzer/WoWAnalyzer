import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Enemies, { encodeEventSourceString } from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { Abilities } from '../../gen';

const DEBUG_ABILITIES = false;

class BreathOfFire extends Analyzer.withDependencies({
  enemies: Enemies,
  abilities: Abilities,
  castEfficiency: CastEfficiency,
}) {
  get uptime() {
    return (
      this.deps.enemies.getBuffUptime(SPELLS.BREATH_OF_FIRE_DEBUFF.id) / this.owner.fightDuration
    );
  }

  get mitigatedHits() {
    return this.hitsWithBoF / (this.hitsWithBoF + this.hitsWithoutBoF);
  }

  get suggestionThreshold() {
    return {
      actual: this.mitigatedHits,
      // max possible now is 0.8 w/o shenanigans
      isLessThan: {
        minor: 0.7,
        average: 0.6,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  hitsWithBoF = 0;
  hitsWithoutBoF = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.BREATH_OF_FIRE_TALENT);

    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.deps.abilities.add({
      spell: talents.BREATH_OF_FIRE_TALENT.id,
      isDefensive: true,
      buffSpellId: SPELLS.BREATH_OF_FIRE_DEBUFF.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      castEfficiency: {
        maxCasts: this.selectedCombatant.hasTalent(talents.SALSALABIMS_STRENGTH_TALENT)
          ? () =>
              ((options.castEfficiency as CastEfficiency).getCastEfficiencyForSpell(
                talents.KEG_SMASH_TALENT,
              )?.maxCasts ?? 0) + 1
          : undefined,
      },
      cooldown: 15,
      gcd: {
        static: 1000,
      },
    });
  }

  onDamageTaken(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (shouldIgnore(this.deps.enemies, event)) {
      return;
    }
    const enemyId = encodeEventSourceString(event);
    if (!enemyId) {
      return;
    }
    const enemy = this.deps.enemies.enemies[enemyId];
    if (enemy && enemy.hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
      this.hitsWithBoF += 1;
    } else {
      if (DEBUG_ABILITIES && event.ability.guid !== SPELLS.MELEE.id) {
        console.log('hit w/o bof', event);
      }
      this.hitsWithoutBoF += 1;
    }
  }
}

export default BreathOfFire;
