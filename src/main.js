import {createApp} from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
// import store from './store';
import {createPinia} from "pinia";

const app = createApp(App);
const pinia = createPinia();

// app.use(store)
app.use(router);
app.use(ElementPlus);
app.use(pinia)
app.mount('#app');
