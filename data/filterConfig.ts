export interface FilterConfig {
  id: string;
  name: string;
  icon: string;
  type?: 'category' | 'action';
  subFilters?: FilterConfig[];
}

export const filterTree: Record<string, FilterConfig[]> = {
  root: [
    {
      id: 'professionals',
      name: 'Profissionais',
      icon: 'medkit-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'patients',
      name: 'Pacientes',
      icon: 'person-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'associations',
      name: 'Associações',
      icon: 'people-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'products',
      name: 'Produtos',
      icon: 'storefront-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'forum',
      name: 'Fórum',
      icon: 'chatbubbles-outline',
      type: 'action'
    },
    {
      id: 'profile',
      name: 'Perfil',
      icon: 'person',
      type: 'action'
    }
  ],
  professionals: [
    { id: 'services', name: 'Serviços', icon: 'briefcase-outline', type: 'category' },
    { id: 'forum_posts', name: 'Postagens', icon: 'document-text-outline', type: 'category' }
  ],
  patients: [
    { id: 'forum_posts', name: 'Postagens', icon: 'document-text-outline', type: 'category' }
  ],
  associations: [
    { id: 'forum_posts', name: 'Postagens', icon: 'document-text-outline', type: 'category' },
    { id: 'products', name: 'Produtos', icon: 'cube-outline', type: 'category' }
  ],
  products: [
    { id: 'all', name: 'Todos', icon: 'apps-outline', type: 'category' }
  ]
};

export const getFiltersForCategory = (categoryId: string): FilterConfig[] => {
  return filterTree[categoryId] || filterTree.root;
};
