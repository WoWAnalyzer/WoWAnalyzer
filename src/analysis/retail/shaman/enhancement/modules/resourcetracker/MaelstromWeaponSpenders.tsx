import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import Panel from 'parser/ui/Panel';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import Events, {
  DamageEvent,
  HealEvent,
  GetRelatedEvents,
  CastEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { SpellLink } from 'interface';
import Abilities from 'parser/core/modules/Abilities';
import { formatNumber, formatThousands } from 'common/format';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS, { maybeGetSpell } from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { LIGHTNING_BOLT_LINK } from '../normalizers/EventLinkNormalizer';
import { PRIMORDIAL_WAVE_LINK } from 'analysis/retail/shaman/shared/constants';

export default class extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
    abilities: Abilities,
    abilityTracker: AbilityTracker,
  };

  protected abilities!: Abilities;
  protected abilityTracker!: AbilityTracker;
  protected maelstromWeaponTracker!: MaelstromWeaponTracker;
  protected spenderValues: Record<number, number> = [];
  protected recordNextSpenderAmount: boolean = false;
  protected maelstromSpendWithPrimordialWave: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);

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

    if (event.ability.guid === SPELLS.LIGHTNING_BOLT.id) {
      // lightning bolts linked to a primoridal wave should be included as part of primoridal wave's damage
      const primordialWave = GetRelatedEvent<CastEvent>(event, PRIMORDIAL_WAVE_LINK);
      const lightningBolts = primordialWave
        ? GetRelatedEvent<CastEvent>(primordialWave, PRIMORDIAL_WAVE_LINK)
        : undefined;
      if (primordialWave && lightningBolts) {
        const damageEvents = GetRelatedEvents(lightningBolts, LIGHTNING_BOLT_LINK) as DamageEvent[];
        if (damageEvents.length > 1) {
          const spellId = TALENTS_SHAMAN.PRIMORDIAL_WAVE_SPEC_TALENT.id;
          // the first lightning bolt is a regular bolt
          damageEvents?.splice(0, 1);
          this.spenderValues[spellId] =
            (this.spenderValues[spellId] ?? 0) +
            damageEvents.reduce((total: number, de: DamageEvent) => (total += de.amount), 0);
          this.maelstromSpendWithPrimordialWave += this.maelstromWeaponTracker.current;
        }
      }
    }
  }

  onSpender(event: DamageEvent | HealEvent) {
    if (!this.recordNextSpenderAmount) {
      return;
    }
    this.recordNextSpenderAmount = false;

    let spellId = event.ability.guid;
    if (spellId === SPELLS.LAVA_BURST_DAMAGE.id) {
      spellId = TALENTS_SHAMAN.LAVA_BURST_TALENT.id;
    }
    this.spenderValues[spellId] = (this.spenderValues[spellId] ?? 0) + event.amount;
  }

  statistic() {
    return [
      <Panel key="spender-panel" title="Maelstrom Weapon usage" pad={false} position={120}>
        <ResourceBreakdown tracker={this.maelstromWeaponTracker} showSpenders showMaxSpenders />
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
            {Object.keys(this.spenderValues).map((value) => {
              const spellId = Number(value);
              const spell = maybeGetSpell(spellId);
              const ability = this.abilityTracker.getAbility(spellId);
              const casts = ability.casts;
              let spent: number;
              if (spellId === TALENTS_SHAMAN.PRIMORDIAL_WAVE_SPEC_TALENT.id) {
                spent = this.maelstromSpendWithPrimordialWave;
              } else {
                spent = this.maelstromWeaponTracker.spendersObj[spellId]?.spent || 0;
              }

              const amount = this.spenderValues[spellId];
              return (
                spell && (
                  <>
                    <tr key={spellId}>
                      <td>
                        <SpellLink spell={spell} />
                        {spellId === TALENTS_SHAMAN.PRIMORDIAL_WAVE_SPEC_TALENT.id && (
                          <>
                            {' '}
                            buffed <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
                            's
                          </>
                        )}
                      </td>
                      <td className="text-right">{casts}</td>
                      <td className="text-right">{formatThousands(amount / spent)}</td>
                      <td className="text-right">{formatNumber(spent / casts)}</td>
                      <td className="text-right">{formatThousands(amount / casts)}</td>
                    </tr>
                  </>
                )
              );
            })}
          </tbody>
        </table>
      </Panel>,
    ];
  }
}
