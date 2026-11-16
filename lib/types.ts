export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  category: "harti" | "vederi" | "carti";
  title: string;
  shortTitle?: string;
  description: string;
  longDescription?: string;
  price: string;
  priceNumeric: number;
  images: ProductImage[];
  thumbnailImage: string;
  specifications: ProductSpecification[];
  storyTitle?: string;
  storyContent?: string;
  orderLink?: string;
  orderButtonText?: string;
  availableSoon?: boolean;
  featured?: boolean;
  buttonColor?: string;
  hasGift?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  sortOrder?: number;
  giftProduct?: {
    title: string;
    description: string;
    images: ProductImage[];
    link: string;
  };
}

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  itemCount?: string;
  href: string;
  buttonText: string;
  buttonColor?: string;
}

export interface PromoPackage {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  longDescription?: string;
  price: string;
  priceNumeric: number;
  images: ProductImage[];
  thumbnailImage: string;
  specifications: ProductSpecification[];
  storyTitle?: string;
  storyContent?: string;
  orderLink?: string;
  orderButtonText?: string;
  buttonColor?: string;
  availableSoon?: boolean;
  hasGift?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  giftDescription?: string;
  giftImages?: ProductImage[];
  giftProduct?: {
    title: string;
    description: string;
    images: ProductImage[];
    link: string;
  };
}
