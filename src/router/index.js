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
import RoutineListView from '@/views/RoutineListView.vue'
import RoutineEdit from '@/views/RoutineEdit.vue'
import StudentIdCard from '@/views/StudentIdCard.vue'
import TeacherIdCard from '@/views/TeacherIdCard.vue'
import TakeAttendance from '@/views/TakeAttendance.vue'
import AttendanceReport from '@/views/AttendanceReport.vue'
import AttendancePrint from '@/views/AttendancePrint.vue'
import GeneralSettings from '@/views/GeneralSettings.vue'
import ExamList from '@/views/ExamList.vue'
import MarksEntry from '@/views/MarksEntry.vue'

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
        {
          path: '/admin/routines', // লিস্ট দেখার রাউট
          name: 'routines.index',
          component: () => import('../views/RoutineListView.vue'),
        },
        {
          path: '/admin/routines/edit/:id',
          name: 'RoutineEdit',
          component: RoutineEdit,
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/students/id-card/:id',
          name: 'StudentIdCard',
          component: StudentIdCard,
        },
        {
          path: '/admin/teachers/id-card/:id',
          name: 'TeacherIdCard',
          component: TeacherIdCard,
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/attendance/take',
          name: 'TakeAttendance',
          component: TakeAttendance,
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/attendance/report', // ব্রাউজারে এই লিঙ্কে রিপোর্ট দেখা যাবে
          name: 'AttendanceReport',
          component: () => import('../views/AttendanceReport.vue'), // আপনার তৈরি করা কম্পোনেন্ট ফাইল
          meta: { requiresAuth: true },
        },
        {
          path: '/attendance/print-report',
          name: 'AttendancePrint',
          component: () => import('../views/AttendancePrint.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/settings',
          name: 'GeneralSettings',
          component: () => import('../views/GeneralSettings.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/exam/list',
          name: 'ExamList',
          component: () => import('../views/ExamList.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/exam/marks-entry',
          name: 'MarksEntry',
          component: () => import('../views/MarksEntry.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
})

export default router
