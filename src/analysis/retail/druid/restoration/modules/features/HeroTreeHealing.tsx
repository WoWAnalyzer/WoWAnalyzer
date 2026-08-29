import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { isKeeperOfTheGrove, isWildstalker } from 'analysis/retail/druid/shared/heroTree';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import SpellLink from 'interface/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import keeperOfTheGroveIcon from './images/keeperofthegrove.webp';
import wildstalkerIcon from './images/wildstalker.png';

import KotgTreeAmpAttribution from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/KotgTreeAmpAttribution';
import BounteousBloom from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/BounteousBloom';
import PowerOfTheDream from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/PowerOfTheDream';
import PotentEnchantments from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/PotentEnchantments';
import SpiritOfTheThicket from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/SpiritOfTheThicket';
import SylvanBeckoning from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/SylvanBeckoning';
import PatientCustodian from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/PatientCustodian';
import RootNetwork from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/RootNetwork';
import VigorousCreepers from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/VigorousCreepers';
import WildstalkersPower from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/WildstalkersPower';
import HarmoniousConstitution from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/HarmoniousConstitution';
import HuntBeneathTheOpenSkies from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/HuntBeneathTheOpenSkies';
import StrategicInfusion from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/StrategicInfusion';
import BondWithNature from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/BondWithNature';
import BurstingGrowth from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/BurstingGrowth';
import FlowerWalk from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/FlowerWalk';
import LethalPreservation from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/LethalPreservation';
import DreamSurge from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/DreamSurge';
import DurabilityOfNature from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/DurabilityOfNature';

interface Contribution {
  spell: (typeof TALENTS_DRUID)[keyof typeof TALENTS_DRUID];
  healing: number;
  note?: string;
}

/**
 * Aggregates hero-talent healing into one comparable total.
 *
 * Nested so the same healing isn't in two rows:
 * - Dream Surge / Power of the Dream: Dream Bloom split 3/4 vs 1/4 when PotD is taken
 * - Cenarius' Might / Grove's Inspiration / Harmony / Power of Nature: tree rows use
 *   combined-amp shares; solo cards keep full marginal value
 * - Patient Custodian / Root Network / Hunt / Vigorous Creepers: tree totals skip amp on
 *   Symbiotic Bloom ticks (those ticks are already in the healing breakdown)
 * - Bond with Nature: full talent value (same as the solo card)
 * - Resilient Flourishing omitted from tree (already in SymBloom rows)
 * - CDR / DR talents omitted (Dryad's Dance, Early Spring, Protective Growth)
 */
export default class HeroTreeHealing extends Analyzer {
  static dependencies = {
    dreamSurge: DreamSurge,
    sylvanBeckoning: SylvanBeckoning,
    spiritOfTheThicket: SpiritOfTheThicket,
    durabilityOfNature: DurabilityOfNature,
    kotgTreeAmpAttribution: KotgTreeAmpAttribution,
    bounteousBloom: BounteousBloom,
    powerOfTheDream: PowerOfTheDream,
    potentEnchantments: PotentEnchantments,
    burstingGrowth: BurstingGrowth,
    flowerWalk: FlowerWalk,
    lethalPreservation: LethalPreservation,
    patientCustodian: PatientCustodian,
    rootNetwork: RootNetwork,
    vigorousCreepers: VigorousCreepers,
    wildstalkersPower: WildstalkersPower,
    harmoniousConstitution: HarmoniousConstitution,
    huntBeneathTheOpenSkies: HuntBeneathTheOpenSkies,
    strategicInfusion: StrategicInfusion,
    bondWithNature: BondWithNature,
  };

