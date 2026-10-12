import { SCHEDULE } from "@/lib/event";

export default function ScheduleTimeline() {
  return (
    <section id="schedule" className="section-schedule">
      <div className="container">
        <div className="section-head">
          <div className="festive-badge">🥁 EVENING ITINERARY</div>
          <h2>The Flow of the Night</h2>
          <p>3 Hours of Non-Stop Celebration, Dance, and Entertainment</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line" />
          <div className="timeline-items">
            {SCHEDULE.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <span className="marker-icon">{item.icon}</span>
                </div>
                <div className="timeline-content card">
                  <div className="timeline-time-badge">{item.time}</div>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
