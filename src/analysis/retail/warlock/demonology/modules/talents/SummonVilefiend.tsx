import type { JSX } from 'react';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DemoPets from '../pets/DemoPets';
import PETS from '../pets/PETS';

class SummonVilefiend extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;

  private vilefiendSummons = 0;
  private charhoundSummons = 0;
  private gloomhoundSummons = 0;

  // Shared abilities (used by multiple pet types)
  private totalBileSpitDamage = 0;
  private totalHeadbuttDamage = 0;

  private charhoundInfernalPresenceDamage = 0;
  private gloomhoundGloomSlashDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT);

    if (!this.active) {
      return;
    }

    // Track summon events instead of cast events
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS.SUMMON_VILEFIEND_TALENT),
      this.onVilefiendSummon,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.CHARHOUND_SUMMON),
      this.onCharhoundSummon,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.GLOOMHOUND_SUMMON),
      this.onGloomhoundSummon,
    );

    // Track pet ability damage
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER_PET)
        .spell([
          SPELLS.VILEFIEND_BILE_SPIT,
          SPELLS.VILEFIEND_HEADBUTT,
          SPELLS.CHARHOUND_INFERNAL_PRESENCE,
          SPELLS.GLOOMHOUND_GLOOM_SLASH,
        ]),
      this.onPetAbilityDamage,
    );
  }

  private onVilefiendSummon(event: SummonEvent) {
    this.vilefiendSummons++;
  }

  private onCharhoundSummon(event: SummonEvent) {
    this.charhoundSummons++;
  }

  private onGloomhoundSummon(event: SummonEvent) {
    this.gloomhoundSummons++;
  }

  private onPetAbilityDamage(event: DamageEvent) {
    const damage = (event.amount || 0) + (event.absorbed || 0);

    switch (event.ability.guid) {
      case SPELLS.VILEFIEND_BILE_SPIT.id:
        this.totalBileSpitDamage += damage;
        break;
      case SPELLS.VILEFIEND_HEADBUTT.id:
        this.totalHeadbuttDamage += damage;
        break;
      case SPELLS.CHARHOUND_INFERNAL_PRESENCE.id:
        this.charhoundInfernalPresenceDamage += damage;
        break;
      case SPELLS.GLOOMHOUND_GLOOM_SLASH.id:
        this.gloomhoundGloomSlashDamage += damage;
        break;
    }
  }

  private get isCharhound() {
    return this.selectedCombatant.hasTalent(TALENTS.MARK_OF_FHARG_TALENT);
  }

  private get isGloomhound() {
    return this.selectedCombatant.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT);
  }

  getCurrentPetGUID() {
    if (this.isCharhound) return PETS.CHARHOUND.guid;
    if (this.isGloomhound) return PETS.GLOOMHOUND.guid;
    return PETS.VILEFIEND.guid;
  }

  getCurrentTalentUsed() {
    if (this.isCharhound) return TALENTS.MARK_OF_FHARG_TALENT;
    if (this.isGloomhound) return TALENTS.MARK_OF_SHATUG_TALENT;
    return TALENTS.SUMMON_VILEFIEND_TALENT;
  }

  getCurrentSpellUsed() {
    if (this.isCharhound) return SPELLS.CHARHOUND_SUMMON;
    if (this.isGloomhound) return SPELLS.GLOOMHOUND_SUMMON;
    return TALENTS.SUMMON_VILEFIEND_TALENT;
  }

  getCurrentSummonCount() {
    if (this.isCharhound) return this.charhoundSummons;
    if (this.isGloomhound) return this.gloomhoundSummons;
    return this.vilefiendSummons;
  }

  getCurrentCooldown() {
    // Charhound and Gloomhound have 30s cooldown, Vilefiend has 45s
    return this.isCharhound || this.isGloomhound ? 30000 : 45000;
  }

  get suggestionThresholds() {
    return this.createEfficiencyThreshold();
  }

  private createEfficiencyThreshold() {
    const totalSummons = this.getCurrentSummonCount();
    const cooldownMs = this.getCurrentCooldown();
    const expectedSummons = Math.floor(this.owner.fightDuration / cooldownMs);
    const efficiency = expectedSummons > 0 ? totalSummons / expectedSummons : 1;

    return {
      actual: efficiency,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    const damage = this.demoPets.getPetDamage(this.getCurrentPetGUID());
    const summonCount = this.getCurrentSummonCount();
    const spellUsed = this.getCurrentSpellUsed();

    const abilityBreakdown: JSX.Element[] = [];

    if (this.isCharhound) {
      // Charhound unique abilities
      if (this.charhoundInfernalPresenceDamage > 0) {
        abilityBreakdown.push(
          <div key="infernalPresence">
            Infernal Presence: {formatThousands(this.charhoundInfernalPresenceDamage)}
          </div>,
        );
      }
    } else if (this.isGloomhound) {
      // Gloomhound unique abilities
      if (this.gloomhoundGloomSlashDamage > 0) {
        abilityBreakdown.push(
          <div key="slash">Gloom Slash: {formatThousands(this.gloomhoundGloomSlashDamage)}</div>,
        );
      }
    }

    // Add shared abilities (Bile Spit and Headbutt) for all pet types
    if (this.totalBileSpitDamage > 0) {
      abilityBreakdown.push(
        <div key="bile">Bile Spit: {formatThousands(this.totalBileSpitDamage)}</div>,
      );
    }
    if (this.totalHeadbuttDamage > 0) {
      abilityBreakdown.push(
        <div key="headbutt">Headbutt: {formatThousands(this.totalHeadbuttDamage)}</div>,
      );
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(damage)} total damage
            <br />
            {summonCount} summons cast
            {abilityBreakdown.length > 0 && (
              <>
                <br />
                <strong>Pet Abilities:</strong>
                {abilityBreakdown}
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={spellUsed}>
          {(this.isCharhound || this.isGloomhound) && (
            <small>
              <SpellLink spell={this.getCurrentTalentUsed()} />
            </small>
          )}
          <div>
            <ItemDamageDone amount={damage} />
          </div>
          {summonCount} <small>summons</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonVilefiend;