  protected dreamSurge!: DreamSurge;
  protected sylvanBeckoning!: SylvanBeckoning;
  protected spiritOfTheThicket!: SpiritOfTheThicket;
  protected durabilityOfNature!: DurabilityOfNature;
  protected kotgTreeAmpAttribution!: KotgTreeAmpAttribution;
  protected bounteousBloom!: BounteousBloom;
  protected powerOfTheDream!: PowerOfTheDream;
  protected potentEnchantments!: PotentEnchantments;
  protected burstingGrowth!: BurstingGrowth;
  protected flowerWalk!: FlowerWalk;
  protected lethalPreservation!: LethalPreservation;
  protected patientCustodian!: PatientCustodian;
  protected rootNetwork!: RootNetwork;
  protected vigorousCreepers!: VigorousCreepers;
  protected wildstalkersPower!: WildstalkersPower;
  protected harmoniousConstitution!: HarmoniousConstitution;
  protected huntBeneathTheOpenSkies!: HuntBeneathTheOpenSkies;
  protected strategicInfusion!: StrategicInfusion;
  protected bondWithNature!: BondWithNature;

  private readonly isKotg: boolean;
  private readonly isWs: boolean;

  constructor(options: Options) {
    super(options);
    this.isKotg = isKeeperOfTheGrove(this.selectedCombatant);
    this.isWs = isWildstalker(this.selectedCombatant);
    this.active = this.isKotg || this.isWs;
  }

  private get kotgContributions(): Contribution[] {
    return [
      {
        spell: TALENTS_DRUID.DREAM_SURGE_TALENT,
        healing: this.dreamSurge.totalHealing,
        note: 'Dream Bloom healing for the base 3 targets (Power of the Dream counts the 4th)',
      },
      {
        spell: TALENTS_DRUID.SYLVAN_BECKONING_TALENT,
        healing: this.sylvanBeckoning.totalHealing,
        note: 'Dryad Tranquility + Regrowth (visible in healing breakdown; no solo card)',
      },
      {
        spell: TALENTS_DRUID.SPIRIT_OF_THE_THICKET_TALENT,
        healing: this.spiritOfTheThicket.totalHealing,
        note: 'Spirit of the Thicket channel heal (visible in healing breakdown; no solo card)',
      },
      {
        spell: TALENTS_DRUID.DURABILITY_OF_NATURE_TALENT,
        healing: this.durabilityOfNature.totalHealing,
        note: 'Extra GG duration share: 1.6s of 9.6s observed (8s baseline + 20%)',
      },
      {
        spell: TALENTS_DRUID.CENARIUS_MIGHT_TALENT,
        healing: this.kotgTreeAmpAttribution.treeHealing.cenariusMight,
        note: 'Hero-tree share of stacked KotG amps (solo card shows full marginal value)',
      },
      {
        spell: TALENTS_DRUID.GROVES_INSPIRATION_TALENT,
        healing: this.kotgTreeAmpAttribution.treeHealing.grovesInspiration,
        note: 'Hero-tree share of stacked KotG amps (solo card shows full marginal value)',
      },
      {
        spell: TALENTS_DRUID.HARMONY_OF_THE_GROVE_TALENT,
        healing: this.kotgTreeAmpAttribution.treeHealing.harmonyOfTheGrove,
        note: 'Hero-tree share of stacked KotG amps (solo card shows full marginal value)',
      },
      {
        spell: TALENTS_DRUID.POWER_OF_NATURE_TALENT,
        healing: this.kotgTreeAmpAttribution.treeHealing.powerOfNature,
        note: 'Hero-tree share of stacked KotG amps (solo card shows full marginal value)',
      },
      { spell: TALENTS_DRUID.BOUNTEOUS_BLOOM_TALENT, healing: this.bounteousBloom.totalHealing },
      {
        spell: TALENTS_DRUID.POWER_OF_THE_DREAM_TALENT,
        healing: this.powerOfTheDream.totalHealing,
        note: 'Extra Dream Bloom target (1/4 of Dream Bloom when talented)',
      },
      {
        spell: TALENTS_DRUID.POTENT_ENCHANTMENTS_TALENT,
        healing: this.potentEnchantments.healing,
      },
    ];
  }

