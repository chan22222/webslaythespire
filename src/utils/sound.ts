// 버튼 사운드 유틸리티

const buttonHoverSound = new Audio('/sfx/sound/button_hover.wav');
const buttonClickSound = new Audio('/sfx/sound/button_click.wav');
const cardBuySound = new Audio('/sfx/sound/card_buy.wav');

// 볼륨 설정
buttonHoverSound.volume = 0.25;
buttonClickSound.volume = 0.25;
cardBuySound.volume = 0.25;

export const playButtonHover = () => {
  buttonHoverSound.currentTime = 0;
  buttonHoverSound.play().catch(() => {});
};

export const playButtonClick = () => {
  buttonClickSound.currentTime = 0;
  buttonClickSound.play().catch(() => {});
};

export const playCardBuy = () => {
  cardBuySound.currentTime = 0;
  cardBuySound.play().catch(() => {});
};

export const playCardDraw = () => {
  const sound = new Audio('/sfx/sound/card_draw.wav');
  sound.volume = 0.4;
  sound.play().catch(() => {});
};

export const playDefeat = () => {
  const sound = new Audio('/sfx/sound/music_box_defeated.wav');
  sound.volume = 0.25;
  sound.play().catch(() => {});
};

export const playAttack = () => {
  const sound = new Audio('/sfx/sound/attack.wav');
  sound.volume = 0.4;
  sound.play().catch(() => {});
};

export const playHit = () => {
  const sound = new Audio('/sfx/sound/hit.wav');
  sound.volume = 0.35;
  sound.play().catch(() => {});
};

export const playFootsteps = () => {
  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      const sound = new Audio('/sfx/sound/footstep.wav');
      sound.volume = 0.3;
      sound.play().catch(() => {});
    }, i * 220);
  }
};
