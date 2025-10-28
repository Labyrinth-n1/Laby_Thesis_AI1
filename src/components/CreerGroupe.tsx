import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CreerGroupe: React.FC = () => {
  const [nomGroupe, setNomGroupe] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: number; nom: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [navigate]);

  const handleCreerGroupe = async () => {
    if (!nomGroupe) return alert('Nom du groupe requis');
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('Groupe') // correspond à ta table
      .insert([{ nom_groupe: nomGroupe, chef_id: currentUser.id }])
      .select();

    if (error) return alert('Erreur création groupe : ' + error.message);
    alert('Groupe créé avec succès ✅');
    navigate(`/groupe/${data[0].id}`);
  };

  if (!currentUser) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Créer un groupe</h2>
      <input
        type="text"
        placeholder="Nom du groupe"
        value={nomGroupe}
        onChange={e => setNomGroupe(e.target.value)}
      />
      <button onClick={handleCreerGroupe}>Créer</button>
    </div>
  );
};

export default CreerGroupe;
