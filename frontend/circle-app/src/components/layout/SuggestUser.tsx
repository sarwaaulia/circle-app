import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface SuggestedUser {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  bio: string | null;
}

export function SuggestUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<{[key: number]: boolean}>({});
  const user = useSelector((state: any) => state.user.user);
  const token = useSelector((state: any) => state.user.token) || localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!token || !user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:9000/api/user/suggest/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [token, user?.id]);

  const handleFollow = async (targetUserId: number) => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:9000/api/user/follow', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId })
      });

      if (response.ok) {
        setFollowingStates(prev => ({ ...prev, [targetUserId]: true }));
        // Remove the user from suggestions immediately for better UX
        setUsers(prev => prev.filter(u => u.id !== targetUserId));

        // Trigger real-time following count update
        window.dispatchEvent(new CustomEvent('currentUserFollowingChange', {
          detail: { action: 'increment' }
        }));
      } else {
        console.error("Error following user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const BASE_URL = 'http://localhost:9000/uploads/';

  if (loading) {
    return (
      <div className="bg-blue-500 rounded-lg p-2 shadow">
        <h3 className="font-bold text-blue-950 text-sm mb-2">Suggested for you</h3>
        <div className="text-center py-4 text-blue-950">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-2 shadow">
      <h3 className="text-zinc-300">Suggested for you</h3>
      <div className="flex flex-col gap-1">
        {users.length > 0 ? (
          users.map((suggestedUser) => (
            <div
              key={suggestedUser.id}
              className="flex justify-between items-center hover:bg-blue-900 p-1 rounded-lg"
            >
              <div
                className="flex items-center gap-1 cursor-pointer rounded transition-colors"
                onClick={() => navigate(`/profile/${suggestedUser.id}`)}
              >
                <img
                  src={suggestedUser.photo_profile ? `${BASE_URL}${suggestedUser.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                  alt={suggestedUser.full_name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-xs text-blue-700">{suggestedUser.full_name}</p>
                  <p className="text-xs text-zinc-300">@{suggestedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(suggestedUser.id)}
                className="bg-white text-blue-950 px-2 py-1 cursor-pointer rounded-full text-xs font-semibold hover:bg-blue-100"
              >
                Follow
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-blue-950 text-xs">
            No suggestions available
          </div>
        )}
      </div>
    </div>
  );
}