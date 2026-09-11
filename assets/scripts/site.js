const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import site from '../../site.config.json';
import announcements from '../../content/announcements.json';
import releases from '../../content/releases.json';
const runtimeConfig = { ...site.download, androidDownloadUrl:site.download.url, apkSize:site.download.size, apkSha256:site.download.sha256, iosStatus:site.download.iosUrl ? 'open' : 'coming-soon', iosDownloadUrl:site.download.iosUrl, contact:{}, community:{...site.support.community, githubUrl:site.github.url}, filing:site.footer.filing, releases };
const PUBLIC_ANNOUNCEMENT_TIMEOUT_MS = 4500;
const PUBLIC_ANNOUNCEMENT_REFRESH_MS = 5 * 60 * 1000;
const ANNOUNCEMENT_READ_KEY_PREFIX = 'app-template:web-announcement-read:';

const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

const PRIMARY_NAV_ITEMS = site.navigation;

const createIconImage = (name, alt = '') => {
  const image = document.createElement('img');
  image.src = `/assets/icons/${name}.svg`;
  image.alt = alt;
  image.width = 20;
  image.height = 20;
  image.setAttribute('aria-hidden', alt ? 'false' : 'true');
  return image;
};

const setupNavigation = () => {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-site-nav]');
  const header = document.querySelector('.site-header');
  if (!button || !menu || !header) return;

  menu.replaceChildren();
  PRIMARY_NAV_ITEMS.forEach((item) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.dataset.navPage = item.page;
    link.textContent = item.label;
    menu.append(link);
  });

  const drawerHead = document.createElement('div');
  drawerHead.className = 'mobile-nav-head';
  drawerHead.innerHTML = '<strong>导航</strong>';
  const drawerClose = document.createElement('button');
  drawerClose.type = 'button';
  drawerClose.className = 'mobile-nav-close';
  drawerClose.setAttribute('aria-label', '关闭导航菜单');
  drawerClose.textContent = '×';
  drawerHead.append(drawerClose);
  menu.prepend(drawerHead);

  const overlay = document.createElement('button');
  overlay.type = 'button';
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-label', '关闭导航菜单');
  overlay.hidden = true;
  header.append(overlay);

  const closeMenu = () => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', '打开导航菜单');
    menu.dataset.open = 'false';
    overlay.hidden = true;
    document.body.classList.remove('nav-is-open');
  };

  const openMenu = () => {
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', '关闭导航菜单');
    menu.dataset.open = 'true';
    overlay.hidden = false;
    document.body.classList.add('nav-is-open');
    window.requestAnimationFrame(() => drawerClose.focus());
  };

  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });
  drawerClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const mobileActions = document.createElement('div');
  mobileActions.className = 'mobile-nav-actions';
  mobileActions.setAttribute('aria-label', '快捷入口');
  const headerActions = header.querySelector('[data-header-actions]');
  if (headerActions) mobileActions.append(headerActions.cloneNode(true));
  menu.append(mobileActions);
};

const setupCurrentPage = () => {
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav-page]').forEach((link) => {
    if (link.dataset.navPage === page) link.setAttribute('aria-current', 'page');
  });
};

const setupHeaderActions = () => {
  const headerInner = document.querySelector('.header-inner');
  if (!headerInner || headerInner.querySelector('[data-header-actions]')) return;
  const actions = document.createElement('div');
  actions.className = 'header-actions'; actions.dataset.headerActions = 'true';
  actions.setAttribute('aria-label', '快捷入口');
  for (const item of site.headerActions) {
    const link = document.createElement(item.type === 'link' ? 'a' : 'button');
    link.className = 'header-action';
    if (link.tagName === 'BUTTON') link.type = 'button';
    link.title = item.label; link.setAttribute('aria-label', item.label);
    const icon = createIconImage(item.icon);
    if (item.type === 'theme') { link.dataset.themeToggle = 'true'; icon.dataset.themeIcon = 'true'; }
    if (item.type === 'announcement') { link.dataset.announcementShortcut = 'true'; link.classList.add('announcement-shortcut'); }
    if (item.type === 'community') link.dataset.qqTrigger = 'true';
    if (item.type === 'link') {
      link.href = item.href === '@support' ? 'mailto:' + site.support.email : item.href === '@github' ? site.github.url : item.href;
      if (item.newTab) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    }
    link.append(icon, Object.assign(document.createElement('span'), { className: 'header-action-label', textContent: item.label }));
    if (item.type === 'announcement') link.append(Object.assign(document.createElement('span'), {className:'announcement-dot', hidden:true}));
    actions.append(link);
  }
  headerInner.append(actions);
};

