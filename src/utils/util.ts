export const convertArrayToString = (arr: string[]): string => {
  if (!arr.length) return "";
  if (arr.length === 1) return convertFirstCharToUppercase(arr[0]);
  if (arr.length === 2)
    return `${convertFirstCharToUppercase(arr[0])}, and ${arr[1]}`;

  const firstValue = convertFirstCharToUppercase(arr[0]);
  const lastValue = arr[arr.length - 1];
  const middleValues = arr.slice(1, -1).join(", ");

  return `${firstValue}, ${middleValues}, and ${lastValue}`;
};

export const convertFirstCharToUppercase = (str: string) => {
  if (!str) return "";
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
};
