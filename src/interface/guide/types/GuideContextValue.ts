import GuideProps from './GuideProps';

type GuideContextValue = Omit<GuideProps<any>, 'info'> & {
  info?: GuideProps<any>['info'];
};

export default GuideContextValue;
