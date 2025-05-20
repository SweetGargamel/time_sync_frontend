import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/query',
      name: 'query',
      component: () => import('../views/QueryView.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../views/UpLoadEventsView.vue'),
    },
    {
      path: '/events',
      name: 'event',
      component: () => import('../views/ChangeEvents.vue'),
    },
    {
      path: '/person',
      name: 'person',
      component: () => import('../views/UpdatePersonView.vue'),
    },

    // {
    //   path: '/clip',
    //   name: 'clip',
    //   component: () => import('../views/Clip.vue'),
    // },
  ],
})

export default router
