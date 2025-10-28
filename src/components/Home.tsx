import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

interface User {
  id: number;
  nom: string;
  prenom: string;
}

interface Groupe {
  id: number;
  nom_groupe: string;
  chef_id: number;
}

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [nouveauGroupe, setNouveauGroupe] = useState('');
  const navigate = useNavigate();

  // Vérifier si utilisateur est connecté
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  // Charger les groupes
  useEffect(() => {
    const fetchGroupes = async () => {
      const { data, error } = await supabase
        .from('groupe')
        .select('id, nom_groupe, chef_id');
      if (error) console.error('Erreur chargement groupes :', error.message);
      else setGroupes(data || []);
    };
    fetchGroupes();
  }, []);

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Création d’un groupe
  const handleCreateGroupe = async () => {
    if (!nouveauGroupe.trim() || !user) return;

    const { data, error } = await supabase
      .from('groupe')
      .insert([{ nom_groupe: nouveauGroupe, chef_id: user.id }])
      .select();

    if (error) {
      alert('Erreur lors de la création du groupe : ' + error.message);
      return;
    }

    alert('Groupe créé avec succès !');
    setGroupes([...groupes, data[0]]);
    setNouveauGroupe('');
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Bienvenue {user.nom} {user.prenom} 👋</h2>

      <button onClick={handleLogout}>Se déconnecter</button>

      <hr />

      <h3>📚 Vos groupes</h3>
      {groupes.length === 0 ? (
        <p>Aucun groupe pour le moment.</p>
      ) : (
        <ul>
          {groupes.map((g) => (
            <li key={g.id}>
              <Link to={`/groupe/${g.id}`}>
                {g.nom_groupe} {g.chef_id === user.id && '⭐ (Chef)'}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>➕ Créer un nouveau groupe</h3>
      <input
        type="text"
        placeholder="Nom du groupe"
        value={nouveauGroupe}
        onChange={(e) => setNouveauGroupe(e.target.value)}
      />
      <button onClick={handleCreateGroupe}>Créer</button>
    </div>
  );
};

export default Home;