const setupThemeToggle = () => {
  const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  if (!toggles.length) return;

  const readTheme = () => {
    try {
      const saved = window.localStorage.getItem('app-template:theme');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  };
  const writeTheme = (theme) => {
    try {
      window.localStorage.setItem('app-template:theme', theme);
    } catch {
      // A storage-disabled browser can still use the current theme.
    }
  };
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e1b2b' : '#ffffff');
    toggles.forEach((toggle) => {
      const dark = theme === 'dark';
      toggle.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
      toggle.title = dark ? '切换到浅色模式' : '切换到深色模式';
      const icon = toggle.querySelector('[data-theme-icon]');
      if (icon) icon.src = `/assets/icons/${dark ? 'sun' : 'moon'}.svg`;
      const label = toggle.querySelector('.header-action-label');
      if (label) label.textContent = dark ? '浅色' : '明暗';
    });
  };

  applyTheme(readTheme());
  toggles.forEach((toggle) => {
    if (toggle.dataset.themeBound) return;
    toggle.dataset.themeBound = 'true';
    toggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      writeTheme(nextTheme);
      applyTheme(nextTheme);
    });
  });
};

const setupFooterEntries = () => {
  const homeStatement = document.querySelector('body[data-page="home"] .statement');
  document.querySelectorAll('.site-footer').forEach((footer) => {
    if (document.querySelector('[data-footer-entry-grid]')) return;
    const filing = footer.querySelector('.footer-filing');
    if (!filing) return;

    const entries = site.footer.entries;
    const grid = document.createElement('nav');
    grid.className = homeStatement
      ? 'footer-entry-grid homepage-entry-grid'
      : 'container footer-entry-grid';
    grid.dataset.footerEntryGrid = 'true';
    grid.setAttribute('aria-label', '站点快捷入口');

    entries.forEach((entry) => {
      const link = document.createElement('a');
      link.className = 'footer-entry';
      link.href = entry.href;
      const icon = document.createElement('span');
      icon.className = 'footer-entry-icon';
      icon.append(createIconImage(entry.icon));
      const copy = document.createElement('span');
      copy.className = 'footer-entry-copy';
      const label = document.createElement('strong');
      label.textContent = entry.label;
      const note = document.createElement('small');
      note.textContent = entry.note;
      copy.append(label, note);
      link.append(icon, copy);
      grid.append(link);
    });
    if (homeStatement) {
      homeStatement.after(grid);
    } else {
      filing.before(grid);
    }
  });
};

const ensureAnnouncementShell = () => {
  if (document.querySelector('[data-announcement-region]')) return;
  const main = document.querySelector('main');
  if (!main) return;

  const region = document.createElement('div');
  region.className = 'container announcement-region';
  region.dataset.announcementRegion = 'true';
  region.hidden = true;
  region.innerHTML = `
    <button class="announcement-bar" type="button" data-announcement-trigger aria-controls="announcement-dialog" aria-haspopup="dialog">
      <img class="announcement-icon" src="/assets/icons/bell-ring.svg" alt="">
      <span class="announcement-label">最新公告</span>
      <span class="announcement-separator" aria-hidden="true">·</span>
      <span class="announcement-summary" data-announcement-summary></span>
      <span class="announcement-action">查看详情 <span aria-hidden="true">›</span></span>
    </button>`;
  const dialog = document.createElement('dialog');
  dialog.className = 'announcement-dialog';
  dialog.id = 'announcement-dialog';
  dialog.dataset.announcementDialog = 'true';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'announcement-dialog-title');
  dialog.setAttribute('aria-describedby', 'announcement-dialog-content');
  dialog.innerHTML = `
    <div class="announcement-dialog-shell">
      <header class="announcement-dialog-header">
        <div class="announcement-dialog-heading">
          <p class="section-kicker">最新公告</p>
          <h2 id="announcement-dialog-title" data-announcement-dialog-title></h2>
          <time class="announcement-dialog-date" data-announcement-date></time>
        </div>
        <button class="announcement-close" type="button" data-announcement-close aria-label="关闭公告">×</button>
      </header>
      <div class="announcement-dialog-body" id="announcement-dialog-content" data-announcement-content tabindex="0"></div>
      <footer class="announcement-dialog-footer">
        <button class="button button-primary" type="button" data-announcement-confirm>确认已读</button>
      </footer>
    </div>`;
  main.before(region);
  region.after(dialog);
};

