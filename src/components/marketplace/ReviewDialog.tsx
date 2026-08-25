import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, Check } from 'lucide-react';
import { storage } from '../../services/storage';
import { useApp } from '../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}

export const ReviewDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}) => {
  const { user, showToast, t } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Sehr freundlich', 'Sehr zuverlässig']);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const availableTags = [
    t.tagFriendly,
    t.tagReliable,
    t.tagQuickReply,
    t.tagAsDescribed,
    t.tagSmoothDeal,
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      return;
    }
    storage.addReview({
      reviewerId: user.id,
      reviewerName: `${user.firstName} ${user.lastName.charAt(0)}.`,
      reviewerAvatar: user.avatarUrl,
      reviewedUserId: targetUserId,
      rating,
      tags: selectedTags,
      comment: comment.trim() || undefined,
    });
    showToast(t.reviewSubmitted, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#F5F1E8] dark:bg-[#111511] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#123D2A]/10 dark:border-white/10"
      >
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
          <h3 className="font-serif font-bold text-2xl text-[#123D2A] dark:text-[#F4C430] flex items-center gap-2">
            <Star className="w-6 h-6 fill-current" />
            {t.leaveReview}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm font-medium text-[#171A17]/80 dark:text-gray-300">
            Wie war deine Erfahrung mit <strong className="text-[#123D2A] dark:text-white font-bold">{targetUserName}</strong>?
          </p>

          {/* STAR RATING */}
          <div className="flex items-center justify-center gap-3 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= rating
                      ? 'text-[#F4C430] fill-[#F4C430]'
                      : 'text-gray-300 dark:text-gray-700'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* TAG CHIPS */}
          <div>
            <label className="block text-sm font-bold text-[#123D2A] dark:text-gray-300 mb-3 uppercase tracking-widest">
              {t.praiseTags}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
                      active
                        ? 'bg-[#123D2A] text-[#F4C430] border-[#123D2A] dark:bg-[#F4C430] dark:text-[#123D2A] dark:border-[#F4C430]'
                        : 'bg-transparent border-[#123D2A]/20 dark:border-white/20 text-[#171A17] dark:text-gray-300 hover:border-[#123D2A]/50 dark:hover:border-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {active && <Check className="w-4 h-4" />}
                      <span>{tag}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMMENT */}
          <div>
            <label className="block text-sm font-bold text-[#123D2A] dark:text-gray-300 mb-2 uppercase tracking-widest">
              {t.reviewCommentOptional}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Kurze Anmerkung zum Ablauf der Übergabe..."
              className="w-full p-4 bg-transparent border border-[#123D2A]/20 dark:border-white/20 text-[#171A17] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#123D2A]/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:opacity-60 transition-opacity"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#123D2A] dark:bg-[#F4C430] hover:bg-[#0D2C1E] dark:hover:bg-[#E4B528] text-[#F5F1E8] dark:text-[#123D2A] font-bold uppercase tracking-widest transition-colors"
            >
              {t.submitReview}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
