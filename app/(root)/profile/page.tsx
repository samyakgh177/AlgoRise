import { Suspense } from 'react'
import { getCurrentUserData } from '@/modules/auth/actions'
import { SubmissionHistory } from '@/modules/problems/components/submit-history'
import PlaylistsSection from '@/modules/profile/components/playlist-section'
import ProfileStats from '@/modules/profile/components/profile-stats'
import SolvedProblems from '@/modules/profile/components/solved-problems'
import UserInfoCard from '@/modules/profile/components/user-info-card'
import { redirect } from 'next/navigation'
import React from 'react'
import { Spinner } from '@/components/ui/spinner'

const ProfileContent = async () => {
  const profileData = await getCurrentUserData()

  if (!profileData) {
    redirect('/sign-in')
  }

  return (
    <div className='min-h-screen py-32'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <UserInfoCard userData={profileData} />

        <ProfileStats
          submissions={profileData.submissions ?? []}
          solvedCount={profileData.solvedProblems?.length ?? 0}
          playlistCount={profileData.playlists?.length ?? 0}
        />

        <SubmissionHistory submissions={profileData.submissions ?? []} />

        <div className='grid gap-8 mt-8'>
          <SolvedProblems solvedProblems={profileData.solvedProblems ?? []} />
          <PlaylistsSection playlists={profileData.playlists ?? []} />
        </div>
      </div>
    </div>
  )
}

const ProfilePage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}

export default ProfilePage