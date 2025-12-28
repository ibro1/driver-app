import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sound: Audio.Sound | null = null;
let vibrationInterval: NodeJS.Timeout | null = null;

/**
 * Play a looping notification sound with vibration for ride requests.
 * Call stopRideRequestAlert() to stop.
 */
export async function playRideRequestAlert(): Promise<void> {
    try {
        // Configure audio mode for notifications
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true, // Play even if phone is on silent
            staysActiveInBackground: true,
            shouldDuckAndroid: false,
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }, 1500);

        console.log('[RideAlert] Sound and vibration started');
    } catch (error) {
        console.error('[RideAlert] Failed to play sound:', error);
    }
}

/**
 * Stop the ride request alert sound and vibration.
 */
export async function stopRideRequestAlert(): Promise<void> {
    try {
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            sound = null;
        }

        if (vibrationInterval) {
            clearInterval(vibrationInterval);
            vibrationInterval = null;
        }

        console.log('[RideAlert] Sound and vibration stopped');
    } catch (error) {
        console.error('[RideAlert] Failed to stop sound:', error);
    }
}
