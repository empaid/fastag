

const tollPlazaSelect = document.querySelector('#inputGroupSelect01');
tollPlazaSelect.addEventListener('change', (event) => {
    const result = document.querySelector('#submit-btn');
    document.getElementById('manager_present').hidden = true;
        document.getElementById('manager_not_present').hidden = true;
        option = document.getElementById('inputGroupSelect02').firstChild;
        document.getElementById('inputGroupSelect02').innerHTML = '';
        document.getElementById('inputGroupSelect02').appendChild(option);

        document.getElementById('employee_list').hidden = true;
        document.getElementById('submit-btn').innerText = 'Assign/Change Manager';
        result.classList.add('disabled');
    if(event.target.value != 0){

        fetch(`/employee/getList?plaza_id=${event.target.value}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.code == 0){
                document.getElementById('manager_present').hidden = true;
                document.getElementById('manager_not_present').hidden = false;
                document.getElementById('submit-btn').innerText = 'Assign Manager';
            }
            else{
                document.getElementById('manager_present').hidden = false;
                document.getElementById('manager_not_present').hidden = true; 
                document.getElementById('submit-btn').innerText = 'Change Manager';
            }
            document.getElementById('employee_list').hidden = false; 
            data.employees.forEach(employee => {
                option = document.createElement('option');
                option.value = employee.account_id;
                option.textContent = `Username: ${employee.username}, Name: ${employee.first_name} ${employee.last_name}`;
                console.log(employee);
                document.getElementById('inputGroupSelect02').appendChild(option);
            });
            result.classList.remove('disabled');
        });
    }
    
    
});
