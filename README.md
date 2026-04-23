# Bihar Labor Management App

React Native app with:

- separate customer and labour login/signup flow
- env-based API service layer
- customer home with nearby labor discovery
- labour dashboard with profile, skills, ratings, and job requests
- Muzaffarpur-focused search and filters
- Hindi, Bhojpuri, and English support

## Clean structure

- `app/index.js` app entry
- `src/app/RootApp.js` top-level flow controller
- `src/screens/AuthScreen.js` login and signup screen
- `src/screens/DashboardScreen.js` customer and labour dashboards
- `src/hooks/useAuthFlow.js` auth logic
- `src/services/http.js` reusable API helper
- `src/services/authService.js` login/signup API calls
- `src/config/env.js` single API URL config
- `src/components/*` reusable UI
- `src/data/dashboardData.js` Muzaffarpur labor, profile, and job data
- `src/utils/filterJobs.js` labor filtering logic

## Current app flow

### Customer

- login or signup as `Customer`
- see 10 nearby labours
- filter by skill, location, availability, and rating
- view labor profile summary
- use job posting card

### Labour

- login or signup as `Labour`
- open labour dashboard
- view profile, skills, preferences, ratings, and work history
- see nearby job requests
- prepare for photo/profile update flow

## APIs already connected

### Signup

`POST /auth/signup`

Body sent by app:

```json
{
  "name": "abhimanyu kumar",
  "email": "abhimanyu2021@gmail.com",
  "phone": "9262980734",
  "password": "Abhi349#@@@#737"
}
```

### Login

`POST /auth/login`

Body sent by app:

```json
{
  "email": "abhi@gmail3.com",
  "password": "Abhi@123"
}
```

## Step by step for beginner

1. Open terminal in `labor-app`
2. Run `npm install`
3. Create `.env`
4. Copy from `.env.example`
5. Put your backend URL in `.env`

Example:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

6. Start the app:

```bash
npx expo start
```

7. Open with Expo Go or emulator

## Important for real phone

If you test on a real Android phone, `localhost` will not work.

Use your computer IP like:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api
```

## Useful commands

```bash
npx expo start
npm run android
npm run web
npm run lint
```

## Important note

Right now:

- auth APIs are connected
- customer/labour dashboards use demo UI data
- role is selected in frontend and stored in session

If your backend later provides separate customer and labour auth/profile APIs, connect them in:

- `src/services/authService.js`
- `src/hooks/useAuthFlow.js`
- `src/data/dashboardData.js` can be replaced with real API data

## Next upgrades

- save JWT token in AsyncStorage
- fetch available labour list from backend
- add real customer job posting API
- add labour profile update API
- add ratings and review submission API
- add image upload for labour profile photo
- add geolocation-based nearby labor search
