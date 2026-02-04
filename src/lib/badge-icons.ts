import {
  // Monuments & Buildings
  Church, Castle, Building, Building2, Home, Landmark, Warehouse, Factory,
  // Nature
  TreeDeciduous, Flower2, Mountain, Sun, Moon, Star, Cloud, Droplets, Leaf,
  // Culture & Art
  Music, Palette, Drama, BookOpen, GraduationCap, Scroll, PenTool, Brush,
  // Food & Drink
  UtensilsCrossed, Coffee, Wine, Cake, Cookie, Pizza, IceCream, Cherry, Apple,
  // Activities
  Bike, Footprints, Flag, Trophy, Medal, Award, Crown, Gem, Heart, Sparkles,
  // Animals
  Bird, Fish, Bug, Cat, Dog, Rabbit, Snail, Shell,
  // Transport
  Train, Bus, Car, Plane, Ship, Anchor, Compass,
  // Objects
  Camera, Video, Music2, Mic, Bell, Gift, Key, Lock, Map, MapPin, Signpost,
  // People & Social
  Users, UserCircle, Hand, HandHeart, MessageCircle, PartyPopper,
  // Misc
  Flame, Zap, Rainbow, Rocket, Globe, Puzzle, Gamepad2, Dices, Target,
  LucideIcon
} from 'lucide-react';

export interface BadgeIconOption {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
}

export const BADGE_ICON_CATEGORIES = [
  'Monuments',
  'Natura',
  'Cultura',
  'Menjar',
  'Activitats',
  'Animals',
  'Transport',
  'Objectes',
  'Gent',
  'Altres'
] as const;

export type BadgeIconCategory = typeof BADGE_ICON_CATEGORIES[number];

