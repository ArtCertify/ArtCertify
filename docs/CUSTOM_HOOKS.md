# 🪝 Custom Hooks ArtCertify

Documentazione completa dei custom hooks sviluppati per ArtCertify, che forniscono funzionalità riutilizzabili per la gestione di stati asincroni, debounce e persistenza dati.

## 📋 Panoramica

I custom hooks implementati sono:
- **useAsyncState**: Gestione stati asincroni con loading/error
- **useDebounce**: Debounce per input e ricerche
- **useLocalStorage**: Persistenza dati nel localStorage

## 🔄 useAsyncState

Hook per gestire operazioni asincrone con stati di loading, error e data.

### Implementazione

```typescript
// src/hooks/useAsyncState.ts
import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (asyncFunction: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

export const useAsyncState = <T>(): UseAsyncStateReturn<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
```

### Utilizzo

#### Caricamento Asset

```tsx
import { useAsyncState } from '../hooks/useAsyncState';
import { algorandService } from '../services/algorand';

const AssetDetailsPage: React.FC = () => {
  const { assetId } = useParams();
  const { data: asset, loading, error, execute } = useAsyncState<AssetInfo>();

  useEffect(() => {
    if (assetId) {
      execute(() => algorandService.getAssetInfo(parseInt(assetId)));
    }
  }, [assetId, execute]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!asset) return <EmptyState title="Asset non trovato" />;

  return <AssetDisplay asset={asset} />;
};
```

#### Creazione Certificazione

```tsx
const DocumentForm: React.FC = () => {
  const { data: result, loading, error, execute } = useAsyncState<number>();

  const handleSubmit = async (formData: DocumentData) => {
    await execute(() => nftService.createDocumentCertification(formData));
    
    if (result) {
      // Certificazione creata con successo
      navigate(`/asset/${result}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Creazione...' : 'Crea Certificazione'}
      </Button>
      
      {error && <ErrorMessage message={error} />}
    </form>
  );
};
```

#### Caricamento Lista

```tsx
const DashboardPage: React.FC = () => {
  const { data: assets, loading, error, execute } = useAsyncState<AssetInfo[]>();

  const loadAssets = useCallback(() => {
    execute(() => nftService.getUserAssets());
  }, [execute]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <div>
      <Button onClick={loadAssets} disabled={loading}>
        {loading ? 'Aggiornamento...' : 'Aggiorna'}
      </Button>
      
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={loadAssets} />}
      {assets && <AssetsList assets={assets} />}
    </div>
  );
};
```

### Vantaggi

- **Stato centralizzato**: Loading, error e data in un unico hook
- **Error handling**: Gestione automatica degli errori
- **TypeScript**: Completamente tipizzato
- **Riutilizzabile**: Funziona con qualsiasi operazione asincrona
- **Performance**: useCallback per evitare re-render inutili

## ⏱️ useDebounce

Hook per implementare debouncing su valori che cambiano frequentemente.

### Implementazione

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### Utilizzo

#### Ricerca in Tempo Reale

```tsx
const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: results, loading, execute } = useAsyncState<SearchResult[]>();

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      execute(() => searchService.search(debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, execute]);

  return (
    <div>
      <Input
        placeholder="Cerca certificazioni..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {loading && <LoadingSpinner />}
      {results && <SearchResults results={results} />}
    </div>
  );
};
```

#### Validazione Form

```tsx
const FormWithValidation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    if (debouncedEmail) {
      const isValid = validateEmail(debouncedEmail);
      setEmailError(isValid ? '' : 'Email non valida');
    }
  }, [debouncedEmail]);

  return (
    <Input
      label="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={emailError}
    />
  );
};
```

#### Auto-save

```tsx
const DocumentEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (debouncedContent) {
      // Auto-save dopo 1 secondo di inattività
      saveDocument(debouncedContent);
    }
  }, [debouncedContent]);

  return (
    <Textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="Scrivi il documento..."
    />
  );
};
```

### Vantaggi

- **Performance**: Riduce chiamate API eccessive
- **UX migliore**: Evita lag nell'interfaccia
- **Flessibile**: Delay configurabile
- **Semplice**: API minimale e intuitiva

## 💾 useLocalStorage

Hook per persistere dati nel localStorage con sincronizzazione automatica.

### Implementazione

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // Inizializza con valore dal localStorage o valore di default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Funzione per aggiornare il valore
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

### Utilizzo

#### Preferenze Utente

```tsx
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'it' | 'en';
  hideBalance: boolean;
}

