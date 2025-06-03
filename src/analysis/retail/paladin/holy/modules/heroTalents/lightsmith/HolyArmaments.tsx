import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class HolyArmaments extends Analyzer {
  hasAC = false;

  damageSource = {
    [SPELLS.SACRED_WEAPON_DAMAGE.id]: 0,
    [SPELLS.BLESSING_OF_THE_FORGE_DAMAGE.id]: 0,
  };

  healingSource = {
    [SPELLS.SACRED_WEAPON_HEAL.id]: 0,
    [SPELLS.RADIANT_AURA_HEAL.id]: 0,
    [SPELLS.SACRED_WORD_HEAL.id]: 0,
    [SPELLS.HOLY_BULWARK_ABSORB.id]: 0,
    [SPELLS.HOLY_BULWARK_BUFF.id]: 0,
  };

  appliedFromCast = 0;
  appliedFromDivineInspiration = 0;
  appliedFromWings = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOLY_ARMAMENTS_TALENT);
    this.hasAC = this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SACRED_WEAPON_HEAL, SPELLS.RADIANT_AURA_HEAL, SPELLS.SACRED_WORD_HEAL]),
      this.onHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SACRED_WEAPON_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.BLESSING_OF_THE_FORGE_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.absorbed
        .by(SELECTED_PLAYER)
        .spell([SPELLS.HOLY_BULWARK_BUFF, SPELLS.HOLY_BULWARK_ABSORB]),
      this.onAbsorb,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SACRED_WEAPON_TALENT, TALENTS.HOLY_ARMAMENTS_TALENT]),
      this.onCast,
    );

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.HOLY_BULWARK_BUFF, SPELLS.SACRED_WEAPON_BUFF]),
      this.onApply,
    );

    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.HOLY_BULWARK_BUFF, SPELLS.SACRED_WEAPON_BUFF]),
      this.onApply,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell(this.hasAC ? SPELLS.AVENGING_CRUSADER : SPELLS.AVENGING_WRATH),
      this.onWings,
    );
  }

  onDamage(event: DamageEvent) {
    this.damageSource[event.ability.guid] += event.amount;
  }

  onHeal(event: HealEvent) {
    const amount = event.amount + (event.absorbed || 0);
    this.healingSource[event.ability.guid] += amount;
  }

  onAbsorb(event: AbsorbedEvent) {
    this.healingSource[event.ability.guid] += event.amount;
  }

  onWings(event: CastEvent) {
    this.appliedFromWings += 2;
    this.appliedFromDivineInspiration -= 2;
  }

  onCast(event: CastEvent) {
    this.appliedFromCast += 2;
    this.appliedFromDivineInspiration -= 2;
  }

  onApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.appliedFromDivineInspiration += 1;
  }

  get totalHealing() {
    return Object.values(this.healingSource).reduce((sum, value) => sum + value, 0);
  }

  get totalDamage() {
    return Object.values(this.damageSource).reduce((sum, value) => sum + value, 0);
  }

  get totalAbsorbHealing() {
    return (
      this.healingSource[SPELLS.HOLY_BULWARK_BUFF.id] +
      this.healingSource[SPELLS.HOLY_BULWARK_ABSORB.id]
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.HOLY_BULWARK_BUFF} /> Absorb Healing:{' '}
            {formatNumber(this.totalAbsorbHealing)} <br />
            <br />
            <SpellLink spell={SPELLS.SACRED_WEAPON_HEAL} /> Healing:{' '}
            {formatNumber(this.healingSource[SPELLS.SACRED_WEAPON_HEAL.id])} <br />
            <SpellLink spell={SPELLS.SACRED_WEAPON_DAMAGE} /> Damage:{' '}
            {formatNumber(this.damageSource[SPELLS.SACRED_WEAPON_DAMAGE.id])} <br />
            <br />
            <SpellLink spell={SPELLS.BLESSING_OF_THE_FORGE_DAMAGE} /> Healing:
            <ul>
              <li>
                <SpellLink spell={SPELLS.RADIANT_AURA_HEAL} /> from{' '}
                <SpellLink spell={SPELLS.LIGHT_OF_DAWN_HEAL} />:{' '}
                {formatNumber(this.healingSource[SPELLS.RADIANT_AURA_HEAL.id])}
              </li>
              <li>
                <SpellLink spell={SPELLS.SACRED_WORD_HEAL} /> from{' '}
                <SpellLink spell={SPELLS.WORD_OF_GLORY} />:{' '}
                {formatNumber(this.healingSource[SPELLS.SACRED_WORD_HEAL.id])}
              </li>
            </ul>
            <SpellLink spell={SPELLS.BLESSING_OF_THE_FORGE_DAMAGE} /> Damage:{' '}
            {formatNumber(this.damageSource[SPELLS.BLESSING_OF_THE_FORGE_DAMAGE.id])} <br />
            <br />
            <SpellLink spell={TALENTS.HOLY_ARMAMENTS_TALENT} /> Applications:{' '}
            <ul>
              <li>
                <SpellLink spell={TALENTS.HOLY_ARMAMENTS_TALENT} />:{' '}
                {formatNumber(this.appliedFromCast)}
              </li>
              <li>
                <SpellLink spell={TALENTS.DIVINE_INSPIRATION_TALENT} />:{' '}
                {formatNumber(this.appliedFromDivineInspiration)}
              </li>
              <li>
                <SpellLink spell={TALENTS.BLESSING_OF_THE_FORGE_TALENT} />:{' '}
                {formatNumber(this.appliedFromWings)}
              </li>
            </ul>
            <br />
          </>
        }
      >
        <TalentSpellText talent={TALENTS.HOLY_ARMAMENTS_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            <ItemDamageDone amount={this.totalDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HolyArmaments;
