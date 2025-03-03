import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';

class Stormsurge extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  protected stormStrikeResets: number = 0;
  protected windStrikeResets: number = 0;
  protected sunderingResets: number = 0;
  protected wasted: number = 0;

  protected hasMoltenThunder: boolean = false;

  constructor(options: Options) {
    super(options);

    this.hasMoltenThunder = this.selectedCombatant.hasTalent(TALENTS.MOLTEN_THUNDER_TALENT);

    [Events.applybuff, Events.applybuffstack, Events.refreshbuff].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.STORMSURGE_BUFF),
        this.onStormsurgeApplied,
      ),
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
      this.onAscendanceEnd,
    );
  }

  onStormsurgeApplied(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    let used = false;
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
      if (this.deps.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
        this.deps.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id, event.timestamp);
        this.windStrikeResets += 1;
        used = true;
      }
    } else {
      if (this.deps.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE.id)) {
        this.deps.spellUsable.endCooldown(SPELLS.STORMSTRIKE.id, event.timestamp);
        this.stormStrikeResets += 1;
        used = true;
      }
    }

    if (!used) {
      this.wasted += 1;
    }
  }

  onAscendanceEnd(event: RemoveBuffEvent) {
    this.deps.spellUsable.endCooldown(SPELLS.STORMSTRIKE.id, event.timestamp, true, true);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={
          <>
            <div>
              {this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT) ||
              this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ? (
                <>
                  Reset breakdown:
                  <ul>
                    <li>
                      <strong>{this.stormStrikeResets}</strong>{' '}
                      <SpellLink spell={SPELLS.STORMSTRIKE} /> resets
                    </li>
                    <li>
                      <strong>{this.windStrikeResets}</strong>{' '}
                      <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> resets
                    </li>
                    {this.hasMoltenThunder && (
                      <li>
                        <strong>{this.sunderingResets}</strong>{' '}
                        <SpellLink spell={TALENTS.SUNDERING_TALENT} /> resets
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <>
                  <strong>{this.stormStrikeResets}</strong> <SpellLink spell={SPELLS.STORMSTRIKE} />{' '}
                  resets
                </>
              )}
            </div>
            <div>
              <small>
                <strong>{this.wasted}</strong> wasted procs
              </small>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.STORMSURGE}>
          <>
            <UptimeIcon /> {formatNumber(this.stormStrikeResets + this.windStrikeResets)}{' '}
            <small>
              <SpellLink spell={SPELLS.STORMSTRIKE} /> resets
            </small>
          </>
        </BoringSpellValueText>
        {this.hasMoltenThunder && (
          <BoringSpellValueText spell={TALENTS.MOLTEN_THUNDER_TALENT}>
            <>
              <UptimeIcon /> {formatNumber(this.sunderingResets)}{' '}
              <small>
                <SpellLink spell={TALENTS.SUNDERING_TALENT} /> resets
              </small>
            </>
          </BoringSpellValueText>
        )}
      </Statistic>
    );
  }
}

export default Stormsurge;
