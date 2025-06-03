import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

interface HealingInfo {
  totalAmount: number;
  totalOverheal: number;
  hits: {
    timestamp: number;
    amount: number;
    overheal: number;
  }[];
}

interface DamageInfo {
  totalAmount: number;
  count: number;
}

class Dawnlight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  healingSource = new Map<number, HealingInfo>();
  damageSource = new Map<number, DamageInfo>();

  refreshed = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DAWNLIGHT_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DAWNLIGHT_AOE_HEAL,
          SPELLS.DAWNLIGHT_HEAL,
          SPELLS.SUNS_AVATAR_HEAL,
          SPELLS.SUNS_AVATAR_HEAL_SELF_APPLIED,
        ]),
      this.onHeal,
    );

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DAWNLIGHT_DAMAGE,
          SPELLS.SUNS_AVATAR_DAMAGE,
          SPELLS.SUNS_AVATAR_DAMAGE_SELF_APPLIED,
        ]),
      this.onDamage,
    );
  }

  addToHealingSource(spellId: number, amount: number, overheal: number, timestamp: number) {
    if (!this.healingSource.has(spellId)) {
      this.healingSource.set(spellId, {
        totalAmount: 0,
        totalOverheal: 0,
        hits: [],
      });
    }
    const entry = this.healingSource.get(spellId)!;
    entry.totalAmount += amount;
    entry.totalOverheal += overheal;
    entry.hits.push({ timestamp, amount, overheal });
  }

  addToDamageSource(spellId: number, amount: number) {
    if (!this.damageSource.has(spellId)) {
      this.damageSource.set(spellId, { totalAmount: 0, count: 0 });
    }
    const entry = this.damageSource.get(spellId)!;
    entry.totalAmount += amount;
    entry.count += 1;
  }

  get totalHealing() {
    const values = Array.from(this.healingSource.values());
    return values.reduce((sum, entry) => sum + entry.totalAmount, 0);
  }

  get totalOverhealing() {
    const values = Array.from(this.healingSource.values());
    return values.reduce((sum, entry) => sum + entry.totalOverheal, 0);
  }

  get totalDamage() {
    const values = Array.from(this.damageSource.values());
    return values.reduce((sum, entry) => sum + entry.totalAmount, 0);
  }

  getAvgTargets(spellId: number): number {
    const entry = this.healingSource.get(spellId);
    if (!entry || entry.hits.length === 0) return 0;

    const grouped = new Map<number, number>();
    for (const hit of entry.hits) {
      const key = Math.floor(hit.timestamp / 20);
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }

    return grouped.size > 0 ? entry.hits.length / grouped.size : 0;
  }

  onDamage(event: DamageEvent) {
    const amount = event.amount + (event.absorbed || 0);
    this.addToDamageSource(event.ability.guid, amount);
  }

  onHeal(event: HealEvent) {
    const amount = event.amount + (event.absorbed || 0);
    const overheal = event.overheal || 0;
    this.addToHealingSource(event.ability.guid, amount, overheal, event.timestamp);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <div>
              <div>Effective Healing: {formatNumber(this.totalHealing)}</div>
              <div>Overhealing: {formatNumber(this.totalOverhealing)}</div>
              <div>Total Damage: {formatNumber(this.totalDamage)}</div>
            </div>
            <br />
            <div>
              <div>
                <SpellLink spell={SPELLS.DAWNLIGHT_HEAL} /> Main Target Healing:{' '}
                {formatNumber(this.healingSource.get(SPELLS.DAWNLIGHT_HEAL.id)?.totalAmount || 0)}
              </div>
              <div>
                <SpellLink spell={SPELLS.DAWNLIGHT_AOE_HEAL} /> AoE Healing:{' '}
                {formatNumber(
                  this.healingSource.get(SPELLS.DAWNLIGHT_AOE_HEAL.id)?.totalAmount || 0,
                )}{' '}
                (Avg Targets: {this.getAvgTargets(SPELLS.DAWNLIGHT_AOE_HEAL.id).toFixed(1)})
              </div>
              <div>
                <SpellLink spell={SPELLS.DAWNLIGHT_DAMAGE} /> Damage:{' '}
                {formatNumber(this.damageSource.get(SPELLS.DAWNLIGHT_DAMAGE.id)?.totalAmount || 0)}
              </div>
            </div>
            <br />
            <div>
              <div>
                <SpellLink spell={SPELLS.SUNS_AVATAR_HEAL} /> Healing:{' '}
                {formatNumber(this.healingSource.get(SPELLS.SUNS_AVATAR_HEAL.id)?.totalAmount || 0)}{' '}
                (Avg Targets: {this.getAvgTargets(SPELLS.SUNS_AVATAR_HEAL.id).toFixed(1)})
              </div>
              <div>
                <SpellLink spell={SPELLS.SUNS_AVATAR_HEAL_SELF_APPLIED} /> Self-Applied Heal:{' '}
                {formatNumber(
                  this.healingSource.get(SPELLS.SUNS_AVATAR_HEAL_SELF_APPLIED.id)?.totalAmount || 0,
                )}{' '}
                (Avg Targets:{' '}
                {this.getAvgTargets(SPELLS.SUNS_AVATAR_HEAL_SELF_APPLIED.id).toFixed(1)})
              </div>
              <div>
                <SpellLink spell={SPELLS.SUNS_AVATAR_DAMAGE} /> Damage:{' '}
                {formatNumber(
                  this.damageSource.get(SPELLS.SUNS_AVATAR_DAMAGE.id)?.totalAmount || 0,
                )}
              </div>
              <div>
                <SpellLink spell={SPELLS.SUNS_AVATAR_DAMAGE_SELF_APPLIED} /> Self-Applied Damage:{' '}
                {formatNumber(
                  this.damageSource.get(SPELLS.SUNS_AVATAR_DAMAGE_SELF_APPLIED.id)?.totalAmount ||
                    0,
                )}
              </div>
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.DAWNLIGHT_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            <ItemDamageDone amount={this.totalDamage} />
          </div>
          <div>
            <SpellIcon spell={TALENTS.DAWNLIGHT_TALENT} />{' '}
            {this.getAvgTargets(SPELLS.DAWNLIGHT_AOE_HEAL.id).toFixed(1)}{' '}
            <small>average targets hit</small>
          </div>
          <div>
            <SpellIcon spell={TALENTS.SUNS_AVATAR_TALENT} />{' '}
            {this.getAvgTargets(SPELLS.SUNS_AVATAR_HEAL.id).toFixed(1)}{' '}
            <small>average targets hit</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Dawnlight;
