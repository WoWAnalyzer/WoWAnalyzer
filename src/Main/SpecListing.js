import React from 'react';

import FingerprintFilledIcon from 'Icons/FingerprintFilled';
import GitHubMarkIcon from 'Icons/GitHubMarkLarge';

import Wrapper from 'common/Wrapper';
import SPECS from 'common/SPECS';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import Contributor from 'Main/Contributor';
import ReadableList from 'common/ReadableList';

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

          <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
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
                            <div className="row" style={{ marginTop: '1em' }}>
                              <div className="col-md-6" style={{ fontWeight: 'bold', paddingRight: 0 }}>
                                Contributor{config.contributors.length > 1 && 's'}
                              </div>
                              <div className="col-md-6">
                                <ReadableList>
                                  {config.contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />)}
                                </ReadableList>
                              </div>
                            </div>
                            <div className="row" style={{ marginTop: '0.5em' }}>
                              <div className="col-md-6" style={{ fontWeight: 'bold', paddingRight: 0 }}>
                                Updated for patch
                              </div>
                              <div className="col-md-6">
                                {config.patchCompatibility}
                              </div>
                            </div>
                            <div className="row" style={{ marginTop: '0.5em' }}>
                              <div className="col-md-6" style={{ fontWeight: 'bold', paddingRight: 0 }}>
                                Source
                              </div>
                              <div className="col-md-6">
                                <a href={`https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/${config.path}`} className="github" data-tip="View source code for this spec.">
                                  <GitHubMarkIcon /> GitHub
                                </a>
                              </div>
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
