import { Trans } from '@lingui/macro';
import groupByToMap from 'common/groupByToMap';
import DocumentTitle from 'interface/DocumentTitle';
import AVAILABLE_CONFIGS from 'parser';
import Config from 'parser/Config';
import { useLingui } from '@lingui/react';
import { useMemo } from 'react';
import GameBranch from 'game/GameBranch';

import SpecListItem from '../SpecListItem';
import '../SpecList.css';
import { usePageView } from '../useGoogleAnalytics';

const isAnySpecSupported = (configs: Config[]) =>
  configs.some((config) => config.patchCompatibility);

const retailSpecs = AVAILABLE_CONFIGS.filter((it) => it.branch === GameBranch.Retail);

export function Component() {
  usePageView('SpecList');

  const { i18n } = useLingui();
  const retailClassesOrderedBySupport = useMemo(() => {
    const retailSpecsAsMap = groupByToMap(retailSpecs, (spec) => i18n._(spec.spec.className));
    const retailSpecsGroupedByClass = Array.from(retailSpecsAsMap.entries());
    return retailSpecsGroupedByClass.sort(
      ([classAName, classASpecs], [classBName, classBSpecs]) => {
        const doesAHaveSupportedSpecs = isAnySpecSupported(classASpecs);
        const doesBHaveSupportedSpecs = isAnySpecSupported(classBSpecs);
        // B - A = supported classes are first
        // A - B = supported classes are last
        const supportedOrder = Number(doesBHaveSupportedSpecs) - Number(doesAHaveSupportedSpecs);
        // Order by support then by name comparison
        return supportedOrder || classAName.localeCompare(classBName);
      },
    );
  }, [i18n]);
  const classicSpecs = useMemo(
    () =>
      AVAILABLE_CONFIGS.filter((it) => it.branch === GameBranch.Classic).sort(
        (a: Config, b: Config) => {
          const aClassName = i18n._(a.spec.className);
          const bClassName = i18n._(b.spec.className);

          if (aClassName < bClassName) {
            return -1;
          } else if (aClassName > bClassName) {
            return 1;
          }
          return a.spec.id - b.spec.id;
        },
      ),
    [i18n],
  );

  return (
    <>
      <DocumentTitle title="Specializations" />

      <div>
        <h1>
          <Trans id="interface.specList.specs">Specializations</Trans>
        </h1>
      </div>
      <small>
        <Trans id="interface.specList.specs.label">
          Click any specialization to view an example report for that spec.
        </Trans>
      </small>

      <div>
        <h2>
          <Trans id="interface.specList.retail">Retail</Trans>
        </h2>
      </div>

      {retailClassesOrderedBySupport.map(([className, specConfigs]) => (
        <div className="spec-listing" key={i18n._(className)}>
          {specConfigs.map((config) => (
            <SpecListItem key={config.spec.id} {...config} />
          ))}
        </div>
      ))}

      <div>
        <h2>
          <Trans id="interface.specList.classic">Classic</Trans>
        </h2>
      </div>

      <div className="spec-listing">
        {classicSpecs.map((config) => (
          <SpecListItem key={config.spec.id || config.spec.type} {...config} />
        ))}
      </div>
    </>
  );
}
