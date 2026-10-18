import { Suspense } from 'react'
import { currentUserRole } from '@/modules/auth/actions'
import { Navbar } from '@/modules/home/components/navbar'
import { NavbarSkeleton } from '@/modules/home/components/navbar-skeleton'
import React from 'react'

async function DynamicNavbar() {
  const userRole = await currentUserRole();
  return <Navbar userRole={userRole} />;
}

const RootLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <main className='flex flex-col min-h-screen'>
      <Suspense fallback={<NavbarSkeleton />}>
        <DynamicNavbar />
      </Suspense>

      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#dadde2_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)]" />
      {children}
    </main>
  )
}

export default RootLayout