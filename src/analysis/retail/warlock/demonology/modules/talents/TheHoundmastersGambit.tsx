import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';

const HOUNDMASTERS_GAMBIT_DAMAGE_MULTIPLIER = 0.5; // 50% increased damage

class TheHoundmastersGambit extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };
  demoPets!: DemoPets;

  empoweredDamageGain = 0; // Additional damage gained from the talent
  totalDreadstalkerDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.THE_HOUNDMASTERS_GAMBIT_TALENT);

    if (this.active) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.DREADBITE),
        this.onDreadstalkerDamage,
      );
    }
  }

  onDreadstalkerDamage(event: DamageEvent) {
    const damage = event.amount + (event.absorbed || 0);
    this.totalDreadstalkerDamage += damage;

    // Check if vilefiend is active at this timestamp
    const activePets = this.demoPets.timeline.getPetsAtTimestamp(event.timestamp);
    const vilefiendActive = activePets.some(
      (pet) =>
        pet.guid === PETS.VILEFIEND.guid ||
        pet.guid === PETS.CHARHOUND.guid ||
        pet.guid === PETS.GLOOMHOUND.guid,
    );

    if (vilefiendActive) {
      // Calculate the additional damage gained from the 50% increase
      this.empoweredDamageGain += calculateEffectiveDamage(
        event,
        HOUNDMASTERS_GAMBIT_DAMAGE_MULTIPLIER,
      );
    }
  }

  get vilefiendUptime() {
    let totalUptime = 0;
    const timeline = this.demoPets.timeline.timeline;

    for (const pet of timeline) {
      if (
        pet.guid === PETS.VILEFIEND.guid ||
        pet.guid === PETS.CHARHOUND.guid ||
        pet.guid === PETS.GLOOMHOUND.guid
      ) {
        const despawnTime = pet.realDespawn || pet.expectedDespawn;
        totalUptime += despawnTime - pet.spawn;
      }
    }

    return totalUptime / this.owner.fightDuration;
  }

  get damageIncreasePercentage() {
    if (this.totalDreadstalkerDamage === 0) return 0;
    return this.empoweredDamageGain / this.totalDreadstalkerDamage;
  }

  get activeVilefiendVariant() {
    const timeline = this.demoPets.timeline.timeline;

    for (const pet of timeline) {
      if (pet.guid === PETS.VILEFIEND.guid) {
        return 'Vilefiend';
      } else if (pet.guid === PETS.CHARHOUND.guid) {
        return 'Charhound';
      } else if (pet.guid === PETS.GLOOMHOUND.guid) {
        return 'Gloomhound';
      }
    }

    return 'None';
  }

  statistic() {
    const variant = this.activeVilefiendVariant;

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Houndmaster's Gambit Analysis:</strong>
            <ul>
              <li>
                {formatThousands(this.empoweredDamageGain)} additional damage gained from the talent
              </li>
              <li>{formatThousands(this.totalDreadstalkerDamage)} total Dreadstalker damage</li>
            </ul>
            <strong>Performance Metrics:</strong>
            <ul>
              <li>Vilefiend uptime: {formatPercentage(this.vilefiendUptime)}%</li>
              <li>
                Damage increase: {formatPercentage(this.damageIncreasePercentage)}% of total
                Dreadstalker damage
              </li>
              <li>
                <strong>Vilefiend variant used:</strong> {variant}
              </li>
            </ul>
            <p>
              <SpellLink spell={TALENTS.THE_HOUNDMASTERS_GAMBIT_TALENT} /> provides 50% increased
              damage to your Dreadstalkers when any Vilefiend variant is active. Higher uptime and
              better timing coordination will increase the damage gain from this talent.
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.THE_HOUNDMASTERS_GAMBIT_TALENT}>
          <ItemDamageDone amount={this.empoweredDamageGain} />
          <br />
          <small>
            {formatPercentage(this.damageIncreasePercentage)}% damage increase •{' '}
            {formatPercentage(this.vilefiendUptime)}% uptime
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TheHoundmastersGambit;
