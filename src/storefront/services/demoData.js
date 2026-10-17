export const demoMenu = [
  { id: 'm1', name: 'Coffee', sort_order: 0 },
  { id: 'm2', name: 'Desserts', sort_order: 1 },
  { id: 'm3', name: 'Shisha', sort_order: 2 }
];

export const demoDishes = [
  { id: 'd1', menu_id: 'm1', name: 'Espresso', description: 'Rich double shot', price: 15, image_url: null, is_available: true, sort_order: 0, menu: { name: 'Coffee' } },
  { id: 'd2', menu_id: 'm1', name: 'Cappuccino', description: 'Foam-topped espresso', price: 20, image_url: null, is_available: true, sort_order: 1, menu: { name: 'Coffee' } },
  { id: 'd3', menu_id: 'm2', name: 'Chocolate Cake', description: 'Decadent slice', price: 25, image_url: null, is_available: true, sort_order: 0, menu: { name: 'Desserts' } },
  { id: 'd4', menu_id: 'm3', name: 'Apple Shisha', description: 'Smooth flavored shisha', price: 60, image_url: null, is_available: true, sort_order: 0, menu: { name: 'Shisha' } }
];
