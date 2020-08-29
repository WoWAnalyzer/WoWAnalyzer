import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWclApi';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'interface/others/LazyLoadStatisticBox';
import makeWclUrl from 'common/makeWclUrl';
import Tooltip from 'common/Tooltip';

const AURA_OF_SACRIFICE_PASSIVE_DAMAGE_TRANSFER_REDUCTION = 0.5;
const AURA_OF_SACRIFICE_HEALTH_REQUIREMENT = 0.75;
const AURA_OF_SACRIFICE_ACTIVE_DAMAGE_TRANSFER = 0.3;

class AuraOfSacrificeDamageReduction extends Analyzer {
  passiveDamageTaken = 0;
  passiveDamageTransferred = 0;
  perSecond(amount) {
    return (amount / this.owner.fightDuration) * 1000;
  }
  get passiveDamageReduced() {
    return this.passiveDamageTransferred - this.passiveDamageTaken;
  }
  get passiveDrps() {
    return this.perSecond(this.passiveDamageReduced);
  }
  activeDamageTaken = 0;
  activeDamageTransferred = 0;
  get activeDamageReduced() {
    return this.activeDamageTransferred - this.activeDamageTaken;
  }
  get activeDrps() {
    return this.perSecond(this.activeDamageReduced);
  }
  get totalDamageReduced() {
    return this.passiveDamageReduced + this.activeDamageReduced;
  }
  get drps() {
    return this.passiveDrps + this.activeDrps;
  }

