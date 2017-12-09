import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';

class ClipboardCopyButton extends React.PureComponent {
  static propTypes = {
    copyText: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  };

  constructor() {
    super();
    //this.handleClick = this.handleClick.bind(this);
  }

  // handleClick() {
  //   // TODO
  // }

  render() {
    const { copyText, label } = this.props;

    return (
      <CopyToClipboard onCopy={this.onCopy} text={copyText}>
        <dfn className="button-tip clickable btn-sm clipboard" style={{ position: 'relative', left: 8, flex: 'none' }} data-tip="Copied to Clipboard!" data-place="top" data-delay-hide='1000' data-event='focus'>
          {label}
        </dfn>
      </CopyToClipboard>
    );
  }
}

export default ClipboardCopyButton;
