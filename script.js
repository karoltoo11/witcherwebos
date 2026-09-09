
let clockMode = localStorage.getItem('witcher_clock_mode') || '24h';
let showSeconds = localStorage.getItem('witcher_show_seconds') !== 'false';

function updateClock() {
  const clockElement = document.getElementById('clock');
  if (!clockElement) return;
  const now = new Date();
  
  const options = {
    hour12: clockMode === '12h',
    hour: '2-digit',
    minute: '2-digit'
  };
  if (showSeconds) {
    options.second = '2-digit';
  }
  clockElement.textContent = now.toLocaleTimeString([], options);
}
setInterval(updateClock, 1000);
updateClock();


let totalCrowns = 150;
function addCrowns(amount) {
  totalCrowns += amount;
  const countEl = document.getElementById('crowns-count');
  if (countEl) countEl.textContent = totalCrowns;
}


let highestZIndex = 100;

function setupWindow(windowId, appName) {
  const win = document.getElementById(windowId);
  if (!win) return;

  const header = win.querySelector('.window-header');
  const closeBtn = win.querySelector('.close-btn');
  const minimizeBtn = win.querySelector('.minimize-btn');
  const maximizeBtn = win.querySelector('.maximize-btn');
  const icon = document.querySelector(`.icon[data-app="${appName}"]`);
  const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);

  function bringToFront() {
    highestZIndex++;
    win.style.zIndex = highestZIndex;
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');

    document.querySelectorAll('.taskbar-item').forEach(t => t.classList.remove('active'));
    if (taskbarItem) taskbarItem.classList.add('active');
  }

  win.addEventListener('mousedown', bringToFront);


  if (header) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let targetLeft, targetTop;
    let rafId = null;

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('win-btn')) return;
      if (win.classList.contains('maximized')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = win.offsetLeft;
      initialTop = win.offsetTop;
      targetLeft = initialLeft;
      targetTop = initialTop;

      win.classList.add('dragging');
      bringToFront();

      function updatePosition() {
        if (!isDragging) return;
        win.style.left = `${targetLeft}px`;
        win.style.top = `${targetTop}px`;
        rafId = null;
      }

      function onMouseMove(e) {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Keep at least part of the window inside the screen
        const maxTop = window.innerHeight - 80;
        targetLeft = initialLeft + deltaX;
        targetTop = Math.max(0, Math.min(initialTop + deltaY, maxTop));

        if (!rafId) {
          rafId = requestAnimationFrame(updatePosition);
        }
      }

      function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        win.classList.remove('dragging');
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        win.style.left = `${targetLeft}px`;
        win.style.top = `${targetTop}px`;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseup', onMouseUp);
    });


    header.addEventListener('dblclick', (e) => {
      if (e.target.classList.contains('win-btn')) return;
      toggleMaximize();
    });
  }


  function toggleMaximize() {
    const isMax = win.classList.toggle('maximized');
    if (maximizeBtn) {
      maximizeBtn.textContent = isMax ? '❐' : '□';
    }
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximize();
    });
  }


  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.style.display = 'none';
      if (taskbarItem) taskbarItem.classList.remove('active');
      if (icon) icon.classList.remove('selected');
    });
  }


  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.style.display = 'none';
      if (icon) icon.classList.remove('selected');
      if (taskbarItem) {
        taskbarItem.classList.remove('active');
        taskbarItem.style.display = 'none';
      }
    });
  }

  if (icon) {
    icon.addEventListener('click', () => {
      win.style.display = 'flex';
      bringToFront();
      icon.classList.add('selected');
      if (taskbarItem) {
        taskbarItem.style.display = 'flex';
        taskbarItem.classList.add('active');
      }
    });
  }


  if (taskbarItem) {
    taskbarItem.addEventListener('click', () => {
      if (win.style.display === 'none') {
        win.style.display = 'flex';
        bringToFront();
      } else {
        win.style.display = 'none';
        taskbarItem.classList.remove('active');
      }
    });
  }
}

setupWindow('window-Bestiary', 'Bestiary');
setupWindow('window-Contracts', 'Contracts');
setupWindow('window-Settings', 'Settings');
setupWindow('window-Music', 'Music');


