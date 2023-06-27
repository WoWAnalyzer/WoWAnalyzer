
import groupByToMap from 'common/groupByToMap';
import { CLASSIC_EXPANSION, RETAIL_EXPANSION } from 'game/Expansion';
import DocumentTitle from 'interface/DocumentTitle';
import AVAILABLE_CONFIGS from 'parser';
import Config from 'parser/Config';

import SpecListItem from './SpecListItem';
import './SpecList.css';
import { usePageView } from './useGoogleAnalytics';

const isAnySpecSupported = (configs: Config[]) =>
  configs.some((config) => config.patchCompatibility && config.expansion === RETAIL_EXPANSION);

const retailSpecs = AVAILABLE_CONFIGS.filter((it) => it.expansion > CLASSIC_EXPANSION);
const retailSpecsAsMap = groupByToMap(retailSpecs, (spec) => spec.spec.className);
const retailSpecsGroupedByClass = Array.from(retailSpecsAsMap.entries());
const retailClassesOrderedBySupport = retailSpecsGroupedByClass.sort(
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

const classicSpecs = AVAILABLE_CONFIGS.filter((it) => it.expansion <= CLASSIC_EXPANSION).sort(
  (a: Config, b: Config) => {
    if (a.spec.className < b.spec.className) {
      return -1;
    } else if (a.spec.className > b.spec.className) {
      return 1;
    }
    return a.spec.id - b.spec.id;
  },
);

const SpecListing = () => {
  usePageView('SpecList');
  return (
    <>
      <DocumentTitle title="Specializations" />

      <div>
        <h1>
          <>Specializations</>
        </h1>
      </div>
      <small>
        <>
          Click any specialization to view an example report for that spec.
        </>
      </small>

      <div>
        <h2>
          <>Retail</>
        </h2>
      </div>

      {retailClassesOrderedBySupport.map(([className, specConfigs]) => (
        <div className="spec-listing" key={className}>
          {specConfigs.map((config) => (
            <SpecListItem key={config.spec.id} {...config} />
          ))}
        </div>
      ))}

      <div>
        <h2>
          <>Classic</>
        </h2>
      </div>

      <div className="spec-listing">
        {classicSpecs.map((config) => (
          <SpecListItem key={config.spec.id || config.spec.type} {...config} />
        ))}
      </div>
    </>
  );
};

export default SpecListing;
