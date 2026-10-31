#!/usr/bin/env node
/**
 * 光谱档案构建脚本（零依赖）
 *
 * 输入：src/site.config.mjs、src/layout.html、src/icons.svg、src/pages/*.html
 * 输出：仓库根目录的静态站点（GitHub Pages 直接发布）
 *
 * 不联网、不安装依赖、不读取环境变量中的秘密。
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { site, pages } from '../src/site.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');

const BASE_PATH = new URL(site.baseUrl).pathname.replace(/\/$/, '');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<\/(p|li|h[1-6]|tr|div|section|dd|dt|blockquote)>/gi, '$&\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/* ------------------------------------------------------------------ */
/* 资源指纹                                                            */
/* ------------------------------------------------------------------ */

const assetHashes = new Map();

const collectAssets = async (dir, prefix = '') => {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await collectAssets(absolute, relative);
    } else if (/\.(css|js|svg|png|webp|woff2?)$/i.test(entry.name)) {
      const hash = createHash('sha256').update(readFileSync(absolute)).digest('hex').slice(0, 10);
      assetHashes.set(`assets/${relative}`, hash);
    }
  }
};

const assetUrl = (relative, rootPrefix) => {
  const clean = relative.replace(/^\/+/, '');
  const hash = assetHashes.get(clean);
  return `${rootPrefix}${clean}${hash ? `?v=${hash}` : ''}`;
};

const rootFor = (slug) => (slug ? '../' : '');

const urlFor = (slug) => (slug ? `${BASE_PATH}/${slug}/` : `${BASE_PATH}/`);
const canonicalFor = (slug) => `${site.baseUrl}${slug ? `/${slug}/` : '/'}`;

/* ------------------------------------------------------------------ */
/* 内容处理                                                            */
/* ------------------------------------------------------------------ */

const slugifyHeading = (text, index) => {
  const base = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return base ? `${base}-${index}` : `section-${index}`;
};

