import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';
import Panel from 'parser/ui/Panel';
import { EnhancementEventLinks, MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HealEvent,
} from 'parser/core/Events';
import { SpellLink, Tooltip } from 'interface';
import { formatNumber, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import MaelstromWeaponBreakdown from './MaelstromWeaponBreakdown';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { DamageIcon } from 'interface/icons';

class MaelstromWeaponSpenders extends Analyzer.withDependencies({
  maelstromWeaponTracker: MaelstromWeaponTracker,
}) {
  private spenderValues = new Map<number, number>();
  private recordNextSpenderAmount = false;
  private primordialStormBreakdown = {
    [SPELLS.PRIMORDIAL_FIRE.id]: 0,
    [SPELLS.PRIMORDIAL_LIGHTNING.id]: 0,
    [SPELLS.PRIMORDIAL_FROST.id]: 0,
    [SPELLS.LIGHTNING_BOLT.id]: 0,
    [TALENTS.CHAIN_LIGHTNING_TALENT.id]: 0,
  };
  private isPrimordialStormRelatedDamage = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onSpender,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onSpender,
    );
  }

  onCast(event: CastEvent) {
    this.recordNextSpenderAmount = true;
    this.isPrimordialStormRelatedDamage = event.ability.guid === SPELLS.PRIMORDIAL_STORM_CAST.id;
    if (event.ability.guid === TALENTS.CHAIN_LIGHTNING_TALENT.id) {
      const damageEvents = GetRelatedEvents<DamageEvent>(
        event,
        EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
        (e) => e.type === EventType.Damage,
      );
      this.spenderValues.set(
        event.ability.guid,
        (this.spenderValues.get(event.ability.guid) ?? 0) +
          damageEvents.reduce((total: number, de: DamageEvent) => (total += de.amount), 0),
      );
      this.recordNextSpenderAmount = false;
      return;
    }
  }

  onSpender(event: DamageEvent | HealEvent) {
    if (!this.recordNextSpenderAmount) {
      return;
    }
    let spellId = event.ability.guid;
    if (spellId === SPELLS.LAVA_BURST_DAMAGE.id) {
      spellId = TALENTS.LAVA_BURST_TALENT.id;
    }
    if (this.isPrimordialStormRelatedDamage) {
      this.primordialStormBreakdown[spellId] += event.amount + (event.absorbed ?? 0);
      spellId = SPELLS.PRIMORDIAL_STORM_CAST.id;
    }
    this.spenderValues.set(
      spellId,
      (this.spenderValues.get(spellId) ?? 0) + event.amount + (event.absorbed ?? 0),
    );
  }

  statistic() {
    return [
      <Panel key="spender-panel" title="Maelstrom Weapon usage" pad={false} position={120}>
        <MaelstromWeaponBreakdown
          tracker={this.deps.maelstromWeaponTracker}
          showSpenders
          showMaxSpenders
        />
      </Panel>,
      <Panel
        key="damage-per-spender"
        title="Maelstrom Weapon efficiency"
        pad={false}
        position={121}
      >
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Ability</th>
              <th className="text-right">Casts</th>
              <th className="text-right">Dmg / MSW</th>
              <th className="text-right">Avg. MSW / Cast</th>
              <th className="text-right">Avg. Cast</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(this.spenderValues.keys()).map((value) => {
              const spellId = Number(value);
              const spell = maybeGetTalentOrSpell(spellId);

              const spender = this.deps.maelstromWeaponTracker.spendersObj[spellId];
              if (!(spender && spell)) {
                return null;
              }
              const amount = this.spenderValues.get(spellId)!;
              const avg = formatThousands(amount / spender.casts);

              let amountValue;
              if (spellId === SPELLS.PRIMORDIAL_STORM_CAST.id) {
                const tooltip = (
                  <>
                    {Object.keys(this.primordialStormBreakdown).map((x) => {
                      const damage = this.primordialStormBreakdown[Number(x)];
                      return damage === 0 ? null : (
                        <div key={`pstorm-${x}`}>
                          <SpellLink spell={Number(x)} />: <DamageIcon />{' '}
                          {formatThousands(
                            this.primordialStormBreakdown[Number(x)] / spender.casts,
                          )}
                        </div>
                      );
                    })}
                  </>
                );
                amountValue = (
                  <>
                    <Tooltip content={<div>{tooltip}</div>} hoverable direction="up">
                      <dfn>{avg}</dfn>
                    </Tooltip>
                  </>
                );
              } else {
                amountValue = <>{avg}</>;
              }

              return (
                spell && (
                  <tr key={spellId}>
                    <td>
                      <SpellLink spell={spell} />
                    </td>
                    <td className="text-right">{spender.casts}</td>
                    <td className="text-right">{formatThousands(amount / spender.spent)}</td>
                    <td className="text-right">{formatNumber(spender.spent / spender.casts)}</td>
                    <td className="text-right">{amountValue}</td>
                  </tr>
                )
              );
            })}
          </tbody>
        </table>
        <div className="panel-footer">
          <p>
            <small>
              Note: Damage/Healing values include increases from Augmentation Evokers. Click the{' '}
              <i>Augmented Damage</i>/<i>Augmented Healing</i> tabs in WCL if the values don't align
            </small>
          </p>
        </div>
      </Panel>,
    ];
  }
}

export default MaelstromWeaponSpenders;
