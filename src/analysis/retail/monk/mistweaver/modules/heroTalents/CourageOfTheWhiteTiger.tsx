import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { CAST_BUFFER_MS } from '../../normalizers/EventLinks/EventLinkConstants';
import UnityWithin from './UnityWithin';
import { getCurrentCelestialTalent } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// cotwt has a weird travel time
const PROC_WINDOW_MS = 3000;

const PROC_SPELLS: Spell[] = [SPELLS.TIGER_PALM, SPELLS.VIVIFY, TALENTS_MONK.SHEILUNS_GIFT_TALENT];

class CourageOfTheWhiteTiger extends Analyzer.withDependencies({
  unityWithin: UnityWithin,
}) {
  talent = TALENTS_MONK.COURAGE_OF_THE_WHITE_TIGER_TALENT;
  healing = 0;
  damage = 0;
  procsBySpell = new Map<number, number>();
  guaranteedProcs = 0;
  wastedGuaranteedProcs = 0;
  lastCast: CastEvent | undefined;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(PROC_SPELLS), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COURAGE_OF_THE_WHITE_TIGER_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.COURAGE_OF_THE_WHITE_TIGER_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COURAGE_OF_THE_WHITE_TIGER_BUFF),
      this.onGuaranteedProc,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.COURAGE_OF_THE_WHITE_TIGER_BUFF),
      this.onGuaranteedProcEnd,
    );
  }

  onCast(event: CastEvent) {
    this.lastCast = event;
  }

  isFromCast(timestamp: number): boolean {
    return (
      this.lastCast !== undefined &&
      timestamp - this.lastCast.timestamp <= PROC_WINDOW_MS &&
      !this.deps.unityWithin.isUnityCourage(timestamp)
    );
  }

  onDamage(event: DamageEvent) {
    if (!this.isFromCast(event.timestamp)) return;

    this.damage += event.amount + (event.absorbed || 0);
    const spellId = this.lastCast!.ability.guid;
    this.procsBySpell.set(spellId, (this.procsBySpell.get(spellId) || 0) + 1);
  }

  onHeal(event: HealEvent) {
    if (this.isFromCast(event.timestamp)) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  onGuaranteedProc() {
    this.guaranteedProcs += 1;
  }

  onGuaranteedProcEnd(event: RemoveBuffEvent) {
    const consumed =
      this.lastCast !== undefined && event.timestamp - this.lastCast.timestamp <= CAST_BUFFER_MS;
    if (!consumed) {
      this.wastedGuaranteedProcs += 1;
    }
  }

  get procs() {
    return Array.from(this.procsBySpell.values()).reduce((sum, procs) => sum + procs, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <ul>
            <li>{this.procs} procs</li>
            <ul>
              {PROC_SPELLS.filter((spell) => this.procsBySpell.has(spell.id)).map((spell) => (
                <li key={spell.id}>
                  {this.procsBySpell.get(spell.id)} from <SpellLink spell={spell} />
                </li>
              ))}
            </ul>
            <li>
              {this.guaranteedProcs} guaranteed procs from{' '}
              <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} />
            </li>
            {this.wastedGuaranteedProcs > 0 && (
              <ul>
                <li>{this.wastedGuaranteedProcs} wasted</li>
              </ul>
            )}
          </ul>
        }
      >
        <TalentSpellText talent={this.talent}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CourageOfTheWhiteTiger;
