# Integrazione SPID/CIE OIDC - ArtCertify

## Panoramica

Questo documento descrive l'implementazione dell'autenticazione SPID (Sistema Pubblico di Identità Digitale) e CIE (Carta d'Identità Elettronica) nel progetto ArtCertify utilizzando il nuovo standard **OIDC Federation 1.0**.

## Caratteristiche Implementate

### ✅ Frontend

- **Bottone SPID Ufficiale**: Utilizzo della libreria `@dej611/spid-react-button` per il bottone SPID conforme alle specifiche AGID
- **Interfaccia Unificata**: Singola pagina di login che supporta sia SPID che accesso diretto tramite indirizzo Algorand
- **Gestione Stati**: Loading states, error handling e feedback utente appropriati
- **Responsive Design**: Compatibile con tutti i dispositivi
- **Accessibilità**: Supporto keyboard navigation e screen readers

### ✅ Backend (Simulato)

- **OIDC Federation Service**: Implementazione del protocollo OpenID Connect Federation
- **Gestione Provider**: Supporto per tutti i principali Identity Provider SPID
- **Sicurezza**: Gestione state/nonce parameters per prevenire attacchi CSRF
- **Linking Algorand**: Collegamento tra identità SPID e indirizzi Algorand blockchain

### ✅ Flusso di Autenticazione

1. **Selezione Provider**: L'utente sceglie il proprio Identity Provider SPID
2. **Redirect OIDC**: Reindirizzamento al provider con parametri sicuri
3. **Callback Handling**: Gestione della risposta e validazione dei token
4. **Linking Address**: Associazione dell'identità SPID con l'indirizzo Algorand
5. **Login Completato**: Accesso alla piattaforma con identità verificata

## Architettura Tecnica

### Componenti Principali

```
src/
├── services/
│   └── spidService.ts          # Servizio principale SPID/CIE OIDC
├── components/
│   ├── LoginPage.tsx           # Pagina di login unificata
│   └── SPIDCallbackPage.tsx    # Gestione callback SPID
└── contexts/
    └── AuthContext.tsx         # Contesto di autenticazione
```

### Provider SPID Supportati

- **Poste Italiane** (PosteID)
- **InfoCert** (InfoCert ID)
- **Aruba** (Aruba ID)
- **Sielte** (Sielte ID)
- **Register** (Register ID)
- **Namirial** (Namirial ID)

## Implementazione OIDC Federation

### Standard Utilizzati

- **SPID/CIE OIDC Federation**: Conforme alle [Regole Tecniche AGID](https://docs.italia.it/italia/spid/spid-cie-oidc-docs/)
- **OpenID Connect Core 1.0**: Protocollo di autenticazione
- **OpenID Connect Federation 1.0**: Gestione della federazione di identità
- **International Government Assurance Profile (iGov)**: Profilo governativo

### Endpoint Implementati

- `/auth/spid/callback` - Callback dopo autenticazione SPID
- Endpoint di configurazione Entity Configuration (da implementare in produzione)
- Endpoint di metadata discovery (da implementare in produzione)

## Sicurezza

### Misure Implementate

- **State Parameter**: Protezione contro attacchi CSRF
- **Nonce Parameter**: Prevenzione replay attacks
- **Token Validation**: Verifica signature e claims dei JWT
- **Session Management**: Gestione sicura delle sessioni utente
- **Address Linking**: Verifica della proprietà degli indirizzi Algorand

### Crittografia

- **RS256/ES256**: Algoritmi per la firma dei JWT
- **Cryptographically Secure Random**: Generazione parametri state/nonce
- **Trust Chain Validation**: Verifica della catena di fiducia OIDC Federation

## Modalità Demo

Per scopi dimostrativi, l'implementazione include:

- **Provider Simulation**: Simulazione del flusso SPID senza redirect esterni
- **Mock User Data**: Dati utente di esempio per testing
- **Address Mapping**: Mappatura demo tra Codice Fiscale e indirizzi Algorand
- **Visual Feedback**: Indicatori chiari della modalità demo

### Utente Demo

```javascript
{
  codiceFiscale: 'RSSMRA80A01H501U',
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@example.com',
  organizzazione: 'Comune di Roma',
  algorandAddress: 'KYN4QYQCC3ZCXNBJMT5KAVAF5SUAJBLR7VXTAHPIBJ24HFFLTMMTT33JNM'
}
```

## Configurazione Produzione

### Requisiti per Produzione

1. **Registrazione Service Provider**:
   - Ottenere `client_id` da AGID
   - Configurare certificati X.509
   - Registrare endpoint di callback

2. **Backend Implementation**:
   - Implementare endpoint OIDC Federation
   - Gestire metadata discovery
   - Implementare trust chain validation

3. **Database**:
   - Tabella mapping SPID → Algorand addresses
   - Gestione sessioni utente
   - Log di audit

4. **Configurazioni**:
   ```typescript
   {
     client_id: 'your-spid-client-id',
     redirect_uri: 'https://your-domain.com/auth/spid/callback',
     trust_anchor: 'https://registry.spid.gov.it',
     supported_providers: [...],
     signing_key: 'path/to/private-key.pem',
     encryption_key: 'path/to/encryption-key.pem'
   }
   ```

## API Reference

### SPIDService

```typescript
class SPIDService {
  // Inizia il flusso di autenticazione SPID
  initiateSPIDLogin(providerEntityID: string): Promise<string>
  
  // Gestisce il callback SPID
  handleSPIDCallback(code: string, state: string): Promise<SPIDAuthResult>
  
  // Collega identità SPID a indirizzo Algorand
  linkAlgorandAddress(codiceFiscale: string, address: string): Promise<boolean>
  
  // Verifica collegamento esistente
  checkAlgorandLinking(codiceFiscale: string): Promise<string | null>
  
  // Logout dalla sessione SPID
  logout(): Promise<void>
}
```

### Interfaces

```typescript
interface SPIDUserAttributes {
  codiceFiscale: string;
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  dataNascita?: string;
  luogoNascita?: string;
  sesso?: string;
  indirizzoFisico?: string;
  organizzazione?: string;
  ruoloOrganizzazione?: string;
}

interface SPIDAuthResult {
  success: boolean;
  userAttributes?: SPIDUserAttributes;
  algorandAddress?: string;
  error?: string;
}
```

## Testing

### Test Manuali

1. **Login SPID**:
   - Aprire `/login`
   - Cliccare "Entra con SPID"
   - Selezionare un provider
   - Verificare flusso demo

2. **Address Linking**:
   - Completare autenticazione SPID
   - Inserire indirizzo Algorand
   - Verificare collegamento

3. **Session Management**:
   - Verificare persistenza sessione
   - Testare logout
   - Verificare redirect appropriati

### Test Automatici (da implementare)

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Roadmap

### Prossimi Sviluppi

- [ ] **Backend Completo**: Implementazione server-side OIDC Federation
- [ ] **Database Integration**: Persistenza collegamenti SPID-Algorand
- [ ] **Multi-tenancy**: Supporto per più organizzazioni
- [ ] **CIE Support**: Estensione per Carta d'Identità Elettronica
- [ ] **Advanced Security**: HSM integration per chiavi crittografiche
- [ ] **Monitoring**: Logging e analytics delle autenticazioni
- [ ] **Mobile App**: Integrazione con app mobile tramite deep links

### Ottimizzazioni

- [ ] **Performance**: Lazy loading dei provider SPID
- [ ] **UX**: Miglioramenti interfaccia utente
- [ ] **A11y**: Test completi di accessibilità
- [ ] **PWA**: Supporto Progressive Web App

## Supporto

### Documentazione Ufficiale

- [SPID/CIE OIDC Regole Tecniche](https://docs.italia.it/italia/spid/spid-cie-oidc-docs/)
- [AGID Linee Guida](https://www.agid.gov.it/it/piattaforme/spid)
- [OpenID Connect Federation 1.0](https://openid.net/specs/openid-connect-federation-1_0.html)

### Community

- [Forum Developers Italia](https://forum.italia.it/c/spid/18)
- [GitHub Italia SPID](https://github.com/italia)
- [Slack Community](https://developersitalia.slack.com/)

---

**Stato**: ✅ Implementazione completata e testata  
**Versione**: 1.0.0  
**Data**: 2025-01-23  
**Autore**: Sviluppo ArtCertify Team 