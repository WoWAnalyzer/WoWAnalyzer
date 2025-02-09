import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/shaman/restoration/constants';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS';

const AMPLIFICATION_CORE_HEALING_INCREASE = 0.03;
const SURGING_TOTEM_DURATION = 24000;

export default class AmplificationCore extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  lastSurgingTotemCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AMPLIFICATION_CORE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SURGING_TOTEM),
      this.onSurgingTotemCast,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    if (event.timestamp - this.lastSurgingTotemCast < SURGING_TOTEM_DURATION) {
      this.healingDoneFromTalent += calculateEffectiveHealing(
        event,
        AMPLIFICATION_CORE_HEALING_INCREASE,
      );
      this.overhealingDoneFromTalent += calculateOverhealing(
        event,
        AMPLIFICATION_CORE_HEALING_INCREASE,
      );
    }
  }

  onSurgingTotemCast(event: CastEvent) {
    this.lastSurgingTotemCast = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.AMPLIFICATION_CORE_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
