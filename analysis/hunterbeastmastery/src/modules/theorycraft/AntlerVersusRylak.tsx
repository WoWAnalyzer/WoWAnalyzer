import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { MAX_TARGETS_FOR_ANTLERS_TRIGGER, MS_BUFFER_100 } from '@wowanalyzer/hunter';

import { RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE } from '../../constants';

class AntlerVersusRylak extends Analyzer {
  potentialAntlerDamage = 0;
  potentialAntlerHits = 0;
  wildSpiritHits = 0;
  lastWSTimestamp = 0;
  targetsHit: string[] = [];
  recentWSDamage = 0;

  potentialRylakDamage = 0;
  lastCritTimestamp = 0;

  //Because we're comparing a generic legendary (rylak) to antlers that only works when you're NightFae
  //we require the rylak user to also be NF before showing this module
  hasRylakAndIsNF =
    this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.bonusID,
    ) && this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

  hasAntlers = this.selectedCombatant.hasLegendaryByBonusID(
    SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.bonusID,
  );
  constructor(options: Options) {
    super(options);

    this.active = this.hasRylakAndIsNF || this.hasAntlers;

    if (!this.active) {
      return;
    }

    !this.hasRylakAndIsNF &&
      this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    !this.hasAntlers &&
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WILD_SPIRITS_DAMAGE_AOE),
        this.onWildSpiritsDamage,
      );
    !this.hasAntlers && this.addEventListener(Events.fightend.by(SELECTED_PLAYER), this.onFightEnd);
  }

  calculateTheoreticEffectiveDamage(event: DamageEvent, increase: number): number {
    const raw = (event.amount || 0) + (event.absorbed || 0);

    return raw;
  }

  onPetDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (
      event.ability.guid === SPELLS.BEAST_CLEAVE_DAMAGE.id &&
      event.timestamp < this.lastCritTimestamp + MS_BUFFER_100
    ) {
      this.potentialRylakDamage +=
        ((event.amount || 0) + (event.absorbed || 0)) *
        RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE;
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    this.lastCritTimestamp = event.timestamp;
    this.potentialRylakDamage +=
      ((event.amount || 0) + (event.absorbed || 0)) *
      RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE;
  }

  attributePotentialAntlers = (recentHits: number, recentDamage: number) => {
    this.potentialAntlerHits += recentHits;
    this.potentialAntlerDamage += recentDamage;
  };

  onWildSpiritsDamage(event: DamageEvent) {
    if (event.timestamp > this.lastWSTimestamp + MS_BUFFER_100) {
      const uniqueTargets = Array.from(new Set(this.targetsHit));
      if (uniqueTargets.length <= MAX_TARGETS_FOR_ANTLERS_TRIGGER) {
        this.attributePotentialAntlers(this.targetsHit.length, this.recentWSDamage);
      }
      //Reset for new Wild Spirit triggers
      this.recentWSDamage = 0;
      this.targetsHit = [];
    }
    this.lastWSTimestamp = event.timestamp;
    const targetHit = encodeTargetString(event.targetID, event.targetInstance);
    this.targetsHit.push(targetHit);
    this.recentWSDamage += event.amount + (event.absorb || 0);
    this.wildSpiritHits += 1;
  }

  onFightEnd() {
    const uniqueTargets = Array.from(new Set(this.targetsHit));
    if (uniqueTargets.length < MAX_TARGETS_FOR_ANTLERS_TRIGGER) {
      this.attributePotentialAntlers(this.targetsHit.length, this.recentWSDamage);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        dropdown={
          <div className="pad">
            {!this.hasAntlers && (
              <BoringSpellValueText spellId={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id}>
                <ItemDamageDone amount={this.potentialAntlerDamage} />
                <br />
                {formatPercentage((1 / this.wildSpiritHits) * this.potentialAntlerHits)}%{' '}
                <small>
                  added <SpellIcon id={SPELLS.WILD_SPIRITS.id} /> hits
                </small>
              </BoringSpellValueText>
            )}
            {!this.hasRylakAndIsNF && (
              <BoringSpellValueText spellId={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.id}>
                <ItemDamageDone amount={this.potentialRylakDamage} />
              </BoringSpellValueText>
            )}
          </div>
        }
        tooltip={
          <>
            This is an infographic attempting to compare the two legendaries, Ryalk Stalker's
            Piercing Fangs and Fragments of the Elder Antlers, against each other to provide a
            better understanding where each legendary performs better than the other as it is an oft
            discussed topic.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id} /> Antlers &{' '}
              <SpellIcon id={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.id} /> Rylaks comparison
            </>
          }
        >
          <>
            <strong>!!EXPERIMENTAL!!</strong>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default AntlerVersusRylak;
