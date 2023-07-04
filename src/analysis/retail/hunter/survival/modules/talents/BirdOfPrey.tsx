import { t } from '@lingui/macro';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import {
  BOP_CA_EXTENSION_PER_CAST,
  RAPTOR_MONGOOSE_VARIANTS,
} from 'analysis/retail/hunter/survival/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/** Bird of Prey
 * Attacking your pet's target with Mongoose Bite, Raptor Strike, Butchery or Carve extends the duration of Coordinated Assault by  1.5 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=summary&source=19&translate=true
 */

class BirdOfPrey extends Analyzer {
  petTarget: string = '';
  playerTarget: string = '';
  coordinatedAssaultExtended = 0;
  wastedExtension = 0;
  timestampAoE = 0;
  targetsHitAoE: boolean[] = [];
  aoeChecked = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BIRDS_OF_PREY_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([...RAPTOR_MONGOOSE_VARIANTS, SPELLS.CARVE, TALENTS.BUTCHERY_TALENT]),
      this.onPlayerDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.CARVE, TALENTS.BUTCHERY_TALENT]),
      this.onAoECast,
    );
    this.addEventListener(Events.fightend, this.aoeCheck);
  }

  get birdPercentEffectiveness() {
    return {
      actual: this.percentExtension,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get timeExtendedInSeconds() {
    return this.coordinatedAssaultExtended / 1000;
  }

  get extensionTimeLostInSeconds() {
    return this.wastedExtension / 1000;
  }

  get percentExtension() {
    return (
      this.coordinatedAssaultExtended / (this.coordinatedAssaultExtended + this.wastedExtension)
    );
  }

  onAoECast() {
    this.aoeChecked = false;
  }

  onPetDamage(event: DamageEvent) {
    this.petTarget = encodeTargetString(event.targetID, event.targetInstance);
  }

  onPlayerDamage(event: DamageEvent) {
    if (
      !this.aoeChecked &&
      this.timestampAoE > 0 &&
      event.timestamp > this.timestampAoE + MS_BUFFER_100
    ) {
      this.aoeCheck();
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    const spellId = event.ability.guid;
    this.playerTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (spellId === SPELLS.CARVE.id || spellId === TALENTS.BUTCHERY_TALENT.id) {
      this.targetsHitAoE.push(this.playerTarget === this.petTarget);
      this.timestampAoE = event.timestamp;
    } else {
      if (this.playerTarget === this.petTarget) {
        this.coordinatedAssaultExtended += BOP_CA_EXTENSION_PER_CAST;
      } else {
        this.wastedExtension += BOP_CA_EXTENSION_PER_CAST;
      }
    }
  }

  aoeCheck() {
    if (this.targetsHitAoE.includes(true)) {
      this.coordinatedAssaultExtended += BOP_CA_EXTENSION_PER_CAST;
    } else {
      this.wastedExtension += BOP_CA_EXTENSION_PER_CAST;
    }
    this.targetsHitAoE = [];
    this.aoeChecked = true;
  }

  suggestions(when: When) {
    when(this.birdPercentEffectiveness).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When talented into <SpellLink spell={TALENTS.BIRDS_OF_PREY_TALENT} />, it's important to
          cast <SpellLink spell={TALENTS.RAPTOR_STRIKE_TALENT} />,{' '}
          <SpellLink spell={TALENTS.MONGOOSE_BITE_TALENT} />, <SpellLink spell={SPELLS.CARVE} /> or{' '}
          <SpellLink spell={TALENTS.BUTCHERY_TALENT} /> on the same target as your pet is attacking.
        </>,
      )
        .icon(TALENTS.BIRDS_OF_PREY_TALENT.icon)
        .actual(
          t({
            id: 'hunter.survival.suggestions.birdOfPrey.efficiency',
            message: `${formatPercentage(
              actual,
            )}% of abilities extending CA were used on your pets target`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>You extended Coordinated Assault by {this.timeExtendedInSeconds} seconds.</li>
              <li>
                You lost out on {this.extensionTimeLostInSeconds} seconds of Coordinated Assault by
                attacking a different target than your pet.
              </li>
            </ul>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.BIRDS_OF_PREY_TALENT}>
          <>
            <small>Extended CA by</small> {this.timeExtendedInSeconds}s
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BirdOfPrey;
