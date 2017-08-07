import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Optimization from '@/components/Optimization'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/optimization',
            name: 'Optimization',
            component: Optimization
        },
        {
            path: '/hello',
            name: 'Hello',
            component: Hello
        }
    ]
})
