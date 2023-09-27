import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://mate.academy/students-api',
});

export default instance;
