import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../../theme';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Bottom sheet used for the "row opened" detail card (E9) over a dimmed navy backdrop. */
export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,35,59,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.huge,
    borderTopRightRadius: radius.huge,
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD9CF',
    alignSelf: 'center',
    marginBottom: 22,
  },
});
