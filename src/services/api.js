import axios from 'axios';

const apiClient = axios.create({
  //baseURL: 'http://localhost:4000/api/', //local
  baseURL: 'https://backupteamsapis.ue.r.appspot.com/api/', //prod google
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
