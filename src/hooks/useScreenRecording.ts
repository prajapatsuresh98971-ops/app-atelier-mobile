import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useScreenRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadRecording(blob);
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingDuration(0);
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Screen recording is now active",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start screen recording",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const uploadRecording = async (blob: Blob) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/recording-${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Create media record
      await supabase.functions.invoke('upload-recording', {
        body: {
          file_path: fileName,
          media_type: 'recording',
          file_size: blob.size,
          duration: recordingDuration,
        },
      });

      toast({
        title: "Recording saved",
        description: "Screen recording uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast({
        title: "Error",
        description: "Failed to upload recording",
        variant: "destructive",
      });
    }
  };

  const takeScreenshot = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileName = `${user.id}/screenshot-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        await supabase.functions.invoke('upload-recording', {
          body: {
            file_path: fileName,
            media_type: 'screenshot',
            file_size: blob.size,
          },
        });

        toast({
          title: "Screenshot captured",
          description: "Screenshot saved successfully",
        });
      }, 'image/png');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        variant: "destructive",
      });
    }
  }, [toast]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    recordingDuration: formatDuration(recordingDuration),
    startRecording,
    stopRecording,
    takeScreenshot,
  };
};
