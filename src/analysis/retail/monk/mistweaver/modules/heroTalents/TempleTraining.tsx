import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TEMPLE_TRAINING_INCREASE } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const AFFECTED_SPELLS = [
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  // SPELLS.ENVELOPING_MIST_TFT, bugged, does not work :3
  SPELLS.VIVIFY,
  TALENTS_MONK.SHEILUNS_GIFT_TALENT,
];

class TempleTraining extends Analyzer {
  talent = TALENTS_MONK.TEMPLE_TRAINING_TALENT;
  healingBySpell = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS), this.onHeal);
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    this.healingBySpell.set(
      spellId,
      (this.healingBySpell.get(spellId) || 0) +
        calculateEffectiveHealing(event, TEMPLE_TRAINING_INCREASE),
    );
  }

  get healing() {
    return Array.from(this.healingBySpell.values()).reduce((sum, healing) => sum + healing, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {AFFECTED_SPELLS.filter((spell) => this.healingBySpell.has(spell.id)).map((spell) => (
              <div>
                <SpellLink spell={spell} /> additional healing:{' '}
                {formatNumber(this.healingBySpell.get(spell.id) || 0)} (
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(
                    this.healingBySpell.get(spell.id) || 0,
                  ),
                )}
                %)
              </div>
            ))}
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TempleTraining;
