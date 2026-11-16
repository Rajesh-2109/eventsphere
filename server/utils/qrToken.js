import crypto from 'crypto';

export function signBooking(bookingId, eventId) {
  const payload = `${bookingId}.${eventId}`;
  const signature = crypto.createHmac('sha256', process.env.QR_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function verifyBookingToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [bookingId, eventId, signature] = parts;
  const expected = crypto.createHmac('sha256', process.env.QR_SECRET)
    .update(`${bookingId}.${eventId}`).digest('hex');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return { bookingId, eventId };
}
