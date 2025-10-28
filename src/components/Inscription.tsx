import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const Inscription: React.FC = () => {
  const [nom, setNom] = useState<string>('');
  const [profil, setProfil] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
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
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioBlob) {
      alert('Enregistre un audio avant de soumettre !');
      return;
    }

    const fileName = `user-audio/${nom}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio-files')
      .upload(fileName, audioBlob, { upsert: true });

    if (uploadError) return alert('Erreur upload audio : ' + uploadError.message);

    const audioPath = uploadData.path;

    const { error } = await supabase
      .from('utilisateur')
      .insert([{ nom, profil, audio_path: audioPath }]);

    if (error) return alert('Erreur création utilisateur : ' + error.message);

    alert('Utilisateur créé avec succès !');
    setNom('');
    setProfil('');
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
          placeholder="Profil"
          value={profil}
          onChange={e => setProfil(e.target.value)}
        />
        <div>
          {!recording && <button type="button" onClick={startRecording}>🎤 Démarrer l'enregistrement</button>}
          {recording && <button type="button" onClick={stopRecording}>⏹️ Arrêter</button>}
        </div>
        {audioBlob && <p>Audio prêt à être envoyé !</p>}
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default Inscription;
