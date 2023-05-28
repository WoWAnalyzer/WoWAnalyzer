import lazyLoadComponent from 'common/lazyLoadComponent';
import makeContributorUrl from 'common/makeContributorUrl';
import retryingPromise from 'common/retryingPromise';
import Modal from 'interface/Modal';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ContributorDetails = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'ContributorPage' */ './ContributorDetails').then(
      (exports) => exports.default,
    ),
  ),
);

interface Props {
  nickname: string;
  avatar?: string;
  link?: boolean;
}

export type ContributorType = Props;

const ContributorButton = ({ nickname, avatar, link = true }: Props) => {
  const [open, setOpen] = useState(false);

  let content = (
    <div className="contributor">
      {avatar && <img loading="lazy" src={avatar} alt={`${nickname}'s contributor avatar`} />}
      {nickname}
    </div>
  );

  if (link) {
    content = (
      <Link
        to={makeContributorUrl(nickname)}
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <>
      {content}
      {open && (
        <Modal id="contributor-button" onClose={() => setOpen(false)}>
          <ContributorDetails contributorId={nickname} />
        </Modal>
      )}
    </>
  );
};

export default ContributorButton;
