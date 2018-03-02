import React from 'react';

import FingerprintFilledIcon from 'Icons/FingerprintFilled';
import GitHubMarkIcon from 'Icons/GitHubMark';

import Wrapper from 'common/Wrapper';
import SPECS from 'common/SPECS';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import Maintainer from 'Main/Maintainer';

import './SpecListing.css';

class SpecListing extends React.PureComponent {
  render() {
    return (
      <section>
        <div className="container">
          <header>
            <div className="row">
              <div className="col-md-12">
                <h1><FingerprintFilledIcon /> Specializations</h1>
              </div>
            </div>
          </header>

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
                        opacity: !config ? 0.3 : undefined,
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
                            <div className="maintainers">
                              Maintained by {config.maintainers.map(maintainer => <Maintainer key={maintainer.nickname} {...maintainer} />)}
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
        </div>
      </section>
    );
  }
}

export default SpecListing;
