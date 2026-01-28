// 버튼 사운드 유틸리티

// 전역 볼륨 (0 ~ 1)
let globalVolume = 1;

// BGM 관리
const BGM_VOLUME = 0.15; // BGM 기본 볼륨
let currentBGMType: 'title' | 'battle' | 'shop' | null = null;

// BGM을 미리 로드해서 재사용 (위치 기억)
const bgmAudios: Record<'title' | 'battle' | 'shop', HTMLAudioElement> = {
  title: new Audio('/sfx/sound/title.mp3'),
  battle: new Audio('/sfx/sound/battle.mp3'),
  shop: new Audio('/sfx/sound/shop.mp3'),
};

// BGM 초기 설정
Object.values(bgmAudios).forEach(audio => {
  audio.loop = true;
  audio.volume = BGM_VOLUME;
});

export const setGlobalVolume = (volume: number) => {
  globalVolume = Math.max(0, Math.min(1, volume));
  // 미리 로드된 사운드들의 볼륨도 업데이트
  buttonHoverSound.volume = 0.35 * globalVolume;
  buttonClickSound.volume = 0.25 * globalVolume;
  cardBuySound.volume = 0.25 * globalVolume;
  // 모든 BGM 볼륨 업데이트
  Object.values(bgmAudios).forEach(audio => {
    audio.volume = BGM_VOLUME * globalVolume;
  });
};

export const getGlobalVolume = () => globalVolume;

// 페이드 아웃 헬퍼
const fadeOutAudio = (audio: HTMLAudioElement, duration: number = 500): Promise<void> => {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, startVolume - volumeStep * currentStep);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.volume = BGM_VOLUME * globalVolume; // 볼륨 복원
        resolve();
      }
    }, stepTime);
  });
};

// BGM 재생 (이전 위치부터 이어서 재생, 페이드 전환)
export const playBGM = async (type: 'title' | 'battle' | 'shop') => {
  // 같은 BGM이 이미 재생 중이면 무시
  if (currentBGMType === type && !bgmAudios[type].paused) {
    return;
  }

  // 현재 재생 중인 BGM 페이드 아웃
  const fadePromises: Promise<void>[] = [];
  Object.entries(bgmAudios).forEach(([key, audio]) => {
    if (key !== type && !audio.paused) {
      fadePromises.push(fadeOutAudio(audio, 800));
    }
  });

  // 페이드 아웃 완료 대기
  if (fadePromises.length > 0) {
    await Promise.all(fadePromises);
  }

  // 배틀은 항상 처음부터 시작
  if (type === 'battle') {
    bgmAudios[type].currentTime = 0;
  }

  // 선택한 BGM 재생 (타이틀은 약간 낮게)
  const typeVolume = type === 'title' ? BGM_VOLUME - 0.05 : BGM_VOLUME;
  bgmAudios[type].volume = typeVolume * globalVolume;
  currentBGMType = type;
  bgmAudios[type].play().catch(() => {});
};

// BGM 정지 (모든 BGM)
export const stopBGM = () => {
  Object.values(bgmAudios).forEach(audio => {
    audio.pause();
  });
  currentBGMType = null;
};

const buttonHoverSound = new Audio('/sfx/sound/button_hover.wav');
const buttonClickSound = new Audio('/sfx/sound/button_click.wav');
const cardBuySound = new Audio('/sfx/sound/card_buy.wav');

// 볼륨 설정
buttonHoverSound.volume = 0.35;
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
  sound.volume = 0.4 * globalVolume;
  sound.play().catch(() => {});
};

export const playDefeat = () => {
  const sound = new Audio('/sfx/sound/music_box_defeated.wav');
  sound.volume = 0.25 * globalVolume;
  sound.play().catch(() => {});
};

export const playAttack = () => {
  const sound = new Audio('/sfx/sound/attack.wav');
  sound.volume = 0.4 * globalVolume;
  sound.play().catch(() => {});
};

export const playHit = () => {
  const sound = new Audio('/sfx/sound/hit.wav');
  sound.volume = 0.35 * globalVolume;
  sound.play().catch(() => {});
};

export const playFootsteps = () => {
  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      const sound = new Audio('/sfx/sound/footstep.wav');
      sound.volume = 0.3 * globalVolume;
      sound.play().catch(() => {});
    }, i * 220);
  }
};

export const playBuff = () => {
  const sound = new Audio('/sfx/sound/buff.wav');
  sound.volume = 0.25 * globalVolume;
  sound.play().catch(() => {});
};

export const playEnemyBuff = () => {
  const sound = new Audio('/sfx/sound/enemy_buff.wav');
  sound.volume = 0.35 * globalVolume;
  sound.play().catch(() => {});
};

export const playDebuff = () => {
  const sound = new Audio('/sfx/sound/debuff.wav');
  sound.volume = 0.6 * globalVolume;
  sound.play().catch(() => {});
};

export const playWin = () => {
  const sound = new Audio('/sfx/sound/win.wav');
  sound.volume = 0.25 * globalVolume;
  sound.play().catch(() => {});
};

let lastPlayerHitIndex = 0;
export const playPlayerHit = () => {
  // 이전과 다른 인덱스 선택
  let index;
  do {
    index = Math.floor(Math.random() * 3) + 1;
  } while (index === lastPlayerHitIndex);
  lastPlayerHitIndex = index;

  const sound = new Audio(`/sfx/sound/hit_player_${index}.mp3`);
  sound.volume = 0.2 * globalVolume;
  sound.play().catch(() => {});
};
