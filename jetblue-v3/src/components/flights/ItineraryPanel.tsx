/**
 * ItineraryPanel -- reusable itinerary display (27 elements).
 * Used in both FlightSelections (departure summary) and FlightResultItem cards.
 *
 * Structure from PropertySpec:
 *   cb-itinerary-panel [P] (inline) > div [w] >
 *     div(flex) > [div>span "Nonstop", div>span "2h 40m"]
 *     div(flex) > [div>"6:00am"+div>"PBI", div[P](flex)>div(line), div>"8:40am"+div>"JFK"]
 *     div > [div(flex)>img+div>span"JetBlue">span"B6 1054">span, div>button"Details"+span+button"Seats"]
 */

interface ItineraryPanelProps {
  stops: string;
  duration: string;
  departTime: string;
  departCode: string;
  arriveTime: string;
  arriveCode: string;
  flightNumber: string;
  width?: number;
}

const jetblueLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='16' viewBox='0 0 46 16'%3E%3Ctext x='0' y='13' font-size='11' font-family='Arial' fill='%23003087' font-weight='bold' font-style='italic'%3EjetBlue%3C/text%3E%3C/svg%3E";

export default function ItineraryPanel({
  stops,
  duration,
  departTime,
  departCode,
  arriveTime,
  arriveCode,
  flightNumber,
  width = 418,
}: ItineraryPanelProps) {
  // Line width depends on container width minus the two time columns (64px each) and gaps
  const lineWidth = width - 64 - 64 - 16;

  return (
    <div style={{ display: 'inline' }}>
      {/* cb-itinerary-panel [P] */}
      <div style={{ width: `${width}px`, height: '149.797px' }}>
        {/* Row 1: Stops + Duration */}
        <div style={{ display: 'flex', width: `${width}px`, height: '19.2031px', justifyContent: 'space-between' }}>
          <div style={{ width: '67.5938px', height: '19.2031px' }}>
            <span style={{ display: 'inline', fontSize: '14px', lineHeight: '19.2031px', color: 'rgb(51, 51, 51)' }}>{stops}</span>
          </div>
          <div style={{ width: '56.1094px', height: '19.2031px' }}>
            <span style={{ display: 'inline', fontSize: '14px', lineHeight: '19.2031px', color: 'rgb(51, 51, 51)' }}>{duration}</span>
          </div>
        </div>

        {/* Row 2: Times + Route Line */}
        <div style={{ display: 'flex', width: `${width}px`, height: '49.5938px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '49.5938px' }}>
            <div style={{ width: '64px', height: '21.5938px', fontSize: '20px', fontWeight: 700, lineHeight: '21.5938px', color: 'rgb(0, 0, 0)' }}>{departTime}</div>
            <div style={{ width: '64px', height: '24px', fontSize: '16px', lineHeight: '24px', color: 'rgb(51, 51, 51)' }}>{departCode}</div>
          </div>
          {/* Route line [P] */}
          <div style={{ display: 'flex', width: `${lineWidth}px`, height: '3px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: `${lineWidth}px`, height: '2px', backgroundColor: 'rgb(0, 114, 206)', borderRadius: '1px' }} />
          </div>
          <div style={{ width: '64px', height: '49.5938px', textAlign: 'right' }}>
            <div style={{ width: '64px', height: '21.5938px', fontSize: '20px', fontWeight: 700, lineHeight: '21.5938px', color: 'rgb(0, 0, 0)' }}>{arriveTime}</div>
            <div style={{ width: '64px', height: '24px', fontSize: '16px', lineHeight: '24px', color: 'rgb(51, 51, 51)' }}>{arriveCode}</div>
          </div>
        </div>

        {/* Row 3: Airline Info + Details/Seats */}
        <div style={{ width: `${width}px`, height: '57px' }}>
          {/* Airline row */}
          <div style={{ display: 'flex', width: `${width}px`, height: '24px', alignItems: 'center', gap: '8px' }}>
            <img
              src={jetblueLogo}
              alt=""
              style={{ width: '45.7031px', height: '16px' }}
            />
            <div style={{ width: '122.547px', height: '24px' }}>
              <span style={{ display: 'inline', fontSize: '14px', lineHeight: '24px', color: 'rgb(51, 51, 51)' }}>
                JetBlue
                <span style={{ display: 'inline', fontSize: '14px', color: 'rgb(117, 117, 117)', marginLeft: '4px' }}>
                  B6 {flightNumber}
                  <span style={{ display: 'inline' }} />
                </span>
              </span>
            </div>
          </div>
          {/* Details | Seats buttons */}
          <div style={{ width: `${width}px`, height: '25px', display: 'flex', alignItems: 'center', gap: '0px' }}>
            <button
              style={{
                display: 'inline',
                width: '46.4062px',
                height: '24px',
                border: 'none',
                background: 'none',
                color: 'rgb(0, 51, 160)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Details
            </button>
            <span style={{ display: 'inline-block', width: '0px', height: '16px', borderLeft: '1px solid rgb(211, 211, 211)', margin: '0 8px' }} />
            <button
              style={{
                display: 'inline',
                width: '38.7031px',
                height: '24px',
                border: 'none',
                background: 'none',
                color: 'rgb(0, 51, 160)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
