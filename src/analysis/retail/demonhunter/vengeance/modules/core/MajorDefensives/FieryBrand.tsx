import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import Events, { DamageEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';
import { ReactNode } from 'react';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { absoluteMitigation, MajorDefensive } from 'interface/guide/components/MajorDefensives';

export default class FieryBrand extends MajorDefensive {
  static dependencies = {
    ...MajorDefensive.dependencies,
  };

  constructor(options: Options) {
    super(
      {
        triggerSpell: TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT,
        appliedSpell: SPELLS.FIERY_BRAND_DOT,
        isBuff: false,
      },
      options,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.isDefensiveActive(event, true) || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.4),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <Trans id="guide.demonhunter.vengeance.sections.defensives.fieryBrand.explanation.summary">
          <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> reduces the damage dealt to you
          by targets with its debuff by <strong>40%</strong>.
        </Trans>
      </p>
    );
  }
}
