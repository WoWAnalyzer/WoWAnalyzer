import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';

class WitheringFire extends Analyzer {
  damage = 0;
  readonly activeBlackArrowTalent;
  casts = 0;
  witheringCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WITHERING_FIRE_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT)) {
      this.activeBlackArrowTalent = TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT;
    } else if (this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT)) {
      this.activeBlackArrowTalent = TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT;
    } else {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.activeBlackArrowTalent),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.casts++;

    if (this.selectedCombatant.hasBuff(SPELLS.WITHERING_FIRE_BUFF)) {
      this.witheringCasts++;
      addEnhancedCastReason(event, 'Withering Fire was active');
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.WITHERING_FIRE_TALENT}>
          {formatNumber(this.witheringCasts)} / {formatNumber(this.casts)}{' '}
          <small>
            casts of <SpellLink spell={this.activeBlackArrowTalent!} />
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WitheringFire;
