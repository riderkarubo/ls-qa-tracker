import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types';

interface UseFileUploadState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFileUpload<T>() {
  const [state, setState] = useState<UseFileUploadState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const upload = useCallback(async (
    uploadFn: () => Promise<ApiResponse<T>>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await uploadFn();

    if (result.success) {
      setState({ data: result.data!, loading: false, error: null });
    } else {
      setState({ data: null, loading: false, error: result.error! });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, upload, reset };
}
