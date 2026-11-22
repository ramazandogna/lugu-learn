import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { createAuthGuard, createRouteAnnouncer, createTitleGuard } from 'rei-kit/app'
import { auth, authReady, isAuthenticated } from './lib/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    role?: 'admin' | 'student'
    /** Reachable before the first-login password change / profile completion. */
    onboarding?: boolean
  }
}

const student: RouteRecordRaw[] = [
  { path: '', name: 'student-home', component: () => import('./features/student/HomeView.vue'), meta: { title: 'Ana sayfa' } },
  { path: 'harita/:assignmentId', name: 'student-map', component: () => import('./features/student/MapView.vue'), meta: { title: 'Öğrenme haritam' } },
  { path: 'ders/:lessonId', name: 'student-lesson', component: () => import('./features/student/lesson/LessonView.vue'), meta: { title: 'Ders' } },
  { path: 'ders/:lessonId/tekrar', name: 'student-replay', component: () => import('./features/student/lesson/LessonView.vue'), props: { replay: true }, meta: { title: 'Dersi tekrar et' } },
  { path: 'basarilar', name: 'student-achievements', component: () => import('./features/student/AchievementsView.vue'), meta: { title: 'Başarılarım' } },
  { path: 'gecmis', name: 'student-history', component: () => import('./features/student/HistoryView.vue'), meta: { title: 'Öğrenme geçmişim' } },
  { path: 'profil', name: 'student-profile', component: () => import('./features/student/ProfileView.vue'), meta: { title: 'Profilim' } },
]

const admin: RouteRecordRaw[] = [
  { path: '', name: 'admin-dashboard', component: () => import('./features/admin/DashboardView.vue'), meta: { title: 'Panel' } },
  { path: 'ogrenciler', name: 'admin-students', component: () => import('./features/admin/students/StudentsView.vue'), meta: { title: 'Öğrenciler' } },
  { path: 'ogrenciler/:studentId', name: 'admin-student', component: () => import('./features/admin/students/StudentProfileView.vue'), meta: { title: 'Öğrenci profili' } },
  { path: 'mufredatlar', name: 'admin-curricula', component: () => import('./features/admin/curricula/CurriculaView.vue'), meta: { title: 'Müfredatlar' } },
  { path: 'mufredatlar/:curriculumId', name: 'admin-curriculum', component: () => import('./features/admin/curricula/CurriculumView.vue'), meta: { title: 'Müfredat' } },
  { path: 'dersler/:lessonId', name: 'admin-lesson', component: () => import('./features/admin/content/LessonContentView.vue'), meta: { title: 'Ders içeriği' } },
  { path: 'analitik', name: 'admin-analytics', component: () => import('./features/admin/analytics/AnalyticsView.vue'), meta: { title: 'Öğrenme analitiği' } },
  { path: 'akademik', name: 'admin-academic', component: () => import('./features/admin/academic/AcademicView.vue'), meta: { title: 'Akademik takip' } },
  { path: 'konusma', name: 'admin-speaking', component: () => import('./features/admin/coaching/SpeakingView.vue'), meta: { title: 'Konuşma & koçluk' } },
  { path: 'konusma/:sessionId', name: 'admin-speaking-session', component: () => import('./features/admin/coaching/SpeakingSessionView.vue'), meta: { title: 'Konuşma oturumu' } },
  { path: 'ayarlar', name: 'admin-settings', component: () => import('./features/admin/settings/SettingsView.vue'), meta: { title: 'Ayarlar' } },
]

const routes: RouteRecordRaw[] = [
  { path: '/giris', name: 'login', component: () => import('./features/auth/LoginView.vue'), meta: { title: 'Giriş', guestOnly: true } },
  {
    path: '/sifre-degistir',
    name: 'change-password',
    component: () => import('./features/auth/ChangePasswordView.vue'),
    meta: { title: 'Şifre değiştir', requiresAuth: true, onboarding: true },
  },
  {
    path: '/profil-tamamla',
    name: 'complete-profile',
    component: () => import('./features/student/CompleteProfileView.vue'),
    meta: { title: 'Profilini tamamla', requiresAuth: true, role: 'student', onboarding: true },
  },
  {
    path: '/',
    component: () => import('./features/student/StudentLayout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: student,
  },
  {
    path: '/admin',
    component: () => import('./features/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: admin,
  },
  ...(import.meta.env.DEV
    ? [{ path: '/dev/design', name: 'dev-design', component: () => import('./design/DesignGallery.vue'), meta: { title: 'Tasarım sistemi' } }]
    : []),
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./features/NotFoundView.vue'), meta: { title: 'Sayfa bulunamadı' } },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

router.beforeEach(
  createAuthGuard({
    isAuthenticated: () => isAuthenticated.value,
    signIn: { name: 'login' },
    ready: authReady,
  }),
)

/**
 * Role and onboarding, after authentication. The role read here only picks a
 * layout: every request is authorised again by RLS on the server.
 */
router.beforeEach((to) => {
  const account = auth.account
  if (!account) return true
  const home = account.role === 'admin' ? { name: 'admin-dashboard' } : { name: 'student-home' }
  if (to.name === 'login') return home
  if (account.mustChangePassword && to.name !== 'change-password' && to.meta.requiresAuth) return { name: 'change-password' }
  if (account.role === 'student' && !account.mustChangePassword && !account.profileComplete && to.name !== 'complete-profile' && to.meta.requiresAuth)
    return { name: 'complete-profile' }
  const required = to.matched.find((r) => r.meta.role)?.meta.role
  if (required && required !== account.role) return home
  if (to.meta.onboarding && !account.mustChangePassword && account.profileComplete && to.name !== 'change-password') return home
  return true
})

router.afterEach(createTitleGuard('Lugu'))
router.afterEach(createRouteAnnouncer({ focus: 'main' }))
