/*
 * 页面交互：主题、移动导航、快速离开、复制与本地筛选。
 *
 * 内存与隐私约定：
 * - 所有全局监听器都挂在同一个 AbortController 上，pagehide 时统一移除。
 * - 不使用 setInterval、WebSocket、MutationObserver 或第三方脚本。
 * - setTimeout 只用于复制按钮的短暂反馈，并在 pagehide 时清理。
 * - 筛选使用 requestAnimationFrame 合并输入，不把查询发送到网络。
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const controller = new AbortController();
  const { signal } = controller;
  const timers = new Set();
  let rafId = 0;

  const storageKey = 'spectrum.theme';
  const modes = ['auto', 'light', 'dark'];
  const modeLabels = {
    auto: '跟随系统',
    light: '浅色',
    dark: '深色',
  };
  const darkQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  let mode = modes.includes(root.dataset.mode) ? root.dataset.mode : 'auto';

  const themeStatus = document.getElementById('theme-status');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const effectiveTheme = () =>
    mode === 'auto' ? (darkQuery && darkQuery.matches ? 'dark' : 'light') : mode;

  const updateThemeMeta = () => {
    if (!themeMeta) return;
    themeMeta.setAttribute('content', effectiveTheme() === 'dark' ? '#141218' : '#FDF7FF');
  };

  const updateThemeControls = (announce) => {
    root.dataset.mode = mode;
    if (mode === 'auto') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = mode;
    }
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const next = modes[(modes.indexOf(mode) + 1) % modes.length];
      const label = `主题：${modeLabels[mode]}。点击切换为${modeLabels[next]}。`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });
    updateThemeMeta();
    if (announce && themeStatus) {
      themeStatus.textContent = `主题已切换为${modeLabels[mode]}`;
    }
  };

  const setMode = (next, persist, announce) => {
    if (!modes.includes(next)) return;
    mode = next;
    updateThemeControls(announce);
    if (!persist) return;
    try {
      if (next === 'auto') {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, next);
      }
    } catch (_) {
      /* 存储不可用时仍允许本次页面切换。 */
    }
  };

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const next = modes[(modes.indexOf(mode) + 1) % modes.length];
        setMode(next, true, true);
      },
      { signal },
    );
  });

  document.querySelectorAll('[data-theme-clear]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        setMode('auto', true, true);
      },
      { signal },
    );
  });

  if (darkQuery) {
    const onSchemeChange = () => {
      if (mode === 'auto') updateThemeControls(false);
    };
    if (typeof darkQuery.addEventListener === 'function') {
      darkQuery.addEventListener('change', onSchemeChange, { signal });
    } else if (typeof darkQuery.addListener === 'function') {
      darkQuery.addListener(onSchemeChange);
      signal.addEventListener('abort', () => darkQuery.removeListener(onSchemeChange), { once: true });
    }
  }

  updateThemeControls(false);

  /* 移动端导航抽屉：按钮 + 隐藏面板，Escape/遮罩/链接点击关闭。 */
  const nav = document.querySelector('[data-nav]');
  const navToggles = document.querySelectorAll('[data-nav-toggle]');
  if (nav && navToggles.length) {
    const panel = nav.querySelector('.drawer__panel') || nav;
    const closeButtons = nav.querySelectorAll('[data-nav-close]');
    let lastFocused = null;

    const setOpen = (open) => {
      nav.hidden = !open;
      document.documentElement.classList.toggle('nav-open', open);
      navToggles.forEach((button) => button.setAttribute('aria-expanded', String(open)));
      if (open) {
        if (document.activeElement instanceof HTMLElement) lastFocused = document.activeElement;
        const first = panel.querySelector('a, button');
        if (first) first.focus();
      } else {
        if (lastFocused) lastFocused.focus();
        lastFocused = null;
      }
    };

    navToggles.forEach((button) => {
      button.addEventListener('click', () => setOpen(nav.hidden), { signal });
    });
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => setOpen(false), { signal });
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false), { signal });
    });
    nav.addEventListener(
      'click',
      (event) => {
        if (event.target === nav) setOpen(false);
      },
      { signal },
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && !nav.hidden) {
          event.preventDefault();
          setOpen(false);
        }
      },
      { signal },
    );
  }

  /* 桌面端“更多”菜单：details 原生可用，这里补充点击外部/Esc/选择后收起。 */
  const menus = Array.from(document.querySelectorAll('.nav-more'));
  if (menus.length) {
    menus.forEach((menu) => {
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          menu.open = false;
        }, { signal });
      });
    });
    const closeMenus = (event) => {
      menus.forEach((menu) => {
        if (!menu.open) return;
        if (event.type === 'keydown' && event.key !== 'Escape') return;
        if (event.type === 'click' && event.target instanceof Node && menu.contains(event.target)) return;
        menu.open = false;
      });
    };
    document.addEventListener('click', closeMenus, { signal });
    document.addEventListener('keydown', closeMenus, { signal });
  }

  /* 快速离开：只在用户点击时导航，不产生后台请求。 */
  document.querySelectorAll('[data-quick-exit]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const target = button.getAttribute('data-exit-url') || 'https://www.weather.com.cn/';
        try {
          window.location.replace(target);
        } catch (_) {
          window.location.href = target;
        }
      },
      { signal },
    );
  });

  /* 复制按钮：优先 Clipboard API，降级到临时 textarea。 */
  const fallbackCopy = (text) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.className = 'visually-hidden';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (_) {
      ok = false;
    }
    area.remove();
    return ok;
  };

  const showCopyFeedback = (button, ok) => {
    const label = button.querySelector('span');
    if (!label) return;
    if (!label.dataset.original) label.dataset.original = label.textContent || '复制';
    label.textContent = ok ? '已复制' : '复制失败';
    const timer = window.setTimeout(() => {
      label.textContent = label.dataset.original || '复制';
      timers.delete(timer);
    }, 1800);
    timers.add(timer);
  };

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener(
      'click',
      async () => {
        const selector = button.getAttribute('data-copy-target');
        if (!selector) return;
        const target = document.querySelector(selector);
        if (!target) return;
        const text = target.textContent || '';
        let ok = false;
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(text);
            ok = true;
          } catch (_) {
            ok = false;
          }
        }
        if (!ok) ok = fallbackCopy(text);
        showCopyFeedback(button, ok);
      },
      { signal },
    );
  });

  /* 本地筛选：不请求网络，不写 URL，不记录查询。 */
  document.querySelectorAll('[data-filter-root]').forEach((rootNode) => {
    const buttons = Array.from(rootNode.querySelectorAll('[data-filter-value]'));
    const input = rootNode.querySelector('[data-filter-search]');
    const items = Array.from(rootNode.querySelectorAll('[data-filter-item]'));
    const count = rootNode.querySelector('[data-filter-count]');
    const empty = rootNode.querySelector('[data-filter-empty]');
    let active = 'all';
    let query = '';

    const applyFilter = () => {
      const normalized = query.trim().toLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const tags = (item.getAttribute('data-tags') || '').toLowerCase().split(/\s+/);
        const haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
        const tagMatch = active === 'all' || tags.includes(active);
        const queryMatch = normalized.length === 0 || haystack.includes(normalized);
        const show = tagMatch && queryMatch;
        item.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = `${visible} / ${items.length} 条`;
      if (empty) empty.hidden = visible !== 0;
    };

    buttons.forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          active = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach((candidate) => {
            candidate.setAttribute('aria-pressed', String(candidate === button));
          });
          applyFilter();
        },
        { signal },
      );
    });

    if (input) {
      input.addEventListener(
        'input',
        () => {
          query = input.value;
          if (rafId) window.cancelAnimationFrame(rafId);
          rafId = window.requestAnimationFrame(() => {
            applyFilter();
            rafId = 0;
          });
        },
        { signal },
      );
    }

    applyFilter();
  });

  /* 统一清理：页面离开时移除监听器、取消动画帧与短暂计时器。 */
  window.addEventListener(
    'pagehide',
    () => {
      controller.abort();
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    },
    { once: true },
  );
})();
