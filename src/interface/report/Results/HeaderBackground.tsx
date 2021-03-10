import React from 'react';

interface Props {
  boss: {
    background?: string;
    backgroundPosition?: string;
  }|null;
}

const HeaderBackground = ({ boss }: Props) => {
  const backgroundImage = boss?.background ?? '/img/header.jpg';
  const backgroundPosition = boss?.backgroundPosition ?? 'center';

  return (
    <div className="background">
      <div
        className="img"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: backgroundPosition,
        }}
      />
    </div>
  );
};

export default HeaderBackground;
