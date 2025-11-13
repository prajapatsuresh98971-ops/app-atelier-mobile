import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PermissionStatus {
  camera: boolean | null;
  microphone: boolean | null;
  location: boolean | null;
  screen_recording: boolean | null;
  notifications: boolean | null;
}

export const useBrowserPermissions = () => {
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (error) => {
          console.error('Location permission denied:', error);
          resolve(false);
        },
        { timeout: 5000 }
      );
    });
  };

  const requestScreenRecordingPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Screen recording permission denied:', error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      if (!('Notification' in window)) {
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission denied:', error);
      return false;
    }
  };

  const requestAllPermissions = async (
    enabledPermissions: {
      camera: boolean;
      microphone: boolean;
      location: boolean;
      screen_recording: boolean;
      notifications: boolean;
    }
  ): Promise<PermissionStatus> => {
    setIsRequesting(true);

    const results: PermissionStatus = {
      camera: null,
      microphone: null,
      location: null,
      screen_recording: null,
      notifications: null,
    };

    try {
      // Request each permission sequentially if enabled
      if (enabledPermissions.camera) {
        results.camera = await requestCameraPermission();
        if (!results.camera) {
          toast({
            title: 'Camera Access Denied',
            description: 'Camera permission is required for remote monitoring.',
            variant: 'destructive',
          });
        }
      } else {
        results.camera = false;
      }

      if (enabledPermissions.microphone) {
        results.microphone = await requestMicrophonePermission();
        if (!results.microphone) {
          toast({
            title: 'Microphone Access Denied',
            description: 'Microphone permission is required for audio monitoring.',
            variant: 'destructive',
          });
        }
      } else {
        results.microphone = false;
      }

      if (enabledPermissions.location) {
        results.location = await requestLocationPermission();
        if (!results.location) {
          toast({
            title: 'Location Access Denied',
            description: 'Location permission is required for tracking.',
            variant: 'destructive',
          });
        }
      } else {
        results.location = false;
      }

      if (enabledPermissions.screen_recording) {
        results.screen_recording = await requestScreenRecordingPermission();
        if (!results.screen_recording) {
          toast({
            title: 'Screen Recording Denied',
            description: 'Screen capture permission is required for monitoring.',
            variant: 'destructive',
          });
        }
      } else {
        results.screen_recording = false;
      }

      if (enabledPermissions.notifications) {
        results.notifications = await requestNotificationPermission();
        if (!results.notifications) {
          toast({
            title: 'Notifications Denied',
            description: 'Notification permission is required for alerts.',
            variant: 'destructive',
          });
        }
      } else {
        results.notifications = false;
      }

      // Show success summary
      const granted = Object.values(results).filter(v => v === true).length;
      const total = Object.values(enabledPermissions).filter(v => v === true).length;

      if (granted === total) {
        toast({
          title: 'All Permissions Granted',
          description: `Successfully granted ${granted} of ${total} permissions.`,
        });
      } else if (granted > 0) {
        toast({
          title: 'Partial Permissions Granted',
          description: `Granted ${granted} of ${total} requested permissions.`,
          variant: 'default',
        });
      }

      return results;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to request permissions. Please try again.',
        variant: 'destructive',
      });
      return results;
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    requestAllPermissions,
    isRequesting,
  };
};
