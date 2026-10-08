import { Headphones, Shirt, Lamp, Tent, BookOpen, Package } from 'lucide-react';

/**
 * The Product entity has no image field, so a placeholder
 * tinted by category is shown instead.
 */
const THEMES = {
  electronics: { bg: '#e9ecfb', fg: '#3446c9', Icon: Headphones },
  clothing: { bg: '#f7ece6', fg: '#a2502a', Icon: Shirt },
  'home-living': { bg: '#eef3e8', fg: '#4d6b2c', Icon: Lamp },
  'sports-outdoors': { bg: '#e5f2f2', fg: '#1f6a6a', Icon: Tent },
  'books-hobbies': { bg: '#f4eef8', fg: '#6c3f8f', Icon: BookOpen },
};

export default function ProductImage({ product, size = 'md' }) {
  const theme = THEMES[product?.category?.slug] ?? { bg: '#f0f0ee', fg: '#5a5a63', Icon: Package };
  const { Icon } = theme;
  const iconSize = { sm: 22, md: 44, lg: 88 }[size];

  return (
    <div
      className={`product-image product-image--${size}`}
      style={{ background: theme.bg, color: theme.fg }}
      role="img"
      aria-label={product?.name}
    >
      <Icon size={iconSize} strokeWidth={1.4} />
    </div>
  );
}
