import React from 'react';
import { BarChart3, Target, Clock, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';



interface ProfileStatsProps {
  submissions?: Array<{ status?: string }> | null;
  solvedCount?: number | null;
  playlistCount?: number | null;
}

const ProfileStats = ({
  submissions = [],
  solvedCount = 0,
  playlistCount = 0,
}: ProfileStatsProps) => {
  const subs = submissions ?? [];
  const acceptedSubmissions = subs.filter((s) => s?.status === "Accepted").length;

  const successRate =
    subs.length > 0 ? Math.round((acceptedSubmissions / subs.length) * 100) : 0;

  const stats = [
    {
      icon: Target,
      label: 'Success Rate',
      value: `${successRate}%`,
      iconColor: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/50'
    },
    {
      icon: BarChart3,
      label: 'Total Submissions',
      value: subs.length.toString(),
      iconColor: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50'
    },
    {
      icon: Award,
      label: 'Problems Solved',
      value: (solvedCount ?? 0).toString(),
      iconColor: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50'
    },
    {
      icon: Clock,
      label: 'Playlists Created',
      value: (playlistCount ?? 0).toString(),
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} hover:shadow-md transition-all duration-200`}
          >
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileStats;