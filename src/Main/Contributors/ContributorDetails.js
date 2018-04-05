import React from 'react';
import PropTypes from 'prop-types';

import * as contributors from 'CONTRIBUTORS';

import SPECS from 'common/SPECS';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import CoreChangelog from 'CHANGELOG';

class ContributorDetails extends React.PureComponent {

  static propTypes = {
    contributorId: PropTypes.string,
    ownPage: PropTypes.bool, 
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
    this.filterChangelog = this.filterChangelog.bind(this);
  }

  //#region Layout-Helpers

  removeWhiteSpaces(string) {
    return string.replace(" ", "");
  }

  iconPath(spec) {
    return `/specs/${this.removeWhiteSpaces(spec.className)}-${this.removeWhiteSpaces(spec.specName)}.jpg`;
  }

  char(char) {
    return (
      <div>
        <a href={char.link} target="_blank" className={this.removeWhiteSpaces(char.spec.className)}>
          <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(char.spec)} alt="spec icon" />
          {char.name}
        </a><br/>
      </div>
    );
  }

  filterChangelog(contribution) {
    return contribution.contributors.includes(contributors[this.props.contributorId]);
  }

  toggleClass(index) {
    const stateList = this.state.list;
    stateList[index] = !stateList[index];
    this.setState({ list: stateList });
    this.forceUpdate();
  }

  contributionHeader(spec) {
    if (spec === "0") {
      return (
        <span>
          <img src="/favicon.png" style={{ height: '2em', width: '2em', marginRight: 10 }} alt="Icon" />
          Core
        </span>
      );
    }

    return (
      <span>
        <img src={this.iconPath(SPECS[spec])} style={{ height: '2em', width: '2em', marginRight: 10 }} alt="Icon" />
        {SPECS[spec].specName} {SPECS[spec].className}
      </span>
    );
  }

  links(object) {
    if (!object) {
      return;
    }

    const value = [];
    Object.keys(object).forEach((key) => {
      value.push(<div>
        <a href={object[key]} target="_blank">{key}</a>
      </div>);
    });
    return (
      <div className="row" style={{ marginBottom: 20 }}>
        <div className="col-md-3"><b>Links:</b></div>
          <div className="col-md-9">
            {value}
          </div>
      </div>
    );
  }

  additionalInfo(object) {
    if (!object) {
      return;
    }

    const value = [];
    Object.keys(object).forEach((key) => {
      if (Array.isArray(object[key]) === true) {
        const subvalue = [];
        object[key].forEach((elem) => {
          subvalue.push(<div>{elem}</div>);
        });

        value.push(<div className="row">
          <div className="col-md-3"><b>{key}:</b></div>
            <div className="col-md-9">
              {subvalue}
            </div>
        </div>);

      } else if (typeof object[key] === "string") {
        value.push(<div className="row">
          <div className="col-md-3"><b>{key}:</b></div>
            <div className="col-md-9">
              {object[key]}
            </div>
        </div>);
      }
    });
    return value;
  }

  get maintainer() {

    const maintainedSpecs = AVAILABLE_CONFIGS.filter((elem, index) => {
      const includes = elem.contributors.filter((cont, key) => {
        return cont.nickname === this.props.contributorId;
      });

      return includes.length > 0;
    });

    if (maintainedSpecs.length === 0) {
      return;
    }

    return (
      <div className="row">
        <div className="col-md-3"><b>Maintainer:</b></div>
        <div className="col-md-9">
          {maintainedSpecs.map((char, index) => 
            <div className={this.removeWhiteSpaces(char.spec.className)}>
              <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(char.spec)} alt={"Spec Icon"} />
              {char.spec.specName} {char.spec.className}
            </div>
          )}
        </div>
      </div>
    );
  }

  chars(contributor, typ) {
    if (!contributor[typ]) {
      return;
    }

    const style = typ === 'mains' ? { marginTop: 20 } : { marginBottom: 20 };
    return (
      <div className="row" style={style}>
        <div className="col-md-3"><b>{typ[0].toUpperCase() + typ.slice(1)}:</b></div>
        <div className="col-md-9">
          {contributor[typ].map((char, index) => this.char(char) )}
        </div>
      </div>
    ); 
  }

  about(contributor) {
    if (!contributor.desc) {
      return;
    }

    return (
      <div className="row">
        <div className="col-md-3"><b>About me:</b></div>
        <div className="col-md-9">
          {contributor.desc}
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.props.ownPage) {
      return;
    }

    document.body.classList.toggle('no-scroll');
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.ownPage) {
      return;
    }

    document.body.classList.toggle('no-scroll');
  }
  componentWillUnmount() {
    if (this.props.ownPage) {
      return;
    }

    document.body.classList.remove('no-scroll');
  }

  //#endregion

  render() {
    const { contributorId } = this.props;
    const contributor = contributors[contributorId];
    const contributions = {
      0: CoreChangelog,
    };

    AVAILABLE_CONFIGS.forEach((elem, index) => {
      contributions[elem.spec.id] = elem.changelog;
    });
    
    Object.keys(contributions).forEach((key) => {
      contributions[key] = contributions[key].filter(this.filterChangelog);
      if (contributions[key].length === 0) {
        delete contributions[key];
      }
    });

    if (contributor.avatar === undefined) {
      contributor.avatar = "/favicon.png";
    }

    

    return (
      <div className="contributor-detail">
        <div className="container">
          <div className="flex-main">
            <div className="row">
              <div className="col-md-5">
                <div className="panel">
                  <div style={{ textAlign: 'center' }}>
                    <h2>{contributor.nickname}</h2>
                    <img src={contributor.avatar} alt={'Avatar'} style={{ marginTop: 20, maxHeight: 200, borderRadius: '50%' }}/>
                  </div>
                  <div className="flex-main contributorlist" style={{ padding: '0 5px 20px 5px' }}>
                    {this.about(contributor)}
                    <div className="row">
                      <div className="col-md-3"><b>GitHub:</b></div>
                      <div className="col-md-9">
                        <a href={"https://github.com/" + contributor.github} target="_blank">{contributor.github}</a>
                      </div>
                    </div>
                    {this.maintainer}
                    {this.links(contributor.links)}
                    {this.additionalInfo(contributor.others)}
                    {this.chars(contributor, "mains")}
                    {this.chars(contributor, "alts")}
                  </div>
                </div>
              </div>


              <div className="col-md-7">
                <div className="panel scrollable">
                  {Object.keys(contributions).map((type, index) => 
                    <div key={index}>
                      <div className="panel-heading" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => this.toggleClass(index)}>
                        <h2>{this.contributionHeader(type)} ({contributions[type].length} commits)</h2>
                      </div>
                      <ul className="list text" style={{ marginBottom: 20, display: this.state.list[index] === true ? 'block' : 'none' }}>
                        {contributions[type].map((contribution, index) => 
                          <li key={index} className="row">
                            <div className="col-md-2">
                              {contribution.date.toLocaleDateString()}
                            </div>
                            <div className="col-md-10">
                              {contribution.changes}
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContributorDetails;