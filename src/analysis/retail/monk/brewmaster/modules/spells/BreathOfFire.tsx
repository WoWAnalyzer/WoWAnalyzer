import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Enemies, { encodeEventSourceString } from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import Abilities from '../Abilities';

const DEBUG_ABILITIES = false;

class BreathOfFire extends Analyzer {
  protected enemies!: Enemies;
  protected abilities!: Abilities;
  protected castEfficiency!: CastEfficiency;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.BREATH_OF_FIRE_DEBUFF.id) / this.owner.fightDuration;
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

  static dependencies = {
    enemies: Enemies,
    abilities: Abilities,
    castEfficiency: CastEfficiency,
  };
  hitsWithBoF = 0;
  hitsWithoutBoF = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.BREATH_OF_FIRE_TALENT);

    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    (options.abilities as Abilities).add({
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
    if (shouldIgnore(this.enemies, event)) {
      return;
    }
    const enemyId = encodeEventSourceString(event);
    if (!enemyId) {
      return;
    }
    const enemy = this.enemies.enemies[enemyId];
    if (enemy && enemy.hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
      this.hitsWithBoF += 1;
    } else {
      if (DEBUG_ABILITIES && event.ability.guid !== SPELLS.MELEE.id) {
        console.log('hit w/o bof', event);
      }
      this.hitsWithoutBoF += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> usage can be improved. The
          associated debuff is a key part of our damage mitigation.
        </>,
      )
        .icon(talents.BREATH_OF_FIRE_TALENT.icon)
        .actual(
          t({
            id: 'monk.brewmaster.suggestions.breathOfFire.hitsMitigated',
            message: `${formatPercentage(actual)}% of hits mitigated with Breath of Fire`,
          }),
        )
        .recommended(`> ${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default BreathOfFire;
