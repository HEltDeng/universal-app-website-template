// Public contact images use the same directories as the rest of the template.
// Reject traversal, encoded paths and external URLs instead of silently relocating them.
export function localCommunityImage(value) {
  const path = typeof value === 'string' ? value.trim() : '';
  if (!/^\/(?:brand|screenshots|assets\/(?:images|icons))\/[a-z0-9][a-z0-9._/-]*$/i.test(path)) return '';
  if (path.slice(1).split('/').some(part => part === '.' || part === '..' || !part)) return '';
  return path;
}

export function communityBrandText(name) {
  const brand = typeof name === 'string' && name.trim() ? name.trim() : 'APP';
  return {
    title: `加入“${brand}”QQ 交流群`,
    introduction: `交流使用体验、反馈问题，或获取“${brand}”的最新消息。`,
    imageAlt: `${brand} QQ 交流群二维码`,
  };
}
