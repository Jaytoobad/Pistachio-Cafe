import { demoMenu, demoDishes } from './demoData';

export async function fetchMenu() {
  return demoMenu;
}

export async function fetchDishes() {
  return demoDishes;
}

export async function fetchAvailableDishes(menuId = null) {
  let items = demoDishes.filter(d => d.is_available);
  if (menuId) items = items.filter(d => d.menu_id === menuId);
  return items;
}

export async function fetchFeaturedDishes() {
  return demoDishes.filter(d => d.is_available).map(d => ({ ...d, menu_name: d.menu.name }));
}
