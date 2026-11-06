import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { describe, TEMPLATES, usePresets, type Preset } from '@/lib/presets';
import { colors } from '@/lib/theme';

export default function Home() {
  const custom = usePresets((s) => s.custom);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
    >
      <Text style={styles.section}>Eigene Presets</Text>
      {custom.length === 0 && (
        <Text style={styles.empty}>Noch keine eigenen Presets. Leg eins an oder pass eine Vorlage an.</Text>
      )}
      {custom.map((p) => (
        <PresetCard key={p.id} preset={p} />
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/edit')}
        style={({ pressed }) => [styles.newButton, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.newButtonText}>+ Neues Preset</Text>
      </Pressable>

      <Text style={[styles.section, { marginTop: 28 }]}>Vorlagen</Text>
      {TEMPLATES.map((p) => (
        <PresetCard key={p.id} preset={p} />
      ))}

      <Text style={styles.footer}>Tippen startet den Timer sofort.</Text>
    </ScrollView>
  );
}

function PresetCard({ preset }: { preset: Preset }) {
  return (
    <View style={styles.cardRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${preset.name} starten`}
        onPress={() => router.push({ pathname: '/timer', params: { id: preset.id } })}
        style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.cardPressed }]}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>
          {preset.name}
        </Text>
        <Text style={styles.cardSub}>{describe(preset)}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${preset.name} bearbeiten`}
        onPress={() => router.push({ pathname: '/edit', params: { id: preset.id } })}
        style={({ pressed }) => [styles.editButton, pressed && { backgroundColor: colors.cardPressed }]}
        hitSlop={8}
      >
        <Text style={styles.editIcon}>✎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  section: { color: colors.muted, fontSize: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  empty: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  cardRow: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 28, fontWeight: '800' },
  cardSub: { color: colors.muted, fontSize: 17, marginTop: 4, fontVariant: ['tabular-nums'] },
  editButton: {
    width: 72,
    backgroundColor: colors.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editIcon: { color: colors.text, fontSize: 28 },
  newButton: {
    minHeight: 72,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  footer: { color: colors.muted, textAlign: 'center', marginTop: 16, fontSize: 14 },
});
