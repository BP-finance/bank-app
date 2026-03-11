// ESTILOS SEMANTICOS
// // 1. Paleta de Fundações (Cores "cruas")
const PALETTE = {
  slateDark: "#121212",
  slateGray: "#94A3B8",
  pinkHot: "#EB0459",
  white: "#FFFFFF",
  frostedGlass: "#F0F2F5", // Fundo principal
  txtprimary: "#FFFFFF",
  txtsecondary: "#94A3B8",
  txtthird: "#131313",
};

export const COLORS = {
  // Brand / Ação
  primary: PALETTE.pinkHot,
  darkbrand: PALETTE.slateDark,

  // Backgrounds 
  background: PALETTE.frostedGlass,
  background_white: PALETTE.white,
  lightcolor: "#fff",
  darkcolor: "#131313",
  card: "#1E293B",
  tabbar: "#131313",
  tabbarligth: "#fff",

  // Textos
  textPrimary: PALETTE.txtprimary,
  textSecondary: PALETTE.txtsecondary,
  textThirdary: PALETTE.txtthird,

  // Ícones
  iconBackground: PALETTE.white,    // fundo dos ícones
  iconBackgroundSecondary: PALETTE.pinkHot,
  iconBackgroundThird: PALETTE.slateDark,
  iconPrimary: PALETTE.white,    // Ícones principais/ativos
  iconSecondary: PALETTE.slateGray, // Ícones de apoio ou desativados
  iconBrand: PALETTE.pinkHot,      // Ícones que levam a identidade da marca

  // Tabbar específica
  tabBarBackground: PALETTE.slateDark, // O fundo da barra
  tabBarIconSelected: PALETTE.pinkHot,
  tabBarIconDefault: PALETTE.slateGray,
};

// // 2. Tokens Semânticos (O que você exporta para o app)
// export const COLORS = {
//   // Brand / Ação
//   primary: PALETTE.pinkHot,
//   accent: PALETTE.pinkHot,

//   // Backgrounds (Hierarquia de profundidade)
//   background: PALETTE.deepNavy,     // Fundo principal
//   surface: PALETTE.slateBlue,       // Cards, modais (elevação)
//   surfaceVariant: PALETTE.slateDark, // Tabbar, inputs

//   // Texto
//   textPrimary: PALETTE.white,
//   textSecondary: PALETTE.slateGray,
//   textOnPrimary: PALETTE.white,     // Cor do texto dentro de um botão primary

//   // Navegação / UI Especifica
//   navigationBar: PALETTE.slateDark,
//   border: "#2D3748", // Sugestão para divisores
// };