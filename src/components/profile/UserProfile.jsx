// UserProfile.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFullName(data.full_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile!');
    }
  };

  if (loading) {
    return <div id="profile-loading">Loading...</div>;
  }

  return (
    <div id="profile-container">
      <h2 id="profile-title">Profile Settings</h2>
      <div id="profile-form">
        <label id="fullname-label">
          Full Name
        </label>
        <input
          type="text"
          id="fullname-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <button
        onClick={updateProfile}
        id="update-profile-button"
      >
        Update Profile
      </button>
    </div>
  );
};

export default UserProfile;