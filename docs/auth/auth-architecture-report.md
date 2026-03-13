Relatório técnico — Feature AUTH
1. Resumo executivo
O módulo AUTH do app bancário é a base de autenticação e sessão. Ele segue o contrato do auth-architecture-context e foi validado no checklist final. O app funciona hoje somente com mocks; o backend real ainda não está integrado.

Status geral:

Arquitetura em camadas respeitada (screen → hook → service → datasource → api → httpClient)
sessionManager como único orquestrador de sessão
Bootstrap HTTP ativo no ponto de entrada
Mocks cobrindo cenários principais (login, restore, logout, onboarding, erros)
Backend: stub (API lança exceções, datasource real não é usada)
Refresh token: stub (sempre falha; fluxo e integração com interceptor prontos)
Dívida conhecida: sessionStorage depende de secureStorageService (SECURITY)
2. Arquitetura do AUTH
2.1 Visão geral
Aspecto	Descrição
Objetivo	Autenticação e sessão confiáveis, base para o módulo SECURITY
Responsabilidades	Login, logout, recuperação de senha, cadastro PF/PJ, bootstrap de sessão, restore, hidratação, rota inicial
Limites	Não implementa PIN, biometria, challenge, proteção transacional (responsabilidade do SECURITY)
Dependências	shared (api, httpClient); security (secureStorageService — dívida técnica)
Estrutura	api, data/datasources, errors, hooks, infra, observability, presentation/screens, services, session, store, types
2.2 Fluxo arquitetural
screen → hook → service → datasource → api → httpClient
                    ↓
               sessionManager (persist/restore/clear)
                    ↑
            useAuthStore (reflexo em memória)
Fluxos complementares:

store.loadStoredSession() → sessionManager.restore() → sessionHydrator.hydrate() → dataSource.me()
store.logout() → sessionManager.clear() → dataSource.logout() + sessionStorage.clearTokens()
authTokenProvider → sessionStorage.getTokens() (para httpClient injetar token)
auth401Interceptor → refreshTokenService.refresh() → em sucesso sessionManager.applyRefreshedTokens(); em falha store.logout()
2.3 Papéis das camadas
Camada	Papel	Exemplos
screen	UI, chama hooks, exibe loading/erros	LoginScreen, ForgotPasswordScreen
hook	UI ↔ caso de uso, valida e sanitiza	useLogin, useLogout, useSessionBootstrap
service	Orquestra caso de uso	loginService, forgotPasswordService
datasource	Fonte externa (API/mock)	mockAuthDataSource, backendAuthDataSource
api	Chamadas HTTP	auth.api (stub)
session	Orquestração e persistência de sessão	sessionManager, sessionStorage, sessionHydrator
store	Reflexo em memória da sessão	useAuthStore
infra	Provedor de token e interceptor 401	authTokenProvider, auth401Interceptor
2.4 Mocks e factory
USE_AUTH_MOCKS = true em auth-mock.constants.ts
authDataSourceFactory() retorna mockAuthDataSource ou backendAuthDataSource
Mock e backend implementam AuthDataSource com o mesmo contrato
Cenários de mock vêm de mockAuthScenarios.ts e são selecionados por documento/CPF
3. Como funciona hoje com mocks
3.1 Bootstrap na abertura
app/_layout.tsx: mount → useEffect chama initializeHttpClient()
httpBootstrap: registra authTokenProvider e auth401Interceptor no httpClient (idempotente)
index (splash): ~1.8s → navega para /loading
loading: useSessionBootstrap roda loadStoredSession()
loadStoredSession: sessionManager.restore() → sessionStorage.getTokens() → sessionExpirationService.isSessionExpired() → sessionHydrator.hydrate() → dataSource.me(accessToken)
Store recebe o resultado: session, isAuthenticated, restoreError
resolveAuthRoute() define rota inicial com base em isAuthenticated e onboardingStatus
Loading navega para essa rota
3.2 Login
Tela de login → useLogin.login(formData)
Validação e sanitização do documento
loginService.execute({ documento, senha }) → dataSource.login() (mock)
Mock usa getMockScenarioByDocumento() e valida senha
mapLoginDataToSession(apiData) gera AuthSession
sessionManager.persist(session) → sessionStorage.saveTokens()
store.login(session)
resolveAuthRoute() com onboardingStatus → router.replace(rota)
Documentos especiais do mock:

