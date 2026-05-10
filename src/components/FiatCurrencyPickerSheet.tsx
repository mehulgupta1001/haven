import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { filterFiatCatalog, type FiatCurrencyCode } from '../data/fiatCurrencies';
import { X } from 'lucide-react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Current selection (highlighted in list) */
  selectedCode: FiatCurrencyCode;
  onSelect: (code: FiatCurrencyCode) => void;
  /** Sheet header — e.g. “Home / receive currency” on dashboard, “Parent send currency” on signup */
  title?: string;
};

/**
 * Searchable full fiat catalogue — same source as `GlobalBalanceCard` home picker (`FIAT_CATALOG`).
 */
export function FiatCurrencyPickerSheet({
  visible,
  onClose,
  selectedCode,
  onSelect,
  title = 'Home / receive currency',
}: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const list = useMemo(() => filterFiatCatalog(query), [query]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: colors.paper, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.navy }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X color={colors.navy} size={24} />
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search ISO code or country currency…"
            placeholderTextColor={colors.inkTertiary}
            style={[
              styles.search,
              { borderColor: colors.border, backgroundColor: colors.paperWarm, color: colors.ink },
            ]}
          />
          <FlatList
            data={list}
            keyExtractor={(item) => item.code}
            style={{ maxHeight: 360 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = item.code === selectedCode;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.code as FiatCurrencyCode);
                    onClose();
                    setQuery('');
                  }}
                  style={[
                    styles.currRow,
                    {
                      backgroundColor: active ? colors.emeraldMuted : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.currCode, { color: colors.navy }]}>{item.code}</Text>
                  <Text style={[styles.currName, { color: colors.inkSecondary }]}>{item.name}</Text>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,18,32,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  currRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  currCode: { fontSize: 16, fontWeight: '800' },
  currName: { fontSize: 13 },
});
