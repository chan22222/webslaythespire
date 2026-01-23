// 버튼 사운드 유틸리티

const buttonHoverSound = new Audio('/sfx/sound/button_hover.wav');
const buttonClickSound = new Audio('/sfx/sound/button_click.wav');

// 볼륨 설정
buttonHoverSound.volume = 0.25;
buttonClickSound.volume = 0.25;

export const playButtonHover = () => {
  buttonHoverSound.currentTime = 0;
  buttonHoverSound.play().catch(() => {});
};

export const playButtonClick = () => {
  buttonClickSound.currentTime = 0;
  buttonClickSound.play().catch(() => {});
};
