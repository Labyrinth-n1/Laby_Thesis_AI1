import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GroupeDetails: React.FC = () => {
  const { id } = useParams(); // id du groupe dans l’URL
  const [groupe, setGroupe] = useState<any>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // 🔹 Charger les infos du groupe
  useEffect(() => {
    const fetchData = async () => {
      const { data: g, error: gError } = await supabase
        .from('groupe')
        .select('*')
        .eq('id', id)
        .single();

      if (gError) return alert('Erreur groupe : ' + gError.message);
      setGroupe(g);

      // Charger les membres du groupe
      const { data: membresData, error: mError } = await supabase
        .from('membregroupe')
        .select('id, utilisateur:utilisateur_id (id, nom, prenom, profil)')
        .eq('groupe_id', id);

      if (mError) return alert('Erreur membres : ' + mError.message);
      setMembres(membresData || []);
    };

    fetchData();
  }, [id]);

  // 🔍 Rechercher un utilisateur par nom ou email
  const handleSearch = async () => {
    if (!search.trim()) return;
    const { data, error } = await supabase
      .from('utilisateur')
      .select('*')
      .or(`nom.ilike.%${search}%, email.ilike.%${search}%`);

    if (error) return alert('Erreur recherche : ' + error.message);
    setResults(data || []);
  };

  // ➕ Ajouter un membre
  const handleAddMember = async (utilisateurId: number) => {
    const { error } = await supabase.from('membregroupe').insert([
      { groupe_id: id, utilisateur_id: utilisateurId },
    ]);

    if (error) return alert('Erreur ajout membre : ' + error.message);

    alert('Membre ajouté avec succès !');
    setResults([]);
  };

  if (!groupe) return <p>Chargement du groupe...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>👥 Groupe : {groupe.nom_groupe}</h2>

      <h3>Membres actuels :</h3>
      <ul>
        {membres.map((m) => (
          <li key={m.id}>
            {m.utilisateur.nom} {m.utilisateur.prenom} — {m.utilisateur.profil}
          </li>
        ))}
      </ul>

      <hr />
      <h3>Ajouter un membre</h3>
      <input
        type="text"
        placeholder="Rechercher par nom ou email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}>Rechercher</button>

      <ul>
        {results.map((u) => (
          <li key={u.id}>
            {u.nom} {u.prenom} — {u.email}{' '}
            <button onClick={() => handleAddMember(u.id)}>Ajouter</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupeDetails;