  get filter() {
    const playerName = this.owner.player.name;
    // Include any damage while selected player has AM
    // and is above the health requirement but not immune (immunity events do not have a valid hpPercent!),
    //   * This doesn't work: https://www.warcraftlogs.com/reports/vTp9h8DAwZVWbRQM/#fight=5&type=damage-taken&pins=2%24Off%24%23244F4B%24expression%24(IN%20RANGE%20FROM%20target.name%3D%27Punisherlul%27%20AND%20resources.hpPercent%3E%3D75%20TO%20target.name%3D%27Punisherlul%27%20AND%20resources.hpPercent%3C75%20END)&view=events
    //   * This does work: https://www.warcraftlogs.com/reports/vTp9h8DAwZVWbRQM/#fight=5&type=damage-taken&pins=2%24Off%24%23244F4B%24expression%24(IN%20RANGE%20FROM%20target.name%3D%27Punisherlul%27%20AND%20resources.hpPercent%3E%3D75%20AND%20missType!%3D%27immune%27%20TO%20target.name%3D%27Punisherlul%27%20AND%20resources.hpPercent%3C75%20AND%20missType!%3D%27immune%27%20END)&view=events
    // and the damage isn't to him (because AoS transfers it to the Paladin, so he doesn't gain any DR)
    // and the mitigation percentage is greater than 29% (because health events are logged slower than damage events, and the game properly tracks this realtime, some events may slip through while we're <75% so we need to use this to reduce the false positives. We use DR-1% to account for rounding)
    // prettier-ignore
    return `(IN RANGE FROM target.name='${playerName}' AND type='${EventType.ApplyBuff}' AND ability.id=${SPELLS.AURA_MASTERY.id} TO target.name='${playerName}' AND type='${EventType.RemoveBuff}' AND ability.id=${SPELLS.AURA_MASTERY.id} END)
      AND (IN RANGE FROM target.name='${playerName}' AND resources.hpPercent>=${AURA_OF_SACRIFICE_HEALTH_REQUIREMENT * 100} AND missType!='immune' TO target.name='${playerName}' AND resources.hpPercent<${AURA_OF_SACRIFICE_HEALTH_REQUIREMENT * 100} AND missType!='immune' END)
      AND target.name!='${playerName}'
      AND (mitigatedDamage/rawDamage*100)>${AURA_OF_SACRIFICE_ACTIVE_DAMAGE_TRANSFER * 100 - 1}`;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_SACRIFICE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.handlePassiveTransfer);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.handleHealthUpdate);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.handleHealthUpdate);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.AURA_MASTERY),
      this.handleApplyAuraMastery,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.AURA_MASTERY),
      this.handleRemoveAuraMastery,
    );
  }

  // TODO: Account for passive damage transferred during Divine Shield

  handlePassiveTransfer(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AURA_OF_SACRIFICE_TRANSFER.id) {
      return;
    }

    const damageTaken = event.amount + (event.absorbed || 0) + (event.overkill || 0);

    if (this.isAuraMasteryActive) {
      // Just track the actual damage taken to subtract from the transferred damage to get the damage reduced. The transferred damage is calculated elsewhere.
      this.activeDamageTaken += damageTaken;
      if (!this.isTransferring) {
        console.warn('AuraOfSacrifice', 'Took active damage while not actively transferring.');
      }
    } else {
      this.passiveDamageTaken += damageTaken;
      // We need to include mitigated damage so we can use the raw damage taken to calculate the original damage transferred
      const rawDamageTaken = damageTaken + (event.mitigated || 0);
      const damageTransferred =
        rawDamageTaken / AURA_OF_SACRIFICE_PASSIVE_DAMAGE_TRANSFER_REDUCTION;
      this.passiveDamageTransferred += damageTransferred;
    }
  }
  isAuraMasteryActive = false;
  isTransferring = false;
  handleApplyAuraMastery() {
    this.isAuraMasteryActive = true;
    // TODO: Suggestion when user popped AM without meeting the health requirement
    this.updateTransferringState(this.hasSufficientHealth);
  }
  handleRemoveAuraMastery() {
    this.isAuraMasteryActive = false;
    this.updateTransferringState(false);
  }
  healthPercentage = null;
  handleHealthUpdate(event) {
    if (!event.maxHitPoints) {
      // Some events (such as immuned damage events) don't have hit point info
      return;
    }
    this.healthPercentage = event.hitPoints / event.maxHitPoints;
    if (this.isAuraMasteryActive) {
      this.updateTransferringState(this.hasSufficientHealth);
    }
  }
  get hasSufficientHealth() {
    return this.healthPercentage >= AURA_OF_SACRIFICE_HEALTH_REQUIREMENT;
  }
  auraMasteryTransferringHistory = [];
  updateTransferringState(isActive) {
    if (this.isTransferring === isActive) {
      // No change
      return;
    }
    this.isTransferring = isActive;
    if (isActive) {
      this.auraMasteryTransferringHistory.push({
        start: this.owner.currentTimestamp,
        end: null,
      });
    } else {
      const current = this.auraMasteryTransferringHistory[
        this.auraMasteryTransferringHistory.length - 1
      ];
      current.end = this.owner.currentTimestamp;
    }
  }

  loaded = false;
  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then(json => {
      console.log('Received AM damage taken', json);
      const actualRaidDamageTaken = json.entries
        .filter(entry => entry.id !== this.owner.playerId) // the Paladin doesn't enjoy the DR
        .reduce((damageTaken, entry) => damageTaken + entry.total, 0);
      const rawRaidDamageTaken =
        actualRaidDamageTaken / (1 - AURA_OF_SACRIFICE_ACTIVE_DAMAGE_TRANSFER);
      const damageTransferred = rawRaidDamageTaken * AURA_OF_SACRIFICE_ACTIVE_DAMAGE_TRANSFER;
      this.activeDamageTransferred = damageTransferred;
      this.loaded = true;
    });
  }

  statistic() {
    const passiveDamageTransferred = this.passiveDamageTransferred;
    const passiveDamageReduced = this.passiveDamageReduced;
    const activeDamageTransferred = this.activeDamageTransferred;
    const activeDamageReduced = this.activeDamageReduced;
    const totalDamageTransferred = passiveDamageTransferred + activeDamageTransferred;
    const totalDamageReduced = passiveDamageReduced + activeDamageReduced;

    const tooltip = this.loaded ? (
      <Trans>
        <strong>Passive:</strong>
        <br />
        Damage transferred: {formatThousands(passiveDamageTransferred)} damage (
        {formatThousands(this.perSecond(passiveDamageTransferred))} DTPS)
        <br />
        Effectively damage reduction: {formatThousands(passiveDamageReduced)} (
        {formatThousands(this.passiveDrps)} DRPS)
        <br />
        <strong>Active (Aura Mastery):</strong>
        <br />
        Damage transferred: {formatThousands(activeDamageTransferred)} damage (
        {formatThousands(this.perSecond(activeDamageTransferred))} DTPS)
        <br />
        Effective damage reduction: {formatThousands(activeDamageReduced)} (
        {formatThousands(this.activeDrps)} DRPS)
        <br />
        <strong>Total:</strong>
        <br />
        Damage transferred: {formatThousands(totalDamageTransferred)} damage (
        {formatThousands(this.perSecond(totalDamageTransferred))} DTPS)
        <br />
        Effective damage reduction: {formatThousands(totalDamageReduced)} damage (
        {formatThousands(this.perSecond(totalDamageReduced))} DRPS /{' '}
        {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalDamageReduced))}
        % of total healing)
        <br />
        <br />
        This is an estimation. There are several ways to calculate the effective damage reduction of
        buffs, this uses the lowest method. At the same time the log's health tracking (and thus AM
        activity) isn't perfect, so there might be a few false positives when there's a lot of
        damage at the exact same moment.
        <br />
        <br />
        Any damage transferred by the <strong>passive</strong> while immune (if applicable) is{' '}
        <em>not</em> included.
      </Trans>
    ) : (
      <Trans>Click to load the required data.</Trans>
    );
    const footer = this.loaded && (
      <div className="statistic-box-bar">
        <Tooltip
          content={
            <Trans>
              You effectively reduced damage taken by a total of{' '}
              {formatThousands(totalDamageReduced)} damage (
              {formatThousands(this.perSecond(totalDamageReduced))} DRPS).
            </Trans>
          }
        >
          <div
            className="stat-health-bg"
            style={{
              width: `${(totalDamageReduced / totalDamageTransferred) * 100}%`,
            }}
          >
            <img src="/img/shield.png" alt={<Trans>Damage reduced</Trans>} />
          </div>
        </Tooltip>
        <Tooltip
          content={
            <Trans>
              You transferred a total of {formatThousands(totalDamageTransferred)} damage (
              {formatThousands(this.perSecond(totalDamageTransferred))} DTPS).
            </Trans>
          }
        >
          <div className="remainder DeathKnight-bg">
            <img src="/img/shield-open.png" alt={<Trans>Damage transferred</Trans>} />
          </div>
        </Tooltip>
      </div>
    );

    return (
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} />}
        value={<Trans>≈{formatNumber(this.drps)} DRPS</Trans>}
        label={<Trans>Damage reduced</Trans>}
        tooltip={tooltip}
        footer={footer}
        drilldown={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-taken',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      />
    );
  }
}

export default AuraOfSacrificeDamageReduction;
