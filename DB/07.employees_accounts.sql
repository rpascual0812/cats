insert into accounts (employee_id, password) select employee_id, md5('user123456') from employees;