const setupFeatureAnchor = () => {
  const centerHashTarget = () => {
    if (!window.location.hash) return;

    let targetId;
    try {
      targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });
  };

  if (document.readyState === 'complete') centerHashTarget();
  else window.addEventListener('load', centerHashTarget, { once: true });
  window.addEventListener('hashchange', centerHashTarget);
};

const announcementTimestamp = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const normalizeAnnouncement = (value) => {
  if (!value || typeof value !== 'object') return null;
  const id = value.id === undefined || value.id === null ? '' : String(value.id).trim();
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const content = typeof value.content === 'string' ? value.content : '';
  if (!id || !title || !content.trim()) return null;

  const publishedAt = value.published_at ?? value.publishedAt ?? '';
  const updatedAt = value.updated_at ?? value.updatedAt ?? publishedAt;
  return { id, title, content, publishedAt, updatedAt };
};

const extractAnnouncements = (payload) => {
  const data = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;
  if (!data || !Array.isArray(data.websiteAnnouncements)) return [];

  return data.websiteAnnouncements
    .map(normalizeAnnouncement)
    .filter(Boolean)
    .sort((left, right) => (
      announcementTimestamp(right.publishedAt) - announcementTimestamp(left.publishedAt)
      || announcementTimestamp(right.updatedAt) - announcementTimestamp(left.updatedAt)
    ));
};

const formatAnnouncementDate = (value) => {
  const timestamp = announcementTimestamp(value);
  if (!timestamp) return '发布日期待配置';
  const date = new Date(timestamp < 100000000000 ? timestamp * 1000 : timestamp);
  if (Number.isNaN(date.getTime())) return '发布日期待配置';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replaceAll('/', '-');
};

