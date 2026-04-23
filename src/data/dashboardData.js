export const customerOverviewStats = [
  { id: 'labours', labelKey: 'activeLabours', value: '10' },
  { id: 'jobs', labelKey: 'liveJobs', value: '14' },
  { id: 'rating', labelKey: 'avgRating', value: '4.8' },
  { id: 'hires', labelKey: 'hiresToday', value: '06' },
];

export const labourOverviewStats = [
  { id: 'matches', labelKey: 'matchesToday', value: '07' },
  { id: 'views', labelKey: 'profileViews', value: '31' },
  { id: 'completed', labelKey: 'completedJobs', value: '124' },
  { id: 'response', labelKey: 'responseRate', value: '97%' },
];

export const labourFilterOptions = {
  district: ['All', 'Muzaffarpur', 'Motijheel', 'Bela', 'Kalyani', 'Aghoria Bazar'],
  category: ['All', 'Raj Mistri', 'Electrician', 'Painter', 'Plumber', 'Carpenter'],
  availability: ['All', 'Available Today', 'Available Tonight', 'Specific Date'],
  rating: ['All', '4.0+', '4.5+', '4.8+'],
};

export const jobPostOptions = {
  cities: ['Muzaffarpur', 'Motijheel', 'Bela', 'Kalyani', 'Aghoria Bazar'],
  skills: ['Raj Mistri', 'Electrician', 'Painter', 'Plumber', 'Carpenter'],
  levels: ['Helper', 'Skilled', 'Expert'],
  timings: ['Today', 'Tomorrow', 'Specific Date'],
};

export const availableLabours = [
  {
    id: 'labour-1',
    name: 'Raju Kumar',
    primarySkill: 'Raj Mistri',
    skills: ['Raj Mistri', 'Brickwork', 'Tiles'],
    rating: 4.9,
    reviews: 82,
    distance: '1.2 km',
    location: 'Motijheel, Muzaffarpur',
    availability: 'Available Today',
    photoLabel: 'RK',
  },
  {
    id: 'labour-2',
    name: 'Sonu Paswan',
    primarySkill: 'Electrician',
    skills: ['Electrician', 'Wiring', 'Repair'],
    rating: 4.8,
    reviews: 59,
    distance: '2.1 km',
    location: 'Bela, Muzaffarpur',
    availability: 'Available Tonight',
    photoLabel: 'SP',
  },
  {
    id: 'labour-3',
    name: 'Mithilesh Sah',
    primarySkill: 'Painter',
    skills: ['Painter', 'Texture', 'Putty'],
    rating: 4.7,
    reviews: 47,
    distance: '1.8 km',
    location: 'Kalyani, Muzaffarpur',
    availability: 'Available Today',
    photoLabel: 'MS',
  },
  {
    id: 'labour-4',
    name: 'Guddu Sharma',
    primarySkill: 'Carpenter',
    skills: ['Carpenter', 'Furniture', 'Wood Repair'],
    rating: 4.6,
    reviews: 33,
    distance: '3.4 km',
    location: 'Aghoria Bazar, Muzaffarpur',
    availability: 'Specific Date',
    photoLabel: 'GS',
  },
  {
    id: 'labour-5',
    name: 'Chandan Rai',
    primarySkill: 'Plumber',
    skills: ['Plumber', 'Pipeline', 'Motor Fitting'],
    rating: 4.8,
    reviews: 64,
    distance: '2.8 km',
    location: 'Bela, Muzaffarpur',
    availability: 'Available Today',
    photoLabel: 'CR',
  },
  {
    id: 'labour-6',
    name: 'Pappu Ram',
    primarySkill: 'Raj Mistri',
    skills: ['Raj Mistri', 'Roof Casting', 'Centering'],
    rating: 4.5,
    reviews: 38,
    distance: '4.0 km',
    location: 'Muzaffarpur',
    availability: 'Available Tonight',
    photoLabel: 'PR',
  },
  {
    id: 'labour-7',
    name: 'Aslam Khan',
    primarySkill: 'Electrician',
    skills: ['Electrician', 'Panel Work', 'Installation'],
    rating: 4.9,
    reviews: 71,
    distance: '2.0 km',
    location: 'Motijheel, Muzaffarpur',
    availability: 'Available Today',
    photoLabel: 'AK',
  },
  {
    id: 'labour-8',
    name: 'Santosh Das',
    primarySkill: 'Painter',
    skills: ['Painter', 'Polish', 'Finishing'],
    rating: 4.4,
    reviews: 25,
    distance: '5.1 km',
    location: 'Kalyani, Muzaffarpur',
    availability: 'Specific Date',
    photoLabel: 'SD',
  },
  {
    id: 'labour-9',
    name: 'Neeraj Kumar',
    primarySkill: 'Carpenter',
    skills: ['Carpenter', 'Kitchen Work', 'Wardrobe'],
    rating: 4.8,
    reviews: 43,
    distance: '1.4 km',
    location: 'Muzaffarpur',
    availability: 'Available Today',
    photoLabel: 'NK',
  },
  {
    id: 'labour-10',
    name: 'Arvind Rajak',
    primarySkill: 'Plumber',
    skills: ['Plumber', 'Bathroom Fitting', 'Leak Repair'],
    rating: 4.7,
    reviews: 54,
    distance: '2.9 km',
    location: 'Bela, Muzaffarpur',
    availability: 'Available Tonight',
    photoLabel: 'AR',
  },
];

