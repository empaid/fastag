#add checks for balance to be less than zero
CREATE DATABASE IF NOT EXISTS automated_toll_system;
DROP DATABASE automated_toll_system;
USE automated_toll_system;
DROP TABLE user_account;
CREATE TABLE user_account(
	account_id BIGINT UNSIGNED PRIMARY KEY,
	username varchar(20) UNIQUE NOT NULL,
    password_hash varchar(64) NOT NULL,
    account_type ENUM('admin', 'manager', 'employee', 'customer') NOT NULL DEFAULT 'customer',
    email varchar(20) UNIQUE NOT NULL,
    phone varchar(15) UNIQUE
);
DESCRIBE user_account;

INSERT INTO user_account VALUES(uuid_short(), 'hardik', 'hardik', 'admin', 'hardik', 'wow');
select * from user_account;
DROP TABLE toll_plaza;
CREATE TABLE toll_plaza (
	plaza_id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    city VARCHAR(20) NOT NULL,
    state VARCHAR(20) NOT NULL,
    cash_holded INT DEFAULT 0 NOT NULL,
    online_funds INT DEFAULT 0 NOT NULL,
    mgr_id  INT
);
DESCRIBE toll_plaza;

DROP TABLE toll_charges;
CREATE TABLE toll_charges (
	plaza_id INT,
    vehicle_type varchar(10),
    amount INT DEFAULT 0 NOT NULL,
    fine INT DEFAULT 0,
    PRIMARY KEY(plaza_id, vehicle_type),
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE CASCADE
);
DESCRIBE toll_charges;



DROP TABLE employee;
CREATE TABLE employee (
	employee_id INT PRIMARY KEY,
    plaza_id INT,
    salary INT,
    holded_cash INT DEFAULT 0 NOT NULL,
    FOREIGN KEY(employee_id) REFERENCES user_account(account_id) ON DELETE CASCADE,
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE SET NULL
);
DESCRIBE employee;

ALTER TABLE toll_plaza
ADD FOREIGN KEY(mgr_id)
REFERENCES employee(emp_id)
ON DELETE SET NULL;


DROP TABLE toll_booth;
CREATE TABLE toll_booth (
	booth_id INT PRIMARY KEY,
    serial_no INT UNIQUE,
    plaza_id INT NOT NULL,
    operator_id INT,
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE CASCADE,
    FOREIGN KEY(operator_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);
DESCRIBE toll_booth;

DROP TABLE customer;
CREATE TABLE customer (
	customer_id INT PRIMARY KEY,
    driving_license_no varchar(20),
    balance INT DEFAULT 0 NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES user_account(account_id) ON DELETE CASCADE
);
DESCRIBE customer;

DROP TABLE vehicle;
CREATE TABLE vehicle (
	vehicle_id INT PRIMARY KEY,
    owner_id INT NOT NULL,
    vehicle_type varchar(10) NOT NULL,
    vehicle_no VARCHAR(10) NOT NULL UNIQUE,
    model_name VARCHAR(20),
    colour varchar(10),
    FOREIGN KEY(owner_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);
DESCRIBE vehicle;

DROP TABLE visits_at;
CREATE TABLE visits_at (
	vehicle_id INT,
    booth_id INT,
    payment_type ENUM('automated', 'cash') NOT NULL,
    total_amount INT DEFAULT 0 NOT NULL,
    fine_amount INT,
    image_url varchar(50),
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(vehicle_id, booth_id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY(booth_id) REFERENCES toll_booth(booth_id) ON DELETE CASCADE
);

CREATE TABLE cash_collection (
	employee_id INT,
    manager_id INT,
    amount INT,
    collection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(employee_id, collection_time),
    FOREIGN KEY(employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY(manager_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);






