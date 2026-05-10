import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react-native';

type Props = {
  title: string;
  description: string;
  complete: boolean;
  /** Hide hairline after the final row in a group */
  isLast?: boolean;
  onPress?: () => void;
};

/** Single checklist row for the pre-arrival landing zone */
export function ChecklistRow({ title, description, complete, isLast, onPress }: Props) {
  const { colors } = useTheme();

  const inner = (
    <>
      {complete ? (
        <CheckCircle2 color={colors.emerald} size={22} strokeWidth={2} />
      ) : (
        <Circle color={colors.borderStrong} size={22} strokeWidth={2} />
      )}
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.desc, { color: colors.inkSecondary }]}>{description}</Text>
      </View>
      {onPress && !complete ? <ChevronRight color={colors.inkTertiary} size={18} /> : null}
    </>
  );

  const rowStyle = [
    styles.row,
    { borderBottomColor: colors.border },
    isLast ? { borderBottomWidth: 0 } : undefined,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...rowStyle, { opacity: pressed ? 0.85 : 1 }]}>
        {inner}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  text: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 13, lineHeight: 18 },
});
