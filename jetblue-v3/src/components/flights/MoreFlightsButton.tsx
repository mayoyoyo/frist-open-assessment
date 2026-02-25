/**
 * MoreFlightsButton -- "Show more flights" button (5 elements).
 *
 * Structure from PropertySpec:
 *   cb-more-flights [P] (inline) >
 *     div (flex, 936px×80px) >
 *       button (flex, 200px×56px) >
 *         span (1 children) >
 *           [text "Show more flights"]
 */

export default function MoreFlightsButton() {
  return (
    <div style={{ display: 'inline' }}>
      {/* cb-more-flights [P] */}
      <div style={{ display: 'flex', width: '936px', height: '80px', alignItems: 'center', justifyContent: 'center' }}>
        <button
          style={{
            display: 'flex',
            width: '200px',
            height: '56px',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgb(0, 51, 160)',
            borderRadius: '4px',
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ width: '103.516px', height: '24px', fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: 'rgb(0, 51, 160)' }}>
            Show more flights
          </span>
        </button>
      </div>
    </div>
  );
}
