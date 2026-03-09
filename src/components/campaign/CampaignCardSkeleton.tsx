export default function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      {/* Header strip */}
      <div className="h-1.5 bg-gray-200 rounded-t-2xl animate-pulse" />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-2.5 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse ml-auto" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-4/5 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Description */}
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 w-5/6 bg-gray-100 rounded-full animate-pulse" />
        </div>

        {/* Amount + progress */}
        <div>
          <div className="h-3 w-40 bg-gray-200 rounded-full animate-pulse mb-2.5" />
          <div className="h-2 w-full bg-gray-100 rounded-full animate-pulse">
            <div className="h-2 w-2/3 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-8 rounded-full bg-gray-100 animate-pulse" />
          <div className="flex-1 h-8 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
