import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  getBuffedCasts,
  getBuffedCastsMID2Tier,
  getInitialHits,
} from '../../normalizers/EssenceBreakNormalizer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TIERS } from 'game/TIERS';

export interface EssenceBreakCastData {
  event: CastEvent; //raw cast event
  hits: number; //number of enemies hit by the initial cast
  buffedCasts: number; //number of buffed casts during the window
  unbuffedCasts: number; //number of unbuffed casts during the window (hitting the wrong target)
  deathSweepCasts: number; //number of buffed death sweep casts during the window
  annihilationCasts: number; //number of buffed annihilation casts during the window
  bladeDanceCasts: number; //number of buffed blade dance casts during the window
  chaosStrikeCasts: number; //number of buffed chaos strike casts during the window
  hasMetamorphosisOnCast: boolean; //whether or not metamorphosis was up on cast
  eyebeamCooldown: number; //Remaining cd of Eyebeam
}

class EssenceBreak extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  MID24PC = false;
  casts: EssenceBreakCastData[] = [];
  private totalInitialDamage = 0;
  private totalExtraDamage = 0;
  private totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT);
    if (!this.active) {
      return;
    }

    this.MID24PC = this.selectedCombatant.has4PieceByTier(TIERS.MID2);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT),
      this.onEssenceBreakInitialHit,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BREAK_EXTRA_DAMAGE),
      this.onEssenceBreakExtraDamage,
    );
  }

  private onCast(event: CastEvent) {
    if (this.MID24PC) {
      // Debugging for later improvements - performace based on casting on the wrong target

      // console.log('OnCastAnni');
      // const cs = getBuffedCastsMID2Tier(event).filter(
      //   (it) => it.ability.guid === SPELLS.ANNIHILATION.id,
      // );
      // if (cs.length > 0) {
      //   console.log(cs);
      //   console.log('Break it down');
      //   cs.map((it) =>
      //     console.log(
      //       it,
      //       this.enemies.getEntity(it),
      //       this.enemies.getEntity(it)?.hasBuff(SPELLS.ESSENCE_BREAK_DAMAGE.id, it.timestamp),
      //     ),
      //   );
      // }

      this.casts.push({
        event,
        hits: getInitialHits(event).length || 0,
        buffedCasts: getBuffedCastsMID2Tier(event).length,
        unbuffedCasts: 0,
        deathSweepCasts: getBuffedCastsMID2Tier(event).filter(
          (it) => it.ability.guid === SPELLS.DEATH_SWEEP.id,
        ).length,
        annihilationCasts: getBuffedCastsMID2Tier(event).filter(
          (it) => it.ability.guid === SPELLS.ANNIHILATION.id,
        ).length,
        bladeDanceCasts: getBuffedCastsMID2Tier(event).filter(
          (it) => it.ability.guid === SPELLS.BLADE_DANCE.id,
        ).length,
        chaosStrikeCasts: getBuffedCastsMID2Tier(event).filter(
          (it) => it.ability.guid === SPELLS.CHAOS_STRIKE.id,
        ).length,
        hasMetamorphosisOnCast: this.selectedCombatant.hasBuff(
          SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
          event.timestamp,
        ),
        eyebeamCooldown: this.spellUsable.cooldownRemaining(
          TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id,
          event.timestamp,
        ),
      });
    } else {
      this.casts.push({
        event,
        hits: getInitialHits(event).length || 0,
        buffedCasts: getBuffedCasts(event).length,
        unbuffedCasts: 0,
        deathSweepCasts: getBuffedCasts(event).filter(
          (it) => it.ability.guid === SPELLS.DEATH_SWEEP.id,
        ).length,
        annihilationCasts: getBuffedCasts(event).filter(
          (it) => it.ability.guid === SPELLS.ANNIHILATION.id,
        ).length,
        bladeDanceCasts: getBuffedCasts(event).filter(
          (it) => it.ability.guid === SPELLS.BLADE_DANCE.id,
        ).length,
        chaosStrikeCasts: getBuffedCasts(event).filter(
          (it) => it.ability.guid === SPELLS.CHAOS_STRIKE.id,
        ).length,
        hasMetamorphosisOnCast: this.selectedCombatant.hasBuff(
          SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
          event.timestamp,
        ),
        eyebeamCooldown: this.spellUsable.cooldownRemaining(
          TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id,
          event.timestamp,
        ),
      });
    }
  }

  private onEssenceBreakInitialHit(event: DamageEvent) {
    this.totalInitialDamage += event.amount;
  }

  private onEssenceBreakExtraDamage(event: DamageEvent) {
    this.totalExtraDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>{formatThousands(this.totalInitialDamage)} initial damage</p>
            <p>{formatThousands(this.totalExtraDamage)} extra damage</p>
            <p>{formatThousands(this.totalInitialDamage + this.totalExtraDamage)} total damage</p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT}>
          <ItemDamageDone amount={this.totalInitialDamage + this.totalExtraDamage} />
          <p>
            {formatThousands(this.totalInitialDamage)} <small>initial damage</small>
          </p>
          <p>
            {formatThousands(this.totalExtraDamage)} <small>extra damage</small>
          </p>
          <p>
            {formatThousands(this.totalInitialDamage + this.totalExtraDamage)}{' '}
            <small>total damage</small>
          </p>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EssenceBreak;
