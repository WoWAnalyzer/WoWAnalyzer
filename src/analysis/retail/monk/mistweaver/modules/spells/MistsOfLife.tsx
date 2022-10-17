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
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';

const UNAFFECTED_SPELLS = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class MistsOfLife extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };
  hotTracker!: HotTrackerMW;
  combatants!: Combatants;
  numEnv: number = 0;
  extraEnvbApplications: number = 0;
  extraEnvbHealing: number = 0;
  extraEnvbOverHealing: number = 0;
  extraEnvbHits: number = 0;
  extraEnvmHealing: number = 0;
  extraEnvmOverHealing: number = 0;
  extraEnvmHits: number = 0;
  extraRemHealing: number = 0;
  extraRemOverHealing: number = 0;
  extraRemHits: number = 0;
  envmHealingIncrease: number = 0;
  extraEnvBonusHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MISTS_OF_LIFE_TALENT);
    if (!this.active) {
      return;
    }
    this.envmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT.id)
      ? 0.4
      : 0.3;
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvbApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvbHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
  }

  handleEnvApply(event: ApplyBuffEvent) {
    if (isFromMistsOfLife(event)) {
      this.numEnv += 1;
    }
  }

  handleEnvbApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.ENVELOPING_BREATH_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.ENVELOPING_BREATH_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraEnvbApplications += 1;
    }
  }

  handleEnvbHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.ENVELOPING_BREATH_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.ENVELOPING_BREATH_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraEnvbHits += 1;
      this.extraEnvbHealing += event.amount || 0;
      this.extraEnvbOverHealing += event.overheal || 0;
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
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraEnvmHits += 1;
      this.extraEnvmHealing += event.amount || 0;
      this.extraEnvmOverHealing += event.overheal || 0;
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
    if (!this.hotTracker.fromMistsOfLife(hot)) {
      return;
    }
    this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
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
              <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> extra hits:{' '}
              {this.extraEnvmHits}
            </li>
            <li>
              Extra <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> direct healing:{' '}
              {formatNumber(this.extraEnvmHealing)}
            </li>
            <li>
              Bonus healing from <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> buff:
              {formatNumber(this.extraEnvBonusHealing)}
            </li>
            <li>
              <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} /> extra hits:{' '}
              {this.extraEnvbHits}
            </li>
            <li>
              Extra <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} /> direct healing:{' '}
              {formatNumber(this.extraEnvbHealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MISTS_OF_LIFE_TALENT}>
          <ItemHealingDone
            amount={this.extraEnvmHealing + this.extraEnvbHealing + this.extraEnvBonusHealing}
          />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistsOfLife;
