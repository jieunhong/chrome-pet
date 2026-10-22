/* Local calendar dates are deliberately stored without UTC conversion. */
(function (global) {
  function localDate(date = new Date()) {
    return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1 || month < 1 || month > 12 || day < 1) return false;
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  }

  function initialValues(stored, now = new Date()) {
    const patch = {};
    const installedOn = isValidDate(stored.installedOn) ? stored.installedOn : localDate(now);
    if (stored.installedOn !== installedOn) patch.installedOn = installedOn;
    if (!isValidDate(stored.petBirthday)) patch.petBirthday = installedOn;
    return patch;
  }

  function isBirthday(value, now = new Date()) {
    return isValidDate(value) && value.slice(5) === localDate(now).slice(5);
  }

  function hatMarkup(petType, theme) {
    const positions = theme === 'pixel'
      ? { cat: [58, 24], dog: [58, 24], maltese_white: [42, 20], hamster: [62, 32], dino: [70, 8], harp_seal: [62, 20] }
      : { cat: [58, 25], dog: [58, 23], maltese_white: [42, 22], hamster: [60, 29], dino: [68, 9], harp_seal: [58, 27] };
    const [hatX, hatY] = positions[petType] || positions.cat;
    const design = theme === 'pixel'
      ? '<path d="M-10 0V-4H-8V-8H-6V-12H-4V-16H-2V-20H2V-16H4V-12H6V-8H8V-4H10V0Z" fill="#b58aff"/><path d="M-8-4H8V0H-8Z" fill="#ffe28a"/><path d="M-2-24H2V-20H-2Z M-4-12H0V-8H-4Z M2-8H6V-4H2Z" fill="#ffd47e"/>'
      : '<path d="M-11 0L0-23L11 0Z" fill="#b58aff" stroke="#815ac5" stroke-width="1"/><path d="M-8-5L5-11M-4-14L1-17" stroke="#ffd879" stroke-width="3"/><ellipse cy="0" rx="11" ry="2.5" fill="#ffe5a0"/><circle cy="-24" r="3.5" fill="#ffd879"/>';
    return `<g class="birthday-hat" transform="translate(${hatX} ${hatY})" aria-hidden="true">${design}</g>`;
  }

  function cakeMarkup(theme = 'normal') {
    if (theme === 'pixel') {
      return `<svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <g class="birthday-breath" fill="#b6e3ef">
          <path d="M72 36H78V34H90V36H98V38H90V36H78V38H72Z"/>
          <rect x="74" y="42" width="26" height="2"/>
          <path d="M72 48H78V50H90V48H100V50H92V52H78V50H72Z"/>
        </g>
        <g class="birthday-cake">
          <path d="M88 72H136V74H138V76H134V78H90V76H86V74H88Z" fill="#c49cbf"/>
          <rect x="88" y="72" width="48" height="2" fill="#f5d5e9"/>
          <path d="M92 52H132V54H134V72H132V74H92V72H90V54H92Z" fill="#d97f9f"/>
          <rect x="94" y="54" width="36" height="18" fill="#f4acbe"/>
          <rect x="92" y="60" width="40" height="4" fill="#ffe8bd"/>
          <rect x="92" y="68" width="40" height="4" fill="#ffe8bd"/>
          <path d="M96 50H128V52H134V58H130V60H126V56H120V60H116V58H108V60H104V56H98V60H94V58H90V52H96Z" fill="#fff6e4"/>
          <rect x="100" y="50" width="24" height="2" fill="#ffffff"/>
          <rect x="110" y="36" width="4" height="16" fill="#8ecfd2"/>
          <path d="M110 40H114V42H110Z M110 46H114V48H110Z" fill="#ffffff"/>
          <g class="birthday-flame">
            <path d="M110 24H114V28H116V32H118V34H116V36H108V34H106V30H108V28H110Z" fill="#ffb84f"/>
            <path d="M110 30H114V34H110Z" fill="#ffe6a3"/>
          </g>
          <path class="birthday-smoke" d="M112 34V30H116V26H112V22H108V18H112V14H116" fill="none" stroke="#c3b5c9" stroke-width="2"/>
        </g>
      </svg>`;
    }
    return '<svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg"><g class="birthday-breath" fill="none" stroke="#b6e3ef" stroke-width="2" stroke-linecap="round"><path d="M70 39Q82 32 98 39M72 44H99M72 49Q86 55 100 48"/></g><g class="birthday-cake"><ellipse cx="112" cy="75" rx="25" ry="3" fill="#e6c3db"/><rect x="91" y="53" width="42" height="20" rx="4" fill="#f4acbe"/><path d="M91 59H133M92 68H132" stroke="#ffe8bd" stroke-width="4"/><path d="M91 56V53Q112 47 133 53V58Q128 62 124 57Q119 63 114 57Q108 63 103 57Q97 62 91 56" fill="#fff6e4"/><rect x="110" y="36" width="4" height="17" rx="1" fill="#8ecfd2"/><path d="M110 40H114M110 46H114" stroke="#fff" stroke-width="2"/><path class="birthday-flame" d="M112 23Q103 35 112 36Q121 35 112 23" fill="#ffb84f"/><path class="birthday-smoke" d="M112 33Q120 28 112 22Q105 17 114 12" fill="none" stroke="#c3b5c9" stroke-width="2" stroke-linecap="round"/></g></svg>';
  }

  global.PetBirthday = { localDate, isValidDate, initialValues, isBirthday, hatMarkup, cakeMarkup };
})(globalThis);
