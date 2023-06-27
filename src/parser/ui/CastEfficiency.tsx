import { SpellLink, TooltipElement } from 'interface';
import SPELL_CATEGORY, { getSpellCategoryName } from 'parser/core/SPELL_CATEGORY';
import { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';

interface Props {
  abilities: AbilityCastEfficiency[];
}

const CastEfficiency = ({ abilities }: Props) => (
  <div style={{ marginTop: -10, marginBottom: -10 }}>
    <table className="data-table" style={{ marginTop: 10, marginBottom: 10 }}>
      {Object.values(SPELL_CATEGORY)
        .filter((category) => abilities.some((item) => item.ability.category === category)) // filters out categories without any abilities in it
        .filter((category) => category !== SPELL_CATEGORY.HIDDEN) //filters out the hidden category
        .map((category) => (
          <tbody key={category}>
            <tr>
              <th>
                <b>{getSpellCategoryName(category as SPELL_CATEGORY)}</b>
              </th>
              <th className="text-center">
                <TooltipElement content={<>Casts Per Minute</>}>
                  <>CPM</>
                </TooltipElement>
              </th>
              <th className="text-right">
                <TooltipElement
                  content={
                    <>
                      Maximum possible casts are based on the ability's cooldown and the fight
                      duration. For abilities that can have their cooldowns dynamically reduced or
                      reset, it's based on the average actual time it took the ability to cooldown
                      over the course of this encounter.
                    </>
                  }
                >
                  <>Casts</>
                </TooltipElement>
              </th>
              <th className="text-center">
                <TooltipElement
                  content={
                    <>
                      The percentage of time the spell was kept on cooldown. For spells without
                      charges this also includes when the spell was unavailable due to cast time or
                      time spent waiting for a GCD when the spell was reset due to a proc. Spells
                      with multiple charges count as on cooldown as long as you have fewer than
                      maximum charges. For spells with long cooldowns, it's possible to have well
                      below 100% on cooldown and still achieve maximum casts.
                    </>
                  }
                >
                  <>Time on Cooldown</>
                </TooltipElement>
              </th>
              <th />
            </tr>
            {abilities
              .filter((item) => item.ability.category === category)
              .map(({ ability, cpm, casts, maxCasts, efficiency, canBeImproved }) => {
                const name = ability.castEfficiency.name || ability.name;
                return (
                  <tr key={ability.primarySpell}>
                    <td style={{ width: '35%' }}>
                      <SpellLink
                        spell={ability.primarySpell}
                        style={{ color: '#fff' }}
                        icon
                        iconStyle={{
                          height: undefined,
                          marginTop: undefined,
                        }}
                      >
                        {name}
                      </SpellLink>
                    </td>
                    <td className="text-center" style={{ minWidth: 80 }}>
                      {cpm.toFixed(2)}
                    </td>
                    <td className="text-right" style={{ minWidth: 110 }}>
                      {casts}
                      {maxCasts === Infinity ? '' : `/${Math.floor(maxCasts)}`} casts
                    </td>
                    <td style={{ width: '20%' }}>
                      {maxCasts === Infinity || efficiency === null ? (
                        ''
                      ) : (
                        <div className="flex performance-bar-container">
                          <div
                            className="flex-sub performance-bar"
                            style={{
                              width: `${efficiency * 100}%`,
                              backgroundColor:
                                canBeImproved &&
                                ability.castEfficiency &&
                                ability.castEfficiency.suggestion
                                  ? '#ff8000'
                                  : '#70b570',
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="text-left" style={{ minWidth: 50, paddingRight: 5 }}>
                      {efficiency !== null ? `${(efficiency * 100).toFixed(2)}%` : ''}
                    </td>
                    <td style={{ width: '25%', color: 'orange' }}>
                      {canBeImproved &&
                        ability.castEfficiency &&
                        ability.castEfficiency.suggestion && <>Can be improved.</>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        ))}
    </table>
  </div>
);

export default CastEfficiency;
