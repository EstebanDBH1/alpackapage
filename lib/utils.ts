const NEW_BADGE_DAYS = 5;

/** Un prompt se considera "nuevo" durante los primeros 5 días tras su creación. */
export const isNewPrompt = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
};
