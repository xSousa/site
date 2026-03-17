(function () {
  const desktop = document.getElementById('desktop');
  desktop.innerHTML = [
    window.desktop_iconsTemplate,
    window.windows_primaryTemplate,
    window.windows_gamesTemplate,
    window.windows_systemTemplate,
    window.start_menuTemplate,
    window.taskbarTemplate
  ].join('\n\n');
})();
