var connect = document.querySelector('#connect');
var ip = document.querySelector('#ip');
var port = document.querySelector('#port');
var vehicle_id_f = document.querySelector('#vehicle_id');
var vehicle_no_f = document.querySelector('#vehicle_no');
var vehicle_balance_f = document.querySelector('#vehicle_balance');
var vehicle_type_f = document.querySelector('#vehicle_type');
var collect_cash_button = document.querySelector('#collect_cash');
var collect_type_alert = document.querySelector('#collection_type');
var collection_amount = document.querySelector('#collection_amount');
var state = 'disconnectedState';
tollPlaza = {}
connect.onclick = function (event) {
    
    var conn = `ws://${ip.value}:${port.value}/`;
    console.log(conn);
    websocket = new WebSocket(conn);
    connect.disabled = true;
websocket.onopen = (event) =>{
    state = 'connected';
    console.log(state);
    document.querySelector('#connected_status').hidden = false;
    fetch(`/tollBooth/details?booth_id=99456520181252112`)
        .then(response => response.json())
        .then(data => {
            tollPlaza = data;
            websocket.send(JSON.stringify({state: 'connected', data: data}));
            console.log(data);
        });
    
    state = 'wait_for_vehicle';
}
   
websocket.onmessage = function (event) {
    data = JSON.parse(event.data)
    if(state == 'wait_for_vehicle' && data.state=="read_complete_state"){
        console.log('vehicle received')
        vehicle_id = data.vehicle_id.trim();
        console.log(vehicle_id);
        fetch(`/vehicle/details?vehicle_id=${vehicle_id}`)
        .then(response => response.json())
        .then(data => {
            vehicle_id_f.value = data.vehicle_id;
            vehicle_no_f.value = data.vehicle_no;
            vehicle_balance_f.value = data.balance;
            vehicle_type_f.value = data.vehicle_type;
            websocket.send(JSON.stringify({state:"read_complete_state", vehicle_no: data.vehicle_no, vehicle_balance: data.balance, vehicle_type: data.vehicle_type}));
            
            for(var i=0; i<3; i++){
                if(tollPlaza.charges[i].vehicle_type == data.vehicle_type){
                    
                    if(tollPlaza.charges[i].amount < data.balance){
                        fetch(`/vehicle/arrived?vehicle_id=${vehicle_id}&booth_id=99456520181252112&type=automated`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        data.state = 'deducted_balance'
                        websocket.send(JSON.stringify(data));
                    });
                        collect_type_alert.hidden = false;
                    }
                
                else{
                    collection_amount.innerHTML = `Collect Cash : ${tollPlaza.charges[i].amount+tollPlaza.charges[i].fine} (Base: ${tollPlaza.charges[i].amount}, Fine ${tollPlaza.charges[i].fine})`;
                    collection_amount.hidden = false;
                    collect_cash_button.disabled = false;
                    collect_cash_button.onclick = (event)=>{
                    fetch(`/vehicle/arrived?vehicle_id=${vehicle_id}&booth_id=99456520181252112&type='cash`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        data.state = 'deducted_balance'
                        websocket.send(JSON.stringify(data));
                    });
                    collect_cash_button.disabled=true;
                    };
                }
                state = 'end_state';
                
            }
            }
        });


        
    }

    if(state == 'end_state' && data.state == 'end_state'){
        state = 'wait_for_vehicle';
        vehicle_id_f.value = '';
            vehicle_no_f.value = '';
            vehicle_balance_f.value = '';
            vehicle_type_f.value = '';
            collection_amount.hidden = true;
            collect_type_alert.hidden =true;
        websocket.send(JSON.stringify({state: 'start_read'}));
    }
    data = JSON.parse(event.data);
    console.log(data);
    
};
}