Documento	Comportamento
11111111111	Aprovado → área principal
22222222222	Pendente → tela de pendente
33333333333	Em análise → em análise
44444444444	Documentos pendentes
55555555555	Rejeitado
77777777777	Sessão expirada (expiresIn: 0)
00000000000	Credenciais inválidas
99999999999 / 88888888888	Erro de rede/timeout
Senha padrão	123456
3.3 Restore de sessão
Chamado em loadStoredSession durante bootstrap
sessionManager.restore():
Sem token → NO_STORED_TOKENS
Token expirado (expiresAt passado) → TOKEN_EXPIRED e sessionStorage.clearTokens()
sessionHydrator.hydrate() chama dataSource.me(accessToken) (mock extrai documento de mock-access-{doc})
Store: sucesso → session, isAuthenticated: true; falha → session: null, restoreError preenchido
3.4 Logout
useLogout.logout() chama store.logout()
sessionManager.clear():
Chama dataSource.logout() (mock retorna ok)
Chama sessionStorage.clearTokens()
Se clear() retornar sucesso → store limpa e retorna { success: true }
useLogout só faz router.replace(login) quando result.success === true
3.5 Invalidação por 401
auth401Interceptor recebe 401
Ignora /auth/refresh, evita retry em loop (_authRetried)
Usa lock para um único refresh em andamento
Chama refreshTokenService.refresh() → stub sempre falha
Em falha → store.logout() (fluxo oficial)
Em sucesso (não ocorre hoje) → sessionManager.applyRefreshedTokens() + retry da requisição
3.6 Onboarding por documento
Rota definida por onboardingStatus:
aprovado → /(tabs)
pendente → /auth/onboarding/pendente
em_analise → /auth/onboarding/em-analise
etc.
Mock retorna status de acordo com o documento usado no login.
3.7 Tratamento de erros
authErrorMapper.fromError() converte para AuthError
authErrorFactory para cenários conhecidos (credenciais, rede, sessão expirada etc.)
Hook/screen usam authError e mensagens amigáveis
Store mantém authError e restoreError para UI
3.8 Sincronização store / storage / UI
sessionManager orquestra storage e sessão
Store apenas reflete (restore/login/logout)
UI usa isAuthenticated, session, restoreError
app/_layout protege rotas: se !isAuthenticated em rota protegida → router.replace("/welcome")
4. Como funcionará com API real
4.1 Pontos já preparados
Contratos em auth.api.types.ts (request/response)
AuthDataSource com métodos usados pelo app
authDataSourceFactory para alternar mock/backend
sessionManager orquestra persistência e restore
auth401Interceptor pronto para refresh + retry
sessionManager.applyRefreshedTokens() para aplicar novos tokens
Fluxo 401 → refresh → invalidação via store.logout()
backendAuthDataSource usa auth.api, mas a API é stub
4.2 Integração pendente
Componente	Situação atual	Para API real
auth.api	Lança "integrar com backend"	Implementar POST/GET com httpClient real
AuthDataSource	Sem refreshTokens()	Incluir refreshTokens(refreshToken): Promise<RefreshApiData>
refreshToken.service	Stub que sempre falha	Obter refresh do storage, chamar dataSource.refreshTokens(), aplicar tokens via sessionManager.applyRefreshedTokens()
backendAuthDataSource	Delega para auth.api	Após auth.api pronta, apenas apontar para ela; adicionar refreshTokens quando backend suportar
4.3 Fluxo esperado com backend real
Login:
auth.api.login() → POST /auth/login → resposta mapeada → sessionManager.persist() → store

Restore:
sessionStorage.getTokens() → sessionExpirationService → dataSource.me(accessToken) (GET /auth/me) → sessionHydrator → store

Refresh:
401 → refreshTokenService.refresh() → dataSource.refreshTokens(refreshToken) (POST /auth/refresh) → sessionManager.applyRefreshedTokens() → retry da requisição original

