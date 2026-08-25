import React from 'react';
import { ShieldCheck, Star, Clock, User as UserIcon, ArrowRight } from 'lucide-react';
import { User, Listing } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  seller: Listing['seller'];
}

export const SellerCard: React.FC<Props> = ({ seller }) => {
  const { navigate, t } = useApp();

  if (!seller) return null;

  return (
    <div className="p-6 bg-[#123D2A] text-[#F5F1E8] space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#F5F1E8]/70 uppercase tracking-widest">
          {t.sellerProfile}
        </span>
        <button
          id={`btn-view-seller-${seller.username}`}
          onClick={() => navigate('user-profile', { username: seller.username })}
          className="text-[10px] text-[#F5F1E8] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          <span>Profil ansehen</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <img
          src={seller.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
          alt={seller.firstName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-serif font-bold text-xl text-[#F5F1E8] truncate">
              {seller.firstName}
            </h4>
            {seller.emailVerified && (
              <ShieldCheck className="w-4 h-4 text-[#F4C430]" />
            )}
          </div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#F5F1E8]/70 truncate">
            @{seller.username} • {seller.postalCode} {seller.city}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8 pt-4 border-t border-[#F5F1E8]/20">
        <div>
          <div className="flex items-center gap-1 font-serif font-bold text-lg text-[#F5F1E8] mb-0.5">
            <span>{seller.ratingAverage}</span>
            <Star className="w-4 h-4 fill-current text-[#F4C430]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8]/70">
            {seller.ratingCount} Bewertungen
          </span>
        </div>

        <div>
          <div className="font-serif font-bold text-lg text-[#F5F1E8] mb-0.5">
            {seller.memberSince.replace('Neu in ', '')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8]/70">
            {t.memberSince}
          </span>
        </div>
      </div>
    </div>
  );
};
