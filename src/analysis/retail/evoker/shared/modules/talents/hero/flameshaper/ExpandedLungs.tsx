import { EXPANDED_LUNG_INCREASE } from 'analysis/retail/evoker/shared/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class ExpandedLungs extends Analyzer {
  totalDamage: number = 0;
  totalHealing: number = 0;
  consumeFlameExtraDamage: number = 0;
  consumeFlameExtraHealing: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.EXPANDED_LUNGS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BREATH_DOT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONSUME_FLAME_DAMAGE),
      this.onConsumeFlame,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT)) {
      this.addEventListener(
        Events.heal
          .by(SELECTED_PLAYER)
          .spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO, SPELLS.DREAM_BREATH_FONT]),
        this.onHeal,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CONSUME_FLAME_HEAL),
        this.onConsumeFlame,
      );
    }
  }

  onDamage(event: DamageEvent) {
    if (event.tick) {
      this.totalDamage += calculateEffectiveDamage(event, EXPANDED_LUNG_INCREASE);
    }
  }

  onHeal(event: HealEvent) {
    if (event.tick) {
      this.totalHealing += calculateEffectiveHealing(event, EXPANDED_LUNG_INCREASE);
    }
  }

  onConsumeFlame(event: HealEvent | DamageEvent) {
    if (event.type === EventType.Heal) {
      this.consumeFlameExtraHealing += calculateEffectiveHealing(event, EXPANDED_LUNG_INCREASE);
    } else {
      this.consumeFlameExtraDamage += calculateEffectiveDamage(event, EXPANDED_LUNG_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}>
          {this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) ? (
            <TooltipElement
              content={
                <>
                  Extra <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> healing:{' '}
                  {formatNumber(this.consumeFlameExtraHealing)}
                </>
              }
            >
              <ItemHealingDone amount={this.totalHealing + this.consumeFlameExtraHealing} />
            </TooltipElement>
          ) : (
            <></>
          )}
          <div>
            <TooltipElement
              content={
                <>
                  Extra <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT} /> damage:{' '}
                  {formatNumber(this.consumeFlameExtraDamage)}
                </>
              }
            >
              <ItemDamageDone amount={this.totalDamage + this.consumeFlameExtraDamage} />
            </TooltipElement>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ExpandedLungs;
