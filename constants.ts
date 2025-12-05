
import { ElementData, ElementCategory } from './types';

// Helper to create element (condensed for 118 elements)
const createEl = (n: number, s: string, na: string, v: string, r: number, c: number, cat: string): ElementData => ({
  number: n, symbol: s, name: na, valence: v, row: r, col: c, category: cat
});

export const PERIODIC_TABLE: ElementData[] = [
  // Period 1
  createEl(1, 'H', 'Hidrogênio', '1s1', 1, 1, ElementCategory.Nonmetal),
  createEl(2, 'He', 'Hélio', '1s2', 1, 18, ElementCategory.NobleGas),

  // Period 2
  createEl(3, 'Li', 'Lítio', '2s1', 2, 1, ElementCategory.AlkaliMetal),
  createEl(4, 'Be', 'Berílio', '2s2', 2, 2, ElementCategory.AlkalineEarthMetal),
  createEl(5, 'B', 'Boro', '2p1', 2, 13, ElementCategory.Metalloid),
  createEl(6, 'C', 'Carbono', '2p2', 2, 14, ElementCategory.Nonmetal),
  createEl(7, 'N', 'Nitrogênio', '2p3', 2, 15, ElementCategory.Nonmetal),
  createEl(8, 'O', 'Oxigênio', '2p4', 2, 16, ElementCategory.Nonmetal),
  createEl(9, 'F', 'Flúor', '2p5', 2, 17, ElementCategory.Halogen),
  createEl(10, 'Ne', 'Neônio', '2p6', 2, 18, ElementCategory.NobleGas),

  // Period 3
  createEl(11, 'Na', 'Sódio', '3s1', 3, 1, ElementCategory.AlkaliMetal),
  createEl(12, 'Mg', 'Magnésio', '3s2', 3, 2, ElementCategory.AlkalineEarthMetal),
  createEl(13, 'Al', 'Alumínio', '3p1', 3, 13, ElementCategory.PostTransitionMetal),
  createEl(14, 'Si', 'Silício', '3p2', 3, 14, ElementCategory.Metalloid),
  createEl(15, 'P', 'Fósforo', '3p3', 3, 15, ElementCategory.Nonmetal),
  createEl(16, 'S', 'Enxofre', '3p4', 3, 16, ElementCategory.Nonmetal),
  createEl(17, 'Cl', 'Cloro', '3p5', 3, 17, ElementCategory.Halogen),
  createEl(18, 'Ar', 'Argônio', '3p6', 3, 18, ElementCategory.NobleGas),

  // Period 4
  createEl(19, 'K', 'Potássio', '4s1', 4, 1, ElementCategory.AlkaliMetal),
  createEl(20, 'Ca', 'Cálcio', '4s2', 4, 2, ElementCategory.AlkalineEarthMetal),
  createEl(21, 'Sc', 'Escândio', '3d1', 4, 3, ElementCategory.TransitionMetal),
  createEl(22, 'Ti', 'Titânio', '3d2', 4, 4, ElementCategory.TransitionMetal),
  createEl(23, 'V', 'Vanádio', '3d3', 4, 5, ElementCategory.TransitionMetal),
  createEl(24, 'Cr', 'Crômio', '3d5', 4, 6, ElementCategory.TransitionMetal),
  createEl(25, 'Mn', 'Manganês', '3d5', 4, 7, ElementCategory.TransitionMetal),
  createEl(26, 'Fe', 'Ferro', '3d6', 4, 8, ElementCategory.TransitionMetal),
  createEl(27, 'Co', 'Cobalto', '3d7', 4, 9, ElementCategory.TransitionMetal),
  createEl(28, 'Ni', 'Níquel', '3d8', 4, 10, ElementCategory.TransitionMetal),
  createEl(29, 'Cu', 'Cobre', '3d10', 4, 11, ElementCategory.TransitionMetal),
  createEl(30, 'Zn', 'Zinco', '3d10', 4, 12, ElementCategory.TransitionMetal),
  createEl(31, 'Ga', 'Gálio', '4p1', 4, 13, ElementCategory.PostTransitionMetal),
  createEl(32, 'Ge', 'Germânio', '4p2', 4, 14, ElementCategory.Metalloid),
  createEl(33, 'As', 'Arsênio', '4p3', 4, 15, ElementCategory.Metalloid),
  createEl(34, 'Se', 'Selênio', '4p4', 4, 16, ElementCategory.Nonmetal),
  createEl(35, 'Br', 'Bromo', '4p5', 4, 17, ElementCategory.Halogen),
  createEl(36, 'Kr', 'Criptônio', '4p6', 4, 18, ElementCategory.NobleGas),

  // Period 5
  createEl(37, 'Rb', 'Rubídio', '5s1', 5, 1, ElementCategory.AlkaliMetal),
  createEl(38, 'Sr', 'Estrôncio', '5s2', 5, 2, ElementCategory.AlkalineEarthMetal),
  createEl(39, 'Y', 'Ítrio', '4d1', 5, 3, ElementCategory.TransitionMetal),
  createEl(40, 'Zr', 'Zircônio', '4d2', 5, 4, ElementCategory.TransitionMetal),
  createEl(41, 'Nb', 'Nióbio', '4d4', 5, 5, ElementCategory.TransitionMetal),
  createEl(42, 'Mo', 'Molibdênio', '4d5', 5, 6, ElementCategory.TransitionMetal),
  createEl(43, 'Tc', 'Tecnécio', '4d5', 5, 7, ElementCategory.TransitionMetal),
  createEl(44, 'Ru', 'Rutênio', '4d7', 5, 8, ElementCategory.TransitionMetal),
  createEl(45, 'Rh', 'Ródio', '4d8', 5, 9, ElementCategory.TransitionMetal),
  createEl(46, 'Pd', 'Paládio', '4d10', 5, 10, ElementCategory.TransitionMetal),
  createEl(47, 'Ag', 'Prata', '4d10', 5, 11, ElementCategory.TransitionMetal),
  createEl(48, 'Cd', 'Cádmio', '4d10', 5, 12, ElementCategory.TransitionMetal),
  createEl(49, 'In', 'Índio', '5p1', 5, 13, ElementCategory.PostTransitionMetal),
  createEl(50, 'Sn', 'Estanho', '5p2', 5, 14, ElementCategory.PostTransitionMetal),
  createEl(51, 'Sb', 'Antimônio', '5p3', 5, 15, ElementCategory.Metalloid),
  createEl(52, 'Te', 'Telúrio', '5p4', 5, 16, ElementCategory.Metalloid),
  createEl(53, 'I', 'Iodo', '5p5', 5, 17, ElementCategory.Halogen),
  createEl(54, 'Xe', 'Xenônio', '5p6', 5, 18, ElementCategory.NobleGas),

  // Period 6
  createEl(55, 'Cs', 'Césio', '6s1', 6, 1, ElementCategory.AlkaliMetal),
  createEl(56, 'Ba', 'Bário', '6s2', 6, 2, ElementCategory.AlkalineEarthMetal),
  // Lanthanides (57-71) - Visual Row 9
  createEl(57, 'La', 'Lantânio', '5d1', 9, 4, ElementCategory.Lanthanide),
  createEl(58, 'Ce', 'Cério', '4f1', 9, 5, ElementCategory.Lanthanide),
  createEl(59, 'Pr', 'Praseodímio', '4f3', 9, 6, ElementCategory.Lanthanide),
  createEl(60, 'Nd', 'Neodímio', '4f4', 9, 7, ElementCategory.Lanthanide),
  createEl(61, 'Pm', 'Promécio', '4f5', 9, 8, ElementCategory.Lanthanide),
  createEl(62, 'Sm', 'Samário', '4f6', 9, 9, ElementCategory.Lanthanide),
  createEl(63, 'Eu', 'Európio', '4f7', 9, 10, ElementCategory.Lanthanide),
  createEl(64, 'Gd', 'Gadolínio', '5d1', 9, 11, ElementCategory.Lanthanide),
  createEl(65, 'Tb', 'Térbio', '4f9', 9, 12, ElementCategory.Lanthanide),
  createEl(66, 'Dy', 'Disprósio', '4f10', 9, 13, ElementCategory.Lanthanide),
  createEl(67, 'Ho', 'Hólmio', '4f11', 9, 14, ElementCategory.Lanthanide),
  createEl(68, 'Er', 'Érbio', '4f12', 9, 15, ElementCategory.Lanthanide),
  createEl(69, 'Tm', 'Túlio', '4f13', 9, 16, ElementCategory.Lanthanide),
  createEl(70, 'Yb', 'Itérbio', '4f14', 9, 17, ElementCategory.Lanthanide),
  createEl(71, 'Lu', 'Lutécio', '5d1', 9, 18, ElementCategory.Lanthanide),
  
  // Period 6 Continued
  createEl(72, 'Hf', 'Háfnio', '5d2', 6, 4, ElementCategory.TransitionMetal),
  createEl(73, 'Ta', 'Tântalo', '5d3', 6, 5, ElementCategory.TransitionMetal),
  createEl(74, 'W', 'Tungstênio', '5d4', 6, 6, ElementCategory.TransitionMetal),
  createEl(75, 'Re', 'Rênio', '5d5', 6, 7, ElementCategory.TransitionMetal),
  createEl(76, 'Os', 'Ósmio', '5d6', 6, 8, ElementCategory.TransitionMetal),
  createEl(77, 'Ir', 'Irídio', '5d7', 6, 9, ElementCategory.TransitionMetal),
  createEl(78, 'Pt', 'Platina', '5d9', 6, 10, ElementCategory.TransitionMetal),
  createEl(79, 'Au', 'Ouro', '5d10', 6, 11, ElementCategory.TransitionMetal),
  createEl(80, 'Hg', 'Mercúrio', '5d10', 6, 12, ElementCategory.TransitionMetal),
  createEl(81, 'Tl', 'Tálio', '6p1', 6, 13, ElementCategory.PostTransitionMetal),
  createEl(82, 'Pb', 'Chumbo', '6p2', 6, 14, ElementCategory.PostTransitionMetal),
  createEl(83, 'Bi', 'Bismuto', '6p3', 6, 15, ElementCategory.PostTransitionMetal),
  createEl(84, 'Po', 'Polônio', '6p4', 6, 16, ElementCategory.Metalloid),
  createEl(85, 'At', 'Astato', '6p5', 6, 17, ElementCategory.Halogen),
  createEl(86, 'Rn', 'Radônio', '6p6', 6, 18, ElementCategory.NobleGas),

  // Period 7
  createEl(87, 'Fr', 'Frâncio', '7s1', 7, 1, ElementCategory.AlkaliMetal),
  createEl(88, 'Ra', 'Rádio', '7s2', 7, 2, ElementCategory.AlkalineEarthMetal),
  // Actinides (89-103) - Visual Row 10
  createEl(89, 'Ac', 'Actínio', '6d1', 10, 4, ElementCategory.Actinide),
  createEl(90, 'Th', 'Tório', '6d2', 10, 5, ElementCategory.Actinide),
  createEl(91, 'Pa', 'Protactínio', '5f2', 10, 6, ElementCategory.Actinide),
  createEl(92, 'U', 'Urânio', '5f3', 10, 7, ElementCategory.Actinide),
  createEl(93, 'Np', 'Netúnio', '5f4', 10, 8, ElementCategory.Actinide),
  createEl(94, 'Pu', 'Plutônio', '5f6', 10, 9, ElementCategory.Actinide),
  createEl(95, 'Am', 'Amerício', '5f7', 10, 10, ElementCategory.Actinide),
  createEl(96, 'Cm', 'Cúrio', '6d1', 10, 11, ElementCategory.Actinide),
  createEl(97, 'Bk', 'Berquélio', '5f9', 10, 12, ElementCategory.Actinide),
  createEl(98, 'Cf', 'Califórnio', '5f10', 10, 13, ElementCategory.Actinide),
  createEl(99, 'Es', 'Einstênio', '5f11', 10, 14, ElementCategory.Actinide),
  createEl(100, 'Fm', 'Férmio', '5f12', 10, 15, ElementCategory.Actinide),
  createEl(101, 'Md', 'Mendelévio', '5f13', 10, 16, ElementCategory.Actinide),
  createEl(102, 'No', 'Nobélio', '5f14', 10, 17, ElementCategory.Actinide),
  createEl(103, 'Lr', 'Laurêncio', '6d1', 10, 18, ElementCategory.Actinide),
  
  // Period 7 Continued
  createEl(104, 'Rf', 'Rutherfórdio', '6d2', 7, 4, ElementCategory.TransitionMetal),
  createEl(105, 'Db', 'Dúbnio', '6d3', 7, 5, ElementCategory.TransitionMetal),
  createEl(106, 'Sg', 'Seabórgio', '6d4', 7, 6, ElementCategory.TransitionMetal),
  createEl(107, 'Bh', 'Bóhrio', '6d5', 7, 7, ElementCategory.TransitionMetal),
  createEl(108, 'Hs', 'Hássio', '6d6', 7, 8, ElementCategory.TransitionMetal),
  createEl(109, 'Mt', 'Meitnério', '6d7', 7, 9, ElementCategory.TransitionMetal),
  createEl(110, 'Ds', 'Darmstádio', '6d9', 7, 10, ElementCategory.TransitionMetal),
  createEl(111, 'Rg', 'Roentgênio', '6d10', 7, 11, ElementCategory.TransitionMetal),
  createEl(112, 'Cn', 'Copernício', '6d10', 7, 12, ElementCategory.TransitionMetal),
  createEl(113, 'Nh', 'Nihônio', '7p1', 7, 13, ElementCategory.PostTransitionMetal),
  createEl(114, 'Fl', 'Fleróvio', '7p2', 7, 14, ElementCategory.PostTransitionMetal),
  createEl(115, 'Mc', 'Moscóvio', '7p3', 7, 15, ElementCategory.PostTransitionMetal),
  createEl(116, 'Lv', 'Livermório', '7p4', 7, 16, ElementCategory.PostTransitionMetal),
  createEl(117, 'Ts', 'Tenesso', '7p5', 7, 17, ElementCategory.Halogen),
  createEl(118, 'Og', 'Oganessônio', '7p6', 7, 18, ElementCategory.NobleGas),
];

export const CATEGORY_COLORS: Record<string, string> = {
  [ElementCategory.Nonmetal]: "bg-blue-600",
  [ElementCategory.NobleGas]: "bg-purple-600",
  [ElementCategory.AlkaliMetal]: "bg-red-600",
  [ElementCategory.AlkalineEarthMetal]: "bg-orange-500",
  [ElementCategory.Metalloid]: "bg-teal-600",
  [ElementCategory.Halogen]: "bg-green-600",
  [ElementCategory.PostTransitionMetal]: "bg-indigo-500",
  [ElementCategory.TransitionMetal]: "bg-yellow-600",
  [ElementCategory.Lanthanide]: "bg-pink-500",
  [ElementCategory.Actinide]: "bg-rose-700",
  [ElementCategory.Unknown]: "bg-gray-500"
};

export const MAX_TURNS = 60; // Increased for larger board
export const HINT_INTERVAL = 5;
