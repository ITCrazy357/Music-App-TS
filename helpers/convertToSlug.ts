import unidecode from "unidecode";

export const convertToSlug = (text: string): string => {
  const unidecodeText = unidecode(text.trim().toLowerCase()); // Loại bỏ dấu và chuyển về chữ thường

  const slug: string = unidecodeText.replace(/\s+/g, "-"); // Thay thế khoảng trắng bằng dấu gạch ngang

  return slug;
};