  private get wsContributions(): Contribution[] {
    return [
      {
        spell: TALENTS_DRUID.BURSTING_GROWTH_TALENT,
        healing: this.burstingGrowth.totalHealing,
        note: 'Visible in healing breakdown; no solo card',
      },
      {
        spell: TALENTS_DRUID.FLOWER_WALK_TALENT,
        healing: this.flowerWalk.totalHealing,
        note: 'Visible in healing breakdown; no solo card',
      },
      {
        spell: TALENTS_DRUID.LETHAL_PRESERVATION_TALENT,
        healing: this.lethalPreservation.totalHealing,
        note: 'Visible in healing breakdown; no solo card',
      },
      {
        spell: TALENTS_DRUID.PATIENT_CUSTODIAN_TALENT,
        healing: this.patientCustodian.treeHealing,
        note: 'Excludes amp on Symbiotic Bloom ticks',
      },
      {
        spell: TALENTS_DRUID.ROOT_NETWORK_TALENT,
        healing: this.rootNetwork.treeHealing,
        note: 'Excludes amp on Symbiotic Bloom ticks',
      },
      {
        spell: TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT,
        healing: this.vigorousCreepers.treeHealing,
        note: 'Excludes amp on Symbiotic Bloom ticks',
      },
      {
        spell: TALENTS_DRUID.WILDSTALKERS_POWER_TALENT,
        healing: this.wildstalkersPower.healing,
      },
      {
        spell: TALENTS_DRUID.HARMONIOUS_CONSTITUTION_TALENT,
        healing: this.harmoniousConstitution.healing,
      },
      {
        spell: TALENTS_DRUID.HUNT_BENEATH_THE_OPEN_SKIES_TALENT,
        healing: this.huntBeneathTheOpenSkies.treeHealing,
        note: 'Excludes amp on Symbiotic Bloom ticks',
      },
      {
        spell: TALENTS_DRUID.STRATEGIC_INFUSION_TALENT,
        healing: this.strategicInfusion.healing,
      },
      {
        spell: TALENTS_DRUID.BOND_WITH_NATURE_TALENT,
        healing: this.bondWithNature.healing,
        note: 'Full talent value (self + external received + Everbloom splash). Card main display excludes external received',
      },
    ];
  }

  get contributions(): Contribution[] {
    if (this.isKotg) {
      return this.kotgContributions;
    }
    if (this.isWs) {
      return this.wsContributions;
    }
    return [];
  }

  get totalHealing() {
    return this.contributions.reduce((sum, c) => sum + c.healing, 0);
  }

  get treeName() {
    return this.isKotg ? 'Keeper of the Grove' : 'Wildstalker';
  }

  get treeIcon() {
    return this.isKotg ? keeperOfTheGroveIcon : wildstalkerIcon;
  }

  private formatPct(healing: number) {
    return `${formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))} %`;
  }

  statistic() {
    const contributions = this.contributions
      .filter(
        (c) =>
          this.selectedCombatant.hasTalent(c.spell) &&
          Number(formatPercentage(this.owner.getPercentageOfTotalHealingDone(c.healing))) > 0,
      )
      .sort((a, b) => b.healing - a.healing);

    return (
      <StatisticsListBox
        title={
          <>
            <img
              src={this.treeIcon}
              alt={this.treeName}
              style={{ height: '1.2em', marginTop: '-0.15em' }}
            />{' '}
            {this.treeName}
          </>
        }
        tooltip={
          <>
            Approximate healing attributable to your hero talent tree.
            <br />
            <br />
            Sums each talent's contribution. Stacked KotG percentage buffs on the same heal are
            split so they do not overcount in this total (solo cards still show full marginal
            value). Amp modules skip Symbiotic Bloom ticks so those ticks are not double-counted.
            Dream Bloom is split between Dream Surge and Power of the Dream. CDR and
            damage-reduction talents are omitted.
          </>
        }
        position={STATISTIC_ORDER.CORE(-1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        bodyStyle={{}}
      >
        <StatisticListBoxItem
          title={<strong>Total</strong>}
          value={<strong>{this.formatPct(this.totalHealing)}</strong>}
          valueTooltip={
            <>
              {formatNumber(this.totalHealing)} healing (
              {this.owner.formatItemHealingDone(this.totalHealing)})
            </>
          }
        />
        {contributions.map((c) => (
          <StatisticListBoxItem
            key={c.spell.id}
            title={<SpellLink spell={c.spell} />}
            value={this.formatPct(c.healing)}
            titleTooltip={c.note}
            valueTooltip={formatNumber(c.healing)}
          />
        ))}
      </StatisticsListBox>
    );
  }
}
