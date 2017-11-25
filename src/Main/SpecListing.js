import React from 'react';

import SPECS from 'common/SPECS';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import Wrapper from 'common/Wrapper';
import Maintainer from 'Main/Maintainer';
import FingerprintFilledIcon from 'Icons/FingerprintFilled';
import GitHubMarkIcon from 'Icons/GitHubMark';

import './SpecListing.css';

class SpecListing extends React.PureComponent {
  render() {
    return (
      <section>
        <div className="row">
          <div className="col-md-12 text-center">
            <h1 style={{ fontSize: '3em', marginBottom: '0.5em', marginTop: '0.5em' }}><FingerprintFilledIcon /> Specializations</h1>
          </div>
        </div>

        <div className="row">
          {Object.keys(SPECS)
            .filter(key => isNaN(key)) // since SPECS gets indexed by ids, all entries are doubled. With this we only use the non-numeric values
            .map(key => SPECS[key])
            .sort((a, b) => {
              if (a.className < b.className) {
                return -1;
              } else if (a.className > b.className) {
                return 1;
              }
              return a.id - b.id;
            })
            .map(spec => {
              const className = spec.className.replace(/ /g, '');
              const config = AVAILABLE_CONFIGS.find(config => config.spec === spec);
              return (
                <div key={spec.id} className="col-lg-4 col-md-6" style={{ marginBottom: 30 }}>
                  <div
                    className="flex spec-card"
                    style={{
                      opacity: !config /*|| config.completeness === SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED*/ ? 0.3 : undefined,
                    }}
                  >
                    <div className="flex-sub icon" style={{ backgroundImage: `url(/specs/${className}-${spec.specName.replace(' ', '')}.jpg)` }} />
                    <div className="flex-main description">
                      <h1 className={className}>{spec.specName} {spec.className}</h1>
                      {config ? (
                        <Wrapper>
                          <div className="pull-right">
                            <a href={`https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/${config.path}`} className="github" data-tip="View source code for this spec.">
                              <GitHubMarkIcon />
                            </a>
                          </div>
                          <div>
                            Maintained by {config.maintainers.map(maintainer => <Maintainer key={maintainer.nickname} {...maintainer} />)}
                          </div>
                          <div>
                            Status: <dfn data-tip={getCompletenessExplanation(config.completeness)} style={{ color: getCompletenessColor(config.completeness) }}>{getCompletenessLabel(config.completeness)}</dfn>
                          </div>
                        </Wrapper>
                      ) : (
                        <Wrapper>Not yet available. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/CONTRIBUTING.md">Add it!</a></Wrapper>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    );
  }
}

export default SpecListing;
