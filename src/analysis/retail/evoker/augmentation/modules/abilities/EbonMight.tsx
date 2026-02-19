import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  GetRelatedEvents,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/evoker';
import {
  EBON_MIGHT_BASE_DURATION_MS,
  TIMEWALKER_BASE_EXTENSION,
  ERUPTION_EXTENSION_MS,
  EMPOWER_EXTENSION_MS,
  BREATH_OF_EONS_EXTENSION_MS,
  SANDS_OF_TIME_CRIT_MOD,
  DREAM_OF_SPRINGS_EXTENSION_MS,
  BREATH_OF_EONS_SPELL_IDS,
  BREATH_OF_EONS_SPELLS,
  EBON_MIGHT_PERSONAL_DAMAGE_AMP,
  MID1_AUGMENTATION_2PC_EXTENSION_MODIFIER,
} from 'analysis/retail/evoker/augmentation/constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { ebonIsFromBreath, getEbonMightBuffEvents } from '../normalizers/CastLinkNormalizer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import DonutChart from 'parser/ui/DonutChart';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { UPHEAVAL_REVERBERATION_DAM_LINK } from '../normalizers/CastLinkNormalizer';
import { InformationIcon } from 'interface/icons';
import { formatPercentage } from 'common/format';
import { TIERS } from 'game/TIERS';

const PANDEMIC_WINDOW = 0.3;

/**
 * Ebon Might is the most important spell in Augmentations kit
 * It provides your targets with a percentage of your own mainstat,
 * as well as making them targets for Breath of Eon damage component.
 *
 * Ebon Might gets it duration increased by an amount equal to our Mastery,
 * along with being extended by Sands of Time.
 * Since we can't get the current duration easily we will instead by calculating
 * a rough estimation of the duration, since we need it for refresh analysis.
 * This is obviously not going to give 100% accurate results, but should be within
 * a range that we can give decently accurate analysis.
 */

interface EbonMightCooldownCast {
  event: AnyEvent;
  oldBuffRemainder: number;
  currentMastery: number;
  buffedTargets: ApplyBuffEvent[] | RefreshBuffEvent[];
}
interface PrescienceBuffs {
  event: ApplyBuffEvent | RemoveBuffEvent;
}

