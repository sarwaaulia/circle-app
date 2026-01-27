import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  header: string | null;
  bio: string | null;
}

interface UserProfileHeaderProps {
  user: UserProfile;
  clickable?: boolean;
  className?: string;
}

export default function UserProfileHeader({
  user,
  clickable = true,
  className = ''
}: UserProfileHeaderProps) {

  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:3002/uploads/';

  const handleClick = () => {
    if (clickable) navigate(`/profile/${user.id}`);
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
    >
      {/* Header banner */}
      {user.header ? (
        <img
          src={`${BASE_URL}${user.header}`}
          className="w-full h-full object-cover"
          alt="header"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-green-400 via-yellow-400 to-yellow-400" />
      )}
    </div>
  );
}