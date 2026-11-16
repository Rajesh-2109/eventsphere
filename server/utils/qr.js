import QRCode from 'qrcode';
export { signBooking, verifyBookingToken } from './qrToken.js';
export const makeQr = token => QRCode.toDataURL(token, { errorCorrectionLevel: 'H', margin: 1, width: 320 });
