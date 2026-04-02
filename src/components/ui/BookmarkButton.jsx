import { FiBookmark } from 'react-icons/fi';
import { useBookmarks } from '../../hooks';
import { cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function BookmarkButton({ article, className }) {
  const { toggle, isBookmarked } = useBookmarks();
  const saved = isBookmarked(article.$id);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggle(article);
    toast.success(saved ? 'Bookmark removed' : '🔖 Article bookmarked!');
  }

  return (
    <button
      onClick={handleClick}
      title={saved ? 'Remove bookmark' : 'Bookmark this article'}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark article'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-all',
        saved
          ? 'bg-accent text-white border-accent'
          : 'bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:border-accent hover:text-accent',
        className
      )}
    >
      <FiBookmark size={13} className={saved ? 'fill-current' : ''} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
