import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const Inscription: React.FC = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profil, setProfil] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 🎙️ Démarrer l’enregistrement
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      alert('Erreur lors de l’accès au micro : ' + (error as Error).message);
    }
  };

  // ⏹️ Arrêter l’enregistrement
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // 📨 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioBlob) {
      alert('Enregistre un audio avant de soumettre !');
      return;
    }

    // Upload de l’audio vers Supabase Storage
    const fileName = `user-audio/${nom}_${prenom}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio-files')
      .upload(fileName, audioBlob, { upsert: true });

    if (uploadError) return alert('Erreur upload audio : ' + uploadError.message);

    const audioPath = uploadData?.path || '';

    // Insertion des données utilisateur
    const { error } = await supabase
      .from('utilisateur')
      .insert([
        {
          nom,
          prenom,
          email,
          profil,
          password, // ⚠️ version non hashée (pour tests seulement)
          audio_path: audioPath,
        },
      ]);

    if (error) return alert('Erreur création utilisateur : ' + error.message);

    alert('Utilisateur créé avec succès !');
    setNom('');
    setPrenom('');
    setEmail('');
    setProfil('');
    setPassword('');
    setAudioBlob(null);
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={e => setNom(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={e => setPrenom(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Profil"
          value={profil}
          onChange={e => setProfil(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div>
          {!recording && (
            <button type="button" onClick={startRecording}>
              🎤 Démarrer l'enregistrement
            </button>
          )}
          {recording && (
            <button type="button" onClick={stopRecording}>
              ⏹️ Arrêter
            </button>
          )}
        </div>

        {audioBlob && <p>✅ Audio prêt à être envoyé !</p>}

        <button type="submit">S'inscrire</button>
        <a href="/connexion">Connexion</a>

      </form>
    </div>
  );
};

export default Inscription;