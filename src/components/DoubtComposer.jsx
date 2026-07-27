import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Film, Mic, X, Type } from 'lucide-react';

export default function DoubtComposer({ onPostDoubt, isMuted }) {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    setMediaFile(file);
    setMediaType('image');
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, WEBM, MOV).');
      return;
    }

    setMediaFile(file);
    setMediaType('video');
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Record Voice Note
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([audioBlob], `voicenote_${Date.now()}.webm`, { type: 'audio/webm' });
        setMediaFile(file);
        setMediaType('audio');
        setMediaPreviewUrl(URL.createObjectURL(audioBlob));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access unavailable or denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaFile) return;

    setIsUploading(true);
    let uploadedMediaUrl = null;
    let uploadedMediaType = mediaType;

    if (mediaFile) {
      const formData = new FormData();
      formData.append('media', mediaFile);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          uploadedMediaUrl = data.mediaUrl;
          uploadedMediaType = data.mediaType;
        }
      } catch (err) {
        alert('Failed to upload media attachment.');
        setIsUploading(false);
        return;
      }
    }

    onPostDoubt({
      text: text.trim(),
      mediaUrl: uploadedMediaUrl,
      mediaType: uploadedMediaType,
      originalMediaName: mediaFile ? mediaFile.name : null
    });

    setText('');
    handleRemoveMedia();
    setIsUploading(false);
  };

  return (
    <div className="paper-note" style={{ marginBottom: '20px' }}>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={2}
          placeholder={isMuted ? "You are currently muted from submitting doubts." : "Type your doubt here..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isMuted || isUploading}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.98rem',
            color: '#18181b',
            resize: 'none',
            background: 'transparent',
            marginBottom: '10px',
            boxSizing: 'border-box'
          }}
        />

        {/* Media Preview Box */}
        {mediaPreviewUrl && (
          <div
            style={{
              position: 'relative',
              marginBottom: '12px',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid #e2e8f0',
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            {mediaType === 'image' && (
              <img src={mediaPreviewUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
            )}
            {mediaType === 'video' && (
              <div style={{ width: '40px', height: '40px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Film color="#ec4899" size={18} />
              </div>
            )}
            {mediaType === 'audio' && (
              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: '600' }}>
                🎙️ Voice recorded
              </span>
            )}

            <span style={{ fontSize: '0.82rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {mediaFile?.name || 'Media attachment'}
            </span>

            <button
              type="button"
              onClick={handleRemoveMedia}
              style={{ background: '#ef444420', border: 'none', color: '#ef4444', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Action Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Dedicated Photo File Input */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              disabled={isMuted}
            />

            {/* Dedicated Video File Input */}
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              onChange={handleVideoSelect}
              style={{ display: 'none' }}
              disabled={isMuted}
            />

            <button
              type="button"
              onClick={() => {
                if (imageInputRef.current) imageInputRef.current.value = '';
                imageInputRef.current?.click();
              }}
              disabled={isMuted}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
            >
              <ImageIcon size={15} color="#3b82f6" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (videoInputRef.current) videoInputRef.current.value = '';
                videoInputRef.current?.click();
              }}
              disabled={isMuted}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
            >
              <Film size={15} color="#ec4899" />
              <span>Video</span>
            </button>

            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isMuted}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
              >
                <Mic size={15} color="#10b981" />
                <span>Voice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                style={{ background: '#ef4444', border: 'none', borderRadius: '10px', padding: '3px 8px', color: 'white', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Stop
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isMuted || isUploading || (!text.trim() && !mediaFile)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              opacity: isMuted || isUploading || (!text.trim() && !mediaFile) ? 0.5 : 1,
              flexShrink: 0
            }}
          >
            <Send size={16} />
          </button>

        </div>
      </form>
    </div>
  );
}
