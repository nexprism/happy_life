import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardHero from '../components/dashboard/DashboardHero'
import WeeklyGoals from '../components/dashboard/WeeklyGoals'
import ContinueLearning from '../components/dashboard/ContinueLearning'
import RecentActivity from '../components/dashboard/RecentActivity'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from '../redux/slices/profileSlice'
import { fetchDashboardData } from '../redux/slices/dashboardSlice'
import { fetchSettings } from '../redux/slices/configSlice'
import DashboardLoading from '../components/dashboard/DashboardLoading'

const Dashboard = () => {
   const dispatch = useDispatch()
   const { loading, data: dashData } = useSelector(state => state.dashboard)
   const { settings } = useSelector(state => state.config)

   const activeCourses = dashData?.activeCourses || []
   const hasPaidCourses = activeCourses.length > 0 || (dashData?.profile?.stats?.enrolledCourses > 0) || (dashData?.enrollments?.length > 0)

   useEffect(() => {
      dispatch(fetchUserProfile())
      dispatch(fetchDashboardData())
      dispatch(fetchSettings())
      window.scrollTo(0, 0)

      // Staggered reveal for dashboard modules
      gsap.from('.dash-reveal', {
         y: 20,
         duration: 1,
         stagger: 0.08,
         ease: 'power3.out',
         delay: 0.1
      })
   }, [])
   if (loading) return <DashboardLoading />

   return (
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
         <DashboardHeader />

         <main className="pt-24 pb-16 px-4 lg:px-8 max-w-[1600px] mx-auto relative z-10">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 auto-rows-min relative z-10">
               
               {/* TOP ROW: Hero & Goals */}
               <div className="dash-reveal lg:col-span-8 h-full">
                  <DashboardHero />
               </div>
               
               <div className="dash-reveal lg:col-span-4 h-full flex">
                  <div className="w-full h-full"><WeeklyGoals /></div>
               </div>

               {/* WHATSAPP COMMUNITY BANNER FOR PAID/ENROLLED STUDENTS */}
               {hasPaidCourses && (
                  <div className="dash-reveal lg:col-span-12">
                     <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-5 md:p-6 shadow-md border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-inner">
                              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                 <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                              </svg>
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h3 className="font-montserrat font-bold text-base md:text-lg tracking-tight">Student WhatsApp Community</h3>
                                 <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-100 rounded-full border border-white/20">Official Batch Group</span>
                              </div>
                              <p className="text-xs text-emerald-100 mt-1 max-w-xl font-normal leading-relaxed">
                                 Join your course community for live class alerts, direct mentor discussions, study resources, and batch updates.
                              </p>
                           </div>
                        </div>

                        <a
                           href={settings?.whatsappCommunityLink || 'https://chat.whatsapp.com/invite'}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="relative z-10 self-stretch sm:self-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 px-5 py-3 rounded-xl font-bold text-xs md:text-sm tracking-wide shadow-md hover:shadow-lg transition-all"
                        >
                           <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                           </svg>
                           <span>Join Community</span>
                           <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                           </svg>
                        </a>
                     </div>
                  </div>
               )}

               {/* MIDDLE ROW: Continue Learning Banner (if available) */}
               <div className="dash-reveal lg:col-span-12">
                  <ContinueLearning />
               </div>

               {/* STATS & SIDEBAR SECTION: Full width */}
               <div className="dash-reveal lg:col-span-12">
                  <DashboardSidebar />
               </div>

               {/* BOTTOM ROW: Recent Activity */}
               <div className="dash-reveal lg:col-span-12 mt-2">
                  <RecentActivity />
               </div>

            </div>
         </main>

         {/* Floating Messenger */}
         <div className="fixed bottom-10 right-10 z-[100]">
            <button className="w-14 h-14 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 hover:scale-110 active:scale-95 transition-all group border border-amber-300">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-950">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
               </svg>
               <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
         </div>

      </div>
   )
}

export default Dashboard
