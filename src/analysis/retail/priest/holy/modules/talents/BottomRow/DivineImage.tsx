import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent, SummonEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DEBUG = false;

class DivineImage extends Analyzer {
  totalProcs = 0;
  totalHealing = 0;
  totalOverhealing = 0;
  totalDamage = 0;

  // For debugging spells that we should count.
  healingSpells: { [spellId: number]: string } = {};
  damagingSpells: { [spellId: number]: string } = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_IMAGE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onByPlayerPetHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onByPlayerPetDamage);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onByPlayerSummon);
  }

  onByPlayerPetHeal(event: HealEvent) {
    // ignore leech from shadowfiend melee swings
    if (event.ability.guid === 143924) {
      return;
    }

    this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
    this.totalOverhealing += event.overheal || 0;

    if (DEBUG) {
      this.healingSpells[event.ability.guid] = event.ability.name;
    }
  }

  onByPlayerPetDamage(event: DamageEvent) {
    // ignore melee swings from shadowfiend
    if (event.ability.guid === -32) {
      return;
    }
    this.totalDamage += (event.amount || 0) + (event.absorbed || 0);

    if (DEBUG) {
      this.damagingSpells[event.ability.guid] = event.ability.name;
    }
  }

  onByPlayerSummon(event: SummonEvent) {
    if (event.ability.guid === 392990) {
      this.totalProcs += 1;
    }
  }

  statistic() {
    DEBUG && console.log('Healing Spells', this.healingSpells);
    DEBUG && console.log('Damaging Spells', this.damagingSpells);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Images Summoned: {this.totalProcs}
            <div>
              Bonus Healing Done: {formatNumber(this.totalHealing)} (
              {formatPercentage(
                this.totalOverhealing / (this.totalHealing + this.totalOverhealing),
              )}
              % OH)
            </div>
            <br />
            <div>
              Notably this talent does not contribute to{' '}
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.DIVINE_IMAGE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineImage;
