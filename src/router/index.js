import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import StudentsView from '../views/StudentsView.vue'
import MainLayout from '../layouts/MainLayout.vue'
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
import ReportCard from '../views/ReportCard.vue'
import TabulationSheet from '../views/TabulationSheet.vue'
import Fees from '../views/Fees.vue'

// ✅ Student Portal Imports
import StudentLayout from '../layouts/StudentLayout.vue'
import StudentDashboard from '../views/student/StudentDashboard.vue'
import StudentChangePassword from '../views/student/StudentChangePassword.vue'
import StudentRoutine from '../views/student/StudentRoutine.vue'
import StudentResults from '../views/student/StudentResults.vue'
import StudentFees from '../views/student/StudentFees.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },

    // 🛡️ ADMIN ROUTES (MainLayout)
    {
      path: '/admin',
      component: MainLayout,
      // meta: { requiresAuth: true, role: 'admin' }, // রোল চেক লজিক পরে লাগলে আনকমেন্ট করবেন
      children: [
        {
          path: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'students',
          component: StudentsView,
        },
        {
          path: 'teachers',
          component: TeachersView,
        },
        {
          path: 'students/create',
          name: 'students-create',
          component: StudentCreateView,
        },
        {
          path: 'students/edit/:id',
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
          path: '/admin/teachers/view/:id',
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
          path: '/admin/routines',
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
          path: '/admin/attendance/report',
          name: 'AttendanceReport',
          component: () => import('../views/AttendanceReport.vue'),
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
          path: '/admin/exam/list',
          name: 'ExamList',
          component: () => import('../views/ExamList.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/exam/marks-entry',
          name: 'MarksEntry',
          component: () => import('../views/MarksEntry.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/report-card',
          name: 'ReportCard',
          component: ReportCard,
          meta: { requiresAuth: true },
        },
        {
          path: '/tabulation-sheet',
          name: 'TabulationSheet',
          component: TabulationSheet,
          meta: { requiresAuth: true },
        },
        {
          path: '/fees',
          name: 'Fees',
          component: Fees,
          meta: { requiresAuth: true },
        },
      ],
    },

    // 🎓 STUDENT ROUTES (NEW)
    {
      path: '/student',
      component: StudentLayout,
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: 'dashboard',
          component: StudentDashboard,
        },
        // ভবিষ্যতে রুটিন, রেজাল্ট ইত্যাদি এখানে যোগ হবে
        { path: 'change-password', component: StudentChangePassword },
        { path: 'routine', component: StudentRoutine },
        { path: 'results', component: StudentResults },
        { path: 'fees', component: StudentFees },
      ],
    },
  ],
})

export default router