const bestiaryList = document.querySelector('.bestiary-list');
if (bestiaryList) {
  bestiaryList.addEventListener('click', (e) => {
    const tab = e.target.closest('.monster-tab');
    if (!tab) return;

    document.querySelectorAll('.monster-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.getAttribute('data-target');
    document.querySelectorAll('.monster-card').forEach(card => card.style.display = 'none');

    const activeCard = document.getElementById(`card-${target}`);
    if (activeCard) activeCard.style.display = 'flex';
  });
}


const contractsList = document.querySelector('.contracts-list');
if (contractsList) {
  contractsList.addEventListener('click', (e) => {
    const tab = e.target.closest('.contract-tab');
    if (!tab) return;

    document.querySelectorAll('.contract-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const contractId = tab.getAttribute('data-contract');
    document.querySelectorAll('.contract-view').forEach(v => v.style.display = 'none');

    const activeView = document.getElementById(`view-${contractId}`);
    if (activeView) activeView.style.display = 'block';
  });
}

const contractRewards = {
  well: 250,
  honorton: 320,
  wood: 450,
  oxenfurt: 380,
  shrieker: 300,
  white_lady: 360,
  haunted_lighthouse: 420,
  swamp_thing: 400,
  dragon: 460,
  sarasti: 480,
  skellige_morvudd: 500,
  tous_beast: 550
};

window.startContract = function(id, reward) {
  const badge = document.getElementById(`badge-${id}`);
  const actions = document.getElementById(`actions-${id}`);
  const quiz = document.getElementById(`quiz-${id}`);
  const result = document.getElementById(`result-${id}`);

  if (badge) {
    badge.textContent = 'IN PROGRESS';
    badge.className = 'contract-badge in-progress';
  }
  if (actions) actions.style.display = 'none';
  if (quiz) quiz.style.display = 'block';
  if (result) result.style.display = 'none';
};

window.resolveContract = function(id, isCorrect, explanation) {
  const badge = document.getElementById(`badge-${id}`);
  const quiz = document.getElementById(`quiz-${id}`);
  const result = document.getElementById(`result-${id}`);
  const reward = contractRewards[id] || 200;

  if (quiz) quiz.style.display = 'none';
  if (!result) return;

  result.style.display = 'block';

  if (isCorrect) {
    badge.textContent = 'COMPLETED';
    badge.className = 'contract-badge completed';
    result.className = 'contract-result success';
    result.innerHTML = `
      <strong>🏆 CONTRACT COMPLETED!</strong><br>
      ${explanation}<br>
      <div style="margin-top: 8px; font-weight: bold; color: #facc15;">
        💰 Bounty Collected: +${reward} Crowns added to your purse!
      </div>
    `;
    addCrowns(reward);
  } else {
    badge.textContent = 'FAILED';
    badge.className = 'contract-badge failed';
    result.className = 'contract-result failure';
    result.innerHTML = `
      <strong>💀 CONTRACT FAILED!</strong><br>
      ${explanation}<br>
      <div style="margin-top: 8px;">
        <button class="witcher-btn" onclick="resetContract('${id}', ${reward})">🔄 Meditate & Retry Hunt</button>
      </div>
    `;
  }
};

window.resetContract = function(id, reward) {
  const badge = document.getElementById(`badge-${id}`);
  const actions = document.getElementById(`actions-${id}`);
  const quiz = document.getElementById(`quiz-${id}`);
  const result = document.getElementById(`result-${id}`);

  if (badge) {
    badge.textContent = 'OPEN';
    badge.className = 'contract-badge open';
  }
  if (actions) actions.style.display = 'block';
  if (quiz) quiz.style.display = 'none';
  if (result) result.style.display = 'none';
};


const savedSchool = localStorage.getItem('witcher_school') || 'wolf';
applySchoolTheme(savedSchool);

function applySchoolTheme(school) {
  document.body.setAttribute('data-school', school);
  localStorage.setItem('witcher_school', school);

  document.querySelectorAll('.theme-card').forEach(card => {
    if (card.getAttribute('data-school') === school) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const school = card.getAttribute('data-school');
    if (school) applySchoolTheme(school);
  });
});


const desktopEl = document.getElementById('desktop');
const savedWallpaper = localStorage.getItem('witcher_wallpaper') || 'kaer-morhen';
applyWallpaper(savedWallpaper);

function applyWallpaper(wallpaper) {
  if (!desktopEl) return;
  desktopEl.classList.remove('wp-kaer-morhen', 'wp-velen', 'wp-toussaint', 'wp-void');
  desktopEl.classList.add(`wp-${wallpaper}`);
  localStorage.setItem('witcher_wallpaper', wallpaper);

  document.querySelectorAll('.wallpaper-opt').forEach(btn => {
    if (btn.getAttribute('data-wallpaper') === wallpaper) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

document.querySelectorAll('.wallpaper-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const wp = btn.getAttribute('data-wallpaper');
    if (wp) applyWallpaper(wp);
  });
});


const clockModeSelect = document.getElementById('setting-clock-mode');
const showSecondsCheckbox = document.getElementById('setting-show-seconds');

if (clockModeSelect) {
  clockModeSelect.value = clockMode;
  clockModeSelect.addEventListener('change', (e) => {
    clockMode = e.target.value;
    localStorage.setItem('witcher_clock_mode', clockMode);
    updateClock();
  });
}

if (showSecondsCheckbox) {
  showSecondsCheckbox.checked = showSeconds;
  showSecondsCheckbox.addEventListener('change', (e) => {
    showSeconds = e.target.checked;
    localStorage.setItem('witcher_show_seconds', showSeconds);
    updateClock();
  });
}

const localPlaylist = [
  {
    title: "⚔️ Silver for Monsters",
    artist: "Marcin Przybyłowicz & Percival",
    src: "music/silver_for_monsters.mp3"
  },
  {
    title: "🏰 Kaer Morhen",
    artist: "Marcin Przybyłowicz",
    src: "music/kaer_morhen.mp3"
  },
  {
    title: "🩸 ...Steel for Humans (Banana Tiger)",
    artist: "Marcin Przybyłowicz & Percival",
    src: "music/steel_for_humans.mp3"
  },
  {
    title: "🐺 Geralt of Rivia (Main Theme)",
    artist: "Marcin Przybyłowicz",
    src: "music/geralt_of_rivia.mp3"
  },
  {
    title: "🌹 Wilcza Zamieć (The Wolven Storm)",
    artist: "Marcin Przybyłowicz & Anna Terpiłowska (Polski oryginał)",
    src: "music/priscillas_song.mp3"
  }
];

let localTrackIdx = 0;
let isAudioPlaying = false;

const witcherAudio = document.getElementById('witcher-audio');
const playBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-track-btn');
const nextBtn = document.getElementById('next-track-btn');
const currentTrackTitle = document.getElementById('current-track-title');
const currentTrackArtist = document.getElementById('current-track-artist');
const playerStatusBadge = document.getElementById('player-status-badge');
const diskSpinner = document.getElementById('lute-disk');
const curTimeText = document.getElementById('current-time-text');
const durTimeText = document.getElementById('duration-time-text');
const audioSeekBar = document.getElementById('audio-seek-bar');
const audioVolBar = document.getElementById('audio-volume-bar');

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function selectTrack(index, autoPlay = true) {
  localTrackIdx = index;
  const track = localPlaylist[index];
  if (!track) return;

  if (currentTrackTitle) currentTrackTitle.textContent = track.title;
  if (currentTrackArtist) currentTrackArtist.textContent = track.artist;
  if (witcherAudio) {
    witcherAudio.src = track.src;
    witcherAudio.load();
  }

  document.querySelectorAll('#tracklist-items .track-item').forEach((item, i) => {
    if (i === index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  if (autoPlay) {
    playAudio();
  }
}

function playAudio() {
  if (!witcherAudio) return;
  witcherAudio.play().then(() => {
    isAudioPlaying = true;
    if (playBtn) playBtn.textContent = '⏸️';
    if (diskSpinner) diskSpinner.classList.add('spinning');
    if (playerStatusBadge) playerStatusBadge.textContent = 'PLAYING TUNE';
  }).catch(e => {
    console.log("Audio play blocked until click:", e);
  });
}

function pauseAudio() {
  if (!witcherAudio) return;
  witcherAudio.pause();
  isAudioPlaying = false;
  if (playBtn) playBtn.textContent = '▶️';
  if (diskSpinner) diskSpinner.classList.remove('spinning');
  if (playerStatusBadge) playerStatusBadge.textContent = 'PAUSED';
}

if (playBtn) {
  playBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    localTrackIdx = (localTrackIdx - 1 + localPlaylist.length) % localPlaylist.length;
    selectTrack(localTrackIdx, true);
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    localTrackIdx = (localTrackIdx + 1) % localPlaylist.length;
    selectTrack(localTrackIdx, true);
  });
}

function updateSliderProgress(slider, value, max = 100) {
  if (!slider) return;
  const pct = (value / max) * 100;
  slider.style.background = `linear-gradient(to right, var(--witcher-accent-bright) 0%, var(--witcher-accent-bright) ${pct}%, #232936 ${pct}%, #232936 100%)`;
}

if (witcherAudio) {
  witcherAudio.addEventListener('timeupdate', () => {
    if (!witcherAudio.duration) return;
    const pct = (witcherAudio.currentTime / witcherAudio.duration) * 100;
    if (audioSeekBar) {
      audioSeekBar.value = pct;
      updateSliderProgress(audioSeekBar, pct, 100);
    }
    if (curTimeText) curTimeText.textContent = formatTime(witcherAudio.currentTime);
    if (durTimeText) durTimeText.textContent = formatTime(witcherAudio.duration);
  });

  witcherAudio.addEventListener('ended', () => {
    localTrackIdx = (localTrackIdx + 1) % localPlaylist.length;
    selectTrack(localTrackIdx, true);
  });
}

if (audioSeekBar && witcherAudio) {
  audioSeekBar.addEventListener('input', () => {
    const val = parseFloat(audioSeekBar.value);
    updateSliderProgress(audioSeekBar, val, 100);
    if (witcherAudio.duration) {
      witcherAudio.currentTime = (val / 100) * witcherAudio.duration;
    }
  });
}

if (audioVolBar && witcherAudio) {
  updateSliderProgress(audioVolBar, 75, 100);
  audioVolBar.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    witcherAudio.volume = vol;
    updateSliderProgress(audioVolBar, vol * 100, 100);
  });
}


document.querySelectorAll('#tracklist-items .track-item').forEach(item => {
  item.addEventListener('click', () => {
    const idx = parseInt(item.getAttribute('data-index'));
    selectTrack(idx, true);
  });
});


selectTrack(0, false);