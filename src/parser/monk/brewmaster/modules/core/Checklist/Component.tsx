import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const Component = ({ combatant, castEfficiency, thresholds }: any) => {
  const AbilityRequirement = (props: { spell: number }) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule name="Top the Damage Charts"
            description={(
              <>
                While the <em>primary</em> role of a tank is to get hit in the face a bunch and not die in the process, once that is under control we get to spend some energy dealing damage! Maintaining a <a href="https://www.peakofserenity.com/bfa/brewmaster/guide/">correct DPS rotation</a> also provides optimal brew generation. <strong>However, if you are dying, ignore this checklist item!</strong> As much as we may enjoy padding for those sweet orange parses, not-wiping takes precedence.
              </>
            )}>
        <AbilityRequirement spell={SPELLS.KEG_SMASH.id} />
        <AbilityRequirement spell={SPELLS.BLACKOUT_KICK_BRM.id} />
        <AbilityRequirement spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} />
        {combatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id) && (
          <>
            <Requirement
              name={<><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id} />-empowered <SpellLink id={SPELLS.TIGER_PALM.id} >Tiger Palms</SpellLink></>}
              thresholds={thresholds.bocTp} />
            <Requirement
              name={<><SpellLink id={SPELLS.BLACKOUT_COMBO_TALENT.id}>Blackout Combos</SpellLink> spent on <SpellLink id={SPELLS.TIGER_PALM.id} /></>}
              thresholds={thresholds.bocDpsWaste} />
          </>
        )}
        {combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT_BREWMASTER.id) && (
          <Requirement name={<><SpellLink id={SPELLS.RUSHING_JADE_WIND.id} /> uptime</>}
                       thresholds={thresholds.rjw} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds}></PreparationRule>
    </Checklist>
  );
};

export default Component;
