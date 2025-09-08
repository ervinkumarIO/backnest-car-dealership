-- Car Dealership Database Seeder
-- This file seeds the database with initial development data

-- Insert Master Admin (MASTER account - cannot be deleted)
INSERT INTO admins ("adminId", name, phone, email, branch, password) VALUES
('MASTER', 'Master Admin', '+60123456789', 'master@dealership.com', 'KL', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6');

-- Insert Sample Admins
INSERT INTO admins ("adminId", name, phone, email, branch, password) VALUES
('ADM001', 'KL Branch Admin', '+60123456790', 'admin.kl@dealership.com', 'KL', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6'),
('ADM002', 'JB Branch Admin', '+60123456791', 'admin.jb@dealership.com', 'JB', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6'),
('ADM003', 'Selangor Branch Admin', '+60123456792', 'admin.slgr@dealership.com', 'SLGR', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6');

-- Insert Sample Staff
INSERT INTO staff ("staffId", name, email, phone, branch, password) VALUES
('STF001', 'John Smith', 'john.sales@dealership.com', '+60123456793', 'KL', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6'),
('STF002', 'Sarah Johnson', 'sarah.manager@dealership.com', '+60123456794', 'KL', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6'),
('STF003', 'Mike Wilson', 'mike.support@dealership.com', '+60123456795', 'JB', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6'),
('STF004', 'Lisa Brown', 'lisa.sales@dealership.com', '+60123456796', 'SLGR', '$2b$12$ja3wkis.n2mbl0nEdLyhgeiaTb919ZJwjOsEvaQ1RjiMWWSKYKPl6');

-- Insert Sample Cars
INSERT INTO cars ("chassisNo", brand, model, variant, price, year, color, transmission, "fuelType", mileage, grade, status, condition, features, remarks, branch, "soldBy", "soldAt", image, public) VALUES
('ABC123', 'Toyota', 'Camry', '2.5L Hybrid', 150000, 2023, 'White', 'Automatic', 'Hybrid', 5000, 'G', 'In Stock', 'Excellent', '["GPS", "Bluetooth", "Sunroof"]', 'Well maintained, single owner', 'KL', NULL, NULL, '[]', 'yes'),
('DEF456', 'Honda', 'Civic', '1.5L Turbo', 120000, 2022, 'Black', 'Automatic', 'Petrol', 15000, 'E', 'In Stock', 'Good', '["GPS", "Bluetooth"]', 'Regular service history', 'KL', NULL, NULL, '[]', 'yes'),
('GHI789', 'BMW', '3 Series', '2.0L', 200000, 2023, 'Blue', 'Automatic', 'Petrol', 3000, 'M Sport', 'Sold', 'Excellent', '["GPS", "Bluetooth", "Leather Seats", "Sunroof"]', 'Premium package', 'JB', 'STF003', '2024-01-15', '[]', 'no'),
('JKL012', 'Mercedes', 'C-Class', '1.5L', 180000, 2022, 'Silver', 'Automatic', 'Petrol', 12000, 'AMG Line', 'In Stock', 'Good', '["GPS", "Bluetooth", "Leather Seats"]', 'AMG styling package', 'SLGR', NULL, NULL, '[]', 'yes'),
('MNO345', 'Audi', 'A4', '2.0L', 170000, 2023, 'Red', 'Automatic', 'Petrol', 8000, 'S Line', 'In Transit', 'Excellent', '["GPS", "Bluetooth", "Virtual Cockpit"]', 'S Line package', 'KL', NULL, NULL, '[]', 'no'),
('PQR678', 'Volkswagen', 'Golf', '1.4L', 95000, 2022, 'White', 'Automatic', 'Petrol', 20000, 'Comfortline', 'In Stock', 'Good', '["GPS", "Bluetooth"]', 'High mileage but well maintained', 'JB', NULL, NULL, '[]', 'yes'),
('STU901', 'Nissan', 'Altima', '2.5L', 110000, 2023, 'Gray', 'Automatic', 'Petrol', 6000, 'SV', 'In Stock', 'Excellent', '["GPS", "Bluetooth", "Bose Audio"]', 'Bose premium audio system', 'SLGR', NULL, NULL, '[]', 'yes'),
('VWX234', 'Hyundai', 'Elantra', '2.0L', 85000, 2022, 'Blue', 'Automatic', 'Petrol', 18000, 'SEL', 'Maintenance', 'Good', '["GPS", "Bluetooth"]', 'Currently in maintenance', 'KL', NULL, NULL, '[]', 'no');

-- Note: Password hash above is for 'password123' - change in production!
