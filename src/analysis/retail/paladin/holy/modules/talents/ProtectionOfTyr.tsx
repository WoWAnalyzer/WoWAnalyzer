import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { PROTECTION_OF_TYR_INCREASE } from '../../constants';

class ProtectionOfTyr extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  uniqueCombatants: number[] = [];
  auraMasteryCastsTotalHealing: number[] = [];
  auraMasteryCastsAmpedHealing: number[] = [];

  insideAuraMastery = false;
  healing = 0;
  overheal = 0;

  maxHeal = 0;
  minHeal = Infinity;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PROTECTION_OF_TYR_TALENT);

    this.addEventListener(Events.heal, this.onHeal);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.AURA_MASTERY),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AURA_MASTERY),
      this.onRemove,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.insideAuraMastery = true;
    this.auraMasteryCastsTotalHealing.push(0);
    this.auraMasteryCastsAmpedHealing.push(0);
  }

  onRemove(event: RemoveBuffEvent) {
    this.insideAuraMastery = false;
  }

  onHeal(event: HealEvent) {
    const combatant = this.combatants.getSourceEntity(event);
    if (!combatant || !this.insideAuraMastery || !combatant.hasBuff(SPELLS.DEVOTION_AURA)) {
      return;
    }

    if (!this.uniqueCombatants.includes(combatant.id)) {
      this.uniqueCombatants.push(combatant.id);
    }
    const totalHeal = event.amount + (event.absorb || 0);
    const effectiveHealing = calculateEffectiveHealing(event, PROTECTION_OF_TYR_INCREASE);
    const overhealing = calculateOverhealing(event, PROTECTION_OF_TYR_INCREASE);

    this.healing += effectiveHealing;
    this.overheal += overhealing;

    const index = this.auraMasteryCastsTotalHealing.length - 1;
    this.auraMasteryCastsTotalHealing[index] += totalHeal;
    this.auraMasteryCastsAmpedHealing[index] += effectiveHealing;

    if (totalHeal > 0 && (this.minHeal === 0 || totalHeal < this.minHeal)) {
      this.minHeal = totalHeal;
    }
    if (totalHeal > this.maxHeal) {
      this.maxHeal = totalHeal;
    }
  }

  // test report: 2twAy4WqnJjX3gZM

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.healing)} <br />
            Overhealing: {formatNumber(this.overheal)} <br />
            Unique Healers: {formatNumber(this.uniqueCombatants.length)} <br />
            <br />
            Healing During <SpellLink spell={SPELLS.AURA_MASTERY} /> Breakdown: <br />
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>Total Healing</th>
                  <th>Amped Healing</th>
                </tr>
              </thead>
              <tbody>
                {this.auraMasteryCastsTotalHealing.map((healing, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatNumber(healing)}</td>
                    <td>{formatNumber(this.auraMasteryCastsAmpedHealing[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            Minimum Heal: {formatNumber(this.minHeal)} <br />
            Maximum Heal: {formatNumber(this.maxHeal)} <br />
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PROTECTION_OF_TYR_TALENT}>
          <ItemHealingDone amount={this.healing} approximate />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ProtectionOfTyr;
