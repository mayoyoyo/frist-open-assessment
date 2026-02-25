/**
 * FlightSelections -- header showing selected departure flight summary (37 elements).
 * Only shown on return flight results after outbound is selected.
 *
 * Structure from PropertySpec:
 *   cb-flight-selections [P] (inline) > div [936px] >
 *     div [936px×0px]  -- empty spacer
 *     div [936px×183.797px] >
 *       div (grid, col, 902px, 3 cols: 290px 435px 145px) >
 *         div(flex,col) > [h2 + p]                    -- route + date
 *         div > ItineraryPanel (27 nodes)              -- flight details
 *         div(flex,col) > div "EvenMore"               -- fare class
 */
import ItineraryPanel from './ItineraryPanel';

export default function FlightSelections() {
  return (
    <div style={{ display: 'inline' }}>
      {/* cb-flight-selections [P] */}
      <div style={{ width: '936px', height: '183.797px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)', marginBottom: '16px' }}>
        {/* Empty spacer div */}
        <div style={{ width: '936px', height: '0px' }} />
        {/* Content */}
        <div style={{ width: '936px', height: '183.797px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '290px 435px 145px',
              gap: '16px',
              width: '902px',
              height: '149.797px',
              margin: '0 auto',
              padding: '16px 0',
            }}
          >
            {/* Left: Route + Date */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '290px', height: '149.797px' }}>
              <h2
                style={{
                  width: '273px',
                  height: '48px',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: '24px',
                  color: 'rgb(0, 0, 0)',
                  margin: 0,
                }}
              >
                West Palm Beach, FL (PBI) to New York, NY (JFK)
              </h2>
              <p
                style={{
                  width: '273px',
                  height: '16px',
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: 'rgb(51, 51, 51)',
                  margin: 0,
                }}
              >
                Feb 18 2026
              </p>
            </div>

            {/* Center: ItineraryPanel (27 nodes) */}
            <div style={{ width: '435px', height: '149.797px' }}>
              <ItineraryPanel
                stops="Nonstop"
                duration="2h 40m"
                departTime="6:00am"
                departCode="PBI"
                arriveTime="8:40am"
                arriveCode="JFK"
                flightNumber="1054"
                width={418}
              />
            </div>

            {/* Right: Fare class */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '145px', height: '149.797px' }}>
              <div style={{ width: '86.125px', height: '24px', fontSize: '14px', fontWeight: 500, lineHeight: '24px', color: 'rgb(0, 0, 0)' }}>
                EvenMore
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
