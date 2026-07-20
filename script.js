(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const storageKey = 'idol-culture-theme';
  const validThemes = ['system', 'light', 'dark'];

  const labels = {
    ja: {
      system: 'テーマ：端末設定',
      light: 'テーマ：ライト',
      dark: 'テーマ：ダーク'
    },
    en: {
      system: 'Theme: system',
      light: 'Theme: light',
      dark: 'Theme: dark'
    }
  };

  const language = document.documentElement.lang === 'ja' ? 'ja' : 'en';

  function getSavedTheme() {
    const saved = localStorage.getItem(storageKey);
    return validThemes.includes(saved) ? saved : 'system';
  }

  function applyTheme(theme) {
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    if (button) {
      button.textContent = labels[language][theme];
      button.setAttribute('aria-label', labels[language][theme]);
      button.dataset.theme = theme;
    }
  }

  if (button) {
    const initialTheme = getSavedTheme();
    applyTheme(initialTheme);

    button.addEventListener('click', () => {
      const current = button.dataset.theme || 'system';
      const next = validThemes[(validThemes.indexOf(current) + 1) % validThemes.length];
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }

  const sectionLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    let updateQueued = false;

    function setActiveSection(section) {
      sectionLinks.forEach((link) => {
        const active = section && link.getAttribute('href') === `#${section.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }

    function updateActiveSection() {
      updateQueued = false;

      // Keep the contents unhighlighted while the reader is still in the
      // title or introductory area above the first numbered section.
      const activationLine = Math.min(140, window.innerHeight * 0.22);
      let activeSection = null;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          activeSection = section;
        } else {
          break;
        }
      }

      // Ensure the final section becomes active at the very bottom, even on
      // pages where its heading cannot reach the activation line.
      const pageBottom = window.scrollY + window.innerHeight;
      const documentBottom = document.documentElement.scrollHeight;
      if (pageBottom >= documentBottom - 2) {
        activeSection = sections[sections.length - 1];
      }

      setActiveSection(activeSection);
    }

    function queueActiveSectionUpdate() {
      if (updateQueued) return;
      updateQueued = true;
      window.requestAnimationFrame(updateActiveSection);
    }

    window.addEventListener('scroll', queueActiveSectionUpdate, { passive: true });
    window.addEventListener('resize', queueActiveSectionUpdate);
    window.addEventListener('hashchange', queueActiveSectionUpdate);
    updateActiveSection();
  }
})();
