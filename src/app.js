/**
 * Entry point
 */

import 'babel/browser-polyfill'; // ES6 features polyfill
import 'bootstrap/js/bootstrap'; // Third party library for UI
import api from 'backend/response.json!'; // backend API
import appView from './app.html!text'; // app view HTML
import TripSelector from './trip-selector/trip-selector';

console.log('JSON response:', api);

// sets the view of the app
const app = document.getElementById('app');
app.innerHTML = appView;

// instantiates the trip selector widget
const tripSelector = new TripSelector(document.getElementById('trip-selector'), api);
