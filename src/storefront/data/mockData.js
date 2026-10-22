export const MOCK_MENUS = [
  { id: 'm-breakfast', slug: 'breakfast', name: 'Breakfast', sort_order: 0, is_visible: true },
  { id: 'm-brunch', slug: 'brunch', name: 'Brunch', sort_order: 1, is_visible: true },
  { id: 'm-desserts', slug: 'desserts', name: 'Desserts', sort_order: 2, is_visible: true },
  { id: 'm-combos', slug: 'combos', name: 'Shisha Combos', sort_order: 3, is_visible: true },
];

export const MOCK_DISHES = [
  { id: 'd-pancake-stack', slug: 'pancake-stack', menu_id: 'm-breakfast', name: 'Buttermilk Pancake Stack', description: 'Three fluffy pancakes, maple syrup, whipped butter.', price: 35.00, image_url: '/images/products/pancake-stack.jpg', is_available: true, is_featured: true, is_hidden: false, sort_order: 0, tags: [] },
  { id: 'd-avocado-toast', slug: 'avocado-toast', menu_id: 'm-breakfast', name: 'Avocado & Poached Egg Toast', description: 'Sourdough, smashed avocado, chilli flakes, two eggs.', price: 32.00, image_url: '/images/products/avocado-toast.jpg', is_available: true, is_featured: false, is_hidden: false, sort_order: 1, tags: [] },
  { id: 'd-shakshuka', slug: 'shakshuka', menu_id: 'm-breakfast', name: 'Pistachio Shakshuka', description: 'Eggs simmered in spiced tomato sauce, warm pita.', price: 38.00, image_url: '/images/products/shakshuka.jpg', is_available: true, is_featured: false, is_hidden: false, sort_order: 2, tags: [] },
  { id: 'd-brunch-board', slug: 'brunch-board', menu_id: 'm-brunch', name: 'Weekend Brunch Board', description: 'A shared spread of pastries, fruit, cheese, and eggs.', price: 65.00, image_url: '/images/products/brunch-board.jpg', is_available: true, is_featured: true, is_hidden: false, sort_order: 0, tags: [] },
  { id: 'd-eggs-benedict', slug: 'eggs-benedict', menu_id: 'm-brunch', name: 'Classic Eggs Benedict', description: 'Poached eggs, hollandaise, smoked bacon, muffin.', price: 42.00, image_url: '/images/products/eggs-benedict.jpg', is_available: true, is_featured: false, is_hidden: false, sort_order: 1, tags: [] },
  { id: 'd-chicken-waffles', slug: 'chicken-waffles', menu_id: 'm-brunch', name: 'Fried Chicken & Waffles', description: 'Buttermilk waffle, crisp chicken, hot honey drizzle.', price: 48.00, image_url: '/images/products/chicken-waffles.jpg', is_available: true, is_featured: false, is_hidden: false, sort_order: 2, tags: [] },
  { id: 'd-carrot-cake', slug: 'carrot-cake', menu_id: 'm-desserts', name: 'Spiced Carrot Cake', description: 'Walnuts, cream cheese frosting, cinnamon.', price: 24.00, image_url: '/images/products/carrot-cake.jpg', is_available: true, is_featured: true, is_hidden: false, sort_order: 0, tags: [] },
  { id: 'd-lemon-tart', slug: 'lemon-tart', menu_id: 'm-desserts', name: 'Meyer Lemon Tart', description: 'Buttery shortcrust, silky lemon curd, torched meringue.', price: 26.00, image_url: '/images/products/lemon-tart.jpg', is_available: true, is_featured: false, is_hidden: false, sort_order: 1, tags: [] },
  { id: 'd-chocolate-fondant', slug: 'chocolate-fondant', menu_id: 'm-desserts', name: 'Dark Chocolate Fondant', description: 'Warm molten centre, vanilla bean ice cream.', price: 28.00, image_url: '/images/products/chocolate-fondant.jpg', is_available: true, is_featured: false, is_hidden: false, sort_order: 2, tags: [] },
  { id: 'd-shisha-combo', slug: 'shisha-sandwich-drink-combo', menu_id: 'm-combos', name: 'Shisha, Sandwich & Drink Combo', description: 'A relaxed shisha session with a sandwich and a drink of your choice.', price: 250, image_url: null, is_available: true, is_featured: true, is_hidden: false, sort_order: 0, tags: [] },
];

export const MOCK_REVIEWS = [
  { id: 'r1', customer_name: 'Ama Owusu', user_email: null, dish_id: 'd-shakshuka', dish_name: 'Pistachio Shakshuka', rating: 5, comment: 'The shakshuka is unreal and the staff remember my order. My weekend does not start without this place.', is_approved: true, created_at: '2026-10-10T08:00:00Z' },
  { id: 'r2', customer_name: 'Kwabena Asante', user_email: null, dish_id: 'd-brunch-board', dish_name: 'Weekend Brunch Board', rating: 5, comment: 'Walked in for coffee, stayed two hours for the brunch board. Genuinely one of the best in the city.', is_approved: true, created_at: '2026-10-11T09:30:00Z' },
  { id: 'r3', customer_name: 'Linda Mensah', user_email: null, dish_id: null, dish_name: null, rating: 4, comment: 'My go-to for a working lunch. Would love a few more vegan dessert options, but the coffee alone keeps me coming back.', is_approved: true, created_at: '2026-10-12T12:00:00Z' },
];

export const MOCK_SETTINGS = {
  cafe_name: 'Pistachio Cafe',
  tagline: 'Elegance you can taste',
  address: 'Spintex, Accra, Ghana',
  instagram: '@pistachio.ghana',
  phone: '',
  whatsapp: '',
  email: 'hello@pistachio.cafe',
  is_open: true,
  accepting_order: true,
};