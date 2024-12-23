import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
/**
 * You and your pet leap to the target and strike it as one, dealing a total of X Physical damage.
 * Deals Damage and generates 2 stacks of Tip of the Spear.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/QMJcFAdTXKhgpnbx#fight=2&type=damage-done&source=16&ability=259516
 */

class FlankingStrike extends Analyzer {
  private damage: number = 0;

  private flankingStrikes: Array<{
    name: string;
    sourceID: number;
    damage: number;
    effectiveFocus: number;
    possibleFocus: number;
  }> = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT);
    if (!this.active) {
      return;
    }

    this.flankingStrikes.push({
      name: this.selectedCombatant.name,
      sourceID: this.owner.playerId,
      damage: 0,
      effectiveFocus: 0,
      possibleFocus: 0,
    });

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.FLANKING_STRIKE_PET),
      this.onPetDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLANKING_STRIKE_PLAYER),
      this.onPlayerDamage,
    );
  }

  get flankingStrikesPlayer() {
    return (
      this.flankingStrikes.find(
        (item: { sourceID: number }) => item.sourceID === this.owner.playerId,
      ) || this.flankingStrikes[0]
    );
  }

  getOrInitializePet(petId: number) {
    const foundPet = this.flankingStrikes.find(
      (pet: { sourceID: number }) => pet.sourceID === petId,
    );
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find((pet: { id: number }) => pet.id === petId);
      if (!sourcePet) {
        return;
      }
      const pet = {
        name: sourcePet.name,
        sourceID: petId,
        damage: 0,
        effectiveFocus: 0,
        possibleFocus: 0,
      };
      this.flankingStrikes.push(pet);
      return pet;
    }
    return foundPet;
  }

  onPetDamage(event: DamageEvent) {
    const damage = event.amount + (event.absorbed || 0);
    const pet = this.getOrInitializePet(event.sourceID as number);
    if (!pet) {
      return;
    }
    pet.damage += damage;
  }

  onPlayerDamage(event: DamageEvent) {
    this.flankingStrikesPlayer.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const totalDamage = this.flankingStrikes
      .map((source: { damage: number }) => source.damage)
      .reduce((total: number, current: number) => total + current, 0);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Damage</th>
                  <th>Focus</th>
                </tr>
              </thead>
              <tbody>
                {this.flankingStrikes.map(
                  (
                    source: {
                      name: string;
                      damage: number;
                      effectiveFocus: number;
                      possibleFocus: number;
                    },
                    idx: number,
                  ) => (
                    <tr key={idx}>
                      <td>{source.name}</td>
                      <td>
                        <ItemDamageDone amount={source.damage} />
                      </td>
                      <td>
                        {source.effectiveFocus}/{source.possibleFocus}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.FLANKING_STRIKE_TALENT}>
          <>
            <ItemDamageDone amount={totalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.FLANKING_STRIKE_TALENT} />
        </strong>{' '}
        generates 2 and consumes 1 <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> stack and
        15 focus. Always use it on cooldown with a{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />. Take care when using it when further
        than 5 yds from your target as it acts as a gap closer and can move you into deadly
        mechanics.
        <br></br>
        There is a slight delay on generation of{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> stacks and so when used from further
        than 5 yds, it will generate then consume and in melee it will consume then generate.{' '}
        <strong> Be aware of this to avoid avoid waste.</strong>
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS.FLANKING_STRIKE_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}

export default FlankingStrike;
