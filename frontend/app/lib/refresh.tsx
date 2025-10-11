// helpers/useRefresh.js
import { useState } from 'react';

export default function useRefresh(callback: any) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, onRefresh };
}