export const popularSkills = ['Raj Mistri', 'Electrician', 'Painter', 'Plumber', 'Carpenter'];

export const initialPostedJobs = [
  {
    id: 'post-1',
    title: 'Raj Mistri for terrace wall repair',
    location: 'Motijheel, Muzaffarpur',
    posted: '20 mins ago',
    applicants: 3,
    distance: '1.1 km',
    description: '2 घंटा के छोट प्लास्टर अउर फिनिशिंग के काम बा।',
    skill: 'Raj Mistri',
    skillLevel: 'Skilled',
    time: 'Today',
  },
  {
    id: 'post-2',
    title: 'Tiles fitting for 1 room kitchen',
    location: 'Bela, Muzaffarpur',
    posted: '1 hour ago',
    applicants: 5,
    distance: '2.4 km',
    description: 'किचन एरिया में टाइल्स फिटिंग अउर एज फिनिशिंग चाहीं।',
    skill: 'Raj Mistri',
    skillLevel: 'Expert',
    time: 'Tomorrow',
  },
];

export const labourProfile = {
  name: 'Abhimanyu Kumar',
  title: 'Raj Mistri and Finishing Specialist',
  location: 'Muzaffarpur, Bihar',
  phone: '+91 9262980734',
  photoLabel: 'AK',
  rating: 4.8,
  reviews: 86,
  skills: ['Raj Mistri', 'Tiles', 'Plaster', 'Wall Finishing'],
  certifications: ['Safety Training', 'Site Masonry', 'Concrete Basics'],
  preferences: ['Available Today', 'Available Tonight', 'Motijheel and Bela Preferred'],
};

export const labourWorkHistory = [
  { id: 'h1', title: 'House plaster work', rating: '4.9', customer: 'Ravi Traders' },
  { id: 'h2', title: 'Boundary wall repair', rating: '4.7', customer: 'Soni Hardware' },
  { id: 'h3', title: 'Floor tile setting', rating: '4.8', customer: 'Kumar Residency' },
];

export const labourReviews = [
  { id: 'r1', text: 'समय पर आके काम बड़ा सफाई से कैलस।', author: 'Pankaj Singh' },
  { id: 'r2', text: 'बात-चीत ठीक रहल अउर फिनिशिंग बहुत बढ़िया रहल।', author: 'Aman Verma' },
];

export const customerMessages = [
  { id: 'c1', name: 'Raju Kumar', text: 'काम के लोकेशन कन्फर्म कर दीं जी।', status: 'Online' },
  { id: 'c2', name: 'Aslam Khan', text: 'काल्हु बिहान से available बानी।', status: 'Nearby' },
];

export const labourMessages = [
  { id: 'l1', name: 'Kumar Residency', text: 'काल्हु 10 बजे ले साइट पर पहुँच जाईं।', status: 'Customer' },
  { id: 'l2', name: 'Ravi Traders', text: 'रेट अउर टाइमिंग कन्फर्म करे के बा।', status: 'Customer' },
];