const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('userPrefs', {
    theme: 'dark',
    language: 'it',
    hideBalance: false
  });

  const updateTheme = (theme: 'light' | 'dark') => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const toggleBalanceVisibility = () => {
    setPreferences(prev => ({ ...prev, hideBalance: !prev.hideBalance }));
  };

  return {
    preferences,
    updateTheme,
    toggleBalanceVisibility
  };
};
```

#### Dati Form

```tsx
const DocumentForm: React.FC = () => {
  const [formData, setFormData] = useLocalStorage<DocumentFormData>('documentDraft', {
    name: '',
    description: '',
    type: 'document'
  });

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearDraft = () => {
    setFormData({
      name: '',
      description: '',
      type: 'document'
    });
  };

  return (
    <form>
      <Input
        label="Nome Documento"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
      />
      
      <Button type="button" onClick={clearDraft}>
        Cancella Bozza
      </Button>
    </form>
  );
};
```

#### Sessione Utente

```tsx
const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [sessionToken, setSessionToken] = useLocalStorage<string | null>('sessionToken', null);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setSessionToken(token);
  };

  const logout = () => {
    setUser(null);
    setSessionToken(null);
  };

  const isAuthenticated = user !== null && sessionToken !== null;

  return {
    user,
    isAuthenticated,
    login,
    logout
  };
};
```

#### Cache Dati

```tsx
const useCachedAssets = () => {
  const [cachedAssets, setCachedAssets] = useLocalStorage<AssetInfo[]>('assetsCache', []);
  const [lastUpdate, setLastUpdate] = useLocalStorage<number>('assetsCacheTime', 0);

  const isCacheValid = () => {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastUpdate < fiveMinutes;
  };

  const updateCache = (assets: AssetInfo[]) => {
    setCachedAssets(assets);
    setLastUpdate(Date.now());
  };

  const getCachedAssets = () => {
    return isCacheValid() ? cachedAssets : null;
  };

  return {
    getCachedAssets,
    updateCache,
    isCacheValid
  };
};
```

### Vantaggi

- **Persistenza**: Dati mantengono tra sessioni
- **Sincronizzazione**: Aggiornamento automatico localStorage
- **Type-safe**: Completamente tipizzato
- **Error handling**: Gestione errori localStorage
- **API familiare**: Simile a useState

## 🔄 Composizione Hooks

### Hook Combinati

```tsx
// Hook che combina async state con localStorage cache
const useAsyncWithCache = <T>(
  key: string,
  asyncFunction: () => Promise<T>,
  cacheTime: number = 5 * 60 * 1000 // 5 minuti
) => {
  const [cachedData, setCachedData] = useLocalStorage<{
    data: T | null;
    timestamp: number;
  }>(`cache_${key}`, { data: null, timestamp: 0 });

  const { data, loading, error, execute } = useAsyncState<T>();

  const isCacheValid = () => {
    return Date.now() - cachedData.timestamp < cacheTime;
  };

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && cachedData.data && isCacheValid()) {
      // Usa cache se valida
      return;
    }

    await execute(asyncFunction);
  }, [execute, asyncFunction, cachedData, isCacheValid]);

  // Aggiorna cache quando data cambia
  useEffect(() => {
    if (data) {
      setCachedData({
        data,
        timestamp: Date.now()
      });
    }
  }, [data, setCachedData]);

  return {
    data: data || cachedData.data,
    loading,
    error,
    loadData,
    isCacheValid: isCacheValid()
  };
};
```

### Hook per Ricerca con Debounce

```tsx
const useSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  debounceDelay = 300
) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceDelay);
  const { data: results, loading, error, execute } = useAsyncState<T[]>();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      execute(() => searchFunction(debouncedQuery));
    }
  }, [debouncedQuery, execute, searchFunction]);

  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    results: results || [],
    loading,
    error,
    clearSearch,
    hasQuery: debouncedQuery.trim().length > 0
  };
};
```

## 🧪 Testing

### Test useAsyncState

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAsyncState } from '../useAsyncState';

describe('useAsyncState', () => {
  it('should handle successful async operation', async () => {
    const { result } = renderHook(() => useAsyncState<string>());
    
    const mockAsyncFunction = jest.fn().mockResolvedValue('success');
    
    await act(async () => {
      await result.current.execute(mockAsyncFunction);
    });
    
    expect(result.current.data).toBe('success');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle async operation error', async () => {
    const { result } = renderHook(() => useAsyncState<string>());
    
    const mockAsyncFunction = jest.fn().mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      await result.current.execute(mockAsyncFunction);
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Test error');
  });
});
```

### Test useDebounce

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Cambia valore
    rerender({ value: 'changed', delay: 500 });
    expect(result.current).toBe('initial'); // Non ancora cambiato

    // Avanza timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('changed');
  });
});
```

## 📊 Performance

### Ottimizzazioni

- **useCallback**: Memorizza funzioni per evitare re-render
- **useMemo**: Memorizza valori computati costosi
- **Lazy initialization**: useState con funzione per valori iniziali costosi
- **Cleanup**: useEffect cleanup per evitare memory leak

### Metriche

- **Bundle size**: +2KB per tutti gli hooks
- **Runtime overhead**: Trascurabile
- **Memory usage**: Ottimizzato con cleanup automatico
- **Re-render**: Minimizzati con memorizzazione

---

**Custom Hooks per ArtCertify - Funzionalità riutilizzabili e performanti** 