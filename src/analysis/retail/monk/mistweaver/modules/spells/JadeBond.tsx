import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
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
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
} from '../../constants';

const UNAFFECTED_SPELLS = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class JadeBond extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    hotTracker: HotTrackerMW,
  };
  protected hotTracker!: HotTrackerMW;
  healing = 0;
  envmHealing = 0;
  envmTicks = 0;
  envmOverhealing = 0;
  envmHealingIncrease = 0;
  extraEnvBonusHealing = 0;
  extraEnvBonusOverhealing = 0;

  boostAmount: number = JADE_BOND_INC;
  numHots = 0;

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

    this.envmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE
      : ENVELOPING_MIST_INCREASE;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvHeal,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);

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
    const targetID = event.targetID;
    if (
      !this.hotTracker.hots[targetID] ||
      !this.hotTracker.hots[targetID][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetID][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (this.hotTracker.fromJadeBond(hot)) {
      this.envmTicks += 1;
      this.envmHealing += event.amount + (event.absorbed ?? 0);
      this.envmOverhealing += event.overheal ?? 0;
    }
  }

  handleHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId) ||
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }

    const hot = this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (!this.hotTracker.fromJadeBond(hot)) {
      return;
    }
    this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
    this.extraEnvBonusOverhealing += calculateOverhealing(event, this.envmHealingIncrease);
  }

  get totalHealing() {
    return this.healing + this.envmHealing + this.extraEnvBonusHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> HoTs: {this.numHots}
            </li>
            <li>
              <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> extra ticks:{' '}
              {this.envmTicks}
            </li>
            <li>
              Extra <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> direct healing:{' '}
              {formatNumber(this.envmHealing)} ({formatNumber(this.envmOverhealing)} overheal)
            </li>
            <li>
              Bonus healing from <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> buff:{' '}
              {formatNumber(this.extraEnvBonusHealing)} (
              {formatNumber(this.extraEnvBonusOverhealing)} overheal)
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.JADE_BOND_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default JadeBond;
