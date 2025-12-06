const generateRandomPrefix = (length = 6) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // Allowed characters
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateSku = (
  category: string,
  subCategory: string,
  index: number,
  suffix?: string
) => {
  if (suffix) {
    return `${category.substring(0, 3)}-${subCategory.substring(
      0,
      3
    )}-${suffix}${index}`;
  } else {
    const randomString = generateRandomPrefix();
    return `${category.substring(0, 3)}-${subCategory.substring(
      0,
      3
    )}-${randomString}${index}`;
  }
};

export const generateSlug = (name: string, separator?: string, preserved?: string[]) => {
    let p = ['.', '=', '-'];
    let s = '-';

    if (typeof preserved != 'undefined') {
      p = preserved;
    }
    if (typeof separator != 'undefined') {
      s = separator;
    }

    return name
      .toLowerCase()
      .replace(/ü/g, 'ue')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ß/g, 'ss')
      .replace(new RegExp('[' + p.join('') + ']', 'g'), ' ') //  replace preserved characters with spaces
      .replace(/-{2,}/g, ' ') //  remove duplicate spaces
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '') //  trim both sides of string
      .replace(/[^\w\ ]/gi, '') //  replaces all non-alphanumeric with empty string
      .replace(/[\ ]/gi, s); //  Convert spaces to dashes
  }

