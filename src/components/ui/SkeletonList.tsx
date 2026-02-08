import { Skeleton } from "@/components/ui/Skeleton"

export function SkeletonList() {
   return (
      <div className="p-4 max-w-3xl mx-auto">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-11 w-48 rounded-full ml-auto" />
         </div>

         <Skeleton className="h-7 w-32 mb-4" />

         <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
               <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 dark:border-gray-700 p-4 shadow-sm"
               >
                  <div className="space-y-2">
                     <Skeleton className="h-5 w-40 sm:w-60" />
                     <Skeleton className="h-4 w-24" />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                     <Skeleton className="h-5 w-20" />
                     <Skeleton className="h-4 w-16" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}