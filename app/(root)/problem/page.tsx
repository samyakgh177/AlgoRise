import { Suspense } from 'react'
import { getCurrentUserData } from '@/modules/auth/actions'
import { getAllProblems } from '@/modules/problems/actions';
import ProblemsTable from '@/modules/problems/components/problems-table';
import React from 'react'
import { Spinner } from '@/components/ui/spinner';

const ProblemsContent = async () => {
    const user = await getCurrentUserData();

    const {data:problems , error} = await getAllProblems();

    console.log("Problems Data:", problems);

    if(error){
          return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading problems: {error}</p>
      </div>
    );
    }

  return (
    <div className='container mx-auto py-32'>
        <ProblemsTable problems={problems} user={user}/>
    </div>
  )
}

const ProblemsPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    }>
      <ProblemsContent />
    </Suspense>
  )
}

export default ProblemsPage