import Link from 'next/link';
import type { NoteTag } from '@/types/note';
import css from './SidebarNotes.module.css';

const tags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

export default function SidebarNotes() {
  return (
    <nav aria-label="Filter notes">
      <ul className={css.menuList}>
        <li className={css.menuItem}>
          <Link className={css.menuLink} href="/notes/filter/all">
            All notes
          </Link>
        </li>
        {tags.map((tag: NoteTag) => (
          <li className={css.menuItem} key={tag}>
            <Link className={css.menuLink} href={`/notes/filter/${tag}`}>
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
