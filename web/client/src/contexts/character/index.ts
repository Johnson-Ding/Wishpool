// 角色图片资源常量
export const MOON_BG = "/moon-bg.png";
export const MOON_AVATAR = "/moon-avatar.png";
export const CLOUD_BG = "/cloud-bg.png";
export const CLOUD_AVATAR = "/cloud-avatar.png";

export type CharacterType = "moon" | "cloud" | "star";

export function getCharacterAvatar(character: CharacterType): string {
  switch (character) {
    case "cloud":
      return CLOUD_AVATAR;
    case "star":
      return MOON_AVATAR; // fallback until star assets exist
    default:
      return MOON_AVATAR;
  }
}

export function getCharacterBg(character: CharacterType): string {
  switch (character) {
    case "cloud":
      return CLOUD_BG;
    case "star":
      return MOON_BG; // fallback
    default:
      return MOON_BG;
  }
}