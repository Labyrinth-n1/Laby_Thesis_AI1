import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Confirmation: React.FC = () => {
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const confirmUser = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');
        if (!email) return setMessage('Email manquant dans l’URL.');

        // 1️⃣ Récupérer JSON temporaire
        const { data: jsonData, error: jsonError } = await supabase
          .storage
          .from('audio-files')
          .download(`pending-json/${email}.json`);

        if (jsonError || !jsonData) return setMessage('Impossible de récupérer les infos temporaires.');

        const text = await jsonData.text();
        const userInfo = JSON.parse(text);

        // 2️⃣ Insérer dans table utilisateur
        const { error: insertError } = await supabase
          .from('utilisateur')
          .insert([userInfo]);
        if (insertError) return setMessage('Erreur insertion utilisateur : ' + insertError.message);

        // 3️⃣ Supprimer fichiers temporaires
        await supabase.storage.from('audio-files').remove([`pending-json/${email}.json`]);
        await supabase.storage.from('audio-files').remove([userInfo.audio_path]);

        setMessage('Inscription confirmée ! Vous pouvez maintenant vous connecter.');
      } catch (err: any) {
        setMessage('Erreur : ' + err.message);
      }
    };

    confirmUser();
  }, []);

  return (
    <div>
      <h2>Confirmation email</h2>
      <p>{message}</p>
    </div>
  );
};

export default Confirmation;
