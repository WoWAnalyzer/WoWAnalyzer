import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import { TIERS } from 'game/TIERS';
import { UpArrowIcon, UptimeIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import UptimeBar from 'parser/ui/UptimeBar';

class T31AmirdrassilDemonology extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  has4Piece: boolean;

  doomBrand = {
    applyBuffCount: 0,
    removeBuffCount: 0,
    damage: 0,
    damageEvents: 0,
  };
  demonboltCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T31);
    this.has4Piece = this.active = this.selectedCombatant.has4PieceByTier(TIERS.T31);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_BRAND_DEBUFF),
      this.onDoomBrandApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_BRAND_DEBUFF),
      this.onDoomBrandRemove,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DOOM_BRAND_DAMAGE),
      this.onDoomBrandDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltDamage,
    );
  }

  onDoomBrandApply(event: ApplyDebuffEvent) {
    this.doomBrand.applyBuffCount += 1;
  }

  onDoomBrandRemove(event: RemoveDebuffEvent) {
    this.doomBrand.removeBuffCount += 1;
  }

  onDoomBrandDamage(event: DamageEvent) {
    this.doomBrand.damageEvents += 1;
    this.doomBrand.damage += event.amount + (event.absorbed || 0);
  }

  onDemonboltDamage(event: DamageEvent) {
    // TODO low prio
    // check if db was cast into a target with doombrand when a target without it is available
    this.demonboltCasts += 1;
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.DOOM_BRAND_DEBUFF.id) / this.owner.fightDuration;
  }

  get doomBrandHitsPerExpire() {
    return this.doomBrand.damageEvents / this.doomBrand.removeBuffCount;
  }

  get doomBrandDamagePerExpire() {
    return this.doomBrand.damage / this.doomBrand.removeBuffCount;
  }

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(5)}
        tooltip={<>Uptime should be as high as possible {'>'}85%</>}
      >
        <BoringSpellValueText spell={SPELLS.DOOM_BRAND_DEBUFF}>
          <div className="flex">
            <div className="flex-sub value" style={{ width: 160 }}>
              <UptimeIcon /> {formatPercentage(this.uptime, 0)}% <small>uptime</small>
            </div>
            <div className="flex-main chart" style={{ paddingTop: 10, paddingBottom: 10 }}>
              <UptimeBar
                uptimeHistory={this.enemies.getDebuffHistory(SPELLS.DOOM_BRAND_DEBUFF.id)}
                start={this.owner.fight.start_time}
                end={this.owner.fight.end_time}
              />
            </div>
          </div>
          <p>
            {this.doomBrand.removeBuffCount} <small>brands exploded</small>{' '}
            {this.doomBrand.damageEvents} <small>brand hits</small>{' '}
            {this.doomBrandHitsPerExpire > 1 && (
              <>
                <UpArrowIcon /> {this.doomBrandHitsPerExpire.toFixed(1)}{' '}
                <small>targets hit per brand</small>
              </>
            )}
          </p>
          <p>
            {formatNumber(this.doomBrandDamagePerExpire)} <small> avg. damage per brand</small>
          </p>
        </BoringSpellValueText>
        {/* <BoringSpellValueText spell={SPELLS.DOOM_BRAND_DEBUFF}>
					<div>
						<p>apply {this.doomBrand.applyBuffCount}</p>
						<p>remove {this.doomBrand.removeBuffCount}</p>
						<p>dmg events {this.doomBrand.damageEvents}</p>
						<p>hits/ {this.doomBrandHitsPerExpire}</p>
					</div>
				</BoringSpellValueText> */}
      </Statistic>
    );
  }
}

export default T31AmirdrassilDemonology;
