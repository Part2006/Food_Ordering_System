import User from './models/user.js';
import bcrypt from 'bcryptjs';
import Restaurant from './models/restaurant.js';
import MenuItem from './models/menuItem.js';
import Order from './models/order.js';
import Review from './models/review.js';

export const seedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping automatic seeding.');
      return;
    }

    console.log('Database is empty! Automatically seeding previous orders, users, and customer details...');
    
    // 1. Generate Hashes
    const salt = await bcrypt.genSalt(10);
    const passAdmin = await bcrypt.hash('admin123', salt);
    const passCustomer = await bcrypt.hash('customer123', salt);
    const passRestaurant = await bcrypt.hash('restaurant123', salt);

    // Create Admin and Customer
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: passAdmin,
      role: 'admin',
      addresses: []
    });

    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@gmail.com',
      password: passCustomer,
      role: 'customer',
      addresses: [
        {
          street: '123 Foodie Lane, Green Park',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110016',
          isDefault: true
        }
      ]
    });

    // Create Restaurant Owners
    const owners = await User.create([
      {
        name: 'Pizza Owner',
        email: 'pizzaparadise@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Burger Owner',
        email: 'burgerbistro@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Sahyadri Owner',
        email: 'sahyadri@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Punjabi Owner',
        email: 'sherepunjab@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Dakshin Owner',
        email: 'dakshin@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Gujarati Owner',
        email: 'gujaratirasoi@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Tandoori Owner',
        email: 'tandoori@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'KFC Owner',
        email: 'kfc@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      },
      {
        name: 'Kshatriya Owner',
        email: 'kshatriya@gmail.com',
        password: passRestaurant,
        role: 'restaurant',
        addresses: []
      }
    ]);

    // 2. Create Restaurants linked to their respective owners
    const restaurants = await Restaurant.create([
      {
        name: 'Pizza Paradise',
        owner: owners[0]._id,
        address: 'Koregaon Park, Pune',
        cuisine: ['Pizza', 'Italian', 'Fast Food', 'Desserts', 'Ice Cream'],
        rating: 4.5,
        numReviews: 1,
        isApproved: true,
        deliveryRadius: 6,
        timing: { open: '10:00 AM', close: '11:00 PM' },
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80'
      },
      {
        name: 'Burger Bistro',
        owner: owners[1]._id,
        address: 'Kothrud, Pune',
        cuisine: ['Burgers', 'American', 'Sandwiches', 'Beverages'],
        rating: 4.2,
        numReviews: 1,
        isApproved: true,
        deliveryRadius: 4,
        timing: { open: '11:00 AM', close: '10:00 PM' },
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80'
      },
      {
        name: 'Sahyadri Maratha Delights',
        owner: owners[2]._id,
        address: 'Deccan Gymkhana, Pune',
        cuisine: ['Maharashtrian', 'Indian', 'Thalis', 'Beverages'],
        rating: 4.7,
        numReviews: 0,
        isApproved: true,
        deliveryRadius: 8,
        timing: { open: '11:30 AM', close: '10:30 PM' },
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80'
      },
      {
        name: 'Sher-E-Punjab Rasoi',
        owner: owners[3]._id,
        address: 'FC Road, Shivaji Nagar, Pune',
        cuisine: ['Punjabi', 'North Indian', 'Thalis', 'Desserts'],
        rating: 4.6,
        numReviews: 0,
        isApproved: true,
        deliveryRadius: 7,
        timing: { open: '11:00 AM', close: '11:00 PM' },
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80'
      },
      {
        name: 'Dakshin Kitchen',
        owner: owners[4]._id,
        address: 'Viman Nagar, Pune',
        cuisine: ['South Indian', 'Thalis', 'Fast Food', 'Beverages'],
        rating: 4.8,
        numReviews: 0,
        isApproved: true,
        deliveryRadius: 5,
        timing: { open: '07:00 AM', close: '10:00 PM' },
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&q=80'
      },
      {
        name: 'Gujarati Rasoi',
        owner: owners[5]._id,
        address: 'Baner, Pune',
        cuisine: ['Gujarati', 'Vegetarian', 'Thalis', 'Desserts'],
        rating: 4.5,
        numReviews: 0,
        isApproved: true,
        deliveryRadius: 6,
        timing: { open: '11:00 AM', close: '10:00 PM' },
        image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500&q=80'
      },
      {
        name: 'Tandoori Nights',
        owner: owners[6]._id,
        address: 'Kalyani Nagar, Pune',
        cuisine: ['North Indian', 'Tandoori', 'Mughlai'],
        rating: 3.8,
        numReviews: 0,
        isApproved: false,
        deliveryRadius: 5,
        timing: { open: '12:00 PM', close: '11:00 PM' },
        image: 'https://images.unsplash.com/photo-1585934580916-52b21394b7f1?w=500&q=80'
      },
      {
        name: 'KFC',
        owner: owners[7]._id,
        address: 'Camp, Pune',
        cuisine: ['Burgers', 'American', 'Fast Food', 'Beverages'],
        rating: 4.4,
        numReviews: 0,
        isApproved: true,
        deliveryRadius: 6,
        timing: { open: '11:00 AM', close: '11:00 PM' },
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac5987?w=500&q=80'
      },
      {
        name: 'Hotel Kshatriya Garden',
        owner: owners[8]._id,
        address: 'Chandani Chowk, Kothrud, Pune',
        cuisine: ['Maharashtrian', 'Saoji', 'Thalis', 'North Indian'],
        rating: 4.6,
        numReviews: 0,
        isApproved: false,
        deliveryRadius: 8,
        timing: { open: '12:00 PM', close: '11:30 PM' },
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'
      }
    ]);

    const pizzaRest = restaurants[0];
    const burgerRest = restaurants[1];
    const sahyadriRest = restaurants[2];
    const punjabiRest = restaurants[3];
    const dakshinRest = restaurants[4];
    const gujaratiRest = restaurants[5];
    const tandoorRest = restaurants[6];
    const kfcRest = restaurants[7];
    const kshatriyaRest = restaurants[8];

    // 3. Create Menu Items
    const menuItems = await MenuItem.create([
      {
        restaurant: pizzaRest._id,
        name: 'Margherita Pizza',
        price: 299,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Classic cheese and tomato pizza with fresh basil leaves.'
      },
      {
        restaurant: pizzaRest._id,
        name: 'Spicy Pepperoni Pizza',
        price: 399,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Topped with premium beef pepperoni, mozzarella cheese, and hot jalapeños.'
      },
      {
        restaurant: pizzaRest._id,
        name: 'Farmhouse Special Veg Pizza',
        price: 349,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Loaded with capsicum, crunchy onion, juicy tomatoes, and fresh mushrooms.'
      },
      {
        restaurant: pizzaRest._id,
        name: 'Garlic Breadsticks',
        price: 149,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Baked breadsticks brushed with garlic butter and Italian herbs.'
      },
      {
        restaurant: pizzaRest._id,
        name: 'Chocolate Lava Cake',
        price: 180,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Rich chocolate cake with a warm liquid chocolate center.'
      },
      {
        restaurant: pizzaRest._id,
        name: 'Hot Brownie with Vanilla Ice Cream',
        price: 199,
        category: 'Ice Creams',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Fudgy warm chocolate brownie topped with vanilla ice cream and hot chocolate sauce.'
      },
      {
        restaurant: pizzaRest._id,
        name: 'Double Chocolate Fudge Sundae',
        price: 140,
        category: 'Ice Creams',
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Two scoops of rich chocolate fudge ice cream topped with nuts and whipped cream.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Classic Veg Burger',
        price: 179,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Crispy vegetable patty with lettuce, tomatoes, and chef\'s house mayonnaise.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Double Cheese American Burger',
        price: 249,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Juicy double grilled patty with two melting cheddar slices and caramelized onions.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Grilled Vegetable Club Sandwich',
        price: 159,
        category: 'Sandwiches',
        image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Triple-layer sandwich stuffed with grilled corn, cucumbers, cheese, and pesto mayo.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Crispy Chicken & Bacon Club',
        price: 199,
        category: 'Sandwiches',
        image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Toasted sandwich containing crispy chicken, bacon, fried egg, lettuce, and tomatoes.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Peri-Peri French Fries',
        price: 119,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Golden potato fries tossed with hot and spicy peri-peri dust.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Strawberry Bliss Milkshake',
        price: 129,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Thick creamy milkshake blended with fresh strawberries and strawberry ice cream.'
      },
      {
        restaurant: burgerRest._id,
        name: 'Creamy Cold Coffee with Ice Cream',
        price: 139,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Smooth blended iced coffee served with a scoop of vanilla ice cream.'
      },
      {
        restaurant: sahyadriRest._id,
        name: 'Maharashtrian Special Veg Thali',
        price: 280,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Traditional thali featuring Pithla, Bhakri, Bharli Vangi (brinjal), Solkadhi, Rice, and Puran Poli.'
      },
      {
        restaurant: sahyadriRest._id,
        name: 'Kolhapuri Mutton Thali',
        price: 390,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Fiery Kolhapuri thali with Mutton Sukka, Tambda Rassa (red gravy), Pandhra Rassa (white gravy), Bhakri, and Rice.'
      },
      {
        restaurant: sahyadriRest._id,
        name: 'Special Kolhapuri Misal Pav',
        price: 120,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Sprouting legumes cooked in red fiery broth, topped with onion, lemon, and farsan, served with pav.'
      },
      {
        restaurant: sahyadriRest._id,
        name: 'Solkadhi Drink',
        price: 60,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Traditional refreshing pink digestive drink made from Kokum and fresh coconut milk.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Punjabi Special Veg Thali',
        price: 320,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Rich thali featuring Paneer Butter Masala, Dal Makhani, Sarson Ka Saag, two Makki di Rotis, Rice, and Sweet Lassi.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Tandoori Butter Chicken Thali',
        price: 370,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Includes rich Butter Chicken, Dal Makhani, one Butter Naan, Rice, Raita, and Gulab Jamun.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Amritsari Chole Bhature',
        price: 150,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Spicy Punjabi chickpea curry served with two large fluffy fried flatbreads and pickle.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Paneer Butter Masala (Full)',
        price: 260,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Fresh paneer cubes cooked in a rich, creamy tomato gravy with butter.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Tandoori Butter Naan',
        price: 50,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1658188306155-25e900df56b7?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Freshly baked leavened flatbread brushed generously with butter.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Dal Makhani',
        price: 210,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Creamy black lentils simmered overnight with tomatoes, butter, and cream.'
      },
      {
        restaurant: punjabiRest._id,
        name: 'Hot Gulab Jamun (2 pcs)',
        price: 80,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1605666804764-7b8c62b2b13b?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Warm fried milk-solid dumplings soaked in cardamom sugar syrup.'
      },
      {
        restaurant: dakshinRest._id,
        name: 'Royal South Indian Thali',
        price: 250,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Platter of Steamed Rice, Sambar, Rasam, Kootu, Vegetable Poriyal, Papad, Curd, and Payasam.'
      },
      {
        restaurant: dakshinRest._id,
        name: 'Special Masala Dosa',
        price: 110,
        category: 'South Indian',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Crispy rice crepe stuffed with potato masala, served with coconut chutney and hot sambar.'
      },
      {
        restaurant: dakshinRest._id,
        name: 'Steamed Idli Vada Combo',
        price: 90,
        category: 'South Indian',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Two fluffy steamed idlis and one crispy lentil vada served with chutney.'
      },
      {
        restaurant: dakshinRest._id,
        name: 'Crispy Rava Masala Dosa',
        price: 130,
        category: 'South Indian',
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Thin crispy semolina crepe spiced with ginger and green chillies, folded with potato mash.'
      },
      {
        restaurant: dakshinRest._id,
        name: 'Madras Filter Coffee',
        price: 60,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Traditional hot frothy coffee brewed with chicory-infused hot milk.'
      },
      {
        restaurant: gujaratiRest._id,
        name: 'Gujarati Royal Kathiyawadi Thali',
        price: 300,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Includes Gujarati Kadhi, Sev Tamatar, 3 Rotlis, Khichdi, Dhokla, Shrikhand, and buttermilk.'
      },
      {
        restaurant: gujaratiRest._id,
        name: 'Steamed Nylon Khaman Dhokla',
        price: 90,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Soft spongy steamed chickpea flour cakes tempered with mustard seeds and green chillies.'
      },
      {
        restaurant: gujaratiRest._id,
        name: 'Kesar Pista Shrikhand',
        price: 80,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Thick strained sweet yogurt flavored with saffron, cardamom, and sliced pistachios.'
      },
      {
        restaurant: tandoorRest._id,
        name: 'Tandoori Paneer Tikka',
        price: 269,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Cottage cheese cubes marinated in spiced tandoori yogurt and chargrilled.'
      },
      {
        restaurant: tandoorRest._id,
        name: 'Tandoori Chicken (Half)',
        price: 299,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1585934580916-52b21394b7f1?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Half spring chicken marinated with red tandoori spice paste and roasted in clay oven.'
      },
      {
        restaurant: kfcRest._id,
        name: '4 Pc Hot & Crispy Chicken',
        price: 449,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Signature hot and crispy chicken pieces, juicy and tender.'
      },
      {
        restaurant: kfcRest._id,
        name: 'Chicken Zinger Burger',
        price: 219,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Crispy chicken fillet topped with fresh lettuce and creamy mayonnaise.'
      },
      {
        restaurant: kfcRest._id,
        name: 'Veg Zinger Burger',
        price: 189,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Crispy veg patty topped with fresh lettuce and spicy mayo.'
      },
      {
        restaurant: kfcRest._id,
        name: 'Popcorn Chicken (Medium)',
        price: 199,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Bite-sized chicken popcorn crispies, perfect side snack.'
      },
      {
        restaurant: kfcRest._id,
        name: '10 Pc Chicken Strips',
        price: 369,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Boneless tender chicken strips fried to a crisp.'
      },
      {
        restaurant: kfcRest._id,
        name: 'Fries (Medium)',
        price: 119,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Salted golden potato french fries.'
      },
      {
        restaurant: kfcRest._id,
        name: 'Pepsi Can',
        price: 60,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1629203851020-90d9b3f000b2?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: '330ml chilled carbonated cola.'
      },
      {
        restaurant: kshatriyaRest._id,
        name: 'Saoji Special Veg Thali',
        price: 290,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Authentic Nagpur-style spicy Saoji veg thali with Paneer Tarri, Patodi Rassa, 2 Jowar Bhakris, Rice, and Solkadhi.'
      },
      {
        restaurant: kshatriyaRest._id,
        name: 'Saoji Special Mutton Thali',
        price: 420,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Fiery Saoji Mutton gravy, Mutton Sukka, 2 Jowar Bhakris, spicy Tarri broth, and Steamed Rice.'
      },
      {
        restaurant: kshatriyaRest._id,
        name: 'Saoji Special Chicken Thali',
        price: 360,
        category: 'Thalis',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Spicy Saoji Chicken Rassa, Chicken Sukka, 2 hot Bhakris, Kanda Lemon, and Indrayani Rice.'
      },
      {
        restaurant: kshatriyaRest._id,
        name: 'Saoji Mutton Sukka',
        price: 320,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
        isAvailable: true,
        isVeg: false,
        description: 'Tender mutton cooked in traditional roasted black Saoji spice masala mix.'
      },
      {
        restaurant: kshatriyaRest._id,
        name: 'Saoji Paneer Masala',
        price: 240,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Fresh paneer cubes simmered in thick spicy Saoji black gravy.'
      },
      {
        restaurant: kshatriyaRest._id,
        name: 'Jowar Bhakri (2 Pcs)',
        price: 40,
        category: 'North Indian',
        image: 'https://images.unsplash.com/photo-1658188306155-25e900df56b7?w=500&q=80',
        isAvailable: true,
        isVeg: true,
        description: 'Traditional handmade millet flatbreads cooked on a clay tawa.'
      }
    ]);

    // 4. Create Reviews
    await Review.create([
      {
        customer: customer._id,
        restaurant: pizzaRest._id,
        menuItem: menuItems[0]._id,
        rating: 5,
        comment: 'Absolutely love the Margherita pizza here! Always fresh and hot.'
      }
    ]);

    // 5. Create Previous Orders
    await Order.create([
      {
        customer: customer._id,
        restaurant: pizzaRest._id,
        items: [
          {
            menuItem: menuItems[0]._id,
            name: menuItems[0].name,
            qty: 1,
            price: menuItems[0].price
          },
          {
            menuItem: menuItems[4]._id,
            name: menuItems[4].name,
            qty: 2,
            price: menuItems[4].price
          }
        ],
        totalAmount: 699,
        status: 'Delivered',
        paymentStatus: 'Paid',
        razorpayOrderId: 'order_sim_prev1',
        deliveryAddress: {
          street: customer.addresses[0].street,
          city: customer.addresses[0].city,
          state: customer.addresses[0].state,
          zipCode: customer.addresses[0].zipCode
        },
        statusHistory: [
          { status: 'Placed', timestamp: new Date(Date.now() - 3600000 * 2) },
          { status: 'Accepted', timestamp: new Date(Date.now() - 3600000 * 1.8) },
          { status: 'Preparing', timestamp: new Date(Date.now() - 3600000 * 1.5) },
          { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3600000 * 1) },
          { status: 'Delivered', timestamp: new Date(Date.now() - 3600000 * 0.8) }
        ]
      },
      {
        customer: customer._id,
        restaurant: kfcRest._id,
        items: [
          {
            menuItem: menuItems[menuItems.length - 6]._id,
            name: menuItems[menuItems.length - 6].name,
            qty: 1,
            price: menuItems[menuItems.length - 6].price
          },
          {
            menuItem: menuItems[menuItems.length - 2]._id,
            name: menuItems[menuItems.length - 2].name,
            qty: 1,
            price: menuItems[menuItems.length - 2].price
          }
        ],
        totalAmount: 380,
        status: 'Delivered',
        paymentStatus: 'Paid',
        razorpayOrderId: 'order_sim_prev2',
        deliveryAddress: {
          street: customer.addresses[0].street,
          city: customer.addresses[0].city,
          state: customer.addresses[0].state,
          zipCode: customer.addresses[0].zipCode
        },
        statusHistory: [
          { status: 'Placed', timestamp: new Date(Date.now() - 86400000 * 2 - 3600000 * 2) },
          { status: 'Accepted', timestamp: new Date(Date.now() - 86400000 * 2 - 3600000 * 1.8) },
          { status: 'Preparing', timestamp: new Date(Date.now() - 86400000 * 2 - 3600000 * 1.5) },
          { status: 'Out for Delivery', timestamp: new Date(Date.now() - 86400000 * 2 - 3600000 * 1) },
          { status: 'Delivered', timestamp: new Date(Date.now() - 86400000 * 2 - 3600000 * 0.8) }
        ]
      }
    ]);

    console.log('Database Auto-Seeded successfully.');
  } catch (error) {
    console.error('Auto-seed error:', error);
  }
};
