import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { SPELLS_THAT_PROC_S1_4PC_HOLY } from '../../constants';
import { TIERS } from 'game/TIERS';
import HolyTWW4pS1 from './HolyTWW4pcS1';
import SpellLink from 'interface/SpellLink';

class HolyTWW4pS1Display extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    holyTWW4pS1: HolyTWW4pS1,
  };

  protected combatants!: Combatants;

  protected holyTWW4pS1!: HolyTWW4pS1;

  flashHealProcs = 0;
  healProcs = 0;
  pohProcs = 0;

  totalFlashHealing = 0;
  totalHealHealing = 0;
  totalPohHealing = 0;

  totalEolHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS_THAT_PROC_S1_4PC_HOLY),
      this.handleCast,
    );
  }

  handleCast(event: CastEvent) {
    if (!this.holyTWW4pS1.is4pcProc(event)) {
      return;
    }
    if (event.ability.guid === TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id) {
      this.pohProcs += 1;
      const tempHealNum = this.holyTWW4pS1.get4pcHealing(event);
      this.totalPohHealing += tempHealNum[0];
      this.totalEolHealing += tempHealNum[1];
    } else if (event.ability.guid === SPELLS.GREATER_HEAL.id) {
      this.healProcs += 1;
      const tempHealNums = this.holyTWW4pS1.get4pcHealing(event);
      this.totalHealHealing += tempHealNums[0];
      this.totalEolHealing += tempHealNums[1];
    } else if (event.ability.guid === SPELLS.FLASH_HEAL.id) {
      this.flashHealProcs += 1;
      const tempHealNums = this.holyTWW4pS1.get4pcHealing(event);
      this.totalFlashHealing += tempHealNums[0];
      this.totalEolHealing += tempHealNums[1];
    }
  }

  get totalHealing() {
    return (
      this.totalHealHealing + this.totalPohHealing + this.totalFlashHealing + this.totalEolHealing
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            {' '}
            Breakdown:{' '}
            {this.selectedCombatant.hasTalent(TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT) && (
              <div>
                <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} />:{' '}
                <ItemPercentHealingDone amount={this.totalPohHealing} /> from {this.pohProcs} procs
              </div>
            )}
            <div>
              <SpellLink spell={SPELLS.GREATER_HEAL} />:{' '}
              <ItemPercentHealingDone amount={this.totalHealHealing} /> from {this.healProcs} procs
            </div>
            <div>
              <SpellLink spell={SPELLS.FLASH_HEAL} />:{' '}
              <ItemPercentHealingDone amount={this.totalFlashHealing} /> from {this.flashHealProcs}{' '}
              procs
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.totalEolHealing} /> procs
            </div>
            <br />
            <div>
              Notably this module only tallies the heals directly associated with 4PC and not any{' '}
              other additional effects such as{' '}
              <SpellLink spell={TALENTS_PRIEST.BINDING_HEALS_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_PRIEST.TRAIL_OF_LIGHT_TALENT} /> amongst others, which
              undervalues it.
            </div>
            <br />
            <div>See the module at the top of the page for CDR.</div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HOLY_PRIEST_TWW_4PC_DISPLAY}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HolyTWW4pS1Display;
