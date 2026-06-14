import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { ProductBanner } from '@/types';

interface ProductBannersProps {
  banners: ProductBanner[];
}

function isExternal(url: string) {
  return url.startsWith('http://') || url.startsWith('https://');
}

export default function ProductBanners({ banners }: ProductBannersProps) {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {banners.map((banner) => {
        const external = isExternal(banner.url);
        const Wrapper = external ? 'a' : Link;
        const extraProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
        return (
        <Wrapper
          key={banner.id}
          href={banner.url}
          {...extraProps}
          className="flex items-center gap-3 flex-1 border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#1A3C6E] transition-all group bg-white"
        >
          {banner.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.image}
              alt={banner.name}
              className="w-12 h-12 object-contain rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {banner.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1A3C6E] truncate">
              {banner.name}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{banner.description}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#FF6B35] flex-shrink-0" />
        </Wrapper>
        );
      })}
    </div>
  );
}
