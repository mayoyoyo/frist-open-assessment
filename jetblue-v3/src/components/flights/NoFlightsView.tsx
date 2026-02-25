/**
 * NoFlightsView -- shown when no flights match the search criteria.
 * Built from canonical SETTLED state 23 (StateMap group: "no-flights-found").
 *
 * Structure from PropertySpec state 23:
 *   Full-width page with airplane icon, "No flights have been found..." message,
 *   suggestion text, and embedded booker form (From/To/Depart/Return/Promo/Search).
 *   Footer section with "Popular Help Topics", "Privacy Policy", etc.
 *
 * Annotations: none from InteractionSpec (this is an error/empty state)
 */
import { useSyncExternalStore } from 'react';
import { getState, setState, subscribe, navigateToStep } from '../../main';

export default function NoFlightsView() {
  const state = useSyncExternalStore(subscribe, getState);

  const handleSearch = () => {
    navigateToStep('results');
  };

  return (
    <div style={{ display: 'inline' }}>
      <div style={{ width: '1461px' }}>
        {/* Background pattern area */}
        <div style={{
          width: '1461px',
          height: '200px',
          backgroundColor: 'rgb(0, 32, 91)',
          backgroundImage: 'radial-gradient(circle, rgba(0,114,206,0.4) 20%, transparent 20%)',
          backgroundSize: '120px 120px',
        }} />

        {/* Main content card */}
        <div style={{
          width: '936px',
          margin: '-80px auto 0',
          backgroundColor: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          padding: '48px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Airplane icon */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M42 26v-4l-16-10V5a3 3 0 0 0-6 0v7L4 22v4l16-5v11l-4 3v3l7-2 7 2v-3l-4-3V21l16 5z" fill="rgb(141, 200, 232)" stroke="rgb(0, 32, 91)" strokeWidth="1.5" transform="translate(10,10) scale(1.2)" />
            </svg>
          </div>

          {/* Message */}
          <h2 style={{
            textAlign: 'center',
            fontSize: '28px',
            fontWeight: 400,
            lineHeight: '36px',
            color: 'rgb(0, 0, 0)',
            margin: '0 0 16px 0',
          }}>
            No flights have been found for your search criteria.
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgb(66, 66, 66)',
            margin: '0 0 32px 0',
          }}>
            Try searching different dates or destinations.
          </p>

          {/* Embedded booking form */}
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Trip type / travelers row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '16px' }}>
              <select
                value={state.tripType}
                onChange={e => setState({ tripType: e.target.value })}
                style={{
                  fontSize: '16px',
                  color: 'rgb(0, 51, 160)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <option value="roundtrip">Roundtrip</option>
                <option value="oneway">One-way</option>
                <option value="multicity">Multi-city</option>
              </select>
              <select
                value={state.passengers}
                onChange={e => setState({ passengers: Number(e.target.value) })}
                style={{
                  fontSize: '16px',
                  color: 'rgb(0, 51, 160)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: 'auto' }}>
                <input type="checkbox" checked={state.usePoints} onChange={e => setState({ usePoints: e.target.checked })} />
                <span style={{ fontSize: '16px', color: 'rgb(0, 0, 0)' }}>Use TrueBlue points</span>
              </label>
            </div>

            {/* Input fields row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* From */}
              <div style={{ flex: 1, border: '1px solid rgb(158, 158, 158)', borderRadius: '4px', height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
                <label style={{ fontSize: '12px', color: 'rgb(117, 117, 117)' }}>From</label>
                <input
                  type="text"
                  value={state.origin}
                  onChange={e => setState({ origin: e.target.value })}
                  style={{ border: 'none', fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'inherit', padding: 0 }}
                />
              </div>
              {/* Swap button */}
              <button
                type="button"
                onClick={() => setState({ origin: state.destination, destination: state.origin })}
                style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '16px' }}
              >
                &#8644;
              </button>
              {/* To */}
              <div style={{ flex: 1, border: '1px solid rgb(158, 158, 158)', borderRadius: '4px', height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
                <label style={{ fontSize: '12px', color: 'rgb(117, 117, 117)' }}>To</label>
                <input
                  type="text"
                  value={state.destination}
                  onChange={e => setState({ destination: e.target.value })}
                  style={{ border: 'none', fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'inherit', padding: 0 }}
                />
              </div>
              {/* Depart */}
              <div style={{ width: '120px', border: '1px solid rgb(158, 158, 158)', borderRadius: '4px', height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
                <label style={{ fontSize: '12px', color: 'rgb(117, 117, 117)' }}>Depart</label>
                <input
                  type="text"
                  value={state.departDate}
                  onChange={e => setState({ departDate: e.target.value })}
                  style={{ border: 'none', fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'inherit', padding: 0 }}
                />
              </div>
              {/* Return */}
              <div style={{ width: '120px', border: '1px solid rgb(158, 158, 158)', borderRadius: '4px', height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
                <label style={{ fontSize: '12px', color: 'rgb(117, 117, 117)' }}>Return</label>
                <input
                  type="text"
                  value={state.returnDate}
                  onChange={e => setState({ returnDate: e.target.value })}
                  style={{ border: 'none', fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'inherit', padding: 0 }}
                />
              </div>
              {/* Promo code */}
              <div style={{ width: '100px', border: '1px solid rgb(158, 158, 158)', borderRadius: '4px', height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
                <input
                  type="text"
                  value={state.promoCode}
                  onChange={e => setState({ promoCode: e.target.value })}
                  placeholder="Promo code"
                  style={{ border: 'none', fontSize: '16px', outline: 'none', width: '100%', fontFamily: 'inherit', padding: 0 }}
                />
              </div>
              {/* Search button */}
              <button
                type="button"
                onClick={handleSearch}
                style={{
                  backgroundColor: 'rgb(0, 51, 160)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '14px 24px',
                  height: '56px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                Search flights
              </button>
            </div>
          </div>
        </div>

        {/* Footer area */}
        <div style={{ width: '936px', margin: '32px auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgb(224, 224, 224)', paddingTop: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Popular Help Topics</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ fontSize: '12px', color: 'rgb(0, 51, 160)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ fontSize: '12px', color: 'rgb(0, 51, 160)', textDecoration: 'none' }}>Submit feedback</a>
              <span style={{ fontSize: '12px', color: 'rgb(66, 66, 66)' }}>English</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
