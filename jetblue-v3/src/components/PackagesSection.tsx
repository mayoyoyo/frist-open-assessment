export default function PackagesSection() {
  const cards = [
    { title: "All-inclusives", desc: "Flights, hotel, savings and perks—all included.", img: "/images/all-inclusive.webp", alt: "All-inclusive" },
    { title: "Cruises", desc: "Save big on a flight + cruise package or just a cruise.", img: "/images/cruises.webp", alt: "Cruises" },
    { title: "Family vacations", desc: "Bundle flights + hotel together for big family savings.", img: "/images/family-vacations.webp", alt: "Family vacations" },
    { title: "Hotel deals", desc: "Unlock up to 20% off hotels. Plus, earn points & tiles.", img: "/images/hotel-deals.webp", alt: "Hotel deals" },
    { title: "Car rental deals", desc: "Drive off with up to 30% off, all while earning points & tiles.", img: "/images/car-rental-deals.webp", alt: "Car rental deals" },
    { title: "Trip activities", desc: "Book trip activities and earn points & tiles while you're at it.", img: "/images/trip-activities.webp", alt: "Trip activities" },
  ];
  return (
    <div>
      <section style={{ backgroundColor: "rgb(246, 246, 246)", padding: "32px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, lineHeight: "48px", color: "rgb(0,32,91)", margin: 0 }}>Packages, trip deals and more</h2>
        </div>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <p style={{ fontSize: "16px", lineHeight: "24px", color: "rgb(48,50,52)", margin: "8px 0 0" }}>Bundle and save or add extras as you go.</p>
        </div>
        <nav style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "1024px", margin: "32px auto 0", textAlign: "left" }} data-ann="ann-03">
          {cards.map((c, i) => (
            <a key={i} href="#" style={{ display: "block", backgroundColor: "#fff", border: "1px solid rgb(141,200,232)", borderRadius: "8px", textDecoration: "none", cursor: "pointer", overflow: "hidden" }}>
              <section>
                <div style={{ height: "182px" }}>
                  <img src={c.img} alt={c.alt} style={{ width: "100%", height: "182px", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 24px 24px" }}>
                  <h3 style={{ fontSize: "24px", fontWeight: 500, lineHeight: "36px", color: "rgb(0,32,91)", margin: 0 }}>
                    <span>{c.title}</span>
                  </h3>
                  <p style={{ fontSize: "16px", lineHeight: "24px", color: "rgb(48,50,52)", margin: 0 }}>{c.desc}</p>
                </div>
              </section>
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}