import { useSyncExternalStore } from 'react';
import { getState, setState, subscribe, navigateToStep } from '../main';

export default function BookingBar() {
  const state = useSyncExternalStore(subscribe, getState);

  const handleSearch = () => {
    navigateToStep('results');
  };

  return (
    <div style={{ width: '100%', height: '305px', position: 'relative' }}>
      <img
        src="/images/img-8.jpg"
        alt=""
        style={{
          width: '100%', height: '305px', position: 'absolute', top: 0, left: 0,
          objectFit: 'cover',
        }}
      />
      <section
        style={{
          backgroundColor: 'rgba(0, 32, 91, 0.35)',
          padding: '32px 40px',
          width: '100%',
          height: '305px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgb(211, 211, 211)',
                width: '574px',
                margin: '0 auto',
                height: '33px',
              }}
            >
              <div style={{ display: 'flex', padding: '0 0 8px', marginRight: '32px', cursor: 'pointer', borderBottom: '2px solid #fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '16px', lineHeight: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" style={{ marginRight: '6px' }}><path d="m16.688 27.613-5.205-.7a.842.842 0 0 0-.861.443l-.426.796a.842.842 0 0 0 .362 1.15l3.59 1.651 2.54-3.34zM20.695 31.62l.684 5.19a.842.842 0 0 1-.443.86l-.796.426a.842.842 0 0 1-1.159-.321l-1.734-3.61 3.448-2.545zM21.7 22.288a.75.75 0 0 1-.49 1.418L8.885 19.445c-.513-.22-.835-.602-.934-1.188-.1-.586.079-1.053.513-1.45l1.67-1.412a1.604 1.604 0 0 1 1.18-.363l15.631 1.521a.75.75 0 1 1-.145 1.493l-15.63-1.52a.1.1 0 0 0-.072.019l-1.643 1.388c-.05.046-.035.01-.025.073.004.02 4.094 1.448 12.271 4.282zM30.09 21.51l1.492-.145 1.529 15.64c.041.426-.09.85-.367 1.184l-1.42 1.68c-.362.396-.9.58-1.43.491-.529-.09-.976-.442-1.208-.987l-4.26-12.382 1.419-.488 4.24 12.33a.08.08 0 0 0 .06.048c.027.005.055-.005.053-.002l1.396-1.653a.103.103 0 0 0 .024-.075l-1.529-15.64z" /><path d="M16.373 33.996a1.844 1.844 0 0 0 1.302-.7l.068-.075L37.21 14.365a2.162 2.162 0 0 0 .002-3.044l-.158-.159a2.16 2.16 0 0 0-3.037-.01l-18.89 19.454-.075.067a1.844 1.844 0 0 0-.215 2.701l.15.15a1.84 1.84 0 0 0 1.386.472zm.12 1.495a3.344 3.344 0 0 1-2.533-.874l-.023-.021-.175-.176a3.344 3.344 0 0 1 .321-4.893l18.867-19.43a3.663 3.663 0 0 1 5.162.002l.163.163a3.666 3.666 0 0 1-.01 5.17L18.82 34.266a3.344 3.344 0 0 1-2.328 1.225z" /></svg>
                  Flights
                </div>
              </div>
              <div style={{ display: 'flex', padding: '0 0 8px', marginRight: '32px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '16px', lineHeight: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" style={{ marginRight: '6px' }}><path d="m43.296 33.955.018-.018-.018-.018h-.714v.036h.714zm.786-1.5v2.964h-23.58v-2.964h23.58zM25.106 30.93a.75.75 0 1 1-1.5 0v-.055a3.238 3.238 0 0 1 6.476 0v.055a.75.75 0 1 1-1.5 0v-.055a1.738 1.738 0 0 0-3.476 0v.055zm7.32 0a.75.75 0 0 1-1.5 0 3.297 3.297 0 0 1 3.297-3.297h4.606a3.297 3.297 0 0 1 3.297 3.297.75.75 0 0 1-1.5 0c0-.993-.805-1.797-1.797-1.797h-4.606c-.993 0-1.797.804-1.797 1.797z" /><path d="M21.878 38.488a.75.75 0 0 1-1.5 0V22.323a.75.75 0 0 1 1.5 0v16.165zm22.825 0a.75.75 0 0 1-1.5 0v-10.63a.75.75 0 0 1 1.5 0v10.63zM8.212 21.258l-3.52-.474a.57.57 0 0 0-.583.3l-.288.538a.57.57 0 0 0 .245.778l2.429 1.117 1.717-2.26zM10.652 23.658l.47 3.56a.578.578 0 0 1-.304.59l-.547.292a.578.578 0 0 1-.794-.22l-1.19-2.476 2.365-1.746zM4.409 15.77l6.681 2.308a.75.75 0 1 1-.49 1.418l-7.207-2.493a1.177 1.177 0 0 1-.73-.927c-.077-.451.067-.828.405-1.137l.976-.825a1.25 1.25 0 0 1 .918-.282l9.115.887a.75.75 0 0 1-.146 1.493l-9.008-.877-.514.435zM15.496 17.952l1.493-.146.892 9.12c.032.332-.07.662-.286.923l-.837.988a1.234 1.234 0 0 1-1.116.384c-.413-.07-.763-.345-.948-.782l-2.484-7.22 1.418-.488 2.319 6.744.43-.51-.88-9.013z" /><path d="M7.857 24.889a.763.763 0 0 0 .539-.29l.068-.075 11.346-10.99a.948.948 0 0 0 .002-1.334l-.092-.092a.946.946 0 0 0-1.326-.01L7.38 23.441l-.075.068a.763.763 0 0 0-.097 1.108l.08.081a.765.765 0 0 0 .57.19zm1.683.68a2.263 2.263 0 0 1-3.277.224l-.022-.022-.109-.109a2.263 2.263 0 0 1 .203-3.298l10.993-11.32a2.449 2.449 0 0 1 3.45.002l.097.096a2.451 2.451 0 0 1-.01 3.459L9.54 25.57z" /></svg>
                  Flights + Hotel
                </div>
              </div>
              <div style={{ display: 'flex', padding: '0 0 8px', marginRight: '32px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '16px', lineHeight: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" style={{ marginRight: '6px' }}><path d="M34.97 28.061c0-.634-.495-1.14-1.095-1.14s-1.093.507-1.093 1.14c0 .633.494 1.14 1.093 1.14.6 0 1.094-.506 1.094-1.14zm1.5 0c0 1.454-1.158 2.64-2.595 2.64-1.436 0-2.593-1.186-2.593-2.64 0-1.454 1.157-2.64 2.593-2.64 1.437 0 2.594 1.186 2.594 2.64zm-9.654-8.48a.75.75 0 1 1 0 1.5h-5.88a.75.75 0 1 1 0-1.5h5.88z" /><path d="M35.76 31.831c.55 0 1.05-.244 1.323-.629l4.332-6.12c.234-.331-.056-.791-.633-.791H10.285c-.52 0-.974.267-1.155.646l-2.826 5.991c-.193.41.181.903.816.903h28.64zm0 1.5H7.12c-1.673 0-2.865-1.574-2.173-3.043l2.828-5.992c.437-.923 1.429-1.505 2.51-1.505h30.497c1.726 0 2.841 1.769 1.857 3.157l-4.332 6.12c-.56.793-1.523 1.263-2.548 1.263z" /><path d="M34.15 18.604c.008-.261-.158-.453-.311-.457l-13.223-.102a.75.75 0 0 1-.41-.126l-3.613-2.413.039 1.628a.75.75 0 0 1-.75.768h-.507c-.26-.008-.664.297-.752.547l-.859 4.337 20.322-.114.065-4.068zm1.424 4.826a.75.75 0 0 1-.745.738l-21.975.123a.75.75 0 0 1-.74-.896l1.061-5.326c.281-.853 1.104-1.54 1.94-1.652l-.033-1.37c-.023-.99 1.038-1.66 1.886-1.094l3.884 2.594 13.014.1c1.025.03 1.81.934 1.785 1.984l-.077 4.799z" /></svg>
                  Cruises
                </div>
              </div>
              <div style={{ display: 'flex', padding: '0 0 8px', marginRight: '32px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '16px', lineHeight: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" style={{ marginRight: '6px' }}><path d="M7.328 22.199c-1.28.253-2.275 1.382-2.275 2.652v2.693c0 1.663 1.293 3.116 3.302 3.116h3.25a.75.75 0 1 0 0-1.5h-3.25c-1.139 0-1.802-.745-1.802-1.616V24.85c0-.531.468-1.062 1.066-1.18.646-.128 1.993-.482 4.065-1.069a.75.75 0 0 0 .457-.366c.91-1.693 1.564-2.93 1.964-3.713.385-.756 1.426-1.23 2.527-1.23H27.11c.601 0 1.416.342 1.777.697.3.296 2.073 2.066 5.306 5.302a.75.75 0 0 0 .533.22c2.065-.006 3.601-.01 4.61-.01 1.153 0 2.365 1.175 2.365 2.366v1.69c0 .857-.888 1.602-2.105 1.602H36.31a.75.75 0 0 0 0 1.5h3.286c1.993 0 3.605-1.353 3.605-3.102v-1.69c0-2.03-1.894-3.865-3.866-3.865-.958 0-2.392.002-4.301.008a2235.37 2235.37 0 0 0-5.095-5.09c-.639-.629-1.83-1.127-2.83-1.127H16.633c-1.611 0-3.184.714-3.864 2.048-.371.728-.97 1.863-1.798 3.403-1.86.524-3.08.843-3.642.954zm10.366 6.96a.75.75 0 0 0 0 1.5h12.64a.75.75 0 0 0 0-1.5h-12.64z" /><path d="M33.217 33.766a3.655 3.655 0 1 1 0-7.31 3.655 3.655 0 0 1 0 7.31zm0-1.5a2.155 2.155 0 1 0 0-4.31 2.155 2.155 0 0 0 0 4.31zm-18.551 1.5a3.655 3.655 0 1 1 0-7.31 3.655 3.655 0 0 1 0 7.31zm0-1.5a2.155 2.155 0 1 0 0-4.31 2.155 2.155 0 0 0 0 4.31zM31.16 22.013c1 0 1 1.5 0 1.5h-8.487a.75.75 0 0 1-.741-.635l-.134-.865h9.362zm-13.282 1.5a.75.75 0 1 1 0-1.5h3.92l-.724-4.697a.75.75 0 0 1 1.482-.228l.858 5.56-.74-.635h8.486v1.5H17.878z" /></svg>
                  Cars
                </div>
              </div>
              <div style={{ display: 'flex', padding: '0 0 8px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '16px', lineHeight: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" style={{ marginRight: '6px' }}><path d="M39.471 26.622v3.5H6.428v-3.5z" /><path d="M10.98 24.262a.75.75 0 1 1-1.5 0v-.475a3.75 3.75 0 0 1 3.75-3.75h2.141a3.75 3.75 0 0 1 3.75 3.75v.475a.75.75 0 1 1-1.5 0v-.475a2.25 2.25 0 0 0-2.25-2.25h-2.14a2.25 2.25 0 0 0-2.25 2.25v.475zm11.194 0a.75.75 0 0 1-1.5 0v-.48a3.75 3.75 0 0 1 3.75-3.75h9.262a3.75 3.75 0 0 1 3.75 3.75v.48a.75.75 0 0 1-1.5 0v-.48a2.25 2.25 0 0 0-2.25-2.25h-9.262a2.25 2.25 0 0 0-2.25 2.25v.48zM7.759 34.592a.75.75 0 0 1-1.5 0V12.5a.75.75 0 0 1 1.5 0v22.092zm32.56 0a.75.75 0 0 1-1.5 0V20.065a.75.75 0 0 1 1.5 0v14.527z" /></svg>
                  Stays
                </div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '6px' }}>
                <form style={{ padding: '16px' }} data-ann="ann-01">
                  <div className="flex items-center" style={{ marginBottom: '8px' }}>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <select value={state.tripType} onChange={e => setState({ tripType: e.target.value })} className="text-[16px] text-[#0033a0] font-normal border-0 bg-transparent cursor-pointer">
                        <option value="roundtrip">Round trip</option>
                        <option value="oneway">One-way</option>
                        <option value="multicity">Multi-city</option>
                      </select>
                      <select value={state.passengers} onChange={e => setState({ passengers: Number(e.target.value) })} className="text-[16px] text-[#0033a0] font-normal border-0 bg-transparent cursor-pointer">
                        {[1, 2, 3, 4, 5, 6].map(n => (<option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer ml-auto">
                      <input type="checkbox" checked={state.usePoints} onChange={e => setState({ usePoints: e.target.checked })} />
                      <span style={{ fontSize: '16px', color: '#000' }}>Use TrueBlue points</span>
                    </label>
                  </div>
                  <div className="flex items-center" style={{ gap: '8px' }}>
                    <div className="flex items-center flex-1 border border-[#d3d3d3] rounded-[6px]" style={{ height: '56px' }}>
                      <div className="flex-1" style={{ padding: '0 16px' }}>
                        <input type="text" data-ann="search_from" value={state.origin} onChange={e => setState({ origin: e.target.value })} className="w-full border-0 text-[16px] focus:outline-none bg-transparent" placeholder="From" />
                      </div>
                      <button type="button" className="text-[#0033a0] flex items-center justify-center" onClick={() => setState({ origin: state.destination, destination: state.origin })} style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer' }}>&#8644;</button>
                      <div className="flex-1" style={{ padding: '0 16px' }}>
                        <input type="text" data-ann="search_to" value={state.destination} onChange={e => setState({ destination: e.target.value })} className="w-full border-0 text-[16px] focus:outline-none bg-transparent" placeholder="To" />
                      </div>
                    </div>
                    <div className="flex items-center border border-[#d3d3d3] rounded-[6px]" style={{ height: '56px' }}>
                      <div style={{ padding: '0 16px' }}><input type="text" data-ann="search_depart_date" value={state.departDate} onChange={e => setState({ departDate: e.target.value })} className="border-0 text-[16px] focus:outline-none bg-transparent" placeholder="Depart" style={{ width: '100px' }} /></div>
                    </div>
                    <div className="flex items-center border border-[#d3d3d3] rounded-[6px]" style={{ height: '56px' }}>
                      <div style={{ padding: '0 16px' }}><input type="text" data-ann="search_return_date" value={state.returnDate} onChange={e => setState({ returnDate: e.target.value })} className="border-0 text-[16px] focus:outline-none bg-transparent" placeholder="Return" style={{ width: '100px' }} /></div>
                    </div>
                    <div className="flex items-center border border-[#d3d3d3] rounded-[6px]" style={{ height: '56px' }}>
                      <div style={{ padding: '0 16px' }}><input type="text" value={state.promoCode} onChange={e => setState({ promoCode: e.target.value })} className="border-0 text-[16px] focus:outline-none bg-transparent" placeholder="Promo c..." style={{ width: '80px' }} /></div>
                    </div>
                    <button type="button" data-ann="search_flights" onClick={handleSearch} className="text-white font-bold whitespace-nowrap" style={{ backgroundColor: '#0033a0', borderRadius: '12px', padding: '14px 24px', height: '56px', fontSize: '16px', cursor: 'pointer', border: 'none' }}>Search flights</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
