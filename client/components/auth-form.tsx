'use client'

import { authSchema } from "@/lib/validations/auth"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { Label } from "./ui/label"
import { Icons } from "./icons"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement>{}

type FormData = z.infer<typeof authSchema>

export function AuthForm({ className, ...props }: AuthFormProps) {
   const [isLoading, setIsLoading] = useState<boolean>(false)

   const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(authSchema)
   })

   async function onSubmit(data: FormData) {

   }

   return (
      <div className={cn('grid gap-6', className)} {...props}>
         <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
               {/* USERNAME */}
              <div className="grid gap-1.5">
                <Label htmlFor="username" className="font-semibold">Username</Label>
              <Input id="username" placeholder="Username" type="text" autoCapitalize="none" autoComplete="text" autoCorrect="off" disabled={isLoading} {...register("username")}/>
              {errors?.username && (
               <p className="px-1 text-xs text-red-600">
                  {errors?.username?.message}
               </p>
              )}
              </div>
              {/* PASSWORD */}
              <div className="grid gap-1.5">
                <Label htmlFor="password" className="font-semibold">Password</Label>
              <Input id="password" placeholder="Password" type="password" autoCapitalize="none" autoCorrect="off" disabled={isLoading} {...register("password")}/>
              {errors?.username && (
               <p className="px-1 text-xs text-red-600">
                  {errors?.password?.message}
               </p>
              )}
              </div>
              <button className={cn('mt-2', buttonVariants({ variant: 'default', size: 'default'}))} disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin"></Icons.spinner>}
                  Sign In
              </button>
            </div>
         </form>
      </div>
   )
}