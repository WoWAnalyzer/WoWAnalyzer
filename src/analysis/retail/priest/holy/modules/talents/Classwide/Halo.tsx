import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/priest/holy/Guide';
import { TALENTS_PRIEST } from 'common/TALENTS';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/**
 * Halo
 * Creates a ring of Shadow energy around you that quickly expands to a 40 yd radius, healing allies for (161% of Spell Power) and dealing [(144.2% of Spell Power) * 1 * 1 * 1] Shadow damage to enemies.
 * Healing reduced beyond 5 targets.
 */

class Halo extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  haloDamage = 0;
  haloHealing = 0;
  haloOverhealing = 0;
  haloCasts = 0;

  constructor(options: Options) {
    super(options);
    //Disable this module if Archon Hero tree is selected
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_PRIEST.HALO_HOLY_TALENT) &&
      !this.selectedCombatant.hasTalent(TALENTS_PRIEST.POWER_SURGE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HALO_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HALO_HEAL), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.HALO_HOLY_TALENT), this.onCast);
  }

  onDamage(event: DamageEvent) {
    this.haloDamage += event.amount || 0;
  }

  onHeal(event: HealEvent) {
    this.haloHealing += event.amount + (event.absorbed || 0);
    this.haloOverhealing += event.overheal || 0;
    this.eolContrib += this.eolAttrib.getEchoOfLightHealingAttrib(event);
  }

  onCast(event: CastEvent) {
    this.haloCasts += 1;
  }

  get guideSubsectionHoly(): JSX.Element {
    // if player isn't running halo, don't show guide section
    if (!this.selectedCombatant.hasTalent(TALENTS_PRIEST.HALO_HOLY_TALENT)) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_PRIEST.HALO_HOLY_TALENT} />
        </b>{' '}
        is a strong group heal on a medium length cooldown. You will want to cast this whenever the
        majority of the raid is injured. However, do not hold on to this cooldown too long to not
        miss any potential casts.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_PRIEST.HALO_HOLY_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        tooltip={
          <>
            Breakdown:{' '}
            <div>
              <SpellLink spell={TALENTS_PRIEST.HALO_HOLY_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.haloHealing}></ItemPercentHealingDone>
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.HALO_HOLY_TALENT}>
          <ItemHealingDone amount={this.haloHealing + this.eolContrib} />
          {/* oxlint-disable-next-line @wowanalyzer/no-br */}
          <br />
          <ItemDamageDone amount={this.haloDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Halo;
