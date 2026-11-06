import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stepper } from '@/components/Stepper';
import { findPreset, NEW_PRESET, usePresets } from '@/lib/presets';
import { colors } from '@/lib/theme';
import { buildTimeline, formatClock } from '@/lib/timeline';

const clock = (sec: number) => formatClock(sec * 1000);
const seconds = (sec: number) => (sec === 0 ? 'aus' : `${sec} s`);

export default function EditPreset() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const custom = usePresets((s) => s.custom);
  const save = usePresets((s) => s.save);
  const remove = usePresets((s) => s.remove);
  const insets = useSafeAreaInsets();

  const source = findPreset(id, custom);
  const isTemplate = !!source?.builtIn;
  const isExisting = !!source && !isTemplate;

  const [draft, setDraft] = useState(() =>
    source ? { ...source, name: isTemplate ? `${source.name} (eigen)` : source.name } : { ...NEW_PRESET },
  );
  const set = <K extends keyof typeof draft>(key: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [key]: v }));

  const total = buildTimeline({ ...draft, id: 'draft' }).total;

  const onSave = () => {
    const { builtIn, ...rest } = draft as typeof draft & { builtIn?: boolean };
    save({ ...rest, id: isExisting ? source!.id : undefined });
    router.back();
  };

  const onDelete = () => {
    const doIt = () => {
      remove(source!.id);
      router.back();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`„${source!.name}“ löschen?`)) doIt();
      return;
    }
    Alert.alert('Preset löschen?', `„${source!.name}“ wird entfernt.`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: doIt },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{ title: isTemplate ? 'Vorlage anpassen' : isExisting ? 'Preset bearbeiten' : 'Neues Preset' }}
      />
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        {isTemplate && (
          <Text style={styles.hint}>Vorlagen bleiben unverändert – beim Speichern entsteht ein eigenes Preset.</Text>
        )}

        <View style={styles.nameBox}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={draft.name}
            onChangeText={(t) => set('name', t)}
            placeholder="z. B. Dienstag Sparring"
            placeholderTextColor={colors.muted}
            style={styles.input}
            returnKeyType="done"
            maxLength={32}
          />
        </View>

        <Stepper label="Runden" value={draft.rounds} min={1} max={30} step={1} format={String} onChange={(v) => set('rounds', v)} />
        <Stepper label="Rundenzeit" value={draft.roundSec} min={15} max={900} step={15} format={clock} onChange={(v) => set('roundSec', v)} />
        <Stepper label="Pause" value={draft.restSec} min={0} max={300} step={15} format={(v) => (v === 0 ? 'keine' : clock(v))} onChange={(v) => set('restSec', v)} />
        <Stepper label="Vorbereitung" value={draft.prepSec} min={0} max={60} step={5} format={seconds} onChange={(v) => set('prepSec', v)} />
        <Stepper label="Hinweis vor Rundenende/-start" value={draft.warnSec} min={0} max={60} step={5} format={seconds} onChange={(v) => set('warnSec', v)} />

        <Text style={styles.total}>Gesamtdauer: {formatClock(total)} min</Text>

        <Pressable
          accessibilityRole="button"
          onPress={onSave}
          style={({ pressed }) => [styles.save, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.saveText}>Speichern</Text>
        </Pressable>

        {isExisting && (
          <Pressable accessibilityRole="button" onPress={onDelete} style={styles.delete}>
            <Text style={styles.deleteText}>Preset löschen</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  hint: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  nameBox: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  input: { color: colors.text, fontSize: 24, fontWeight: '700', paddingVertical: 6 },
  total: { color: colors.muted, fontSize: 16, textAlign: 'center', marginVertical: 4, fontVariant: ['tabular-nums'] },
  save: {
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#04130A', fontSize: 22, fontWeight: '800' },
  delete: { minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: colors.danger, fontSize: 17, fontWeight: '700' },
});