const formatReleaseDate = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
  const [year, month, day] = raw.split('-');
  const date = new Date(`${raw}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return '';
  return `${year}年${Number(month)}月${Number(day)}日`;
};

const announcementReadKey = (announcement) => (
  `${ANNOUNCEMENT_READ_KEY_PREFIX}${announcement.id}:${String(announcement.updatedAt || announcement.publishedAt || '')}`
);

const isAnnouncementRead = (announcement) => {
  try {
    return window.localStorage.getItem(announcementReadKey(announcement)) === '1';
  } catch {
    return false;
  }
};

const markAnnouncementRead = (announcement) => {
  try {
    window.localStorage.setItem(announcementReadKey(announcement), '1');
  } catch {
    // A storage-disabled browser should still be able to read the notice.
  }
};

const setupAnnouncements = (config) => {
  const region = document.querySelector('[data-announcement-region]');
  const dialog = document.querySelector('[data-announcement-dialog]');
  const trigger = document.querySelector('[data-announcement-trigger]');
  if (!region || !dialog || !trigger || typeof dialog.showModal !== 'function') return;

  const shortcuts = Array.from(document.querySelectorAll('[data-announcement-shortcut]'));

  const summary = region.querySelector('[data-announcement-summary]');
  const dialogTitle = dialog.querySelector('[data-announcement-dialog-title]');
  const dialogDate = dialog.querySelector('[data-announcement-date]');
  const dialogContent = dialog.querySelector('[data-announcement-content]');
  const closeButton = dialog.querySelector('[data-announcement-close]');
  const confirmButton = dialog.querySelector('[data-announcement-confirm]');
  if (!summary || !dialogTitle || !dialogDate || !dialogContent || !closeButton || !confirmButton) return;

  let latestAnnouncement = null;
  let lastLoadedAt = 0;
  let previouslyFocused = trigger;

  const setShortcutState = (available, announcement = latestAnnouncement) => {
    shortcuts.forEach((shortcut) => {
      shortcut.disabled = !available;
      shortcut.setAttribute('aria-disabled', String(!available));
      shortcut.setAttribute('aria-label', available ? '打开最新公告' : '暂无最新公告');
      shortcut.title = available ? '打开最新公告' : '暂无最新公告';
      const dot = shortcut.querySelector('.announcement-dot');
      if (dot) dot.hidden = !available || !announcement || isAnnouncementRead(announcement);
    });
  };

  const focusableElements = () => Array.from(dialog.querySelectorAll(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hidden && element.getClientRects().length > 0);

  const closeDialog = () => {
    if (dialog.open) dialog.close();
    if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
  };

  const openDialog = (announcement) => {
    if (!announcement) return;
    latestAnnouncement = announcement;
    dialogTitle.textContent = announcement.title;
    dialogDate.textContent = formatAnnouncementDate(announcement.publishedAt);
    dialogDate.dateTime = String(announcement.publishedAt || '');
    dialogContent.textContent = announcement.content;
    const activeElement = document.activeElement;
    previouslyFocused = activeElement instanceof HTMLElement
      && activeElement !== document.body
      && !dialog.contains(activeElement)
      ? activeElement
      : trigger;
    if (!dialog.open) dialog.showModal();
    window.requestAnimationFrame(() => {
      closeButton.focus();
    });
  };

  const handleDialogKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = focusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const renderAnnouncement = (announcement) => {
    latestAnnouncement = announcement;
    summary.textContent = announcement.title;
    region.hidden = false;
    setShortcutState(true, announcement);
  };

  const hideAnnouncement = () => {
    latestAnnouncement = null;
    region.hidden = true;
    setShortcutState(false);
    if (dialog.open) closeDialog();
  };

  const loadAnnouncements = async () => {
    const items = extractAnnouncements({websiteAnnouncements: announcements});
    if (items.length) renderAnnouncement(items[0]); else hideAnnouncement();
  };

  trigger.addEventListener('click', () => openDialog(latestAnnouncement));
  shortcuts.forEach((shortcut) => {
    shortcut.addEventListener('click', () => openDialog(latestAnnouncement));
  });
  closeButton.addEventListener('click', closeDialog);
  confirmButton.addEventListener('click', () => {
    if (latestAnnouncement) {
      markAnnouncementRead(latestAnnouncement);
      setShortcutState(true, latestAnnouncement);
    }
    closeDialog();
  });
  dialog.addEventListener('keydown', handleDialogKeydown);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') loadAnnouncements();
  });

  loadAnnouncements();
};

const setupCommunityActions = (config = {}) => {
  const community = config && typeof config.community === 'object' ? config.community : {};
  const trimValue = (value) => (typeof value === 'string' ? value.trim() : '');
  const asHttpsUrl = (value) => {
    const source = trimValue(value);
    if (!source) return '';
    try {
      const parsed = new URL(source);
      return parsed.protocol === 'https:' && parsed.hostname ? parsed.href : '';
    } catch {
      return '';
    }
  };
  const asLocalImage = (value) => {
    const source = trimValue(value);
    return /^\/assets\/(?:images|icons)\/[a-z0-9][a-z0-9._/-]*$/i.test(source)
      ? source
      : '';
  };

  const githubUrl = asHttpsUrl(community.githubUrl);
  const qqEnabled = community.qqEnabled === true;
  const qqPersonalNumber = qqEnabled ? trimValue(community.qqPersonalNumber) : '';
  const qqPersonalUrl = qqEnabled ? asHttpsUrl(community.qqPersonalUrl) : '';
  const qqGroupUrl = qqEnabled ? asHttpsUrl(community.qqGroupUrl) : '';
  const qqGroupNumber = qqEnabled ? trimValue(community.qqGroupNumber) : '';
  const qqGroupQrImage = qqEnabled ? asLocalImage(community.qqGroupQrImage) : '';
  const hasQqContact = Boolean(qqPersonalNumber || qqPersonalUrl || qqGroupUrl || qqGroupNumber || qqGroupQrImage);

  document.querySelectorAll('[data-github-link]').forEach((link) => {
    if (githubUrl) {
      link.hidden = false;
      link.href = githubUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      link.classList.add('is-available');
      link.title = '打开产品 GitHub';
    } else {
      link.hidden = true;
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-disabled', 'true');
      link.tabIndex = -1;
      link.classList.remove('is-available');
      link.removeAttribute('title');
    }
  });

  let dialog = document.querySelector('[data-qq-dialog]');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'qq-dialog';
    dialog.dataset.qqDialog = 'true';
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'qq-dialog-title');
    dialog.setAttribute('aria-describedby', 'qq-dialog-intro');
    dialog.innerHTML = `
      <div class="qq-dialog-shell">
        <header class="qq-dialog-header">
          <div class="qq-dialog-heading">
            <span class="qq-dialog-brand" aria-hidden="true">${createIconImage('qq').outerHTML}</span>
            <div>
              <h2 id="qq-dialog-title">加入“产品”QQ 交流群</h2>
              <p class="qq-dialog-intro" id="qq-dialog-intro" data-qq-intro></p>
            </div>
          </div>
          <button class="announcement-close" type="button" data-qq-close aria-label="关闭 QQ 联系方式">×</button>
        </header>
        <div class="qq-dialog-body" data-qq-body></div>
      </div>`;
    document.body.append(dialog);
  }

  const intro = dialog.querySelector('[data-qq-intro]');
  const body = dialog.querySelector('[data-qq-body]');
  const closeButtons = Array.from(dialog.querySelectorAll('[data-qq-close]'));
  if (!intro || !body || !closeButtons.length || typeof dialog.showModal !== 'function') return;

  const renderQqDialog = () => {
    body.replaceChildren();
    intro.textContent = hasQqContact
      ? '交流使用体验、反馈问题，或获取“产品”的最新消息。'
      : 'QQ 联系入口已经预留，公开的 QQ 号、群链接或二维码将在配置完成后显示。';

    if (!hasQqContact) {
      const empty = document.createElement('p');
      empty.className = 'qq-empty';
      empty.textContent = 'QQ 联系方式待配置';
      body.append(empty);
      return;
    }

    const personalPanel = document.createElement('div');
    personalPanel.className = 'qq-personal-panel';
    if (qqPersonalUrl) {
      const personal = document.createElement('a');
      personal.className = 'button button-secondary qq-personal-link';
      personal.href = qqPersonalUrl;
      personal.target = '_blank';
      personal.rel = 'noopener noreferrer';
      personal.textContent = '打开个人 QQ 联系';
      personalPanel.append(personal);
    }

    if (qqPersonalNumber) {
      const row = document.createElement('div');
      row.className = 'qq-copy-row';
      const label = document.createElement('span');
      label.textContent = '个人 QQ 号';
      const number = document.createElement('strong');
      number.textContent = qqPersonalNumber;
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'button button-secondary qq-copy-button';
      copy.dataset.qqCopy = qqPersonalNumber;
      copy.textContent = '复制';
      row.append(label, number, copy);
      personalPanel.append(row);
    }

    if (personalPanel.childElementCount) body.append(personalPanel);

    const groupLayout = document.createElement('div');
    groupLayout.className = 'qq-group-layout';
    const groupDetails = document.createElement('section');
    groupDetails.className = 'qq-group-details';

    if (qqGroupNumber) {
      const row = document.createElement('div');
      row.className = 'qq-copy-row';
      const label = document.createElement('span');
      label.textContent = 'QQ群号';
      const number = document.createElement('strong');
      number.textContent = qqGroupNumber;
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'button button-secondary qq-copy-button';
      copy.dataset.qqCopy = qqGroupNumber;
      copy.textContent = '复制';
      row.append(label, number, copy);
      groupDetails.append(row);
    }

    const helper = document.createElement('p');
    helper.className = 'qq-group-helper';
    helper.textContent = '手机用户可以直接点击按钮打开 QQ；桌面用户可以复制群号，或使用手机 QQ 扫描右侧二维码。';
    groupDetails.append(helper);

    if (qqGroupUrl) {
      const group = document.createElement('a');
      group.className = 'button button-primary qq-group-link';
      group.href = qqGroupUrl;
      group.target = '_blank';
      group.rel = 'noopener noreferrer';
      group.append('打开 QQ 加群链接', Object.assign(document.createElement('span'), {
        className: 'qq-external-mark',
        textContent: '↗',
      }));
      groupDetails.append(group);
    }

    groupLayout.append(groupDetails);

    if (qqGroupQrImage) {
      const figure = document.createElement('figure');
      figure.className = 'qq-qr-frame';
      const image = document.createElement('img');
      image.src = qqGroupQrImage;
      image.alt = '产品 QQ 交流群二维码';
      image.loading = 'lazy';
      figure.append(image);
      const caption = document.createElement('figcaption');
      caption.textContent = '使用手机 QQ 扫一扫加入群聊';
      figure.append(caption);
      groupLayout.append(figure);
    }

    body.append(groupLayout);

    body.querySelectorAll('[data-qq-copy]').forEach((copyButton) => {
      copyButton.addEventListener('click', async () => {
        const number = copyButton.dataset.qqCopy || '';
        let copied = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(number);
            copied = true;
          }
        } catch {
          copied = false;
        }
        if (!copied) {
          const text = document.createElement('textarea');
          text.value = number;
          text.setAttribute('readonly', '');
          text.style.position = 'fixed';
          text.style.opacity = '0';
          document.body.append(text);
          text.select();
          try { copied = document.execCommand('copy'); } catch { copied = false; }
          text.remove();
        }
        copyButton.textContent = copied ? '已复制' : '请手动复制';
        window.setTimeout(() => { copyButton.textContent = '复制'; }, 1800);
      });
    });
  };

  renderQqDialog();
  document.querySelectorAll('[data-qq-trigger]').forEach((trigger) => {
    trigger.disabled = false;
    trigger.removeAttribute('aria-disabled');
    trigger.title = hasQqContact ? '打开 QQ 联系方式' : 'QQ 联系方式待配置';
    if (trigger.dataset.qqBound) return;
    trigger.dataset.qqBound = 'true';
    trigger.addEventListener('click', () => {
      const menuButton = document.querySelector('[data-menu-button]');
      const menuWasOpen = menuButton?.getAttribute('aria-expanded') === 'true';
      previouslyFocused = menuWasOpen ? menuButton : trigger;
      const openDialog = () => {
        if (!dialog.open) dialog.showModal();
        window.requestAnimationFrame(() => dialog.querySelector('[data-qq-close]')?.focus());
      };
      if (menuWasOpen) {
        menuButton.click();
        window.setTimeout(openDialog, 220);
      } else {
        openDialog();
      }
    });
  });

  let previouslyFocused = null;
  const closeDialog = () => {
    if (dialog.open) dialog.close();
    if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
  };
  closeButtons.forEach((button) => {
    if (button.dataset.qqCloseBound) return;
    button.dataset.qqCloseBound = 'true';
    button.addEventListener('click', closeDialog);
  });
  if (!dialog.dataset.qqDialogBound) {
    dialog.dataset.qqDialogBound = 'true';
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener('close', closeDialog);
  }
  document.querySelectorAll('[data-qq-trigger]').forEach((trigger) => {
    if (trigger.dataset.qqFocusBound) return;
    trigger.dataset.qqFocusBound = 'true';
    trigger.addEventListener('pointerdown', () => { previouslyFocused = trigger; });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') previouslyFocused = trigger;
    });
  });
};

const setupGuides = () => {
  const search = document.querySelector('[data-guide-search]');
  const links = Array.from(document.querySelectorAll('[data-guide-link]'));
  const articles = Array.from(document.querySelectorAll('[data-guide-article]'));
  const empty = document.querySelector('[data-guide-empty]');
  if (!search || !articles.length) return;

  const filterGuides = () => {
    const query = String(search.value || '').trim().toLocaleLowerCase('zh-CN');
    let visible = 0;
    articles.forEach((article) => {
      const matches = !query || article.textContent.toLocaleLowerCase('zh-CN').includes(query);
      article.hidden = !matches;
      if (matches) visible += 1;
    });
    links.forEach((link) => {
      const article = document.querySelector(link.hash);
      const active = article && !article.hidden;
      link.hidden = Boolean(query) && !active;
    });
    if (empty) empty.hidden = visible !== 0;
  };

  search.addEventListener('input', filterGuides);
  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach((item) => item.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'location');
    });
  });
  filterGuides();
};

const setupMailLinks = (config) => {
  const address = site.support.email;
  const subjects = {
    contact: site.support.subject,
    complaint: site.support.complaintSubject,
  };

  document.querySelectorAll('[data-mail-kind]').forEach((link) => {
    const subject = subjects[link.dataset.mailKind] || subjects.contact;
    link.href = `mailto:${address}?subject=${encodeURIComponent(subject)}`;
  });
};

const setupFiling = (config) => {
  document.querySelectorAll('[data-filing]').forEach((container) => {
    const filing = config.filing || {};
    const icpNumber = typeof filing.icpNumber === 'string' ? filing.icpNumber.trim() : '';
    const icpUrl = typeof filing.icpUrl === 'string' ? filing.icpUrl.trim() : '';
    const publicSecurityNumber = typeof filing.publicSecurityNumber === 'string'
      ? filing.publicSecurityNumber.trim()
      : '';
    const publicSecurityUrl = typeof filing.publicSecurityUrl === 'string'
      ? filing.publicSecurityUrl.trim()
      : '';
    const publicSecurityIcon = typeof filing.publicSecurityIcon === 'string'
      ? filing.publicSecurityIcon.trim()
      : '';

    container.replaceChildren();
    if (!icpNumber && !(publicSecurityNumber && publicSecurityUrl)) {
      container.hidden = false;
    }

    const copyright = document.createElement('span');
    copyright.textContent = site.footer.copyright;
    container.append(copyright);
    if (icpNumber && icpUrl) {
      const link = document.createElement('a');
      link.href = icpUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = icpNumber;
      container.append(link);
    }
    if (publicSecurityNumber && publicSecurityUrl) {
      const link = document.createElement('a');
      link.href = publicSecurityUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (publicSecurityIcon) {
        const icon = document.createElement('img');
        icon.src = publicSecurityIcon;
        icon.alt = '';
        icon.width = 18;
        icon.height = 18;
        link.append(icon);
      }
      link.append(document.createTextNode(publicSecurityNumber));
      container.append(link);
    }
    container.hidden = false;
  });
};

const setupDownload = (config) => {
  setText('[data-release-date]', config.releaseDate || '待配置');
  setText('[data-apk-size]', config.apkSize || '待配置');
  setText('[data-apk-sha256]', config.apkSha256 || '待配置');

  document.querySelectorAll('[data-android-download]').forEach((link) => {
    if (config.androidDownloadUrl) {
      link.href = config.androidDownloadUrl;
      link.removeAttribute('aria-disabled');
      link.classList.remove('button-disabled');
      link.classList.add('button-primary');
      link.textContent = site.download.label;
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.classList.remove('button-primary');
      link.classList.add('button-disabled');
      link.textContent = site.download.unavailableLabel;
    }
  });

  document.querySelectorAll('[data-download-state]').forEach((element) => {
    element.textContent = config.androidDownloadUrl
      ? site.download.enabledMessage
      : site.download.disabledMessage;
  });
};

const setupIos = (config) => {
  const isOpen = config.iosStatus === 'open' && Boolean(config.iosDownloadUrl);

  document.querySelectorAll('[data-ios-download]').forEach((link) => {
    if (isOpen) {
      link.href = config.iosDownloadUrl;
      link.removeAttribute('aria-disabled');
      link.classList.remove('button-disabled');
      link.classList.add('button-primary');
      link.textContent = '下载 iOS 版本';
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.classList.remove('button-primary');
      link.classList.add('button-disabled');
      link.innerHTML = 'iOS 版本 <small>敬请期待</small>';
    }
  });

  document.querySelectorAll('[data-ios-platform]').forEach((link) => {
    if (isOpen) {
      link.href = config.iosDownloadUrl;
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-closed');
      link.classList.add('is-open');
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.classList.remove('is-open');
      link.classList.add('is-closed');
    }
  });

  setText('[data-ios-platform-state]', isOpen ? '开放' : '暂未开放');
  setText('[data-ios-platform-note]', isOpen ? '前往下载' : '敬请期待');
};

const setupTimeline = (config) => {
  config = { ...config, releases: config.releases.map(r => ({...r, version: escapeText(r.version), status: escapeText(r.status), summary: escapeText(r.summary), items:r.items.map(escapeText)})) };
  document.querySelectorAll('[data-release-timeline]').forEach((container) => {
    container.innerHTML = config.releases.map((release) => {
      const summary = release.summary
        ? `<p class="timeline-summary">${release.summary}</p>`
        : '';
      const items = release.items.length
        ? `<ul>${release.items.map((item) => `<li>${item}</li>`).join('')}</ul>`
        : '';
      const releaseDate = formatReleaseDate(release.releaseDate);
      return `
        <article class="timeline-item${release.current ? ' is-current' : ''}">
          <div class="timeline-dot" aria-hidden="true"></div>
          <div class="timeline-card">
            <div class="timeline-heading">
              <h2>${release.version}</h2>
              <div class="timeline-status">
                <span>${release.status}</span>
                ${releaseDate ? `<time class="timeline-release-date" datetime="${release.releaseDate}">${releaseDate}</time>` : ''}
              </div>
            </div>
            ${summary}
            ${items}
          </div>
        </article>`;
    }).join('');
  });
};

const setupSupport = async () => {
  const buttons = Array.from(document.querySelectorAll('[data-support-button]'));
  if (!buttons.length) return;

  const panels = Array.from(document.querySelectorAll('[data-support-panel]'));
  const emptyState = document.querySelector('[data-support-empty]');
  let supportConfig = {
    alipaySupportUrl: '',
    wechatSupportUrl: '',
    alipayQrImage: '',
    wechatQrImage: '',
  };
  const supportFields = {
    alipay: { url: 'alipaySupportUrl', image: 'alipayQrImage' },
    wechat: { url: 'wechatSupportUrl', image: 'wechatQrImage' },
  };
  const getSupportValue = (field) => {
    const value = supportConfig[field];
    return typeof value === 'string' ? value.trim() : '';
  };
  const getSupportUrl = (field) => {
    const value = getSupportValue(field);
    if (!value) return '';

    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname ? url.href : '';
    } catch {
      return '';
    }
  };

  const renderPanel = (kind) => {
    const image = document.querySelector(`[data-support-image="${kind}"]`);
    const placeholder = document.querySelector(`[data-support-placeholder="${kind}"]`);
    const fields = supportFields[kind];
    if (!image || !placeholder || !fields) return;

    const source = getSupportValue(fields.image);
    image.hidden = true;
    image.removeAttribute('src');
    placeholder.hidden = false;

    if (!source) return;

    image.onload = () => {
      image.hidden = false;
      placeholder.hidden = true;
    };
    image.onerror = () => {
      image.hidden = true;
      placeholder.hidden = false;
    };
    image.src = source;
  };

  supportConfig = site.support;
  document.documentElement.dataset.supportConfigState = 'ready';

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.supportButton;
      const fields = supportFields[kind];
      if (!fields) return;

      const supportUrl = getSupportUrl(fields.url);
      if (supportUrl) {
        window.location.assign(supportUrl);
        return;
      }

      buttons.forEach((item) => item.setAttribute('aria-expanded', String(item === button)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.supportPanel !== kind;
      });
      if (emptyState) emptyState.hidden = true;
      renderPanel(kind);
    });
  });
};

const applyConfig = (config) => {
  setText('[data-app-version]', config.displayVersion);
  setText('[data-footer-version]', config.displayVersion);
  setupMailLinks(config);
  setupCommunityActions(config);
  setupFiling(config);
  setupDownload(config);
  setupIos(config);
  setupTimeline(config);
  setupAnnouncements(config);
  document.documentElement.dataset.configState = 'ready';
};

setupHeaderActions();
setupNavigation();
setupCurrentPage();
setupFeatureAnchor();
setupThemeToggle();
setupFooterEntries();
ensureAnnouncementShell();
setupGuides();
setupCommunityActions();
setupSupport();
applyConfig(runtimeConfig);
