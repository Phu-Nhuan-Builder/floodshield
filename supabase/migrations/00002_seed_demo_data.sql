-- FloodShield VN — Seed demo data for hackathon
-- 13 ĐBSCL provinces with flood zones from August 2024 flood season

INSERT INTO flood_zones (id, province, district, severity, flood_index, flooded_area_km2, detected_at, sentinel_item_id, geometry, confidence)
VALUES
  ('zone_an_giang_01', 'An Giang', 'Châu Đốc', 'critical', 0.28, 11480, '2024-08-15T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240815T230000', '{"type":"Polygon","coordinates":[[[104.9,10.2],[105.4,10.2],[105.4,10.8],[104.9,10.8],[104.9,10.2]]]}', 88),
  ('zone_dong_thap_01', 'Đồng Tháp', 'Cao Lãnh', 'high', 0.18, 7380, '2024-08-15T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240815T230001', '{"type":"Polygon","coordinates":[[[105.4,10.2],[106.0,10.2],[106.0,10.8],[105.4,10.8],[105.4,10.2]]]}', 82),
  ('zone_long_an_01', 'Long An', 'Tân An', 'medium', 0.09, 3690, '2024-08-15T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240815T230002', '{"type":"Polygon","coordinates":[[[105.7,10.4],[106.3,10.4],[106.3,11.0],[105.7,11.0],[105.7,10.4]]]}', 75),
  ('zone_tien_giang_01', 'Tiền Giang', 'Mỹ Tho', 'high', 0.15, 6150, '2024-08-16T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240816T230000', '{"type":"Polygon","coordinates":[[[105.8,10.2],[106.5,10.2],[106.5,10.7],[105.8,10.7],[105.8,10.2]]]}', 79),
  ('zone_kien_giang_01', 'Kiên Giang', 'Rạch Giá', 'critical', 0.25, 10250, '2024-08-16T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240816T230001', '{"type":"Polygon","coordinates":[[[104.0,9.4],[105.0,9.4],[105.0,10.5],[104.0,10.5],[104.0,9.4]]]}', 85),
  ('zone_can_tho_01', 'Cần Thơ', 'Ninh Kiều', 'medium', 0.06, 2460, '2024-08-17T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240817T230000', '{"type":"Polygon","coordinates":[[[105.3,9.9],[105.9,9.9],[105.9,10.3],[105.3,10.3],[105.3,9.9]]]}', 71),
  ('zone_ca_mau_01', 'Cà Mau', 'Cà Mau', 'low', 0.03, 1230, '2024-08-17T06:00:00Z', 'S1A_IW_GRDH_1SDV_20240817T230001', '{"type":"Polygon","coordinates":[[[104.5,8.6],[105.3,8.6],[105.3,9.4],[104.5,9.4],[104.5,8.6]]]}', 65);

INSERT INTO flood_alerts (zone_id, province, district, severity, message, message_vi, expires_at, notifications_sent)
VALUES
  ('zone_an_giang_01', 'An Giang', 'Châu Đốc', 'critical', 'Critical flood in Chau Doc, An Giang. Evacuate immediately!', 'KHẨN CẤP! Lũ nghiêm trọng tại Châu Đốc, An Giang. DI TẢN NGAY LẬP TỨC! Liên hệ 113.', NOW() + INTERVAL '24 hours', 1250),
  ('zone_kien_giang_01', 'Kiên Giang', 'Rạch Giá', 'critical', 'Critical flood in Rach Gia, Kien Giang. Evacuate immediately!', 'KHẨN CẤP! Lũ nghiêm trọng tại Rạch Giá, Kiên Giang. DI TẢN NGAY!', NOW() + INTERVAL '24 hours', 980),
  ('zone_dong_thap_01', 'Đồng Tháp', 'Cao Lãnh', 'high', 'High flood alert in Cao Lanh, Dong Thap.', 'CẢNH BÁO LŨ CAO tại Cao Lãnh, Đồng Tháp. Di chuyển tài sản lên cao ngay.', NOW() + INTERVAL '48 hours', 730);

INSERT INTO aid_payouts (zone_id, province, recipient_address, recipient_name, amount, aid_type, tx_signature, status, triggered_at, confirmed_at)
VALUES
  ('zone_an_giang_01', 'An Giang', '7V9iD2bS3X4kfW8mN1qP6rT0uA5cE7gHjKLmNoPqR', 'Nguyễn Văn A', 100000000, 'rice_voucher', '3hTk9mX2vL4qR8pN5sW7cE1jK6bD0fA9gHiJoMnPrStUvWxYzAB2CD3EF4GH5IJKLMNOPQRSTUVWXYZab', 'confirmed', '2024-08-15T08:00:00Z', '2024-08-15T08:02:15Z'),
  ('zone_kien_giang_01', 'Kiên Giang', '4mP8nQ2rS6tU0vW3xY7zA1bC5dE9fGhIjKlMnOpQr', 'Trần Thị B', 100000000, 'rice_voucher', '5kVm8nX3wL6pQ9rS0tU4vW7yZ2aC1bD6eF0gHiJkLmNoPqRsTuVwXyZABCDEFGHIJKLMNOPQRSTUVWXYZ', 'confirmed', '2024-08-16T09:00:00Z', '2024-08-16T09:03:22Z'),
  ('zone_dong_thap_01', 'Đồng Tháp', '8xY4zA6bC0dE2fG7hI3jK9lM1nO5pQ', 'Lê Văn C', 50000000, 'fertilizer_voucher', NULL, 'pending', '2024-08-17T10:00:00Z', NULL);
