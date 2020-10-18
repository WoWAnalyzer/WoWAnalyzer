import React from 'react';

import SpellLink from 'common/SpellLink';
import { TooltipElement } from 'common/Tooltip';

import Abilities from 'parser/core/modules/Abilities';
import { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import { Trans } from '@lingui/macro';

interface Props {
  abilities: AbilityCastEfficiency[];
  categories: {
    [key: string]: string;
  };
}

const CastEfficiency = ({ categories, abilities }: Props) => (
  <div style={{ marginTop: -10, marginBottom: -10 }}>
    <table className="data-table" style={{ marginTop: 10, marginBottom: 10 }}>
      {Object.keys(categories)
        .filter(key =>
          abilities.some(item => item.ability.category === categories[key]),
        ) // filters out categories without any abilities in it
        .filter(key => categories[key] !== Abilities.SPELL_CATEGORIES.HIDDEN) //filters out the hidden category
        .map(key => (
          <tbody key={key}>
            <tr>
              <th>
                <b>{categories[key]}</b>
              </th>
              <th className="text-center">
                <TooltipElement content={<Trans id="shared.castEfficiency.cpm.tooltip">Casts Per Minute</Trans>}><Trans id="shared.castEfficiency.cpm">CPM</Trans></TooltipElement>
              </th>
              <th className="text-right">
                <TooltipElement content={<Trans id="shared.castEfficiency.casts.tooltip">Maximum possible casts are based on the ability's cooldown and the fight duration. For abilities that can have their cooldowns dynamically reduced or reset, it's based on the average actual time it took the ability to cooldown over the course of this encounter.</Trans>}>
                  <Trans id="shared.castEfficiency.casts">Casts</Trans>
                </TooltipElement>
              </th>
              <th className="text-center">
                <TooltipElement content={<Trans id="shared.castEfficiency.timeOnCooldown.tooltip">The percentage of time the spell was kept on cooldown. For spells without charges this also includes when the spell was unavailable due to cast time or time spent waiting for a GCD when the spell was reset due to a proc. Spells with multiple charges count as on cooldown as long as you have fewer than maximum charges. For spells with long cooldowns, it's possible to have well below 100% on cooldown and still achieve maximum casts.</Trans>}>
                  <Trans id="shared.castEfficiency.timeOnCooldown">Time on Cooldown</Trans>
                </TooltipElement>
              </th>
              <th />
            </tr>
            {abilities
              .filter(item => item.ability.category === categories[key])
              .map(
                ({
                  ability,
                  cpm,
                  casts,
                  maxCasts,
                  efficiency,
                  canBeImproved,
                }) => {
                  const name = ability.castEfficiency.name || ability.name;
                  return (
                    <tr key={name}>
                      <td style={{ width: '35%' }}>
                        <SpellLink
                          id={ability.primarySpell.id}
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
                        {maxCasts === Infinity
                          ? ''
                          : `/${Math.floor(maxCasts)}`}{' '}
                        casts
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
                      <td
                        className="text-left"
                        style={{ minWidth: 50, paddingRight: 5 }}
                      >
                        {efficiency !== null
                          ? `${(efficiency * 100).toFixed(2)}%`
                          : ''}
                      </td>
                      <td style={{ width: '25%', color: 'orange' }}>
                        {canBeImproved &&
                          ability.castEfficiency &&
                          ability.castEfficiency.suggestion &&
                          <Trans id="shared.castEfficiency.canBeImproved">Can be improved.</Trans>}
                      </td>
                    </tr>
                  );
                },
              )}
          </tbody>
        ))}
    </table>
  </div>
);

export default CastEfficiency;
