export const normalizeTags = (rawTags) => {
  if (!rawTags) return [];

  if (Array.isArray(rawTags)) {
    return rawTags
      .map(tag => {
        if (typeof tag === 'string') return tag.trim();
        if (tag && typeof tag === 'object' && tag.name) return tag.name.trim();
        return null;
      })
      .filter(tag => tag && tag.length > 0);
  }

  if (typeof rawTags === 'string') {
    return rawTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  return [];
};