Logout:
dataSource.logout() (POST/endpoint de logout) + sessionStorage.clearTokens() → store limpa

5. O que já está pronto
Componente	Estado	Observação
Fluxo arquitetural	Pronto	screen → hook → service → datasource respeitado
sessionManager	Pronto	persist, restore, clear, applyRefreshedTokens
useAuthStore	Pronto	Reflexo, loadStoredSession, logout
sessionStorage	Pronto com dívida	AUTH → SECURITY (secureStorageService)
sessionHydrator	Pronto	Usa authDataSourceFactory
sessionExpirationService	Pronto	isSessionExpired()
authTokenProvider	Pronto	Lê do sessionStorage
auth401Interceptor	Pronto	401, lock, refresh, invalidação, retry
httpBootstrap	Pronto	Ativo em _layout
Mocks	Prontos	Cenários por documento
Erros tipados	Prontos	AuthError, AuthErrorCode, mapper, factory
Proteção de rotas	Pronta	_layout redireciona por isAuthenticated
resolveAuthRoute	Pronto	Decisão por onboardingStatus
6. O que ainda está pendente
Componente	Estado	Integração futura
auth.api	Stub	Implementar com httpClient
refreshToken.service	Stub	Implementar com datasource + sessionManager.applyRefreshedTokens
AuthDataSource	Sem refresh	Adicionar refreshTokens() quando backend tiver endpoint
backendAuthDataSource.logout	No-op	Chamar endpoint real quando existir
sessionStorage	Depende de SECURITY	Migrar para abstração neutra (shared) no futuro
7. Riscos e dívidas técnicas
7.1 Dívidas documentadas
sessionStorage → secureStorageService (SECURITY)
sessionStorage depende diretamente de SECURITY. O próprio arquivo cita que o ideal é uma abstração neutra em shared e injeção no bootstrap.

auth.api
Funções ainda lançam "integrar com backend". Com USE_AUTH_MOCKS = false, o app quebraria.

7.2 Limitações atuais
Refresh token
Sempre falha, então qualquer 401 leva à invalidação de sessão. Com API real, o fluxo de refresh precisa ser implementado.

backendAuthDataSource
Usa auth.api que não está implementada. Trocar para backend exige auth.api funcional.

Seleção mock/backend
USE_AUTH_MOCKS é estático; não há toggle em runtime (ex.: feature flag).

7.3 Impacto para o SECURITY
AUTH não depende de lógica do SECURITY (PIN, biometria, etc.)
SECURITY fornece secureStorageService, usado pelo sessionStorage
Ideal: abstrair storage seguro em shared para inverter a dependência e reduzir risco arquitetural
8. Conclusão final
8.1 Como o AUTH funciona hoje
O módulo AUTH está operacional com mocks e segue o contrato arquitetural. Login, restore, logout, onboarding por status, erros tipados, proteção de rotas e bootstrap estão implementados. O provider de token e o interceptor 401 estão registrados e ativos. O fluxo de 401 → refresh está definido; o refresh em si é stub e sempre falha, levando à invalidação da sessão.

8.2 Como funcionará com API real
Com auth.api implementada e USE_AUTH_MOCKS = false, o app passará a usar backendAuthDataSource sem alterar services ou hooks. Para refresh token, será necessário adicionar refreshTokens no AuthDataSource, implementar refreshToken.service e o endpoint correspondente no auth.api. O restante (interceptor, applyRefreshedTokens, fluxo de invalidação) já está pronto.

8.3 O que está consolidado
Arquitetura em camadas
Fluxos de sessão (persist, restore, clear)
Fluxo 401 → refresh → invalidação (estrutura pronta)
Bootstrap HTTP e proteção de rotas
Mocks e erros tipados
Store, storage e UI alinhados
Base adequada para evoluir o SECURITY
8.4 O que ainda depende de integração
Implementação real de auth.api
Implementação real de refresh token
Extensão do AuthDataSource para refreshTokens()
Opcional: abstração neutra para storage seguro e remoção da dependência direta AUTH → SECURITY