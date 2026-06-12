import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import RiptideTracker from '../core/RiptideTracker';
import talents from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Module';
import Events, { ApplyBuffEvent, HealEvent, CastEvent } from 'parser/core/Events';
import { isFromPrimalTideCore } from '../../normalizers/EventLinkNormalizer';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';

class PrimalTideCore extends Analyzer {
  static dependencies = {
    riptideTracker: RiptideTracker,
    combatants: Combatants,
  };
  protected riptideTracker!: RiptideTracker;
  protected combatants!: Combatants;

  ptcProcs = 0;
  ptcHealing = 0;
  ptcOverhealing = 0;
  lastCastTimestamp = -1;
  lastCastTargetId = -1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.PRIMAL_TIDE_CORE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onRiptideCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onApplyRiptide,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onRiptideHeal,
    );
  }

    onRiptideCast(event: CastEvent) {
      this.lastCastTimestamp = event.timestamp;
      this.lastCastTargetId = event.targetID ?? -1; //idk a better way to work around the enforcement of >anyevent< in >event< even if I define a trait that fits the var decl.
}

    onApplyRiptide(event: ApplyBuffEvent) {
        if (isFromPrimalTideCore(event)) {
            // If this buff application is on the primary hardcast target, skip it!
            if (event.timestamp === this.lastCastTimestamp && event.targetID === this.lastCastTargetId) {
                return;
            }

            const targetId = event.targetID;
            const spellId = event.ability.guid;
            if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
                return;
            }
            this.ptcProcs += 1;
        }
    }

    onRiptideHeal(event: HealEvent) {
        const spellId = event.ability.guid;
        const targetId = event.targetID;

        if (event.tick) {
            if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
                return;
            }
            const riptide = this.riptideTracker.hots[targetId][spellId];
            if (this.riptideTracker.fromPrimalTideCore(riptide)) {
                this.ptcHealing += event.amount + (event.absorbed || 0);
                this.ptcHealing += event.overheal || 0;
            }
        } else if (isFromPrimalTideCore(event)) {
            // If the direct initial heal is hitting the primary hardcast target, skip it!
            if (event.timestamp === this.lastCastTimestamp && event.targetID === this.lastCastTargetId) {
                return;
            }
            this.ptcHealing += event.amount + (event.absorbed || 0);
            this.ptcHealing += event.overheal || 0;
        }
    }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is only showing the additional riptide healing gained from{' '}
            <SpellLink spell={talents.PRIMAL_TIDE_CORE_TALENT} />
          </>
        }
      >
        <TalentSpellText talent={talents.PRIMAL_TIDE_CORE_TALENT}>
          <ItemHealingDone amount={this.ptcHealing} />
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {this.ptcProcs}{' '}
          <small>
            additional <SpellLink spell={talents.RIPTIDE_TALENT} />
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PrimalTideCore;
