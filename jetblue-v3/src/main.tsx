import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// ─── State Store ────────────────────────────────────────────

export interface BookingState {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  tripType: string;
  usePoints: boolean;
  promoCode: string;
  step: 'search' | 'results' | 'no-flights' | 'cart' | 'signin' | 'traveler' | 'seats' | 'extras';
  selectedOutboundFlight: any | null;
  selectedReturnFlight: any | null;
  expandedFlightIndex: number | null;
  selectedOutboundFare: string | null;
  selectedReturnFare: string | null;
  cartTotal: number;
  farePrice: number;
  taxesAndFees: number;
  traveler: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    gender: string;
    birthMonth: string;
    birthDay: string;
    birthYear: string;
    phone: string;
    address: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  outboundSeat: string | null;
  returnSeat: string | null;
  currentSeatLeg: 'outbound' | 'return';
  activeFilters: string[];
  sortBy: string;
}

const initialState: BookingState = {
  origin: 'SEA',
  destination: 'JFK',
  departDate: 'Wed, Feb 18',
  returnDate: 'Fri, Feb 20',
  passengers: 1,
  tripType: 'roundtrip',
  usePoints: false,
  promoCode: '',
  step: 'search',
  selectedOutboundFlight: null,
  selectedReturnFlight: null,
  expandedFlightIndex: null,
  selectedOutboundFare: null,
  selectedReturnFare: null,
  cartTotal: 0,
  farePrice: 0,
  taxesAndFees: 0,
  traveler: {
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    gender: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    phone: '',
    address: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  },
  outboundSeat: null,
  returnSeat: null,
  currentSeatLeg: 'outbound',
  activeFilters: [],
  sortBy: 'best_match',
};

let _state: BookingState = { ...initialState };
let _listeners: Array<() => void> = [];

export function getState(): BookingState {
  return _state;
}

export function setState(partial: Partial<BookingState>) {
  _state = { ..._state, ...partial };
  _listeners.forEach(fn => fn());
}

export function setTravelerField(field: string, value: string) {
  _state = {
    ..._state,
    traveler: { ..._state.traveler, [field]: value },
  };
  _listeners.forEach(fn => fn());
}