const addHeadingIds = (html) => {
  const headings = [];
  let counter = 0;
  const used = new Set();
  const replaced = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (match, level, attrs = '', inner) => {
    const text = stripTags(inner);
    const idMatch = /\bid=(["'])(.*?)\1/.exec(attrs);
    let id = idMatch ? idMatch[2] : '';
    if (!id) {
      id = slugifyHeading(text, ++counter);
      while (used.has(id)) id = `${id}-${++counter}`;
    }
    used.add(id);
    headings.push({ level: Number(level), id, text });
    const cleanAttrs = idMatch ? attrs : `${attrs} id="${escapeHtml(id)}"`;
    return `<h${level}${cleanAttrs}>${inner}</h${level}>`;
  });
  return { html: replaced, headings };
};

const readingMinutes = (html) => {
  const text = stripTags(html);
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9’'-]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 320 + words / 200));
};

const countExternalLinks = (html) => (html.match(/href="https?:\/\//g) || []).length;

/* ------------------------------------------------------------------ */
/* 导航、页脚                                                          */
/* ------------------------------------------------------------------ */

const visiblePages = pages.filter((page) => page.group !== 'hidden');
const primaryPages = visiblePages.filter((page) => page.group === 'primary');
const morePages = visiblePages.filter((page) => page.group === 'more');

const navLink = (page, currentSlug, rootPrefix) => {
  const current = page.slug === currentSlug ? ' aria-current="page"' : '';
  return `<li><a class="nav-link" href="${rootPrefix}${page.slug ? `${page.slug}/` : ''}"${current}>${escapeHtml(page.nav)}</a></li>`;
};

const renderHeader = (currentSlug, rootPrefix) => {
  const moreActive = morePages.some((page) => page.slug === currentSlug);
  const desktopLink = (page) => {
    const current = page.slug === currentSlug ? ' aria-current="page"' : '';
    return `<a class="nav-link" href="${rootPrefix}${page.slug ? `${page.slug}/` : ''}"${current}>${escapeHtml(page.nav)}</a>`;
  };
  return `<header class="app-bar" data-app-bar>
  <div class="container app-bar__inner">
    <a class="brand" href="${rootPrefix}" aria-label="${escapeHtml(site.name)}首页">
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <defs>
            <linearGradient id="brand-rainbow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#E5484D"/><stop offset=".22" stop-color="#F5A524"/>
              <stop offset=".44" stop-color="#F2E34C"/><stop offset=".62" stop-color="#2FA36B"/>
              <stop offset=".8" stop-color="#3E63DD"/><stop offset="1" stop-color="#8E4EC6"/>
            </linearGradient>
          </defs>
          <path d="M4 16a12 12 0 0 1 24 0" fill="none" stroke="url(#brand-rainbow)" stroke-width="3.4" stroke-linecap="round"/>
          <circle cx="16" cy="21.4" r="3" fill="currentColor"/>
          <path d="M6 25h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".45"/>
        </svg>
      </span>
      <span class="brand__text"><strong>${escapeHtml(site.name)}</strong><span>${escapeHtml(site.nameEn)}</span></span>
    </a>
    <nav class="nav-desktop" aria-label="主导航">
      ${primaryPages.map(desktopLink).join('\n      ')}
      <details class="nav-more${moreActive ? ' is-active' : ''}">
        <summary class="nav-link nav-more__summary">更多<svg class="icon icon--sm" aria-hidden="true"><use href="#i-chevron"></use></svg></summary>
        <div class="nav-more__panel">
          ${morePages.map((page) => desktopLink(page).replace('class="nav-link"', 'class="nav-link nav-link--panel"')).join('\n          ')}
        </div>
      </details>
    </nav>
    <div class="app-actions">
      <a class="icon-button" href="${rootPrefix}search/" aria-label="站内搜索" title="站内搜索">
        <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
      </a>
      <button class="icon-button" type="button" data-theme-toggle aria-label="切换主题" title="切换主题">
        <svg class="icon theme-toggle__auto" aria-hidden="true"><use href="#i-contrast"></use></svg>
        <svg class="icon theme-toggle__light" aria-hidden="true"><use href="#i-sun"></use></svg>
        <svg class="icon theme-toggle__dark" aria-hidden="true"><use href="#i-moon"></use></svg>
      </button>
      <button class="icon-button icon-button--exit" type="button" data-quick-exit aria-label="快速离开本站" title="快速离开（跳到中性页面）">
        <svg class="icon" aria-hidden="true"><use href="#i-external"></use></svg>
      </button>
      <button class="icon-button icon-button--menu" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-drawer" aria-label="打开导航菜单">
        <svg class="icon" aria-hidden="true"><use href="#i-menu"></use></svg>
      </button>
    </div>
  </div>
  <p class="visually-hidden" id="theme-status" role="status" aria-live="polite"></p>
</header>

<div class="drawer" id="site-drawer" data-nav hidden>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <div class="drawer__head">
      <h2 class="drawer__title" id="drawer-title">导航</h2>
      <button class="icon-button" type="button" data-nav-close aria-label="关闭导航菜单">
        <svg class="icon" aria-hidden="true"><use href="#i-close"></use></svg>
      </button>
    </div>
    <nav class="drawer__nav" aria-label="移动导航">
      <p class="drawer__group-label">主要页面</p>
      <ul class="drawer__list">${primaryPages.map((page) => navLink(page, currentSlug, rootPrefix)).join('')}</ul>
      <p class="drawer__group-label">更多内容</p>
      <ul class="drawer__list">${morePages.map((page) => navLink(page, currentSlug, rootPrefix)).join('')}</ul>
    </nav>
    <div class="drawer__foot">
      <a class="button button--outlined button--full" href="${rootPrefix}search/"><svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>站内搜索</a>
      <p class="small muted">本站不收集数据。主题偏好仅保存在你的浏览器中。</p>
    </div>
  </div>
</div>`;
};

const renderFooter = (rootPrefix) => {
  const columns = [
    {
      title: '内容',
      items: ['identities', 'china', 'rights', 'health'],
    },
    {
      title: '帮助',
      items: ['support', 'ally', 'security', 'resources'],
    },
    {
      title: '项目',
      items: ['about', 'deploy', 'faq', 'glossary'],
    },
  ];
  const columnHtml = columns
    .map(
      (column) => `<div class="footer__col">
        <h2 class="footer__title">${column.title}</h2>
        <ul class="footer__list">${column.items
          .map((slug) => {
            const page = pages.find((item) => item.slug === slug);
            return page ? `<li><a href="${rootPrefix}${page.slug}/">${escapeHtml(page.nav)}</a></li>` : '';
          })
          .join('')}</ul>
      </div>`,
    )
    .join('\n      ');

  return `<footer class="site-footer">
  <div class="container footer__grid">
    <div class="footer__brand">
      <a class="brand" href="${rootPrefix}" aria-label="${escapeHtml(site.name)}首页">
        <span class="brand__text"><strong>${escapeHtml(site.name)}</strong><span>${escapeHtml(site.nameEn)}</span></span>
      </a>
      <p>一个不收集隐私、无第三方脚本的 LGBTQ+ 中文资料站。内容由 AI 辅助构建，欢迎纠错。</p>
      <p class="footer__badges">
        <span class="badge badge--quiet"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-lock"></use></svg>零追踪</span>
        <span class="badge badge--quiet"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-code"></use></svg>${site.licenseCode}</span>
        <span class="badge badge--quiet"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-book"></use></svg>${site.licenseContent}</span>
      </p>
    </div>
    ${columnHtml}
    <div class="footer__col">
      <h2 class="footer__title">联系</h2>
      <ul class="footer__list">
        <li><a href="${site.repo}" rel="noopener noreferrer">GitHub 仓库</a></li>
        <li><a href="${site.issues}" rel="noopener noreferrer">报告问题</a></li>
        <li><a href="${rootPrefix}security/">隐私说明</a></li>
        <li><a href="${rootPrefix}deploy/">部署本站</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer__bottom">
    <p>© 2026 ${escapeHtml(site.name)} · 非官方社区项目 · 内容以 ${site.licenseContent} 授权</p>
    <p class="footer__note">本站不提供医疗、法律或心理治疗服务。紧急情况请联系当地急救与热线。</p>
  </div>
</footer>`;
};

/* ------------------------------------------------------------------ */
/* Hero、目录、翻页                                                    */
/* ------------------------------------------------------------------ */

const renderHero = (page, rootPrefix, minutes, sourceCount) => {
  if (page.customHero) return '';
  return `<section class="page-hero">
  <div class="container">
    <nav class="breadcrumbs" aria-label="面包屑"><a href="${rootPrefix}">首页</a><span aria-hidden="true">/</span><span>${escapeHtml(page.nav)}</span></nav>
    <p class="eyebrow">${escapeHtml(page.eyebrow || '')}</p>
    <h1 class="page-title">${escapeHtml(page.heading)}</h1>
    <p class="lede">${escapeHtml(page.lede || '')}</p>
    <div class="meta-row">
      <span class="badge"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-calendar"></use></svg>更新于 ${site.updatedLabel}</span>
      <span class="badge"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-clock"></use></svg>约 ${minutes} 分钟</span>
      ${sourceCount ? `<span class="badge"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-link"></use></svg>${sourceCount} 个外部来源</span>` : ''}
      <span class="badge badge--quiet"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-lock"></use></svg>不收集数据</span>
    </div>
  </div>
</section>`;
};

const renderToc = (headings, rootPrefix) => {
  const items = headings.filter((heading) => heading.level === 2);
  if (items.length < 2) return { desktop: '', mobile: '' };
  const list = `<ol class="toc__list">${items
    .map(
      (heading) =>
        `<li class="toc__item"><a class="toc__link" href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`,
    )
    .join('')}</ol>`;
  return {
    desktop: `<aside class="toc" aria-labelledby="toc-title">
      <p class="toc__title" id="toc-title"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-list"></use></svg>本页目录</p>
      ${list}
    </aside>`,
    mobile: `<details class="toc-mobile">
      <summary class="toc-mobile__summary"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-list"></use></svg>本页目录<svg class="icon icon--sm toc-mobile__chevron" aria-hidden="true"><use href="#i-chevron-down"></use></svg></summary>
      ${list}
    </details>`,
  };
};

const renderPager = (page, rootPrefix) => {
  const index = visiblePages.findIndex((item) => item.slug === page.slug);
  if (index === -1) return '';
  const prev = visiblePages[index - 1];
  const next = visiblePages[index + 1];
  const card = (item, direction) =>
    item
      ? `<a class="pager__link pager__link--${direction}" href="${rootPrefix}${item.slug ? `${item.slug}/` : ''}">
          <span class="pager__label">${direction === 'prev' ? '上一页' : '下一页'}</span>
          <span class="pager__title">${escapeHtml(item.nav)}</span>
        </a>`
      : '<span class="pager__spacer"></span>';
  return `<nav class="pager" aria-label="翻页">${card(prev, 'prev')}${card(next, 'next')}</nav>`;
};

/* ------------------------------------------------------------------ */
/* 页面渲染                                                            */
/* ------------------------------------------------------------------ */

const loadLayout = async () => readFile(path.join(SRC, 'layout.html'), 'utf8');

const render404 = async (layout, sprite) => {
  const raw = await readFile(path.join(SRC, 'pages', '404.html'), 'utf8');
  const processed = addHeadingIds(raw);
  const content = processed.html
    .replaceAll('{{ROOT}}', '')
    .replaceAll('/LGBTQ/', `${BASE_PATH}/`);
  const page = {
    slug: '404',
    title: '页面未找到',
    description: '你访问的页面不存在。回到首页或使用站内搜索继续浏览光谱档案。',
    keywords: ['404', '页面未找到'],
  };
  const values = {
    LANG: site.locale,
    PAGE_CLASS: 'page page--404',
    PAGE_SLUG: '404',
    TITLE: `页面未找到 | ${site.name}`,
    DESCRIPTION: page.description,
    KEYWORDS: page.keywords.join(', '),
    CANONICAL: `${site.baseUrl}/404.html`,
    ROBOTS: 'noindex, follow',
    OG_TYPE: 'website',
    OG_IMAGE: `${site.baseUrl}${site.ogImage}`,
    OG_IMAGE_ALT: `${site.name}：LGBTQ+ 中文资料、支持与安全指南`,
    THEME_LIGHT: site.themeColorLight,
    THEME_DARK: site.themeColorDark,
    CSS: ['tokens', 'base', 'components', 'pages', 'content']
      .map((name) => `<link rel="stylesheet" href="${assetUrl(`assets/css/${name}.css`, '')}">`)
      .join('\n  '),
    SPRITE: sprite,
    HEADER: renderHeader('404', ''),
    FOOTER: renderFooter(''),
    CONTENT: content,
    APP_JS: `<script src="${assetUrl('assets/js/app.js', '')}" defer></script>`,
    PAGE_JS: '',
    ROOT: '',
    SITE_NAME: escapeHtml(site.name),
    SITE_NAME_EN: escapeHtml(site.nameEn),
    REPO: site.repo,
    UPDATED: site.updated,
    FAVICON: 'assets/img/favicon.svg',
    APPLE_ICON: 'assets/img/apple-touch-icon.png',
    MANIFEST: 'site.webmanifest',
    SEARCH_ICON: 'search/',
  };
  const html = tidy(applyLayout(layout, values));
  await writeFile(path.join(ROOT, '404.html'), html, 'utf8');
  return html;
};

const tidy = (html) =>
  html
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/, '\n');

const applyLayout = (layout, values) =>
  Object.entries(values).reduce((output, [key, value]) => output.split(`{{${key}}}`).join(value), layout);

const renderPage = async (page, layout, sprite) => {
  const rootPrefix = rootFor(page.slug);
  const raw = await readFile(path.join(SRC, 'pages', page.file), 'utf8');
  const processed = addHeadingIds(raw);
  const bodyHtml = processed.html
    .replaceAll('{{ROOT}}', rootPrefix)
    .replaceAll('{{UPDATED}}', site.updated)
    .replaceAll('{{YEAR}}', '2026');
  const minutes = readingMinutes(bodyHtml);
  const sourceCount = countExternalLinks(bodyHtml);
  const hero = renderHero(page, rootPrefix, minutes, sourceCount);
  const toc = page.toc ? renderToc(processed.headings, rootPrefix) : { desktop: '', mobile: '' };
  const isHome = page.slug === '';
  const content = page.customHero
    ? bodyHtml
    : `${hero}
  <div class="container page-body">
    ${toc.mobile}
    <div class="page-grid${page.toc ? '' : ' page-grid--single'}">
      <article class="prose">
        ${bodyHtml}
        ${renderPager(page, rootPrefix)}
      </article>
      ${toc.desktop}
    </div>
  </div>`;

  const title = isHome ? site.title : `${page.title} | ${site.name}`;
  const pageJs = page.pageJs
    ? `<script src="${assetUrl(`assets/js/${page.pageJs}`, rootPrefix)}" defer></script>`
    : '';

  const html = applyLayout(layout, {
    LANG: site.locale,
    PAGE_CLASS: `page page--${page.slug || 'home'}`,
    PAGE_SLUG: page.slug || 'home',
    TITLE: escapeHtml(title),
    DESCRIPTION: escapeHtml(page.description || site.description),
    KEYWORDS: escapeHtml((page.keywords || site.keywords).join(', ')),
    CANONICAL: canonicalFor(page.slug),
    ROBOTS: page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    OG_TYPE: isHome ? 'website' : 'article',
    OG_IMAGE: `${site.baseUrl}${site.ogImage}`,
    OG_IMAGE_ALT: escapeHtml(`${page.ogAlt || `${site.name}：${page.nav}`}`),
    THEME_LIGHT: site.themeColorLight,
    THEME_DARK: site.themeColorDark,
    CSS: ['tokens', 'base', 'components', 'pages', 'content']
      .map((name) => `<link rel="stylesheet" href="${assetUrl(`assets/css/${name}.css`, rootPrefix)}">`)
      .join('\n  '),
    SPRITE: sprite,
    HEADER: renderHeader(page.slug, rootPrefix),
    FOOTER: renderFooter(rootPrefix),
    CONTENT: content,
    APP_JS: `<script src="${assetUrl('assets/js/app.js', rootPrefix)}" defer></script>`,
    PAGE_JS: pageJs,
    ROOT: rootPrefix,
    SITE_NAME: escapeHtml(site.name),
    SITE_NAME_EN: escapeHtml(site.nameEn),
    REPO: site.repo,
    UPDATED: site.updated,
    FAVICON: `${rootPrefix}assets/img/favicon.svg`,
    APPLE_ICON: `${rootPrefix}assets/img/apple-touch-icon.png`,
    MANIFEST: `${rootPrefix}site.webmanifest`,
    SEARCH_ICON: `${rootPrefix}search/`,
  });

  const target = page.slug ? path.join(ROOT, page.slug, 'index.html') : path.join(ROOT, 'index.html');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, tidy(html), 'utf8');
  return { page, html, content: bodyHtml, sections: processed.headings };
};

/* ------------------------------------------------------------------ */
/* 搜索索引、站点地图                                                  */
/* ------------------------------------------------------------------ */

const collapse = (value) => value.replace(/\s+/g, ' ').trim();

const buildSearchIndex = (rendered) => {
  const index = [];
  for (const { page, content } of rendered) {
    if (page.noindex) continue;
    const plain = collapse(stripTags(content));
    if (!plain) continue;
    const headingPositions = [];
    const headingRegex = /<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      headingPositions.push({ id: match[1], title: stripTags(match[2]), pos: match.index });
    }
    const prefix = page.slug ? `../${page.slug}/` : '../';
    if (headingPositions.length === 0) {
      index.push({ title: page.heading, page: page.nav, url: prefix, text: plain.slice(0, 6000) });
      continue;
    }
    const intro = collapse(stripTags(content.slice(0, headingPositions[0].pos)));
    if (intro.length > 40) {
      index.push({ title: page.heading, page: page.nav, url: prefix, text: intro.slice(0, 4000) });
    }
    headingPositions.forEach((heading, i) => {
      const start = heading.pos;
      const end = i + 1 < headingPositions.length ? headingPositions[i + 1].pos : content.length;
      const text = collapse(stripTags(content.slice(start, end)));
      index.push({
        title: collapse(heading.title),
        page: page.nav,
        url: `${prefix}#${heading.id}`,
        text: text.slice(0, 5000),
      });
    });
  }
  return index;
};

