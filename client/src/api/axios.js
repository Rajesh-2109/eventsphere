import axios from 'axios';const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api/v1',timeout:20000});
api.interceptors.request.use(c=>{const t=localStorage.getItem('es_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c;});
api.interceptors.response.use(r=>r.data,e=>{if(e.response?.status===401){localStorage.removeItem('es_token');localStorage.removeItem('es_user');}return Promise.reject(e.response?.data||{message:e.message||'Network error'});});export default api;
