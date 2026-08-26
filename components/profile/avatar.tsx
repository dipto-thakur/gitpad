// file: components/profile/avatar.tsx
'use client';

export function Avatar({
  image,
  login,
  className,
  textClassName,
}: {
  image?: string | null;
  login: string;
  className?: string;
  textClassName?: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className={`${className ?? ''} rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10`}
      />
    );
  }
  return (
    <span
      className={`${className ?? ''} flex items-center justify-center rounded-full bg-zinc-100 font-medium text-muted-foreground bg-muted dark:text-muted-foreground ${textClassName ?? ''}`}
    >
      {login.slice(0, 2).toUpperCase()}
    </span>
  );
}