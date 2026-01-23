import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import StudentsView from '../views/StudentsView.vue'
import MainLayout from '../layouts/MainLayout.vue' // লেআউট ইমপোর্ট
import TeachersView from '../views/TeachersView.vue'
import StudentCreateView from '../views/StudentCreateView.vue'
import StudentEditView from '../views/StudentEditView.vue'
import StudentDetailsView from '@/views/StudentDetailsView.vue'
import TeacherCreateView from '@/views/TeacherCreateView.vue'
import TeacherEditView from '@/views/TeacherEditView.vue'
import TeacherProfileView from '@/views/TeacherProfileView.vue'

import RoutineCreateView from '@/views/RoutineCreateView.vue'
import SubjectCreateView from '@/views/SubjectCreateView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    // Protected Routes (যেখানে লেআউট লাগবে)
    {
      path: '/admin',
      component: MainLayout, // প্যারেন্ট লেআউট
      children: [
        {
          path: 'dashboard', // লিংক হবে: /admin/dashboard
          component: DashboardView,
        },
        {
          path: 'students', // লিংক হবে: /admin/students
          component: StudentsView,
        },

        {
          path: 'teachers', // নতুন রাউট
          component: TeachersView,
        },
        {
          path: 'students/create',
          name: 'students-create',
          component: StudentCreateView,
        },
        {
          path: 'students/edit/:id', // :id মানে এখানে স্টুডেন্টের আইডি বসবে
          name: 'students-edit',
          component: StudentEditView,
        },
        {
          path: 'students/view/:id',
          name: 'students-view',
          component: StudentDetailsView,
        },
        {
          path: '/admin/teachers/create',
          name: 'teachers.create',
          component: () => import('../views/TeacherCreateView.vue'),
        },
        {
          path: '/admin/teachers/edit/:id',
          name: 'teachers.edit',
          component: () => import('../views/TeacherEditView.vue'),
        },
        {
          path: '/admin/teachers/view/:id', // আলাদা ইউআরএল
          name: 'teachers.view',
          component: () => import('../views/TeacherProfileView.vue'),
        },
        {
          path: '/admin/routines/create',
          name: 'routines.create',
          component: () => import('../views/RoutineCreateView.vue'),
        },
        {
          path: '/admin/academic/subjects',
          name: 'academic.subjects',
          component: () => import('../views/SubjectCreateView.vue'),
        },
      ],
    },
  ],
})

export default router
