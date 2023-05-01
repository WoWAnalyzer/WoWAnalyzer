import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellLink from 'interface/SpellLink';
import { formatPercentage } from 'common/format';
import { ACCELERATING_BLADE_SCALING } from 'analysis/retail/demonhunter/havoc/constants';
import Tooltip from 'interface/Tooltip';
import InformationIcon from 'interface/icons/Information';

export const AcceleratingBladeExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.ACCELERATED_BLADE_TALENT)) {
    return null;
  }

  const scaling =
    ACCELERATING_BLADE_SCALING[info.combatant.getTalentRank(TALENTS.ACCELERATED_BLADE_TALENT)];
  const perTargetScaling = 1 + scaling;

  // multiplicative scaling
  const primaryTargetScaling = formatPercentage(perTargetScaling, 0);
  const secondaryTargetScaling = formatPercentage(perTargetScaling * perTargetScaling, 0);
  const tertiaryTargetScaling = formatPercentage(
    perTargetScaling * perTargetScaling * perTargetScaling,
    0,
  );

  return (
    <li>
      <div className="flex">
        <SpellLink spell={TALENTS.ACCELERATED_BLADE_TALENT} className="flex-main" />
        <div className="flex-sub" style={{ padding: '0 10px' }}>
          <Tooltip
            content={
              <div>
                {primaryTargetScaling}% damage to primary target
                <br />
                {secondaryTargetScaling}% damage to secondary target
                {info.combatant.hasTalent(TALENTS.BOUNCING_GLAIVES_TALENT) && (
                  <>
                    <br />
                    {tertiaryTargetScaling}% damage to tertiary target
                  </>
                )}
              </div>
            }
          >
            <div>
              <InformationIcon style={{ fontSize: '1.4em' }} />
            </div>
          </Tooltip>
        </div>
      </div>
    </li>
  );
};
