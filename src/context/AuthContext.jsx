import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedDemo = localStorage.getItem('careerpilot_demo_user')
      if (savedDemo) return JSON.parse(savedDemo)
      const cached = localStorage.getItem('careerpilot_auth_user')
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  })
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(() => {
    try {
      const savedDemo = localStorage.getItem('careerpilot_demo_user')
      if (savedDemo) {
        const parsed = JSON.parse(savedDemo)
        return parsed.profile || parsed
      }
    } catch {}
    return null
  })
  const [loading, setLoading] = useState(() => {
    try {
      if (localStorage.getItem('careerpilot_demo_user')) return false
    } catch {}
    return true
  })

  // Multiple Target Profiles per user
  const [targetProfiles, setTargetProfiles] = useState([])
  const [activeProfile, setActiveProfile] = useState(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const isConfigured = isSupabaseConfigured()

  // Helper to load multiple target profiles
  const loadTargetProfiles = useCallback(async (userId, currentUser, mainProfile) => {
    if (!userId) return

    const storageKey = `careerpilot_target_profiles_${userId}`
    let loaded = []

    if (isConfigured && !userId.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('user_target_profiles')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })

        if (!error && Array.isArray(data) && data.length > 0) {
          loaded = data
        }
      } catch (err) {
        console.warn('Could not query user_target_profiles table, using local cache:', err)
      }
    }

    // Fallback to localStorage cache
    if (loaded.length === 0) {
      try {
        const local = localStorage.getItem(storageKey)
        if (local) {
          const parsed = JSON.parse(local)
          if (Array.isArray(parsed) && parsed.length > 0) {
            loaded = parsed
          }
        }
      } catch {}
    }

    // Check if user has no target profiles setup yet
    if (loaded.length === 0) {
      const existingRole =
        mainProfile?.target_job_role || currentUser?.user_metadata?.target_job_role

      // If user has a preexisting non-null target role from previous sessions
      if (existingRole && existingRole !== 'None' && existingRole !== '') {
        const initialProfile = {
          id: 'prof-' + Date.now(),
          user_id: userId,
          profile_name: `${existingRole} Track`,
          target_job_role: existingRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        loaded = [initialProfile]
        try {
          localStorage.setItem(storageKey, JSON.stringify(loaded))
        } catch {}
      } else {
        // First login / fresh registration: Prompt user to choose target job role!
        setNeedsOnboarding(true)
        setTargetProfiles([])
        setActiveProfile(null)
        return
      }
    }

    setTargetProfiles(loaded)
    const active = loaded.find((p) => p.is_active) || loaded[0]
    setActiveProfile(active)
    setNeedsOnboarding(false)
  }, [isConfigured])

  // Securely log user activity without passwords or tokens
  const logActivity = useCallback(async (userId, activityType, metadata = {}) => {
    if (!isConfigured || !userId || userId.startsWith('demo-')) return
    try {
      await supabase.from('user_activity_logs').insert([
        {
          user_id: userId,
          activity_type: activityType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        },
      ])
    } catch (err) {
      console.warn('Could not record activity log:', err)
    }
  }, [isConfigured])

  // Fetch student profile from public.profiles table
  const fetchProfile = useCallback(async (userId, currentUser) => {
    if (!isConfigured || !userId || userId.startsWith('demo-')) {
      // Default placeholder fallback profile
      const demoProfile = currentUser?.profile || {
        id: userId || 'demo-user',
        full_name: currentUser?.user_metadata?.full_name || 'Demo User',
        college: currentUser?.user_metadata?.college || 'University Student',
        degree: currentUser?.user_metadata?.degree || 'B.Tech',
        branch: currentUser?.user_metadata?.branch || 'Computer Science',
        graduation_year: currentUser?.user_metadata?.graduation_year || '2026',
        target_job_role: currentUser?.user_metadata?.target_job_role || '',
        avatar_url: null,
      }
      setProfile(demoProfile)
      await loadTargetProfiles(userId, currentUser, demoProfile)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message)
      }

      let activeProf = data
      if (data) {
        setProfile(data)
      } else if (currentUser) {
        // If trigger hasn't completed or profile is missing, fallback to metadata
        const fallback = {
          id: userId,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student',
          college: currentUser.user_metadata?.college || '',
          degree: currentUser.user_metadata?.degree || '',
          branch: currentUser.user_metadata?.branch || '',
          graduation_year: currentUser.user_metadata?.graduation_year || '2026',
          target_job_role: currentUser.user_metadata?.target_job_role || '',
          avatar_url: null,
        }
        setProfile(fallback)
        activeProf = fallback
      }

      await loadTargetProfiles(userId, currentUser, activeProf)
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }, [isConfigured, loadTargetProfiles])

  // Listen to auth state changes (persistent session handling)
  useEffect(() => {
    let mounted = true

    // 1. ALWAYS check if user set a demo session in localStorage first
    const savedDemo = localStorage.getItem('careerpilot_demo_user')
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo)
        if (mounted) {
          setUser(parsed)
          setProfile(parsed.profile || parsed)
          loadTargetProfiles(parsed.id, parsed, parsed.profile || parsed)
          setLoading(false)
        }
        return () => {
          mounted = false
        }
      } catch {
        localStorage.removeItem('careerpilot_demo_user')
      }
    }

    if (!isConfigured) {
      setLoading(false)
      return () => {
        mounted = false
      }
    }

    // 2. Check active Supabase session on mount (only if not demo user)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      // Safety check: if demo user was saved, never let null Supabase session overwrite
      if (localStorage.getItem('careerpilot_demo_user')) return

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          localStorage.setItem('careerpilot_auth_user', JSON.stringify(session.user))
        } catch {}
        fetchProfile(session.user.id, session.user)
      } else {
        localStorage.removeItem('careerpilot_auth_user')
      }
      setLoading(false)
    }).catch(() => {
      if (!mounted) return
      setLoading(false)
    })

    // 3. Listen for auth events (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return
        if (localStorage.getItem('careerpilot_demo_user')) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          try {
            localStorage.setItem('careerpilot_auth_user', JSON.stringify(currentSession.user))
          } catch {}
          await fetchProfile(currentSession.user.id, currentSession.user)
        } else {
          localStorage.removeItem('careerpilot_auth_user')
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [isConfigured, fetchProfile, loadTargetProfiles])

  // Signup with Supabase (Does NOT ask for target job role at registration)
  const signUp = async ({
    email,
    password,
    fullName,
    college,
    degree,
    branch,
    graduationYear,
  }) => {
    if (!isConfigured) {
      // Demo mode fallback
      const demoUser = {
        id: 'demo-' + Date.now(),
        email,
        user_metadata: {
          full_name: fullName,
          college,
          degree,
          branch,
          graduation_year: graduationYear,
        },
      }
      const demoProfile = {
        id: demoUser.id,
        full_name: fullName,
        college,
        degree,
        branch,
        graduation_year: graduationYear,
        target_job_role: '',
        avatar_url: null,
      }
      setUser(demoUser)
      setProfile(demoProfile)
      setTargetProfiles([])
      setActiveProfile(null)
      setNeedsOnboarding(true)
      localStorage.setItem('careerpilot_demo_user', JSON.stringify({ ...demoUser, profile: demoProfile }))
      return { data: { user: demoUser }, error: null, needsEmailConfirmation: false }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          college,
          degree,
          branch,
          graduation_year: graduationYear,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) return { data: null, error, needsEmailConfirmation: false }

    const needsEmailConfirmation = data.user && !data.session

    // If user got an instant session (email confirmation off in Supabase)
    if (data.user && data.session) {
      await logActivity(data.user.id, 'REGISTRATION_SUCCESS', { email })
      await fetchProfile(data.user.id, data.user)
    }

    return { data, error: null, needsEmailConfirmation }
  }

  // Sign in with Supabase
  const signIn = async ({ email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase()
    const isDemoEmail =
      cleanEmail === 'demo@careerpilot.ai' ||
      cleanEmail === 'demo.student@careerpilot.ai' ||
      cleanEmail === 'demo@example.com' ||
      cleanEmail.includes('demo')

    if (!isConfigured || isDemoEmail) {
      // Clean Fresh Demo Account:
      // Starts with 0 profiles and needsOnboarding = true so you can set your own target role,
      // create multiple profiles, and upload your own CV from scratch.
      const demoUser = {
        id: 'demo-student-clean',
        email: email || 'demo@careerpilot.ai',
        user_metadata: { full_name: 'Demo User' },
      }
      const demoProfile = {
        id: 'demo-student-clean',
        full_name: 'Demo User',
        college: 'University Student',
        degree: 'B.Tech',
        branch: 'Computer Science',
        graduation_year: '2026',
        target_job_role: '',
        avatar_url: null,
      }

      // Clear any leftover demo mock data so user starts completely clean
      try {
        localStorage.removeItem('careerpilot_target_profiles_demo-student-clean')
        localStorage.removeItem('careerpilot_resumes_demo-student-clean')
        localStorage.removeItem('careerpilot_roadmap_progress')
        localStorage.removeItem('careerpilot_resumes_demo-user-123')
      } catch {}

      setUser(demoUser)
      setProfile(demoProfile)
      setTargetProfiles([])
      setActiveProfile(null)
      setNeedsOnboarding(true) // Triggers the target role onboarding prompt on login!
      localStorage.setItem('careerpilot_demo_user', JSON.stringify({ ...demoUser, profile: demoProfile }))
      return { data: { user: demoUser }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { data: null, error }

    if (data.user) {
      // Log successful login timestamp in user_activity_logs
      await logActivity(data.user.id, 'LOGIN', {
        provider: 'email',
        time: new Date().toISOString(),
      })
      await fetchProfile(data.user.id, data.user)
    }

    return { data, error: null }
  }

  // Sign out
  const signOut = async () => {
    if (user?.id) {
      await logActivity(user.id, 'LOGOUT')
    }

    if (isConfigured) {
      try {
        await supabase.auth.signOut()
      } catch {}
    }

    localStorage.removeItem('careerpilot_demo_user')
    localStorage.removeItem('careerpilot_auth_user')
    localStorage.removeItem('careerpilot_target_profiles_demo-student-clean')
    localStorage.removeItem('careerpilot_resumes_demo-student-clean')
    localStorage.removeItem('careerpilot_analyses_demo-student-clean')
    localStorage.removeItem('careerpilot_roadmap_demo-student-clean')

    setUser(null)
    setSession(null)
    setProfile(null)
    setTargetProfiles([])
    setActiveProfile(null)
    setNeedsOnboarding(false)
  }

  // Send password reset email
  const resetPassword = async (email) => {
    if (!isConfigured) {
      return { data: {}, error: null }
    }

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  // Update password
  const updatePassword = async (newPassword) => {
    if (!isConfigured) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (!error && user?.id) {
      await logActivity(user.id, 'PASSWORD_UPDATED')
    }

    return { data, error }
  }

  // Update profile
  const updateProfile = async (updates) => {
    if (!user?.id) return { data: null, error: new Error('User not authenticated') }

    if (!isConfigured) {
      const updated = { ...profile, ...updates }
      setProfile(updated)
      localStorage.setItem(
        'careerpilot_demo_user',
        JSON.stringify({ ...user, profile: updated })
      )
      return { data: updated, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) return { data: null, error }

      setProfile(data)
      await logActivity(user.id, 'PROFILE_UPDATED', { fields: Object.keys(updates) })
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // Create a new target job profile under this email account (1 job target per profile)
  const createTargetProfile = async ({ profile_name, target_job_role, set_active = true }) => {
    if (!user?.id) return { data: null, error: new Error('User not authenticated') }

    const cleanRole = target_job_role.trim()
    const cleanName = profile_name.trim() || `${cleanRole} Track`
    const storageKey = `careerpilot_target_profiles_${user.id}`

    const newProfile = {
      id: 'prof-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      user_id: user.id,
      profile_name: cleanName,
      target_job_role: cleanRole,
      is_active: set_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedList = targetProfiles.map((p) => (set_active ? { ...p, is_active: false } : p))
    updatedList.push(newProfile)

    setTargetProfiles(updatedList)
    if (set_active) {
      setActiveProfile(newProfile)
      setNeedsOnboarding(false)
    }

    // Persist to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList))
    } catch {}

    // Persist to Supabase if configured
    if (isConfigured) {
      try {
        if (set_active) {
          await supabase
            .from('user_target_profiles')
            .update({ is_active: false })
            .eq('user_id', user.id)
        }
        await supabase.from('user_target_profiles').insert([newProfile])
      } catch (err) {
        console.warn('Supabase target profile insert fallback:', err)
      }
    }

    if (set_active) {
      await updateProfile({ target_job_role: cleanRole })
      window.dispatchEvent(
        new CustomEvent('careerpilot_profile_switched', { detail: newProfile })
      )
    }

    return { data: newProfile, error: null }
  }

  // Switch active target profile
  const switchActiveProfile = async (profileId) => {
    if (!user?.id) return
    const target = targetProfiles.find((p) => p.id === profileId)
    if (!target) return

    const updatedList = targetProfiles.map((p) => ({
      ...p,
      is_active: p.id === profileId,
    }))

    setTargetProfiles(updatedList)
    setActiveProfile(target)

    const storageKey = `careerpilot_target_profiles_${user.id}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList))
    } catch {}

    if (isConfigured) {
      try {
        await supabase
          .from('user_target_profiles')
          .update({ is_active: false })
          .eq('user_id', user.id)

        await supabase
          .from('user_target_profiles')
          .update({ is_active: true })
          .eq('id', profileId)
      } catch (err) {
        console.warn('Supabase switch profile fallback:', err)
      }
    }

    await updateProfile({ target_job_role: target.target_job_role })
    window.dispatchEvent(
      new CustomEvent('careerpilot_profile_switched', { detail: target })
    )
  }

  // Delete a target profile (cannot delete if it's the only one)
  const deleteTargetProfile = async (profileId) => {
    if (targetProfiles.length <= 1) {
      return { error: new Error('You must keep at least one target profile.') }
    }

    const remaining = targetProfiles.filter((p) => p.id !== profileId)
    const wasActive = activeProfile?.id === profileId
    let newActive = activeProfile

    if (wasActive) {
      remaining[0].is_active = true
      newActive = remaining[0]
      setActiveProfile(newActive)
      await updateProfile({ target_job_role: newActive.target_job_role })
      window.dispatchEvent(
        new CustomEvent('careerpilot_profile_switched', { detail: newActive })
      )
    }

    setTargetProfiles(remaining)
    const storageKey = `careerpilot_target_profiles_${user?.id}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(remaining))
    } catch {}

    if (isConfigured && user?.id) {
      try {
        await supabase.from('user_target_profiles').delete().eq('id', profileId)
        if (wasActive) {
          await supabase
            .from('user_target_profiles')
            .update({ is_active: true })
            .eq('id', newActive.id)
        }
      } catch (err) {
        console.warn('Supabase delete profile fallback:', err)
      }
    }

    return { error: null }
  }

  // Update target profile metadata
  const updateTargetProfile = async (profileId, updates) => {
    const updatedList = targetProfiles.map((p) => {
      if (p.id === profileId) {
        return { ...p, ...updates, updated_at: new Date().toISOString() }
      }
      return p
    })
    setTargetProfiles(updatedList)

    const updatedActive = updatedList.find((p) => p.is_active)
    if (updatedActive && updates.target_job_role) {
      setActiveProfile(updatedActive)
      await updateProfile({ target_job_role: updates.target_job_role })
      window.dispatchEvent(
        new CustomEvent('careerpilot_profile_switched', { detail: updatedActive })
      )
    }

    const storageKey = `careerpilot_target_profiles_${user?.id}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList))
    } catch {}

    if (isConfigured && user?.id) {
      try {
        await supabase.from('user_target_profiles').update(updates).eq('id', profileId)
      } catch (err) {}
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    isConfigured,
    targetProfiles,
    activeProfile,
    needsOnboarding,
    setNeedsOnboarding,
    createTargetProfile,
    switchActiveProfile,
    deleteTargetProfile,
    updateTargetProfile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    logActivity,
    refreshProfile: () => user && fetchProfile(user.id, user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

