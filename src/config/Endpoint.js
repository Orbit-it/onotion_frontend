// API
const uri = "http://192.168.100.170:5000"
const ws = "ws://192.168.100.170:5000"

const Endpoint = {
    login: uri+"/api/auth/login",
    register: uri+"/api/auth/register",
    inventory: uri+"/api/inventory",
    affaires: uri+"/api/demande/affaires",
    postes: uri+"/api/demande/postes",
    request: uri+"/api/demande",
    websocket: ws,
}


export default  Endpoint 