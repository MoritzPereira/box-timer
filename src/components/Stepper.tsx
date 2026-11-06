import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tapFeedback } from '@/lib/feedback';
import { colors } from '@/lib/theme';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
};

/** Großer Stepper; gedrückt halten zählt schnell weiter. */
export function Stepper({ label, value, min, max, step, format, onChange }: Props) {
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const bump = (dir: 1 | -1) => {
    const next = Math.min(max, Math.max(min, valueRef.current + dir * step));
    if (next !== valueRef.current) {
      valueRef.current = next;
      onChange(next);
      tapFeedback();
    }
  };

  const button = (dir: 1 | -1) => {
    const disabled = dir === 1 ? value >= max : value <= min;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ${dir === 1 ? 'erhöhen' : 'verringern'}`}
        disabled={disabled}
        onPress={() => bump(dir)}
        onLongPress={() => {
          stop();
          timer.current = setInterval(() => bump(dir), 90);
        }}
        delayLongPress={350}
        onPressOut={stop}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, disabled && { opacity: 0.3 }]}
      >
        <Text style={styles.btnText}>{dir === 1 ? '+' : '−'}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{format(value)}</Text>
      </View>
      {button(-1)}
      {button(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  value: { color: colors.text, fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.cardPressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { backgroundColor: colors.border },
  btnText: { color: colors.text, fontSize: 34, fontWeight: '700', marginTop: -2 },
});
