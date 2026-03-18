const sounds = {
  login: new Audio("sounds/Windows XP Logon Sound.mp3"),
  logoff: new Audio("sounds/Windows XP Logoff Sound.mp3"),
  open: new Audio("sounds/Windows XP Menu Command.mp3"),
  minimize: new Audio("sounds/Windows XP Minimize.mp3"),
  restore: new Audio("sounds/Windows XP Restore.mp3"),
  error: new Audio("sounds/Windows XP Critical Stop.mp3"),
  warn: new Audio("sounds/Windows XP Exclamation.mp3"),
  notify: new Audio("sounds/Windows XP Balloon.mp3"),
  recycle: new Audio("sounds/Windows XP Recycle.mp3"),
  startup: new Audio("sounds/Windows XP Startup.mp3"),
  balloon: new Audio("sounds/Windows XP Balloon.mp3"),
  solitaireDeal: new Audio("sounds/spider_Sample 1 (Deal Card).wav"),
  solitaireMove: new Audio("sounds/spider_Sample 2 (Move Card).wav"),
  solitaireWin: new Audio("sounds/spider_Sample 6 (tada.wav).wav")
};

Object.values(sounds).forEach((audio) => {
  audio.preload = "auto";
});

let soundsUnlocked = false;

function unlockSounds() {
  if (soundsUnlocked) return;

  const unlockPromises = Object.values(sounds).map((audio) => {
    try {
      audio.volume = 0;
      audio.currentTime = 0;
      return audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      }).catch(() => {
        audio.volume = 1;
      });
    } catch (err) {
      audio.volume = 1;
      return Promise.resolve();
    }
  });

  Promise.allSettled(unlockPromises).finally(() => {
    soundsUnlocked = true;
  });

  document.removeEventListener("pointerdown", unlockSounds);
  document.removeEventListener("keydown", unlockSounds);
}

function playSound(name) {
  const audio = sounds[name];
  if (!audio || !soundsUnlocked || !soundsEnabled) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => {});
  } catch (err) {}
}

document.addEventListener("pointerdown", unlockSounds);
document.addEventListener("keydown", unlockSounds);


const SOUND_SETTING_KEY = "xpSoundsEnabled";
let soundsEnabled = localStorage.getItem(SOUND_SETTING_KEY) !== "false";

function setSoundsEnabled(enabled) {
  soundsEnabled = !!enabled;
  localStorage.setItem(SOUND_SETTING_KEY, soundsEnabled ? "true" : "false");
  return soundsEnabled;
}

function toggleSoundsEnabled(forceValue) {
  if (typeof forceValue === "boolean") return setSoundsEnabled(forceValue);
  return setSoundsEnabled(!soundsEnabled);
}

function areSoundsEnabled() {
  return soundsEnabled;
}

window.setSoundsEnabled = setSoundsEnabled;
window.toggleSoundsEnabled = toggleSoundsEnabled;
window.areSiteSoundsEnabled = areSoundsEnabled;
