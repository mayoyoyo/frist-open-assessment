export default function WaysToJetBlue() {
  const items = [
    { label: "Flights", img: "/images/jetblue-18.svg", alt: "JetBlue", external: false },
    { label: "Explore packages", img: "/images/jetblue-vacations.svg", alt: "JetBlue vacations", external: true },
    { label: "Explore trip deals", img: "/images/trueblue-travel.svg", alt: "TrueBlue Travel", external: true },
    { label: "Points & Perks", img: "/images/trueblue.svg", alt: "TrueBlue", external: false },
    { label: "Credit Cards", img: "/images/credit-cards.svg", alt: "Credit Cards", external: false },
  ];

  return (
    <div>
      <section style={{ backgroundColor: "rgb(255, 255, 255)", padding: "32px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, lineHeight: "48px", color: "rgb(0,32,91)", margin: "0 0 24px" }}>So many ways to JetBlue.</h2>
        </div>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-evenly", gap: "24px" }}>
            {items.map((item) => (
              <a key={item.label} href="#" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "160px", textDecoration: "none", cursor: "pointer", gap: "8px" }}>
                <div style={{ width: "112px", height: "76px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={item.img} alt={item.alt} style={{ maxWidth: "112px", maxHeight: "76px", objectFit: "contain" }} />
                </div>
                <div style={{ color: "rgb(0,51,160)", fontSize: "14px", fontWeight: 700, lineHeight: "20px", display: "flex", alignItems: "center", gap: "2px" }}>
                  <span>{item.label}</span>
                  {item.external ? (
                    <svg width="10" height="10" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m.5 6.5 6-6M2 .5h4.5V5" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" fill="currentColor" /></svg>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}