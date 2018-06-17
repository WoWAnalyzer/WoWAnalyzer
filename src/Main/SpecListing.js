import React from 'react';

import FingerprintFilledIcon from 'Icons/FingerprintFilled';

import SPECS from 'common/SPECS';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import Contributor from 'Main/Contributor';
import ReadableList from 'common/ReadableList';

import './SpecListing.css';

class SpecListing extends React.PureComponent {
  render() {
    return (
      <section className="spec-listing">
        <header>
          <div className="row">
            <div className="col-md-12">
              <h1><FingerprintFilledIcon /> Specializations</h1>
            </div>
          </div>
        </header>

        <main>
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

              const Component = config.exampleReport ? 'a' : 'div';

              return (
                <Component
                  key={spec.id}
                  href={config.exampleReport}
                  title={config.exampleReport ? 'Open example report' : undefined}
                  className="spec-card"
                  style={{
                    opacity: !config ? 0.3 : undefined,
                  }}
                >
                  <div className="icon">
                    <figure>
                      <img
                        src={`/specs/${className}-${spec.specName.replace(' ', '')}.jpg`}
                        alt={`${spec.specName} ${spec.className} spec icon`}
                      />
                    </figure>
                  </div>
                  <div className="description">
                    <h1 className={className}>{spec.specName} {spec.className}</h1>
                    {config ? (
                      <React.Fragment>
                        Built by <ReadableList>
                        {config.contributors.map(contributor => <Contributor key={contributor.nickname} link={false} {...contributor} />)}
                      </ReadableList>.<br />
                        Accurate for patch {config.patchCompatibility}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        Not yet available. <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/CONTRIBUTING.md">Add it!</a>
                      </React.Fragment>
                    )}
                  </div>
                </Component>
              );
            })}
        </main>
      </section>
    );
  }
}

export default SpecListing;
