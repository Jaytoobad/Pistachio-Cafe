import { demoMenu, demoDishes } from './demoData';

function menuName(menuId) {
  const m = demoMenu.find((x) => x.id === menuId);
  return m ? m.name : '';
}

export async function fetchMenu() {
  return demoMenu;
}

export async function fetchDishes() {
  return demoDishes;
}

export async function fetchAvailableDishes(menuId = null) {
  let items = demoDishes.filter((d) => d.is_available !== false);
  if (menuId) items = items.filter((d) => d.menu_id === menuId);
  return items;
}

export async function fetchFeaturedDishes() {
  const items = demoDishes.filter((d) => d.is_available !== false);
  const byCat = {};
  items.forEach((p) => {
    const key = p.menu_id;
    if (!byCat[key]) byCat[key] = [];
    byCat[key].push(p);
  });

  return demoMenu
    .map((c) => {
      const list = byCat[c.id] || [];
      const featured = list.find((p) => p.is_featured) || list[0];
      if (!featured) return null;
      return { ...featured, menu_name: c.name };
    })
    .filter(Boolean);
}