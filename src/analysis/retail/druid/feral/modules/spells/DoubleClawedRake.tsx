import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyDebuffEvent, DamageEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { isFromDoubleClawedRake } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const DEBUG = false;

/**
 * **Double-Clawed Rake**
 * Spec Talent
 *
 * Rake also applies Rake to 1 additional nearby target
 */
class DoubleClawedRake extends Analyzer {
  /** Set of targets for whom the last applied Rake was from DCR */
  targetsWithDcr: Set<string> = new Set<string>();

  /** Total tallied damage from DCR rakes */
  dcrDamage: number = 0;
  /** Additional Rakes applied by DCR */
  extraRakes: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onRakeApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onRakeApply,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onRakeDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAKE), this.onRakeDamage);
  }

  onRakeApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    if (isFromDoubleClawedRake(event)) {
      this.targetsWithDcr.add(encodeEventTargetString(event) || '');
      this.extraRakes += 1;
      DEBUG &&
        console.log(
          'Double-Clawed Rake apply on ' +
            encodeEventTargetString(event) +
            ' @ ' +
            this.owner.formatTimestamp(event.timestamp),
        );
    } else {
      this.targetsWithDcr.delete(encodeEventTargetString(event) || '');
    }
  }

  onRakeDamage(event: DamageEvent) {
    if (this.targetsWithDcr.has(encodeEventTargetString(event) || '')) {
      this.dcrDamage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the damage from Rake DoTs applied by Double-Clawed Rake. It is at best an
            approximation of this talent's impact because of opportunity cost factors (Without DCR
            you might have tab-Raked the 2nd target, with it you cast Swipe instead)
            <br />
            <br />
            Over the course of this encounter, <strong>{this.extraRakes}</strong> extra Rake DoTs
            were created by this talent, or{' '}
            <strong>{this.owner.getPerMinute(this.extraRakes).toFixed(1)} per minute</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT}>
          <ItemPercentDamageDone approximate amount={this.dcrDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DoubleClawedRake;
