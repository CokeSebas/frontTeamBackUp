import axios from 'axios';

const apiClient = axios.create({
  //baseURL: 'http://localhost:4000/api/', //local
  baseURL: 'https://backteampokemonbackup.onrender.com/api/', //prod
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