export function resetState() {
  _state = { ...initialState, traveler: { ...initialState.traveler } };
  _listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

// ─── Step ↔ URL Routing ─────────────────────────────────────

export type Step = BookingState['step'];

/** Map step names to URL paths */
const stepToPath: Record<string, string> = {
  results: '/flights',
  'no-flights': '/flights',
  cart: '/checkout',
  signin: '/signin',
  traveler: '/info',
  seats: '/seats',
  extras: '/extras',
};

/** Map URL paths back to step names */
const pathToStep: Record<string, Step> = {
  '/flights': 'results',
  '/checkout': 'cart',
  '/signin': 'signin',
  '/info': 'traveler',
  '/seats': 'seats',
  '/extras': 'extras',
};

/** Derive step from the current URL pathname. Returns null if not a step route. */
export function stepFromPath(pathname: string): Step | null {
  return pathToStep[pathname] ?? null;
}

/** Get the URL path for a given step. Returns null for steps without a dedicated route. */
export function pathForStep(step: Step): string | null {
  return stepToPath[step] ?? null;
}

/**
 * A React-Router-aware navigate function. Components set this via setRouterNavigate()
 * so that navigateToStep() can push URL changes through React Router instead of
 * using raw history.pushState (which React Router does not track).
 */
let _routerNavigate: ((path: string) => void) | null = null;

export function setRouterNavigate(fn: (path: string) => void) {
  _routerNavigate = fn;
}

/**
 * Navigate to a step: updates both the state store AND the browser URL.
 * Use this instead of raw setState({ step: ... }) when changing steps.
 */
export function navigateToStep(step: Step, extraState?: Partial<BookingState>) {
  setState({ ...extraState, step });
  const path = pathForStep(step);
  if (path && _routerNavigate) {
    _routerNavigate(path);
  }
}

// ─── Window APIs ────────────────────────────────────────────

const annotations = [
  { id: "ann-00", label: "vacation_cross_sell", category: "UI_TOGGLE", route: "home" },
  { id: "ann-01", label: "flight_panel_departure", category: "UI_TOGGLE", route: "home" },
  { id: "ann-02", label: "promo_terms", category: "OTHER", route: "home" },
  { id: "ann-03", label: "bundle_price_select_home", category: "FARE_SELECT", route: "home" },
  { id: "ann-04", label: "flight_filters", category: "FILTER", route: "home" },
  { id: "ann-05", label: "flight_stops_nav", category: "NAVIGATION", route: "home" },
  { id: "ann-06", label: "flight_duration_nav", category: "NAVIGATION", route: "home" },
  { id: "ann-07", label: "flight_timeline_nav", category: "NAVIGATION", route: "home" },
  { id: "ann-08", label: "filter_chip_clear", category: "BUTTON_ACTION", route: "home" },
  { id: "ann-09", label: "flight_result_expand", category: "UI_TOGGLE", route: "flights-search-1" },
  { id: "ann-10", label: "modify_search_origin", category: "NAVIGATION", route: "flights-search-1" },
  { id: "ann-11", label: "airline_details", category: "NAVIGATION", route: "flights-search-1" },
  { id: "ann-12", label: "hidden_form_submit", category: "NAVIGATION", route: "flights-search-1" },
  { id: "ann-13", label: "nonstop_filter", category: "NAVIGATION", route: "flights-search-1" },
  { id: "ann-14", label: "fare_card_select", category: "FARE_SELECT", route: "flights-search-1" },
  { id: "ann-15", label: "fare_tile_select_1", category: "FARE_SELECT", route: "flights-search-1" },
  { id: "ann-16", label: "bundle_price_select_results", category: "FARE_SELECT", route: "flights-search-1" },
  { id: "ann-17", label: "fare_tile_select_2", category: "FARE_SELECT", route: "flights-search-1" },
  { id: "ann-18", label: "next_traveler_details", category: "BUTTON_ACTION", route: "flights-search-1" },
  { id: "ann-19", label: "continue_as_guest", category: "BUTTON_ACTION", route: "flights-search-1" },
  { id: "ann-20", label: "first_name_input", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-21", label: "title_dropdown_open", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-22", label: "title_select_ms", category: "DROPDOWN_SELECT", route: "flights-search-1" },
  { id: "ann-23", label: "email_input", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-24", label: "gender_dropdown_open", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-25", label: "gender_select_female", category: "DROPDOWN_SELECT", route: "flights-search-1" },
  { id: "ann-26", label: "birth_month_dropdown_open", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-27", label: "birth_month_select_mar", category: "DROPDOWN_SELECT", route: "flights-search-1" },
  { id: "ann-28", label: "birth_day_dropdown_open", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-29", label: "birth_day_select_2", category: "DROPDOWN_SELECT", route: "flights-search-1" },
  { id: "ann-30", label: "birth_year_dropdown_open", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-31", label: "birth_year_select_1992", category: "DROPDOWN_SELECT", route: "flights-search-1" },
  { id: "ann-32", label: "next_seats_extras", category: "BUTTON_ACTION", route: "flights-search-1" },
  { id: "ann-33", label: "address_autocomplete_input", category: "FORM_INPUT", route: "flights-search-1" },
  { id: "ann-34", label: "address_autocomplete_select", category: "DROPDOWN_SELECT", route: "flights-search-1" },
  { id: "ann-35", label: "next_seats_extras_2", category: "BUTTON_ACTION", route: "flights-search-1" },
  { id: "ann-36", label: "seat_select_1a", category: "SEAT_SELECT", route: "flights-search-1" },
  { id: "ann-37", label: "next_flight_jfk_pbi", category: "BUTTON_ACTION", route: "flights-search-1" },
  { id: "ann-38", label: "seat_select_2e_disabled", category: "SEAT_SELECT", route: "flights-search-1" },
  { id: "ann-39", label: "next_select_extras", category: "BUTTON_ACTION", route: "flights-search-1" },
];

function getAnnotationElements() {
  return annotations.map(ann => {
    const el = document.querySelector(`[data-ann="${ann.id}"]`);
    const bbox = el ? (() => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })() : { x: 0, y: 0, width: 0, height: 0 };
    return { ...ann, bbox };
  });
}

(window as any).__annotations__ = () => getAnnotationElements();
(window as any).__state__ = () => getState();
(window as any).__setState__ = (newState: Partial<BookingState>) => {
  if (newState.step) {
    navigateToStep(newState.step, newState);
  } else {
    setState(newState);
  }
};
(window as any).__reset__ = () => resetState();
(window as any).__meta__ = () => ({
  site: 'jetblue.com',
  clone: 'jetblue-v3',
  routes: ['/', '/home', '/flights', '/checkout', '/signin', '/info', '/seats', '/extras'],
  currentRoute: window.location.pathname,
  stateSchemaGroups: ['bookingSearch', 'miniBooker', 'travelerInfo', 'seatSelection', 'fareSelection'],
});

// ─── Render ─────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
