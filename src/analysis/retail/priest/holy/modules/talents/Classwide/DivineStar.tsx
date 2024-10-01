import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
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
import EOLAttrib from '../../core/EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

// Example Log: /report/mWZ6TG9JgjPQVdbA/9-Mythic+Zek'voz+-+Kill+(7:24)/1-Allyseia`Ø
class DivineStar extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  divineStarDamage = 0;
  divineStarHealing = 0;
  divineStarOverhealing = 0;
  divineStarCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_STAR_SHARED_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DIVINE_STAR_HEAL, SPELLS.DIVINE_STAR_DAMAGE]),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_STAR_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_STAR_SHARED_TALENT),
      this.onCast,
    );
  }

  onDamage(event: DamageEvent) {
    // For some reason there are heals that are recoeded as damaging spells. I don't know what's up with that.
    this.divineStarDamage += event.amount || 0;
  }

  onHeal(event: HealEvent) {
    this.divineStarHealing += event.amount + (event.absorbed || 0);
    this.divineStarOverhealing += event.overheal || 0;
    this.eolContrib += this.eolAttrib.getEchoOfLightHealingAttrib(event);
  }

  onCast(event: CastEvent) {
    this.divineStarCasts += 1;
  }

  get guideSubsectionHoly(): JSX.Element {
    // if player isn't running divine star, don't show guide section
    if (!this.selectedCombatant.hasTalent(TALENTS.DIVINE_STAR_SHARED_TALENT)) {
      return <></>;
    }
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.DIVINE_STAR_SHARED_TALENT} />
          </b>{' '}
          is a strong group heal on a short length cooldown. You will want to cast this on cooldown,
          only holding it for a few seconds if everyone is full health and you know group damage
          will happen soon.
        </p>
        <p>
          This spell will only perform well if you are casting it on cooldown and your raid is
          stacked together for most of the fight. If you are struggling to cast this on cooldown, or
          are on a fight with a lot of spread out healing, try swapping to Halo instead.
        </p>
      </>
    );

    const data = <CastEfficiencyPanel spell={TALENTS.DIVINE_STAR_SHARED_TALENT} useThresholds />;

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
              <SpellLink spell={TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.divineStarHealing}></ItemPercentHealingDone>
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.DIVINE_STAR_SHARED_TALENT}>
          <>
            <ItemHealingDone amount={this.divineStarHealing + this.eolContrib} />
            <br />
            <ItemDamageDone amount={this.divineStarDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineStar;
