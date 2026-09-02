// Keep in sync with TAXONOMY in apps-script/Code.gs.
export const TAXONOMY = {
  'Housing': ['Rent/mortgage', 'Property tax', 'HOA fees', 'Maintenance/repair', 'Home supplies', 'Furniture/appliances'],
  'Utilities': ['Electricity', 'Water/gas', 'Internet', 'Mobile phone plan'],
  'Eating': ['Groceries/supermarket', 'Restaurant', 'Coffee/bar/drinks', 'Bakery', 'Takeout/delivery'],
  'Transportation': ['Car payment', 'Fuel/EV charging', 'Public transit', 'Rideshare/taxi', 'Parking/tolls', 'Expressway fees', 'Car registration', 'Car maintenance', 'Car insurance'],
  'Pet': ['Pet food', 'Vet/medical', 'Grooming', 'Toys/supplies'],
  'Kids': ['Childcare/daycare', 'School tuition/fees', 'Kids clothing', 'Toys/activities', 'Kids health'],
  'Clothing & Personal Care': ['Clothes/shoes', 'Haircut/salon', 'Personal care products'],
  'Health & Medical': ['Doctor/dental', 'Pharmacy/medicine', 'Health insurance', 'Gym/fitness'],
  'Subscriptions': ['Streaming', 'Software/apps', 'Memberships'],
  'Shopping': ['Electronics', 'Home decor', 'General merchandise'],
  'Entertainment': ['Movie/event tickets', 'Hobbies', 'Vacation'],
  'Education': ['Courses', 'Books', 'Certifications'],
  'Gifts & Donations': ['Gifts', 'Charity/donations'],
  'Financial': ['Bank fees', 'Credit card fees', 'Life insurance', 'Taxes'],
  'Other': ['Uncategorized']
};

export const TYPES = Object.keys(TAXONOMY);

// Validated categorical slots (adjacent-pair safe in this order, both modes).
// Charts show at most 8 series: top 7 + "Other", colored in this slot order.
export const SERIES_COLORS = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']
};

export const CHART_SURFACE = { light: '#fcfcfb', dark: '#1a1a19' };
