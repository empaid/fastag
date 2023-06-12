CREATE TABLE toll_plaza (
	plaza_id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    cash_holded INT DEFAULT 0 NOT NULL,
    online_funds INT DEFAULT 0 NOT NULL
);
select * from toll_plaza;
drop table toll_plaza;
drop table toll_charges;
drop table employee;
drop table toll_booth;
drop table visits_at;
CREATE TABLE toll_charges (
	plaza_id BIGINT UNSIGNED,
    vehicle_type ENUM('LMV', 'LCV', 'HCV') NOT NULL,
    amount INT DEFAULT 0 NOT NULL,
    fine INT DEFAULT 0,
    PRIMARY KEY(plaza_id, vehicle_type),
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE CASCADE
);

CREATE TABLE toll_booth (
	booth_id BIGINT UNSIGNED PRIMARY KEY,
    serial_no INT UNIQUE,
    plaza_id BIGINT UNSIGNED NOT NULL,
    operator_id BIGINT UNSIGNED,
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE CASCADE,
    FOREIGN KEY(operator_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);
describe toll_booth;
DROP TABLE visits_at;
CREATE TABLE visits_at (
	vehicle_id BIGINT UNSIGNED,
    booth_id BIGINT UNSIGNED,
    payment_type ENUM('automated', 'cash') NOT NULL,
    total_amount INT DEFAULT 0 NOT NULL,
    fine_amount INT,
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(vehicle_id, booth_id, visit_time),
    FOREIGN KEY(vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY(booth_id) REFERENCES toll_booth(booth_id) ON DELETE CASCADE
);


CREATE table plaza_manager (
	plaza_id BIGINT UNSIGNED,
    manager_id BIGINT UNSIGNED,
    PRIMARY KEY(plaza_id, manager_id),
    FOREIGN KEY(plaza_id) REFERENCES toll_plaza(plaza_id) ON DELETE CASCADE,
    FOREIGN KEY(manager_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);


drop procedure vehicle_visited_payment_automated;
delimiter $
create procedure vehicle_visited_payment_automated(in _booth_id BIGINT UNSIGNED, in _vehicle_id BIGINT UNSIGNED)
begin
declare _vehicle_type varchar(10);
declare _amount int;
select vehicle_type into _vehicle_type from vehicle where vehicle_id = _vehicle_id;

select amount into _amount from toll_charges where 
vehicle_type = _vehicle_type and
plaza_id = (select plaza_id from toll_booth where booth_id = _booth_id);
INSERT INTO visits_at values(_vehicle_id, _booth_id, 'automated', _amount, 0, current_timestamp);
UPDATE vehicle SET balance = balance - _amount WHERE vehicle_id = _vehicle_id;
UPDATE toll_plaza SET online_funds = online_funds + _amount;
end$
delimiter ;

delimiter $
create procedure vehicle_visited_payment_cash(in _booth_id BIGINT UNSIGNED, in _vehicle_id BIGINT UNSIGNED)
begin
declare _vehicle_type varchar(10);
declare _amount int;
declare _fine int;
select vehicle_type into _vehicle_type from vehicle where vehicle_id = _vehicle_id;

select amount, fine into _amount, _fine from toll_charges where 
vehicle_type = _vehicle_type and
plaza_id = (select plaza_id from toll_booth where booth_id = _booth_id);
INSERT INTO visits_at values(_vehicle_id, _booth_id, 'cash', _amount+_fine, _fine, current_timestamp);
UPDATE toll_plaza SET cash_holded = cash_holded + _amount + _fine;
end$
delimiter ;


delimiter $
create function toll_amount_at_booth_id(_booth_id BIGINT UNSIGNED, _vehicle_type VARCHAR(20))
returns  INT
DETERMINISTIC
BEGIN
declare _amount int;
select amount as _amount
from toll_charges where 
plaza_id = (select plaza_id from toll_booth where booth_id = _booth_id)
and vehicle_type = _vehicle_type;
return (amount);
end$

create function toll_fine_at_booth_id(_booth_id BIGINT UNSIGNED, _vehicle_type VARCHAR(20))
returns  INT
DETERMINISTIC
BEGIN
declare _fine int;
select fine as _fine
from toll_charges where 
plaza_id = (select plaza_id from toll_booth where booth_id = _booth_id)
and vehicle_type = _vehicle_type;
return (amount);
end$
