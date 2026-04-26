import { Link } from 'react-router-dom';
import { Calendar, Tag, CheckCircle } from 'lucide-react';
import type { Campaign } from '../../types';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';

interface CampaignCardProps {
  campaign: Campaign;
  showDonate?: boolean;
  onViewDetails?: (id: string) => void;
  onDonate?: (id: string) => void;
}

export default function CampaignCard({ campaign, showDonate = true, onViewDetails, onDonate }: CampaignCardProps) {
  const authorName = campaign.is_anonymous ? 'Anonymous' : (campaign.author || 'Student');
  const avatarSrc = campaign.is_anonymous ? undefined : campaign.avatar_url || undefined;
  const isCompleted = campaign.status === 'completed' || campaign.current_amount >= campaign.target_amount;

  const createdDate = new Date(campaign.created_at).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`rounded-2xl border shadow-sm transition-all duration-300 flex flex-col overflow-hidden group
      ${isCompleted
        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75 grayscale-[30%]'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
      }`}
    >
      {/* Header strip */}
      <div className={`h-1.5 rounded-t-2xl ${isCompleted ? 'bg-emerald-400' : 'bg-linear-to-r from-primary-400 to-primary-600'}`} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          <Avatar src={avatarSrc} name={authorName} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{authorName}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Calendar size={10} />
              <span>{createdDate}</span>
            </div>
          </div>
          {isCompleted ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle size={10} /> Fully Funded
            </span>
          ) : campaign.category && (
            <span className="ml-auto flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full capitalize">
              <Tag size={10} />
              {campaign.category}
            </span>
          )}
        </div>

        {/* Title & description */}
        <div className="flex-1">
          <h3 className={`font-display font-semibold text-base leading-snug line-clamp-2 mb-1.5 transition-colors
            ${isCompleted
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400'
            }`}
          >
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{campaign.description}</p>
        </div>

        {/* Amount raised */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className={`font-bold text-sm ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-700 dark:text-primary-400'}`}>
              UGX {campaign.current_amount.toLocaleString()}
            </span>
            {' '}raised of UGX {campaign.target_amount.toLocaleString()}
          </p>
          <ProgressBar current={campaign.current_amount} target={campaign.target_amount} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {onViewDetails ? (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(campaign.id)}>
              View Details
            </Button>
          ) : (
            <Link to={`/campaigns/${campaign.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">View Details</Button>
            </Link>
          )}
          {showDonate && !isCompleted && (
            onDonate ? (
              <Button variant="primary" size="sm" className="flex-1" onClick={() => onDonate(campaign.id)}>
                Donate
              </Button>
            ) : (
              <Link to={`/campaigns/${campaign.id}#donate`} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">Donate</Button>
              </Link>
            )
          )}
          {showDonate && isCompleted && (
            <div className="flex-1 flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Goal reached!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
