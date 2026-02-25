export default function HelpSection() {
  return (
    <section style={{ backgroundColor: 'rgb(246, 246, 246)', borderTop: '1px solid rgb(211, 211, 211)', padding: '32px 0', color: 'rgb(0, 32, 91)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '448px', margin: '0 auto', padding: '0 16px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 500, lineHeight: '36px', color: 'rgb(0, 32, 91)', margin: 0 }}>Need help?</h3>
        <form style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', width: '100%' }}>
          <div style={{ width: '360px' }}>
            <div>
              <div style={{ backgroundColor: 'rgb(255, 255, 255)', width: '360px', height: '56px', position: 'relative', borderRadius: '12px 0 0 12px', border: '1px solid rgb(211, 211, 211)' }}>
                <input type="text" style={{ width: '358px', height: '54px', border: 'none', outline: 'none', padding: '16px', fontSize: '16px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '12px 0 0 12px' }} />
                <label style={{ position: 'absolute', top: '16px', left: '16px', color: 'rgb(117, 117, 117)', fontSize: '16px', pointerEvents: 'none' }}>Search for answers</label>
              </div>
            </div>
          </div>
          <button type="submit" style={{ backgroundColor: 'rgb(0, 51, 160)', color: '#fff', width: '56px', height: '56px', border: 'none', borderRadius: '0 12px 12px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.707 20.293a1 1 0 0 1-1.414 1.414l-5.42-5.42a1 1 0 0 1 1.414-1.414l5.42 5.42z" />
              <path d="M16.288 16.286A9.54 9.54 0 1 1 2.797 2.794a9.54 9.54 0 0 1 13.491 13.492zm-1.414-1.414A7.54 7.54 0 1 0 4.211 4.208a7.54 7.54 0 0 0 10.663 10.664z" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
