import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuth } from "../../stores/userSlice";

const BASE_URL = 'http://localhost:9000/uploads/';

export default function EditProfile({ onClose }: { onClose?: () => void }) {
  const user = useSelector((state: any) => state.user.user);

  const dispatch = useDispatch();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;

    setFullName(user.full_name || '');
    setUsername(user.username || '');
    setBio(user.bio || '');

    setHeaderImage(user.header ? `${BASE_URL}${user.header}` : null);
    setProfileImage(user.photo_profile ? `${BASE_URL}${user.photo_profile}` : null);
  }, [user]);

  const handleImageChange = (type: 'header' | 'profile', file: File) => {
    const preview = URL.createObjectURL(file);

    if (type === 'header') {
      setHeaderImage(preview);
      setHeaderFile(file);
    } else {
      setProfileImage(preview);
      setProfileFile(file);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();

    if (fullName.trim() !== (user.full_name || '').trim())
      formData.append('full_name', fullName);

    if (username.trim() !== (user.username || '').trim())
      formData.append('username', username);

    if (bio.trim() !== (user.bio || '').trim())
      formData.append('bio', bio);

    if (headerFile) formData.append('header', headerFile);
    if (profileFile) formData.append('photo_profile', profileFile);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:9000/api/v1/user`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      const result = JSON.parse(text);

      // Normalisasi user baru
      const normalized = { ...user, ...result.user, id: result.user.id };

dispatch(setAuth({ user: normalized, token: token || '' }));

      onClose?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-blue-950">Edit Profile</h2>

      {/* HEADER AREA */}
      <div className="relative h-24 rounded-lg mb-6 overflow-visible">
        <div
          className="w-full h-full cursor-pointer"
          style={{
            backgroundImage: headerImage
              ? `url(${headerImage})`
              : 'linear-gradient(to right, #86efac, #fef08a)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onClick={() => document.getElementById('header-input')?.click()}
        >
          {!headerImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/40">
              <span className="text-gray-600">Header Image</span>
            </div>
          )}

          <input
            id="header-input"
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleImageChange('header', e.target.files[0])
            }
            className="hidden"
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-60 bg-black/40 transition">
            <span className="text-white text-2xl">➕</span>
          </div>
        </div>

        {/* PROFILE PICTURE */}
        <div className="absolute -bottom-6 left-3">
          <div
            className="w-17 h-17 rounded-full bg-gray-300 border-3 border-blue-300 cursor-pointer overflow-hidden"
            style={{
              backgroundImage: profileImage ? `url(${profileImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('profile-input')?.click();
            }}
          >
            {!profileImage && (
              <span className="text-gray-600 text-xs absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Photo
              </span>
            )}

            <input
              id="profile-input"
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleImageChange('profile', e.target.files[0])
              }
              className="hidden"
            />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 rounded-full transition">
              <span className="text-white text-xl">➕</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-4 mt-8">
        <div>
          <label className="block text-blue-950 font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-blue-950 font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="@username"
          />
        </div>

        <div>
          <label className="block text-blue-950 font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            rows={3}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}