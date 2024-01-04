import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellLink from 'interface/SpellLink';
import { formatPercentage } from 'common/format';
import Tooltip from 'interface/Tooltip';
import InformationIcon from 'interface/icons/Information';

export const SCALING_PER_TARGET_HIT = 0.3;
export const INITIAL_HIT_SCALING = 0.6;

export const AcceleratingBladeExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.ACCELERATED_BLADE_TALENT)) {
    return null;
  }

  const primaryTargetScalingValue = 1 + INITIAL_HIT_SCALING;
  const secondaryTargetScalingValue = primaryTargetScalingValue * (1 - SCALING_PER_TARGET_HIT);
  const tertiaryTargetScalingValue = secondaryTargetScalingValue * (1 - SCALING_PER_TARGET_HIT);

  // multiplicative scaling
  const primaryTargetScaling = formatPercentage(primaryTargetScalingValue, 0);
  const secondaryTargetScaling = formatPercentage(secondaryTargetScalingValue, 0);
  const tertiaryTargetScaling = formatPercentage(tertiaryTargetScalingValue, 0);

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
