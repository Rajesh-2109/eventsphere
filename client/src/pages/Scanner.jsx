import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ScanLine, Keyboard, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./Scanner.css";
export default function Scanner() {
  const [manual, setManual] = useState({ bookingCode: "", eventId: "" }),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [events, setEvents] = useState([]);
  useEffect(() => {
    api
      .get("/events/mine")
      .then((r) => setEvents(r.data))
      .catch(() => {});
  }, []);
  const verify = async (token) => {
    setError("");
    setResult(null);
    try {
      const r = await api.post("/checkin/scan", { token });
      setResult(r.data);
      toast.success("Guest checked in");
    } catch (e) {
      setError(e.message || "QR validation failed");
    }
  };
  useEffect(() => {
    const qr = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        rememberLastUsedCamera: true,
      },
      false,
    );
    qr.render(
      (decoded) => {
        qr.pause(true);
        verify(decoded).finally(() => setTimeout(() => qr.resume(), 1800));
      },
      () => {},
    );
    return () => {
      qr.clear().catch(() => {});
    };
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const r = await api.post("/checkin/manual", manual);
      setResult(r.data);
      toast.success("Guest checked in");
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <main className="container page-pad scanner-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">VENUE OPERATIONS</span>
          <h1>
            Guest <em>check-in.</em>
          </h1>
          <p>Scan a ticket QR or use its booking code as a fallback.</p>
        </div>
      </div>
      <div className="scanner-grid">
        <section className="surface-card scanner-card">
          <div className="scanner-heading">
            <ScanLine />
            <div>
              <h2>Scan QR ticket</h2>
              <p className="muted">Allow camera access to scan a guest pass.</p>
            </div>
          </div>
          <div id="qr-reader" />
          <p className="scanner-tip">
            Hold the QR code steady inside the frame.
          </p>
        </section>
        <section className="surface-card scanner-card">
          <div className="scanner-heading">
            <Keyboard />
            <div>
              <h2>Manual check-in</h2>
              <p className="muted">
                Use this if a guest cannot display their QR.
              </p>
            </div>
          </div>
          <form onSubmit={submit}>
            <label>
              Event
              <select
                required
                value={manual.eventId}
                onChange={(e) =>
                  setManual({ ...manual, eventId: e.target.value })
                }
              >
                <option value="">Select event</option>
                {events.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Booking code
              <input
                required
                placeholder="ES-XXXXXX"
                value={manual.bookingCode}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    bookingCode: e.target.value.toUpperCase(),
                  })
                }
              />
            </label>
            <button className="btn btn-primary btn-wide">
              Verify & check in
            </button>
          </form>
          {result && (
            <div className="scan-result success">
              <CheckCircle2 />
              <span>
                Check-in successful · {result.data?.booking?.bookingCode}
              </span>
            </div>
          )}
          {error && (
            <div className="scan-result failure">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
