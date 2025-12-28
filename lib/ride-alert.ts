import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sound: Audio.Sound | null = null;
let vibrationInterval: NodeJS.Timeout | null = null;
let isPlaying = false;

/**
 * Play a looping notification sound with vibration for ride requests.
 * Call stopRideRequestAlert() to stop.
 */
export async function playRideRequestAlert(): Promise<void> {
    // Prevent multiple simultaneous plays
    if (isPlaying) {
        console.log('[RideAlert] Alert already playing, skipping');
        return;
    }

    try {
        isPlaying = true;

        // Stop any existing sound first
        await stopRideRequestAlert();

        // Configure audio mode for notifications with interruption
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true, // Play even if phone is on silent
            staysActiveInBackground: true,
            shouldDuckAndroid: false,
            interruptionModeIOS: 2, // INTERRUPTION_MODE_IOS_DO_NOT_MIX - stops other audio
            interruptionModeAndroid: 2, // INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
        });

        // Load and play sound
        const { sound: alertSound } = await Audio.Sound.createAsync(
            require('../assets/sounds/new_ride.mp3'),
            {
                shouldPlay: true,
                isLooping: true,
                volume: 1.0,
            }
        );
        sound = alertSound;

        // Start vibration pattern (vibrate every 1.5 seconds)
        vibrationInterval = setInterval(() => {
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (e) {
                console.error('[RideAlert] Vibration error:', e);
            }
        }, 1500);

        console.log('[RideAlert] Sound and vibration started');
    } catch (error) {
        console.error('[RideAlert] Failed to play sound:', error);
        isPlaying = false;
    }
}

/**
 * Stop the ride request alert sound and vibration.
 */
export async function stopRideRequestAlert(): Promise<void> {
    try {
        // Clear vibration first
        if (vibrationInterval) {
            clearInterval(vibrationInterval);
            vibrationInterval = null;
        }

        // Stop and unload sound
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (e) {
                console.warn('[RideAlert] Error stopping sound (may already be stopped):', e);
            }
            sound = null;
        }

        isPlaying = false;
        console.log('[RideAlert] Sound and vibration stopped');
    } catch (error) {
        console.error('[RideAlert] Failed to stop sound:', error);
        isPlaying = false;
    }
}
