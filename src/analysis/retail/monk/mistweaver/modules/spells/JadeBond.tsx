import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { JADE_BOND_INC, JADE_BOND_SOOB_INC } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isFromJadeBond } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

class JadeBond extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    hotTracker: HotTrackerMW,
  };
  protected hotTracker!: HotTrackerMW;
  healing: number = 0;
  envmHealing: number = 0;
  envmHits: number = 0;
  envmOverhealing: number = 0;

  boostAmount: number = JADE_BOND_INC;
  numHots: number = 0;

  /**
   * Chi Cocoons now apply Enveloping Mist for 4 seconds when they expire or are consumed,
   * and Chi-Ji's Gusts of Mists healing is increased by 20% and Yu'lon's Soothing Breath healing is increased by 500%
   */
  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_BOND_TALENT)) {
      this.active = false;
      return;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT)) {
      this.boostAmount = JADE_BOND_SOOB_INC;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI),
        this.normalizeBoost,
      );
    } else {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
        this.normalizeBoost,
      );
    }
  }

  normalizeBoost(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, this.boostAmount);
  }

  handleEnvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isFromJadeBond(event)) {
      this.numHots += 1;
    }
  }

  handleEnvHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (this.hotTracker.fromJadeBond(hot)) {
      this.envmHits += 1;
      this.envmHealing += event.amount + (event.absorbed ?? 0);
      this.envmOverhealing += event.overheal ?? 0;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.JADE_BOND_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default JadeBond;
