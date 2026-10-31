/*
 * 站内搜索：只在浏览器本地匹配静态索引。
 * 查询不会进入网址、Cookie、日志或任何网络请求。
 * 首次输入时才下载索引；页面离开时中止请求并取消动画帧。
 */
(() => {
  'use strict';

  const form = document.querySelector('[data-search]');
  if (!form) return;

  const input = form.querySelector('[data-search-input]');
  const status = document.querySelector('[data-search-status]');
  const results = document.querySelector('[data-search-results]');
  const empty = document.querySelector('[data-search-empty]');
  const indexUrl = form.getAttribute('data-index');
  if (!input || !status || !results || !indexUrl) return;

  const controller = new AbortController();
  const { signal } = controller;
  let index = null;
  let loading = false;
  let failed = false;
  let rafId = 0;

  const normalize = (value) => value.toLocaleLowerCase('zh-CN').trim();

  const setStatus = (text) => {
    status.textContent = text;
  };

  const loadIndex = async () => {
    if (index || loading || failed) return;
    loading = true;
    setStatus('正在载入本地索引…');
    try {
      const response = await fetch(indexUrl, {
        signal,
        credentials: 'omit',
        cache: 'force-cache',
        referrerPolicy: 'no-referrer',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('索引格式无效');
      index = data;
      setStatus('索引已就绪。查询只在本机匹配。');
      render();
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      failed = true;
      setStatus('索引载入失败。你可以直接浏览资源目录或使用浏览器的页面查找。');
    } finally {
      loading = false;
    }
  };

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const appendHighlighted = (parent, text, terms) => {
    if (!terms.length) {
      parent.appendChild(document.createTextNode(text));
      return;
    }
    const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
    const parts = text.split(pattern);
    parts.forEach((part) => {
      if (!part) return;
      if (pattern.test(part)) {
        const mark = document.createElement('mark');
        mark.textContent = part;
        parent.appendChild(mark);
      } else {
        parent.appendChild(document.createTextNode(part));
      }
      pattern.lastIndex = 0;
    });
  };

  const snippetFor = (text, terms) => {
    const normalized = normalize(text);
    let position = -1;
    terms.forEach((term) => {
      const found = normalized.indexOf(normalize(term));
      if (found !== -1 && (position === -1 || found < position)) position = found;
    });
    if (position === -1) return text.slice(0, 150);
    const start = Math.max(0, position - 48);
    const end = Math.min(text.length, position + 118);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  };

  const render = () => {
    if (!index) return;
    const query = normalize(input.value);
    results.replaceChildren();
    if (empty) empty.hidden = true;

    if (!query) {
      setStatus('输入关键词开始搜索。索引在本机匹配，不会上传查询。');
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const scored = [];
    index.forEach((item) => {
      const title = normalize(item.title || '');
      const page = normalize(item.page || '');
      const text = normalize(item.text || '');
      const haystack = `${title} ${page} ${text}`;
      if (!terms.every((term) => haystack.includes(term))) return;
      let score = 0;
      terms.forEach((term) => {
        if (title.includes(term)) score += 8;
        if (page.includes(term)) score += 3;
        if (text.includes(term)) score += 1;
      });
      scored.push({ item, score });
    });

    scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'zh-CN'));
    const limited = scored.slice(0, 30);
    setStatus(
      scored.length === 0
        ? '没有找到匹配内容。试试更短的关键词，或浏览资源目录。'
        : `找到 ${scored.length} 条结果，显示前 ${limited.length} 条。`,
    );

    if (scored.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }

    limited.forEach(({ item }) => {
      const li = document.createElement('li');
      li.className = 'search-result';
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = item.title;
      heading.appendChild(link);
      const paragraph = document.createElement('p');
      appendHighlighted(paragraph, snippetFor(item.text || '', terms), terms);
      li.append(heading, paragraph);
      results.appendChild(li);
    });
  };

  const scheduleRender = () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      if (!index) {
        loadIndex();
      } else {
        render();
      }
    });
  };

  input.addEventListener('input', scheduleRender, { signal });
  input.addEventListener('focus', () => loadIndex(), { signal, once: true });
  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      if (!index) loadIndex();
      else render();
    },
    { signal },
  );

  window.addEventListener(
    'pagehide',
    () => {
      controller.abort();
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    { once: true },
  );
})();
