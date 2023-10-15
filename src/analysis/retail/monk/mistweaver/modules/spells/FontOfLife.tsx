import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { FONT_OF_LIFE_BOOST } from '../../constants';
import Abilities from '../../modules/features/Abilities';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { formatDurationMinSec } from 'common/format';

class FontOfLife extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  totalHealing: number = 0;
  effectiveTFTCDR: number = 0;
  lastCastTimeStamp: number = -1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.FONT_OF_LIFE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.handleEFCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.handleTFTCast,
    );
  }

  handleEFCast(event: HealEvent) {
    if (event.tick) {
      return;
    }
    this.totalHealing += calculateEffectiveHealing(event, FONT_OF_LIFE_BOOST);
  }

  handleTFTCast(event: CastEvent) {
    const tft = this.abilities.getAbility(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id);
    const timeBetween = event.timestamp - this.lastCastTimeStamp;
    if (this.lastCastTimeStamp !== -1 && tft && timeBetween < tft.cooldown) {
      this.effectiveTFTCDR += tft.cooldown - timeBetween;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.FONT_OF_LIFE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <SpellIcon spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />{' '}
          {formatDurationMinSec(this.effectiveTFTCDR)} CDR
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FontOfLife;
