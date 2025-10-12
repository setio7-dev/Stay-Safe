export function getShortName(fullName: string) {
  if (!fullName) return "";
  const words = fullName.split(" ");
  return words.length >= 2 ? `${words[0]} ${words[1]}` : fullName;
}