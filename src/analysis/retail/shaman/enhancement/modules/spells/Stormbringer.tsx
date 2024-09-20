import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';

const debug = false;

class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected stormStrikeResets: number = 0;
  protected windStrikeResets: number = 0;
  protected wasted: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STORMBRINGER_BUFF),
      this.onStormbringerApplied,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STORMBRINGER_BUFF),
      () => (this.wasted += 1),
    );
  }

  onStormbringerApplied(event: ApplyBuffEvent | RefreshBuffEvent) {
    let used = false;
    if (
      this.spellUsable.isOnCooldown(TALENTS.STORMSTRIKE_TALENT.id) &&
      !this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id)
    ) {
      debug &&
        console.log(
          `Stormstrike reset by stormbringer at timestamp: ${
            event.timestamp
          } (${this.owner.formatTimestamp(event.timestamp, 3)})`,
        );
      this.spellUsable.endCooldown(TALENTS.STORMSTRIKE_TALENT.id, event.timestamp);
      if (!this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
        this.stormStrikeResets += 1;
        used = true;
      }
    }

    if (this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
      debug &&
        console.log(
          `Windstrike reset by stormbringer at timestamp: ${
            event.timestamp
          } (${this.owner.formatTimestamp(event.timestamp, 3)})`,
        );
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id, event.timestamp);
      if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
        this.windStrikeResets += 1;
        used = true;
      }
    }

    if (!used) {
      this.wasted += 1;
    }
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
                      <SpellLink spell={TALENTS.STORMSTRIKE_TALENT} /> resets
                    </li>
                    <li>
                      <strong>{this.windStrikeResets}</strong>{' '}
                      <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> resets
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <strong>{this.stormStrikeResets}</strong>{' '}
                  <SpellLink spell={TALENTS.STORMSTRIKE_TALENT} /> resets
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
        <BoringSpellValueText spell={SPELLS.STORMBRINGER}>
          <>
            <UptimeIcon /> {formatNumber(this.stormStrikeResets + this.windStrikeResets)}{' '}
            <small>resets</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormbringer;
