import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const BOOMING_VOICE_DAMAGE_INCREASE = 0.2;
const BOOMING_VOICE_RAGE_GENERATION = 30;

class BoomingVoice extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  rageGenerated = 0;
  rageWasted = 0;
  bonusDmg = 0;
  maxRage = 100;
  nextCastWasted = 0;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BOOMING_VOICE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMORALIZING_SHOUT),
      this.onShoutCast,
    );
    this.addEventListener(
      Events.resourcechange.to(SELECTED_PLAYER).spell(TALENTS.BOOMING_VOICE_TALENT),
      this.onShoutEnergize,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onShoutCast(event: CastEvent) {
    if (this.nextCastWasted === 0) {
      return;
    }

    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = `This cast wasted ${this.nextCastWasted} Rage.`;
    this.nextCastWasted = 0;
  }

  onShoutEnergize(event: ResourceChangeEvent) {
    this.rageGenerated += event.resourceChange;
    const waste = event.waste || 0;
    this.rageWasted += waste;
    // on_energize event happens before the cast-event
    this.nextCastWasted = waste;
  }

  onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.DEMORALIZING_SHOUT.id)) {
      this.bonusDmg += calculateEffectiveDamage(event, BOOMING_VOICE_DAMAGE_INCREASE);
    }
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.rageWasted,
      isGreaterThan: {
        minor: 0,
        average: 10,
        major: 20,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted Rage by casting <SpellLink spell={SPELLS.DEMORALIZING_SHOUT} /> with more than{' '}
          {this.maxRage - BOOMING_VOICE_RAGE_GENERATION} Rage.
        </>,
      )
        .icon(TALENTS.BOOMING_VOICE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'warrior.protection.suggestions.boominVoice.rage.wasted',
            message: `${actual} Rage wasted`,
          }),
        )
        .recommended(`<${recommended} wasted Rage is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.BOOMING_VOICE_TALENT} /> Damage
            </>
          }
        >
          <ItemDamageDone amount={this.bonusDmg} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default BoomingVoice;
