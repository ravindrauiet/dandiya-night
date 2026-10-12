import { EVENT, TICKETS, HIGHLIGHTS, formatPrice } from "@/lib/event";
import BookingForm from "@/components/BookingForm";
import PaymentCard from "@/components/PaymentCard";

export default function Home() {
  return (
    <>
      <nav className="nav">
        <div className="container">
          <a href="#" className="logo">DANDIYA NIGHT</a>
          <div className="nav-links">
            <a href="#tickets">Tickets</a>
            <a href="#highlights">Highlights</a>
            <a href="#book">Book</a>
          </div>
          <a href="#book" className="btn btn-primary btn-sm">Book Tickets</a>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <p className="presents">{EVENT.presenters} present</p>
          <h1>{EVENT.name}</h1>
          <p className="meta">{EVENT.date} · {EVENT.time}</p>
          <p className="venue">{EVENT.venue}</p>
          <div className="actions">
            <a href="#book" className="btn btn-primary">🎟️ Book Your Entry</a>
            <a href="#tickets" className="btn btn-outline">View Tickets</a>
          </div>

          <div className="posters">
            <img className="poster" src="/poster-1.jpg" alt="Dandiya Night 2026 event poster at Opulent Mall" />
            <img className="poster" src="/poster-2.jpg" alt="The Dandiya Night at Opulent Mall event poster" />
          </div>
        </div>
      </header>

      <section id="tickets">
        <div className="container">
          <div className="section-head">
            <h2>Choose Your Pass</h2>
            <p>Festive beats, dandiya, food and prizes.</p>
          </div>
          <div className="grid grid-4">
            {TICKETS.map((t) => (
              <div key={t.id} className="card ticket">
                <h3>{t.name}</h3>
                <div className="price">{formatPrice(t.price)}</div>
                <div className="people">{t.people}</div>
                <a href={`?ticket=${t.id}#book`} className="btn btn-outline btn-sm">Select</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="highlights">
        <div className="container">
          <div className="section-head">
            <h2>The Night&apos;s Highlights</h2>
            <p>Come for the music, stay for the dandiya, food and festive fun.</p>
          </div>
          <div className="grid grid-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="card highlight">
                <div className="icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="book">
        <div className="container">
          <div className="section-head">
            <h2>Book Your Tickets</h2>
            <p>Pay via UPI, attach the payment screenshot and submit. Your booking QR will be emailed to you.</p>
          </div>
          <div className="book-grid">
            <BookingForm />
            <PaymentCard />
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          {EVENT.name.replace(" 2026", "")} 2026 · {EVENT.venue}<br />
          Organised by {EVENT.presenters}
        </div>
      </footer>
    </>
  );
}
