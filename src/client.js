window.__ModuleLoader__.load({
  id: '@local/dsh-rescue-buddy',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const assets = /* BUILD:ASSETS */ null;
    const styles = /* BUILD:STYLES */ null;
    const ENTRY = 'rescue-buddy';
    const STORAGE_KEY = 'dsh-rescue-buddy:preferences';
    const defaults = { enabled: true, characters: true, opacity: 0.9 };
    let config = defaults;
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        config = {
          enabled: typeof saved.enabled === 'boolean' ? saved.enabled : defaults.enabled,
          characters: typeof saved.characters === 'boolean' ? saved.characters : defaults.characters,
          opacity: typeof saved.opacity === 'number' && saved.opacity >= .15 && saved.opacity <= 1
            ? saved.opacity : defaults.opacity,
        };
      }
    } catch { /* A malformed old preference should not prevent decoration from loading. */ }
    const listeners = new Set();
    const store = {
      getSnapshot: () => config,
      subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
      set: (field, value) => {
        const next = { ...config, [field]: value };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        config = next;
        listeners.forEach((listener) => listener());
      },
    };
    const tokens = {
      '--dsw-alias-bg-base': { light: 'transparent', dark: 'transparent' },
      '--dsw-alias-bg-layer-1': { light: 'rgba(255,253,250,.97)', dark: '#24212d' },
      '--dsw-alias-bg-layer-2': { light: '#f3eef8', dark: '#302a3d' },
      '--dsw-alias-bg-layer-3': { light: '#ebe4f3', dark: '#3a324b' },
      '--dsw-specific-sidebar-fill': { light: 'transparent', dark: 'transparent' },
      '--dsw-specific-sidebar-nav-item-active': { light: '#eee7f7', dark: '#3b3054' },
      '--dsw-specific-sidebar-nav-item-hover': { light: 'rgba(238,231,247,.68)', dark: '#30283e' },
      '--dsw-specific-sidebar-nav-item-active-accent': { light: '#e8dff4', dark: '#42345d' },
      '--dsw-specific-input-major': { light: 'rgba(255,255,255,.97)', dark: 'rgba(36,33,45,.98)' },
      '--dsw-specific-bubble': { light: '#edf0ff', dark: '#322e4a' },
      '--dsw-alias-brand-primary': { light: '#8272c9', dark: '#b3a2ef' },
      '--dsw-alias-brand-text': { light: '#7664bb', dark: '#bcadf5' },
      '--dsw-alias-link': { light: '#7460bd', dark: '#c0b1f5' },
      '--dsw-alias-button-primary-fill': { light: '#a6baff', dark: '#8c7acb' },
      '--dsw-alias-button-primary-hover': { light: '#91a7f4', dark: '#a08bdd' },
      '--dsw-alias-border-l1': { light: 'rgba(163,143,197,.20)', dark: '#40384f' },
    };

    // Measure only documented shell geometry and semantic controls, never hashed classes.
    function findFrame(anchor) {
      return anchor?.closest('[data-shell-overlay]')?.parentElement ?? null;
    }
    function composerRect(center) {
      return center.querySelector('[data-composer-card]')?.getBoundingClientRect() ?? null;
    }

    function Wallpaper() {
      const anchor = React.useRef(null);
      const config = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
      const [placement, setPlacement] = React.useState(null);
      const active = config.enabled;

      React.useLayoutEffect(() => {
        if (!active) { setPlacement(null); return; }
        const frame = findFrame(anchor.current);
        if (!frame) return;
        const columns = [...frame.children].filter((element) =>
          !element.hasAttribute('data-shell-overlay') && !element.hasAttribute('data-shell-bottom') &&
          !element.hasAttribute('data-shell-leading') && getComputedStyle(element).position !== 'absolute');
        const sidebar = columns[0];
        const center = columns[1];
        if (!sidebar || !center) return;
        frame.setAttribute('data-rescue-frame', '');
        sidebar.setAttribute('data-rescue-sidebar', '');
        center.setAttribute('data-rescue-center', '');
        let scheduled = 0;
        let observedComposer = null;
        const measure = () => {
          scheduled = 0;
          const main = center.getBoundingClientRect();
          const side = sidebar.getBoundingClientRect();
          const composer = composerRect(center);
          const editor = center.querySelector('[data-composer-card]');
          if (editor && editor !== observedComposer) {
            if (observedComposer) resize.unobserve(observedComposer);
            observedComposer = editor;
            resize.observe(editor);
          }
          // The composer shares the transcript's reading width. Its outer margin
          // is the safe decoration lane, so artwork never crosses into the text.
          const lane = composer ? Math.max(0, main.right - composer.right - 16) : Math.min(320, main.width * .29);
          const width = Math.min(340, lane, main.height * .44);
          const bottom = Math.max(24, window.innerHeight - (composer?.top ?? (main.bottom - 110)) + 12);
          const friendsWidth = Math.min(316, side.width - 20);
          const friendsBottom = Math.max(76, window.innerHeight - side.bottom + 92);
          const friendsTop = window.innerHeight - friendsBottom - friendsWidth / 1.96;
          const overlapsNavigation = [...sidebar.querySelectorAll('button, a, [role="button"]')].some((element) => {
            const rect = element.getBoundingClientRect();
            return rect.height > 0 && rect.height < 72 && rect.top < window.innerHeight - friendsBottom && rect.bottom > friendsTop;
          });
          setPlacement({
            hero: main.width >= 760 && width >= 105 ? {
              right: Math.max(10, window.innerWidth - main.right + 10), bottom, width,
            } : null,
            friends: side.width >= 230 && side.height >= 570 && !overlapsNavigation ? {
              left: side.left + 10, width: friendsWidth,
              bottom: friendsBottom,
            } : null,
          });
        };
        const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(measure); };
        const resize = new ResizeObserver(schedule);
        resize.observe(frame); resize.observe(sidebar); resize.observe(center);
        const changes = new MutationObserver(schedule);
        changes.observe(center, { childList: true, subtree: true });
        changes.observe(sidebar, { childList: true, subtree: true });
        sidebar.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        measure();
        return () => {
          if (scheduled) cancelAnimationFrame(scheduled);
          resize.disconnect(); changes.disconnect();
          sidebar.removeEventListener('scroll', schedule, true);
          window.removeEventListener('resize', schedule);
          frame.removeAttribute('data-rescue-frame');
          sidebar.removeAttribute('data-rescue-sidebar');
          center.removeAttribute('data-rescue-center');
        };
      }, [active]);

      return h(React.Fragment, null,
        h('style', { 'data-rescue-styles': '' }, styles),
        h('span', { ref: anchor, hidden: true }),
        active && config.characters && placement?.hero && h('img', {
          src: assets.hero, alt: '', 'aria-hidden': true, draggable: false,
          className: 'rescue-buddy-art', 'data-rescue-art': 'hero',
          style: { ...placement.hero, opacity: config.opacity },
        }),
        active && config.characters && placement?.friends && h('img', {
          src: assets.friends, alt: '', 'aria-hidden': true, draggable: false,
          className: 'rescue-buddy-art', 'data-rescue-art': 'friends',
          style: { ...placement.friends, opacity: config.opacity * .83 },
        }));
    }

    function Settings() {
      const config = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
      const [error, setError] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const commit = (field, value) => {
        setBusy(true); setError('');
        try {
          store.set(field, value);
        } catch (err) {
          setError(`保存失败：${err instanceof Error ? err.message : String(err)}`);
        } finally { setBusy(false); }
      };
      const disabled = busy;
      return h('section', { className: 'rescue-buddy-settings', 'aria-label': '救场搭子主题' },
        h('h3', null, '奶油紫 · 救场搭子'),
        h('p', null, '水彩留白，搭子相伴。窄窗口自动收起右侧角色。'),
        h('label', null, h('input', { type: 'checkbox', checked: !!config.enabled, disabled,
          onChange: (event) => commit('enabled', event.target.checked) }), '启用主题'),
        h('label', null, h('input', { type: 'checkbox', checked: !!config.characters, disabled: disabled || !config.enabled,
          onChange: (event) => commit('characters', event.target.checked) }), '显示角色装饰'),
        h('label', null, '装饰透明度', h('input', { type: 'range', min: .15, max: 1, step: .05,
          value: config.opacity, disabled: disabled || !config.enabled || !config.characters,
          onChange: (event) => commit('opacity', Number(event.target.value)) }),
          h('output', null, `${Math.round(config.opacity * 100)}%`)),
        error && h('p', { role: 'alert' }, error));
    }

    return {
      inject: ['slots', 'theme'],
      apply(ctx) {
        let removeTokens;
        let wasEnabled = false;
        const sync = () => {
          const enabled = store.getSnapshot().enabled;
          if (enabled === wasEnabled) return;
          wasEnabled = enabled;
          removeTokens?.(); removeTokens = undefined;
          if (enabled) removeTokens = ctx.theme.overrideTokens(ENTRY, tokens);
        };
        ctx.effect(() => {
          const unsubscribe = store.subscribe(sync);
          sync();
          return () => { unsubscribe(); removeTokens?.(); };
        });
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: ENTRY, order: -100,
        }, () => h(Wallpaper)));
        ctx.slots.inject('settings.general.item', () => ctx.slots.register({
          name: 'settings.general.item', id: ENTRY, order: 35,
        }, () => h(Settings)));
      },
    };
  },
});
