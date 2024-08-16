// JWT = base64encoded(header) +.+ base64encoded(payload) +.+ base64safe(hmac(_, secret))

// Access Token Structure:
// iss: nơi phát hành
// exp: thời hạn hết hạn
// aud: nơi được cung cấp token
// sub: subject
// iat: thời gian tạo
// jti: uuid
