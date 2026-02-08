interface Props {
   className?: string
}

export function Skeleton({ className = '' }: Props) {
   return (
      <div
         className={`
            relative overflow-hidden rounded-md bg-muted
            before:content-['']
            before:absolute
            before:inset-y-0
            before:left-0
            before:w-1/3
            before:-translate-x-full
            before:animate-shimmer
            before:bg-gradient-to-r
            before:from-transparent
            before:via-foreground/5
            before:to-transparent
            ${className}
         `}
      />
   )
}