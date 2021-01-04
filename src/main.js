import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css';
import './assets/css/index.css'
import axios from "axios";
import cookie from "@/util/cookie";

Vue.use(ViewUI);
Vue.config.productionTip = false
Vue.prototype.axios = axios
Vue.prototype.cookie = cookie
axios.defaults.baseURL = '/api'  //关键代码

new Vue({
    router,
    store,
    data() {
        return {
            userName: '',
            isLogin: false
        }
    },
    render: h => h(App)
}).$mount('#app')
