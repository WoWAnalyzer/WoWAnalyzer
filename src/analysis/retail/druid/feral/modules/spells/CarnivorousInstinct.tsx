import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import {
  BASE_TIGERS_FURY_DAMAGE_BONUS,
  getTigersFuryDamageBonus,
  TIGERS_FURY_BOOSTED,
} from 'analysis/retail/druid/feral/constants';
import Events, { ApplyDebuffEvent, DamageEvent, RefreshDebuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const TF_SNAPSHOT_DEBUFFS = [
  SPELLS.RIP,
  SPELLS.RAKE_BLEED,
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.MOONFIRE_FERAL,
];

/**
 * *Carnivorous Instinct*
 * Spec Talent
 *
 * Tiger's Fury's damage bonus is increased by (6 / 12)%
 */
export default class CarnivorousInstinct extends Analyzer {
  /** Number of points in Carnivorous Instinct */
  rank: number = 0;
  /** The relative damage boost to TF from Carnivorous Instinct */
  relativeBoost: number = 0;
  /** Total damage added by Carnivorous Instinct */
  totalDamage: number = 0;

  /** Set of target IDs whose last rip application had TF */
  targetsWithTfRip: Set<string> = new Set<string>();
  /** Set of target IDs whose last rake application had TF */
  targetsWithTfRake: Set<string> = new Set<string>();
  /** Set of target IDs whose last feral moonfire application had TF */
  targetsWithTfMoonfire: Set<string> = new Set<string>();
  /** Set of target IDs whose last feral thrash application had TF */
  targetsWithTfThrash: Set<string> = new Set<string>();

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.CARNIVOROUS_INSTINCT_TALENT);
    this.active = this.rank > 0;

    this.relativeBoost =
      (1 + getTigersFuryDamageBonus(this.selectedCombatant)) / (1 + BASE_TIGERS_FURY_DAMAGE_BONUS) -
      1;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TIGERS_FURY_BOOSTED),
      this.onBoostedDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TF_SNAPSHOT_DEBUFFS),
      this.onTfBoostedDebuffApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(TF_SNAPSHOT_DEBUFFS),
      this.onTfBoostedDebuffApply,
    );
  }

  onBoostedDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    let applies = false;
    if (spellId === SPELLS.RIP.id) {
      applies = this.targetsWithTfRip.has(encodeEventTargetString(event) || '');
    } else if (spellId === SPELLS.RAKE_BLEED.id) {
      applies = this.targetsWithTfRake.has(encodeEventTargetString(event) || '');
    } else if (spellId === SPELLS.MOONFIRE_FERAL.id) {
      applies = this.targetsWithTfMoonfire.has(encodeEventTargetString(event) || '');
    } else if (spellId === SPELLS.THRASH_FERAL_BLEED.id) {
      applies = this.targetsWithTfThrash.has(encodeEventTargetString(event) || '');
    } else {
      applies = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    }

    if (applies) {
      this.totalDamage += calculateEffectiveDamage(event, this.relativeBoost);
    }
  }

  onTfBoostedDebuffApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const spellId = event.ability.guid;
    const hasTf = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    let trackerSet;
    if (spellId === SPELLS.RIP.id) {
      trackerSet = this.targetsWithTfRip;
    } else if (spellId === SPELLS.RAKE_BLEED.id) {
      trackerSet = this.targetsWithTfRake;
    } else if (spellId === SPELLS.MOONFIRE_FERAL.id) {
      trackerSet = this.targetsWithTfMoonfire;
    } else if (spellId === SPELLS.THRASH_FERAL_BLEED.id) {
      trackerSet = this.targetsWithTfThrash;
    } else {
      console.warn('Got TF boosted debuff apply with unexpected event', event);
      return;
    }

    const targetString = encodeEventTargetString(event) || '';
    if (hasTf) {
      trackerSet.add(targetString);
    } else {
      trackerSet.delete(targetString);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(8)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            The damage due specifically to the boost to <SpellLink spell={SPELLS.TIGERS_FURY} />{' '}
            damage bonus
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.CARNIVOROUS_INSTINCT_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
