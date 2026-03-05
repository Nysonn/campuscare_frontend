import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import type { Campaign } from '../../types';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';

interface CampaignCardProps {
  campaign: Campaign;
  showDonate?: boolean;
}

export default function CampaignCard({ campaign, showDonate = true }: CampaignCardProps) {
  const authorName = campaign.is_anonymous ? 'Anonymous' : (campaign.author || 'Student');
  const avatarSrc = campaign.is_anonymous ? undefined : campaign.avatar_url || undefined;

  const createdDate = new Date(campaign.created_at).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Header strip */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-t-2xl" />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          <Avatar src={avatarSrc} name={authorName} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{authorName}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={10} />
              <span>{createdDate}</span>
            </div>
          </div>
          {campaign.category && (
            <span className="ml-auto flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full capitalize">
              <Tag size={10} />
              {campaign.category}
            </span>
          )}
        </div>

        {/* Title & description */}
        <div className="flex-1">
          <h3 className="font-display font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-primary-700 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{campaign.description}</p>
        </div>

        {/* Amount raised */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            <span className="text-primary-700 font-bold text-sm">UGX {campaign.current_amount.toLocaleString()}</span>
            {' '}raised of UGX {campaign.target_amount.toLocaleString()}
          </p>
          <ProgressBar current={campaign.current_amount} target={campaign.target_amount} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link to={`/campaigns/${campaign.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View Details</Button>
          </Link>
          {showDonate && (
            <Link to={`/campaigns/${campaign.id}#donate`} className="flex-1">
              <Button variant="primary" size="sm" className="w-full">Donate</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
