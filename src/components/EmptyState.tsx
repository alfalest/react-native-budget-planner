import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[typography.h3, typography.weightBold, styles.title]}>
        {title}
      </Text>
      <Text style={[typography.bodyMedium, styles.description]}>
        {description}
      </Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: 'transparent',
    marginVertical: 16,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    minWidth: 160,
  },
});
