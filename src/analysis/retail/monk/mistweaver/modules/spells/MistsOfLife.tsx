import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
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
  extraEnvmApplications: number = 0;
  extraEnvmHealing: number = 0;
  extraEnvmOverHealing: number = 0;
  extraEnvmHits: number = 0;
  extraRemApplications: number = 0;
  extraRemHealing: number = 0;
  extraRemOverHealing: number = 0;
  extraRemHits: number = 0;
  extraVivCleaves: number = 0;
  extraVivHealing: number = 0;
  extraVivOverhealing: number = 0;
  envmHealingIncrease: number = 0;
  extraEnvBonusHealing: number = 0;
  lastVivifyCastTarget: number = 0;
  countedMainVivifyHit: boolean = false;

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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY),
      this.handleVivifyCast,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleVivify);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemApply,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
  }

  handleEnvApply(event: ApplyBuffEvent) {
    if (isFromMistsOfLife(event)) {
      this.numEnv += 1;
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
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
    }
  }

  handleRemApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraRemApplications += 1;
    }
  }

  handleRemHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraRemHealing += event.amount || 0;
      this.extraRemOverHealing += event.overheal || 0;
      this.extraRemHits += 1;
    }
  }

  handleVivifyCast(event: CastEvent) {
    this.lastVivifyCastTarget = event.targetID || 0;
    this.countedMainVivifyHit = false;
  }

  handleVivify(event: HealEvent) {
    const targetId = event.targetID;
    // only count cleave hit on main target
    if (targetId === this.lastVivifyCastTarget && !this.countedMainVivifyHit) {
      this.countedMainVivifyHit = true;
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromMistsOfLife(hot)) {
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
    }
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
              <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> extra hits:{' '}
              {this.extraRemHits}
            </li>
            <li>
              Extra <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> direct healing:{' '}
              {formatNumber(this.extraRemHealing)}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> cleaves: {this.extraVivCleaves}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> direct healing:{' '}
              {formatNumber(this.extraVivHealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MISTS_OF_LIFE_TALENT}>
          <ItemHealingDone
            amount={this.extraEnvmHealing + this.extraVivHealing + this.extraEnvBonusHealing}
          />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistsOfLife;