export const BADGE_ICONS: BadgeIconOption[] = [
  // Monuments & Buildings
  { id: 'church', name: 'Església', icon: Church, category: 'Monuments' },
  { id: 'castle', name: 'Castell', icon: Castle, category: 'Monuments' },
  { id: 'building', name: 'Edifici', icon: Building, category: 'Monuments' },
  { id: 'building2', name: 'Edifici Alt', icon: Building2, category: 'Monuments' },
  { id: 'home', name: 'Casa', icon: Home, category: 'Monuments' },
  { id: 'landmark', name: 'Monument', icon: Landmark, category: 'Monuments' },
  { id: 'warehouse', name: 'Magatzem', icon: Warehouse, category: 'Monuments' },
  { id: 'factory', name: 'Fàbrica', icon: Factory, category: 'Monuments' },

  // Nature
  { id: 'tree', name: 'Arbre', icon: TreeDeciduous, category: 'Natura' },
  { id: 'flower', name: 'Flor', icon: Flower2, category: 'Natura' },
  { id: 'mountain', name: 'Muntanya', icon: Mountain, category: 'Natura' },
  { id: 'sun', name: 'Sol', icon: Sun, category: 'Natura' },
  { id: 'moon', name: 'Lluna', icon: Moon, category: 'Natura' },
  { id: 'star', name: 'Estrella', icon: Star, category: 'Natura' },
  { id: 'cloud', name: 'Núvol', icon: Cloud, category: 'Natura' },
  { id: 'droplets', name: 'Gotes', icon: Droplets, category: 'Natura' },
  { id: 'leaf', name: 'Fulla', icon: Leaf, category: 'Natura' },

  // Culture & Art
  { id: 'music', name: 'Música', icon: Music, category: 'Cultura' },
  { id: 'palette', name: 'Art', icon: Palette, category: 'Cultura' },
  { id: 'drama', name: 'Teatre', icon: Drama, category: 'Cultura' },
  { id: 'book', name: 'Llibre', icon: BookOpen, category: 'Cultura' },
  { id: 'graduation', name: 'Educació', icon: GraduationCap, category: 'Cultura' },
  { id: 'scroll', name: 'Pergamí', icon: Scroll, category: 'Cultura' },
  { id: 'pen', name: 'Ploma', icon: PenTool, category: 'Cultura' },
  { id: 'brush', name: 'Pinzell', icon: Brush, category: 'Cultura' },

  // Food & Drink
  { id: 'utensils', name: 'Restaurant', icon: UtensilsCrossed, category: 'Menjar' },
  { id: 'coffee', name: 'Cafè', icon: Coffee, category: 'Menjar' },
  { id: 'wine', name: 'Vi', icon: Wine, category: 'Menjar' },
  { id: 'cake', name: 'Pastís', icon: Cake, category: 'Menjar' },
  { id: 'cookie', name: 'Galeta', icon: Cookie, category: 'Menjar' },
  { id: 'pizza', name: 'Pizza', icon: Pizza, category: 'Menjar' },
  { id: 'icecream', name: 'Gelat', icon: IceCream, category: 'Menjar' },
  { id: 'cherry', name: 'Cirera', icon: Cherry, category: 'Menjar' },
  { id: 'apple', name: 'Poma', icon: Apple, category: 'Menjar' },

  // Activities
  { id: 'bike', name: 'Bici', icon: Bike, category: 'Activitats' },
  { id: 'footprints', name: 'Petjades', icon: Footprints, category: 'Activitats' },
  { id: 'flag', name: 'Bandera', icon: Flag, category: 'Activitats' },
  { id: 'trophy', name: 'Trofeu', icon: Trophy, category: 'Activitats' },
  { id: 'medal', name: 'Medalla', icon: Medal, category: 'Activitats' },
  { id: 'award', name: 'Premi', icon: Award, category: 'Activitats' },
  { id: 'crown', name: 'Corona', icon: Crown, category: 'Activitats' },
  { id: 'gem', name: 'Gemma', icon: Gem, category: 'Activitats' },
  { id: 'heart', name: 'Cor', icon: Heart, category: 'Activitats' },
  { id: 'sparkles', name: 'Espurnes', icon: Sparkles, category: 'Activitats' },

  // Animals
  { id: 'bird', name: 'Ocell', icon: Bird, category: 'Animals' },
  { id: 'fish', name: 'Peix', icon: Fish, category: 'Animals' },
  { id: 'bug', name: 'Insecte', icon: Bug, category: 'Animals' },
  { id: 'cat', name: 'Gat', icon: Cat, category: 'Animals' },
  { id: 'dog', name: 'Gos', icon: Dog, category: 'Animals' },
  { id: 'rabbit', name: 'Conill', icon: Rabbit, category: 'Animals' },
  { id: 'snail', name: 'Cargol', icon: Snail, category: 'Animals' },
  { id: 'shell', name: 'Petxina', icon: Shell, category: 'Animals' },

  // Transport
  { id: 'train', name: 'Tren', icon: Train, category: 'Transport' },
  { id: 'bus', name: 'Bus', icon: Bus, category: 'Transport' },
  { id: 'car', name: 'Cotxe', icon: Car, category: 'Transport' },
  { id: 'plane', name: 'Avió', icon: Plane, category: 'Transport' },
  { id: 'ship', name: 'Vaixell', icon: Ship, category: 'Transport' },
  { id: 'anchor', name: 'Àncora', icon: Anchor, category: 'Transport' },
  { id: 'compass', name: 'Brúixola', icon: Compass, category: 'Transport' },

  // Objects
  { id: 'camera', name: 'Càmera', icon: Camera, category: 'Objectes' },
  { id: 'video', name: 'Vídeo', icon: Video, category: 'Objectes' },
  { id: 'music2', name: 'Nota', icon: Music2, category: 'Objectes' },
  { id: 'mic', name: 'Micròfon', icon: Mic, category: 'Objectes' },
  { id: 'bell', name: 'Campana', icon: Bell, category: 'Objectes' },
  { id: 'gift', name: 'Regal', icon: Gift, category: 'Objectes' },
  { id: 'key', name: 'Clau', icon: Key, category: 'Objectes' },
  { id: 'lock', name: 'Cadenat', icon: Lock, category: 'Objectes' },
  { id: 'map', name: 'Mapa', icon: Map, category: 'Objectes' },
  { id: 'mappin', name: 'Ubicació', icon: MapPin, category: 'Objectes' },
  { id: 'signpost', name: 'Senyal', icon: Signpost, category: 'Objectes' },

  // People & Social
  { id: 'users', name: 'Grup', icon: Users, category: 'Gent' },
  { id: 'user', name: 'Persona', icon: UserCircle, category: 'Gent' },
  { id: 'hand', name: 'Mà', icon: Hand, category: 'Gent' },
  { id: 'handheart', name: 'Mà cor', icon: HandHeart, category: 'Gent' },
  { id: 'message', name: 'Missatge', icon: MessageCircle, category: 'Gent' },
  { id: 'party', name: 'Festa', icon: PartyPopper, category: 'Gent' },

  // Misc
  { id: 'flame', name: 'Flama', icon: Flame, category: 'Altres' },
  { id: 'zap', name: 'Llamp', icon: Zap, category: 'Altres' },
  { id: 'rainbow', name: 'Arc de Sant Martí', icon: Rainbow, category: 'Altres' },
  { id: 'rocket', name: 'Coet', icon: Rocket, category: 'Altres' },
  { id: 'globe', name: 'Globus', icon: Globe, category: 'Altres' },
  { id: 'puzzle', name: 'Puzzle', icon: Puzzle, category: 'Altres' },
  { id: 'gamepad', name: 'Joc', icon: Gamepad2, category: 'Altres' },
  { id: 'dices', name: 'Daus', icon: Dices, category: 'Altres' },
  { id: 'target', name: 'Diana', icon: Target, category: 'Altres' },
];

// Helper function to get icon by id
export function getBadgeIcon(iconId: string | null | undefined): LucideIcon {
  const found = BADGE_ICONS.find(icon => icon.id === iconId);
  return found?.icon ?? Star; // Default to Star if not found
}

// Helper function to get icons by category
export function getBadgeIconsByCategory(category: BadgeIconCategory): BadgeIconOption[] {
  return BADGE_ICONS.filter(icon => icon.category === category);
}
