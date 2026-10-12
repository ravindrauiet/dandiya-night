import { EVENT } from "@/lib/event";

export default function VenueCard() {
  return (
    <section id="venue" className="section-venue">
      <div className="container">
        <div className="section-head">
          <div className="festive-badge">📍 VENUE &amp; LOCATION</div>
          <h2>Celebrating at Opulent Mall</h2>
          <p>Centrally located, fully air-conditioned, and easily accessible from all of Delhi NCR</p>
        </div>

        <div className="venue-card-wrapper card">
          <div className="venue-info">
            <div className="venue-header">
              <span className="venue-type-tag">🏛️ Premier Venue Partner</span>
              <h3>{EVENT.venue}</h3>
              <p className="venue-addr">{EVENT.venueAddress}</p>
            </div>

            <div className="venue-features-grid">
              <div className="venue-feat">
                <span className="feat-icon">🚗</span>
                <div>
                  <strong>Covered Parking</strong>
                  <p>{EVENT.parking}</p>
                </div>
              </div>
              <div className="venue-feat">
                <span className="feat-icon">🚇</span>
                <div>
                  <strong>Public Transit</strong>
                  <p>{EVENT.landmark}</p>
                </div>
              </div>
              <div className="venue-feat">
                <span className="feat-icon">❄️</span>
                <div>
                  <strong>Indoor Comfort</strong>
                  <p>Grand indoor arena with AC &amp; security</p>
                </div>
              </div>
              <div className="venue-feat">
                <span className="feat-icon">🍔</span>
                <div>
                  <strong>Food &amp; Refreshments</strong>
                  <p>In-house festive food stalls &amp; mall food court</p>
                </div>
              </div>
            </div>

            <div className="venue-actions">
              <a
                href={EVENT.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                🗺️ Open in Google Maps
              </a>
              <a
                href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Hi Rahul, I need directions to Dandiya Night at Opulent Mall.")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                💬 Ask for Directions
              </a>
            </div>
          </div>

          <div className="venue-visual">
            <div className="venue-map-preview">
              <div className="map-badge">Opulent Mall, Ghaziabad</div>
              <div className="map-pin">📍</div>
              <p className="map-note">Grand Navratri Arena on Ground &amp; Atrium Floors</p>
              <a
                href={EVENT.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm map-btn"
              >
                Get Live Directions ➔
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
