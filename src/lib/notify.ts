/**
 * Hintergrund-Signale ohne Hintergrund-Audio-Modus:
 * Beim Start/Weiter werden alle kommenden Übergänge als lokale Notifications
 * mit Gong-Sound eingeplant. Bei Pause/Reset wird alles wieder gelöscht.
 * Im Vordergrund werden die Notifications unterdrückt – dann spielt die App selbst.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { CUE_SOUND } from './feedback';
import type { Cue } from './timeline';

const enabled = Platform.OS !== 'web';
// In Expo Go sind eigene Notification-Sounds nicht im App-Bundle -> Standard-Ton.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const IOS_PENDING_LIMIT = 60; // iOS erlaubt max. 64 geplante Notifications

let permission: boolean | null = null;

export function configureNotifications() {
  if (!enabled) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('rounds', {
      name: 'Rundensignale',
      importance: AndroidImportance.HIGH,
      sound: 'bell.wav',
      vibrationPattern: [0, 300, 150, 300],
    }).catch(() => {});
  }
}

export async function ensurePermission(): Promise<boolean> {
  if (!enabled) return false;
  if (permission !== null) return permission;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return (permission = true);
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return (permission = req.granted);
  } catch {
    return (permission = false);
  }
}

/** Plant alle Cues ein, die nach `elapsed` liegen. `anchor` = absoluter Zeitpunkt von Timer-Null. */
export async function scheduleCues(cues: Cue[], anchor: number, elapsed: number) {
  if (!enabled) return;
  await cancelCues();
  if (!(await ensurePermission())) return;
  const upcoming = cues.filter((c) => c.at > elapsed + 500).slice(0, IOS_PENDING_LIMIT);
  await Promise.all(
    upcoming.map((c) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: c.title,
          body: c.body,
          sound: isExpoGo ? 'default' : `${CUE_SOUND[c.kind]}.wav`,
          data: { boxTimer: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(anchor + c.at),
          channelId: 'rounds',
        },
      }).catch((e) => console.warn('Notification nicht geplant', e)),
    ),
  );
}

export async function cancelCues() {
  if (!enabled) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch {}
}
