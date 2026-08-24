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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#161E18] rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 text-[#123D2A] dark:text-[#F5C518] font-bold text-sm">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>{t.leaveReview}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Wie war deine Erfahrung mit <strong className="text-gray-900 dark:text-white">{targetUserName}</strong>?
          </p>

          {/* STAR RATING */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1.5 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300 dark:text-gray-700'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* TAG CHIPS */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t.praiseTags}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      active
                        ? 'bg-[#123D2A] text-[#F5C518] border-[#123D2A] dark:bg-[#F5C518] dark:text-[#123D2A] dark:border-[#F5C518] font-bold shadow-xs'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMMENT */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.reviewCommentOptional}
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Kurze Anmerkung zum Ablauf der Übergabe..."
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#123D2A]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#123D2A] dark:bg-[#F5C518] hover:bg-[#0D2C1E] dark:hover:bg-[#E5B215] text-white dark:text-[#123D2A] text-xs font-bold shadow-xs transition-colors"
            >
              {t.submitReview}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
