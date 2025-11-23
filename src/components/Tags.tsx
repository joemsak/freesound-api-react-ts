interface TagsProps {
  tags: string[];
  maxTags?: number;
  className?: string;
  variant?: 'default' | 'rounded';
}

export function Tags({ tags, maxTags, className = '', variant = 'default' }: TagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const tagClassName = variant === 'rounded' 
    ? 'px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full'
    : 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded';

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag, idx) => (
        <span key={idx} className={tagClassName}>
          {tag}
        </span>
      ))}
    </div>
  );
}

