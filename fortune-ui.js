(function (global) {
  function create({ getAnchor, getTheme, getLanguage, onSelect, onClose, onRetry }) {
    const panel = document.createElement('section');
    panel.className = 'screen-pet-fortune';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    let view = 'loading';
    let result = null;
    let busy = false;
    let errorCode = '';
    let opened = false;
    const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

    function position() {
      if (!opened) return;
      const anchor = getAnchor();
      const { width, height } = panel.getBoundingClientRect();
      const left = Math.max(8, Math.min(anchor.left + anchor.width / 2 - width / 2, window.innerWidth - width - 8));
      const above = anchor.top - height - 12;
      const top = above >= 8 ? above : Math.max(8, Math.min(anchor.top + anchor.height + 12, window.innerHeight - height - 8));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    }

    function render() {
      if (!opened) return;
      const language = getLanguage() === 'ko' ? 'ko' : 'en';
      const theme = getTheme();
      const text = PetFortune.copy(language);
      panel.dataset.theme = theme;
      panel.setAttribute('aria-label', text.title);
      let body = '';
      if (view === 'cards') {
        body = `<p class="fortune-subtitle">${text.subtitle}</p><div class="fortune-spread">${[0, 1, 2].map((slot) => `<button type="button" class="fortune-card" data-fortune-slot="${slot}" aria-label="${text.card} ${slot + 1}" ${busy ? 'disabled' : ''}>${PetFortune.cardSVG(null, theme)}</button>`).join('')}</div>`;
      } else if (view === 'result' && result) {
        const selected = PetFortune.card(result.cardId);
        const localized = selected[language];
        const reversed = result.reversed === true;
        const interpretation = reversed ? selected.reversed[language] : localized;
        body = `<div class="fortune-result"><div class="fortune-selected-card" data-reversed="${reversed}">${PetFortune.cardSVG(result.cardId, theme)}</div><div><span class="fortune-eyebrow">${text.chosen}</span><h3>${escape(localized.name)}</h3><p class="fortune-orientation">${reversed ? text.reversed : text.upright}</p><p class="fortune-score">${text.score}<strong>${result.score}<small> / 100</small></strong></p></div></div><p class="fortune-item"><strong>${text.item}</strong> ${escape(interpretation.item)}</p><p class="fortune-reading">${escape(interpretation.reading)}</p>`;
      } else if (view === 'error') {
        body = `<p class="fortune-error" role="alert">${errorCode === 'STALE_DATE' ? text.stale : text.error}</p><button type="button" class="fortune-retry" data-fortune-retry="true">${text.retry}</button>`;
      } else {
        body = `<p class="fortune-loading" role="status">${text.loading}</p>`;
      }
      panel.innerHTML = `<header><h2>${text.title}</h2><button type="button" class="fortune-close" data-fortune-close="true" aria-label="${text.close}">×</button></header>${body}<p class="fortune-disclaimer">${text.disclaimer}</p>`;
      position();
    }

    function open(next, value) {
      view = next;
      result = next === 'result' ? value : null;
      errorCode = next === 'error' ? value : '';
      busy = false;
      if (!opened) { opened = true; document.body.appendChild(panel); }
      render();
    }
    function close() {
      if (!opened) return;
      opened = false;
      panel.remove();
      onClose();
    }
    ['mousedown', 'mouseup', 'dblclick', 'contextmenu'].forEach((event) => panel.addEventListener(event, (e) => e.stopPropagation()));
    panel.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.closest('[data-fortune-close]')) { close(); return; }
      if (event.target.closest('[data-fortune-retry]')) { onRetry(); return; }
      const cardButton = event.target.closest('[data-fortune-slot]');
      if (cardButton && !busy) {
        busy = true;
        render();
        onSelect(Number(cardButton.dataset.fortuneSlot));
      }
    });
    document.addEventListener('keydown', (event) => {
      if (opened && event.key === 'Escape') close();
    });
    return { panel, isOpen: () => opened, position, refresh: render, close,
      showLoading: () => open('loading'), showCards: (pending = false) => { open('cards'); busy = pending; render(); },
      showResult: (value) => open('result', value), showError: (code) => open('error', code),
    };
  }
  global.PetFortuneUI = { create };
})(globalThis);
