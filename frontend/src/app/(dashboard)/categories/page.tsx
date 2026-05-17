import type { Metadata } from 'next';
import { CategoriesView } from '@/features/categories/CategoriesView';

export const metadata: Metadata = { title: 'Categories' };

export default function CategoriesPage() {
  return <CategoriesView />;
}
