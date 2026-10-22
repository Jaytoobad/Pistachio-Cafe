// ========================================================================
// PRODUCT CATALOG - ported from reference/old-static/js/products.js
// Edit this file to change the menu.
// ========================================================================

export const PRODUCTS = [
  {
    id: "pancake-stack",
    name: "Buttermilk Pancake Stack",
    category: "breakfast",
    price: 35.00,
    desc: "Three fluffy pancakes, maple syrup, whipped butter.",
    image: "images/products/pancake-stack.jpg"
  },
  {
    id: "avocado-toast",
    name: "Avocado & Poached Egg Toast",
    category: "breakfast",
    price: 32.00,
    desc: "Sourdough, smashed avocado, chilli flakes, two eggs.",
    image: "images/products/avocado-toast.jpg"
  },
  {
    id: "shakshuka",
    name: "Pistachio Shakshuka",
    category: "breakfast",
    price: 38.00,
    desc: "Eggs simmered in spiced tomato sauce, warm pita.",
    image: "images/products/shakshuka.jpg"
  },
  {
    id: "brunch-board",
    name: "Weekend Brunch Board",
    category: "brunch",
    price: 65.00,
    desc: "A shared spread of pastries, fruit, cheese, and eggs.",
    image: "images/products/brunch-board.jpg"
  },
  {
    id: "eggs-benedict",
    name: "Classic Eggs Benedict",
    category: "brunch",
    price: 42.00,
    desc: "Poached eggs, hollandaise, smoked bacon, muffin.",
    image: "images/products/eggs-benedict.jpg"
  },
  {
    id: "chicken-waffles",
    name: "Fried Chicken & Waffles",
    category: "brunch",
    price: 48.00,
    desc: "Buttermilk waffle, crisp chicken, hot honey drizzle.",
    image: "images/products/chicken-waffles.jpg"
  },
  {
    id: "carrot-cake",
    name: "Spiced Carrot Cake",
    category: "dessert",
    price: 24.00,
    desc: "Walnuts, cream cheese frosting, cinnamon.",
    image: "images/products/carrot-cake.jpg"
  },
  {
    id: "lemon-tart",
    name: "Meyer Lemon Tart",
    category: "dessert",
    price: 26.00,
    desc: "Buttery shortcrust, silky lemon curd, torched meringue.",
    image: "images/products/lemon-tart.jpg"
  },
  {
    id: "chocolate-fondant",
    name: "Dark Chocolate Fondant",
    category: "dessert",
    price: 28.00,
    desc: "Warm molten centre, vanilla bean ice cream.",
    image: "images/products/chocolate-fondant.jpg"
  }
];

export function findProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

export const CATEGORIES = ["breakfast", "brunch", "dessert"];

export function formatMoney(n){
  return "GH\u20b5" + Number(n || 0).toFixed(2);
}