import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { isFromMistsOfLife } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import HotTracker from 'parser/shared/modules/HotTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

const UNAFFECTED_SPELLS = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class MistsOfLife extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };
  hotTracker!: HotTrackerMW;
  combatants!: Combatants;
  numEnv = 0;
  extraEnvmHealing = 0;
  extraEnvmOverHealing = 0;
  extraEnvmAbsorbed = 0;
  extraMistyPeaksHealing = 0;
  extraRemApplications = 0;
  extraRemHealing = 0;
  extraRemOverHealing = 0;
  extraRemAbsorbed = 0;
  extraVivCleaves = 0;
  extraVivHealing = 0;
  extraVivOverhealing = 0;
  extraVivAbsorbed = 0;
  envmHealingIncrease = 0;
  extraEnvBonusHealing = 0;
  lastVivifyCastTarget = 0;
  countedMainVivifyHit = false;
  MistsOfLifeAttrib = HotTracker.getNewAttribution('Mists of Life');

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MISTS_OF_LIFE_TALENT);
    if (!this.active) {
      return;
    }
    this.envmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? 0.4
      : 0.3;
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

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_MISTS_HEAL),
      this.handleInvigoratingMistHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemApply,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
  }

  handleEnvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isFromMistsOfLife(event)) {
      const playerId = event.targetID;
      if (
        !this.hotTracker.hots[playerId] ||
        !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
      ) {
        return;
      }
      this.hotTracker.addAttributionFromApply(this.MistsOfLifeAttrib, event);
      this.numEnv += 1;
    }
  }

  handleEnvHeal(event: HealEvent) {
    //handle envelop healing from MoL
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }

    const hot = this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraEnvmHealing += event.amount || 0;
      this.extraEnvmOverHealing += event.overheal || 0;
      this.extraEnvmAbsorbed += event.absorbed || 0;
    }
    //track misty peaks procs from MoL ReM
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const remHot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(remHot)) {
      if (this.hotTracker.fromMistyPeaks(hot)) {
        this.extraMistyPeaksHealing += event.amount + (event.absorbed || 0);
      }
    }
  }

  handleHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !this.hotTracker.hots[targetId] ||
      (!this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id] &&
        !this.hotTracker.hots[targetId][SPELLS.ENVELOPING_MIST_TFT.id])
    ) {
      return;
    }

    const hot = this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
    }
  }

  handleRemApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isFromMistsOfLife(event)) {
      const targetId = event.targetID;
      if (
        !this.hotTracker.hots[targetId] ||
        !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
      ) {
        return;
      }
      this.extraRemApplications += 1;
    }
  }

  handleRemHeal(event: HealEvent) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraRemHealing += event.amount || 0;
      this.extraRemOverHealing += event.overheal || 0;
      this.extraRemAbsorbed += event.absorbed || 0;
    }
  }

  handleInvigoratingMistHeal(event: HealEvent) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
    }
  }

  get totalHealing() {
    return (
      this.extraEnvmHealing +
      this.extraVivHealing +
      this.extraEnvBonusHealing +
      this.extraRemHealing +
      this.extraEnvmAbsorbed +
      this.extraRemAbsorbed +
      this.extraVivAbsorbed
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MISTS_OF_LIFE_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              Extra <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> direct healing:{' '}
              {formatNumber(this.extraEnvmHealing)}
            </li>
            <li>
              Bonus healing from <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> buff:{' '}
              {formatNumber(this.extraEnvBonusHealing)}
            </li>
            <li>
              Extra <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> direct healing:{' '}
              {formatNumber(this.extraRemHealing)}
            </li>
            <li>
              Extra <SpellLink spell={SPELLS.VIVIFY} /> cleaves: {this.extraVivCleaves}
            </li>
            <li>
              Extra <SpellLink spell={SPELLS.VIVIFY} /> direct healing:{' '}
              {formatNumber(this.extraVivHealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MISTS_OF_LIFE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistsOfLife;
