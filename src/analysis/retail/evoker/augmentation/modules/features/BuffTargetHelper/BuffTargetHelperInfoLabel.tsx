import { AlertInfo, SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

type Props = {
  has4Pc: boolean;
};

const BuffTargetHelperInfoLabel: React.FC<Props> = ({ has4Pc }) => {
  return (
    <div className="container">
      <AlertInfo style={{ marginBottom: 30 }}>
        <b>
          Note for <a href="https://wago.io/yrmx6ZQSG">Prescience Helper</a> users
        </b>
        <p>
          <b>HenryG</b> has updated the logic for his Prescience Helper WeakAura on <b>January 7</b>
          . This module has been updated to support the new logic.
        </p>
        <p>
          Please update your Prescience Helper WeakAura to the latest version. If you do not, this
          module will not work correctly.
        </p>
        {has4Pc && (
          <p>
            <b>
              Because you have T31 4pc, the note generated assumes the first{' '}
              <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> you cast on pull is a long one.
            </b>
          </p>
        )}
      </AlertInfo>
    </div>
  );
};

export default BuffTargetHelperInfoLabel;
