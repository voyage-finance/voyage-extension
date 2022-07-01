export const truncate = (address?: string) => {
  if (!address) return '';
  const head = address.slice(2, 6);
  const tail = address.slice(38);
  return `0x${head}...${tail}`;
};
