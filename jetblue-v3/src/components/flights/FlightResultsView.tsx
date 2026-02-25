/**
 * FlightResultsView -- top-level view for step="results".
 * Outer wrapper structure from PropertySpec:
 *   cb-flights [P] (inline) > div > div > div(936px) >
 *     [FlightSelections, cb-flight-results [P] (inline) >
 *       div#flight-results >
 *         div#flightDetailCard >
 *           [FlightResultHeader, div(11×FlightResultItem + MoreFlightsButton)]
 *         FlightPromo
 *     ]
 */
import FlightSelections from './FlightSelections';
import FlightResultHeader from './FlightResultHeader';
import FlightResultItem, { flightData } from './FlightResultItem';
import FlightPromo from './FlightPromo';
import MoreFlightsButton from './MoreFlightsButton';

export default function FlightResultsView() {
  return (
    <div style={{ display: 'inline' }}>
      {/* cb-flights [P] */}
      <div style={{ width: '1461px' }}>
        <div style={{ width: '1461px' }}>
          <div style={{ width: '936px', margin: '0 auto' }}>
            {/* FlightSelections (departure summary) */}
            <FlightSelections />

            {/* cb-flight-results [P] (inline) */}
            <div style={{ display: 'inline' }}>
              <div id="flight-results" style={{ width: '936px' }}>
                {/* div#flightDetailCard */}
                <div id="flightDetailCard" style={{ width: '936px' }}>
                  {/* Results header */}
                  <FlightResultHeader />

                  {/* Flight result items container */}
                  <div style={{ width: '936px' }}>
                    {/* 11 flight result items */}
                    {flightData.map((flight, i) => (
                      <FlightResultItem key={i} flight={flight} index={i} />
                    ))}

                    {/* Show more flights button */}
                    <MoreFlightsButton />
                  </div>
                </div>

                {/* Flight promo */}
                <FlightPromo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
