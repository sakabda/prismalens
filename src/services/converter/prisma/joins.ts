export function sqlJoinToInclude(
  relation: string,
) {
  return {
    include: {
      [relation]: true,
    },
  };
}