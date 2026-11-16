export interface NavigationItem {
  label: string;
  href: string;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Acasă",
    href: "/",
  },
  {
    label: "Produse",
    href: "/produse",
  },
  {
    label: "Povestea Noastră",
    href: "/despre",
  },
  {
    label: "Video",
    href: "/video",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];