const writeSitemap = async () => {
  const urls = pages
    .filter((page) => !page.noindex)
    .map(
      (page) =>
        `  <url><loc>${canonicalFor(page.slug)}</loc><lastmod>${site.updated}</lastmod><changefreq>${
          page.slug ? 'monthly' : 'weekly'
        }</changefreq><priority>${page.slug ? '0.8' : '1.0'}</priority></url>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  await writeFile(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
};

const writeRobots = async () => {
  const base = BASE_PATH || '';
  const privatePaths = ['/src/', '/tools/', '/deploy/', '/BUILD.json']
    .map((item) => `Disallow: ${base}${item}`)
    .join('\n');
  const robots = `# 光谱档案 · Spectrum Archive
# 站点为纯静态页面；以下目录只在仓库中维护，不需要被索引。
User-agent: *
Allow: /
${privatePaths}

Sitemap: ${site.baseUrl}/sitemap.xml
`;
  await writeFile(path.join(ROOT, 'robots.txt'), robots, 'utf8');
};

const writeManifest = async () => {
  const manifest = {
    name: site.title,
    short_name: site.name,
    description: site.description,
    lang: site.locale,
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#FDF7FF',
    theme_color: '#FDF7FF',
    icons: [
      { src: `${BASE_PATH}/assets/img/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${BASE_PATH}/assets/img/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${BASE_PATH}/assets/img/favicon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
  await writeFile(path.join(ROOT, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
};

const writeBuildInfo = async (rendered) => {
  const htmlBytes = rendered.reduce((sum, item) => sum + Buffer.byteLength(item.html, 'utf8'), 0);
  const indexBytes = Buffer.byteLength(JSON.stringify(await buildIndexFile(rendered)), 'utf8');
  const info = {
    name: site.name,
    builtAt: new Date().toISOString(),
    updated: site.updated,
    pages: rendered.length,
    htmlBytes,
    searchIndexBytes: indexBytes,
    node: process.version,
  };
  await writeFile(path.join(ROOT, 'BUILD.json'), `${JSON.stringify(info, null, 2)}\n`, 'utf8');
  return info;
};

/* 生成索引并保存；返回同一数组供统计。 */
const buildIndexFile = async (rendered) => {
  const index = buildSearchIndex(rendered);
  await mkdir(path.join(ASSETS, 'data'), { recursive: true });
  await writeFile(path.join(ASSETS, 'data', 'search-index.json'), `${JSON.stringify(index)}\n`, 'utf8');
  return index;
};

const main = async () => {
  const started = Date.now();
  await collectAssets(ASSETS);
  const layout = await loadLayout();
  const sprite = await readFile(path.join(SRC, 'icons.svg'), 'utf8');
  const rendered = [];

  for (const page of pages) {
    const result = await renderPage(page, layout, sprite);
    rendered.push(result);
    const size = (Buffer.byteLength(result.html, 'utf8') / 1024).toFixed(1);
    console.log(`  ${(page.slug || 'index').padEnd(12)} ${size.padStart(6)} KiB`);
  }

  await render404(layout, sprite);
  const index = await buildIndexFile(rendered);
  await writeSitemap();
  await writeRobots();
  await writeManifest();
  const info = await writeBuildInfo(rendered);

  const seconds = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    `\n已生成 ${pages.length} 个页面 + 404、${index.length} 条搜索索引、sitemap、robots 与 webmanifest。`,
  );
  console.log(
    `HTML ${(info.htmlBytes / 1024).toFixed(1)} KiB · 索引 ${(info.searchIndexBytes / 1024).toFixed(1)} KiB · ${seconds}s`,
  );
  console.log(`输出目录：${ROOT}`);
  console.log(`在线地址：${site.demo}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
