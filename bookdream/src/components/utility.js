export const google_api_key = "AIzaSyAzGjfYY_lvfI4mcs8iYm9PJtBovNPv8_c";
export const nyt_api_key = "AlJgzaAn4nn6bRzF5hMdQ1OuVVIBUDfw";

export const sortList = (list) => {
  list.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};
