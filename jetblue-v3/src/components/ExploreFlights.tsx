function SkeletonCard() {
  return (
    <div style={{ borderRadius: "16px", boxShadow: "rgba(0,0,0,0.1) 0px 10px 15px -3px, rgba(0,0,0,0.1) 0px 4px 6px -4px", padding: "16px", backgroundColor: "#fff" }}>
      <div style={{ backgroundColor: "rgb(246, 246, 246)", borderRadius: "12px", height: "160px" }} />
      <div style={{ marginTop: "16px" }}>
        <div style={{ backgroundColor: "rgb(236, 236, 236)", borderRadius: "4px", height: "14px", width: "60%", marginBottom: "8px" }} />
        <div style={{ backgroundColor: "rgb(236, 236, 236)", borderRadius: "4px", height: "12px", width: "90%", marginBottom: "6px" }} />
        <div style={{ backgroundColor: "rgb(236, 236, 236)", borderRadius: "4px", height: "12px", width: "75%", marginBottom: "6px" }} />
        <div style={{ backgroundColor: "rgb(236, 236, 236)", borderRadius: "4px", height: "12px", width: "50%" }} />
      </div>
    </div>
  );
}

export default function ExploreFlights() {
  return (
    <div>
      <section style={{ backgroundColor: "rgb(255, 255, 255)", padding: "32px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "8px 0" }}>
          <a href="#" style={{ display: "block", backgroundColor: "#fff", border: "1px solid rgb(151,153,155)", borderRadius: "12px", padding: "14px 24px", color: "rgb(0,51,160)", fontSize: "14px", fontWeight: 700, lineHeight: "20px", textDecoration: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px" }}>Explore more flights</div>
          </a>
        </div>
      </section>
    </div>
  );
}