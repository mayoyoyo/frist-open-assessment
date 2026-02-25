/**
 * Flights page -- /booking/flights (and per-step debug routes)
 *
 * This is a mega-route that covers the entire checkout flow:
 *   results -> cart -> signin -> traveler -> seats -> extras
 *
 * All steps share:
 *   body -> N*div[P] wrappers -> jb-app(inline) -> [div, jb-uk-covid-alert, div#app-container-div[P], jb-footer[P]]
 *   -> trailing divs + imgs
 *
 * Inside div#app-container-div, different wrapper components render based on step:
 *   - results: cb-flights [P]
 *   - cart: cb-cart [P]
 *   - signin/traveler/extras: jb-checkout [P]
 *   - seats: jb-seat-selection [P]
 */
import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { getState, subscribe, setState, stepFromPath } from '../main';
import FlightsFooter from '../components/FlightsFooter';
import FlightResultsView from '../components/flights/FlightResultsView';
import NoFlightsView from '../components/flights/NoFlightsView';
import ShoppingCartView from '../components/flights/ShoppingCartView';
import CheckoutSignIn from '../components/flights/CheckoutSignIn';
import TravelerForm from '../components/flights/TravelerForm';
import SeatMapView from '../components/flights/SeatMapView';
import ExtrasView from '../components/flights/ExtrasView';

/**
 * Simplified checkout header -- dark navy bar with logo + Sign In.
 * Used by checkout steps (signin, traveler, seats, extras).
 */
function CheckoutHeader() {
  return (
    <header
      style={{
        backgroundColor: 'rgb(0, 32, 91)',
        width: '100%',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: '1024px',
          width: '1024px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: 'block', height: '32px', cursor: 'pointer' }}>
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='32' viewBox='0 0 90 32'%3E%3Ctext x='2' y='24' font-size='20' font-family='Arial' fill='white' font-weight='bold'%3EjetBlue%3C/text%3E%3C/svg%3E"
            alt="JetBlue"
            style={{ display: 'block', height: '32px', maxWidth: '100%' }}
          />
        </a>

        {/* Booking summary pill */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: 'white',
            lineHeight: '20px',
          }}
        >
          <span>XFL</span>
          <span style={{ fontSize: '12px' }}>&#8652;</span>
          <span>JFK</span>
          <span style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <span>Feb 18 - Feb 20</span>
          <span style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <span>1 Traveler</span>
          <span style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Sign in button */}
        <span style={{ display: 'flex', alignItems: 'center', height: '56px', gap: '8px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '56px',
              padding: '0 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '16px',
              lineHeight: '24px',
            }}
          >
            <span style={{ display: 'block', width: '32px', height: '32px' }}>
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='12' r='5' fill='none' stroke='white' stroke-width='1.5'/%3E%3Cpath d='M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E"
                alt=""
                style={{ width: '32px', height: '32px', display: 'block' }}
              />
            </span>
            <span style={{ display: 'block', color: '#fff', fontSize: '16px', lineHeight: '24px' }}>
              Sign In
            </span>
          </button>
        </span>
      </div>
    </header>
  );
}

/**
 * Shared outer shell for all flights states.
 * Renders the prunable wrapper divs, jb-app, and trailing elements.
 */
function FlightsShell({ children, isCheckout }: { children: React.ReactNode; isCheckout?: boolean }) {
  return (
    <>
      {/* 5 prunable wrapper divs (body children, before jb-app) */}
      <div style={{ width: '1461px', height: '0px' }}><div style={{ width: '1461px', height: '0px' }} /></div>
      <div style={{ width: '1461px', height: '0px' }}><div style={{ width: '1461px', height: '0px' }} /></div>
      <div style={{ width: '1461px', height: '0px' }}><div style={{ width: '1461px', height: '0px' }} /></div>
      <div style={{ width: '1461px', height: '0px' }}><div style={{ width: '1461px', height: '0px' }} /></div>
      <div style={{ width: '1461px', height: '0px' }}><div style={{ width: '1461px', height: '0px' }} /></div>
      {/* jb-app (display: inline) */}
      <div style={{ display: 'inline' }}>
        <div style={{ width: '1461px', height: '0px' }} />
        {/* jb-uk-covid-alert */}
        <div style={{ width: '634.094px', height: '0px' }} />
        {/* Checkout header for checkout steps */}
        {isCheckout && <CheckoutHeader />}
        {/* div#app-container-div [P] -- step content goes here */}
        <div style={{
          width: '1461px',
          backgroundColor: isCheckout ? 'rgb(242, 242, 242)' : 'rgb(247, 247, 247)',
          minHeight: isCheckout ? '590px' : undefined,
        }}>
          {children}
        </div>
        {/* jb-footer */}
        <FlightsFooter />
      </div>
      {/* Trailing elements */}
      <div style={{ width: '1461px', height: '0px' }} /> {/* consent_blackbar */}
      <div style={{ width: '1461px', height: '0px' }} /> {/* ZN_ */}
      <div style={{ width: '400px', height: '387px' }} /> {/* QSIFeedbackButton */}
      <img src="" alt="" style={{ display: 'inline', width: '1px', height: '1px' }} />
      <img src="" alt="" style={{ width: '1px', height: '1px' }} />
      <img src="" alt="" style={{ width: '1px', height: '1px' }} />
      <img src="" alt="" style={{ display: 'inline', width: '1px', height: '1px' }} />
    </>
  );
}

export default function Flights() {
  const state = useSyncExternalStore(subscribe, getState);
  const location = useLocation();

  // On mount or when URL changes, sync the step from the URL to state
  useEffect(() => {
    const stepFromUrl = stepFromPath(location.pathname);
    if (stepFromUrl && stepFromUrl !== state.step) {
      setState({ step: stepFromUrl });
    }
  }, [location.pathname]);

  const renderStep = () => {
    switch (state.step) {
      case 'results':
        return <FlightResultsView />;
      case 'no-flights':
        return <NoFlightsView />;
      case 'cart':
        return <ShoppingCartView />;
      case 'signin':
        return <CheckoutSignIn />;
      case 'traveler':
        return <TravelerForm />;
      case 'seats':
        return <SeatMapView />;
      case 'extras':
        return <ExtrasView />;
      default:
        return <FlightResultsView />;
    }
  };

  const isCheckout = ['cart', 'signin', 'traveler', 'seats', 'extras'].includes(state.step);

  return (
    <FlightsShell isCheckout={isCheckout}>
      {renderStep()}
    </FlightsShell>
  );
}
