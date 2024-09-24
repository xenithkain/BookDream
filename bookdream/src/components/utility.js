export const sortList = (list) => {
  list.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};
