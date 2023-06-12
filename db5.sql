
INSERT INTO user_account VALUES(uuid_short(), 'employee1', 'password1', 'employee', 'employee1@gmail.com', '+91987654321');
INSERT INTO user_account VALUES(uuid_short(), 'manager_first_name','manager1', 'password222', 'manager', 'manager1@gmail.com', '+916548765');
INSERT INTO user_account VALUES(uuid_short(), 'admin1', 'password999', 'admin', 'admin1@gmail.com', '+9154323453');
INSERT INTO user_account VALUES(uuid_short(), 'customer1', 'password6544334343ddddss3244g66', 'customer', 'customer1@gmail.com', '+91765433454');
INSERT INTO user_account VALUES(uuid_short(), 'Teresa', 'Lisbon', 'teresalisbon', '1f61c36e82d111575058b1dd38140768ee4ea52eba8f4aa7d7373109cde3be53', 'admin', 'teresalisbon@gmail.com', '+9124545433');
SELECT * FROM user_account;
select * from employee;
select * from plaza_manager;
select * from toll_plaza;
select * from toll_booth;
truncate plaza_manager;
insert into plaza_manager values(99456520181252117, 99459359574065153);
UPDATE user_account set account_type='manager' where account_id = 99459359574065153;
#ALTER TABLE user_account MODIFY COLUMN account_id BIGINT UNSIGNED PRIMARY KEY DEFAULT uuid_short(); 
Use automated_toll_system;
DELIMITER ;;
CREATE TRIGGER `user_account_before_insert` 
BEFORE INSERT ON `user_account` FOR EACH ROW 
BEGIN
  IF new.account_id IS NULL THEN
    SET new.account_id = uuid_short();
  END IF;
END;;
DELIMITER ;

-- INSERT INTO user_account(first_name, last_name, username, password_hash, email) VALUES ( 'Hardik', 'Purohit', 'hardikpurohit', 'sadgfa', 'hardikpurohit26@gmail.com');

DELIMITER ;;
CREATE TRIGGER `vehicle_before_insert` 
BEFORE INSERT ON `vehicle` FOR EACH ROW 
BEGIN
  IF new.vehicle_id IS NULL THEN
    SET new.vehicle_id = uuid_short();
  END IF;
END;;
DELIMITER ;

UPDATE user_account SET password_hash = 'ac82ee5af388c8fe121b9aa08086a6ed300e22d82bf261ef9ec34c6ea2564bfe' WHERE username = 'customer1';
update vehicle SET balance=5000 where vehicle_no='MH14CY1471';
update vehicle SET balance=5000 where vehicle_no='DL43ZR5433';
update vehicle SET balance=0 where vehicle_no='KA54CY3222';
INSERT INTO customer VAlues (99456520181252096, 'MH1623343434');
select * from toll_plaza;
INSERT INTO toll_charges values
(99456520181252110, 'LMV', '250', '150'),
(99456520181252110, 'LCV', '500', '350'),
(99456520181252110, 'HCV', '750', '500');
select * from vehicle;
select * from toll_charges;
insert into toll_booth values(uuid_short(), 1, 99456520181252110, 99456520181252111);
insert into employee values(99456520181252111, 99456520181252110, 50000, 0);
(uuid_short(), 99456520181252096, 'car', 'MH14CY4544', 'Maruti Suzuki',  'Breeza', 'white', 50);
(uuid_short(), 99456520181252096, 'car', 'CH15CY4544', 'Kia',  'Seltos', 'black', 5000),
(uuid_short(), 99456520181252096, 'car', 'DL22CY4544', 'Maruti Suzuki',  'Ciaz', 'cyan', 1000),
(uuid_short(), 99456520181252096, 'car', 'RJ14CY4544', 'Maruti Suzuki',  'Ertiga', 'grey', 0);
select * from vehicle;
select * from visits_at;
select * from toll_plaza;
select * from toll_charges;
select * from employee;
call vehicle_visited_payment_automated(99456520181252112, 99456520181252113);
call vehicle_visited_payment_cash(99456520181252112, 99456520181252108);
select * from toll_booth;

SELECT visit_time, city, payment_type, total_amount, fine_amount  FROM visits_at
LEFT JOIN toll_booth
using(booth_id)
LEFT JOIN toll_plaza
using(plaza_id)
WHERE vehicle_id = 99456520181252113
ORDER BY visit_time desc;


grant select, insert, update ON user_account to customer@localhost;
grant select, insert, update ON user_account to customer@localhost;
grant select, insert, update ON vehicle to vehicle@localhost;

grant select, insert, update ON user_account to employee@locahost;
grant select, insert, update ON employee to employee@localhost;
grant select, insert, update ON visits_at to employee@localhost;

grant all on toll_booth to manager@localhost;
grant all on employee to manager@locahost;
grant all on toll_charges to manager@localhost;
grant select, update on toll_plaza to manager@localhost;

grant all on *.* to admin@localhost;

SELECT first_name, last_name, username, email, plaza_id from user_account t1
inner join plaza_manager t2
on t1.account_id = t2.manager_id;

delete from toll_booth where serial_no = 2;

select booth_id, serial_no, first_name, last_name, email
from user_account t1
inner join toll_booth t2
on t1.account_id = t2.operator_id;
