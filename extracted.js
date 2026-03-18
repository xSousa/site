
    const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk";
    const YOUTUBE_EMBED_URL = "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?rel=0&controls=1&modestbranding=1";
    const LEADERBOARD_API = "https://xsousa-solitaire-api.onrender.com/api";

    const STEAM_PROFILES = [
      { id: "xSousa", url: "https://steamcommunity.com/id/xSousa/" },
      { id: "RafaXIS", url: "https://steamcommunity.com/id/RafaXIS/" }
    ];

    const wallpapers = {
      xp: 'url("https://i.imgur.com/uGRFZEs.jpg")',
      sky: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80")',
      aero: 'url("https://images.unsplash.com/photo-1493246318656-5bfd4cfb29b8?auto=format&fit=crop&w=1600&q=80")',
      dark: 'url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80")'
    };

    const DEFAULT_ICON_POSITIONS = {
      mainapp: { left: 22, top: 24 },
      youtube: { left: 22, top: 110 },
      music: { left: 22, top: 196 },
      settings: { left: 22, top: 282 },
      steam: { left: 22, top: 368 },
      solitaire: { left: 22, top: 454 },
      msn: { left: 22, top: 540 }
    };

    const desktop = document.getElementById("desktop");
    const GRID_X = 96;
    const GRID_Y = 86;
    const GRID_LEFT = 22;
    const GRID_TOP = 24;
    let pendingExternalUrl = null;
    let draggedCardInfo = null;
    let gamesCloseTimer = null;
    let topZ = 100;
    let alreadyWonThisGame = false;

    const windowsMap = {
      mainWindow: document.getElementById("mainWindow"),
      playerWindow: document.getElementById("playerWindow"),
      settingsWindow: document.getElementById("settingsWindow"),
      solitaireWindow: document.getElementById("solitaireWindow"),
      leaderboardWindow: document.getElementById("leaderboardWindow"),
      msnWindow: document.getElementById("msnWindow"),
      clockWindow: document.getElementById("clockWindow"),
      winPopup: document.getElementById("winPopup"),
      externalLinkWindow: document.getElementById("externalLinkWindow")
    };

    const APP_TITLES = {
      mainWindow: "xSousa.exe",
      playerWindow: "MusicPlayer.exe",
      settingsWindow: "Settings.exe",
      solitaireWindow: "Solitaire.exe",
      leaderboardWindow: "Solitaire Leaderboard",
      msnWindow: "Messenger.exe",
      clockWindow: "Date and Time",
      winPopup: "Solitaire.exe",
      externalLinkWindow: "Open External Link"
    };

    const taskButtons = {};
    document.querySelectorAll("[data-task]").forEach(btn => {
      taskButtons[btn.dataset.task] = btn;
    });

    function updateBrowserTitle(activeWindowId = null) {
      document.title = APP_TITLES[activeWindowId] || "xSousa.exe";
    }

    function bringToFront(win) {
      if (!win) return;
      topZ++;
      win.style.zIndex = topZ;
      updateBrowserTitle(win.id);
    }

    function setTaskState(windowId, active) {
      const btn = taskButtons[windowId];
      if (!btn) return;
      btn.classList.toggle("hidden", !active);
      btn.style.display = active ? "flex" : "none";
    }

    function showWindow(windowId) {
      const win = windowsMap[windowId];
      if (!win) return;
      win.classList.remove("hidden");
      if (taskButtons[windowId]) setTaskState(windowId, true);
      bringToFront(win);
    }

    function hideWindow(windowId) {
      const win = windowsMap[windowId];
      if (!win) return;
      win.classList.add("hidden");
      if (taskButtons[windowId]) setTaskState(windowId, false);

      const visibleWindows = Object.values(windowsMap).filter(w => !w.classList.contains("hidden"));
      if (visibleWindows.length > 0) {
        visibleWindows.sort((a, b) => (parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0)));
        updateBrowserTitle(visibleWindows[0].id);
      } else {
        updateBrowserTitle();
      }
    }

    function toggleWindow(windowId) {
      const win = windowsMap[windowId];
      if (!win) return;
      if (win.classList.contains("hidden")) showWindow(windowId);
      else hideWindow(windowId);
    }

    document.querySelectorAll("[data-task]").forEach(btn => {
      btn.addEventListener("click", () => toggleWindow(btn.dataset.task));
    });

    document.querySelectorAll("[data-minimize]").forEach(btn => {
      btn.addEventListener("click", () => hideWindow(btn.dataset.minimize));
    });

    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => hideWindow(btn.dataset.close));
    });

    function makeDraggable(windowEl, handleEl) {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      handleEl.addEventListener("mousedown", (e) => {
        if (e.target.closest(".win-btn")) return;
        isDragging = true;
        bringToFront(windowEl);
        const rect = windowEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging || windowEl.classList.contains("hidden")) return;

        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;

        const maxLeft = window.innerWidth - windowEl.offsetWidth;
        const maxTop = window.innerHeight - 60 - windowEl.offsetHeight;

        left = Math.max(0, Math.min(left, maxLeft));
        top = Math.max(0, Math.min(top, maxTop));

        windowEl.style.left = left + "px";
        windowEl.style.top = top + "px";
      });

      document.addEventListener("mouseup", () => { isDragging = false; });
    }

    makeDraggable(windowsMap.mainWindow, document.getElementById("titlebarMain"));
    makeDraggable(windowsMap.playerWindow, document.getElementById("titlebarPlayer"));
    makeDraggable(windowsMap.settingsWindow, document.getElementById("titlebarSettings"));
    makeDraggable(windowsMap.solitaireWindow, document.getElementById("titlebarSolitaire"));
    makeDraggable(windowsMap.leaderboardWindow, document.getElementById("titlebarLeaderboard"));
    makeDraggable(windowsMap.msnWindow, document.getElementById("titlebarMsn"));
    makeDraggable(windowsMap.clockWindow, document.getElementById("titlebarClock"));
    makeDraggable(windowsMap.winPopup, document.getElementById("titlebarPopup"));
    makeDraggable(windowsMap.externalLinkWindow, document.getElementById("titlebarExternal"));

    Object.values(windowsMap).forEach(win => {
      win.addEventListener("mousedown", () => bringToFront(win));
    });

    const startButton = document.getElementById("startButton");
    const startMenu = document.getElementById("startMenu");
    const closeStartBtn = document.getElementById("closeStartBtn");
    const gamesMenuItem = document.getElementById("gamesMenuItem");
    const gamesSubmenu = document.getElementById("gamesSubmenu");

    function openStartMenu() {
      startMenu.classList.add("open");
      startButton.classList.add("active");
    }

    function closeStartMenu() {
      startMenu.classList.remove("open");
      startButton.classList.remove("active");
      closeGamesSubmenuImmediate();
    }

    startButton.addEventListener("click", () => {
      if (startMenu.classList.contains("open")) closeStartMenu();
      else openStartMenu();
    });

    closeStartBtn.addEventListener("click", () => {
      closeStartMenu();
      lockDesktop();
    });

    function openGamesSubmenu() {
      clearTimeout(gamesCloseTimer);
      gamesSubmenu.classList.remove("closing");
      gamesSubmenu.classList.add("open");
    }

    function closeGamesSubmenuDelayed() {
      clearTimeout(gamesCloseTimer);
      gamesCloseTimer = setTimeout(() => {
        if (gamesSubmenu.matches(":hover") || gamesMenuItem.matches(":hover")) return;
        gamesSubmenu.classList.remove("open");
        gamesSubmenu.classList.add("closing");
        setTimeout(() => {
          if (!gamesSubmenu.matches(":hover") && !gamesMenuItem.matches(":hover")) {
            gamesSubmenu.classList.remove("closing");
          }
        }, 260);
      }, 1200);
    }

    function closeGamesSubmenuImmediate() {
      clearTimeout(gamesCloseTimer);
      gamesSubmenu.classList.remove("open", "closing");
    }

    gamesMenuItem.addEventListener("mouseenter", openGamesSubmenu);
    gamesMenuItem.addEventListener("mouseleave", closeGamesSubmenuDelayed);
    gamesSubmenu.addEventListener("mouseenter", openGamesSubmenu);
    gamesSubmenu.addEventListener("mouseleave", closeGamesSubmenuDelayed);

    document.addEventListener("click", (e) => {
      if (!startMenu.contains(e.target) && !startButton.contains(e.target)) closeStartMenu();
    });

    function askExternalLink(url, appName = "Application") {
      pendingExternalUrl = url;
      document.getElementById("externalAppLabel").textContent = appName;
      document.getElementById("externalUrlLabel").textContent = url;
      showWindow("externalLinkWindow");
    }

    document.getElementById("externalCancelBtn").addEventListener("click", () => {
      pendingExternalUrl = null;
      hideWindow("externalLinkWindow");
    });

    document.getElementById("externalOkBtn").addEventListener("click", () => {
      if (!pendingExternalUrl) return;
      window.open(pendingExternalUrl, "_blank");
      pendingExternalUrl = null;
      hideWindow("externalLinkWindow");
    });

    document.querySelectorAll("[data-external]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        askExternalLink(link.dataset.external, link.dataset.appname || "Application");
      });
    });

    function hookExternalButton(id, url, name) {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => askExternalLink(url, name));
    }

    hookExternalButton("menuInstagram", "https://instagram.com/enzoxsousa", "Instagram");
    hookExternalButton("menuEmail", "mailto:enzo@xsousa.com", "Email");
    hookExternalButton("menuSteam", "https://steamcommunity.com/id/xSousa/", "Steam");
    hookExternalButton("menuYoutube", "https://www.youtube.com/@xSousa", "YouTube");

    document.getElementById("openWindowItem").addEventListener("click", () => { showWindow("mainWindow"); closeStartMenu(); });
    document.getElementById("openPlayerItem").addEventListener("click", () => { showWindow("playerWindow"); loadPlayer(); closeStartMenu(); });
    document.getElementById("openSettingsItem").addEventListener("click", () => { showWindow("settingsWindow"); closeStartMenu(); });
    document.getElementById("openSolitaireItem").addEventListener("click", () => { showWindow("solitaireWindow"); closeStartMenu(); });
    document.getElementById("openLeaderboardItem").addEventListener("click", async () => { await renderLeaderboard(); showWindow("leaderboardWindow"); closeStartMenu(); });
    document.getElementById("openMsnItem").addEventListener("click", () => { showWindow("msnWindow"); loadSteamStatus(); closeStartMenu(); });

    document.getElementById("desktopShortcut").addEventListener("dblclick", () => showWindow("mainWindow"));
    document.getElementById("youtubeShortcut").addEventListener("dblclick", () => askExternalLink("https://www.youtube.com/@xSousa", "YouTube"));
    document.getElementById("musicShortcut").addEventListener("dblclick", () => { showWindow("playerWindow"); loadPlayer(); });
    document.getElementById("settingsShortcut").addEventListener("dblclick", () => showWindow("settingsWindow"));
    document.getElementById("steamShortcut").addEventListener("dblclick", () => askExternalLink("https://steamcommunity.com/id/xSousa/", "Steam"));
    document.getElementById("solitaireShortcut").addEventListener("dblclick", () => showWindow("solitaireWindow"));
    document.getElementById("msnShortcut").addEventListener("dblclick", () => { showWindow("msnWindow"); loadSteamStatus(); });

    const ytPlayer = document.getElementById("ytPlayer");
    const playerStatus = document.getElementById("playerStatus");

    function loadPlayer() {
      if (!ytPlayer.src) ytPlayer.src = YOUTUBE_EMBED_URL;
      playerStatus.textContent = "If YouTube still shows error 153, open this page through localhost instead of file://";
    }

    document.getElementById("hidePlayerBtn").addEventListener("click", () => hideWindow("playerWindow"));
    document.getElementById("reloadMusicBtn").addEventListener("click", () => {
      ytPlayer.src = YOUTUBE_EMBED_URL + "&t=" + Date.now();
      showWindow("playerWindow");
    });
    document.getElementById("openYoutubeBtn").addEventListener("click", () => {
      askExternalLink(YOUTUBE_WATCH_URL, "Music Player");
    });

    if (location.protocol === "file:") {
      playerStatus.textContent = "YouTube embed may fail with error 153 on file://. Use localhost to make it work.";
    } else {
      loadPlayer();
    }

    const bgPreset = document.getElementById("bgPreset");
    const bgCustom = document.getElementById("bgCustom");
    const taskbarTop = document.getElementById("taskbarTop");
    const taskbarMid = document.getElementById("taskbarMid");
    const taskbarBottom = document.getElementById("taskbarBottom");
    const windowTop = document.getElementById("windowTop");
    const windowMid = document.getElementById("windowMid");
    const windowBottom = document.getElementById("windowBottom");

    function applyWallpaper(value, customValue) {
      let wallpaperValue = wallpapers[value] || wallpapers.xp;
      if (value === "custom" && customValue.trim()) wallpaperValue = `url("${customValue.trim()}")`;
      document.documentElement.style.setProperty("--wallpaper", wallpaperValue);
    }

    function applySettings() {
      applyWallpaper(bgPreset.value, bgCustom.value);
      document.documentElement.style.setProperty("--taskbar-top", taskbarTop.value);
      document.documentElement.style.setProperty("--taskbar-mid", taskbarMid.value);
      document.documentElement.style.setProperty("--taskbar-low", taskbarMid.value);
      document.documentElement.style.setProperty("--taskbar-bottom", taskbarBottom.value);
      document.documentElement.style.setProperty("--window-top", windowTop.value);
      document.documentElement.style.setProperty("--window-mid", windowMid.value);
      document.documentElement.style.setProperty("--window-low", windowMid.value);
      document.documentElement.style.setProperty("--window-bottom", windowBottom.value);

      localStorage.setItem("xpSiteSettings", JSON.stringify({
        bgPreset: bgPreset.value,
        bgCustom: bgCustom.value,
        taskbarTop: taskbarTop.value,
        taskbarMid: taskbarMid.value,
        taskbarBottom: taskbarBottom.value,
        windowTop: windowTop.value,
        windowMid: windowMid.value,
        windowBottom: windowBottom.value
      }));
    }

    function loadSettings() {
      const saved = localStorage.getItem("xpSiteSettings");
      if (!saved) return;
      try {
        const s = JSON.parse(saved);
        bgPreset.value = s.bgPreset || "xp";
        bgCustom.value = s.bgCustom || "";
        taskbarTop.value = s.taskbarTop || "#3b89ef";
        taskbarMid.value = s.taskbarMid || "#2a74db";
        taskbarBottom.value = s.taskbarBottom || "#14499d";
        windowTop.value = s.windowTop || "#4f9df8";
        windowMid.value = s.windowMid || "#2a7be4";
        windowBottom.value = s.windowBottom || "#1f59b8";
        applySettings();
      } catch {}
    }

    document.getElementById("applySettingsBtn").addEventListener("click", applySettings);
    document.getElementById("closeSettingsBtn").addEventListener("click", () => {
      applySettings();
      hideWindow("settingsWindow");
    });
    document.getElementById("xpThemeBtn").addEventListener("click", () => {
      bgPreset.value = "xp";
      bgCustom.value = "";
      taskbarTop.value = "#3b89ef";
      taskbarMid.value = "#2a74db";
      taskbarBottom.value = "#14499d";
      windowTop.value = "#4f9df8";
      windowMid.value = "#2a7be4";
      windowBottom.value = "#1f59b8";
      applySettings();
    });

    function gridToCell(left, top) {
      return {
        col: Math.round((left - GRID_LEFT) / GRID_X),
        row: Math.round((top - GRID_TOP) / GRID_Y)
      };
    }

    function cellToGrid(col, row, icon) {
      const maxLeft = desktop.clientWidth - icon.offsetWidth;
      const maxTop = desktop.clientHeight - 50 - icon.offsetHeight;
      let left = GRID_LEFT + (col * GRID_X);
      let top = GRID_TOP + (row * GRID_Y);
      left = Math.max(GRID_LEFT, Math.min(left, maxLeft));
      top = Math.max(GRID_TOP, Math.min(top, maxTop));
      return { left, top };
    }

    function getOccupiedMap(excludeId = null) {
      const occupied = new Map();
      document.querySelectorAll(".desktop-icon[data-icon-id]").forEach(icon => {
        if (icon.dataset.iconId === excludeId) return;
        const left = parseInt(icon.style.left, 10) || 0;
        const top = parseInt(icon.style.top, 10) || 0;
        const { col, row } = gridToCell(left, top);
        occupied.set(`${col},${row}`, icon.dataset.iconId);
      });
      return occupied;
    }

    function findNearestFreeCell(targetCol, targetRow, excludeId = null) {
      const occupied = getOccupiedMap(excludeId);
      const maxCols = Math.max(1, Math.floor((desktop.clientWidth - GRID_LEFT) / GRID_X) + 1);
      const maxRows = Math.max(1, Math.floor((desktop.clientHeight - 50 - GRID_TOP) / GRID_Y) + 1);

      function isFree(col, row) {
        if (col < 0 || row < 0 || col > maxCols || row > maxRows) return false;
        return !occupied.has(`${col},${row}`);
      }

      if (isFree(targetCol, targetRow)) return { col: targetCol, row: targetRow };

      for (let radius = 1; radius < 50; radius++) {
        for (let r = -radius; r <= radius; r++) {
          for (let c = -radius; c <= radius; c++) {
            if (Math.abs(c) !== radius && Math.abs(r) !== radius) continue;
            const col = targetCol + c;
            const row = targetRow + r;
            if (isFree(col, row)) return { col, row };
          }
        }
      }

      return { col: 0, row: 0 };
    }

    function snapIconToFreeSlot(icon, preferredLeft, preferredTop) {
      const { col, row } = gridToCell(preferredLeft, preferredTop);
      const free = findNearestFreeCell(col, row, icon.dataset.iconId);
      const snapped = cellToGrid(free.col, free.row, icon);
      icon.style.left = snapped.left + "px";
      icon.style.top = snapped.top + "px";
    }

    function saveIconPositions() {
      const positions = {};
      document.querySelectorAll(".desktop-icon[data-icon-id]").forEach(icon => {
        positions[icon.dataset.iconId] = {
          left: parseInt(icon.style.left, 10) || 0,
          top: parseInt(icon.style.top, 10) || 0
        };
      });
      localStorage.setItem("xpDesktopIcons", JSON.stringify(positions));
    }

    function normalizeAllIconsToGrid() {
      document.querySelectorAll(".desktop-icon[data-icon-id]").forEach(icon => {
        const left = parseInt(icon.style.left, 10);
        const top = parseInt(icon.style.top, 10);
        if (Number.isNaN(left) || Number.isNaN(top)) {
          const def = DEFAULT_ICON_POSITIONS[icon.dataset.iconId];
          if (def) {
            icon.style.left = def.left + "px";
            icon.style.top = def.top + "px";
          }
        }
      });

      document.querySelectorAll(".desktop-icon[data-icon-id]").forEach(icon => {
        const left = parseInt(icon.style.left, 10) || 0;
        const top = parseInt(icon.style.top, 10) || 0;
        snapIconToFreeSlot(icon, left, top);
      });
    }

    function loadIconPositions() {
      let positions = DEFAULT_ICON_POSITIONS;
      const saved = localStorage.getItem("xpDesktopIcons");

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") positions = parsed;
        } catch {}
      }

      document.querySelectorAll(".desktop-icon[data-icon-id]").forEach(icon => {
        const id = icon.dataset.iconId;
        const pos = positions[id] || DEFAULT_ICON_POSITIONS[id];
        if (pos) {
          icon.style.left = pos.left + "px";
          icon.style.top = pos.top + "px";
        }
      });

      requestAnimationFrame(() => {
        normalizeAllIconsToGrid();
        saveIconPositions();
      });
    }

    function resetIconPositions() {
      localStorage.removeItem("xpDesktopIcons");
      Object.entries(DEFAULT_ICON_POSITIONS).forEach(([id, pos]) => {
        const icon = document.querySelector(`.desktop-icon[data-icon-id="${id}"]`);
        if (icon) {
          icon.style.left = pos.left + "px";
          icon.style.top = pos.top + "px";
        }
      });
      requestAnimationFrame(() => {
        normalizeAllIconsToGrid();
        saveIconPositions();
      });
    }

    document.getElementById("resetIconsBtn").addEventListener("click", resetIconPositions);

    function clearSelectedIcons() {
      document.querySelectorAll(".desktop-icon.selected").forEach(el => el.classList.remove("selected"));
    }

    function makeDesktopIconDraggable(icon) {
      let isDragging = false;
      let startX = 0, startY = 0, originLeft = 0, originTop = 0, moved = false;

      icon.addEventListener("mousedown", (e) => {
        if (e.button !== 0 || e.detail > 1) return;
        clearSelectedIcons();
        icon.classList.add("selected");
        isDragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        originLeft = parseInt(icon.style.left, 10) || 0;
        originTop = parseInt(icon.style.top, 10) || 0;
        icon.classList.add("dragging");
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

        let newLeft = originLeft + dx;
        let newTop = originTop + dy;
        const maxLeft = desktop.clientWidth - icon.offsetWidth;
        const maxTop = desktop.clientHeight - 50 - icon.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        icon.style.left = newLeft + "px";
        icon.style.top = newTop + "px";
      });

      document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        icon.classList.remove("dragging");

        const currentLeft = parseInt(icon.style.left, 10) || 0;
        const currentTop = parseInt(icon.style.top, 10) || 0;
        snapIconToFreeSlot(icon, currentLeft, currentTop);

        if (moved) saveIconPositions();
      });
    }

    document.querySelectorAll(".desktop-icon[data-icon-id]").forEach(makeDesktopIconDraggable);
    desktop.addEventListener("mousedown", (e) => {
      if (!e.target.closest(".desktop-icon") && !e.target.closest("#trayClock")) clearSelectedIcons();
    });

    function createClockMarks() {
      const clockMarks = document.getElementById("clockMarks");
      clockMarks.innerHTML = "";
      for (let i = 0; i < 60; i++) {
        const mark = document.createElement("div");
        mark.className = `clock-mark ${i % 5 === 0 ? "major" : ""}`;
        mark.style.transform = `translate(-50%, -100%) rotate(${i * 6}deg)`;
        clockMarks.appendChild(mark);
      }
    }

    function renderCalendar(currentDate = new Date()) {
      const calendarGrid = document.getElementById("calendarGrid");
      const monthYear = document.getElementById("calendarMonthYear");
      const todayText = document.getElementById("calendarTodayText");

      const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

      monthYear.textContent = `${monthNames[month]} ${year}`;
      todayText.textContent = `Today: ${String(today.getDate()).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;

      calendarGrid.innerHTML = "";

      weekdayNames.forEach(day => {
        const el = document.createElement("div");
        el.className = "calendar-weekday";
        el.textContent = day;
        calendarGrid.appendChild(el);
      });

      const firstDay = new Date(year, month, 1);
      const startDay = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      for (let i = startDay - 1; i >= 0; i--) {
        const el = document.createElement("div");
        el.className = "calendar-day other-month";
        el.textContent = daysInPrevMonth - i;
        calendarGrid.appendChild(el);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement("div");
        el.className = "calendar-day";
        el.textContent = day;
        if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
          el.classList.add("today");
        }
        calendarGrid.appendChild(el);
      }

      const totalCells = calendarGrid.children.length - 7;
      const trailing = (7 - (totalCells % 7)) % 7;

      for (let i = 1; i <= trailing; i++) {
        const el = document.createElement("div");
        el.className = "calendar-day other-month";
        el.textContent = i;
        calendarGrid.appendChild(el);
      }
    }

    function updateClock() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const mo = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();

      document.getElementById("clock").textContent = `${hh}:${mm}`;
      document.getElementById("dateLine").textContent = `${dd}/${mo}/${yyyy}`;
      document.getElementById("clockDigital").textContent = `${hh}:${mm}:${ss}`;

      const hourDeg = ((now.getHours() % 12) * 30) + (now.getMinutes() * 0.5) + (now.getSeconds() * (0.5 / 60));
      const minuteDeg = (now.getMinutes() * 6) + (now.getSeconds() * 0.1);
      const secondDeg = now.getSeconds() * 6;

      document.getElementById("hourHand").style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
      document.getElementById("minuteHand").style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
      document.getElementById("secondHand").style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

      renderCalendar(now);
    }

    document.getElementById("trayClock").addEventListener("click", (e) => {
      e.stopPropagation();
      if (windowsMap.clockWindow.classList.contains("hidden")) showWindow("clockWindow");
      else hideWindow("clockWindow");
    });

    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let stock = [], waste = [], foundations = [[], [], [], []], tableau = [[], [], [], [], [], [], []];
    let gameStartTime = 0;

    function cardColor(suit) {
      return suit === "♥" || suit === "♦" ? "red" : "black";
    }

    function createDeck() {
      const deck = [];
      const makeId = () => (crypto?.randomUUID ? crypto.randomUUID() : `card-${Date.now()}-${Math.random()}`);

      for (const suit of suits) {
        for (let i = 0; i < values.length; i++) {
          deck.push({ suit, value: values[i], rank: i + 1, color: cardColor(suit), faceUp: false, id: makeId() });
        }
      }

      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }

    function newSolitaireGame() {
      const deck = createDeck();
      stock = [];
      waste = [];
      foundations = [[], [], [], []];
      tableau = [[], [], [], [], [], [], []];
      alreadyWonThisGame = false;
      gameStartTime = Date.now();

      for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
          const c = deck.pop();
          c.faceUp = row === col;
          tableau[col].push(c);
        }
      }

      stock = deck;
      renderSolitaire();
    }

    function makeCardEl(card, pileType, pileIndex, cardIndex) {
      const el = document.createElement("div");
      el.className = `card ${card.color}`;
      if (!card.faceUp) {
        el.className = "card back";
        return el;
      }
      el.draggable = true;
      el.dataset.pileType = pileType;
      el.dataset.pileIndex = pileIndex;
      el.dataset.cardIndex = cardIndex;
      el.innerHTML = `
        <div class="card-value">${card.value}</div>
        <div class="card-suit">${card.suit}</div>
        <div class="card-center">${card.suit}</div>
      `;
      el.addEventListener("dragstart", onCardDragStart);
      return el;
    }

    function renderSolitaire() {
      const stockPile = document.getElementById("stockPile");
      const wastePile = document.getElementById("wastePile");
      const foundationEls = document.querySelectorAll(".foundation");
      const tableauRow = document.getElementById("tableauRow");

      stockPile.innerHTML = "";
      wastePile.innerHTML = "";
      foundationEls.forEach(el => el.innerHTML = "");
      tableauRow.innerHTML = "";

      stockPile.onclick = () => {
        if (stock.length > 0) {
          const card = stock.pop();
          card.faceUp = true;
          waste.push(card);
        } else {
          stock = waste.reverse().map(c => ({ ...c, faceUp: false }));
          waste = [];
        }
        renderSolitaire();
      };

      if (stock.length) {
        stockPile.appendChild(Object.assign(document.createElement("div"), { className: "card back" }));
      }

      if (waste.length) {
        wastePile.appendChild(makeCardEl(waste[waste.length - 1], "waste", 0, waste.length - 1));
      }

      foundationEls.forEach((el, i) => {
        el.dataset.dropType = "foundation";
        el.dataset.dropIndex = i;
        el.addEventListener("dragover", e => e.preventDefault());
        el.addEventListener("drop", onCardDrop);
        if (foundations[i].length) {
          el.appendChild(makeCardEl(foundations[i][foundations[i].length - 1], "foundation", i, foundations[i].length - 1));
        }
      });

      tableau.forEach((pile, pileIndex) => {
        const pileEl = document.createElement("div");
        pileEl.className = "tableau-pile";
        pileEl.dataset.dropType = "tableau";
        pileEl.dataset.dropIndex = pileIndex;
        pileEl.addEventListener("dragover", e => e.preventDefault());
        pileEl.addEventListener("drop", onCardDrop);

        if (pile.length === 0) {
          const slot = document.createElement("div");
          slot.className = "pile-slot";
          pileEl.appendChild(slot);
        } else {
          pile.forEach((card, cardIndex) => {
            const cardEl = makeCardEl(card, "tableau", pileIndex, cardIndex);
            cardEl.style.top = `${cardIndex * 28}px`;
            pileEl.appendChild(cardEl);
          });
        }

        tableauRow.appendChild(pileEl);
      });
    }

    function onCardDragStart(e) {
      draggedCardInfo = {
        pileType: e.currentTarget.dataset.pileType,
        pileIndex: parseInt(e.currentTarget.dataset.pileIndex, 10),
        cardIndex: parseInt(e.currentTarget.dataset.cardIndex, 10)
      };
    }

    function getPile(type, index) {
      if (type === "waste") return waste;
      if (type === "foundation") return foundations[index];
      if (type === "tableau") return tableau[index];
      return null;
    }

    function canDropOnFoundation(card, foundationPile) {
      if (foundationPile.length === 0) return card.rank === 1;
      const top = foundationPile[foundationPile.length - 1];
      return top.suit === card.suit && card.rank === top.rank + 1;
    }

    function canDropOnTableau(card, tableauPile) {
      if (tableauPile.length === 0) return card.rank === 13;
      const top = tableauPile[tableauPile.length - 1];
      if (!top.faceUp) return false;
      return top.color !== card.color && card.rank === top.rank - 1;
    }

    function onCardDrop(e) {
      e.preventDefault();
      if (!draggedCardInfo) return;

      const targetType = e.currentTarget.dataset.dropType;
      const targetIndex = parseInt(e.currentTarget.dataset.dropIndex, 10);
      const fromPile = getPile(draggedCardInfo.pileType, draggedCardInfo.pileIndex);

      if (!fromPile || fromPile.length === 0) return;

      const movingCard = fromPile[draggedCardInfo.cardIndex];
      if (!movingCard || !movingCard.faceUp) return;

      if (draggedCardInfo.pileType === "waste" && draggedCardInfo.cardIndex !== fromPile.length - 1) return;
      if (draggedCardInfo.pileType === "foundation" && draggedCardInfo.cardIndex !== fromPile.length - 1) return;

      if (draggedCardInfo.pileType === "tableau" && draggedCardInfo.cardIndex < fromPile.length - 1) {
        if (targetType !== "tableau") return;
        const movingStack = fromPile.slice(draggedCardInfo.cardIndex);
        if (!canDropOnTableau(movingStack[0], tableau[targetIndex])) return;
        tableau[targetIndex].push(...movingStack);
        fromPile.splice(draggedCardInfo.cardIndex, movingStack.length);
      } else {
        if (targetType === "foundation") {
          if (!canDropOnFoundation(movingCard, foundations[targetIndex])) return;
          foundations[targetIndex].push(movingCard);
          fromPile.pop();
        } else if (targetType === "tableau") {
          if (!canDropOnTableau(movingCard, tableau[targetIndex])) return;
          tableau[targetIndex].push(movingCard);
          fromPile.pop();
        }
      }

      if (draggedCardInfo.pileType === "tableau" && fromPile.length > 0) {
        fromPile[fromPile.length - 1].faceUp = true;
      }

      draggedCardInfo = null;
      renderSolitaire();
      checkWin();
    }

    async function getLeaderboard() {
      try {
        const res = await fetch(`${LEADERBOARD_API}/solitaire-leaderboard`);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Leaderboard load error:", err);
        return [];
      }
    }

    async function addLeaderboardScore(name, seconds) {
      try {
        const res = await fetch(`${LEADERBOARD_API}/solitaire-score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, seconds })
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("API error:", text);
          throw new Error("Failed to save score");
        }

        await updateScoreboard();
        await renderLeaderboard();
      } catch (err) {
        console.error("Leaderboard save error:", err);
        alert("Could not save score to the online leaderboard.");
      }
    }

    async function updateScoreboard() {
      const entries = await getLeaderboard();
      const el = document.getElementById("scoreboard");

      if (!entries.length) {
        el.textContent = "Best time: none";
        return;
      }

      el.innerHTML = `Best time: <strong>${entries[0].name}</strong><br>Time: ${entries[0].seconds}s`;
    }

    async function renderLeaderboard() {
      const list = document.getElementById("leaderboardList");
      const entries = await getLeaderboard();

      list.innerHTML = "";

      if (!entries.length) {
        list.innerHTML = `<div class="leaderboard-empty">No scores yet.</div>`;
        return;
      }

      entries.forEach((entry, index) => {
        const row = document.createElement("div");
        row.className = "leaderboard-row";
        row.innerHTML = `
          <div class="leaderboard-rank">#${index + 1}</div>
          <div class="leaderboard-name">${entry.name}</div>
          <div class="leaderboard-time">${entry.seconds}s</div>
        `;
        list.appendChild(row);
      });
    }

    function showWinPopup() {
      showWindow("winPopup");
      const input = document.getElementById("winnerNameInput");
      input.value = "";
      setTimeout(() => input.focus(), 50);
    }

    function checkWin() {
      const won = foundations.every(p => p.length === 13);
      if (won && !alreadyWonThisGame) {
        alreadyWonThisGame = true;
        showWinPopup();
      }
    }

    document.getElementById("newGameBtn").addEventListener("click", newSolitaireGame);
    document.getElementById("showLeaderboardBtn").addEventListener("click", async () => {
      await renderLeaderboard();
      showWindow("leaderboardWindow");
    });
    document.getElementById("closePopupBtn").addEventListener("click", () => hideWindow("winPopup"));
    document.getElementById("saveWinnerBtn").addEventListener("click", async () => {
      const input = document.getElementById("winnerNameInput");
      const name = input.value.trim() || "Anonymous";
      const seconds = Math.max(1, Math.floor((Date.now() - gameStartTime) / 1000));

      await addLeaderboardScore(name, seconds);
      hideWindow("winPopup");
      showWindow("leaderboardWindow");
    });
    document.getElementById("clearLeaderboardBtn").addEventListener("click", async () => {
      try {
        const res = await fetch(`${LEADERBOARD_API}/solitaire-leaderboard`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error("Failed to clear leaderboard");

        await updateScoreboard();
        await renderLeaderboard();
      } catch (err) {
        console.error("Leaderboard clear error:", err);
        alert("Could not clear the online leaderboard.");
      }
    });

    newSolitaireGame();

    async function loadSteamStatus() {
      const msnList = document.getElementById("msnList");
      msnList.innerHTML = "";

      for (const profile of STEAM_PROFILES) {
        let data = null;
        try {
          const res = await fetch(`/api/steam-status?vanity=${encodeURIComponent(profile.id)}`);
          if (!res.ok) throw new Error("bad");
          data = await res.json();
        } catch {
          data = {
            personaname: profile.id,
            personastate: "Unavailable",
            gameextrainfo: ""
          };
        }

        const state = String(data.personastate || "Offline").toLowerCase();
        const playing = !!data.gameextrainfo;

        const row = document.createElement("div");
        row.className = "msn-contact";

        if (playing) {
          row.classList.remove("offline", "away");
        } else if (state.includes("away")) {
          row.classList.add("away");
        } else if (!state.includes("online")) {
          row.classList.add("offline");
        }

        const statusText = playing
          ? `Playing: ${data.gameextrainfo}`
          : state.includes("online")
            ? "Online"
            : state.includes("away")
              ? "Away"
              : "Offline";

        row.innerHTML = `
          <div class="msn-mini-dot"></div>
          <div>
            <div class="msn-name-line">${data.personaname || profile.id}</div>
            <div class="msn-game">${statusText}</div>
          </div>
        `;
        msnList.appendChild(row);
      }
    }

    document.getElementById("refreshSteamBtn").addEventListener("click", loadSteamStatus);
    document.getElementById("openSteamProfileBtn").addEventListener("click", () => askExternalLink("https://steamcommunity.com/id/xSousa/", "Messenger"));
    document.getElementById("openSteamProfileBtn2").addEventListener("click", () => askExternalLink("https://steamcommunity.com/id/RafaXIS/", "Messenger"));

    /* LOGIN LOGIC */
    const loginScreen = document.getElementById("loginScreen");
    const loginBtn = document.getElementById("loginBtn");
    const loginLoading = document.getElementById("loginLoading");
    const loginShutdownBtn = document.getElementById("loginShutdownBtn");

    function unlockDesktop() {
      loginScreen.classList.add("hidden");
      desktop.classList.remove("locked");

      requestAnimationFrame(() => {
        loadIconPositions();
        showWindow("mainWindow");
        updateBrowserTitle("mainWindow");
      });
    }

    function lockDesktop() {
      loginScreen.classList.remove("hidden");
      desktop.classList.add("locked");
      closeStartMenu();

      loginBtn.disabled = false;
      loginBtn.textContent = "Log On";
      loginLoading.classList.remove("active");

      Object.keys(windowsMap).forEach(id => hideWindow(id));
      updateBrowserTitle();
    }

    function handleLogin() {
      loginBtn.disabled = true;
      loginBtn.textContent = "Please wait";
      loginLoading.classList.add("active");

      setTimeout(() => {
        unlockDesktop();
      }, 2000);
    }

    loginBtn.addEventListener("click", handleLogin);

    loginShutdownBtn.addEventListener("click", () => {
      document.body.innerHTML = `
        <div style="
          width:100vw;
          height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(to bottom, #0b4fa9, #083b85);
          color:#fff;
          font-family:Tahoma, Verdana, Arial, sans-serif;
          font-size:28px;
          text-shadow:0 2px 4px rgba(0,0,0,0.35);
        ">
          It is now safe to turn off your computer.
        </div>
      `;
    });

    loadSteamStatus();
    loadSettings();
    createClockMarks();
    updateClock();
    updateScoreboard();
    renderLeaderboard();
    setInterval(updateClock, 1000);

    hideWindow("playerWindow");
    hideWindow("settingsWindow");
    hideWindow("solitaireWindow");
    hideWindow("leaderboardWindow");
    hideWindow("msnWindow");
    hideWindow("clockWindow");
    hideWindow("winPopup");
    hideWindow("externalLinkWindow");
    updateBrowserTitle();
  