class EbonMight extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    spellUsable: SpellUsable,
    combatants: Combatants,
  };
  protected stats!: StatTracker;
  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  private uses: SpellUse[] = [];
  private ebonMightCasts: EbonMightCooldownCast[] = [];
  private prescienceCasts: PrescienceBuffs[] = [];

  ebonMightActive = false;
  currentEbonMightDuration = 0;
  currentEbonMightCastTime = 0;

  personalEbonMightDamage = 0;
  externalEbonMightDamage = 0;

  trackedSpells = [
    TALENTS.ERUPTION_TALENT,
    ...BREATH_OF_EONS_SPELLS,
    SPELLS.BREATH_OF_EONS_SCALECOMMANDER,
    SPELLS.EMERALD_BLOSSOM_CAST,
  ];
  empowers = [SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT, SPELLS.UPHEAVAL, SPELLS.UPHEAVAL_FONT];
  personalBuffedSpells = [
    SPELLS.DEEP_BREATH_DAM,
    SPELLS.FIRE_BREATH_DOT,
    SPELLS.LIVING_FLAME_DAMAGE,
    SPELLS.AZURE_STRIKE,
    SPELLS.UNRAVEL,
    TALENTS.ERUPTION_TALENT,
    SPELLS.UPHEAVAL_DAM,
    SPELLS.MASS_ERUPTION_DAMAGE,
    SPELLS.MELT_ARMOR,
  ];

  eruptionExtension = this.selectedCombatant.has2PieceByTier(TIERS.MID1)
    ? ERUPTION_EXTENSION_MS + MID1_AUGMENTATION_2PC_EXTENSION_MODIFIER
    : ERUPTION_EXTENSION_MS;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonRemove,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonRefresh,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onCast);
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER).spell(this.empowers), this.onCast);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onPrescienceApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onPrescienceRemove,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(this.personalBuffedSpells),
      this.onPersonalDamage,
    );
    //To-do: Determine if Duplicate empowers are affected, and if so add them here
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell([SPELLS.DUPLICATE_ERUPTION]),
      this.onPersonalDamage,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.REVERBERATIONS_TALENT)) {
      this.addEventListener(
        Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.UPHEAVAL, SPELLS.UPHEAVAL_FONT]),
        this.addReverberationsDamage,
      );
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_EXTERNAL),
      this.onExternalDamage,
    );
  }

  private onEbonApply(event: ApplyBuffEvent) {
    const buffedTargets = getEbonMightBuffEvents(event);
    this.ebonMightCasts.push({
      event: event,
      oldBuffRemainder: this.ebonMightTimeLeft(event),
      currentMastery: this.stats.currentMasteryPercentage,
      buffedTargets,
    });
    this.currentEbonMightDuration = ebonIsFromBreath(event)
      ? 5
      : this.calculateEbonMightDuration(event);
    this.currentEbonMightCastTime = event.timestamp;
    this.ebonMightActive = true;
    // If Ebon Might was cast pre-pull, make sure we put it on CD
    if (event.prepull && this.spellUsable.isAvailable(TALENTS.EBON_MIGHT_TALENT.id)) {
      this.spellUsable.beginCooldown(event, TALENTS.EBON_MIGHT_TALENT.id);
    }
    //console.log('Applied at: ' +formatDuration(event.timestamp - this.owner.fight.start_time) +' Duration: ' +this.currentEbonMightDuration,);
  }

  private onEbonRemove(event: RemoveBuffEvent) {
    this.ebonMightActive = false;
    this.currentEbonMightDuration = 0;
    //console.log('Removed at: ' + formatDuration(event.timestamp - this.owner.fight.start_time));
  }

  private onEbonRefresh(event: RefreshBuffEvent) {
    const buffedTargets = getEbonMightBuffEvents(event);
    this.ebonMightCasts.push({
      event: event,
      oldBuffRemainder: this.ebonMightTimeLeft(event),
      currentMastery: this.stats.currentMasteryPercentage,
      buffedTargets,
    });
    this.currentEbonMightDuration = this.calculateEbonMightDuration(event);
    this.currentEbonMightCastTime = event.timestamp;
    //console.log('Refreshed at: ' + formatDuration(event.timestamp - this.owner.fight.start_time) +' Duration: ' +this.currentEbonMightDuration,);
  }

  private onPrescienceApply(event: ApplyBuffEvent) {
    this.prescienceCasts.push({
      event: event,
    });
  }
  private onPrescienceRemove(event: RemoveBuffEvent) {
    this.prescienceCasts.push({
      event: event,
    });
  }

  private onCast(event: CastEvent | EmpowerEndEvent) {
    this.extendEbonMight(event);
  }

  private onPersonalDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      this.personalEbonMightDamage += calculateEffectiveDamage(
        event,
        EBON_MIGHT_PERSONAL_DAMAGE_AMP,
      );
    }
  }

  private addReverberationsDamage(event: EmpowerEndEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      const reverbEvents = GetRelatedEvents<DamageEvent>(event, UPHEAVAL_REVERBERATION_DAM_LINK);

      reverbEvents.forEach((reverbEvent) => {
        this.personalEbonMightDamage += calculateEffectiveDamage(
          reverbEvent,
          EBON_MIGHT_PERSONAL_DAMAGE_AMP,
        );
      });
    }
  }

  private onExternalDamage(event: DamageEvent) {
    this.externalEbonMightDamage += event.amount;
  }

  /* Here we figure out how long the duration should be based on current mastery
   * as well pandemiccing the current buff if we are refreshing */
  private calculateEbonMightDuration(event: AnyEvent) {
    const masteryPercentage = this.stats.currentMasteryPercentage;
    let ebonMightTimeLeft = this.ebonMightTimeLeft(event);
    const ebonMightCastDuration =
      EBON_MIGHT_BASE_DURATION_MS * (1 + TIMEWALKER_BASE_EXTENSION + masteryPercentage);

    if (ebonMightTimeLeft > ebonMightCastDuration * PANDEMIC_WINDOW) {
      ebonMightTimeLeft = ebonMightCastDuration * PANDEMIC_WINDOW;
    }

    const ebonMightDuration = ebonMightCastDuration + ebonMightTimeLeft;

    return ebonMightDuration;
  }

  /* Here we figure out how much to extend the current buffs, we average
   * out the crit chance of the +50% effect, gives accurate enough results
   * for what we need.*/
  private extendEbonMight(event: CastEvent | EmpowerEndEvent) {
    if (
      !this.ebonMightActive ||
      (event.ability.guid === SPELLS.EMERALD_BLOSSOM_CAST.id &&
        !this.selectedCombatant.hasTalent(TALENTS.DREAM_OF_SPRING_TALENT))
    ) {
      return;
    }

    const ebonMightTimeLeft = this.ebonMightTimeLeft(event);
    const critChance = this.stats.currentCritPercentage;
    const critMod = 1 + SANDS_OF_TIME_CRIT_MOD * critChance;

    let newEbonMightDuration;

    if (BREATH_OF_EONS_SPELL_IDS.includes(event.ability.guid)) {
      newEbonMightDuration = ebonMightTimeLeft + BREATH_OF_EONS_EXTENSION_MS * critMod;
    } else if (event.ability.guid === TALENTS.ERUPTION_TALENT.id) {
      newEbonMightDuration = ebonMightTimeLeft + this.eruptionExtension * critMod;
    } else if (event.ability.guid === SPELLS.EMERALD_BLOSSOM_CAST.id) {
      newEbonMightDuration = ebonMightTimeLeft + DREAM_OF_SPRINGS_EXTENSION_MS * critMod;
    } else {
      newEbonMightDuration = ebonMightTimeLeft + EMPOWER_EXTENSION_MS * critMod;
    }

    this.currentEbonMightCastTime = event.timestamp;
    this.currentEbonMightDuration = newEbonMightDuration;
    //console.log('Ebon Might Extended: ' +this.currentEbonMightDuration / 1000 +' timestamp: ' + formatDuration(event.timestamp - this.owner.fight.start_time), );
  }

  private ebonMightTimeLeft(event: AnyEvent) {
    if (this.currentEbonMightCastTime === 0) {
      return 0;
    }
    const timeSinceLast = event.timestamp - this.currentEbonMightCastTime;
    //console.log('Time since last: ' + timeSinceLast / 1000);
    const ebonMightTimeLeft = this.currentEbonMightDuration - timeSinceLast;
    //console.log( 'Ebon Might Time Left: ' +ebonMightTimeLeft / 1000 +' timestamp: ' + formatDuration(event.timestamp - this.owner.fight.start_time),);
    if (ebonMightTimeLeft < 0) {
      return 0;
    }
    return ebonMightTimeLeft;
  }

  statistic() {
    const buffUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id) /
      this.owner.fightDuration;
    const damageSources = [
      {
        color: 'rgb(212, 81, 19)',
        label: 'External',
        spellId: SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
        valueTooltip: formatNumber(this.externalEbonMightDamage),
        value: this.externalEbonMightDamage,
      },
      {
        color: 'rgb(51, 147, 127)',
        label: 'Personal',
        spellId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
        valueTooltip: formatNumber(this.personalEbonMightDamage),
        value: this.personalEbonMightDamage,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS.EBON_MIGHT_TALENT}>
          <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> buff uptime</small>
          <br />
          <ItemDamageDone amount={this.personalEbonMightDamage + this.externalEbonMightDamage} />
        </TalentSpellText>
        <div className="pad">
          <DonutChart items={damageSources} />
        </div>
      </Statistic>
    );
  }
}

export default EbonMight;
