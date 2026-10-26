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
// Kitty-theme candy tones, checked against CHART_SURFACE. Some light slots sit
// below 3:1 contrast and dark slot 5↔6 is in the 6–8 CVD floor band, so the
// ranked list under the doughnut (swatch + name + amount) must always render.
export const SERIES_COLORS = {
  light: ['#e8789a', '#4b9bd6', '#e3a21a', '#8e74d4', '#1f8c72', '#f0905c', '#3f7fc0', '#d4565c'],
  dark: ['#d4668a', '#3f8ccc', '#b67f10', '#8268cc', '#007d5c', '#d6773f', '#3a72b5', '#c94f55']
};

export const CHART_SURFACE = { light: '#ffffff', dark: '#2b231f' };
