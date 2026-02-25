/**
 * TopBar -- the 10-element bar above the main header.
 * Structure: div > 3x (a > div > img)
 * Total element count: 10 (1 div + 3*a + 3*div + 3*img)
 */
export default function TopBar() {
  return (
    <div
      className="flex items-center"
      style={{
        backgroundColor: 'rgb(246, 246, 246)',
        borderBottom: '1px solid rgb(211, 211, 211)',
        width: '100%',
        height: '41px',
        padding: '0 24px',
      }}
    >
      <a href="#" className="flex items-center" style={{ height: '40px', cursor: 'pointer', textDecoration: 'none', marginRight: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/img-0.svg" alt="" style={{ height: '18px', width: '31px' }} />
        </div>
      </a>
      <a href="#" className="flex items-center" style={{ height: '40px', cursor: 'pointer', textDecoration: 'none', marginRight: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/img-1.svg" alt="" style={{ height: '18px', width: '41px' }} />
        </div>
      </a>
      <a href="#" className="flex items-center" style={{ height: '40px', cursor: 'pointer', textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/img-2.svg" alt="" style={{ height: '18px', width: '228px', maxHeight: '18px' }} />
        </div>
      </a>
    </div>
  );
}
