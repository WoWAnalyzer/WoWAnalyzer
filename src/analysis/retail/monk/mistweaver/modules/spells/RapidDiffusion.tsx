import HotTrackerMW from '../core/HotTrackerMW';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isFromRapidDiffusion } from '../../normalizers/CastLinkNormalizer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';

class RapidDiffusion extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };

  protected hotTracker!: HotTrackerMW;
  numExtraRems: number = 0;
  extraRemHeal: number = 0;
  extraVivCleaves: number = 0;
  extraVivHealing: number = 0;
  extraVivOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.handleRemHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleVivify);
  }

  handleRemApply(event: ApplyBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    if (isFromRapidDiffusion(event)) {
      this.numExtraRems += 1;
    }
  }

  handleRemHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot.attributions)) {
      this.extraRemHeal += event.amount || 0;
    }
  }

  handleVivify(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot.attributions)) {
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
              Extra <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> procs:{' '}
              {this.numExtraRems}
            </li>
            <li>
              Direct healing from extra <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />:{' '}
              {formatNumber(this.extraRemHeal)}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> cleaves: {this.extraVivCleaves}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> healing:{' '}
              {formatNumber(this.extraVivHealing)}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> overhealing:{' '}
              {formatNumber(this.extraVivOverhealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.RAPID_DIFFUSION_TALENT}>
          <ItemHealingDone amount={this.extraVivHealing + this.extraRemHeal} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RapidDiffusion;
