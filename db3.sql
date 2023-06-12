CREATE TABLE user_account(
	account_id BIGINT UNSIGNED PRIMARY KEY,
    first_name varchar(20) NOT NULL,
    last_name varchar(20) NOT NULL,
	username varchar(20) UNIQUE NOT NULL,
    password_hash varchar(64) NOT NULL,
    account_type ENUM('admin', 'manager', 'employee', 'customer') NOT NULL DEFAULT 'customer',
    email varchar(50) UNIQUE NOT NULL,
    phone varchar(15) UNIQUE
);

CREATE TABLE employee (
	employee_id BIGINT UNSIGNED PRIMARY KEY,
    plaza_id BIGINT UNSIGNED,
    salary INT,
    holded_cash INT DEFAULT 0 NOT NULL,
    FOREIGN KEY(employee_id) REFERENCES user_account(account_id) ON DELETE CASCADE,
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE SET NULL
);

CREATE TABLE customer (
	customer_id BIGINT UNSIGNED PRIMARY KEY,
    driving_license_no varchar(20),
    FOREIGN KEY(customer_id) REFERENCES user_account(account_id) ON DELETE CASCADE
);

CREATE TABLE vehicle (
	vehicle_id BIGINT UNSIGNED,
    owner_id BIGINT UNSIGNED,
    vehicle_type varchar(10) NOT NULL,
    vehicle_no VARCHAR(10) NOT NULL UNIQUE,
    brand VARCHAR(20),
    model VARCHAR(20),
    colour varchar(10),
    balance INT DEFAULT 0 NOT NULL,
    PRIMARY KEY(vehicle_id, owner_id),
    FOREIGN KEY(owner_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);
