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
import { formatDuration, formatDurationMinSec } from 'common/format';

class FontOfLife extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  totalHealing: number = 0;
  effectiveTFTCDR: number = 0;
  lastCastTimeStamp: number = -1;
  totalCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.FONT_OF_LIFE_TALENT);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ESSENCE_FONT_BUFF, SPELLS.FAELINE_STOMP_ESSENCE_FONT]),
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
    this.totalCasts += 1;
    const timeBetween = event.timestamp - this.lastCastTimeStamp;
    if (this.lastCastTimeStamp !== -1 && this.tftCooldown && timeBetween < this.tftCooldown) {
      this.effectiveTFTCDR += this.tftCooldown - timeBetween;
    }
    this.lastCastTimeStamp = event.timestamp;
  }

  get tftCooldown() {
    return this.abilities.getAbility(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)!.cooldown * 1000;
  }

  get averageCdr() {
    // didnt use any cdr
    if (this.totalCasts <= 1) {
      return 0;
    }
    return this.effectiveTFTCDR / this.totalCasts - 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>{formatDurationMinSec(this.effectiveTFTCDR / 1000)} total CDR</>}
      >
        <TalentSpellText talent={TALENTS_MONK.FONT_OF_LIFE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <div>
            <SpellIcon spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />{' '}
            {formatDuration(this.tftCooldown - this.averageCdr)} <small>average cooldown</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FontOfLife;
