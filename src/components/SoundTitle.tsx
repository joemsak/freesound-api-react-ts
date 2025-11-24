import { Link } from 'react-router-dom';
import { buildUserUrl } from '../utils/url';

interface SoundTitleProps {
  soundId: number;
  soundName: string;
  username: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function SoundTitle({
  soundId,
  soundName,
  username,
  variant = 'default',
  className = '',
}: SoundTitleProps) {
  const titleClasses = variant === 'compact'
    ? 'font-semibold text-sm mb-1 line-clamp-2'
    : 'font-semibold text-lg mb-1 truncate';
  
  const usernameClasses = variant === 'compact'
    ? 'text-xs text-gray-600'
    : 'text-sm text-gray-600 truncate';

  return (
    <div className={`block ${className}`}>
      <Link
        to={`/sound/${soundId}`}
        className="hover:text-blue-600 transition-colors cursor-pointer"
        title={soundName}
      >
        <h3 className={titleClasses} title={soundName}>
          {soundName}
        </h3>
      </Link>
      <p className={usernameClasses} title={`by ${username}`}>
        by{' '}
        <Link
          to={buildUserUrl(username, 1)}
          className="text-blue-600 hover:underline cursor-pointer"
          title={username}
        >
          {username}
        </Link>
      </p>
    </div>
  );
}

