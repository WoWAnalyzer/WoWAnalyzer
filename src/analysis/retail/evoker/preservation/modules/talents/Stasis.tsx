import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ECHO_HEALS } from '../../constants';
import { isEchoHealFromStasis, isFromStasis } from '../../normalizers/CastLinkNormalizer';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';

class Stasis extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
  };

  protected hotTracker!: HotTrackerPrevoker;

  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT.id);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, TALENTS_EVOKER.REVERSION_TALENT]),
      this.handleHotHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ECHO_HEALS), this.handleEchoHeal);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STASIS_BUFF),
      this.onBuffRemoval,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.EMERALD_BLOSSOM,
          SPELLS.SPIRITBLOOM,
          SPELLS.SPIRITBLOOM_SPLIT,
          SPELLS.LIVING_FLAME_HEAL,
          SPELLS.DREAM_BREATH,
          SPELLS.VERDANT_EMBRACE_HEAL,
        ]),
      this.handleRegularHeal,
    );
  }

  handleHotHeal(event: HealEvent) {
    if (this.hotTracker.isFromStasis(event)) {
      this.totalHealing += event.amount;
      this.totalOverhealing += event.overheal || 0;
    }
  }

  handleEchoHeal(event: HealEvent) {
    if (!isEchoHealFromStasis(event)) {
      return;
    }
    this.totalHealing += event.amount;
    this.totalOverhealing += event.overheal || 0;
  }

  handleRegularHeal(event: HealEvent) {
    if (!isFromStasis(event)) {
      return;
    }
    this.totalHealing += event.amount;
    this.totalOverhealing += event.overheal || 0;
  }

  onBuffRemoval(event: RemoveBuffEvent) {
    console.log(event._linkedEvents);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.STASIS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Stasis;
