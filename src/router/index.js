import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '@/views/login/login'
import home from '@/views/home/home'
import cookie from "@/util/cookie";

Vue.use(VueRouter)

const routes = [
    {
        path: '/login',
        component: login
    },
    {
        path: '/',
        component: home
    },
    {
        path: '/home',
        name: 'home',
        component: home
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})
/*
* beforeEach:从一个页面跳转到另外一个页面时触发
* to:要跳转的页面
* from:从哪个页面出来
* next:决定是否通过
*/
router.beforeEach((to, from, next) => {
    // 如果跳转的页面不存在，跳转到404页面
    if (to.matched.length === 0) {
        next('/404')
    }
    if (cookie.getCookie("userId")) {
        next()
    } else {
        if (to.path === "/Login") {
            next()
        } else {
            next('/Login')
        }
    }
})
export default router
