import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { constructURL } from 'interface/others/ReportSelecter';

import DocumentTitle from 'interface/common/DocumentTitle';
import { Link } from 'react-router-dom';

class Search extends React.PureComponent {
  static propTypes = {
    replace: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
  };

  constructor(){
    super();
    this.state = {
      valid: true,
    };
  }

  parseQuery(){
    const constructedURL = constructURL(this.props.query);
    if(constructedURL){
      this.props.replace(constructedURL); //attempt redirect to report analysis if one was found
    }else{
      this.setState({valid: false});
    }
  }

  componentDidMount(){
    this.parseQuery();
  }

  render(){
    return (
      <div className="container">
        <DocumentTitle title="Search" />
        <h1>Report Search</h1>
        {this.state.valid ? <>Searching for </> : <>Invalid search parameter: </>}<b>{this.props.query}</b><br />
        <br />
        <Trans>
          Supported search terms:<br />
          <ul>
            <li>&lt;report code&gt;</li>
            <li>https://www.warcraftlogs.com/reports/&lt;report code&gt;</li>
            <li>https://www.warcraftlogs.com/character/&lt;region&gt;/&lt;realm&gt;/&lt;name&gt;</li>
            <li>https://worldofwarcraft.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;</li>
            <li>https://www.wowchina.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;</li>
          </ul>
        </Trans>
        <br />
        <Link to="/">Go back home</Link>
      </div>
    );
  }
}

export default connect(null, {
  replace,
})(Search);
