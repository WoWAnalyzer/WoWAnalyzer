import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ManaTea from './ManaTea';

class YulonsWhisper extends Analyzer {
  static dependencies = {
    manaTea: ManaTea,
  };
  healing = 0;
  healCount = 0;
  manaTea!: ManaTea;
  manaTeaCount = 0;
  energizingBrewActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.YULONS_WHISPER_TALENT);
    if (!this.active) {
      return;
    }
    this.energizingBrewActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.ENERGIZING_BREW_TALENT,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST), this.onMT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.YULONS_WHISPER_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.healCount += 1;
    this.healing += event.amount + (event.absorbed || 0);
  }

  onMT(event: CastEvent) {
    this.manaTeaCount += 1;
  }

  get totalStacksConsumed() {
    return this.manaTea.castTrackers.reduce((sum, acc) => sum + acc.stacksConsumed, 0);
  }

  get averageYWCount() {
    return this.healCount / (this.totalStacksConsumed + this.manaTeaCount); //yulons whisper triggers upon cast and ticks on each stack consumed
  }

  get avgHealPerCast() {
    return this.healing / this.manaTeaCount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
      >
        <TalentSpellText talent={TALENTS_MONK.YULONS_WHISPER_TALENT}>
          {formatNumber(this.avgHealPerCast)}{' '}
          <small>
            healing per <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> cast
          </small>
          <br />
          {this.averageYWCount.toFixed(2)} <small>average targets</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default YulonsWhisper;
