
import PropTypes from 'prop-types';

import './Checklist.scss';

const Checklist = (props) => {
  const { children } = props;

  return (
    <ul className="checklist">
      {!children && (
        <li>
          <div className="alert alert-danger">
            <>
              The checklist is not yet available for this spec. See{' '}
              <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on{' '}
              <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing
              this.
            </>
          </div>
        </li>
      )}

      {children}
    </ul>
  );
};

Checklist.propTypes = {
  children: PropTypes.node,
};

export default Checklist;
