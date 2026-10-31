/*
 * 主题引导脚本：在首次绘制前恢复用户选择，避免闪白。
 * 只读写一个键：spectrum.theme。没有标识符、时间戳或行为记录。
 * 任何存储异常（隐私模式、禁用存储）都静默降级为跟随系统。
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'spectrum.theme';
  let mode = 'auto';
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') mode = stored;
  } catch (_) {
    mode = 'auto';
  }
  root.dataset.mode = mode;
  if (mode === 'auto') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }
})();
