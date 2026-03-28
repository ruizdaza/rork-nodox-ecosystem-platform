import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { WalletTransaction } from '@/types/wallet';

interface TransactionItemProps {
  transaction: WalletTransaction;
}

const TransactionItem = React.memo<TransactionItemProps>(({ transaction }) => {
  const isIncoming = ['earn', 'receive', 'refund', 'bonus', 'commission'].includes(transaction.type);
  const iconColor = isIncoming ? '#10b981' : '#ef4444';
  const iconBgColor = isIncoming ? '#dcfce7' : '#fef2f2';
  const amountColor = isIncoming ? '#10b981' : '#ef4444';
  const amountPrefix = isIncoming ? '+' : '-';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#dcfce7';
      case 'pending':
        return '#fef3c7';
      case 'failed':
        return '#fef2f2';
      default:
        return '#f1f5f9';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace un momento';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: iconBgColor }]}>
        {isIncoming ? (
          <ArrowDownLeft color={iconColor} size={16} />
        ) : (
          <ArrowUpRight color={iconColor} size={16} />
        )}
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBgColor(transaction.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status === 'completed'
                ? 'Completada'
                : transaction.status === 'pending'
                ? 'Pendiente'
                : 'Fallida'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {amountPrefix}
        {transaction.currency === 'COP' ? '$' : ''}
        {transaction.amount.toLocaleString()}
        {transaction.currency === 'NCOP' ? ' NCOP' : ''}
      </Text>
    </View>
  );
});

TransactionItem.displayName = 'TransactionItem';

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1e293b',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});

export default TransactionItem;
